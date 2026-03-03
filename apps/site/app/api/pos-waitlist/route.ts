import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { source, selectedTier, interest, timestamp, contactType, data } = body;

    console.log(`[POS Waitlist] New public signup from ${source}`, {
      selectedTier,
      interest,
      contactType,
      businessName: data?.businessName,
      email: data?.email
    });

    // Forward to the main app's POS waitlist API
    const appApiUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${appApiUrl}/api/admin/pos-waitlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: `public_${source}`,
        selectedTier,
        interest,
        timestamp,
        contactType,
        ...data
      }),
    });

    if (!response.ok) {
      throw new Error(`App API returned ${response.status}`);
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      waitlistId: result.waitlistId,
      message: 'Successfully added to POS integration waitlist',
      nextSteps: [
        'Our sales team will contact you within 24 hours',
        'We\'ll discuss your specific POS integration needs',
        'You\'ll receive priority access to new POS features'
      ]
    });

  } catch (error) {
    console.error('[POS Waitlist] Public API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to add to waitlist. Please try again or contact support.'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Forward GET request to main app API for admin access
    const appApiUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${appApiUrl}/api/admin/pos-waitlist`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`App API returned ${response.status}`);
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('[POS Waitlist] Public GET Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve waitlist data'
    }, { status: 500 });
  }
}
