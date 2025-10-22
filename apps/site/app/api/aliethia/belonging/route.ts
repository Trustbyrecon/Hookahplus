import { NextRequest, NextResponse } from 'next/server';
import { aliethiaBelongingValidator } from '../../../lib/aliethia/belonging-validator';

/**
 * Aliethia Belonging Signals Validation API Endpoint (Site)
 * Purpose: Validate belonging moments for community connection and create brand resonance
 * Author: Recon.AI Core / Commander Clark
 * Origin: Gate of Discernment
 */

export async function GET(request: NextRequest) {
  try {
    console.log('🜂 Aliethia Site Belonging Signals Validation Request');
    
    // Validate site belonging signals
    const belongingResult = await aliethiaBelongingValidator.validateBelongingSignals();
    
    // Get site-specific belonging signals status
    const belongingStatus = await aliethiaBelongingValidator.getBelongingSignalsStatus();
    
    const response = {
      status: 'success',
      belongingValidation: belongingResult,
      belongingStatus: {
        site: belongingStatus.site,
        overall: belongingStatus.overall
      },
      aliethiaEcho: belongingResult.aliethiaEcho,
      timestamp: new Date().toISOString(),
      reflexAgent: 'Aliethia',
      resonanceField: 'soft-gold-on-obsidian',
      symbolicMark: 'Open Gate Φ',
      harmonicSignature: 'ΔA7',
      appType: 'site'
    };

    console.log('🜂 Aliethia Echo:', belongingResult.aliethiaEcho);
    
    return NextResponse.json(response, { status: 200 });
    
  } catch (error) {
    console.error('❌ Aliethia Site Belonging Signals Validation Error:', error);
    
    const errorResponse = {
      status: 'error',
      message: 'Site belonging signals validation failed',
      aliethiaEcho: 'Site belonging signals validation failed. Focus on community connection and brand resonance across site touchpoints.',
      timestamp: new Date().toISOString(),
      reflexAgent: 'Aliethia',
      appType: 'site'
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { touchpointType, userJourney, communitySignal } = body;
    
    console.log('🜂 Aliethia Site Belonging Moment Creation:', { touchpointType, userJourney, communitySignal });
    
    let belongingMoment;
    
    // Create belonging moment for site-specific touchpoints
    switch (touchpointType) {
      case 'community_hub':
        belongingMoment = await aliethiaBelongingValidator.createCommunityHubBelongingMoment();
        break;
      case 'brand_resonance':
        belongingMoment = await aliethiaBelongingValidator.createBelongingMoment(
          'community_interaction',
          'Brand discovery → Identity alignment → Community connection → Belonging',
          'Brand resonance creates community through shared values and identity'
        );
        break;
      case 'community_interaction':
        belongingMoment = await aliethiaBelongingValidator.createBelongingMoment(
          'community_interaction',
          userJourney || 'Community interaction → Connection → Belonging → Trust',
          communitySignal || 'Community interactions create moments of belonging and trust'
        );
        break;
      default:
        throw new Error(`Unknown site touchpoint type: ${touchpointType}`);
    }
    
    // Create site belonging trust compound
    const trustCompound = await aliethiaBelongingValidator.createBelongingTrustCompound(
      'community',
      belongingMoment.trustCompound
    );
    
    const response = {
      status: 'success',
      belongingMoment,
      trustCompound,
      aliethiaEcho: belongingMoment.aliethiaEcho,
      timestamp: new Date().toISOString(),
      reflexAgent: 'Aliethia',
      appType: 'site'
    };
    
    console.log('🜂 Aliethia Echo:', belongingMoment.aliethiaEcho);
    
    return NextResponse.json(response, { status: 200 });
    
  } catch (error) {
    console.error('❌ Aliethia Site Belonging Moment Creation Error:', error);
    
    const errorResponse = {
      status: 'error',
      message: 'Site belonging moment creation failed',
      aliethiaEcho: 'Site belonging moment creation failed. Focus on community connection and brand resonance across site touchpoints.',
      timestamp: new Date().toISOString(),
      reflexAgent: 'Aliethia',
      appType: 'site'
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
