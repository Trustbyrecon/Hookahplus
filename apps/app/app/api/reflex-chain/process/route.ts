/**
 * Reflex Chain Processing API
 * 
 * Handles Reflex Chain flow processing across all layers
 */

import { NextRequest, NextResponse } from 'next/server';
import { reflexChainEngine } from '../../../../lib/reflex-chain/core';
import { posAdapter, loyaltyAdapter, sessionReplayAdapter } from '../../../../lib/reflex-chain/adapters';
import {
  BOHReflexInput,
  BOHReflexOutput,
  FOHReflexInput,
  FOHReflexOutput,
  DeliveryReflexInput,
  DeliveryReflexOutput,
  CustomerReflexInput,
  CustomerReflexOutput,
} from '../../../../lib/reflex-chain/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { layer, sessionId, input, output } = body;

    if (!layer || !sessionId) {
      return NextResponse.json(
        { error: 'Layer and sessionId are required' },
        { status: 400 }
      );
    }

    let flow;

    switch (layer) {
      case 'boh':
        if (!output) {
          return NextResponse.json(
            { error: 'BOH output is required' },
            { status: 400 }
          );
        }
        flow = reflexChainEngine.processBOH(sessionId, output as BOHReflexOutput);
        
        // Sync to POS adapter
        if (flow.foh.output) {
          await posAdapter.syncToPOS(flow.foh.output);
        }
        break;

      case 'foh':
        if (!output) {
          return NextResponse.json(
            { error: 'FoH output is required' },
            { status: 400 }
          );
        }
        flow = reflexChainEngine.processFOH(sessionId, output as FOHReflexOutput);
        
        // Sync to POS adapter
        await posAdapter.syncToPOS(output as FOHReflexOutput);
        break;

      case 'delivery':
        if (!output) {
          return NextResponse.json(
            { error: 'Delivery output is required' },
            { status: 400 }
          );
        }
        flow = reflexChainEngine.processDelivery(sessionId, output as DeliveryReflexOutput);
        
        // Sync to Session Replay adapter
        await sessionReplayAdapter.syncToHeatmap(output as DeliveryReflexOutput, flow);
        break;

      case 'customer':
        if (!input || !output) {
          return NextResponse.json(
            { error: 'Customer input and output are required' },
            { status: 400 }
          );
        }
        flow = reflexChainEngine.processCustomer(
          sessionId,
          input as CustomerReflexInput,
          output as CustomerReflexOutput
        );
        
        // Sync to Loyalty adapter
        await loyaltyAdapter.syncToLoyalty(output as CustomerReflexOutput, sessionId);
        break;

      default:
        return NextResponse.json(
          { error: `Unknown layer: ${layer}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      flow,
      layer,
      timestamp: Date.now(),
    });

  } catch (error: any) {
    console.error('[Reflex Chain API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to process Reflex Chain',
      },
      { status: 500 }
    );
  }
}

/**
 * Initialize a new Reflex Chain flow
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, bohInput } = body;

    if (!sessionId || !bohInput) {
      return NextResponse.json(
        { error: 'sessionId and bohInput are required' },
        { status: 400 }
      );
    }

    const flow = reflexChainEngine.initializeFlow(sessionId, bohInput as BOHReflexInput);

    return NextResponse.json({
      success: true,
      flow,
      timestamp: Date.now(),
    });

  } catch (error: any) {
    console.error('[Reflex Chain API] Initialization error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to initialize Reflex Chain',
      },
      { status: 500 }
    );
  }
}

/**
 * Get current flow state
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (sessionId) {
      const flow = reflexChainEngine.getFlow(sessionId);
      if (!flow) {
        return NextResponse.json(
          { error: 'Flow not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, flow });
    }

    // Return all active flows
    const activeFlows = reflexChainEngine.getActiveFlows();
    return NextResponse.json({
      success: true,
      flows: activeFlows,
      count: activeFlows.length,
    });

  } catch (error: any) {
    console.error('[Reflex Chain API] Get error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get Reflex Chain',
      },
      { status: 500 }
    );
  }
}

