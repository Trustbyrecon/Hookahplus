export function getStripeWebhookSecret(): string {
  const v =
    (process.env.STRIPE_WEBHOOK_SECRET ?? '').trim() ||
    (process.env.STRIPE_WEBHOOK_SIGNING_SECRET ?? '').trim();
  if (!v) throw new Error('Stripe webhook secret missing (STRIPE_WEBHOOK_SECRET)');
  return v;
}

