// app/api/checkout-session/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { buildReceiptPreview } from "@/lib/pricing";
import { extractIdempotencyKey, withIdempotency } from "@/lib/idempotency";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST(request: NextRequest) {
  try {
    const key = extractIdempotencyKey(request);
    const body = await request.json();

    // Build a consistent receipt preview so UI and Stripe payload share the same math
    const preview = buildReceiptPreview({
      basePriceCents: body.amount,
      premiumAddOns: body.premiumAddOns,
      marginCents: body.marginCents,
      sessionId: body.sessionId,
      qrLink: body.qrLink,
      tableId: body.tableId,
    });

    const successUrl =
      body.successUrl ||
      `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl =
      body.cancelUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/cancel`;

    const { result, cached } = await withIdempotency({
      key,
      sessionId: body.sessionId,
      eventType: "payment_initiated",
      payload: { preview, tableId: body.tableId },
      handler: async () => {
        const stripeSession = await stripe.checkout.sessions.create(
          {
            mode: "payment",
            line_items: body.lineItems ?? preview.stripeLineItems,
            success_url: successUrl,
            cancel_url: cancelUrl,
            payment_method_types: ["card"],
            billing_address_collection: "auto",
            shipping_address_collection: {
              allowed_countries: ["US", "CA"],
            },
            metadata: {
              source: "hookahplus-web",
              session_type: "hookah_session",
              session_id: body.sessionId ?? "",
              table_id: body.tableId ?? "",
              qr_link: body.qrLink ?? "",
              base_price_cents: String(preview.basePriceCents),
              lounge_margin_cents: String(preview.loungeMarginCents),
              premium_addons: JSON.stringify(preview.premiumAddOns),
              total_cents: String(preview.totalCents),
            },
          },
          key ? { idempotencyKey: key } : undefined
        );

        return { sessionId: stripeSession.id, url: stripeSession.url };
      },
    });

    return NextResponse.json({
      ...result,
      preview,
      idempotent: cached,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}