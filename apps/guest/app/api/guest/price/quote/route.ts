import { NextRequest, NextResponse } from 'next/server';
import { PriceQuoteRequest, PriceQuoteResponse } from "@guest-types";
import { featureFlags, isDynamicPricingEnabled, isPromosEnabled } from './flags';
import { createGhostLogEntry } from './hash';
import { sharedSessions } from '../../shared-storage';

// Mock flavor pricing
const FLAVOR_PRICES: Record<string, number> = {
  'Blue Mist': 3200,      // $32.00
  'Double Apple': 3000,   // $30.00
  'Mint Fresh': 2900,     // $29.00
  'Grape': 2800,          // $28.00
  'Strawberry': 2700,     // $27.00
  'Lemon': 2600,          // $26.00
  'Orange': 2500,         // $25.00
  'Watermelon': 2400,     // $24.00
  'Strawberry Mojito': 800, // $8.00
};

// Mock promo codes
const PROMO_CODES = {
  'WELCOME10': { discount: 10, type: 'percentage', minAmount: 2000 },
  'FIRSTTIME': { discount: 500, type: 'fixed', minAmount: 3000 },
  'LOYAL20': { discount: 20, type: 'percentage', minAmount: 5000 },
  'FRIEND': { discount: 15, type: 'percentage', minAmount: 1000 }
};

/**
 * POST /api/guest/price/quote
 * 
 * Calculates price for a session with optional promo code
 */
