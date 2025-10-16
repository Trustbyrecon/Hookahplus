/**
 * KTL-4 Reconciliation API Endpoint
 * 
 * Handles settlement reconciliation and orphaned charge detection
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
// import { prisma } from '@/lib/db';
import { ktl4GhostLog, createKtl4RepairRun } from '@/lib/ktl4-ghostlog';

const ReconciliationSchema = z.object({
  action: z.enum(['run_reconciliation', 'fix_orphaned', 'manual_match']),
  operatorId: z.string().optional(),
  stripeChargeId: z.string().optional(),
  posTicketId: z.string().optional(),
  sessionId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parse = ReconciliationSchema.safeParse(body);

    if (!parse.success) {
      return NextResponse.json({ 
        success: false, 
        error: parse.error.flatten() 
      }, { status: 400 });
    }

    const { action, operatorId, stripeChargeId, posTicketId, sessionId } = parse.data;

    switch (action) {
      case 'run_reconciliation':
        return await runReconciliation(operatorId);

      case 'fix_orphaned':
        return await fixOrphanedCharges(operatorId);

      case 'manual_match':
        if (!stripeChargeId || !posTicketId) {
          return NextResponse.json({ 
            success: false, 
            error: 'stripeChargeId and posTicketId required for manual match' 
          }, { status: 400 });
        }
        return await manualMatch(stripeChargeId, posTicketId, operatorId);

      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid action' 
        }, { status: 400 });
    }

  } catch (error) {
    console.error('[KTL-4 Reconciliation API] Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'status';

    switch (action) {
      case 'status':
        // Get reconciliation status
        const orphanedCount = await prisma.settlementReconciliation.count({
          where: { status: 'orphaned' }
        });
        const pendingCount = await prisma.settlementReconciliation.count({
          where: { status: 'pending' }
        });
        const matchedCount = await prisma.settlementReconciliation.count({
          where: { status: 'matched' }
        });

        return NextResponse.json({
          success: true,
          status: {
            orphaned: orphanedCount,
            pending: pendingCount,
            matched: matchedCount,
            total: orphanedCount + pendingCount + matchedCount
          }
        });

      case 'orphaned':
        // Get orphaned charges
        const limit = parseInt(searchParams.get('limit') || '50');
        const orphanedCharges = await prisma.settlementReconciliation.findMany({
          where: { status: 'orphaned' },
          orderBy: { createdAt: 'desc' },
          take: limit
        });

        return NextResponse.json({
          success: true,
          orphanedCharges
        });

      case 'mismatches':
        // Get recent mismatches
        const mismatches = await prisma.settlementReconciliation.findMany({
          where: {
            status: { in: ['orphaned', 'pending'] },
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 100
        });

        return NextResponse.json({
          success: true,
          mismatches
        });

      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid action' 
        }, { status: 400 });
    }

  } catch (error) {
    console.error('[KTL-4 Reconciliation API] Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

/**
 * Run full reconciliation process
 */
async function runReconciliation(operatorId?: string) {
  const repairRunId = createKtl4RepairRun();
  
  // Find orphaned charges (Stripe charges without POS tickets)
  const orphanedCharges = await prisma.settlementReconciliation.findMany({
    where: { status: 'orphaned' }
  });

  // Find pending charges that might have been matched
  const pendingCharges = await prisma.settlementReconciliation.findMany({
    where: { status: 'pending' }
  });

  let fixedCount = 0;
  const fixes: any[] = [];

  // Try to match pending charges with POS tickets
  for (const charge of pendingCharges) {
    if (charge.stripeChargeId) {
      // Look for matching POS ticket
      const matchingTicket = await prisma.posTicket.findFirst({
        where: { stripeChargeId: charge.stripeChargeId }
      });

      if (matchingTicket) {
        // Update reconciliation record
        await prisma.settlementReconciliation.update({
          where: { id: charge.id },
          data: {
            status: 'matched',
            posTicketId: matchingTicket.ticketId,
            reconciledAt: new Date()
          }
        });

        fixedCount++;
        fixes.push({
          chargeId: charge.stripeChargeId,
          ticketId: matchingTicket.ticketId,
          amount: charge.amountCents
        });
      }
    }
  }

  // Log reconciliation run
  await ktl4GhostLog.logEvent({
    flowName: 'payment_settlement',
    eventType: 'reconciliation_run',
    status: 'success',
    details: {
      repairRunId,
      orphanedCount: orphanedCharges.length,
      pendingCount: pendingCharges.length,
      fixedCount,
      fixes
    },
    operatorId
  });

  return NextResponse.json({
    success: true,
    result: {
      repairRunId,
      orphanedCount: orphanedCharges.length,
      pendingCount: pendingCharges.length,
      fixedCount,
      fixes
    }
  });
}

