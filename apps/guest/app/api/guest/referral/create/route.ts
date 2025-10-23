import { NextRequest, NextResponse } from 'next/server';
import { ReferralCreateRequest, ReferralCreateResponse, ReferralLink } from '../../../../../types/guest';
import { featureFlags } from './flags';
import { createGhostLogEntry } from './hash';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';

// Mock data stores
const referralLinks = new Map<string, ReferralLink>();
const referralAnalytics = new Map<string, any>();

/**
 * POST /api/guest/referral/create
 * 
 * Creates a referral link and QR code
 */
export async function POST(req: NextRequest) {
  try {
    const body: ReferralCreateRequest = await req.json();
    const { loungeId, inviterGuestId, connectorId } = body;

    // Validate required fields
    if (!loungeId) {
      return NextResponse.json({
        ok: false,
        error: 'Missing required field: loungeId'
      }, { status: 400 });
    }

    // Get feature flags
    const flags = featureFlags.getLoungeFlags(loungeId);

    // Check if referral features are enabled
    if (!flags.referral.qr.v1) {
      return NextResponse.json({
        ok: false,
        error: 'Referral features are not enabled for this lounge'
      }, { status: 403 });
    }

    // Generate referral code
    const code = generateReferralCode();
    
    // Create referral link
    const referralLink: ReferralLink = {
      code,
      connectorId,
      inviterGuestId,
      loungeId,
      clicks: 0,
      joins: 0,
      rewards: 0,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      isActive: true
    };

    // Store referral link
    referralLinks.set(code, referralLink);

    // Generate QR code URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://hookahplus.net';
    const qrUrl = `${baseUrl}/guest/${loungeId}?ref=${code}`;

    // Generate QR code image
    let qrCodeImage: string;
    try {
      qrCodeImage = await QRCode.toDataURL(qrUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    } catch (error) {
      console.error('QR code generation error:', error);
      qrCodeImage = ''; // Fallback to empty string
    }

    // Log referral creation event
    if (flags.ghostlog.lite) {
      const eventPayload = {
        code,
        loungeId,
        inviterGuestId,
        connectorId,
        qrUrl,
        timestamp: new Date().toISOString()
      };

      const ghostLogEntry = createGhostLogEntry({
        eventType: 'referral.created',
        ...eventPayload
      });
      console.log('Referral creation logged:', ghostLogEntry);
    }

    const response: ReferralCreateResponse = {
      url: qrUrl,
      code,
      qrCode: qrCodeImage
    };

    return NextResponse.json({
      ok: true,
      ...response
    });

  } catch (error) {
    console.error('Referral creation error:', error);
    
    return NextResponse.json({
      ok: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

/**
 * GET /api/guest/referral/create
 * 
 * Gets referral analytics for a guest or connector
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const guestId = searchParams.get('guestId');
    const connectorId = searchParams.get('connectorId');
    const loungeId = searchParams.get('loungeId');

    if (!guestId && !connectorId) {
      return NextResponse.json({
        ok: false,
        error: 'Missing guestId or connectorId parameter'
      }, { status: 400 });
    }

    // Get feature flags
    const flags = loungeId ? featureFlags.getLoungeFlags(loungeId) : featureFlags.getLoungeFlags('default');

    if (!flags.referral.qr.v1) {
      return NextResponse.json({
        ok: false,
        error: 'Referral features are not enabled'
      }, { status: 403 });
    }

    // Find referral links for this guest or connector
    const userReferrals: ReferralLink[] = [];
    for (const [code, referral] of referralLinks.entries()) {
      if ((guestId && referral.inviterGuestId === guestId) || 
          (connectorId && referral.connectorId === connectorId)) {
        userReferrals.push(referral);
      }
    }

    // Calculate analytics
    const totalClicks = userReferrals.reduce((sum, ref) => sum + ref.clicks, 0);
    const totalJoins = userReferrals.reduce((sum, ref) => sum + ref.joins, 0);
    const totalRewards = userReferrals.reduce((sum, ref) => sum + ref.rewards, 0);
    const conversionRate = totalClicks > 0 ? (totalJoins / totalClicks) * 100 : 0;

    const analytics = {
      totalReferrals: userReferrals.length,
      totalClicks,
      totalJoins,
      totalRewards,
      conversionRate: Math.round(conversionRate * 100) / 100,
      referrals: userReferrals.map((ref: any) => ({
        code: ref.code,
        clicks: ref.clicks,
        joins: ref.joins,
        rewards: ref.rewards,
        createdAt: ref.createdAt,
        isActive: ref.isActive
      }))
    };

    return NextResponse.json({
      ok: true,
      analytics
    });

  } catch (error) {
    console.error('Get referral analytics error:', error);
    
    return NextResponse.json({
      ok: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

/**
 * Generate a short, unique referral code
 */
function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  // Generate 6-character code
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // Check if code already exists
  if (referralLinks.has(result)) {
    return generateReferralCode(); // Recursive call to generate new code
  }
  
  return result;
}

/**
 * Track referral click
 */
async function trackReferralClick(code: string, loungeId: string): Promise<void> {
  const referral = referralLinks.get(code);
  if (referral) {
    referral.clicks++;
    referralLinks.set(code, referral);
    
    // Log click event
    console.log(`Referral click tracked: ${code} at lounge ${loungeId}`);
  }
}

/**
 * Track referral join
 */
async function trackReferralJoin(code: string, guestId: string, loungeId: string): Promise<void> {
  const referral = referralLinks.get(code);
  if (referral) {
    referral.joins++;
    
    // Award points to referrer
    const pointsAwarded = 50; // 50 points per successful referral
    referral.rewards += pointsAwarded;
    
    referralLinks.set(code, referral);
    
    // Award points to inviter if it's a guest referral
    if (referral.inviterGuestId) {
      // In production, update guest profile with points
      console.log(`Awarded ${pointsAwarded} points to guest ${referral.inviterGuestId} for referral ${code}`);
    }
    
    // Log join event
    console.log(`Referral join tracked: ${code} by guest ${guestId} at lounge ${loungeId}`);
  }
}
