import { NextRequest, NextResponse } from 'next/server';
import { aliethiaResonanceActivator } from '../../../lib/aliethia/resonance-activator';

/**
 * Aliethia Resonance Activation API Endpoint (Guest App)
 * Purpose: Harmonize guest experience with user journey and community resonance
 * Author: Recon.AI Core / Commander Clark
 * Origin: Gate of Discernment
 */

export async function GET(request: NextRequest) {
  try {
    console.log('🜂 Aliethia Guest Resonance Activation Request');
    
    // Activate guest resonance
    const resonanceResult = await aliethiaResonanceActivator.activateSystemResonance();
    
    // Get guest-specific resonance status
    const resonanceStatus = await aliethiaResonanceActivator.getResonanceStatus();
    
    const response = {
      status: 'success',
      resonanceActivation: resonanceResult,
      resonanceStatus: {
        guest: resonanceStatus.guest,
        overall: resonanceStatus.overall
      },
      aliethiaEcho: resonanceResult.aliethiaEcho,
      timestamp: new Date().toISOString(),
      reflexAgent: 'Aliethia',
      resonanceField: 'soft-gold-on-obsidian',
      symbolicMark: 'Open Gate Φ',
      harmonicSignature: 'ΔA7',
      appType: 'guest'
    };

    console.log('🜂 Aliethia Echo:', resonanceResult.aliethiaEcho);
    
    return NextResponse.json(response, { status: 200 });
    
  } catch (error) {
    console.error('❌ Aliethia Guest Resonance Activation Error:', error);
    
    const errorResponse = {
      status: 'error',
      message: 'Guest resonance activation failed',
      aliethiaEcho: 'Guest resonance activation failed. Focus on user journey alignment and community connection.',
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
    const { journeyType, userJourney, communitySignal } = body;
    
    console.log('🜂 Aliethia Guest Journey Harmonization:', { journeyType, userJourney, communitySignal });
    
    let harmonizedJourney;
    
    // Harmonize guest-specific journey types
    switch (journeyType) {
      case 'qr_scan':
        harmonizedJourney = await aliethiaResonanceActivator.harmonizeQRCodeJourney();
        break;
      case 'flavor_selection':
        harmonizedJourney = await aliethiaResonanceActivator.harmonizeFlavorWheelJourney();
        break;
      case 'session_start':
        harmonizedJourney = await aliethiaResonanceActivator.harmonizeSessionTrackerJourney();
        break;
      case 'payment_complete':
        harmonizedJourney = await aliethiaResonanceActivator.harmonizePaymentJourney();
        break;
      default:
        throw new Error(`Unknown guest journey type: ${journeyType}`);
    }
    
    // Create guest resonance trust compound
    const trustCompound = await aliethiaResonanceActivator.createResonanceTrustCompound(
      'interaction',
      harmonizedJourney.trustCompound
    );
    
    const response = {
      status: 'success',
      harmonizedJourney,
      trustCompound,
      aliethiaEcho: harmonizedJourney.aliethiaEcho,
      timestamp: new Date().toISOString(),
      reflexAgent: 'Aliethia',
      appType: 'guest'
    };
    
    console.log('🜂 Aliethia Echo:', harmonizedJourney.aliethiaEcho);
    
    return NextResponse.json(response, { status: 200 });
    
  } catch (error) {
    console.error('❌ Aliethia Guest Journey Harmonization Error:', error);
    
    const errorResponse = {
      status: 'error',
      message: 'Guest journey harmonization failed',
      aliethiaEcho: 'Guest journey harmonization failed. Focus on community alignment and user journey.',
      timestamp: new Date().toISOString(),
      reflexAgent: 'Aliethia',
      appType: 'guest'
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
