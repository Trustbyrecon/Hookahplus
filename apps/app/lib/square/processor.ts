import crypto from 'crypto';
import { Prisma, SessionSource, SessionState } from '@prisma/client';
import { prisma } from '../db';
import { getHIDSalt } from '../env';
import { callOpenAIJson } from '../ai/openai-json';
import { z } from 'zod';
import { resolveHID } from '../hid/resolver';
import { validateStaffNote } from '../staff-note-validation';
import { syncSessionToNetwork } from '../profiles/network';
import { awardLoyaltyPoints } from '../../core/handlePaymentCompleted';
import { log } from '../logger-pino';

/** Hookah-only Contract v1: prefix for Square line items that count as hookah GMV. */
const HOOKAH_ITEM_NAME_PREFIX = (process.env.HOOKAH_ITEM_NAME_PREFIX ?? 'H+ ').trimEnd() || 'H+ ';

function getHookahAmountCentsFromLineItems(lineItems: unknown): number {
  const items = Array.isArray(lineItems) ? lineItems : [];
  let total = 0;
  for (const li of items) {
    const name = (li && typeof li === 'object' && ('name' in li) ? (li as any).name : null) ?? '';
    const variationName = (li && typeof li === 'object' && ('variation_name' in li) ? (li as any).variation_name : null) ?? '';
    const displayName = String(name || variationName || '').trim();
    if (displayName.startsWith(HOOKAH_ITEM_NAME_PREFIX)) {
      const amount = (li && typeof li === 'object' && 'total_money' in li && (li as any).total_money?.amount != null)
        ? Number((li as any).total_money.amount)
        : 0;
      total += Math.round(amount);
    }
  }
  return total;
}

type SquareEnvelope = {
  merchant_id?: string;
  type?: string;
  event_id?: string;
  data?: {
    id?: string;
    type?: string;
    object?: any;
  };
};

const hashPII = (value?: string | null) => {
  if (!value) return null;
  return crypto.createHash('sha256').update(value.trim() + getHIDSalt()).digest('hex');
};

const extractObjects = (evt: SquareEnvelope) => {
  const obj = evt?.data?.object || {};
  const payment = obj?.payment || obj?.payment_updated?.payment || obj?.payment_created?.payment;
  const order = obj?.order || obj?.order_updated?.order || obj?.order_created?.order;
  const customer = obj?.customer || obj?.customer_updated?.customer || obj?.customer_created?.customer;
  return { payment, order, customer };
};

const findSquareLoungeContext = async (
  merchantId: string | null,
  locationId: string | null
) => {
  if (!merchantId && !locationId) return null;
  return prisma.squareMerchant.findFirst({
    where: {
      OR: [
        merchantId ? { merchantId } : undefined,
        locationId ? { locationIds: { has: locationId } } : undefined,
      ].filter(Boolean) as any,
    },
    select: {
      loungeId: true,
      tenantId: true,
      merchantId: true,
      locationIds: true,
    },
  });
};

const resolveSquareCustomerIdentity = async (customerId?: string | null) => {
  if (!customerId) return { phone: null, email: null, hid: null };
  const record = await prisma.squareCustomer.findUnique({
    where: { customerId },
  });
  const raw = record?.raw as any;
  const phone = raw?.phone_number || null;
  const email = raw?.email_address || null;
  let hid: string | null = null;

  if (phone || email) {
    try {
      const result = await resolveHID({
        phone: phone || undefined,
        email: email || undefined,
      });
      hid = result.hid || null;
    } catch (error) {
      console.error('[Square Processor] HID resolve failed:', error);
    }
  }

  return { phone, email, hid };
};

