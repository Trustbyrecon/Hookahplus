import { NextRequest, NextResponse } from 'next/server';

// Mock staff alerts storage (in production, this would be a database)
let staffAlerts: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tableId, alertType, message, timestamp, priority } = body;

    // Validate required fields
    if (!tableId || !alertType || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: tableId, alertType, message' },
        { status: 400 }
      );
    }

    // Create alert object
    const alert = {
      id: Date.now(),
      tableId,
      alertType,
      message,
      timestamp: timestamp || new Date().toISOString(),
      priority: priority || 'normal',
      status: 'received',
      createdAt: new Date().toISOString()
    };

    // Store alert
    staffAlerts.unshift(alert);
    
    // Keep only last 100 alerts
    if (staffAlerts.length > 100) {
      staffAlerts = staffAlerts.slice(0, 100);
    }

    // In production, you would:
    // 1. Save to database
    // 2. Send real-time notification to staff
    // 3. Log to monitoring system
    // 4. Send push notification to staff devices

    console.log('Staff Alert Received:', alert);

    return NextResponse.json({
      success: true,
      alert,
      message: 'Alert sent to staff successfully'
    });

  } catch (error) {
    console.error('Error processing staff alert:', error);
    return NextResponse.json(
      { error: 'Failed to process staff alert' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tableId = searchParams.get('tableId');
    const limit = parseInt(searchParams.get('limit') || '50');

    let filteredAlerts = staffAlerts;

    // Filter by tableId if provided
    if (tableId) {
      filteredAlerts = staffAlerts.filter(alert => alert.tableId === tableId);
    }

    // Limit results
    filteredAlerts = filteredAlerts.slice(0, limit);

    return NextResponse.json({
      success: true,
      alerts: filteredAlerts,
      total: filteredAlerts.length
    });

  } catch (error) {
    console.error('Error fetching staff alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch staff alerts' },
      { status: 500 }
    );
  }
}
