// apps/web/app/api/agents/sentinel/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sentinelPOS } from '../../../../lib/sentinelPOS';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'telemetry':
        return NextResponse.json({
          success: true,
          data: sentinelPOS.getTelemetryEvents()
        });

      case 'density':
        return NextResponse.json({
          success: true,
          data: sentinelPOS.getDensityThresholds()
        });

      case 'risk_summary':
        return NextResponse.json({
          success: true,
          data: sentinelPOS.getRiskSummary()
        });

      case 'killswitches':
        return NextResponse.json({
          success: true,
          data: sentinelPOS.checkKillSwitches()
        });

      default:
        return NextResponse.json({
          success: true,
          data: {
            message: 'Sentinel.POS API active',
            endpoints: ['telemetry', 'density', 'risk_summary', 'killswitches']
          }
        });
    }
  } catch (error) {
    console.error('Sentinel.POS API error:', error);
    return NextResponse.json(
      { success: false, error: 'Sentinel.POS API error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'monitor_telemetry':
        const { source, domain, userAgent, ip } = data;
        sentinelPOS.monitorTelemetry(source, domain, userAgent, ip);
        return NextResponse.json({
          success: true,
          message: 'Telemetry monitored'
        });

      case 'check_density':
        const { venueData } = data;
        sentinelPOS.checkDensityThresholds(venueData);
        return NextResponse.json({
          success: true,
          message: 'Density thresholds checked'
        });

      case 'monitor_connector':
        const { venueId, requestedScopes } = data;
        sentinelPOS.monitorConnectorRequest(venueId, requestedScopes);
        return NextResponse.json({
          success: true,
          message: 'Connector request monitored'
        });

      case 'enforce_guardrails':
        sentinelPOS.enforceGuardrails();
        return NextResponse.json({
          success: true,
          message: 'Guardrails enforced'
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Sentinel.POS API error:', error);
    return NextResponse.json(
      { success: false, error: 'Sentinel.POS API error' },
      { status: 500 }
    );
  }
}
