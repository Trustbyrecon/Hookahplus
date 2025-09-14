// hookahplus-v2-/app/api/mobile-qr/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory store for mobile QR orders
let mobileOrders: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tableId, customerName, partySize, flavor } = body;

    // Generate mobile QR order
    const mobileOrder = {
      id: `mobile_${Date.now()}`,
      tableId: tableId || `T-${Math.floor(Math.random() * 10) + 1}`,
      customerName: customerName || `Mobile Customer ${Math.floor(Math.random() * 100)}`,
      partySize: partySize || Math.floor(Math.random() * 4) + 1,
      flavor: flavor || ['Double Apple', 'Mint', 'Strawberry', 'Grape'][Math.floor(Math.random() * 4)],
      status: 'waiting',
      createdAt: new Date().toISOString(),
      estimatedWait: Math.floor(Math.random() * 10) + 1,
      priority: (partySize || 2) > 4 ? 'high' : 'normal'
    };

    // Add to orders
    mobileOrders.push(mobileOrder);

    return NextResponse.json({
      success: true,
      message: `Mobile QR order created for ${mobileOrder.tableId}! Check the prep queue.`,
      order: mobileOrder,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Mobile QR API error:', error);
    return NextResponse.json({
      error: 'Failed to create mobile QR order',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      orders: mobileOrders,
      count: mobileOrders.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Mobile QR GET error:', error);
    return NextResponse.json({
      error: 'Failed to fetch mobile QR orders',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
