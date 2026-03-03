// apps/web/app/api/agents/commander/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { commander } from '../../../../lib/agentCommander';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'status':
        return NextResponse.json({
          success: true,
          data: {
            eventBus: commander.getEventBus().slice(-10), // Last 10 events
            agentResponses: commander.getAgentResponses().slice(-10), // Last 10 responses
            killSwitches: commander.getKillSwitches()
          }
        });

      case 'events':
        return NextResponse.json({
          success: true,
          data: commander.getEventBus()
        });

      case 'killswitches':
        return NextResponse.json({
          success: true,
          data: commander.getKillSwitches()
        });

      default:
        return NextResponse.json({
          success: true,
          data: {
            message: 'Commander API active',
            endpoints: ['status', 'events', 'killswitches']
          }
        });
    }
  } catch (error) {
    console.error('Commander API error:', error);
    return NextResponse.json(
      { success: false, error: 'Commander API error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'emit_event':
        commander.emitEvent(data);
        return NextResponse.json({
          success: true,
          message: 'Event emitted successfully'
        });

      case 'set_killswitch':
        const { key, value } = data;
        commander.setKillSwitch(key, value);
        return NextResponse.json({
          success: true,
          message: `Kill switch ${key} set to ${value}`
        });

      case 'escalate':
        const { agentId, reason, escalationData } = data;
        commander.escalateToHiTL(agentId, reason, escalationData);
        return NextResponse.json({
          success: true,
          message: 'Escalation sent to HiTL'
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Commander API error:', error);
    return NextResponse.json(
      { success: false, error: 'Commander API error' },
      { status: 500 }
    );
  }
}
