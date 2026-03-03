import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "../../../../lib/stripeServer";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { amount, currency = 'usd', items } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    const stripe = getStripe();

    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Amount in cents
      currency: currency,
      description: `HookahPlus Order - ${items?.length || 0} items`,
      metadata: {
        items: JSON.stringify(items || []),
        source: 'preorder-checkout',
        env: process.env.VERCEL_ENV || process.env.NODE_ENV || 'unknown',
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });

  } catch (error: any) {
    console.error("[create-intent] error", error);
    return NextResponse.json(
      { error: error?.message ?? "Payment intent creation failed" },
      { status: 500 }
    );
  }
}
