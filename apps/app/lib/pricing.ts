// Pricing calculation service
// Base price: $30 (configurable via OrgSetting)
// Add-on flavors: $5 each (configurable)
// Surge pricing: +$3 on weekends for top flavors

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
  flavors: string[];
  addOns?: string[];
  tableId?: string;
  loungeId?: string;
  isWeekend?: boolean;
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

export function calculatePrice(options: PricingOptions): PricingBreakdown {
  const {
    flavors = [],
    addOns = [],
    isWeekend = false,
  } = options;

  // Base price (in cents)
  const BASE_PRICE_CENTS = 3000; // $30.00
  
  // Add-on price per flavor (in cents)
  const ADDON_PRICE_CENTS = 500; // $5.00
  
  // Surge pricing (in cents)
  const SURGE_PRICE_CENTS = 300; // $3.00

  let basePrice = BASE_PRICE_CENTS;
  let flavorAddons = 0;
  let surgePricing = 0;

  // Calculate add-on flavors (anything beyond the base)
  if (flavors.length > 0) {
    // First flavor is included in base, additional flavors are add-ons
    flavorAddons = Math.max(0, flavors.length - 1) * ADDON_PRICE_CENTS;
  }

  // Apply surge pricing on weekends for top flavors
  if (isWeekend) {
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

