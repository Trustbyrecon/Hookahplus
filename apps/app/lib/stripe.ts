import Stripe from "stripe";

// Clean the Stripe key to remove any invalid characters
const cleanStripeKey = process.env.STRIPE_SECRET_KEY?.trim().replace(/[^\x20-\x7E]/g, '') || '';

export const stripe = new Stripe(cleanStripeKey, {
  apiVersion: "2025-08-27.basil" as any,
});

export default stripe;