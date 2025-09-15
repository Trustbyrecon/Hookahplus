import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { 
  apiVersion: '2024-06-20' 
});

export async function fetchPriceByLookup(lookupKey: string) {
  const r = await stripe.prices.list({ 
    lookup_keys: [lookupKey], 
    expand: ['data.product'], 
    limit: 1 
  });
  if (!r.data[0]) throw new Error(`Price not found for ${lookupKey}`);
  return r.data[0];
}

export async function createCheckoutSession({
  mode = 'payment',
  lineItems,
  metadata,
  successUrl,
  cancelUrl,
  customerEmail
}: {
  mode?: 'payment' | 'subscription';
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];
  metadata: Record<string, string>;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
}) {
  return await stripe.checkout.sessions.create({
    mode,
    line_items: lineItems,
    metadata,
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: customerEmail,
  });
}

export async function createPaymentIntent({
  amount,
  currency = 'usd',
  captureMethod = 'automatic',
  metadata
}: {
  amount: number;
  currency?: string;
  captureMethod?: 'automatic' | 'manual';
  metadata: Record<string, string>;
}) {
  return await stripe.paymentIntents.create({
    amount,
    currency,
    capture_method: captureMethod,
    metadata
  });
}
