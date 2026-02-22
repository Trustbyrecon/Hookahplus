import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ partnerId: string }> }
) {
  try {
    const { partnerId } = await params;
    const body = await req.json();
    const { customCode, expiresAt, maxUses } = body;

    // Generate referral code
    const code = customCode || `ref_${uuidv4().substring(0, 8)}`;
    
    // Create referral URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://hookahplus-app-prod.vercel.app';
    const referralUrl = `${baseUrl}/partner/${partnerId}/ref/${code}`;

    // TODO: Store in database
    const referralData = {
      code,
      partnerId,
      url: referralUrl,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt || null,
      maxUses: maxUses || null,
      uses: 0,
      isActive: true
    };

    // Log to GhostLog for tracking
    console.log('Referral link created:', {
      partnerId,
      code,
      url: referralUrl,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      referral: referralData
    });

  } catch (error) {
    console.error('Create referral error:', error);
    return NextResponse.json(
      { error: 'Failed to create referral link' },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ partnerId: string }> }
) {
  try {
    const { partnerId } = await params;
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'active';

    // TODO: Query database for partner's referrals
    const mockReferrals = [
      {
        code: 'ref_abc123',
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://hookahplus-app-prod.vercel.app'}/partner/${partnerId}/ref/ref_abc123`,
        createdAt: '2025-01-01T00:00:00Z',
        uses: 5,
        isActive: true
      },
      {
        code: 'ref_def456',
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://hookahplus-app-prod.vercel.app'}/partner/${partnerId}/ref/ref_def456`,
        createdAt: '2025-01-15T00:00:00Z',
        uses: 12,
        isActive: true
      }
    ];

    return NextResponse.json({
      success: true,
      referrals: mockReferrals
    });

  } catch (error) {
    console.error('Get referrals error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch referrals' },
      { status: 500 }
    );
  }
}
