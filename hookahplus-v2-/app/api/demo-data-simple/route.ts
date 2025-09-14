// app/api/demo-data-simple/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Simple demo data without complex imports
let demoMode = false;
let sessions: any[] = [];
let alerts: any[] = [];

// GET - Load real-time demo data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'start':
        demoMode = true;
        // Generate some initial demo sessions
        sessions = [
          {
            id: 'demo_1',
            tableId: 'T-001',
            flavor: 'Blue Mist + Mint',
            status: 'prep',
            staffAssigned: {
              prep: 'Alex Chen',
              front: 'Emma Wilson',
              hookah_room: 'Chris Taylor'
            },
            customerInfo: {
              name: 'John Smith',
              phone: '+1 (555) 123-4567'
            },
            timing: {
              createdAt: new Date().toISOString(),
              estimatedPrepTime: 10,
              estimatedSessionTime: 90
            },
            metadata: {
              source: 'demo',
              zone: 'BAR A',
              partySize: 2
            }
          },
          {
            id: 'demo_2',
            tableId: 'B-001',
            flavor: 'Strawberry + Vanilla',
            status: 'delivery',
            staffAssigned: {
              prep: 'Maria Rodriguez',
              front: 'James Brown',
              hookah_room: 'Anna Martinez'
            },
            customerInfo: {
              name: 'Sarah Johnson',
              phone: '+1 (555) 987-6543'
            },
            timing: {
              createdAt: new Date(Date.now() - 300000).toISOString(),
              estimatedPrepTime: 8,
              estimatedSessionTime: 75
            },
            metadata: {
              source: 'demo',
              zone: 'BOOTHS W',
              partySize: 4
            }
          }
        ];

        alerts = [
          {
            id: 'alert_1',
            sessionId: 'demo_1',
            alertType: 'ready_for_delivery',
            priority: 'high',
            message: 'Blue Mist + Mint ready for delivery at T-001',
            timestamp: new Date().toISOString(),
            acknowledged: false
          }
        ];

        return NextResponse.json({ 
          success: true, 
          message: 'Demo mode started - Real-time data flowing',
          timestamp: new Date().toISOString()
        });

      case 'stop':
        demoMode = false;
        return NextResponse.json({ 
          success: true, 
          message: 'Demo mode stopped',
          timestamp: new Date().toISOString()
        });

      case 'fire-session':
        const tableId = searchParams.get('tableId');
        const flavor = searchParams.get('flavor');
        
        if (!tableId || !flavor) {
          return NextResponse.json({ 
            error: 'Table ID and flavor are required for fire session' 
          }, { status: 400 });
        }
        
        const newSession = {
          id: `demo_${Date.now()}`,
          tableId,
          flavor,
          status: 'prep',
          staffAssigned: {
            prep: 'Alex Chen',
            front: 'Emma Wilson',
            hookah_room: 'Chris Taylor'
          },
          customerInfo: {
            name: 'Demo Customer',
            phone: '+1 (555) 123-4567'
          },
          timing: {
            createdAt: new Date().toISOString(),
            estimatedPrepTime: 10,
            estimatedSessionTime: 90
          },
          metadata: {
            source: 'live',
            zone: 'BAR A',
            partySize: 2
          }
        };
        
        sessions.push(newSession);
        
        return NextResponse.json({ 
          success: true, 
          message: `Fire session created for ${tableId}`,
          session: newSession,
          timestamp: new Date().toISOString()
        });

      case 'stats':
        const stats = {
          totalSessions: sessions.length,
          activeSessions: sessions.filter(s => ['prep', 'delivery', 'service', 'refill', 'coals_needed'].includes(s.status)).length,
          pendingAlerts: alerts.filter(a => !a.acknowledged).length,
          activeOperations: 3,
          sessionsByStatus: {
            prep: sessions.filter(s => s.status === 'prep').length,
            delivery: sessions.filter(s => s.status === 'delivery').length,
            service: sessions.filter(s => s.status === 'service').length,
            refill: sessions.filter(s => s.status === 'refill').length,
            coals_needed: sessions.filter(s => s.status === 'coals_needed').length,
            completed: sessions.filter(s => s.status === 'completed').length
          },
          topFlavors: [
            { flavor: 'Blue Mist + Mint', count: 5 },
            { flavor: 'Strawberry + Vanilla', count: 3 },
            { flavor: 'Grape + Mint', count: 2 }
          ],
          staffUtilization: {
            'Alex Chen': 2,
            'Emma Wilson': 2,
            'Chris Taylor': 2
          }
        };
        
        return NextResponse.json({ 
          success: true, 
          stats,
          timestamp: new Date().toISOString()
        });

      default:
        // Return all data by default
        return NextResponse.json({
          success: true,
          data: {
            sessions,
            alerts,
            operations: [],
            stats: {
              totalSessions: sessions.length,
              activeSessions: sessions.filter(s => ['prep', 'delivery', 'service', 'refill', 'coals_needed'].includes(s.status)).length,
              pendingAlerts: alerts.filter(a => !a.acknowledged).length,
              activeOperations: 3
            }
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
    const { action, tableId, flavor, customerInfo } = body;

    switch (action) {
      case 'fire-session':
        if (!tableId || !flavor) {
          return NextResponse.json({ 
            error: 'Table ID and flavor are required' 
          }, { status: 400 });
        }
        
        const newSession = {
          id: `demo_${Date.now()}`,
          tableId,
          flavor,
          status: 'prep',
          staffAssigned: {
            prep: 'Alex Chen',
            front: 'Emma Wilson',
            hookah_room: 'Chris Taylor'
          },
          customerInfo: {
            name: customerInfo?.name || 'Demo Customer',
            phone: customerInfo?.phone || '+1 (555) 123-4567',
            email: customerInfo?.email || 'demo@hookahplus.com'
          },
          timing: {
            createdAt: new Date().toISOString(),
            estimatedPrepTime: 10,
            estimatedSessionTime: 90
          },
          metadata: {
            source: 'live',
            zone: 'BAR A',
            partySize: customerInfo?.partySize || 2
          }
        };
        
        sessions.push(newSession);
        
        return NextResponse.json({ 
          success: true, 
          message: `Fire session created for ${tableId}`,
          session: newSession,
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
