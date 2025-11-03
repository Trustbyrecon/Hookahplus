/**
 * Loyalty Credit Issuance Helper
 * 
 * Agent: Jules
 * 
 * Helper function to issue loyalty credits directly (without HTTP overhead).
 * Used by POS reconciliation job for auto-issuance.
 */

import { prisma } from '../../lib/prisma';

interface IssueLoyaltyCreditsParams {
  customerId?: string;
  customerPhone?: string;
  amountCents: number;
  source?: 'POS' | 'MANUAL' | 'REFUND' | 'ADJUSTMENT';
  sessionId?: string;
  posTicketId?: string;
  stripeChargeId?: string;
  metadata?: Record<string, any>;
}

/**
 * Issue loyalty credits directly (for internal use)
 * 
 * This function performs the same logic as the API endpoint but without HTTP overhead.
 * Used by POS reconciliation job for auto-issuance.
 */
export async function issueLoyaltyCredits(
  params: IssueLoyaltyCreditsParams
): Promise<{
  success: boolean;
  transactionId?: string;
  accountId?: string;
  balanceAfterCents?: number;
  error?: string;
}> {
  try {
    const {
      customerId,
      customerPhone,
      amountCents,
      source = 'POS',
      sessionId,
      posTicketId,
      stripeChargeId,
      metadata,
    } = params;

    // Validate required fields
    if (!amountCents || amountCents <= 0) {
      return {
        success: false,
        error: 'amountCents must be positive',
      };
    }

    // Validate at least one customer identifier
    if (!customerId && !customerPhone) {
      return {
        success: false,
        error: 'Either customerId or customerPhone is required',
      };
    }

    // Use Prisma transaction for ACID compliance
    const result = await prisma.$transaction(async (tx) => {
      // Find or create LoyaltyAccount
      let account = await tx.loyaltyAccount.findFirst({
        where: {
          OR: [
            customerId ? { customerId } : {},
            customerPhone ? { customerPhone } : {},
          ].filter(condition => Object.keys(condition).length > 0),
        },
      });

      // Create account if not found
      if (!account) {
        account = await tx.loyaltyAccount.create({
          data: {
            customerId: customerId || null,
            customerPhone: customerPhone || null,
            balanceCents: 0,
            totalEarnedCents: 0,
            totalRedeemedCents: 0,
            isActive: true,
          },
        });

        // Create wallet cache
        await tx.loyaltyWallet.create({
          data: {
            accountId: account.id,
            balanceCents: 0,
            lastTransactionId: null,
          },
        });
      }

      // Get current balance
      const balanceBeforeCents = account.balanceCents;
      const balanceAfterCents = balanceBeforeCents + amountCents;

      // Create transaction record
      const transaction = await tx.loyaltyTransaction.create({
        data: {
          accountId: account.id,
          type: 'ISSUE',
          amountCents: amountCents,
          balanceBeforeCents,
          balanceAfterCents,
          source,
          sessionId: sessionId || null,
          posTicketId: posTicketId || null,
          stripeChargeId: stripeChargeId || null,
          metadata: metadata ? JSON.stringify(metadata) : null,
          version: 1,
        },
      });

      // Update account balance atomically
      await tx.loyaltyAccount.update({
        where: { id: account.id },
        data: {
          balanceCents: balanceAfterCents,
          totalEarnedCents: account.totalEarnedCents + amountCents,
        },
      });

      // Update wallet cache
      await tx.loyaltyWallet.update({
        where: { accountId: account.id },
        data: {
          balanceCents: balanceAfterCents,
          lastTransactionId: transaction.id,
        },
      });

      return {
        success: true,
        transactionId: transaction.id,
        accountId: account.id,
        balanceAfterCents,
      };
    });

    return result;

  } catch (error) {
    console.error('[Loyalty Issue Helper] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Calculate loyalty amount from transaction amount
 * 
 * Rules:
 * - 1% of transaction amount (configurable)
 * - Minimum: 1 cent per transaction
 * - Round to nearest cent
 */
export function calculateLoyaltyAmount(transactionAmountCents: number): number {
  const loyaltyRate = 0.01; // 1% - can be made configurable via env var
  const loyaltyAmount = Math.round(transactionAmountCents * loyaltyRate);
  return Math.max(1, loyaltyAmount); // Minimum 1 cent
}

