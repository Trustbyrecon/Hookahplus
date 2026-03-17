/**
 * POST /api/guest/session/create-and-quote
 *
 * Creates a session and returns price quote in a single request.
 * Avoids "Session not found" when create and quote run in separate requests
 * (e.g. Next.js worker isolation, HMR).
 */
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { sharedSessions, getGuestProfile, setGuestProfile } from '../../shared-storage';
import { createGhostLogEntry } from '../../hash';
import { featureFlags } from '../../flags';
import { PriceQuoteResponse } from '@guest-types';

const FLAVOR_PRICES: Record<string, number> = {
  'Blue Mist': 3200, 'Double Apple': 3000, 'Mint Fresh': 2900, 'Grape': 2800,
  'Strawberry': 2700, 'Lemon': 2600, 'Orange': 2500, 'Watermelon': 2400,
  'Strawberry Mojito': 800,
};

const PROMO_CODES: Record<string, { discount: number; type: string; minAmount: number }> = {
  'WELCOME10': { discount: 10, type: 'percentage', minAmount: 2000 },
  'FIRSTTIME': { discount: 500, type: 'fixed', minAmount: 3000 },
  'LOYAL20': { discount: 20, type: 'percentage', minAmount: 5000 },
  'FRIEND': { discount: 15, type: 'percentage', minAmount: 1000 },
};

function calculateAddons(session: any): number {
  let addons = 0;
  if (session.tableId?.includes('VIP')) addons += 1000;
  if (session.duration && session.duration > 60) {
    const extra = session.duration - 60;
    addons += Math.ceil(extra / 15) * 500;
  }
  return addons;
}

function applyPromoCode(code: string, subtotal: number): any {
  const promo = PROMO_CODES[code.toUpperCase()];
  if (!promo || subtotal < promo.minAmount) return undefined;
  const discount = promo.type === 'percentage'
    ? Math.round(subtotal * (promo.discount / 100))
    : promo.discount;
  return {
    code: code.toUpperCase(),
    discount: Math.min(discount, subtotal),
    type: promo.type,
  };
}

function createPriceBreakdown(flavors: string[], basePrice: number, addons: number, promo: any, campaign: any, sessionType?: string): any[] {
  const breakdown: any[] = [];
  if (sessionType === 'time-based') {
    breakdown.push({ item: 'Session (Time-based)', price: basePrice - flavors.reduce((s, f) => s + (FLAVOR_PRICES[f] || 0), 0) });
    flavors.forEach(f => {
      const p = FLAVOR_PRICES[f] || 0;
      if (p > 0) breakdown.push({ item: `Flavor: ${f}`, price: p });
    });
  } else {
    breakdown.push({ item: 'Session (Flat Fee)', price: basePrice });
  }
  if (addons > 0) breakdown.push({ item: 'Add-ons', price: addons });
  if (campaign) breakdown.push({ item: 'Campaign Discount', price: -campaign.discount, note: 'Campaign applied' });
  else if (promo) breakdown.push({ item: `Discount (${promo.code})`, price: -promo.discount });
  return breakdown;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { guestId, loungeId, flavors, specialInstructions, tableId, zone, sessionType, duration, promoCode, campaignId } = body;

    if (!guestId || !loungeId) {
      return NextResponse.json({ ok: false, error: 'Missing required fields: guestId, loungeId' }, { status: 400 });
    }

    let guestProfile = getGuestProfile(guestId);
    if (!guestProfile) {
      guestProfile = {
        guestId,
        anon: true,
        lastLoungeId: loungeId,
        badges: [],
        sessions: [],
        points: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        preferences: { favoriteFlavors: [], savedMixes: [], notifications: false },
      };
      setGuestProfile(guestId, guestProfile);
    }

    const sessionId = `session_${uuidv4()}`;
    const session = {
      sessionId,
      guestId,
      loungeId,
      tableId: tableId || undefined,
      zone: zone || undefined,
      sessionType: sessionType || 'flat',
      duration: duration ?? undefined,
      status: 'pending',
      mix: { flavors: flavors || [], specialInstructions: specialInstructions || undefined },
      price: { base: 0, addons: 0, total: 0, currency: 'USD' },
      ts: { createdAt: new Date().toISOString(), startedAt: undefined, closedAt: undefined },
    };

    sharedSessions.set(sessionId, session);

    const flavorList = session.mix?.flavors || [];
    const isCodigo = loungeId === 'CODIGO';
    let basePrice = 0;

    if (session.sessionType === 'time-based') {
      const durationMinutes = session.duration ?? 60;
      basePrice = Math.round(durationMinutes * 50);
      const flavorPrices = flavorList.map((f: string) => FLAVOR_PRICES[f] || 0);
      basePrice += flavorPrices.reduce((a: number, b: number) => a + b, 0);
    } else {
      if (isCodigo) {
        basePrice = 6000;
      } else {
        const flavorPrices = flavorList.map((f: string) => FLAVOR_PRICES[f] || 0);
        basePrice = flavorPrices.length > 0 ? Math.max(3000, Math.max(...flavorPrices)) : 3000;
      }
    }

    const addons = calculateAddons(session);
    let subtotal = basePrice + addons;

    let campaignDiscount = 0;
    let campaignInfo: any = undefined;
    if (campaignId) {
      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
        const r = await fetch(`${appUrl}/api/campaigns/${campaignId}/apply`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, customerRef: guestId, subtotalCents: subtotal }),
        });
        if (r.ok) {
          const d = await r.json();
          if (d.success) {
            campaignDiscount = d.discountCents || 0;
            campaignInfo = { id: campaignId, discount: campaignDiscount, discountAmount: d.discountAmount || 0 };
          }
        }
      } catch {
        // campaign optional
      }
    }

    let promo: any = undefined;
    if (promoCode && !campaignInfo) {
      promo = applyPromoCode(promoCode, subtotal);
    }

    const discount = campaignDiscount || (promo ? promo.discount : 0);
    const total = Math.max(0, subtotal - discount);

    (session as any).price = {
      base: basePrice,
      addons,
      total,
      currency: 'USD',
      promo,
      campaign: campaignInfo,
    };

    const breakdown = createPriceBreakdown(flavorList, basePrice, addons, promo, campaignInfo, session.sessionType);

    const response: PriceQuoteResponse = {
      base: basePrice,
      addons,
      total,
      currency: 'USD',
      promo,
      campaign: campaignInfo,
      breakdown,
    };

    return NextResponse.json({
      ok: true,
      sessionId,
      session,
      ...response,
    });
  } catch (error) {
    console.error('[create-and-quote] Error:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