/**
 * Fix orphaned charges by creating POS tickets from metadata
 */
async function fixOrphanedCharges(operatorId?: string) {
  const repairRunId = createKtl4RepairRun();
  
  const orphanedCharges = await prisma.settlementReconciliation.findMany({
    where: { status: 'orphaned' }
  });

  let fixedCount = 0;
  const fixes: any[] = [];

  for (const charge of orphanedCharges) {
    if (charge.stripeChargeId && charge.sessionId) {
      // Create POS ticket from charge metadata
      const ticketId = `repair_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const posTicket = await prisma.posTicket.create({
        data: {
          ticketId,
          sessionId: charge.sessionId,
          stripeChargeId: charge.stripeChargeId,
          amountCents: charge.amountCents,
          status: 'paid',
          posSystem: 'repair_generated',
          items: JSON.stringify([{ name: 'Hookah Session', price: charge.amountCents }])
        }
      });

      // Update reconciliation record
      await prisma.settlementReconciliation.update({
        where: { id: charge.id },
        data: {
          status: 'reconciled',
          posTicketId: ticketId,
          repairRunId,
          reconciledAt: new Date()
        }
      });

      fixedCount++;
      fixes.push({
        chargeId: charge.stripeChargeId,
        ticketId,
        amount: charge.amountCents
      });
    }
  }

  // Log repair action
  await ktl4GhostLog.logRepairAction(
    'payment_settlement',
    'fix_orphaned_charges',
    'system',
    operatorId || 'system',
    {
      repairRunId,
      orphanedCount: orphanedCharges.length,
      fixedCount,
      fixes
    }
  );

  return NextResponse.json({
    success: true,
    result: {
      repairRunId,
      orphanedCount: orphanedCharges.length,
      fixedCount,
      fixes
    }
  });
}

/**
 * Manually match a Stripe charge with a POS ticket
 */
async function manualMatch(stripeChargeId: string, posTicketId: string, operatorId?: string) {
  const repairRunId = createKtl4RepairRun();

  // Find the reconciliation record
  const reconciliation = await prisma.settlementReconciliation.findFirst({
    where: { stripeChargeId }
  });

  if (!reconciliation) {
    return NextResponse.json({ 
      success: false, 
      error: 'Reconciliation record not found' 
    }, { status: 404 });
  }

  // Update reconciliation record
  await prisma.settlementReconciliation.update({
    where: { id: reconciliation.id },
    data: {
      status: 'matched',
      posTicketId,
      repairRunId,
      reconciledAt: new Date()
    }
  });

  // Log manual match
  await ktl4GhostLog.logRepairAction(
    'payment_settlement',
    'manual_match',
    reconciliation.id,
    operatorId || 'system',
    {
      repairRunId,
      stripeChargeId,
      posTicketId,
      amount: reconciliation.amountCents
    }
  );

  return NextResponse.json({
    success: true,
    result: {
      repairRunId,
      stripeChargeId,
      posTicketId,
      amount: reconciliation.amountCents
    }
  });
}
