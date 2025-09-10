import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      action, 
      sessionId, 
      tableId, 
      tableType,
      customerName,
      flavorMix, 
      prepStaffId, 
      basePrice,
      totalPrice,
      capacity,
      status,
      metadata 
    } = body;

    switch (action) {
      case 'create':
        if (!sessionId || !tableId) {
          return NextResponse.json({ 
            error: "Missing required fields: sessionId, tableId" 
          }, { status: 400 });
        }

        // Create enhanced session object that syncs with dashboard
        const session = {
          id: sessionId,
          tableId: tableId,
          tableType: tableType || 'unknown',
          customerName: customerName || 'Guest',
          flavorMix: flavorMix || 'Premium Mix',
          prepStaffId: prepStaffId || 'staff_001',
          basePrice: basePrice || 20.00,
          totalPrice: totalPrice || 20.00,
          capacity: capacity || 1,
          status: status || 'preparing',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          // Session flow: preparing → delivered → active
          flow: {
            preparing: { status: 'preparing', timestamp: new Date().toISOString() },
            delivered: null, // Will be set when BOH completes prep
            active: null,    // Will be set when FOH starts session
            completed: null  // Will be set when session ends
          },
          // Timer data for active sessions
          timer: {
            startTime: null,
            duration: 0, // in seconds
            isActive: false
          },
          // QR check-in data
          qrCode: metadata?.qrCode || `checkin_${sessionId}`,
          // Stripe integration data
          stripe: {
            priceId: `price_${tableType}_${capacity}`,
            amount: Math.round((totalPrice || 20) * 100), // Convert to cents
            currency: 'usd'
          },
          metadata: metadata || {}
        };

        // In a real application, you would save this to a database
        console.log('Enhanced fire session created:', session);

        return NextResponse.json({ 
          success: true, 
          session: session,
          message: 'Fire session created successfully',
          dashboardSync: {
            tableId: tableId,
            customerName: customerName,
            price: totalPrice,
            status: 'preparing'
          }
        });

      case 'update_status':
        // Handle status updates (preparing → delivered → active)
        const { newStatus, sessionId: updateSessionId } = body;
        console.log(`Updating session ${updateSessionId} to status: ${newStatus}`);
        
        return NextResponse.json({
          success: true,
          message: `Session ${updateSessionId} updated to ${newStatus}`,
          session: {
            id: updateSessionId,
            status: newStatus,
            updatedAt: new Date().toISOString()
          }
        });

      case 'start_timer':
        // Handle starting the active session timer
        const { sessionId: timerSessionId } = body;
        console.log(`Starting timer for session ${timerSessionId}`);
        
        return NextResponse.json({
          success: true,
          message: `Timer started for session ${timerSessionId}`,
          timer: {
            startTime: new Date().toISOString(),
            isActive: true
          }
        });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Fire session API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (sessionId) {
      // Get specific session (mock data for now)
      const session = {
        id: sessionId,
        tableId: 'T-001',
        flavorMix: 'Default Mix',
        status: 'active',
        createdAt: new Date().toISOString()
      };
      return NextResponse.json({ session });
    }

    // Get all sessions (mock data for now)
    const sessions = [
      {
        id: 'session_001',
        tableId: 'T-001',
        flavorMix: 'Blue Mist + Mint',
        status: 'active',
        createdAt: new Date().toISOString()
      }
    ];
    
    return NextResponse.json({ 
      sessions: sessions,
      message: 'Fire sessions retrieved successfully'
    });

  } catch (error: any) {
    console.error('Fire session query error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