export async function POST(req: NextRequest) {
  try {
    const body: PriceQuoteRequest = await req.json();
    const { sessionId, promoCode, campaignId } = body;

    // Validate required fields
    if (!sessionId) {
      return NextResponse.json({
        ok: false,
        error: 'Missing required field: sessionId'
      }, { status: 400 });
    }

    // Get session from shared storage
    const session = sharedSessions.get(sessionId);
    if (!session) {
      return NextResponse.json({
        ok: false,
        error: 'Session not found'
      }, { status: 404 });
    }

    // Calculate base price based on session type
    let basePrice = 0;
    const flavors = session.mix?.flavors || [];
    
    if (session.sessionType === 'time-based') {
      // Time-based: $0.50 per minute (default 60 min session)
      const sessionDuration = session.duration || 60; // Default 60 minutes
      basePrice = Math.round(sessionDuration * 50); // $0.50 per minute = 50 cents
      
      // Add flavor costs for time-based sessions (flavors are add-ons)
      const flavorPrices = flavors.map((flavor: string) => FLAVOR_PRICES[flavor] || 0);
      const totalFlavorPrice = flavorPrices.reduce((sum: number, price: number) => sum + price, 0);
      basePrice += totalFlavorPrice;
    } else {
      // Flat fee: Use highest flavor price, or $30.00 minimum
      const flavorPrices = flavors.map((flavor: string) => FLAVOR_PRICES[flavor] || 0);
      if (flavorPrices.length > 0) {
        const highestFlavorPrice = Math.max(...flavorPrices);
        basePrice = Math.max(3000, highestFlavorPrice); // $30.00 minimum, or highest flavor price
      } else {
        basePrice = 3000; // Default $30.00 if no flavors selected
      }
    }
    
    // Calculate addons (mock - could be premium flavors, extra time, etc.)
    const addons = calculateAddons(session);
    
    // Apply dynamic pricing if enabled
    const flags = featureFlags.getLoungeFlags(session.loungeId);
    let finalBasePrice = basePrice;
    if (isDynamicPricingEnabled()) {
      finalBasePrice = applyDynamicPricing(basePrice, session);
    }

    // Calculate subtotal
    const subtotal = finalBasePrice + addons;

    // Apply campaign discount if provided
    let campaignDiscount = 0;
    let campaignInfo: any = undefined;
    if (campaignId) {
      try {
        const campaignResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/api/campaigns/${campaignId}/apply`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            customerRef: session.guestId,
            subtotalCents: subtotal
          })
        });

        if (campaignResponse.ok) {
          const campaignData = await campaignResponse.json();
          if (campaignData.success) {
            campaignDiscount = campaignData.discountCents || 0;
            campaignInfo = {
              id: campaignId,
              discount: campaignDiscount,
              discountAmount: campaignData.discountAmount || 0
            };
          }
        }
      } catch (campaignError) {
        console.warn('Campaign application error (non-blocking):', campaignError);
        // Continue without campaign discount if application fails
      }
    }

    // Apply promo code if provided and enabled (campaigns take precedence)
    let promo: any = undefined;
    if (promoCode && isPromosEnabled() && !campaignInfo) {
      promo = applyPromoCode(promoCode, subtotal);
    }

    // Calculate final total (apply campaign discount first, then promo if no campaign)
    const discount = campaignDiscount || (promo ? promo.discount : 0);
    const total = subtotal - discount;

    // Create price breakdown
    const breakdown = createPriceBreakdown(flavors, finalBasePrice, addons, promo, campaignInfo, session.sessionType);

    // Update session with pricing
    session.price = {
      base: finalBasePrice,
      addons,
      total: Math.max(0, total), // Ensure non-negative
      currency: 'USD',
      promo,
      campaign: campaignInfo
    };

    // Log price quote event
    if (flags.ghostlog.lite) {
      const eventPayload = {
        sessionId,
        guestId: session.guestId,
        basePrice: finalBasePrice,
        addons,
        subtotal,
        total,
        promoCode,
        campaignId: campaignId || null,
        campaignDiscount: campaignDiscount || 0,
        timestamp: new Date().toISOString()
      };

      const ghostLogEntry = createGhostLogEntry({
        eventType: 'price.quoted',
        ...eventPayload
      });
      console.log('Price quote logged:', ghostLogEntry);
    }

    const response: PriceQuoteResponse = {
      base: finalBasePrice,
      addons,
      total: Math.max(0, total),
      currency: 'USD',
      promo,
      campaign: campaignInfo,
      breakdown
    };

    return NextResponse.json({
      ok: true,
      ...response
    });

  } catch (error) {
    console.error('Price quote error:', error);
    
    return NextResponse.json({
      ok: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

/**
 * Calculate base price from selected flavors
 */
function calculateBasePrice(flavors: string[]): number {
  if (flavors.length === 0) return 0;
  
  // Base price is the highest priced flavor
  const prices = flavors.map((flavor: string) => FLAVOR_PRICES[flavor] || 0);
  return Math.max(...prices);
}

/**
 * Calculate addon costs
 */
function calculateAddons(session: any): number {
  let addons = 0;
  
  // Premium table fee
  if (session.tableId?.includes('VIP')) {
    addons += 1000; // $10.00
  }
  
  // Extra time fee (if session duration > 60 minutes)
  if (session.duration && session.duration > 60) {
    const extraMinutes = session.duration - 60;
    addons += Math.ceil(extraMinutes / 15) * 500; // $5.00 per 15 minutes
  }
  
  return addons;
}

/**
 * Apply dynamic pricing based on demand, time, etc.
 */
function applyDynamicPricing(basePrice: number, session: any): number {
  const now = new Date();
  const hour = now.getHours();
  
  // Peak hours pricing (8PM-11PM)
  if (hour >= 20 && hour <= 23) {
    return Math.round(basePrice * 1.2); // 20% increase
  }
  
  // Weekend pricing
  const day = now.getDay();
  if (day === 5 || day === 6) { // Friday or Saturday
    return Math.round(basePrice * 1.1); // 10% increase
  }
  
  return basePrice;
}

/**
 * Apply promo code discount
 */
function applyPromoCode(code: string, subtotal: number): any {
  const promo = PROMO_CODES[code.toUpperCase() as keyof typeof PROMO_CODES];
  if (!promo) {
    return undefined;
  }
  
  // Check minimum amount requirement
  if (subtotal < promo.minAmount) {
    return undefined;
  }
  
  let discount = 0;
  if (promo.type === 'percentage') {
    discount = Math.round(subtotal * (promo.discount / 100));
  } else {
    discount = promo.discount;
  }
  
  return {
    code: code.toUpperCase(),
    discount: Math.min(discount, subtotal), // Don't exceed subtotal
    type: promo.type
  };
}

/**
 * Create detailed price breakdown
 */
function createPriceBreakdown(flavors: string[], basePrice: number, addons: number, promo: any, campaign: any, sessionType?: string): any[] {
  const breakdown: any[] = [];
  
  if (sessionType === 'time-based') {
    // For time-based: Show session duration and flavor add-ons separately
    breakdown.push({
      item: 'Session (Time-based)',
      price: basePrice - flavors.reduce((sum, flavor) => sum + (FLAVOR_PRICES[flavor] || 0), 0)
    });
    
    // Add flavor prices as add-ons
    flavors.forEach(flavor => {
      const price = FLAVOR_PRICES[flavor] || 0;
      if (price > 0) {
        breakdown.push({
          item: `Flavor: ${flavor}`,
          price
        });
      }
    });
  } else {
    // For flat fee: Show base session price (includes flavors)
    breakdown.push({
      item: 'Session (Flat Fee)',
      price: basePrice
    });
    
    // Optionally show flavor breakdown for transparency
    if (flavors.length > 0) {
      const flavorPrices = flavors.map((flavor: string) => FLAVOR_PRICES[flavor] || 0);
      const highestPrice = Math.max(...flavorPrices);
      if (highestPrice > 0 && highestPrice !== basePrice) {
        breakdown.push({
          item: `Selected Flavors (${flavors.length})`,
          price: 0, // Already included in base price
          note: 'Included in session price'
        });
      }
    }
  }
  
  // Add addons (premium table, extra time, etc.)
  if (addons > 0) {
    breakdown.push({
      item: 'Add-ons',
      price: addons
    });
  }
  
  // Add campaign discount (takes precedence over promo)
  if (campaign) {
    breakdown.push({
      item: `Campaign Discount`,
      price: -campaign.discount,
      note: `Campaign applied`
    });
  } else if (promo) {
    // Add promo discount only if no campaign
    breakdown.push({
      item: `Discount (${promo.code})`,
      price: -promo.discount
    });
  }
  
  return breakdown;
}