const findOrCreateSessionForPayment = async (params: {
  loungeId: string;
  tenantId?: string | null;
  amountCents: number;
  referenceId?: string | null;
  paymentId: string;
  orderId?: string | null;
  customerPhone?: string | null;
}) => {
  const { loungeId, tenantId, amountCents, referenceId, paymentId, orderId, customerPhone } = params;

  const existingByRef = await prisma.session.findFirst({
    where: {
      loungeId,
      externalRef: referenceId || orderId || paymentId,
    },
    orderBy: { createdAt: 'desc' },
  });
  if (existingByRef) return existingByRef;

  const recentSession = await prisma.session.findFirst({
    where: {
      loungeId,
      state: { in: [SessionState.PENDING, SessionState.ACTIVE, SessionState.PAUSED] },
      createdAt: {
        gte: new Date(Date.now() - 6 * 60 * 60 * 1000),
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  if (recentSession) return recentSession;

  const trustSignature = crypto
    .createHash('sha256')
    .update(
      JSON.stringify({
        loungeId,
        source: 'square',
        paymentId,
        orderId,
        referenceId,
      })
    )
    .digest('hex');

  return prisma.session.create({
    data: {
      externalRef: referenceId || orderId || paymentId,
      source: SessionSource.WALK_IN,
      state: SessionState.PENDING,
      trustSignature,
      loungeId,
      priceCents: amountCents,
      paymentStatus: 'succeeded',
      customerPhone: customerPhone || null,
      tenantId: tenantId || null,
    },
  });
};

type PricingAnomalyOutput = {
  enrichment_complete: boolean;
  confidence: number;
  amount_cents: number | null;
  order_total_cents: number | null;
  baseline: {
    sample_n: number;
    p05: number | null;
    p50: number | null;
    p95: number | null;
  };
  anomaly_score: number; // 0..1
  anomaly_reasons: string[];
  recommended_action: 'continue' | 'alert' | 'repair';
};

const SessionNoteSuggestionsSchema = z.object({
  enrichment_complete: z.boolean(),
  confidence: z.number().min(0).max(1),
  suggestions: z.array(z.string()).max(5),
  missing_data: z.array(z.string()).default([]),
});

type SessionNoteSuggestionsOutput = z.infer<typeof SessionNoteSuggestionsSchema>;

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function quantile(sorted: number[], q: number): number | null {
  if (!sorted.length) return null;
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  const baseVal = sorted[base]!;
  const nextVal = sorted[Math.min(base + 1, sorted.length - 1)]!;
  return baseVal + rest * (nextVal - baseVal);
}

async function getLoungePriceBaselineCents(loungeId: string) {
  // Cheap baseline: last 200 paid sessions, last 30 days.
  const rows = await prisma.session.findMany({
    where: {
      loungeId,
      paymentStatus: 'succeeded',
      priceCents: { not: null },
      createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    },
    select: { priceCents: true },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
  const vals = rows.map(r => r.priceCents!).filter((n): n is number => typeof n === 'number');
  vals.sort((a, b) => a - b);
  return {
    sampleN: vals.length,
    p05: quantile(vals, 0.05),
    p50: quantile(vals, 0.5),
    p95: quantile(vals, 0.95),
  };
}

async function upsertAiEnrichment(params: {
  rawEventId: string;
  loungeId?: string | null;
  sessionId?: string | null;
  kind: string;
  model: string;
  output: any;
  latencyMs?: number | null;
}) {
  return prisma.aiEnrichment.upsert({
    where: {
      rawEventId_kind: {
        rawEventId: params.rawEventId,
        kind: params.kind,
      },
    },
    create: {
      rawEventId: params.rawEventId,
      loungeId: params.loungeId || null,
      sessionId: params.sessionId || null,
      kind: params.kind,
      model: params.model,
      output: params.output,
      latencyMs: params.latencyMs ?? null,
      source: 'square',
    },
    update: {
      loungeId: params.loungeId || null,
      sessionId: params.sessionId || null,
      model: params.model,
      output: params.output,
      latencyMs: params.latencyMs ?? null,
    },
  });
}

async function createAlert(params: {
  rawEventId: string;
  loungeId?: string | null;
  sessionId?: string | null;
  type: string;
  severity: 'low' | 'med' | 'high';
  message: string;
  meta?: any;
}) {
  return prisma.alert.create({
    data: {
      rawEventId: params.rawEventId,
      loungeId: params.loungeId || null,
      sessionId: params.sessionId || null,
      type: params.type,
      severity: params.severity,
      message: params.message,
      meta: params.meta ?? null,
      source: 'square',
    },
  });
}

async function claimSquareRawEvents(limit: number) {
  const ids = await prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<{ id: string }[]>(
      Prisma.sql`
        WITH cte AS (
          SELECT id
          FROM public.square_events_raw
          WHERE processed_at IS NULL
            AND (
              status = 'new'
              OR (
                status = 'failed'
                AND (next_retry_at IS NULL OR next_retry_at <= NOW())
              )
            )
          ORDER BY received_at ASC
          LIMIT ${limit}
          FOR UPDATE SKIP LOCKED
        )
        UPDATE public.square_events_raw se
        SET status = 'processing',
            claimed_at = NOW()
        FROM cte
        WHERE se.id = cte.id
        RETURNING se.id;
      `
    );
    return rows.map(r => r.id);
  });

  if (!ids.length) return [];
  return prisma.squareEventRaw.findMany({
    where: { id: { in: ids } },
    orderBy: { receivedAt: 'asc' },
  });
}

function nextRetryDelayMs(attemptCount: number) {
  // Exponential-ish backoff with cap: 1m, 5m, 15m, 60m
  if (attemptCount <= 1) return 60_000;
  if (attemptCount === 2) return 5 * 60_000;
  if (attemptCount === 3) return 15 * 60_000;
  return 60 * 60_000;
}

export async function processSquareRawEvents(limit: number = 100) {
  const rawEvents = await claimSquareRawEvents(limit);

  let processed = 0;
  let failed = 0;

  for (const raw of rawEvents) {
    try {
      const payload = raw.payload as SquareEnvelope;
      const { payment, order, customer } = extractObjects(payload);
      const merchantId = raw.merchantId || payload?.merchant_id || null;
      const locationId =
        raw.locationId ||
        payment?.location_id ||
        order?.location_id ||
        null;

      if (order?.id) {
        const totalCents = order?.total_money?.amount ?? null;
        await prisma.squareOrder.upsert({
          where: { orderId: order.id },
          create: {
            orderId: order.id,
            merchantId,
            locationId,
            status: order?.state || null,
            totalCents,
            currency: order?.total_money?.currency || null,
            lineItems: order?.line_items || null,
            raw: order,
          },
          update: {
            merchantId,
            locationId,
            status: order?.state || null,
            totalCents,
            currency: order?.total_money?.currency || null,
            lineItems: order?.line_items || null,
            raw: order,
          },
        });
      }

      if (payment?.id) {
        const amountCents = payment?.amount_money?.amount ?? null;
        const cardBrand = payment?.card_details?.card?.card_brand || null;
        const cardLast4 = payment?.card_details?.card?.last_4 || null;
        const paymentStatus = payment?.status || null;
        const paymentOrderId = payment?.order_id || null;
        await prisma.squarePayment.upsert({
          where: { paymentId: payment.id },
          create: {
            paymentId: payment.id,
            orderId: paymentOrderId,
            merchantId,
            locationId,
            status: paymentStatus,
            amountCents,
            currency: payment?.amount_money?.currency || null,
            cardBrand,
            cardLast4,
            raw: payment,
          },
          update: {
            orderId: paymentOrderId,
            merchantId,
            locationId,
            status: paymentStatus,
            amountCents,
            currency: payment?.amount_money?.currency || null,
            cardBrand,
            cardLast4,
            raw: payment,
          },
        });

        if (paymentStatus === 'COMPLETED') {
          const loungeContext = await findSquareLoungeContext(merchantId, locationId);
          if (!loungeContext?.loungeId) {
            // Still consider Flow 2 "successful" if we can normalize the payment but
            // we don't yet have a merchant/location → lounge mapping (OAuth not connected).
            // This prevents permanently marking payment events as failed during early setup.
            console.warn('[Square Processor] Missing lounge mapping for Square payment', {
              merchantId,
              locationId,
              paymentId: payment.id,
            });
          }

          if (loungeContext?.loungeId) {
            const customerId = payment?.customer_id || null;
            const identity = await resolveSquareCustomerIdentity(customerId);
            const referenceId = payment?.reference_id || order?.reference_id || null;
            // Hookah-only Contract v1: GMV from prefix-matched line items only
            const hookahAmountCents = getHookahAmountCentsFromLineItems(order?.line_items ?? []);

            let session: Awaited<ReturnType<typeof findOrCreateSessionForPayment>>;
            if (hookahAmountCents > 0) {
              session = await findOrCreateSessionForPayment({
                loungeId: loungeContext.loungeId,
                tenantId: loungeContext.tenantId,
                amountCents: hookahAmountCents,
                referenceId,
                paymentId: payment.id,
                orderId: paymentOrderId,
                customerPhone: identity.phone,
              });
              await prisma.session.update({
                where: { id: session.id },
                data: {
                  paymentStatus: 'succeeded',
                  priceCents: hookahAmountCents,
                  externalRef: referenceId || paymentOrderId || payment.id,
                },
              });
            } else {
              // No hookah-eligible line items (Hookah-only Contract v1): attach to existing by reference only; do not create for GMV
              const existingByRef = referenceId || paymentOrderId || payment.id
                ? await prisma.session.findFirst({
                    where: {
                      loungeId: loungeContext.loungeId,
                      externalRef: referenceId || paymentOrderId || payment.id,
                    },
                    orderBy: { createdAt: 'desc' },
                  })
                : null;
              if (existingByRef) {
                session = existingByRef;
                await prisma.session.update({
                  where: { id: session.id },
                  data: {
                    paymentStatus: 'succeeded',
                    externalRef: referenceId || paymentOrderId || payment.id,
                  },
                });
              } else {
                // No hookah GMV and no existing session: skip session create (do not count toward GMV)
                log.info('square.hookah_gmv_skip', {
                  component: 'square',
                  action: 'payment_completed',
                  paymentId: payment.id,
                  loungeId: loungeContext.loungeId,
                  reason: 'hookah_amount_cents_zero_no_existing_ref',
                });
                session = null as any;
              }
            }

            if (session) {
            // ---------------------------
            // AI Enrich #1: pricing anomaly
            // ---------------------------
            try {
              const baseline = await getLoungePriceBaselineCents(loungeContext.loungeId);
              const orderTotalCents: number | null = order?.total_money?.amount ?? null;

              const reasons: string[] = [];
              let score = 0;

              if (amountCents == null) {
                reasons.push('missing_payment_amount');
              } else {
                if (amountCents <= 0) {
                  reasons.push('non_positive_amount');
                  score = Math.max(score, 1);
                }

                if (orderTotalCents != null) {
                  const absDiff = Math.abs(orderTotalCents - amountCents);
                  const tol = Math.max(100, Math.floor(amountCents * 0.05));
                  if (absDiff > tol) {
                    reasons.push(`order_total_mismatch(diff=${absDiff},tol=${tol})`);
                    score = Math.max(score, 0.8);
                  }
                }

                if (baseline.sampleN >= 20 && baseline.p05 != null && baseline.p95 != null) {
                  const low = Math.floor(baseline.p05 * 0.8);
                  const high = Math.ceil(baseline.p95 * 1.2);
                  if (amountCents < low || amountCents > high) {
                    reasons.push(`outside_lounge_baseline_range(${low}-${high})`);
                    score = Math.max(score, 0.75);
                  }
                  if (baseline.p95 && amountCents > baseline.p95 * 2) {
                    reasons.push('extreme_high_vs_p95');
                    score = Math.max(score, 0.95);
                  }
                } else if (amountCents > 50_000) {
                  reasons.push('extreme_high_amount_fallback');
                  score = Math.max(score, 0.9);
                }
              }

              const anomalyScore = clamp01(score);
              const confidence =
                baseline.sampleN >= 50 ? 0.9 : baseline.sampleN >= 20 ? 0.75 : 0.55;

              const pricingOutput: PricingAnomalyOutput = {
                enrichment_complete: amountCents != null,
                confidence,
                amount_cents: amountCents,
                order_total_cents: orderTotalCents,
                baseline: {
                  sample_n: baseline.sampleN,
                  p05: baseline.p05,
                  p50: baseline.p50,
                  p95: baseline.p95,
                },
                anomaly_score: anomalyScore,
                anomaly_reasons: reasons,
                recommended_action: anomalyScore >= 0.75 ? 'alert' : 'continue',
              };

              await upsertAiEnrichment({
                rawEventId: raw.id,
                loungeId: loungeContext.loungeId,
                sessionId: session.id,
                kind: 'pricing_anomaly',
                model: 'heuristics',
                output: pricingOutput,
              });

              if (anomalyScore >= 0.75) {
                const severity: 'low' | 'med' | 'high' =
                  anomalyScore >= 0.85 ? 'high' : anomalyScore >= 0.75 ? 'med' : 'low';
                await createAlert({
                  rawEventId: raw.id,
                  loungeId: loungeContext.loungeId,
                  sessionId: session.id,
                  type: 'pricing_anomaly',
                  severity,
                  message: `Square payment amount ${amountCents ?? 'null'} flagged (score=${anomalyScore})`,
                  meta: {
                    paymentId: payment.id,
                    orderId: paymentOrderId,
                    reasons,
                    baseline: pricingOutput.baseline,
                  },
                });
              }
            } catch (e: any) {
              log.warn('square.pricing_anomaly.enrichment_failed', { component: 'square', action: 'pricing_anomaly', rawEventId: raw.id }, e);
              await upsertAiEnrichment({
                rawEventId: raw.id,
                loungeId: loungeContext.loungeId,
                sessionId: session.id,
                kind: 'pricing_anomaly',
                model: 'heuristics',
                output: {
                  enrichment_complete: false,
                  confidence: 0,
                  amount_cents: amountCents ?? null,
                  order_total_cents: order?.total_money?.amount ?? null,
                  baseline: { sample_n: 0, p05: null, p50: null, p95: null },
                  anomaly_score: 0,
                  anomaly_reasons: ['enrichment_failed'],
                  recommended_action: 'continue',
                } satisfies PricingAnomalyOutput,
              });
            }

            if (identity.hid) {
              await prisma.session.update({
                where: { id: session.id },
                data: { hid: identity.hid },
              });
              try {
                await syncSessionToNetwork(
                  session.id,
                  identity.hid,
                  loungeContext.loungeId,
                  order?.line_items || undefined,
                  amountCents || undefined,
                  paymentOrderId || payment.id
                );
              } catch (error) {
                console.error('[Square Processor] Failed to sync session to network:', error);
              }
            }

            if (identity.phone) {
              try {
                await awardLoyaltyPoints({
                  customerPhone: identity.phone,
                  loungeId: loungeContext.loungeId,
                  sessionId: session.id,
                  amountCents: amountCents || session.priceCents || 0,
                  tenantId: loungeContext.tenantId || null,
                });
              } catch (error) {
                console.error('[Square Processor] Failed to award loyalty points:', error);
              }
            }

            // --------------------------------------
            // AI Enrich #2: session-note suggestions
            // --------------------------------------
            try {
              const existingSuggestion = await prisma.sessionNote.findFirst({
                where: {
                  sessionId: session.id,
                  noteType: 'AI_SUGGESTION',
                  createdBy: 'system',
                  createdAt: { gte: new Date(Date.now() - 6 * 60 * 60 * 1000) },
                },
                select: { id: true },
              });

              if (!existingSuggestion) {
                const items = Array.isArray(order?.line_items) ? order.line_items : [];
                const compactItems = items.slice(0, 12).map((li: any) => ({
                  name: li?.name || li?.catalog_object_id || 'item',
                  quantity: li?.quantity || 1,
                  total_money: li?.total_money?.amount ?? null,
                }));

                const system = [
                  'You generate short staff-facing session note suggestions for a hookah lounge operator dashboard.',
                  'Rules:',
                  '- Output ONLY JSON (no markdown, no prose).',
                  '- Never include phone numbers, emails, names, or other PII.',
                  '- Keep each suggestion <= 120 chars.',
                  '- Focus on useful operator memory: preferences, upsell cues, anomalies, service tips.',
                ].join('\n');

                const user = JSON.stringify(
                  {
                    lounge_id: loungeContext.loungeId,
                    session_id: session.id,
                    payment_amount_cents: amountCents,
                    square_payment_id: payment.id,
                    square_order_id: paymentOrderId,
                    line_items: compactItems,
                  },
                  null,
                  2
                );

                const resp = await callOpenAIJson<SessionNoteSuggestionsOutput>({
                  system,
                  user,
                  schema: SessionNoteSuggestionsSchema,
                  timeoutMs: 10_000,
                });

                if (resp.ok) {
                  const cleaned = (resp.data.suggestions || [])
                    .map((s: any) => (typeof s === 'string' ? s.trim() : ''))
                    .filter(Boolean)
                    .slice(0, 3);

                  const safeSuggestions: string[] = [];
                  for (const s of cleaned) {
                    const vr = validateStaffNote(s);
                    if (vr.ok) safeSuggestions.push(s);
                  }

                  const out: SessionNoteSuggestionsOutput = {
                    enrichment_complete: true,
                    confidence: clamp01(resp.data.confidence),
                    suggestions: safeSuggestions,
                    missing_data: resp.data.missing_data || [],
                  };

                  await upsertAiEnrichment({
                    rawEventId: raw.id,
                    loungeId: loungeContext.loungeId,
                    sessionId: session.id,
                    kind: 'session_note_suggestions',
                    model: resp.model,
                    output: out,
                    latencyMs: resp.latencyMs,
                  });

                  if (safeSuggestions.length) {
                    await prisma.sessionNote.createMany({
                      data: safeSuggestions.map(text => ({
                        sessionId: session.id,
                        noteType: 'AI_SUGGESTION',
                        text,
                        createdBy: 'system',
                        shareScope: 'lounge',
                      })),
                    });
                  }
                } else {
                  await upsertAiEnrichment({
                    rawEventId: raw.id,
                    loungeId: loungeContext.loungeId,
                    sessionId: session.id,
                    kind: 'session_note_suggestions',
                    model: resp.model,
                    output: {
                      enrichment_complete: false,
                      confidence: 0,
                      suggestions: [],
                      missing_data: ['openai_failed'],
                      error: resp.error,
                    },
                    latencyMs: resp.latencyMs,
                  });
                }
              }
            } catch (e: any) {
              log.warn('square.session_note_suggestions.enrichment_failed', { component: 'square', action: 'session_note_suggestions', rawEventId: raw.id }, e);
              await upsertAiEnrichment({
                rawEventId: raw.id,
                loungeId: loungeContext.loungeId,
                sessionId: session.id,
                kind: 'session_note_suggestions',
                model: 'unknown',
                output: {
                  enrichment_complete: false,
                  confidence: 0,
                  suggestions: [],
                  missing_data: ['exception'],
                },
              });
            }

            await prisma.posTicket.upsert({
              where: { ticketId: paymentOrderId || payment.id },
              create: {
                ticketId: paymentOrderId || payment.id,
                sessionId: session.id,
                amountCents: amountCents || 0,
                status: 'paid',
                posSystem: 'square',
                items: JSON.stringify(order?.line_items || []),
              },
              update: {
                sessionId: session.id,
                amountCents: amountCents || 0,
                status: 'paid',
                items: JSON.stringify(order?.line_items || []),
              },
            });
            }
          }
        }
      }

      if (customer?.id) {
        const phoneHash = hashPII(customer?.phone_number);
        const emailHash = hashPII(customer?.email_address);
        await prisma.squareCustomer.upsert({
          where: { customerId: customer.id },
          create: {
            customerId: customer.id,
            merchantId,
            locationId,
            phoneHash,
            emailHash,
            raw: customer,
          },
          update: {
            merchantId,
            locationId,
            phoneHash,
            emailHash,
            raw: customer,
          },
        });
      }

      await prisma.squareEventRaw.update({
        where: { id: raw.id },
        data: {
          processedAt: new Date(),
          status: 'processed',
          claimedAt: null,
          nextRetryAt: null,
          attemptCount: raw.attemptCount ?? 0,
          errorMessage: null,
          lastErrorAt: null,
        },
      });
      processed += 1;
    } catch (error: any) {
      failed += 1;
      const nextAttempt = (raw.attemptCount ?? 0) + 1;
      const delayMs = nextRetryDelayMs(nextAttempt);
      await prisma.squareEventRaw.update({
        where: { id: raw.id },
        data: {
          // Keep processedAt NULL so this is retryable.
          processedAt: null,
          status: 'failed',
          claimedAt: null,
          attemptCount: nextAttempt,
          lastErrorAt: new Date(),
          nextRetryAt: new Date(Date.now() + delayMs),
          errorMessage: error?.message || 'square processor error',
        },
      });
    }
  }

  return { processed, failed };
}

