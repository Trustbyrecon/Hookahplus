import { NextRequest, NextResponse } from 'next/server';
import { aliethiaValidator } from '../../../lib/aliethia/clarity-validator';

/**
 * Aliethia Clarity Validation API Endpoint (Site)
 * Purpose: Validate clarity, belonging, and resonance for community connection
 * Author: Recon.AI Core / Commander Clark
 * Origin: Gate of Discernment
 */

export async function GET(request: NextRequest) {
  try {
    console.log('🜂 Aliethia Site Clarity Validation Request');
    
    // Validate site clarity
    const validationResult = await aliethiaValidator.validateSystemClarity();
    
    // Create site-specific clarity fingerprint
    const clarityFingerprint = {
      clarityScore: validationResult.clarityScore,
      resonanceSignal: validationResult.resonanceSignal,
      trustCompound: validationResult.trustCompound,
      identityAlignment: (validationResult.clarityScore + validationResult.resonanceSignal + validationResult.trustCompound) / 3,
      belongingMoment: validationResult.belongingMoment,
      harmonicSignature: 'ΔA7',
      symbolicMark: 'Open Gate Φ',
      resonanceField: 'soft-gold on obsidian',
      communityExperience: {
        flavorDemoRitual: process.env.NEXT_PUBLIC_FLAVOR_DEMO_RITUAL === 'true',
        qrGeneratorRitual: process.env.NEXT_PUBLIC_QR_GENERATOR_RITUAL === 'true',
        supportCenterRitual: process.env.NEXT_PUBLIC_SUPPORT_CENTER_RITUAL === 'true',
        communityForumRitual: process.env.NEXT_PUBLIC_COMMUNITY_FORUM_RITUAL === 'true',
        communityEngagement: process.env.NEXT_PUBLIC_COMMUNITY_ENGAGEMENT_ENABLED === 'true',
        brandResonance: process.env.NEXT_PUBLIC_BRAND_RESONANCE_ENABLED === 'true'
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
      appType: 'site'
    };

    console.log('🜂 Aliethia Echo:', validationResult.aliethiaEcho);
    
    return NextResponse.json(response, { status: 200 });
    
  } catch (error) {
    console.error('❌ Aliethia Site Clarity Validation Error:', error);
    
    const errorResponse = {
      status: 'error',
      message: 'Site clarity validation failed',
      aliethiaEcho: 'Site clarity breach detected. Reattunement through essence required.',
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
    const { type, userJourney, communitySignal } = body;
    
    console.log('🜂 Aliethia Site Community Interaction Creation:', { type, userJourney, communitySignal });
    
    // Create site community interaction
    const belongingMoment = await aliethiaValidator.createBelongingMoment(
      type,
      userJourney,
      communitySignal
    );
    
    // Create site trust compound
    const trustCompound = await aliethiaValidator.createTrustCompound(
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
    console.error('❌ Aliethia Site Community Interaction Creation Error:', error);
    
    const errorResponse = {
      status: 'error',
      message: 'Site community interaction creation failed',
      aliethiaEcho: 'Site community interaction creation failed. Focus on community connection.',
      timestamp: new Date().toISOString(),
      reflexAgent: 'Aliethia',
      appType: 'site'
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
