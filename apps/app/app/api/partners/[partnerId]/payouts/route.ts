import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ partnerId: string }> }
) {
  try {
    const { partnerId } = await params;
    const { searchParams } = new URL(req.url);
    const year = searchParams.get('year') || new Date().getFullYear().toString();

    // TODO: Replace with real database queries
    const mockPayouts = [
      {
        id: 'payout_001',
        partnerId,
        period: '2025-01',
        gross: 2500.00,
        revSharePct: 5,
        net: 125.00,
        status: 'paid',
        createdAt: '2025-01-31T00:00:00Z',
        paidAt: '2025-02-05T00:00:00Z'
      },
      {
        id: 'payout_002',
        partnerId,
        period: '2024-12',
        gross: 1800.00,
        revSharePct: 4,
        net: 72.00,
        status: 'paid',
        createdAt: '2024-12-31T00:00:00Z',
        paidAt: '2025-01-05T00:00:00Z'
      },
      {
        id: 'payout_003',
        partnerId,
        period: '2024-11',
        gross: 3200.00,
        revSharePct: 4,
        net: 128.00,
        status: 'paid',
        createdAt: '2024-11-30T00:00:00Z',
        paidAt: '2024-12-05T00:00:00Z'
      }
    ];

    // Calculate totals
    const totalGross = mockPayouts.reduce((sum, p) => sum + p.gross, 0);
    const totalNet = mockPayouts.reduce((sum, p) => sum + p.net, 0);
    const pendingPayouts = mockPayouts.filter(p => p.status === 'pending');
    const nextPayout = pendingPayouts.length > 0 ? pendingPayouts[0] : null;

    return NextResponse.json({
      success: true,
      payouts: mockPayouts,
      summary: {
        totalGross,
        totalNet,
        totalPayouts: mockPayouts.length,
        nextPayout
      }
    });

  } catch (error) {
    console.error('Get payouts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payouts' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ partnerId: string }> }
) {
  try {
    const { partnerId } = await params;
    const { action } = await req.json();

    if (action === 'export_csv') {
      // TODO: Generate actual CSV export
      const csvData = `Period,Gross Revenue,Rev Share %,Net Amount,Status,Paid Date
2025-01,2500.00,5,125.00,paid,2025-02-05
2024-12,1800.00,4,72.00,paid,2025-01-05
2024-11,3200.00,4,128.00,paid,2024-12-05`;

      return new NextResponse(csvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="payouts_${partnerId}_${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Payout action error:', error);
    return NextResponse.json(
      { error: 'Failed to process payout action' },
      { status: 500 }
    );
  }
}
