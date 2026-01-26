import crypto from 'crypto';
import { Prisma, SessionSource, SessionState } from '@prisma/client';
import { prisma } from '../db';
import { getHIDSalt } from '../env';
import { resolveHID } from '../hid/resolver';
import { syncSessionToNetwork } from '../profiles/network';
import { awardLoyaltyPoints } from '../../core/handlePaymentCompleted';

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

export async function processSquareRawEvents(limit: number = 100) {
  const rawEvents = await prisma.squareEventRaw.findMany({
    where: { processedAt: null },
    orderBy: { receivedAt: 'asc' },
    take: limit,
  });

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
            throw new Error('Missing lounge mapping for Square payment');
          }

          const customerId = payment?.customer_id || null;
          const identity = await resolveSquareCustomerIdentity(customerId);
          const referenceId = payment?.reference_id || order?.reference_id || null;

          const session = await findOrCreateSessionForPayment({
            loungeId: loungeContext.loungeId,
            tenantId: loungeContext.tenantId,
            amountCents: amountCents || 0,
            referenceId,
            paymentId: payment.id,
            orderId: paymentOrderId,
            customerPhone: identity.phone,
          });

          await prisma.session.update({
            where: { id: session.id },
            data: {
              paymentStatus: 'succeeded',
              priceCents: amountCents || session.priceCents,
              externalRef: referenceId || paymentOrderId || payment.id,
            },
          });

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
        data: { processedAt: new Date(), errorMessage: null },
      });
      processed += 1;
    } catch (error: any) {
      failed += 1;
      await prisma.squareEventRaw.update({
        where: { id: raw.id },
        data: {
          processedAt: new Date(),
          errorMessage: error?.message || 'square processor error',
        },
      });
    }
  }

  return { processed, failed };
}

