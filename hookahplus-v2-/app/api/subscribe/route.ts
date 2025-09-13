import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

export async function POST(req: Request) {
  try {
    const { tier = "pro", email } = await req.json().catch(() => ({}));
    
    // Map tier names to price IDs
    const priceMap: Record<string, string | undefined> = {
      starter: process.env.PRICE_TIER_STARTER,
      pro: process.env.PRICE_TIER_PRO,
      trust_plus: process.env.PRICE_TIER_TRUST_PLUS
    };
    
    const price = priceMap[tier];
    if (!price) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    // Create checkout session for subscription
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      line_items: [{ price, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/welcome?sid={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
      metadata: {
        tier,
        subscription_type: "saas_tier"
      },
      subscription_data: {
        metadata: {
          tier,
          subscription_type: "saas_tier"
        }
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    console.error('Subscription creation error:', e);
    return NextResponse.json({ error: e.message ?? "Failed to create subscription" }, { status: 500 });
  }
}
