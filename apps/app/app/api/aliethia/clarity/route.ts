import { NextRequest, NextResponse } from 'next/server';
import { aliethiaValidator } from '../../../../lib/aliethia/clarity-validator';

/**
 * Aliethia Clarity Validation API Endpoint
 * Purpose: Validate clarity, belonging, and resonance across all operations
 * Author: Recon.AI Core / Commander Clark
 * Origin: Gate of Discernment
 */

export async function GET(request: NextRequest) {
  try {
    console.log('🜂 Aliethia Clarity Validation Request');
    
    // Validate system clarity
    const validationResult = await aliethiaValidator.validateSystemClarity();
    
    // Create clarity fingerprint
    const clarityFingerprint = {
      clarityScore: validationResult.clarityScore,
      resonanceSignal: validationResult.resonanceSignal,
      trustCompound: validationResult.trustCompound,
      identityAlignment: (validationResult.clarityScore + validationResult.resonanceSignal + validationResult.trustCompound) / 3,
      belongingMoment: validationResult.belongingMoment,
      harmonicSignature: 'ΔA7',
      symbolicMark: 'Open Gate Φ',
      resonanceField: 'soft-gold on obsidian'
    };

    const response = {
      status: 'success',
      clarityValidation: validationResult,
      clarityFingerprint,
      aliethiaEcho: validationResult.aliethiaEcho,
      timestamp: new Date().toISOString(),
      reflexAgent: 'Aliethia',
      clarityThreshold: 0.98
    };

    console.log('🜂 Aliethia Echo:', validationResult.aliethiaEcho);
    
    return NextResponse.json(response, { status: 200 });
    
  } catch (error) {
    console.error('❌ Aliethia Clarity Validation Error:', error);
    
    const errorResponse = {
      status: 'error',
      message: 'Clarity validation failed',
      aliethiaEcho: 'Clarity breach detected. Reattunement through essence required.',
      timestamp: new Date().toISOString(),
      reflexAgent: 'Aliethia'
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, userJourney, communitySignal } = body;
    
    console.log('🜂 Aliethia Belonging Moment Creation:', { type, userJourney, communitySignal });
    
    // Create belonging moment
    const belongingMoment = await aliethiaValidator.createBelongingMoment(
      type,
      userJourney,
      communitySignal
    );
    
    // Create trust compound
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
      reflexAgent: 'Aliethia'
    };
    
    console.log('🜂 Aliethia Echo:', belongingMoment.aliethiaEcho);
    
    return NextResponse.json(response, { status: 200 });
    
  } catch (error) {
    console.error('❌ Aliethia Belonging Moment Creation Error:', error);
    
    const errorResponse = {
      status: 'error',
      message: 'Belonging moment creation failed',
      aliethiaEcho: 'Belonging moment creation failed. Focus on community connection.',
      timestamp: new Date().toISOString(),
      reflexAgent: 'Aliethia'
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
