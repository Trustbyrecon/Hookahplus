// hookahplus-v2-/app/api/floor-queue/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Floor queue data store
let floorQueue: any[] = [];
let activeSessions: any[] = [];
let alerts: any[] = [];

// GET - Get floor queue data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'start-demo':
        // Initialize demo data
        floorQueue = [
          {
            id: 'queue_1',
            tableId: 'T-001',
            customerName: 'John Smith',
            partySize: 2,
            flavor: 'Blue Mist + Mint',
            status: 'waiting',
            estimatedWait: 5,
            createdAt: new Date().toISOString(),
            priority: 'normal'
          },
          {
            id: 'queue_2',
            tableId: 'B-001',
            customerName: 'Sarah Johnson',
            partySize: 4,
            flavor: 'Strawberry + Vanilla',
            status: 'preparing',
            estimatedWait: 3,
            createdAt: new Date(Date.now() - 300000).toISOString(),
            priority: 'high'
          }
        ];

        activeSessions = [
          {
            id: 'session_1',
            tableId: 'T-002',
            customerName: 'Mike Wilson',
            partySize: 3,
            flavor: 'Grape + Mint',
            status: 'active',
            startTime: new Date(Date.now() - 600000).toISOString(),
            estimatedEndTime: new Date(Date.now() + 1800000).toISOString(),
            staffAssigned: {
              prep: 'Alex Chen',
              front: 'Emma Wilson',
              hookah_room: 'Chris Taylor'
            }
          }
        ];

        alerts = [
          {
            id: 'alert_1',
            type: 'refill_needed',
            tableId: 'T-002',
            message: 'T-002 needs refill - Grape + Mint',
            priority: 'high',
            timestamp: new Date().toISOString()
          }
        ];

        return NextResponse.json({
          success: true,
          message: 'Demo mode started - Floor queue operationalized',
          data: {
            floorQueue,
            activeSessions,
            alerts,
            stats: {
              totalInQueue: floorQueue.length,
              activeSessions: activeSessions.length,
              pendingAlerts: alerts.length,
              averageWaitTime: 4
            }
          },
          timestamp: new Date().toISOString()
        });

      case 'stop-demo':
        floorQueue = [];
        activeSessions = [];
        alerts = [];
        
        return NextResponse.json({
          success: true,
          message: 'Demo mode stopped',
          timestamp: new Date().toISOString()
        });

      case 'add-to-queue':
        const tableId = searchParams.get('tableId');
        const customerName = searchParams.get('customerName') || 'Walk-in Customer';
        const partySize = parseInt(searchParams.get('partySize') || '2');
        const flavor = searchParams.get('flavor') || 'Mixed Flavor';

        const newQueueItem = {
          id: `queue_${Date.now()}`,
          tableId,
          customerName,
          partySize,
          flavor,
          status: 'waiting',
          estimatedWait: Math.floor(Math.random() * 10) + 1,
          createdAt: new Date().toISOString(),
          priority: partySize > 4 ? 'high' : 'normal'
        };

        floorQueue.push(newQueueItem);

        return NextResponse.json({
          success: true,
          message: `Added ${tableId} to floor queue`,
          queueItem: newQueueItem,
          timestamp: new Date().toISOString()
        });

      case 'fire-session':
        const fireTableId = searchParams.get('tableId');
        const fireFlavor = searchParams.get('flavor') || 'Mixed Flavor';

        if (!fireTableId) {
          return NextResponse.json({
            error: 'Table ID is required for fire session'
          }, { status: 400 });
        }

        // Remove from queue
        const queueIndex = floorQueue.findIndex(item => item.tableId === fireTableId);
        let firedItem = null;
        if (queueIndex !== -1) {
          firedItem = floorQueue.splice(queueIndex, 1)[0];
        }

        // Add to active sessions
        const newSession = {
          id: `session_${Date.now()}`,
          tableId: fireTableId,
          customerName: firedItem?.customerName || 'Demo Customer',
          partySize: firedItem?.partySize || 2,
          flavor: firedItem?.flavor || fireFlavor,
          status: 'prep',
          startTime: new Date().toISOString(),
          estimatedEndTime: new Date(Date.now() + 5400000).toISOString(), // 90 minutes
          staffAssigned: {
            prep: 'Alex Chen',
            front: 'Emma Wilson',
            hookah_room: 'Chris Taylor'
          }
        };

        activeSessions.push(newSession);

        return NextResponse.json({
          success: true,
          message: `Session fired for ${fireTableId}`,
          session: newSession,
          timestamp: new Date().toISOString()
        });

      default:
        // Return current floor queue data
        return NextResponse.json({
          success: true,
          data: {
            floorQueue,
            activeSessions,
            alerts,
            stats: {
              totalInQueue: floorQueue.length,
              activeSessions: activeSessions.length,
              pendingAlerts: alerts.length,
              averageWaitTime: floorQueue.length > 0 ? 
                Math.round(floorQueue.reduce((sum, item) => sum + item.estimatedWait, 0) / floorQueue.length) : 0
            }
          },
          timestamp: new Date().toISOString()
        });
    }
  } catch (error) {
    console.error('Floor queue API error:', error);
    return NextResponse.json({
      error: 'Failed to load floor queue data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - Update floor queue
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, tableId, customerName, partySize, flavor, status } = body;

    switch (action) {
      case 'add-to-queue':
        const newQueueItem = {
          id: `queue_${Date.now()}`,
          tableId,
          customerName: customerName || 'Walk-in Customer',
          partySize: partySize || 2,
          flavor: flavor || 'Mixed Flavor',
          status: 'waiting',
          estimatedWait: Math.floor(Math.random() * 10) + 1,
          createdAt: new Date().toISOString(),
          priority: (partySize || 2) > 4 ? 'high' : 'normal'
        };

        floorQueue.push(newQueueItem);

        return NextResponse.json({
          success: true,
          message: `Added ${tableId} to floor queue`,
          queueItem: newQueueItem,
          timestamp: new Date().toISOString()
        });

      case 'fire-session':
        // Remove from queue
        const queueIndex = floorQueue.findIndex(item => item.tableId === tableId);
        let firedItem = null;
        if (queueIndex !== -1) {
          firedItem = floorQueue.splice(queueIndex, 1)[0];
        }

        // Add to active sessions
        const newSession = {
          id: `session_${Date.now()}`,
          tableId,
          customerName: firedItem?.customerName || customerName || 'Demo Customer',
          partySize: firedItem?.partySize || partySize || 2,
          flavor: firedItem?.flavor || flavor || 'Mixed Flavor',
          status: 'prep',
          startTime: new Date().toISOString(),
          estimatedEndTime: new Date(Date.now() + 5400000).toISOString(), // 90 minutes
          staffAssigned: {
            prep: 'Alex Chen',
            front: 'Emma Wilson',
            hookah_room: 'Chris Taylor'
          }
        };

        activeSessions.push(newSession);

        return NextResponse.json({
          success: true,
          message: `Session fired for ${tableId}`,
          session: newSession,
          timestamp: new Date().toISOString()
        });

      case 'update-status':
        const itemIndex = floorQueue.findIndex(item => item.tableId === tableId);
        if (itemIndex !== -1) {
          floorQueue[itemIndex].status = status;
          floorQueue[itemIndex].updatedAt = new Date().toISOString();
        }

        return NextResponse.json({
          success: true,
          message: `Updated status for ${tableId}`,
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json({
          error: 'Invalid action'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Floor queue POST error:', error);
    return NextResponse.json({
      error: 'Failed to update floor queue',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
