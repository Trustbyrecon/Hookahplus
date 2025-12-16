/**
 * Session Adjustments Service
 * Manages discounts, comps, surcharges, and refunds with approval workflow
 */

import { prisma } from './db';
import { logSessionEvent } from './session-events';

export type AdjustmentType = 'DISCOUNT' | 'COMP' | 'SURCHARGE' | 'REFUND';

export interface CreateAdjustmentInput {
  sessionId: string;
  adjustmentType: AdjustmentType;
  amountCents: number; // Positive for surcharge, negative for discount/comp
  reason: string;
  createdBy: string;
  requiresApproval?: boolean; // Auto-approve if false
}

export interface AdjustmentRecord {
  id: string;
  sessionId: string;
  adjustmentType: AdjustmentType;
  amountCents: number;
  reason: string;
  approvedBy: string | null;
  approvedAt: Date | null;
  createdAt: Date;
  createdBy: string;
}

/**
 * Create an adjustment
 * Comps require manager approval, discounts/surcharges can be auto-approved
 */
export async function createAdjustment(
  input: CreateAdjustmentInput
): Promise<AdjustmentRecord> {
  const { sessionId, adjustmentType, amountCents, reason, createdBy, requiresApproval } = input;

  // Validate session exists
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { id: true, loungeId: true },
  });

  if (!session) {
    throw new Error(`Session ${sessionId} not found`);
  }

  // Determine if approval is required
  const needsApproval = requiresApproval !== undefined 
    ? requiresApproval 
    : adjustmentType === 'COMP' || Math.abs(amountCents) > 5000; // Comps or > $50 require approval

  // Create adjustment
  const adjustment = await prisma.sessionAdjustment.create({
    data: {
      sessionId,
      adjustmentType,
      amountCents,
      reason,
      createdBy,
      // Only set approvedBy/approvedAt if auto-approved
      ...(needsApproval ? {} : {
        approvedBy: createdBy,
        approvedAt: new Date(),
      }),
    },
  });

  // Log session event
  await logSessionEvent({
    eventType: 'adjusted',
    sessionId,
    eventData: {
      adjustmentId: adjustment.id,
      adjustmentType,
      amountCents,
      reason,
      approved: !needsApproval,
    },
    actorId: createdBy,
    actorRole: 'staff',
  });

  return {
    id: adjustment.id,
    sessionId: adjustment.sessionId,
    adjustmentType: adjustment.adjustmentType as AdjustmentType,
    amountCents: adjustment.amountCents,
    reason: adjustment.reason,
    approvedBy: adjustment.approvedBy,
    approvedAt: adjustment.approvedAt,
    createdAt: adjustment.createdAt,
    createdBy: adjustment.createdBy,
  };
}

/**
 * Approve an adjustment (manager only)
 */
export async function approveAdjustment(
  adjustmentId: string,
  approvedBy: string
): Promise<AdjustmentRecord> {
  const adjustment = await prisma.sessionAdjustment.findUnique({
    where: { id: adjustmentId },
  });

  if (!adjustment) {
    throw new Error(`Adjustment ${adjustmentId} not found`);
  }

  if (adjustment.approvedBy) {
    throw new Error('Adjustment already approved');
  }

  // Update adjustment with approval
  const updated = await prisma.sessionAdjustment.update({
    where: { id: adjustmentId },
    data: {
      approvedBy,
      approvedAt: new Date(),
    },
  });

  // Log session event
  await logSessionEvent({
    eventType: 'adjusted',
    sessionId: adjustment.sessionId,
    eventData: {
      adjustmentId: updated.id,
      adjustmentType: updated.adjustmentType,
      amountCents: updated.amountCents,
      approved: true,
      approvedBy,
    },
    actorId: approvedBy,
    actorRole: 'manager',
  });

  return {
    id: updated.id,
    sessionId: updated.sessionId,
    adjustmentType: updated.adjustmentType as AdjustmentType,
    amountCents: updated.amountCents,
    reason: updated.reason,
    approvedBy: updated.approvedBy,
    approvedAt: updated.approvedAt,
    createdAt: updated.createdAt,
    createdBy: updated.createdBy,
  };
}

/**
 * Get all adjustments for a session (ledger)
 */
export async function getSessionAdjustments(
  sessionId: string
): Promise<AdjustmentRecord[]> {
  const adjustments = await prisma.sessionAdjustment.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'asc' },
  });

  return adjustments.map(adj => ({
    id: adj.id,
    sessionId: adj.sessionId,
    adjustmentType: adj.adjustmentType as AdjustmentType,
    amountCents: adj.amountCents,
    reason: adj.reason,
    approvedBy: adj.approvedBy,
    approvedAt: adj.approvedAt,
    createdAt: adj.createdAt,
    createdBy: adj.createdBy,
  }));
}

/**
 * Get session ledger (adjustments + pricing snapshot)
 */
export async function getSessionLedger(sessionId: string): Promise<{
  adjustments: AdjustmentRecord[];
  totalAdjustmentsCents: number;
  pricingSnapshot: any | null;
}> {
  const [adjustments, pricingSnapshot] = await Promise.all([
    getSessionAdjustments(sessionId),
    prisma.pricingSnapshot.findUnique({
      where: { sessionId },
    }),
  ]);

  const totalAdjustmentsCents = adjustments
    .filter(adj => adj.approvedBy) // Only count approved adjustments
    .reduce((sum, adj) => sum + adj.amountCents, 0);

  return {
    adjustments,
    totalAdjustmentsCents,
    pricingSnapshot: pricingSnapshot ? {
      basePriceCents: pricingSnapshot.basePriceCents,
      addOnsPriceCents: pricingSnapshot.addOnsPriceCents,
      adjustmentsCents: pricingSnapshot.adjustmentsCents,
      finalPriceCents: pricingSnapshot.finalPriceCents,
      breakdown: pricingSnapshot.breakdown,
    } : null,
  };
}

