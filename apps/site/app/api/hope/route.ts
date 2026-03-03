import { NextRequest, NextResponse } from 'next/server';
import { sendHopeLeadNotification } from '../../../lib/email';
import { prisma } from '../../../lib/db';
import crypto from 'crypto';

// Helper function to generate TrustEvent ID
function generateTrustEventId(sequence: number): string {
  const year = new Date().getFullYear();
  return `TE-${year}-${String(sequence).padStart(6, '0')}`;
}

// Create REM-compliant TrustEvent payload for onboarding
function createREMCompliantOnboardingEvent(
  payload: any,
  ip: string,
  userAgent?: string,
  source: string = 'manual'
): any {
  const sequence = Date.now() % 1000000;
  const now = new Date();
  
  // Hash email/IP for PII minimal actor
  const emailHash = payload.email ? 
    `sha256:${crypto.createHash('sha256').update(payload.email).digest('hex')}` :
    `sha256:${crypto.createHash('sha256').update(ip).digest('hex')}`;
  
  // Hash IP for security
  const ipHash = `sha256:${crypto.createHash('sha256').update(ip).digest('hex')}`;
  
  // Create signature from payload
  const signaturePayload = JSON.stringify(payload);
  const signature = `ed25519:${crypto.createHash('sha256').update(signaturePayload).digest('hex')}`;
  
  return {
    id: generateTrustEventId(sequence),
    ts_utc: now.toISOString(),
    type: 'fast_checkout',
    actor: {
      anon_hash: emailHash,
      device_id: userAgent || source,
    },
    context: {
      vertical: 'hookah',
      time_local: now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    },
    behavior: {
      action: 'onboarding.signup',
      payload: {
        businessName: payload.businessName,
        ownerName: payload.ownerName,
        email: payload.email,
        phone: payload.phone,
        location: payload.location,
        stage: payload.stage || 'intake',
        source: payload.source || 'hope_global_forum',
        createdAt: payload.createdAt,
        notes: payload.notes || [],
      },
    },
    effect: {
      loyalty_delta: 0,
      credit_type: 'HPLUS_CREDIT',
    },
    security: {
      signature: signature,
      device_id: userAgent || source,
      ip_hash: ipHash,
    },
  };
}

// Handle email submissions from Hope Global Forum landing page
// Creates leads directly in Operator Onboarding Management database
// Sends email notifications to admin and connector
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

    // Prepare lead data
    const leadData = {
      businessName: 'Hope Global Forum Contact',
      ownerName: email.split('@')[0], // Use email prefix as name placeholder
      email: email,
      phone: '',
      location: '',
      stage: 'intake',
      source: 'hope_global_forum',
      createdAt: new Date().toISOString(),
      notes: 'Contact from Hope Global Forum landing page - interested in pilot summary',
    };

    // Create lead directly in database
    let createdEventId: string | null = null;
    try {
      console.log('[Hope Landing] Creating lead directly in database...');
      
      // Get IP and user agent
      // Ensure these are never undefined (use safe defaults)
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                 req.headers.get('x-real-ip') || 
                 '0.0.0.0';
      const userAgent = req.headers.get('user-agent') || 'manual-entry';
      
      // Create REM-compliant TrustEvent payload
      const remPayload = createREMCompliantOnboardingEvent(leadData, ip, userAgent, 'hope_global_forum');
      
      // Determine CTA source
      const ctaSource = 'website'; // Hope landing page is website source
      
      // Use raw SQL directly since ctaSource, ctaType fields are not in root Prisma schema
      const referrer = req.headers.get('referer') || req.headers.get('referrer') || null;
      
      try {
        // Use raw SQL to insert with all extended fields
        const insertResult = await prisma.$queryRawUnsafe(`
          INSERT INTO reflex_events (
            id, type, source, payload, "ctaSource", "ctaType", 
            "userAgent", ip, referrer, "campaignId", metadata, "createdAt"
          )
          VALUES (
            gen_random_uuid()::text,
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8,
            $9,
            $10,
            NOW()
          )
          RETURNING id, type, source, "createdAt"
        `,
          'onboarding.signup',
          'ui',
          JSON.stringify(remPayload),
          ctaSource,
          'onboarding_signup',
          userAgent,
          ip,
          referrer,
          null, // campaignId
          null  // metadata
        ) as any[];
        
        if (insertResult && insertResult.length > 0) {
          createdEventId = insertResult[0].id;
          console.log('[Hope Landing] ✅ Lead created via raw SQL:', createdEventId);
        } else {
          throw new Error('Raw SQL insert returned no rows');
        }
      } catch (sqlError: any) {
        // Fallback: try a minimal raw SQL insert without extended fields
        console.warn('[Hope Landing] Raw SQL failed, trying minimal insert:', sqlError?.message);
        try {
          const insertResult = await prisma.$queryRawUnsafe(`
            INSERT INTO reflex_events (
              id, type, source, payload, "userAgent", ip, "createdAt"
            )
            VALUES (
              gen_random_uuid()::text,
              $1,
              $2,
              $3,
              $4,
              $5,
              NOW()
            )
            RETURNING id
          `,
            'onboarding.signup',
            'ui',
            JSON.stringify(remPayload),
            userAgent,
            ip
          ) as any[];

          if (insertResult && insertResult.length > 0) {
            createdEventId = insertResult[0].id;
            console.log('[Hope Landing] ✅ Lead created via minimal insert:', createdEventId);
          } else {
            throw new Error('Minimal insert returned no rows');
          }
        } catch (fallbackError: any) {
          throw new Error(`Failed to create lead: ${fallbackError?.message || 'Unknown error'}`);
        }
      }
    } catch (leadError) {
      console.error('[Hope Landing] ❌ Error creating lead:', {
        error: leadError instanceof Error ? leadError.message : 'Unknown error',
        stack: leadError instanceof Error ? leadError.stack : undefined,
      });
      // Continue anyway - email notifications will still be sent
    }

    // Send email notifications to admin and connector (non-blocking)
    try {
      const submissionTime = new Date().toLocaleString('en-US', {
        timeZone: 'America/New_York',
        dateStyle: 'full',
        timeStyle: 'long'
      });
      
      const emailResult = await sendHopeLeadNotification({
        email: email,
        source: 'hope_global_forum',
        submissionTime: submissionTime,
      });
      
      if (emailResult.success) {
        console.log('[Hope Landing] ✅ Email notifications sent successfully');
      } else {
        console.warn('[Hope Landing] ⚠️ Some email notifications failed (non-blocking):', emailResult);
      }
    } catch (emailError) {
      console.error('[Hope Landing] ❌ Failed to send email notifications (non-blocking):', emailError);
      // Continue anyway - email failure shouldn't block the submission
    }

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

