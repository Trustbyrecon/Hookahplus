import Stripe from 'stripe';

// Environment-based Stripe configuration
const isProduction = process.env.NODE_ENV === 'production';
const isLive = process.env.STRIPE_LIVE_MODE === 'true';

// Stripe keys configuration
const stripeKeys = {
  // Test keys (default)
  test: {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST || 'pk_test_...',
    secretKey: process.env.STRIPE_SECRET_KEY_TEST || 'sk_test_...',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET_TEST || 'whsec_...',
  },
  // Live keys (production)
  live: {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE || 'pk_live_...',
    secretKey: process.env.STRIPE_SECRET_KEY_LIVE || 'sk_live_...',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET_LIVE || 'whsec_...',
  }
};

// Get current configuration
const currentConfig = isLive ? stripeKeys.live : stripeKeys.test;

// Initialize Stripe instance
export const stripe = new Stripe(currentConfig.secretKey, {
  apiVersion: '2024-06-20',
  typescript: true,
});

// Export configuration
export const stripeConfig = {
  isLive,
  isProduction,
  publishableKey: currentConfig.publishableKey,
  webhookSecret: currentConfig.webhookSecret,
  environment: isLive ? 'live' : 'test',
};

// Webhook event types for Hookah+ operations
export const WEBHOOK_EVENTS = {
  // Payment events
  PAYMENT_INTENT_SUCCEEDED: 'payment_intent.succeeded',
  PAYMENT_INTENT_FAILED: 'payment_intent.payment_failed',
  PAYMENT_INTENT_CANCELED: 'payment_intent.canceled',
  
  // Customer events
  CUSTOMER_CREATED: 'customer.created',
  CUSTOMER_UPDATED: 'customer.updated',
  
  // Product events
  PRODUCT_CREATED: 'product.created',
  PRODUCT_UPDATED: 'product.updated',
  PRICE_CREATED: 'price.created',
  PRICE_UPDATED: 'price.updated',
  
  // Subscription events
  SUBSCRIPTION_CREATED: 'customer.subscription.created',
  SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
  
  // Refund events
  REFUND_CREATED: 'charge.dispute.created',
  REFUND_UPDATED: 'charge.dispute.updated',
} as const;

// Stripe product types for Hookah+ catalog
export const PRODUCT_TYPES = {
  HOOKAH_SESSION: 'hookah_session',
  FLAVOR_ADDON: 'flavor_addon',
  BUNDLE: 'bundle',
  MEMBERSHIP: 'membership',
  SERVICE: 'service',
} as const;

// Pricing tiers for dynamic pricing
export const PRICING_TIERS = {
  PEAK_HOURS: 'peak_hours',
  QUIET_HOURS: 'quiet_hours',
  WEEKEND: 'weekend',
  WEEKDAY: 'weekday',
  MEMBER_DISCOUNT: 'member_discount',
  BUNDLE_DISCOUNT: 'bundle_discount',
} as const;
