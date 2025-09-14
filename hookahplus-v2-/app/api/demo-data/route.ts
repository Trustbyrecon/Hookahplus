// app/api/demo-data/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { demoDataGenerator } from '@/lib/demoDataGenerator';

// GET - Load real-time demo data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const tableId = searchParams.get('tableId');
    const flavor = searchParams.get('flavor');

    switch (action) {
      case 'start':
        demoDataGenerator.startDemoMode();
        return NextResponse.json({ 
          success: true, 
          message: 'Demo mode started - Real-time data flowing',
          timestamp: new Date().toISOString()
        });

      case 'stop':
        demoDataGenerator.stopDemoMode();
        return NextResponse.json({ 
          success: true, 
          message: 'Demo mode stopped',
          timestamp: new Date().toISOString()
        });

      case 'fire-session':
        if (!tableId || !flavor) {
          return NextResponse.json({ 
            error: 'Table ID and flavor are required for fire session' 
          }, { status: 400 });
        }
        
        const session = demoDataGenerator.fireSession(tableId, flavor);
        return NextResponse.json({ 
          success: true, 
          message: `Fire session created for ${tableId}`,
          session,
          timestamp: new Date().toISOString()
        });

      case 'stats':
        const stats = demoDataGenerator.getDashboardStats();
        return NextResponse.json({ 
          success: true, 
          stats,
          timestamp: new Date().toISOString()
        });

      default:
        // Return all data by default
        const allSessions = demoDataGenerator.getAllSessions();
        const allAlerts = demoDataGenerator.getFOHAlerts();
        const allOperations = demoDataGenerator.getAllBOHOperations();
        const dashboardStats = demoDataGenerator.getDashboardStats();

        return NextResponse.json({
          success: true,
          data: {
            sessions: allSessions,
            alerts: allAlerts,
            operations: allOperations,
            stats: dashboardStats
          },
          timestamp: new Date().toISOString()
        });
    }
  } catch (error) {
    console.error('Demo data API error:', error);
    return NextResponse.json({ 
      error: 'Failed to load demo data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - Trigger specific actions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, tableId, flavor, customerInfo, alertId, staffId } = body;

    switch (action) {
      case 'fire-session':
        if (!tableId || !flavor) {
          return NextResponse.json({ 
            error: 'Table ID and flavor are required' 
          }, { status: 400 });
        }
        
        const session = demoDataGenerator.fireSession(tableId, flavor, customerInfo);
        return NextResponse.json({ 
          success: true, 
          message: `Fire session created for ${tableId}`,
          session,
          timestamp: new Date().toISOString()
        });

      case 'acknowledge-alert':
        if (!alertId || !staffId) {
          return NextResponse.json({ 
            error: 'Alert ID and staff ID are required' 
          }, { status: 400 });
        }
        
        demoDataGenerator.acknowledgeAlert(alertId, staffId);
        return NextResponse.json({ 
          success: true, 
          message: 'Alert acknowledged',
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json({ 
          error: 'Invalid action' 
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Demo data POST error:', error);
    return NextResponse.json({ 
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}