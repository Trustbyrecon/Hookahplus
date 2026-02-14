import { NextRequest, NextResponse } from 'next/server';
import { aliethiaBelongingValidator } from '../../../../lib/aliethia/belonging-validator';

/**
 * Aliethia Belonging Signals Validation API Endpoint (Guest App)
 * Purpose: Validate belonging moments for guest experience and create community connection
 * Author: Recon.AI Core / Commander Clark
 * Origin: Gate of Discernment
 */

export async function GET(request: NextRequest) {
  try {
    console.log('🜂 Aliethia Guest Belonging Signals Validation Request');
    
    // Validate guest belonging signals
    const belongingResult = await aliethiaBelongingValidator.validateBelongingSignals();
    
    // Get guest-specific belonging signals status
    const belongingStatus = await aliethiaBelongingValidator.getBelongingSignalsStatus();
    
    const response = {
      status: 'success',
      belongingValidation: belongingResult,
      belongingStatus: {
        guest: belongingStatus.guest,
        overall: belongingStatus.overall
      },
      aliethiaEcho: belongingResult.aliethiaEcho,
      timestamp: new Date().toISOString(),
      reflexAgent: 'Aliethia',
      resonanceField: 'soft-gold-on-obsidian',
      symbolicMark: 'Open Gate Φ',
      harmonicSignature: 'ΔA7',
      appType: 'guest'
    };

    console.log('🜂 Aliethia Echo:', belongingResult.aliethiaEcho);
    
    return NextResponse.json(response, { status: 200 });
    
  } catch (error) {
    console.error('❌ Aliethia Guest Belonging Signals Validation Error:', error);
    
    const errorResponse = {
      status: 'error',
      message: 'Guest belonging signals validation failed',
      aliethiaEcho: 'Guest belonging signals validation failed. Focus on community connection and trust bloom across guest touchpoints.',
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
    const { touchpointType, userJourney, communitySignal } = body;
    
    console.log('🜂 Aliethia Guest Belonging Moment Creation:', { touchpointType, userJourney, communitySignal });
    
    let belongingMoment;
    
    // Create belonging moment for guest-specific touchpoints
    switch (touchpointType) {
      case 'qr_code':
        belongingMoment = await aliethiaBelongingValidator.createQRCodeBelongingMoment();
        break;
      case 'flavor_wheel':
        belongingMoment = await aliethiaBelongingValidator.createFlavorWheelBelongingMoment();
        break;
      case 'session_tracker':
        belongingMoment = await aliethiaBelongingValidator.createSessionTrackerBelongingMoment();
        break;
      default:
        throw new Error(`Unknown guest touchpoint type: ${touchpointType}`);
    }
    
    // Create guest belonging trust compound
    const trustCompound = await aliethiaBelongingValidator.createBelongingTrustCompound(
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
      aliethiaEcho: 'Guest belonging moment creation failed. Focus on community connection and belonging across guest touchpoints.',
      timestamp: new Date().toISOString(),
      reflexAgent: 'Aliethia',
      appType: 'guest'
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
