import { NextRequest, NextResponse } from 'next/server';
import { aliethiaValidator } from '../../../lib/aliethia/clarity-validator';

/**
 * Aliethia Clarity Validation API Endpoint (Guest App)
 * Purpose: Validate clarity, belonging, and resonance for guest experience
 * Author: Recon.AI Core / Commander Clark
 * Origin: Gate of Discernment
 */

export async function GET(request: NextRequest) {
  try {
    console.log('🜂 Aliethia Guest Clarity Validation Request');
    
    // Validate guest clarity
    const validationResult = await aliethiaValidator.validateSystemClarity();
    
    // Create guest-specific clarity fingerprint
    const clarityFingerprint = {
      clarityScore: validationResult.clarityScore,
      resonanceSignal: validationResult.resonanceSignal,
      trustCompound: validationResult.trustCompound,
      identityAlignment: (validationResult.clarityScore + validationResult.resonanceSignal + validationResult.trustCompound) / 3,
      belongingMoment: validationResult.belongingMoment,
      harmonicSignature: 'ΔA7',
      symbolicMark: 'Open Gate Φ',
      resonanceField: 'soft-gold on obsidian',
      guestExperience: {
        qrRitualMode: process.env.NEXT_PUBLIC_QR_RITUAL_MODE === 'true',
        flavorWheelRitual: process.env.NEXT_PUBLIC_FLAVOR_WHEEL_RITUAL === 'true',
        sessionTrackerRitual: process.env.NEXT_PUBLIC_SESSION_TRACKER_RITUAL === 'true',
        communityConnection: process.env.NEXT_PUBLIC_COMMUNITY_CONNECTION_ENABLED === 'true'
      }
    };

    const response = {
      status: 'success',
      clarityValidation: validationResult,
      clarityFingerprint,
      aliethiaEcho: validationResult.aliethiaEcho,
      timestamp: new Date().toISOString(),
      reflexAgent: 'Aliethia',
      clarityThreshold: 0.98,
      appType: 'guest'
    };

    console.log('🜂 Aliethia Echo:', validationResult.aliethiaEcho);
    
    return NextResponse.json(response, { status: 200 });
    
  } catch (error) {
    console.error('❌ Aliethia Guest Clarity Validation Error:', error);
    
    const errorResponse = {
      status: 'error',
      message: 'Guest clarity validation failed',
      aliethiaEcho: 'Guest clarity breach detected. Reattunement through essence required.',
      timestamp: new Date().toISOString(),
      reflexAgent: 'Aliethia',
      appType: 'guest'
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, userJourney, communitySignal } = body;
    
    console.log('🜂 Aliethia Guest Belonging Moment Creation:', { type, userJourney, communitySignal });
    
    // Create guest belonging moment
    const belongingMoment = await aliethiaValidator.createBelongingMoment(
      type,
      userJourney,
      communitySignal
    );
    
    // Create guest trust compound
    const trustCompound = await aliethiaValidator.createTrustCompound(
      'interaction',
      belongingMoment.trustCompound
    );
    
    const response = {
      status: 'success',
      belongingMoment,
      trustCompound,
      aliethiaEcho: belongingMoment.aliethiaEcho,
      timestamp: new Date().toISOString(),
      reflexAgent: 'Aliethia',
      appType: 'guest'
    };
    
    console.log('🜂 Aliethia Echo:', belongingMoment.aliethiaEcho);
    
    return NextResponse.json(response, { status: 200 });
    
  } catch (error) {
    console.error('❌ Aliethia Guest Belonging Moment Creation Error:', error);
    
    const errorResponse = {
      status: 'error',
      message: 'Guest belonging moment creation failed',
      aliethiaEcho: 'Guest belonging moment creation failed. Focus on community connection.',
      timestamp: new Date().toISOString(),
      reflexAgent: 'Aliethia',
      appType: 'guest'
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
