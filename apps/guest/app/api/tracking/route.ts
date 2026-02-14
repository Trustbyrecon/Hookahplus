import { NextRequest, NextResponse } from 'next/server';

interface TrackingState {
  sessionId: string;
  loungeId: string;
  tableId: string;
  currentStep: number;
  status: 'pending' | 'preparing' | 'heating' | 'ready' | 'delivered';
  startTime: string;
  estimatedCompletion: string;
  notifications: Array<{
    id: string;
    message: string;
    timestamp: string;
    type: 'info' | 'warning' | 'success';
  }>;
  staffNotes?: string;
}

// In-memory storage for demo (in production, use database)
const trackingStates = new Map<string, TrackingState>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, loungeId, tableId, action } = body;

    if (!sessionId || !loungeId || !tableId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const now = new Date();
    const trackingId = `${sessionId}_${loungeId}_${tableId}`;

    switch (action) {
      case 'start':
        const initialState: TrackingState = {
          sessionId,
          loungeId,
          tableId,
          currentStep: 0,
          status: 'pending',
          startTime: now.toISOString(),
          estimatedCompletion: new Date(now.getTime() + 20 * 60 * 1000).toISOString(), // 20 minutes
          notifications: [{
            id: `notif_${Date.now()}`,
            message: 'Your hookah order has been received and confirmed',
            timestamp: now.toISOString(),
            type: 'success'
          }]
        };
        
        trackingStates.set(trackingId, initialState);
        
        return NextResponse.json({
          success: true,
          tracking: initialState,
          message: 'Hookah tracking started'
        });

      case 'update':
        const existing = trackingStates.get(trackingId);
        if (!existing) {
          return NextResponse.json({ error: 'Tracking not found' }, { status: 404 });
        }

        const { step, status, message, staffNotes } = body;
        
        const updated: TrackingState = {
          ...existing,
          currentStep: step ?? existing.currentStep,
          status: status ?? existing.status,
          notifications: [
            ...existing.notifications,
            {
              id: `notif_${Date.now()}`,
              message: message ?? 'Status updated',
              timestamp: now.toISOString(),
              type: 'info'
            }
          ],
          staffNotes: staffNotes ?? existing.staffNotes
        };

        trackingStates.set(trackingId, updated);

        return NextResponse.json({
          success: true,
          tracking: updated,
          message: 'Tracking updated'
        });

      case 'complete':
        const completed = trackingStates.get(trackingId);
        if (!completed) {
          return NextResponse.json({ error: 'Tracking not found' }, { status: 404 });
        }

        const finalState: TrackingState = {
          ...completed,
          currentStep: 3,
          status: 'delivered',
          notifications: [
            ...completed.notifications,
            {
              id: `notif_${Date.now()}`,
              message: 'Your hookah is ready and has been delivered to your table!',
              timestamp: now.toISOString(),
              type: 'success'
            }
          ]
        };

        trackingStates.set(trackingId, finalState);

        return NextResponse.json({
          success: true,
          tracking: finalState,
          message: 'Hookah delivered successfully'
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Tracking API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    const loungeId = searchParams.get('loungeId');
    const tableId = searchParams.get('tableId');

    if (!sessionId || !loungeId || !tableId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const trackingId = `${sessionId}_${loungeId}_${tableId}`;
    const tracking = trackingStates.get(trackingId);

    if (!tracking) {
      return NextResponse.json({ error: 'Tracking not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      tracking
    });

  } catch (error) {
    console.error('Tracking GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
