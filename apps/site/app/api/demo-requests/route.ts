import { NextRequest, NextResponse } from 'next/server';

// Note: This endpoint handles demo requests from the contact form
// In production, this should integrate with Prisma/database
// For now, we'll forward to POS waitlist and log the request

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, data } = body;

    if (action === 'onboarding_submission') {
      // Handle onboarding submission
      console.log('Onboarding submission received:', {
        businessName: data.businessName,
        ownerName: data.ownerName,
        email: data.email,
        phone: data.phone,
        location: data.location,
        seatingTypes: data.seatingTypes,
        totalCapacity: data.totalCapacity,
        numberOfTables: data.numberOfTables,
        averageSessionDuration: data.averageSessionDuration,
        currentPOS: data.currentPOS,
        currentManagementSystem: data.currentManagementSystem,
        integrationNeeds: data.integrationNeeds,
        pricingModel: data.pricingModel,
        preferredFeatures: data.preferredFeatures,
        timestamp: new Date().toISOString()
      });

      // Forward to POS waitlist API if available
      try {
        const waitlistResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/pos-waitlist`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'join_waitlist',
            data: {
              name: data.ownerName,
              email: data.email,
              phone: data.phone,
              loungeName: data.businessName,
              city: data.location,
              currentPOS: data.currentPOS || 'unknown',
              seatingTypes: data.seatingTypes || [],
              totalCapacity: data.totalCapacity || '0',
              numberOfTables: data.numberOfTables || '0',
              pricingModel: data.pricingModel || 'flat-rate',
              preferredFeatures: data.preferredFeatures || [],
              source: 'onboarding_submission'
            }
          })
        });

        if (!waitlistResponse.ok) {
          console.warn('POS waitlist sync failed, but onboarding data logged');
        }
      } catch (waitlistError) {
        console.warn('POS waitlist sync failed:', waitlistError);
        // Continue anyway - onboarding data is still valid
      }

      return NextResponse.json({ 
        success: true,
        message: 'Onboarding completed successfully! Redirecting to lounge layout...'
      });
    }

    if (action === 'request_demo') {
      // Log the demo request (in production, save to database)
      console.log('Demo request received:', {
        name: data.name,
        email: data.email,
        loungeName: data.loungeName,
        location: data.location,
        timestamp: new Date().toISOString()
      });

      // Forward to POS waitlist API if available
      try {
        const waitlistResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/pos-waitlist`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'join_waitlist',
            data: {
              name: data.name,
              email: data.email,
              phone: data.phone,
              loungeName: data.loungeName,
              city: data.location,
              currentPOS: data.currentPOS || 'unknown',
              estimatedRevenue: data.estimatedRevenue || '0',
              source: 'contact_form_demo_request'
            }
          })
        });

        if (!waitlistResponse.ok) {
          console.warn('POS waitlist sync failed, but demo request logged');
        }
      } catch (waitlistError) {
        console.warn('POS waitlist sync failed:', waitlistError);
        // Continue anyway - demo request is still valid
      }

      return NextResponse.json({ 
        success: true,
        message: 'Demo request submitted successfully. Our team will contact you within 24 hours to schedule your personalized demo.'
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Demo request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

