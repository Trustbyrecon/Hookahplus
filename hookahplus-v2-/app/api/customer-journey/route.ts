// app/api/customer-journey/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { customerJourneyManager, CustomerBooking, BOHOperation } from '../../../lib/customer-journey';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET - Retrieve customer journey data
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'all';
    const bookingId = searchParams.get('bookingId');

    switch (action) {
      case 'all':
        const allBookings = await customerJourneyManager.getAllBookings();
        return NextResponse.json({ 
          success: true, 
          data: allBookings,
          count: allBookings.length 
        });

      case 'active':
        const activeBookings = await customerJourneyManager.getActiveBookings();
        return NextResponse.json({ 
          success: true, 
          data: activeBookings,
          count: activeBookings.length 
        });

      case 'dashboard':
        const dashboardData = customerJourneyManager.getDashboardData();
        return NextResponse.json({ 
          success: true, 
          data: dashboardData 
        });

      case 'boh-operations':
        if (!bookingId) {
          return NextResponse.json({ 
            error: 'bookingId is required for BOH operations' 
          }, { status: 400 });
        }
        const operations = customerJourneyManager.getBOHOperations(bookingId);
        return NextResponse.json({ 
          success: true, 
          data: operations 
        });

      default:
        return NextResponse.json({ 
          error: 'Invalid action parameter' 
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Customer journey API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// POST - Create or update customer journey data
export async function POST(req: NextRequest) {
  try {
    console.log('[CUSTOMER_JOURNEY_API] POST request received');
    const body = await req.json();
    console.log('[CUSTOMER_JOURNEY_API] Request body:', body);
    const { action, data } = body;

    switch (action) {
      case 'create-booking':
        console.log('[CUSTOMER_JOURNEY_API] Creating booking with data:', data);
        const booking = await customerJourneyManager.createBookingFromLayoutPreview(data);
        console.log('[CUSTOMER_JOURNEY_API] Booking created:', booking);
        return NextResponse.json({ 
          success: true, 
          data: booking 
        });

      case 'update-booking-status':
        const { bookingId, status, stage } = data;
        await customerJourneyManager.updateBookingStatus(bookingId, status, stage);
        return NextResponse.json({ 
          success: true, 
          message: 'Booking status updated' 
        });

      case 'add-boh-operation':
        customerJourneyManager.addBOHOperation(data);
        return NextResponse.json({ 
          success: true, 
          message: 'BOH operation added' 
        });

      default:
        return NextResponse.json({ 
          error: 'Invalid action' 
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Customer journey API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
