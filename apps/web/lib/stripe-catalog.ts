import { z } from 'zod';

// Import stripe_ids.json with fallback
import stripeIdsData from '../stripe/catalog/stripe_ids.json';

const stripeIds = stripeIdsData as { products: Record<string, string>; prices: Record<string, string> };

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

  // Map product keys to their corresponding price lookup keys
  const priceKeyMap: Record<string, string> = {
    'hookah_session_base': 'price_hookah_session_base',
    'hookah_session_premium': 'price_hookah_session_premium', 
    'hookah_session_vip': 'price_hookah_session_vip',
    'flavor_addon': 'price_flavor_addon',
    'coal_refill': 'price_coal_refill',
    'extended_time_20m': 'price_extended_time_20m',
    'table_reservation_hold': 'price_table_reservation_hold'
  };

  const priceKey = priceKeyMap[productKey];
  if (!priceKey) return null;

  return {
    productId,
    priceId: getPriceId(priceKey as PriceLookupKey),
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
