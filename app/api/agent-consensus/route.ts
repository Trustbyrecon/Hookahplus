import { NextRequest, NextResponse } from 'next/server';
import agentConsensus from '../../../lib/agentConsensus';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (action === 'trigger-order') {
      // Simulate an order to test the agent system
      const customerId = searchParams.get('customerId') || 'api_customer';
      const flavor = searchParams.get('flavor') || 'Mint Storm';
      const amount = parseFloat(searchParams.get('amount') || '32');
      
      agentConsensus.triggerOrder({
        customerId,
        flavor,
        amount
      });
      
      return NextResponse.json({
        success: true,
        message: 'Order triggered successfully',
        data: { customerId, flavor, amount },
        timestamp: new Date().toISOString()
      });
    }
    
    if (action === 'manual-pulse') {
      const agent = searchParams.get('agent');
      const status = searchParams.get('status') as 'green' | 'amber' | 'red';
      const message = searchParams.get('message') || 'Manual pulse';
      
      if (!agent || !status) {
        return NextResponse.json(
          { success: false, error: 'Missing agent or status parameter' },
          { status: 400 }
        );
      }
      
      switch (agent) {
        case 'aliethia':
          agentConsensus.aliethiaPulse(status, message);
          break;
        case 'ep':
          agentConsensus.epPulse(status, message);
          break;
        case 'navigator':
          agentConsensus.navigatorPulse(status, message);
          break;
        case 'sentinel':
          agentConsensus.sentinelPulse(status, message);
          break;
        default:
          return NextResponse.json(
            { success: false, error: 'Invalid agent specified' },
            { status: 400 }
          );
      }
      
      return NextResponse.json({
        success: true,
        message: `Manual pulse sent to ${agent}`,
        data: { agent, status, message },
        timestamp: new Date().toISOString()
      });
    }
    
    // Default: return current consensus state
    const state = agentConsensus.getState();
    
    return NextResponse.json({
      success: true,
      data: state,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in agent consensus API:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process agent consensus request',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, agent, status, message, metadata } = body;
    
    if (action === 'trigger-order') {
      const { customerId, flavor, amount } = metadata || {};
      agentConsensus.triggerOrder({
        customerId: customerId || 'post_customer',
        flavor: flavor || 'Mint Storm',
        amount: amount || 32
      });
      
      return NextResponse.json({
        success: true,
        message: 'Order triggered via POST',
        data: { customerId, flavor, amount },
        timestamp: new Date().toISOString()
      });
    }
    
    if (action === 'manual-pulse') {
      if (!agent || !status) {
        return NextResponse.json(
          { success: false, error: 'Missing agent or status in request body' },
          { status: 400 }
        );
      }
      
      switch (agent) {
        case 'aliethia':
          agentConsensus.aliethiaPulse(status, message || 'Manual pulse', metadata);
          break;
        case 'ep':
          agentConsensus.epPulse(status, message || 'Manual pulse', metadata);
          break;
        case 'navigator':
          agentConsensus.navigatorPulse(status, message || 'Manual pulse', metadata);
          break;
        case 'sentinel':
          agentConsensus.sentinelPulse(status, message || 'Manual pulse', metadata);
          break;
        default:
          return NextResponse.json(
            { success: false, error: 'Invalid agent specified' },
            { status: 400 }
          );
      }
      
      return NextResponse.json({
        success: true,
        message: `Manual pulse sent to ${agent}`,
        data: { agent, status, message, metadata },
        timestamp: new Date().toISOString()
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid action specified' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error in agent consensus POST:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process agent consensus request',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
