import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import crypto from 'crypto';

/**
 * POST /api/lead-magnets/download
 * 
 * Track lead magnet downloads and create CTA events
 */
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '0.0.0.0';
    const userAgent = req.headers.get('user-agent') || '';
    const referrer = req.headers.get('referer') || req.headers.get('referrer') || null;

    const body = await req.json();
    const {
      email,
      name,
      leadMagnetId, // 'operations-checklist' | 'increase-turnover' | 'roi-template'
      metadata
    } = body;

    // Validation
    if (!email || !leadMagnetId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: email, leadMagnetId'
      }, { status: 400 });
    }

    // Validate leadMagnetId
    const validLeadMagnets = ['operations-checklist', 'increase-turnover', 'roi-template'];
    if (!validLeadMagnets.includes(leadMagnetId)) {
      return NextResponse.json({
        success: false,
        error: `Invalid leadMagnetId. Must be one of: ${validLeadMagnets.join(', ')}`
      }, { status: 400 });
    }

    // Build payload
    const payload = {
      ctaSource: 'website',
      ctaType: 'lead_magnet_download',
      data: {
        email,
        name: name || undefined
      },
      metadata: {
        ...metadata,
        leadMagnetId,
        timestamp: new Date().toISOString()
      },
      referrer,
      page: metadata?.page || null,
      component: metadata?.component || 'LeadMagnetPage'
    };

    // Create payload hash for deduplication
    const payloadStr = JSON.stringify(payload);
    const payloadHash = crypto.createHash('sha256').update(payloadStr).digest('hex').slice(0, 64);

    // Check for duplicates (same email + leadMagnetId in last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const duplicate = await prisma.reflexEvent.findFirst({
      where: {
        type: 'cta.lead_magnet_download',
        payloadHash,
        createdAt: { gt: oneDayAgo }
      },
      select: { id: true }
    });

    if (duplicate) {
      // Still return download URL but mark as duplicate
      return NextResponse.json({
        success: true,
        id: duplicate.id,
        deduped: true,
        downloadUrl: getDownloadUrl(leadMagnetId),
        message: 'Download already tracked (deduped)'
      });
    }

    // Create ReflexEvent
    const event = await prisma.reflexEvent.create({
      data: {
        type: 'cta.lead_magnet_download',
        source: 'ui',
        payload: payloadStr,
        payloadHash,
        ctaSource: 'website',
        ctaType: 'lead_magnet_download',
        referrer,
        metadata: metadata ? JSON.stringify(metadata) : null,
        userAgent,
        ip
      }
    });

    // Log success
    console.log(`[Lead Magnet] Created event ${event.id} for ${leadMagnetId} download`);

    return NextResponse.json({
      success: true,
      id: event.id,
      downloadUrl: getDownloadUrl(leadMagnetId),
      message: 'Download tracked successfully'
    });

  } catch (error) {
    console.error('[Lead Magnet Download] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to track download',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Get download URL for lead magnet
 */
function getDownloadUrl(leadMagnetId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  const urls: Record<string, string> = {
    'operations-checklist': `${baseUrl}/lead-magnets/hookah-lounge-operations-checklist.pdf`,
    'increase-turnover': `${baseUrl}/lead-magnets/5-ways-increase-table-turnover.pdf`,
    'roi-template': `${baseUrl}/lead-magnets/roi-calculator-template.xlsx`
  };

  return urls[leadMagnetId] || urls['operations-checklist'];
}

/**
 * GET /api/lead-magnets/download
 * 
 * Get download statistics (for admin dashboard)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const leadMagnetId = searchParams.get('leadMagnetId');
    const days = parseInt(searchParams.get('days') || '30');

    const since = new Date();
    since.setDate(since.getDate() - days);

    const where: any = {
      type: 'cta.lead_magnet_download',
      createdAt: { gte: since }
    };

    if (leadMagnetId) {
      where.metadata = {
        contains: `"leadMagnetId":"${leadMagnetId}"`
      };
    }

    const events = await prisma.reflexEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 1000
    });

    // Aggregate statistics
    const stats = {
      total: events.length,
      byLeadMagnet: {} as Record<string, number>,
      byDay: {} as Record<string, number>
    };

    events.forEach(event => {
      try {
        const payload = event.payload ? JSON.parse(event.payload) : {};
        const magnetId = payload.metadata?.leadMagnetId || 'unknown';
        stats.byLeadMagnet[magnetId] = (stats.byLeadMagnet[magnetId] || 0) + 1;

        const day = event.createdAt.toISOString().split('T')[0];
        stats.byDay[day] = (stats.byDay[day] || 0) + 1;
      } catch (e) {
        // Skip invalid payloads
      }
    });

    return NextResponse.json({
      success: true,
      stats,
      events: events.slice(0, 100) // Return first 100 for preview
    });

  } catch (error) {
    console.error('[Lead Magnet Download] GET Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch download statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

