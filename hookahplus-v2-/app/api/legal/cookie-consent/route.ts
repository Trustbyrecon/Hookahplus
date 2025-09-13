import { NextRequest, NextResponse } from 'next/server';

interface CookieConsent {
  accepted: boolean;
  timestamp: string;
  trustLockVerified: boolean;
  userAgent?: string;
  ipAddress?: string;
}

// In-memory storage for demo (replace with database in production)
const consentRecords: CookieConsent[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accepted, timestamp, trustLockVerified } = body;

    // Validate Trust-Lock verification
    if (!trustLockVerified) {
      return NextResponse.json(
        { success: false, error: 'Trust-Lock verification required for cookie consent' },
        { status: 403 }
      );
    }

    // Create consent record
    const consent: CookieConsent = {
      accepted,
      timestamp,
      trustLockVerified,
      userAgent: request.headers.get('user-agent') || undefined,
      ipAddress: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown'
    };

    // Store consent record
    consentRecords.push(consent);

    // Log consent with Trust-Lock verification
    console.log('🍪 Cookie consent recorded:', {
      accepted,
      timestamp,
      trustLockVerified,
      ipAddress: consent.ipAddress
    });

    // In production, store in database and send to analytics
    // await storeConsentRecord(consent);
    // await sendToAnalytics(consent);

    return NextResponse.json({
      success: true,
      message: 'Cookie consent recorded successfully',
      data: {
        accepted,
        timestamp,
        trustLockVerified
      }
    });

  } catch (error) {
    console.error('Cookie consent API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record cookie consent' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ipAddress = searchParams.get('ip');

    // Get consent records (in production, query database)
    let records = consentRecords;
    
    if (ipAddress) {
      records = records.filter(record => record.ipAddress === ipAddress);
    }

    // Return latest consent for the IP
    const latestConsent = records
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      [0];

    return NextResponse.json({
      success: true,
      data: {
        hasConsent: !!latestConsent,
        consent: latestConsent ? {
          accepted: latestConsent.accepted,
          timestamp: latestConsent.timestamp,
          trustLockVerified: latestConsent.trustLockVerified
        } : null
      }
    });

  } catch (error) {
    console.error('Cookie consent retrieval error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve cookie consent' },
      { status: 500 }
    );
  }
}

// In production, implement these functions:
// async function storeConsentRecord(consent: CookieConsent) {
//   // Store in database
//   // Update user profile
//   // Set cookie preferences
// }

// async function sendToAnalytics(consent: CookieConsent) {
//   // Send to Google Analytics
//   // Send to other analytics providers
//   // Update tracking preferences
// }
