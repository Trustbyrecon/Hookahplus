import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY missing at runtime");
  }
  _stripe = new Stripe(key, { apiVersion: "2025-08-27.basil" as any });
  return _stripe;
}


