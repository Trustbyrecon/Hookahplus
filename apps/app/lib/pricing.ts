// Pricing calculation service
// Base price: $30 (configurable via OrgSetting)
// Flavor pricing: Individual flavors priced from $2.00-$4.50 (from FlavorWheelSelector)
// Surge pricing: +$3 on weekends for top flavors
// Session pricing: Flat ($30) or Time-based ($0.50/min)

export interface PricingBreakdown {
  basePrice: number;
  flavorAddons: number;
  surgePricing: number;
  total: number;
  breakdown: {
    base: number;
    addons: number;
    surge: number;
  };
}

export interface PricingOptions {
  flavors: string[]; // Flavor IDs from FlavorWheelSelector
  addOns?: string[];
  tableId?: string;
  loungeId?: string;
  isWeekend?: boolean;
  pricingModel?: 'flat' | 'time-based';
  sessionDuration?: number; // Minutes, required for time-based
  flavorPrices?: Record<string, number>; // Flavor price map (dollars)
  /** Override base price in cents (e.g. CODIGO $60 = 6000) */
  basePriceCents?: number;
  /** If true, flavors included in base (no add-on charge) */
  flavorAddOnFree?: boolean;
}

// Top flavors that get surge pricing on weekends
const TOP_FLAVORS = [
  'blue mist',
  'double apple',
  'mint',
  'strawberry',
  'peach',
  'watermelon',
];

// Export default flavor prices for use in API
export const DEFAULT_FLAVOR_PRICES: Record<string, number> = {
  // Mint & Cool
  'mint': 2.00,
  'ice-mint': 2.50,
  'spearmint': 2.00,
  'menthol': 2.50,
  // Fruity
  'mango': 2.00,
  'peach': 2.00,
  'watermelon': 2.50,
  'grape': 2.00,
  'berry': 2.50,
  // Citrus
  'lemon': 2.00,
  'orange': 2.00,
  'lime': 2.00,
  'tangerine': 2.50,
  // Dessert
  'vanilla': 2.50,
  'caramel': 2.50,
  'chocolate': 3.00,
  'cookie': 3.00,
  // Spice & Bold
  'double-apple': 2.00,
  'cinnamon': 2.50,
  'cardamom': 2.50,
  'anise': 2.00,
  // Floral
  'rose': 2.50,
  'jasmine': 2.50,
  'lavender': 3.00,
  // Premium
  'vodka-infused': 4.00,
  'whiskey-barrel': 4.00,
  'boutique-import': 4.50,
};

// Flat pricing constants
const BASE_PRICE_CENTS = 3000; // $30.00
const SURGE_PRICE_CENTS = 300; // $3.00

// Time-based pricing constants
const TIME_BASED_RATE_CENTS_PER_MIN = 50; // $0.50 per minute

export function calculatePrice(options: PricingOptions): PricingBreakdown {
  const {
    flavors = [],
    addOns = [],
    isWeekend = false,
    pricingModel = 'flat',
    sessionDuration = 60,
    flavorPrices = DEFAULT_FLAVOR_PRICES,
    basePriceCents,
    flavorAddOnFree = false,
  } = options;

  let basePrice = 0;
  let flavorAddons = 0;
  let surgePricing = 0;

  // Base session price: override from lounge config or default
  if (pricingModel === 'flat') {
    basePrice = basePriceCents ?? BASE_PRICE_CENTS;
  } else {
    basePrice = Math.round(sessionDuration * TIME_BASED_RATE_CENTS_PER_MIN);
  }

  // Flavor add-ons: skip if flavorAddOnFree (CODIGO: flat includes flavors)
  if (flavors.length > 0 && !flavorAddOnFree) {
    flavorAddons = flavors.reduce((total, flavorId) => {
      const price = flavorPrices[flavorId] || 2.00;
      return total + Math.round(price * 100);
    }, 0);
  }

  // Apply surge pricing on weekends for top flavors (only for flat rate)
  if (isWeekend && pricingModel === 'flat') {
    const hasTopFlavor = flavors.some((flavor) =>
      TOP_FLAVORS.some((top) =>
        flavor.toLowerCase().includes(top.toLowerCase())
      )
    );
    
    if (hasTopFlavor) {
      surgePricing = SURGE_PRICE_CENTS;
    }
  }

  const total = basePrice + flavorAddons + surgePricing;

  return {
    basePrice: basePrice / 100, // Convert to dollars
    flavorAddons: flavorAddons / 100,
    surgePricing: surgePricing / 100,
    total: total / 100,
    breakdown: {
      base: basePrice / 100,
      addons: flavorAddons / 100,
      surge: surgePricing / 100,
    },
  };
}

// Check if current date is weekend
export function isWeekend(date: Date = new Date()): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
}

// Calculate flavor price from flavor data (helper function)
export function calculateFlavorPrice(flavorIds: string[], flavorPriceMap: Record<string, number>): number {
  return flavorIds.reduce((total, id) => {
    return total + (flavorPriceMap[id] || 0);
  }, 0);
}
