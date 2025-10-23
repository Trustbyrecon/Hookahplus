import { NextRequest, NextResponse } from 'next/server';
import { makePosAdapter } from '../../../../lib/pos/factory';

/** Toast Configuration API
 * 
 * Provides Toast-specific configuration and status endpoints:
 * - Restaurant configuration
 * - Menu items sync
 * - Health check
 * - Capabilities
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'status';
    const venueId = searchParams.get('venueId') || 'default-venue';

    const toastAdapter = makePosAdapter('toast', venueId);

    switch (action) {
      case 'status':
        return await getStatus(toastAdapter);
        
      case 'capabilities':
        return await getCapabilities(toastAdapter);
        
      case 'restaurant-config':
        return await getRestaurantConfig(toastAdapter);
        
      case 'menu-items':
        return await getMenuItems(toastAdapter);
        
      case 'health':
        return await getHealthCheck(toastAdapter);
        
      default:
        return NextResponse.json(
          { error: 'Invalid action. Available: status, capabilities, restaurant-config, menu-items, health' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[Toast Config] Error:', error);
    return NextResponse.json(
      { error: 'Toast configuration error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function getStatus(toastAdapter: any) {
  try {
    const capabilities = await toastAdapter.capabilities();
    return NextResponse.json({
      status: 'operational',
      provider: 'toast',
      capabilities,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      provider: 'toast',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}

async function getCapabilities(toastAdapter: any) {
  try {
    const capabilities = await toastAdapter.capabilities();
    return NextResponse.json({
      capabilities,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get capabilities', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function getRestaurantConfig(toastAdapter: any) {
  try {
    const config = await toastAdapter.getRestaurantConfig();
    return NextResponse.json({
      config,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get restaurant config', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function getMenuItems(toastAdapter: any) {
  try {
    const menuItems = await toastAdapter.getMenuItems();
    return NextResponse.json({
      menuItems,
      count: menuItems?.length || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get menu items', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function getHealthCheck(toastAdapter: any) {
  try {
    // Test basic connectivity and configuration
    const capabilities = await toastAdapter.capabilities();
    const config = await toastAdapter.getRestaurantConfig();
    
    return NextResponse.json({
      status: 'healthy',
      provider: 'toast',
      checks: {
        capabilities: !!capabilities,
        restaurantConfig: !!config,
        environment: {
          baseUrl: !!process.env.TOAST_BASE_URL,
          apiKey: !!process.env.TOAST_API_KEY,
          restaurantGuid: !!process.env.TOAST_RESTAURANT_GUID,
          webhookSecret: !!process.env.TOAST_WEBHOOK_SECRET
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      provider: 'toast',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}
