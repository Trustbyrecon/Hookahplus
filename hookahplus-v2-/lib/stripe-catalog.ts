import { stripe, PRODUCT_TYPES, PRICING_TIERS } from './stripe-config';

// Hookah+ product catalog for Stripe sync
export const HOOKAH_CATALOG = {
  // Base hookah sessions
  sessions: [
    {
      name: 'Classic Hookah Session',
      description: 'Premium hookah experience with your choice of flavor',
      basePrice: 2500, // $25.00 in cents
      duration: 60, // minutes
      type: PRODUCT_TYPES.HOOKAH_SESSION,
      metadata: {
        category: 'session',
        duration: 60,
        maxPeople: 4
      }
    },
    {
      name: 'Premium Hookah Session',
      description: 'Deluxe hookah experience with premium flavors and service',
      basePrice: 3500, // $35.00 in cents
      duration: 90, // minutes
      type: PRODUCT_TYPES.HOOKAH_SESSION,
      metadata: {
        category: 'session',
        duration: 90,
        maxPeople: 6
      }
    },
    {
      name: 'VIP Hookah Session',
      description: 'Ultimate hookah experience with exclusive flavors and dedicated service',
      basePrice: 5000, // $50.00 in cents
      duration: 120, // minutes
      type: PRODUCT_TYPES.HOOKAH_SESSION,
      metadata: {
        category: 'session',
        duration: 120,
        maxPeople: 8
      }
    }
  ],

  // Flavor add-ons
  flavors: [
    {
      name: 'Double Apple',
      description: 'Classic double apple hookah flavor',
      basePrice: 0, // Included in session
      type: PRODUCT_TYPES.FLAVOR_ADDON,
      metadata: {
        category: 'flavor',
        popularity: 'high'
      }
    },
    {
      name: 'Mint',
      description: 'Refreshing mint hookah flavor',
      basePrice: 0,
      type: PRODUCT_TYPES.FLAVOR_ADDON,
      metadata: {
        category: 'flavor',
        popularity: 'high'
      }
    },
    {
      name: 'Grape',
      description: 'Sweet grape hookah flavor',
      basePrice: 0,
      type: PRODUCT_TYPES.FLAVOR_ADDON,
      metadata: {
        category: 'flavor',
        popularity: 'medium'
      }
    },
    {
      name: 'Strawberry',
      description: 'Fruity strawberry hookah flavor',
      basePrice: 0,
      type: PRODUCT_TYPES.FLAVOR_ADDON,
      metadata: {
        category: 'flavor',
        popularity: 'medium'
      }
    },
    {
      name: 'Watermelon',
      description: 'Fresh watermelon hookah flavor',
      basePrice: 0,
      type: PRODUCT_TYPES.FLAVOR_ADDON,
      metadata: {
        category: 'flavor',
        popularity: 'low'
      }
    }
  ],

  // Service bundles
  bundles: [
    {
      name: 'Date Night Bundle',
      description: 'Perfect for couples - 2 sessions + premium flavors + dessert',
      basePrice: 4500, // $45.00 in cents
      type: PRODUCT_TYPES.BUNDLE,
      metadata: {
        category: 'bundle',
        targetAudience: 'couples',
        includes: '2_sessions,premium_flavors,dessert'
      }
    },
    {
      name: 'Group Party Bundle',
      description: 'Great for groups - 4 sessions + variety pack + appetizers',
      basePrice: 8000, // $80.00 in cents
      type: PRODUCT_TYPES.BUNDLE,
      metadata: {
        category: 'bundle',
        targetAudience: 'groups',
        includes: '4_sessions,variety_pack,appetizers'
      }
    },
    {
      name: 'Quiet Hours Special',
      description: 'Discounted session during quiet hours (2-5 PM weekdays)',
      basePrice: 1500, // $15.00 in cents
      type: PRODUCT_TYPES.BUNDLE,
      metadata: {
        category: 'bundle',
        targetAudience: 'budget_conscious',
        timeRestriction: 'weekday_afternoon'
      }
    }
  ],

  // Membership tiers
  memberships: [
    {
      name: 'Bronze Membership',
      description: 'Basic membership with 10% discount on all sessions',
      basePrice: 2000, // $20.00/month in cents
      type: PRODUCT_TYPES.MEMBERSHIP,
      metadata: {
        category: 'membership',
        tier: 'bronze',
        discount: '10',
        benefits: '10_percent_discount,priority_booking'
      }
    },
    {
      name: 'Silver Membership',
      description: 'Premium membership with 20% discount and exclusive flavors',
      basePrice: 4000, // $40.00/month in cents
      type: PRODUCT_TYPES.MEMBERSHIP,
      metadata: {
        category: 'membership',
        tier: 'silver',
        discount: '20',
        benefits: '20_percent_discount,exclusive_flavors,priority_booking,free_refills'
      }
    },
    {
      name: 'Gold Membership',
      description: 'VIP membership with 30% discount and all premium benefits',
      basePrice: 6000, // $60.00/month in cents
      type: PRODUCT_TYPES.MEMBERSHIP,
      metadata: {
        category: 'membership',
        tier: 'gold',
        discount: '30',
        benefits: '30_percent_discount,exclusive_flavors,priority_booking,free_refills,private_booth_access'
      }
    }
  ]
};

