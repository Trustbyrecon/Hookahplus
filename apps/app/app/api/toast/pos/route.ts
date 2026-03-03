import { NextRequest, NextResponse } from 'next/server';
import { makePosAdapter } from '../../../../lib/pos/factory';
import type { HpOrder, HpItem, ExternalTender } from '../../../../lib/pos/types';

/** Toast POS Integration API
 * 
 * Handles Toast-specific POS operations:
 * - Create/attach checks (orders)
 * - Add items to checks
 * - Close checks with external payments
 * - Get check details
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, venueId = 'default-venue', ...data } = body;

    const toastAdapter = makePosAdapter('toast', venueId);

    switch (action) {
      case 'attach-check':
        return await attachCheck(toastAdapter, data);
        
      case 'add-items':
        return await addItems(toastAdapter, data);
        
      case 'close-check':
        return await closeCheck(toastAdapter, data);
        
      case 'get-check':
        return await getCheck(toastAdapter, data);
        
      case 'test-integration':
        return await testIntegration(toastAdapter, data);
        
      default:
        return NextResponse.json(
          { error: 'Invalid action. Available: attach-check, add-items, close-check, get-check, test-integration' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[Toast POS] Error:', error);
    return NextResponse.json(
      { error: 'Toast POS operation error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function attachCheck(toastAdapter: any, data: { hpOrder: HpOrder }) {
  try {
    const { hpOrder } = data;
    
    if (!hpOrder) {
      return NextResponse.json(
        { error: 'hpOrder is required' },
        { status: 400 }
      );
    }

    const result = await toastAdapter.attachOrder(hpOrder);
    
    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to attach check', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function addItems(toastAdapter: any, data: { checkGuid: string; items: HpItem[] }) {
  try {
    const { checkGuid, items } = data;
    
    if (!checkGuid || !items) {
      return NextResponse.json(
        { error: 'checkGuid and items are required' },
        { status: 400 }
      );
    }

    await toastAdapter.upsertItems(checkGuid, items);
    
    return NextResponse.json({
      success: true,
      message: `Added ${items.length} items to check ${checkGuid}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to add items', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function closeCheck(toastAdapter: any, data: { checkGuid: string; tender?: ExternalTender }) {
  try {
    const { checkGuid, tender } = data;
    
    if (!checkGuid) {
      return NextResponse.json(
        { error: 'checkGuid is required' },
        { status: 400 }
      );
    }

    await toastAdapter.closeOrder(checkGuid, tender);
    
    return NextResponse.json({
      success: true,
      message: `Check ${checkGuid} closed successfully`,
      tender: tender ? 'External payment recorded' : 'No external payment',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to close check', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function getCheck(toastAdapter: any, data: { checkGuid: string }) {
  try {
    const { checkGuid } = data;
    
    if (!checkGuid) {
      return NextResponse.json(
        { error: 'checkGuid is required' },
        { status: 400 }
      );
    }

    const checkDetails = await toastAdapter.getCheckDetails(checkGuid);
    
    return NextResponse.json({
      success: true,
      check: checkDetails,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get check details', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function testIntegration(toastAdapter: any, data: any) {
  try {
    // Test Toast integration with mock data
    const testOrder: HpOrder = {
      hp_order_id: `test_${Date.now()}`,
      venue_id: data.venueId || 'test-venue',
      table: 'T-TEST',
      guest_count: 2,
      items: [
        {
          sku: 'HOOKAH_BASIC',
          name: 'Basic Hookah Session',
          qty: 1,
          unit_amount: 2500, // $25.00
          notes: 'Test order from Hookah+'
        }
      ],
      totals: {
        subtotal: 2500,
        grand_total: 2500
      },
      trust_lock: { sig: 'test-signature' }
    };

    // Test the full workflow
    const attachResult = await toastAdapter.attachOrder(testOrder);
    console.log('[Toast Test] Check attached:', attachResult);

    // Test adding items
    await toastAdapter.upsertItems(attachResult.pos_order_id, testOrder.items);
    console.log('[Toast Test] Items added');

    // Test getting check details
    const checkDetails = await toastAdapter.getCheckDetails(attachResult.pos_order_id);
    console.log('[Toast Test] Check details retrieved');

    return NextResponse.json({
      success: true,
      message: 'Toast integration test completed successfully',
      testResults: {
        attachResult,
        checkDetails,
        capabilities: await toastAdapter.capabilities()
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Toast integration test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
