import { NextRequest, NextResponse } from 'next/server';
import { runReconciliationJob } from '../../../../lib/reconciliation';

/**
 * POS Reconciliation API Endpoint
 * 
 * Agent: Noor
 * 
 * POST /api/pos/reconcile - Run reconciliation job
 * GET /api/pos/reconcile - Get reconciliation status
 */
export async function POST(request: NextRequest) {
  try {
    const result = await runReconciliationJob();

    return NextResponse.json({
      success: true,
      data: result,
      message: `Reconciliation rate: ${(result.reconciliationRate * 100).toFixed(2)}%`,
    });
  } catch (error) {
    console.error('[POS Reconciliation API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to run reconciliation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    // Get recent reconciliation records
    const recentReconciliations = await prisma.settlementReconciliation.findMany({
      take: 100,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate current reconciliation rate
    const total = recentReconciliations.length;
    const matched = recentReconciliations.filter((r) => r.status === 'matched').length;
    const reconciliationRate = total > 0 ? matched / total : 0;

    // Get orphaned charges count
    const orphanedCharges = recentReconciliations.filter((r) => r.status === 'orphaned').length;

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      data: {
        reconciliationRate,
        total,
        matched,
        orphaned: orphanedCharges,
        recentReconciliations: recentReconciliations.slice(0, 10),
      },
    });
  } catch (error) {
    console.error('[POS Reconciliation API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch reconciliation status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