// Dynamic pricing configuration
export const DYNAMIC_PRICING = {
  [PRICING_TIERS.PEAK_HOURS]: {
    multiplier: 1.2, // 20% increase
    hours: ['19:00', '20:00', '21:00', '22:00', '23:00'],
    days: ['friday', 'saturday', 'sunday']
  },
  [PRICING_TIERS.QUIET_HOURS]: {
    multiplier: 0.6, // 40% discount
    hours: ['14:00', '15:00', '16:00', '17:00'],
    days: ['monday', 'tuesday', 'wednesday', 'thursday']
  },
  [PRICING_TIERS.WEEKEND]: {
    multiplier: 1.1, // 10% increase
    days: ['saturday', 'sunday']
  },
  [PRICING_TIERS.WEEKDAY]: {
    multiplier: 0.9, // 10% discount
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
  }
};

// Sync products to Stripe
export async function syncProductsToStripe() {
  try {
    console.log('Starting Stripe product catalog sync...');
    
    const results = {
      sessions: [],
      flavors: [],
      bundles: [],
      memberships: [],
      errors: []
    };

    // Sync sessions
    for (const session of HOOKAH_CATALOG.sessions) {
      try {
        const product = await stripe.products.create({
          name: session.name,
          description: session.description,
          metadata: session.metadata,
          type: 'service'
        });

        // Create base price
        await stripe.prices.create({
          product: product.id,
          unit_amount: session.basePrice,
          currency: 'usd',
          metadata: {
            type: session.type,
            basePrice: session.basePrice.toString()
          }
        });

        results.sessions.push({ id: product.id, name: session.name });
        console.log(`Created session product: ${session.name}`);
      } catch (error) {
        results.errors.push({ type: 'session', name: session.name, error: error.message });
      }
    }

    // Sync flavors
    for (const flavor of HOOKAH_CATALOG.flavors) {
      try {
        const product = await stripe.products.create({
          name: flavor.name,
          description: flavor.description,
          metadata: flavor.metadata,
          type: 'service'
        });

        // Create price (usually $0 for included flavors)
        await stripe.prices.create({
          product: product.id,
          unit_amount: flavor.basePrice,
          currency: 'usd',
          metadata: {
            type: flavor.type,
            basePrice: flavor.basePrice.toString()
          }
        });

        results.flavors.push({ id: product.id, name: flavor.name });
        console.log(`Created flavor product: ${flavor.name}`);
      } catch (error) {
        results.errors.push({ type: 'flavor', name: flavor.name, error: error.message });
      }
    }

    // Sync bundles
    for (const bundle of HOOKAH_CATALOG.bundles) {
      try {
        const product = await stripe.products.create({
          name: bundle.name,
          description: bundle.description,
          metadata: bundle.metadata,
          type: 'service'
        });

        // Create base price
        await stripe.prices.create({
          product: product.id,
          unit_amount: bundle.basePrice,
          currency: 'usd',
          metadata: {
            type: bundle.type,
            basePrice: bundle.basePrice.toString()
          }
        });

        results.bundles.push({ id: product.id, name: bundle.name });
        console.log(`Created bundle product: ${bundle.name}`);
      } catch (error) {
        results.errors.push({ type: 'bundle', name: bundle.name, error: error.message });
      }
    }

    // Sync memberships
    for (const membership of HOOKAH_CATALOG.memberships) {
      try {
        const product = await stripe.products.create({
          name: membership.name,
          description: membership.description,
          metadata: membership.metadata,
          type: 'service'
        });

        // Create recurring price
        await stripe.prices.create({
          product: product.id,
          unit_amount: membership.basePrice,
          currency: 'usd',
          recurring: {
            interval: 'month'
          },
          metadata: {
            type: membership.type,
            basePrice: membership.basePrice.toString()
          }
        });

        results.memberships.push({ id: product.id, name: membership.name });
        console.log(`Created membership product: ${membership.name}`);
      } catch (error) {
        results.errors.push({ type: 'membership', name: membership.name, error: error.message });
      }
    }

    console.log('Stripe product catalog sync completed');
    return results;
  } catch (error) {
    console.error('Error syncing products to Stripe:', error);
    throw error;
  }
}

// Calculate dynamic pricing
export function calculateDynamicPrice(basePrice: number, context: {
  hour?: string;
  day?: string;
  isMember?: boolean;
  membershipTier?: string;
  isBundle?: boolean;
}): number {
  let price = basePrice;
  
  // Apply time-based pricing
  if (context.hour && context.day) {
    const timeKey = `${context.day}_${context.hour}`;
    
    // Check for peak hours
    if (DYNAMIC_PRICING[PRICING_TIERS.PEAK_HOURS].hours.includes(context.hour) &&
        DYNAMIC_PRICING[PRICING_TIERS.PEAK_HOURS].days.includes(context.day)) {
      price *= DYNAMIC_PRICING[PRICING_TIERS.PEAK_HOURS].multiplier;
    }
    
    // Check for quiet hours
    if (DYNAMIC_PRICING[PRICING_TIERS.QUIET_HOURS].hours.includes(context.hour) &&
        DYNAMIC_PRICING[PRICING_TIERS.QUIET_HOURS].days.includes(context.day)) {
      price *= DYNAMIC_PRICING[PRICING_TIERS.QUIET_HOURS].multiplier;
    }
  }
  
  // Apply membership discounts
  if (context.isMember && context.membershipTier) {
    const membership = HOOKAH_CATALOG.memberships.find(m => m.metadata.tier === context.membershipTier);
    if (membership) {
      const discount = parseInt(membership.metadata.discount) / 100;
      price *= (1 - discount);
    }
  }
  
  // Apply bundle discounts
  if (context.isBundle) {
    price *= 0.9; // 10% bundle discount
  }
  
  return Math.round(price);
}
