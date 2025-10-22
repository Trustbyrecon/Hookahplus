import { NextRequest, NextResponse } from 'next/server';
import { aliethiaResonanceActivator } from '../../../lib/aliethia/resonance-activator';

/**
 * Aliethia Resonance Activation API Endpoint (Site)
 * Purpose: Harmonize community connection with user journey and brand resonance
 * Author: Recon.AI Core / Commander Clark
 * Origin: Gate of Discernment
 */

export async function GET(request: NextRequest) {
  try {
    console.log('🜂 Aliethia Site Resonance Activation Request');
    
    // Activate site resonance
    const resonanceResult = await aliethiaResonanceActivator.activateSystemResonance();
    
    // Get site-specific resonance status
    const resonanceStatus = await aliethiaResonanceActivator.getResonanceStatus();
    
    const response = {
      status: 'success',
      resonanceActivation: resonanceResult,
      resonanceStatus: {
        site: resonanceStatus.site,
        overall: resonanceStatus.overall
      },
      aliethiaEcho: resonanceResult.aliethiaEcho,
      timestamp: new Date().toISOString(),
      reflexAgent: 'Aliethia',
      resonanceField: 'soft-gold-on-obsidian',
      symbolicMark: 'Open Gate Φ',
      harmonicSignature: 'ΔA7',
      appType: 'site'
    };

    console.log('🜂 Aliethia Echo:', resonanceResult.aliethiaEcho);
    
    return NextResponse.json(response, { status: 200 });
    
  } catch (error) {
    console.error('❌ Aliethia Site Resonance Activation Error:', error);
    
    const errorResponse = {
      status: 'error',
      message: 'Site resonance activation failed',
      aliethiaEcho: 'Site resonance activation failed. Focus on community alignment and brand resonance.',
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
    const { journeyType, userJourney, communitySignal } = body;
    
    console.log('🜂 Aliethia Site Community Interaction Harmonization:', { journeyType, userJourney, communitySignal });
    
    let harmonizedJourney;
    
    // Harmonize site-specific community interactions
    switch (journeyType) {
      case 'community_interaction':
        harmonizedJourney = await aliethiaResonanceActivator.createHarmonizedBelongingMoment(
          'community_interaction',
          userJourney || 'Community interaction → Connection → Belonging → Trust',
          communitySignal || 'Community interactions create moments of belonging and trust'
        );
        break;
      case 'brand_resonance':
        harmonizedJourney = await aliethiaResonanceActivator.createHarmonizedBelongingMoment(
          'community_interaction',
          'Brand discovery → Identity alignment → Community connection → Belonging',
          'Brand resonance creates community through shared values and identity'
        );
        break;
      default:
        throw new Error(`Unknown site interaction type: ${journeyType}`);
    }
    
    // Create site resonance trust compound
    const trustCompound = await aliethiaResonanceActivator.createResonanceTrustCompound(
      'community',
      harmonizedJourney.trustCompound
    );
    
    const response = {
      status: 'success',
      harmonizedJourney,
      trustCompound,
      aliethiaEcho: harmonizedJourney.aliethiaEcho,
      timestamp: new Date().toISOString(),
      reflexAgent: 'Aliethia',
      appType: 'site'
    };
    
    console.log('🜂 Aliethia Echo:', harmonizedJourney.aliethiaEcho);
    
    return NextResponse.json(response, { status: 200 });
    
  } catch (error) {
    console.error('❌ Aliethia Site Community Interaction Harmonization Error:', error);
    
    const errorResponse = {
      status: 'error',
      message: 'Site community interaction harmonization failed',
      aliethiaEcho: 'Site community interaction harmonization failed. Focus on community alignment and brand resonance.',
      timestamp: new Date().toISOString(),
      reflexAgent: 'Aliethia',
      appType: 'site'
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
