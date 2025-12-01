import { NextRequest, NextResponse } from 'next/server';

// Handle email submissions from Hope Global Forum landing page
// Creates leads in Operator Onboarding Management
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    console.log('[Hope Landing] Email submission:', { email, source: 'hope_global_forum' });

    // Create lead in Operator Onboarding Management via app API
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
    
    try {
      const onboardingResponse = await fetch(`${appUrl}/api/admin/operator-onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_lead',
          leadData: {
            businessName: 'Hope Global Forum Contact',
            ownerName: email.split('@')[0], // Use email prefix as name placeholder
            email: email,
            phone: '',
            location: '',
            stage: 'intake',
            source: 'hope_global_forum',
            createdAt: new Date().toISOString(),
            notes: 'Contact from Hope Global Forum landing page - interested in pilot summary',
          },
        }),
      });

      if (onboardingResponse.ok) {
        const onboardingData = await onboardingResponse.json();
        console.log('[Hope Landing] Lead created successfully:', onboardingData);
      } else {
        const errorData = await onboardingResponse.json().catch(() => ({}));
        console.warn('[Hope Landing] Failed to create lead (non-blocking):', errorData);
        // Continue anyway - we'll still return success to user
      }
    } catch (leadError) {
      console.error('[Hope Landing] Error creating lead (non-blocking):', leadError);
      // Continue anyway - lead can be created manually later if needed
    }

    // Send confirmation email (optional - can be added later)
    // For now, we'll just return success

    return NextResponse.json({
      success: true,
      message: 'Thank you! We\'ll send you our 1-page pilot summary shortly.',
    });

  } catch (error) {
    console.error('[Hope Landing] Error processing submission:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process submission. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

