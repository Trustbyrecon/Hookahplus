import Stripe from "stripe";

let _stripe: Stripe | null = null;

/**
 * Resolve which secret key to use.
 * In development, if STRIPE_TEST_SECRET_KEY (or STRIPE_SECRET_KEY_TEST) is set,
 * it is preferred so local dev is not blocked by an expired sk_live_ in STRIPE_SECRET_KEY.
 * Set STRIPE_FORCE_LIVE_IN_DEV=true to use STRIPE_SECRET_KEY in dev anyway.
 */
export function resolveStripeSecretKey(): string {
  const secretKey = (process.env.STRIPE_SECRET_KEY ?? "").trim();
  const testKey = (
    process.env.STRIPE_TEST_SECRET_KEY ??
    process.env.STRIPE_SECRET_KEY_TEST ??
    ""
  ).trim();
  const isDev = process.env.NODE_ENV === "development";
  const forceLive = process.env.STRIPE_FORCE_LIVE_IN_DEV === "true";

  if (isDev && testKey && !forceLive) {
    if (secretKey.startsWith("sk_live_")) {
      console.warn(
        "[stripe] Using STRIPE_TEST_SECRET_KEY in development (live key in STRIPE_SECRET_KEY is ignored). Set STRIPE_FORCE_LIVE_IN_DEV=true to use the live key."
      );
    }
    return testKey;
  }

  if (!secretKey) {
    if (isDev && testKey) return testKey;
    throw new Error("STRIPE_SECRET_KEY missing at runtime");
  }
  return secretKey;
}

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = resolveStripeSecretKey();
  _stripe = new Stripe(key, { apiVersion: "2025-08-27.basil" as any });
  return _stripe;
}
