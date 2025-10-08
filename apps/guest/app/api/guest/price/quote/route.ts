import { NextRequest, NextResponse } from 'next/server';
import { PriceQuoteRequest, PriceQuoteResponse } from '@/types/guest';
import { featureFlags, isDynamicPricingEnabled, isPromosEnabled } from './flags';
import { createGhostLogEntry } from './hash';

// Mock data stores
const sessions = new Map<string, any>();
const promoCodes = new Map<string, any>();

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
    const { sessionId, promoCode } = body;

    // Validate required fields
    if (!sessionId) {
      return NextResponse.json({
        ok: false,
        error: 'Missing required field: sessionId'
      }, { status: 400 });
    }

    // Get session
    const session = sessions.get(sessionId);
    if (!session) {
      return NextResponse.json({
        ok: false,
        error: 'Session not found'
      }, { status: 404 });
    }

    // Calculate base price from flavors
    const basePrice = calculateBasePrice(session.mix.flavors);
    
    // Calculate addons (mock - could be premium flavors, extra time, etc.)
    const addons = calculateAddons(session);
    
    // Apply dynamic pricing if enabled
    const flags = featureFlags.getLoungeFlags(session.loungeId);
    let finalBasePrice = basePrice;
    if (isDynamicPricingEnabled(session.loungeId)) {
      finalBasePrice = applyDynamicPricing(basePrice, session);
    }

    // Calculate subtotal
    const subtotal = finalBasePrice + addons;

    // Apply promo code if provided and enabled
    let promo: any = undefined;
    if (promoCode && isPromosEnabled(session.loungeId)) {
      promo = applyPromoCode(promoCode, subtotal);
    }

    // Calculate final total
    const total = promo ? subtotal - promo.discount : subtotal;

    // Create price breakdown
    const breakdown = createPriceBreakdown(session.mix.flavors, finalBasePrice, addons, promo);

    // Update session with pricing
    session.price = {
      base: finalBasePrice,
      addons,
      total: Math.max(0, total), // Ensure non-negative
      currency: 'USD',
      promo
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
        timestamp: new Date().toISOString()
      };

      const ghostLogEntry = createGhostLogEntry('price.quoted', eventPayload);
      console.log('Price quote logged:', ghostLogEntry);
    }

    const response: PriceQuoteResponse = {
      base: finalBasePrice,
      addons,
      total: Math.max(0, total),
      currency: 'USD',
      promo,
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
  const prices = flavors.map(flavor => FLAVOR_PRICES[flavor] || 0);
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
  const promo = PROMO_CODES[code.toUpperCase()];
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
function createPriceBreakdown(flavors: string[], basePrice: number, addons: number, promo: any): any[] {
  const breakdown: any[] = [];
  
  // Add flavor prices
  flavors.forEach(flavor => {
    const price = FLAVOR_PRICES[flavor] || 0;
    if (price > 0) {
      breakdown.push({
        item: flavor,
        price
      });
    }
  });
  
  // Add addons
  if (addons > 0) {
    breakdown.push({
      item: 'Add-ons',
      price: addons
    });
  }
  
  // Add promo discount
  if (promo) {
    breakdown.push({
      item: `Discount (${promo.code})`,
      price: -promo.discount
    });
  }
  
  return breakdown;
}
