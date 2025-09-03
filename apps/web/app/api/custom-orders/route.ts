// apps/web/app/api/custom-orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { customOrderLogic } from '../../../lib/customOrderLogic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'dashboard':
        const dashboardData = customOrderLogic.getDashboardData();
        return NextResponse.json({
          success: true,
          data: dashboardData
        });

      case 'trending':
        const trendingFlavors = customOrderLogic.getTrendingFlavors();
        return NextResponse.json({
          success: true,
          data: trendingFlavors
        });

      case 'popular':
        const popularFlavors = customOrderLogic.getPopularFlavors();
        return NextResponse.json({
          success: true,
          data: popularFlavors
        });

      case 'analytics':
        const analytics = customOrderLogic.getFlavorAnalytics();
        return NextResponse.json({
          success: true,
          data: analytics
        });

      default:
        return NextResponse.json({
          success: true,
          data: {
            message: 'Custom Order Logic API active',
            endpoints: ['dashboard', 'trending', 'popular', 'analytics']
          }
        });
    }
  } catch (error) {
    console.error('Custom Order Logic API error:', error);
    return NextResponse.json(
      { success: false, error: 'Custom Order Logic API error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'process_order':
        const { tableId, flavor, amount, sessionId } = data;
        const order = customOrderLogic.processOrder(tableId, flavor, amount, sessionId);
        
        // Trigger Aliethia.Identity event if popular
        if (order.isPopular) {
          await customOrderLogic.triggerAliethiaEvent(order);
        }
        
        return NextResponse.json({
          success: true,
          data: order
        });

      case 'trigger_aliethia':
        const { orderId } = data;
        const orders = customOrderLogic.getRecentOrders(100);
        const targetOrder = orders.find(o => o.id === orderId);
        
        if (targetOrder && targetOrder.aliethiaEvent) {
          await customOrderLogic.triggerAliethiaEvent(targetOrder);
          return NextResponse.json({
            success: true,
            message: 'Aliethia.Identity event triggered'
          });
        } else {
          return NextResponse.json(
            { success: false, error: 'Order not found or not popular' },
            { status: 404 }
          );
        }

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Custom Order Logic API error:', error);
    return NextResponse.json(
      { success: false, error: 'Custom Order Logic API error' },
      { status: 500 }
    );
  }
}
