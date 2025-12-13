import { NextRequest, NextResponse } from 'next/server';
import {
  addToSyncBacklog,
  getPendingSyncOperations,
  processSyncBacklog,
  SyncOperation
} from '../../../../lib/sync/backlog';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * POST /api/sync/backlog
 * Add operation to sync backlog or process pending operations
 * 
 * Body:
 *   - action: "add" | "process"
 *   - deviceId: string (required)
 *   - loungeId: string (required for "add")
 *   - operation: string (required for "add")
 *   - payload: object (required for "add")
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, deviceId, loungeId, operation, payload } = body;

    if (!deviceId) {
      return NextResponse.json(
        { error: 'deviceId is required' },
        { status: 400 }
      );
    }

    if (action === 'add') {
      if (!loungeId || !operation || !payload) {
        return NextResponse.json(
          { error: 'loungeId, operation, and payload are required for "add" action' },
          { status: 400 }
        );
      }

      const backlogId = await addToSyncBacklog(deviceId, loungeId, operation, payload);

      return NextResponse.json({
        success: true,
        backlogId,
        message: 'Operation added to sync backlog'
      });
    }

    if (action === 'process') {
      // Process sync backlog with handler
      const results = await processSyncBacklog(deviceId, async (op: SyncOperation) => {
        // Route operation to appropriate handler
        switch (op.operation) {
          case 'CREATE_SESSION':
            // Replay session creation
            await prisma.session.create({
              data: op.payload as any // Type assertion needed as payload comes from sync backlog
            });
            break;

          case 'UPDATE_ORDER':
            // Replay order update
            await prisma.order.update({
              where: { id: op.payload.orderId },
              data: op.payload.updates
            });
            break;

          case 'ADD_NOTE':
            // Replay note addition
            await prisma.sessionNote.create({
              data: op.payload as any // Type assertion needed as payload comes from sync backlog
            });
            break;

          default:
            console.warn(`[sync] Unknown operation type: ${op.operation}`);
        }
      });

      return NextResponse.json({
        success: true,
        results
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Must be "add" or "process"' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error in sync backlog API:', error);
    return NextResponse.json(
      {
        error: 'Failed to process sync backlog',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/sync/backlog
 * Get pending sync operations for a device
 * 
 * Query params:
 *   - deviceId: string (required)
 *   - limit: number (default: 50)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const deviceId = searchParams.get('deviceId');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    if (!deviceId) {
      return NextResponse.json(
        { error: 'deviceId query parameter is required' },
        { status: 400 }
      );
    }

    const pending = await getPendingSyncOperations(deviceId, limit);

    return NextResponse.json({
      success: true,
      operations: pending,
      count: pending.length
    });

  } catch (error) {
    console.error('Error fetching sync backlog:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch sync backlog',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

