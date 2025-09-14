// apps/web/app/api/boh-delivery-prep/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      sessionId, 
      tableId, 
      orderDetails, 
      deliveryInstructions 
    } = body;

    console.log('🍳 BOH Delivery Preparation Order:', {
      sessionId,
      tableId,
      itemCount: orderDetails.items.length,
      totalAmount: orderDetails.totalAmount,
      customerName: orderDetails.customerInfo.name
    });

    // Create BOH delivery preparation order
    const bohOrder = {
      orderId: `boh_${sessionId}_${Date.now()}`,
      sessionId,
      tableId,
      status: 'PREP_QUEUED',
      orderDetails: {
        ...orderDetails,
        createdAt: new Date().toISOString(),
        assignedStaff: null,
        prepStartTime: null,
        estimatedCompletionTime: new Date(Date.now() + orderDetails.estimatedPrepTime * 60000).toISOString()
      },
      deliveryInstructions: {
        ...deliveryInstructions,
        status: 'PENDING_DELIVERY',
        assignedRunner: null,
        deliveryStartTime: null
      },
      trustLevel: 'HIGH', // High trust for pre-order station
      source: 'preorder_station',
      metadata: {
        orchestration: 'reflexive',
        priority: orderDetails.priority,
        customerType: 'preorder',
        orderComplexity: orderDetails.items.length > 3 ? 'complex' : 'standard'
      }
    };

    // Store in BOH order queue (in production, this would go to a database)
    if (typeof global !== 'undefined') {
      if (!global.bohOrderQueue) {
        global.bohOrderQueue = new Map();
      }
      global.bohOrderQueue.set(bohOrder.orderId, bohOrder);
    }

    // Log for BOH staff visibility
    console.log('📋 BOH Order Queue Updated:', {
      orderId: bohOrder.orderId,
      tableId: bohOrder.tableId,
      items: orderDetails.items.map((item: any) => item.name).join(', '),
      totalAmount: `$${(orderDetails.totalAmount / 100).toFixed(2)}`,
      estimatedPrepTime: `${orderDetails.estimatedPrepTime} minutes`,
      customerName: orderDetails.customerInfo.name
    });

    return NextResponse.json({ 
      success: true, 
      orderId: bohOrder.orderId,
      message: 'BOH delivery preparation order created successfully',
      bohOrder
    });

  } catch (error: any) {
    console.error('❌ BOH Delivery Prep Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create BOH delivery preparation order' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Get all BOH orders for dashboard display
    if (typeof global !== 'undefined' && global.bohOrderQueue) {
      const orders = Array.from(global.bohOrderQueue.values());
      return NextResponse.json({ 
        success: true, 
        orders,
        count: orders.length
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      orders: [],
      count: 0
    });

  } catch (error: any) {
    console.error('❌ BOH Order Fetch Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch BOH orders' },
      { status: 500 }
    );
  }
}
