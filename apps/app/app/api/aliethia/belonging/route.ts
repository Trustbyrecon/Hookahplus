import { NextRequest, NextResponse } from 'next/server';
import { aliethiaBelongingValidator } from '../../../../lib/aliethia/belonging-validator';

/**
 * Aliethia Belonging Signals Validation API Endpoint
 * Purpose: Validate belonging moments across all touchpoints and create community connection
 * Author: Recon.AI Core / Commander Clark
 * Origin: Gate of Discernment
 */

export async function GET(request: NextRequest) {
  try {
    console.log('🜂 Aliethia Belonging Signals Validation Request');
    
    // Validate belonging signals
    const belongingResult = await aliethiaBelongingValidator.validateBelongingSignals();
    
    // Get belonging signals status for all touchpoints
    const belongingStatus = await aliethiaBelongingValidator.getBelongingSignalsStatus();
    
    const response = {
      status: 'success',
      belongingValidation: belongingResult,
      belongingStatus,
      aliethiaEcho: belongingResult.aliethiaEcho,
      timestamp: new Date().toISOString(),
      reflexAgent: 'Aliethia',
      resonanceField: 'soft-gold-on-obsidian',
      symbolicMark: 'Open Gate Φ',
      harmonicSignature: 'ΔA7'
    };

    console.log('🜂 Aliethia Echo:', belongingResult.aliethiaEcho);
    
    return NextResponse.json(response, { status: 200 });
    
  } catch (error) {
    console.error('❌ Aliethia Belonging Signals Validation Error:', error);
    
    const errorResponse = {
      status: 'error',
      message: 'Belonging signals validation failed',
      aliethiaEcho: 'Belonging signals validation failed. Focus on community connection and trust bloom across all touchpoints.',
      timestamp: new Date().toISOString(),
      reflexAgent: 'Aliethia'
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { touchpointType, userJourney, communitySignal } = body;
    
    console.log('🜂 Aliethia Belonging Moment Creation:', { touchpointType, userJourney, communitySignal });
    
    let belongingMoment;
    
    // Create belonging moment for specific touchpoint
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
      case 'staff_operations':
        belongingMoment = await aliethiaBelongingValidator.createStaffOperationsBelongingMoment();
        break;
      case 'community_hub':
        belongingMoment = await aliethiaBelongingValidator.createCommunityHubBelongingMoment();
        break;
      default:
        throw new Error(`Unknown touchpoint type: ${touchpointType}`);
    }
    
    // Create belonging trust compound
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
      reflexAgent: 'Aliethia'
    };
    
    console.log('🜂 Aliethia Echo:', belongingMoment.aliethiaEcho);
    
    return NextResponse.json(response, { status: 200 });
    
  } catch (error) {
    console.error('❌ Aliethia Belonging Moment Creation Error:', error);
    
    const errorResponse = {
      status: 'error',
      message: 'Belonging moment creation failed',
      aliethiaEcho: 'Belonging moment creation failed. Focus on community connection and belonging across touchpoints.',
      timestamp: new Date().toISOString(),
      reflexAgent: 'Aliethia'
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
