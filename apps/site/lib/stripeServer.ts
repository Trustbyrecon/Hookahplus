import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  
  // Use test mode by default for pre-orders
  const key = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_TEST_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY or STRIPE_TEST_SECRET_KEY missing at runtime");
  }
  
  // Check if we're using test mode
  const isTestMode = key.startsWith('sk_test_') || process.env.NEXT_PUBLIC_STRIPE_TEST_MODE === 'true';
  
  _stripe = new Stripe(key, { 
    apiVersion: "2023-10-16",
    // Test mode indicator
    typescript: true,
  });
  
  if (isTestMode) {
    console.log('[Stripe] Using TEST MODE - All charges are test transactions');
  }
  
  return _stripe;
}
