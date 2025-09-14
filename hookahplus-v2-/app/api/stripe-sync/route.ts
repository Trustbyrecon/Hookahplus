import { NextRequest, NextResponse } from 'next/server';
import { syncProductsToStripe } from '@/lib/stripe-catalog';
import { flagManager } from '@/lib/flag-manager';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting Stripe product catalog sync...');
    
    // Sync products to Stripe
    const results = await syncProductsToStripe();
    
    // Create flag for sync completion
    await flagManager.createFlag('STRIPE_SYNC_COMPLETED', {
      sessions: results.sessions.length,
      flavors: results.flavors.length,
      bundles: results.bundles.length,
      memberships: results.memberships.length,
      errors: results.errors.length,
      severity: 'low'
    });

    return NextResponse.json({
      success: true,
      message: 'Stripe product catalog sync completed',
      results: {
        sessions: results.sessions.length,
        flavors: results.flavors.length,
        bundles: results.bundles.length,
        memberships: results.memberships.length,
        errors: results.errors.length
      },
      details: results
    });

  } catch (error) {
    console.error('Stripe sync error:', error);
    
    // Create flag for sync error
    await flagManager.createFlag('STRIPE_SYNC_ERROR', {
      error: error.message,
      severity: 'high'
    });

    return NextResponse.json(
      { 
        success: false,
        error: 'Stripe product catalog sync failed',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// Get sync status
export async function GET(request: NextRequest) {
  try {
    // This could check the current state of products in Stripe
    // For now, return a simple status
    return NextResponse.json({
      status: 'ready',
      message: 'Stripe sync endpoint is ready',
      lastSync: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting sync status:', error);
    return NextResponse.json(
      { error: 'Failed to get sync status' },
      { status: 500 }
    );
  }
}
