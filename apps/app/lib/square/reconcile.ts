import { prisma } from "../db";
import { SquareAdapter } from "../pos/square";
import { log } from "../logger-pino";
import { sendSlackOpsWebhook, type SlackSeverity } from "../ops/slack-webhook";

function extractSessionIdFromReferenceId(referenceId: unknown): string | null {
  const ref = typeof referenceId === "string" ? referenceId : "";
  const m = /^hp_ord_(.+)$/.exec(ref);
  return m?.[1] || null;
}

function moneyToAmountCents(totalMoney: any): { amountCents: number | null; currency: string | null } {
  const amount =
    typeof totalMoney?.amount === "number" ? totalMoney.amount : totalMoney?.amount != null ? Number(totalMoney.amount) : null;
  const currency = typeof totalMoney?.currency === "string" ? totalMoney.currency : null;
  return {
    amountCents: Number.isFinite(amount as number) ? (amount as number) : null,
    currency,
  };
}

function clampNumber(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function coerceSeverity(params: { requested: SlackSeverity; sandboxWarningOnly: boolean }): SlackSeverity {
  if (!params.sandboxWarningOnly) return params.requested;
  // Sandbox: warning only (never critical/info).
  return "warning";
}

export type SquareReconActionIntentType =
  | "recon.square.unassigned_ticket"
  | "recon.square.reconciliation_drop"
  | "recon.square.payment_mismatch"
  | "recon.square.refund_mismatch";

export async function reconcileAndHealSquare(params: {
  loungeId: string;
  sinceMinutes?: number;
  limit?: number;
  graceWindowMinutes?: number;
  cadenceMinutes?: number;
  suppressionWindowMinutes?: number;
  unassignedTicketAlertAfterRuns?: number;
  reconcileDeltaAlertMin?: number;
  reconcileDeltaPctAlertMin?: number;
  widenWindowMinutes?: number;
}) {
  const loungeId = params.loungeId;
  const sinceMinutes = clampNumber(params.sinceMinutes ?? 120, 5, 60 * 24 * 14);
  const limit = clampNumber(params.limit ?? 50, 1, 200);
  const graceWindowMinutes = clampNumber(params.graceWindowMinutes ?? 10, 0, 24 * 60);
  const cadenceMinutes = clampNumber(params.cadenceMinutes ?? 15, 1, 24 * 60);
  const suppressionWindowMinutes = clampNumber(params.suppressionWindowMinutes ?? 60, 0, 24 * 60);
  const unassignedTicketAlertAfterRuns = clampNumber(params.unassignedTicketAlertAfterRuns ?? 2, 1, 10);
  const reconcileDeltaAlertMin = clampNumber(params.reconcileDeltaAlertMin ?? 2, 0, 1_000_000);
  const reconcileDeltaPctAlertMin = clampNumber(params.reconcileDeltaPctAlertMin ?? 1, 0, 100);
  const widenWindowMinutes = clampNumber(params.widenWindowMinutes ?? 30, 0, 24 * 60);

  const runId = `sqrecon_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  const now = new Date();
  const graceCutoff = new Date(Date.now() - graceWindowMinutes * 60 * 1000);
  const sandboxWarningOnly = (process.env.SQUARE_ENV || "").toLowerCase() === "sandbox";

  const merchantMeta =
    (prisma as any)?.squareMerchant?.findUnique
      ? await (prisma as any).squareMerchant.findUnique({
          where: { loungeId },
          select: { tenantId: true, locationIds: true },
        })
      : null;
  const tenantId: string | null = merchantMeta?.tenantId ?? null;
  const primaryLocationId: string | null = Array.isArray(merchantMeta?.locationIds) ? merchantMeta.locationIds[0] ?? null : null;

  // Cursor-based window: reconcile is lossless over time.
  const existingCursor =
    (prisma as any)?.squareReconCursor?.findUnique
      ? await (prisma as any).squareReconCursor.findUnique({ where: { loungeId } })
      : null;
  const defaultFrom = new Date(now.getTime() - sinceMinutes * 60 * 1000);
  const windowFrom = existingCursor?.cursorFrom instanceof Date ? existingCursor.cursorFrom : defaultFrom;
  const windowTo = now;

  // 1) Pull orders for [windowFrom..windowTo] (fallback truth source) and upsert into pos_tickets
  const adapter = new SquareAdapter({ venueId: loungeId });
  await adapter.initialize();
  const dbg = (adapter as any)?.debugState?.();
  if (dbg?.authMode !== "oauth") {
    throw new Error(
      `Square OAuth required for reconcile/heal (loungeId=${loungeId}). Adapter initialized in ${dbg?.authMode || "unknown"} mode`
    );
  }

  async function pullOrdersWindow(from: Date, to: Date) {
    const out: any[] = [];
    let cursor: string | null = null;
    let pages = 0;
    const maxPages = 15;

    while (out.length < limit && pages < maxPages) {
      const pageLimit = Math.min(200, limit - out.length);
      const fn = (adapter as any).searchOrdersWindow as
        | ((opts: { from: Date; to?: Date; limit?: number; cursor?: string | null }) => Promise<{ orders: any[]; cursor: string | null }>)
        | undefined;

      if (!fn) {
        // Fallback to best-effort legacy method (non-paginated).
        const legacy = await (adapter as any).searchOrdersSince?.({ since: from, limit });
        return { orders: Array.isArray(legacy) ? legacy : [], pages: 1, usedCursor: false };
      }

      const page = await fn.call(adapter, { from, to, limit: pageLimit, cursor });
      const orders = Array.isArray(page?.orders) ? page.orders : [];
      out.push(...orders);
      cursor = typeof page?.cursor === "string" ? page.cursor : null;
      pages += 1;
      if (!cursor) break;
      if (orders.length === 0) break;
    }

    return { orders: out, pages, usedCursor: true };
  }

  async function ingestAndHeal(from: Date, to: Date, opts?: { replay?: boolean }) {
    const pull = await pullOrdersWindow(from, to);
    const orders = pull.orders;

    let ticketsUpserted = 0;
    let ticketsLinkedByReference = 0;
    const ticketIds: string[] = [];
    const orderLocationIds: string[] = [];

    for (const order of orders) {
      const ticketId = typeof order?.id === "string" ? order.id : null;
      if (!ticketId) continue;

      const sessionId = extractSessionIdFromReferenceId(order?.reference_id);
      const { amountCents, currency } = moneyToAmountCents(order?.total_money);
      const status = typeof order?.state === "string" ? order.state.toLowerCase() : "unknown";
      const items = order?.line_items ? JSON.stringify(order.line_items).slice(0, 10000) : null;

      const locationId = typeof order?.location_id === "string" ? order.location_id : null;
      if (locationId) orderLocationIds.push(locationId);

      await prisma.posTicket.upsert({
        where: { ticketId },
        create: {
          ticketId,
          sessionId,
          amountCents,
          currency,
          status,
          posSystem: "square",
          items,
        },
        update: {
          sessionId,
          amountCents,
          currency,
          status,
          posSystem: "square",
          items,
        },
      });

      ticketsUpserted += 1;
      if (sessionId) ticketsLinkedByReference += 1;
      ticketIds.push(ticketId);
    }

    // Auto-heal: attach tickets to sessions by deterministic externalRef match (orderId)
    let ticketsLinkedByExternalRef = 0;
    let healEventsWritten = 0;
    if (ticketIds.length > 0) {
      const sessions = await prisma.session.findMany({
        where: { loungeId, externalRef: { in: ticketIds } },
        select: { id: true, externalRef: true },
        take: 5000,
      });
      const sessionIdByExternalRef = new Map<string, string>();
      for (const s of sessions) {
        if (s.externalRef) sessionIdByExternalRef.set(s.externalRef, s.id);
      }

      for (const ticketId of ticketIds) {
        const sessionId = sessionIdByExternalRef.get(ticketId);
        if (!sessionId) continue;

        const updated = await prisma.posTicket.updateMany({
          where: { ticketId, sessionId: null },
          data: { sessionId, status: "attached" },
        });
        if (updated.count > 0) {
          ticketsLinkedByExternalRef += updated.count;
          const idempotencyKey = `heal:attach_ticket:${sessionId}:${ticketId}`;
          try {
            await prisma.driftEvent.create({
              data: {
                drift_reason_v1: "heal.square.attach_ticket",
                action_type: "heal.square.attach_ticket",
                severity: "info",
                session_id: sessionId,
                lounge_id: loungeId,
                tenant_id: tenantId,
                location_id: primaryLocationId,
                window_from: from,
                window_to: to,
                counts_expected: 1,
                counts_observed: 1,
                counts_delta: 0,
                counts_delta_pct: 0,
                evidence: { sample_ids: [ticketId], reason: "externalRef_exact_match" } as any,
                risk_hints: ["deterministic_link"],
                idempotency_key: idempotencyKey,
                details: { replay: Boolean(opts?.replay), runId } as any,
              },
            });
            healEventsWritten += 1;
          } catch (e: any) {
            // Unique violation (already recorded) is ok.
            const code = e?.code || e?.meta?.code;
            if (code !== "P2002") throw e;
          }
        }
      }
    }

    const expected = orders.length;
    const observedLinked = ticketsLinkedByReference + ticketsLinkedByExternalRef;
    const delta = Math.max(0, expected - observedLinked);
    const deltaPct = expected > 0 ? (delta / expected) * 100 : 0;

    const locationId = dbg?.locationId || primaryLocationId || orderLocationIds[0] || null;

    return {
      pull,
      orders,
      ticketIds,
      ticketsUpserted,
      ticketsLinkedByReference,
      ticketsLinkedByExternalRef,
      healEventsWritten,
      reconciliation: { expected, observedLinked, delta, deltaPct },
      locationId: typeof locationId === "string" ? locationId : null,
    };
  }

  let ingest = await ingestAndHeal(windowFrom, windowTo);

  // Widen-window retry once before escalating (handles delayed webhooks, clock skew, brief outages).
  if (widenWindowMinutes > 0) {
    const widen = ingest.reconciliation.delta >= reconcileDeltaAlertMin || ingest.reconciliation.deltaPct >= reconcileDeltaPctAlertMin;
    if (widen) {
      const widenedFrom = new Date(windowFrom.getTime() - widenWindowMinutes * 60 * 1000);
      ingest = await ingestAndHeal(widenedFrom, windowTo, { replay: true });
    }
  }

  const ticketIds = ingest.ticketIds;

  // 3) Detect drift (anomalies)
  const unassignedTickets = await prisma.posTicket.findMany({
    where: {
      posSystem: "square",
      ticketId: { in: ticketIds.length ? ticketIds : ["__none__"] },
      sessionId: null,
      createdAt: graceWindowMinutes > 0 ? { lt: graceCutoff } : undefined,
    },
    select: { ticketId: true, status: true, amountCents: true, createdAt: true },
    take: 50,
    orderBy: { createdAt: "asc" },
  });

  const unassignedCount = unassignedTickets.length;

  // "Reconciliation drop": for this initial pass, treat "orders scanned - linked" as the most actionable anomaly.
  // This aligns with the POS Ops goal: keep unassigned tickets near zero.
  const expected = ingest.reconciliation.expected;
  const observedLinked = ingest.reconciliation.observedLinked;
  const delta = ingest.reconciliation.delta;
  const deltaPct = ingest.reconciliation.deltaPct;

  // "Payment mismatch": sessions that claim Square gateway but are not marked succeeded (last window).
  const paymentMismatchCount = await prisma.session.count({
    where: {
      loungeId,
      paymentGateway: "square",
      paymentStatus: { not: "succeeded" },
      updatedAt: { gte: windowFrom },
    },
  });

  const intents: Array<{
    action_type: SquareReconActionIntentType;
    severity: "info" | "warning" | "critical";
    details: Record<string, unknown>;
    evidence: { sample_ids?: string[]; reason?: string } | null;
    risk_hints: string[];
  }> = [];

  if (unassignedCount > 0) {
    intents.push({
      action_type: "recon.square.unassigned_ticket",
      severity: "warning",
      evidence: { sample_ids: unassignedTickets.map((t) => t.ticketId).slice(0, 10), reason: "unlinked_pos_ticket" },
      risk_hints: ["money_surface", "processor_truth"],
      details: {
        loungeId,
        runId,
        window: { from: windowFrom.toISOString(), to: windowTo.toISOString(), graceCutoff: graceCutoff.toISOString() },
        counts: { unassigned: unassignedCount },
      },
    });
  }

  if (delta >= reconcileDeltaAlertMin || deltaPct >= reconcileDeltaPctAlertMin) {
    intents.push({
      action_type: "recon.square.reconciliation_drop",
      severity: "critical",
      evidence: { sample_ids: ticketIds.slice(0, 10), reason: "orders_scanned_minus_linked" },
      risk_hints: ["money_surface", "processor_truth"],
      details: {
        loungeId,
        runId,
        window: { from: windowFrom.toISOString(), to: windowTo.toISOString() },
        counts: { expected, observedLinked, delta, deltaPct: Math.round(deltaPct * 100) / 100 },
      },
    });
  }

  if (paymentMismatchCount > 0) {
    intents.push({
      action_type: "recon.square.payment_mismatch",
      severity: "critical",
      evidence: { reason: "session.paymentGateway=square but paymentStatus!=succeeded" },
      risk_hints: ["money_surface", "identity_surface"],
      details: {
        loungeId,
        runId,
        window: { from: windowFrom.toISOString(), to: windowTo.toISOString() },
        counts: { sessions_with_mismatch: paymentMismatchCount },
      },
    });
  }

  // 4) Emit ActionIntents (record drift events). This is your “immune system queue” without expanding Recon API yet.
  for (const intent of intents) {
    const counts = intent.details?.counts as any;
    const countsExpected = typeof counts?.expected === "number" ? counts.expected : expected;
    const countsObserved = typeof counts?.observedLinked === "number" ? counts.observedLinked : observedLinked;
    const countsDelta = typeof counts?.delta === "number" ? counts.delta : delta;
    const countsDeltaPct = typeof counts?.deltaPct === "number" ? counts.deltaPct : Math.round(deltaPct * 100) / 100;
    await prisma.driftEvent.create({
      data: {
        drift_reason_v1: intent.action_type,
        action_type: intent.action_type,
        severity: intent.severity,
        details: intent.details as any,
        lounge_id: loungeId,
        tenant_id: tenantId,
        location_id: ingest.locationId,
        window_from: windowFrom,
        window_to: windowTo,
        counts_expected: countsExpected,
        counts_observed: countsObserved,
        counts_delta: countsDelta,
        counts_delta_pct: countsDeltaPct,
        evidence: intent.evidence as any,
        risk_hints: intent.risk_hints,
      },
    });
  }

  // 5) Slack alerts with tiers + suppression window + “2 consecutive runs” for unassigned tickets
  const slackResults: Array<{ type: string; severity: SlackSeverity; sent: boolean; suppressed?: boolean; error?: string }> = [];

  const suppressionCutoff = new Date(Date.now() - suppressionWindowMinutes * 60 * 1000);
  const consecutiveWindow = new Date(Date.now() - cadenceMinutes * unassignedTicketAlertAfterRuns * 60 * 1000 - 60_000);

  async function maybeSendAlert(params: {
    type: string;
    severity: SlackSeverity;
    title: string;
    text: string;
    fields: Record<string, any>;
  }) {
    const severity = coerceSeverity({ requested: params.severity, sandboxWarningOnly });

    // Suppress by time window (only suppress repeats of the same alert type for the same lounge)
    if (suppressionWindowMinutes > 0) {
      const recent = await prisma.alert.findFirst({
        where: {
          source: "square",
          type: params.type,
          loungeId,
          createdAt: { gte: suppressionCutoff },
        },
        select: { id: true },
      });
      if (recent) {
        slackResults.push({ type: params.type, severity, sent: false, suppressed: true });
        return;
      }
    }

    const res = await sendSlackOpsWebhook({
      severity,
      title: params.title,
      text: params.text,
      fields: params.fields,
    });

    await prisma.alert.create({
      data: {
        source: "square",
        type: params.type,
        severity,
        message: params.title,
        loungeId,
        meta: {
          runId,
          sent: res.sent,
          status: res.status ?? null,
          error: res.error ?? null,
          fields: params.fields,
        } as any,
      },
    });

    slackResults.push({ type: params.type, severity, sent: res.sent, error: res.error });
  }

  // Unassigned tickets: only alert after N consecutive runs.
  if (unassignedCount > 0 && unassignedTicketAlertAfterRuns > 1) {
    const recentRuns = await prisma.driftEvent.count({
      where: {
        drift_reason_v1: "recon.square.unassigned_ticket",
        created_at: { gte: consecutiveWindow },
      },
    });
    if (recentRuns >= unassignedTicketAlertAfterRuns) {
      await maybeSendAlert({
        type: "recon.square.unassigned_ticket",
        severity: "warning",
        title: `Square drift: unassigned tickets (${loungeId})`,
        text: `Unassigned POS tickets persisted beyond grace window (${graceWindowMinutes}m).`,
        fields: {
          loungeId,
          runId,
          unassigned: unassignedCount,
          grace_window_min: graceWindowMinutes,
          window_from: windowFrom.toISOString(),
          window_to: windowTo.toISOString(),
          sample_ticket_ids: unassignedTickets.map((t) => t.ticketId).slice(0, 10).join(", "),
        },
      });
    }
  } else if (unassignedCount > 0) {
    // If configured to alert immediately.
    await maybeSendAlert({
      type: "recon.square.unassigned_ticket",
      severity: "warning",
      title: `Square drift: unassigned tickets (${loungeId})`,
      text: `Unassigned POS tickets detected.`,
      fields: {
        loungeId,
        runId,
        unassigned: unassignedCount,
        grace_window_min: graceWindowMinutes,
        window_from: windowFrom.toISOString(),
        window_to: windowTo.toISOString(),
      },
    });
  }

  // Reconciliation drop / delta: alert immediately (money surface)
  if (delta >= reconcileDeltaAlertMin || deltaPct >= reconcileDeltaPctAlertMin) {
    await maybeSendAlert({
      type: "recon.square.reconciliation_drop",
      severity: "critical",
      title: `Square drift: reconciliation drop (${loungeId})`,
      text: `Orders scanned vs linked sessions diverged beyond thresholds.`,
      fields: {
        loungeId,
        runId,
        expected_orders: expected,
        observed_linked: observedLinked,
        delta,
        delta_pct: Math.round(deltaPct * 100) / 100,
        thresholds: `delta>=${reconcileDeltaAlertMin} or pct>=${reconcileDeltaPctAlertMin}%`,
        window_from: windowFrom.toISOString(),
        window_to: windowTo.toISOString(),
      },
    });
  }

  // Payment mismatch: alert immediately (money + policy surface)
  if (paymentMismatchCount > 0) {
    await maybeSendAlert({
      type: "recon.square.payment_mismatch",
      severity: "critical",
      title: `Square drift: payment mismatch (${loungeId})`,
      text: `Sessions marked as Square gateway but not succeeded.`,
      fields: {
        loungeId,
        runId,
        sessions_with_mismatch: paymentMismatchCount,
        window_from: windowFrom.toISOString(),
        window_to: windowTo.toISOString(),
      },
    });
  }

  // 6) Persist cursor for next run (small overlap for safety).
  const overlapMinutes = 2;
  const nextCursorFrom = new Date(windowTo.getTime() - overlapMinutes * 60 * 1000);
  if ((prisma as any)?.squareReconCursor?.upsert) {
    await (prisma as any).squareReconCursor.upsert({
      where: { loungeId },
      create: {
        loungeId,
        tenantId,
        locationId: ingest.locationId,
        cursorFrom: nextCursorFrom,
        lastWindowTo: windowTo,
        lastRunId: runId,
      },
      update: {
        tenantId,
        locationId: ingest.locationId,
        cursorFrom: nextCursorFrom,
        lastWindowTo: windowTo,
        lastRunId: runId,
      },
    });
  }

  log.info("square.reconcile.run_complete", {
    component: "square",
    action: "reconcile_and_heal",
    loungeId,
    runId,
    windowFrom: windowFrom.toISOString(),
    windowTo: windowTo.toISOString(),
    ordersScanned: ingest.orders.length,
    ticketsUpserted: ingest.ticketsUpserted,
    ticketsLinkedByReference: ingest.ticketsLinkedByReference,
    ticketsLinkedByExternalRef: ingest.ticketsLinkedByExternalRef,
    anomalies: { unassignedCount, delta, deltaPct, paymentMismatchCount },
    slack: slackResults,
  });

  return {
    runId,
    loungeId,
    window: { from: windowFrom.toISOString(), to: windowTo.toISOString() },
    ordersScanned: ingest.orders.length,
    tickets: {
      upserted: ingest.ticketsUpserted,
      linkedByReference: ingest.ticketsLinkedByReference,
      linkedByExternalRef: ingest.ticketsLinkedByExternalRef,
      healEventsWritten: ingest.healEventsWritten,
    },
    anomalies: {
      unassignedTickets: {
        count: unassignedCount,
        sampleTicketIds: unassignedTickets.map((t) => t.ticketId).slice(0, 10),
      },
      reconciliation: {
        expected,
        observedLinked,
        delta,
        deltaPct: Math.round(deltaPct * 100) / 100,
      },
      paymentMismatch: {
        sessions: paymentMismatchCount,
      },
    },
    intentsEmitted: intents.length,
    slack: slackResults,
  };
}

