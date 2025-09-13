import { z } from 'zod';
import stripeIds from '../stripe/catalog/stripe_ids.json';

// Zod schema for Stripe metadata validation
export const StripeMetadataSchema = z.object({
  'hp:type': z.string(),
  'hp:tier': z.string().optional(),
  'hp:duration_minutes': z.string(),
  'hp:flavors_included': z.string(),
  'hp:refill_included': z.string(),
});

export type StripeMetadata = z.infer<typeof StripeMetadataSchema>;

// Product key types for type safety
export type ProductKey = keyof typeof stripeIds.products;
export type PriceLookupKey = keyof typeof stripeIds.prices;

// Stripe ID map type
export interface StripeIdMap {
  products: Record<string, string>;
  prices: Record<string, string>;
}

// Helper functions
export function getProductId(productKey: ProductKey): string | undefined {
  return stripeIds.products[productKey];
}

export function getPriceId(priceLookupKey: PriceLookupKey): string | undefined {
  return stripeIds.prices[priceLookupKey];
}

// Validation helper
export function validateStripeMetadata(metadata: Record<string, string>): StripeMetadata | null {
  try {
    return StripeMetadataSchema.parse(metadata);
  } catch {
    return null;
  }
}

// Product configuration helper
export function getProductConfig(productKey: ProductKey) {
  const productId = getProductId(productKey);
  if (!productId) return null;

  return {
    productId,
    priceId: getPriceId(`price_${productKey}` as PriceLookupKey),
  };
}

// Session tier helper
export function getSessionTierConfig(tier: 'base' | 'premium' | 'vip') {
  const productKey = `hookah_session_${tier}` as ProductKey;
  return getProductConfig(productKey);
}

// Add-on helper
export function getAddonConfig(addon: 'flavor' | 'coal_refill' | 'extended_time') {
  const productKey = addon === 'flavor' ? 'flavor_addon' : 
                    addon === 'coal_refill' ? 'coal_refill' : 
                    'extended_time_20m';
  return getProductConfig(productKey as ProductKey);
}
