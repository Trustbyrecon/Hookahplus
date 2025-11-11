import { NextRequest, NextResponse } from 'next/server';
import { sendContactConfirmation, sendDemoRequestConfirmation } from '../../../lib/email';

// Note: This endpoint handles demo requests from the contact form
// Creates leads in Operator Onboarding Management via ReflexEvent
// Sends confirmation emails via Resend

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, data } = body;

    if (action === 'onboarding_submission') {
      // Create lead in Operator Onboarding Management
      console.log('[Onboarding Submission] Creating lead in Operator Onboarding:', {
        businessName: data.businessName,
        ownerName: data.ownerName,
        email: data.email,
        location: data.location
      });

      try {
        // Create lead in Operator Onboarding via app API
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
        console.log('[Onboarding Submission] Connecting to app build at:', appUrl);
        
        const onboardingResponse = await fetch(`${appUrl}/api/admin/operator-onboarding`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create_lead',
            leadData: {
              businessName: data.businessName || 'Unknown Business',
              ownerName: data.ownerName || '',
              email: data.email,
              phone: data.phone || '',
              location: data.location || '',
              stage: 'intake', // Onboarding submission is further along
              source: 'website',
              createdAt: new Date().toISOString()
            }
          })
        });

        if (onboardingResponse.ok) {
          const result = await onboardingResponse.json();
          console.log('[Onboarding Submission] Lead created in Operator Onboarding:', result.leadId);
        } else {
          const errorText = await onboardingResponse.text();
          console.warn('[Onboarding Submission] Failed to create lead in Operator Onboarding:', {
            status: onboardingResponse.status,
            statusText: onboardingResponse.statusText,
            error: errorText
          });
        }
      } catch (onboardingError) {
        console.error('[Onboarding Submission] Error creating lead in Operator Onboarding:', {
          error: onboardingError instanceof Error ? onboardingError.message : 'Unknown error',
          stack: onboardingError instanceof Error ? onboardingError.stack : undefined,
          appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'
        });
        // Continue anyway - we'll still return success to user
      }

      // Send confirmation email
      try {
        await sendContactConfirmation(data.email, data.ownerName || data.businessName);
      } catch (emailError) {
        console.error('[Onboarding Submission] Failed to send confirmation email:', emailError);
        // Continue anyway - email failure shouldn't block the submission
      }

      return NextResponse.json({ 
        success: true,
        message: 'Onboarding completed successfully! Redirecting to lounge layout...'
      });
    }

    if (action === 'request_demo') {
      // Create lead in Operator Onboarding Management
      console.log('[Demo Request] Creating lead in Operator Onboarding:', {
        name: data.name,
        email: data.email,
        loungeName: data.loungeName,
        location: data.location
      });

      try {
        // Create lead in Operator Onboarding via app API
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
        console.log('[Demo Request] Connecting to app build at:', appUrl);
        
        const onboardingResponse = await fetch(`${appUrl}/api/admin/operator-onboarding`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create_lead',
            leadData: {
              businessName: data.loungeName || data.company || 'Unknown Business',
              ownerName: data.name,
              email: data.email,
              phone: data.phone || '',
              location: data.location || '',
              stage: 'new-leads',
              source: 'website',
              createdAt: new Date().toISOString()
            }
          })
        });

        if (onboardingResponse.ok) {
          const result = await onboardingResponse.json();
          console.log('[Demo Request] Lead created in Operator Onboarding:', result.leadId);
        } else {
          const errorText = await onboardingResponse.text();
          console.warn('[Demo Request] Failed to create lead in Operator Onboarding:', {
            status: onboardingResponse.status,
            statusText: onboardingResponse.statusText,
            error: errorText
          });
        }
      } catch (onboardingError) {
        console.error('[Demo Request] Error creating lead in Operator Onboarding:', {
          error: onboardingError instanceof Error ? onboardingError.message : 'Unknown error',
          stack: onboardingError instanceof Error ? onboardingError.stack : undefined,
          appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'
        });
        // Continue anyway - we'll still return success to user
      }

      // Send confirmation email
      try {
        await sendDemoRequestConfirmation(data.email, data.name, data.loungeName || data.company);
      } catch (emailError) {
        console.error('[Demo Request] Failed to send confirmation email:', emailError);
        // Continue anyway - email failure shouldn't block the submission
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

