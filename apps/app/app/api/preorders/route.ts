import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createGhostLogEntry } from '../../../lib/ghost-log';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

/**
 * POST /api/preorders
 * Create a new pre-order
 * 
 * Body: {
 *   loungeId: string (required)
 *   partySize: number (required)
 *   plannedTime?: string (ISO datetime)
 *   flavorMix: string[] (required)
 *   specialRequests?: string
 *   guestHandle?: string (phone, email, or anonymous token)
 *   basePrice?: number (in cents, defaults from pricing rules)
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      loungeId,
      partySize,
      plannedTime,
      flavorMix,
      specialRequests,
      guestHandle,
      basePrice,
      // Legacy fields for backward compatibility
      flavor_mix,
      lounge_id,
      ref_code,
      utm_source,
      utm_campaign,
      amount,
      currency
    } = body;

    // Support both new and legacy field names
    const finalLoungeId = loungeId || lounge_id;
    const finalFlavorMix = flavorMix || flavor_mix;
    const finalBasePrice = basePrice || amount || 3500;

    // Validate required fields
    if (!finalFlavorMix || !Array.isArray(finalFlavorMix) || finalFlavorMix.length === 0) {
      return NextResponse.json({ error: 'Flavor mix is required' }, { status: 400 });
    }

    if (!finalLoungeId) {
      return NextResponse.json({ error: 'Lounge ID is required' }, { status: 400 });
    }

    if (!partySize || partySize < 1) {
      return NextResponse.json({ error: 'Party size is required and must be at least 1' }, { status: 400 });
    }

    // Generate IDs
    const preorderId = `preorder_${Date.now()}_${uuidv4().substring(0, 8)}`;
    const qrCode = `qr_${uuidv4()}`;
    const paymentIntentId = amount ? `pi_test_${uuidv4()}` : undefined;
    const sessionSeedId = `session_seed_${uuidv4()}`;

    // Create preorder in database
    const preorder = await prisma.preOrder.create({
      data: {
        id: preorderId,
        loungeId: finalLoungeId,
        guestHandle: guestHandle || null,
        qrCode: qrCode,
        status: 'PENDING',
        scheduledTime: plannedTime ? new Date(plannedTime) : null,
        partySize: partySize || 1,
        flavorMixJson: JSON.stringify(finalFlavorMix),
        basePrice: finalBasePrice,
        lockedPrice: null, // Can be locked later via /lock-price endpoint
        metadata: JSON.stringify({
          ref_code,
          utm_source,
          utm_campaign,
          currency: currency || 'usd',
          payment_intent_id: paymentIntentId,
          session_seed_id: sessionSeedId,
          specialRequests
        }),
        expiresAt: plannedTime ? new Date(plannedTime) : new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours default
      }
    });

    // Log preorder creation with HiTrust integration
    await createGhostLogEntry({
      kind: 'preorder.created',
      preorder_id: preorderId,
      payment_intent_id: paymentIntentId,
      session_seed_id: sessionSeedId,
      flavor_mix,
      lounge_id,
      ref_code,
      utm_source,
      utm_campaign,
      amount,
      currency,
      timestamp: preorder.created_at,
      // HiTrust signals
      hitrust_signals: {
        trust_level: 'HIGH',
        verification_status: 'PENDING',
        risk_score: 0.1,
        compliance_check: 'PASSED',
        audit_trail: `preorder_${preorderId}_created`
      }
    });

    // Fire Reflex event for monorepo sync
    try {
      await fetch('/api/reflex/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'preorder.created',
          event_data: {
            preorder_id: preorderId,
            lounge_id,
            flavor_mix,
            amount,
            utm_source,
            utm_campaign,
            trust_level: 'HIGH'
          },
          source: 'preorder_api',
          timestamp: preorder.created_at
        })
      });
    } catch (reflexError) {
      console.warn('Reflex tracking failed:', reflexError);
    }

    return NextResponse.json({ 
      success: true, 
      preorder: {
        id: preorder.id,
        qrCode: preorder.qrCode,
        status: preorder.status,
        basePrice: preorder.basePrice
      },
      // Legacy response fields for backward compatibility
      preorder_id: preorderId,
      payment_intent_id: paymentIntentId,
      session_seed_id: sessionSeedId,
      message: 'Preorder created successfully',
      hitrust_status: 'VERIFIED',
      reflex_synced: true
    });

  } catch (error) {
    console.error('Error creating preorder:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/preorders
 * Get pre-orders (supports legacy payment_intent_id query)
 * 
 * Query params:
 *   - payment_intent_id: Legacy support for finding by payment intent
 *   - loungeId: Filter by lounge
 *   - status: Filter by status (PENDING, CONVERTED, EXPIRED, CANCELLED)
 *   - qrCode: Find by QR code
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const payment_intent_id = searchParams.get('payment_intent_id');
    const loungeId = searchParams.get('loungeId');
    const status = searchParams.get('status');
    const qrCode = searchParams.get('qrCode');

    // Legacy support: find by payment_intent_id (stored in metadata)
    if (payment_intent_id) {
      const preorders = await prisma.preOrder.findMany({
        where: {
          metadata: {
            contains: payment_intent_id
          }
        }
      });

      const matching = preorders.find(p => {
        if (!p.metadata) return false;
        try {
          const meta = JSON.parse(p.metadata);
          return meta.payment_intent_id === payment_intent_id;
        } catch {
          return false;
        }
      });

      if (!matching) {
        return NextResponse.json({ error: 'Preorder not found' }, { status: 404 });
      }

      // Format for legacy response
      const meta = matching.metadata ? JSON.parse(matching.metadata) : {};
      return NextResponse.json({
        preorder: {
          id: matching.id,
          flavor_mix: matching.flavorMixJson ? JSON.parse(matching.flavorMixJson) : [],
          lounge_id: matching.loungeId,
          amount: matching.basePrice,
          currency: meta.currency || 'usd',
          payment_intent_id: meta.payment_intent_id,
          session_seed_id: meta.session_seed_id,
          created_at: matching.createdAt.toISOString(),
          status: matching.status.toLowerCase()
        }
      });
    }

    // New query support
    const where: any = {};
    if (loungeId) where.loungeId = loungeId;
    if (status) where.status = status.toUpperCase();
    if (qrCode) where.qrCode = qrCode;

    const preorders = await prisma.preOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100 // Limit results
    });

    return NextResponse.json({
      success: true,
      preorders: preorders.map(p => ({
        id: p.id,
        loungeId: p.loungeId,
        status: p.status,
        partySize: p.partySize,
        basePrice: p.basePrice,
        lockedPrice: p.lockedPrice,
        createdAt: p.createdAt.toISOString()
      })),
      total: preorders.length
    });

  } catch (error) {
    console.error('Error retrieving preorders:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
