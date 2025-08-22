// app/api/sessions/route.ts
import { NextResponse } from "next/server";
import { getAllSessions, getSessionsByState, getSessionsByTable } from "../../../lib/sessionState";
import { getActiveSessions, updateCoalStatus, addFlavorToSession, startSession, handleRefill, getFlavorMixLibrary, getCustomerPreviousSessions } from "../../../lib/orders";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state');
    const table = searchParams.get('table');
    const customerId = searchParams.get('customerId');

    let sessions;
    
    if (state) {
      sessions = getSessionsByState(state as any);
    } else if (table) {
      sessions = getSessionsByTable(table);
    } else if (customerId) {
      // Filter sessions by customer ID
      sessions = getAllSessions().filter(s => s.meta.customerId === customerId);
    } else {
      sessions = getAllSessions();
    }

    return NextResponse.json({ 
      success: true,
      sessions,
      count: sessions.length
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, orderId, data } = body;
    
    switch (action) {
      case 'start_session':
        startSession(orderId);
        return NextResponse.json({ success: true, message: 'Session started' });
        
      case 'update_coal_status':
        updateCoalStatus(orderId, data.status);
        return NextResponse.json({ success: true, message: 'Coal status updated' });
        
      case 'handle_refill':
        const refillSuccess = handleRefill(orderId);
        return NextResponse.json({ 
          success: refillSuccess, 
          message: refillSuccess ? 'Refill completed, status reset to active' : 'Refill failed or not needed' 
        });
        
      case 'add_flavor':
        addFlavorToSession(orderId, data.flavor, data.rate);
        return NextResponse.json({ success: true, message: 'Flavor added' });
        
      case 'get_flavor_suggestions':
        const flavorLibrary = getFlavorMixLibrary();
        const customerHistory = data.customerId ? getCustomerPreviousSessions(data.customerId, orderId) : [];
        return NextResponse.json({ 
          success: true, 
          flavorLibrary,
          customerHistory
        });
        
      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid action' 
        }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
