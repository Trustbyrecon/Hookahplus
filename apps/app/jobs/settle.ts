/**
 * POS Reconciliation Job
 * 
 * Agent: Noor (Builder)
 * Mission: Match Stripe charges ↔ POS tickets and achieve ≥95% reconciliation rate
 * 
 * This job:
 * - Fetches Stripe charges without matching POS tickets
 * - Fetches POS tickets without matching Stripe charges
 * - Attempts to match by amount, session ID, timestamp window
 * - Updates SettlementReconciliation table
 * - Calculates reconciliation rate
 * - Generates orphaned charge reports
 */

import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import { FEATURE_FLAGS, validateReconciliationRate, setPosSyncReady } from '../lib/config';
import { issueLoyaltyCredits, calculateLoyaltyAmount } from '../lib/loyalty/issue-helper';
import { join } from 'path';

// Set default DATABASE_URL for local development if not set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = `file:${join(process.cwd(), 'prisma/dev.db')}`;
}

const prisma = new PrismaClient();

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil' as any,
    })
  : null;

interface ReconciliationResult {
  totalStripeCharges: number;
  totalPosTickets: number;
  matched: number;
  orphanedStripeCharges: number;
  orphanedPosTickets: number;
  reconciliationRate: number;
  pricingParity: number;
  matchedPairs: Array<{
    stripeChargeId: string;
    posTicketId: string;
    amount: number;
    matchConfidence: 'high' | 'medium' | 'low';
  }>;
  orphanedCharges: Array<{
    chargeId: string;
    amount: number;
    sessionId?: string;
    reason: string;
  }>;
}

interface MatchOptions {
  amountTolerance?: number; // cents, default 10 cents
  timeWindowMinutes?: number; // default 5 minutes
  sessionIdMatch?: boolean; // require session ID match
}

/**
 * Main reconciliation function
 */
export async function reconcilePosSettlements(
  options: MatchOptions & { testMode?: boolean; mockStripeCharges?: Stripe.Charge[] } = {}
): Promise<ReconciliationResult> {
  const {
    amountTolerance = 10, // $0.10 tolerance
    timeWindowMinutes = 5,
    sessionIdMatch = false,
    testMode = false,
    mockStripeCharges = [],
  } = options;

  // Get time window for matching
  const now = new Date();
  const windowStart = new Date(now.getTime() - timeWindowMinutes * 60 * 1000);

  // Fetch Stripe charges from last 24 hours
  let stripeCharges: Stripe.Charge[] = [];
  
  if (testMode && mockStripeCharges.length > 0) {
    // Use mock charges in test mode
    stripeCharges = mockStripeCharges;
  } else if (stripe) {
    // Fetch real Stripe charges
    try {
      const chargesResponse = await stripe.charges.list({
        limit: 100,
        created: {
          gte: Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000),
        },
      });
      stripeCharges = chargesResponse.data;
    } catch (error) {
      console.warn('[Noor] Failed to fetch Stripe charges:', error);
      // Continue with empty charges array
      stripeCharges = [];
    }
  } else if (!testMode) {
    // Only throw error if not in test mode
    throw new Error('Stripe not configured');
  }
  
  // In test mode without Stripe, we can still test POS ticket reconciliation
  if (testMode && !stripe && stripeCharges.length === 0) {
    console.log('[Noor] Test mode: Running reconciliation with POS tickets only (no Stripe charges)');
  }

  // Fetch POS tickets from database
  const posTickets = await prisma.posTicket.findMany({
    where: {
      createdAt: {
        gte: windowStart,
      },
      status: {
        in: ['paid', 'pending'],
      },
    },
  });

  // Fetch existing reconciliation records
  const existingReconciliations = await prisma.settlementReconciliation.findMany({
    where: {
      createdAt: {
        gte: windowStart,
      },
    },
  });

  const matchedStripeChargeIds = new Set(
    existingReconciliations
      .map((r) => r.stripeChargeId)
      .filter((id): id is string => id !== null)
  );
  const matchedPosTicketIds = new Set(
    existingReconciliations
      .map((r) => r.posTicketId)
      .filter((id): id is string => id !== null)
  );

  // Find unmatched Stripe charges
  const unmatchedCharges = stripeCharges.filter(
    (charge) => !matchedStripeChargeIds.has(charge.id) && charge.paid
  );

  // Find unmatched POS tickets
  const unmatchedTickets = posTickets.filter(
    (ticket) => !matchedPosTicketIds.has(ticket.ticketId)
  );

  const matchedPairs: ReconciliationResult['matchedPairs'] = [];
  const orphanedCharges: ReconciliationResult['orphanedCharges'] = [];
  const usedTicketIds = new Set<string>();

  // Match charges to tickets
  for (const charge of unmatchedCharges) {
    let bestMatch: {
      ticket: typeof posTickets[0];
      confidence: 'high' | 'medium' | 'low';
    } | null = null;

    for (const ticket of unmatchedTickets) {
      if (usedTicketIds.has(ticket.ticketId)) continue;

      const amountDiff = Math.abs(charge.amount - ticket.amountCents);
      const timeDiff = Math.abs(
        charge.created * 1000 - ticket.createdAt.getTime()
      );

      // Check amount match
      if (amountDiff > amountTolerance) continue;

      // Check time window
      if (timeDiff > timeWindowMinutes * 60 * 1000) continue;

      // Check session ID match if required
      if (sessionIdMatch) {
        const chargeSessionId = charge.metadata?.sessionId;
        if (chargeSessionId && ticket.sessionId !== chargeSessionId) continue;
      }

      // Determine confidence
      let confidence: 'high' | 'medium' | 'low' = 'medium';
      if (amountDiff === 0 && timeDiff < 60 * 1000) {
        confidence = 'high';
      } else if (amountDiff > amountTolerance / 2 || timeDiff > 2 * 60 * 1000) {
        confidence = 'low';
      }

      // Keep best match
      if (
        !bestMatch ||
        (confidence === 'high' && bestMatch.confidence !== 'high') ||
        (amountDiff < Math.abs(charge.amount - bestMatch.ticket.amountCents))
      ) {
        bestMatch = { ticket, confidence };
      }
    }

    if (bestMatch) {
      // Create reconciliation record
      await prisma.settlementReconciliation.create({
        data: {
          stripeChargeId: charge.id,
          posTicketId: bestMatch.ticket.ticketId,
          sessionId: bestMatch.ticket.sessionId || charge.metadata?.sessionId || null,
          amount: charge.amount,
          status: 'matched',
          reconciledAt: new Date(),
        },
      });

      // Update POS ticket with Stripe charge ID
      await prisma.posTicket.update({
        where: { id: bestMatch.ticket.id },
        data: {
          stripeChargeId: charge.id,
        },
      });

      // Auto-issue loyalty credits for high-confidence matches (Jules integration)
      if (bestMatch.confidence === 'high') {
        try {
          // Fetch session to get customer info
          const sessionId = bestMatch.ticket.sessionId || charge.metadata?.sessionId;
          let customerId: string | undefined;
          let customerPhone: string | undefined;

          if (sessionId) {
            const session = await prisma.session.findUnique({
              where: { id: sessionId },
              select: {
                customerRef: true,
                customerPhone: true,
              },
            });

            if (session) {
              customerId = session.customerRef || undefined;
              customerPhone = session.customerPhone || undefined;
            }
          }

          // Extract customer info from Stripe charge metadata if session not found
          if (!customerId && !customerPhone) {
            customerId = charge.metadata?.customerId || undefined;
            customerPhone = charge.metadata?.customerPhone || charge.billing_details?.phone || undefined;
          }

          // Issue loyalty credits if we have customer info
          if (customerId || customerPhone) {
            const loyaltyAmount = calculateLoyaltyAmount(charge.amount);
            const loyaltyResult = await issueLoyaltyCredits({
              customerId,
              customerPhone,
              amountCents: loyaltyAmount,
              source: 'POS',
              sessionId: sessionId || undefined,
              posTicketId: bestMatch.ticket.ticketId,
              stripeChargeId: charge.id,
              metadata: {
                reconciliationMatch: 'high',
                transactionAmount: charge.amount,
                loyaltyRate: 0.01,
              },
            });

            if (loyaltyResult.success) {
              console.log(`[Jules] Issued ${loyaltyAmount} cents loyalty credits for match ${charge.id} ↔ ${bestMatch.ticket.ticketId}`);
            } else {
              console.warn(`[Jules] Failed to issue loyalty credits: ${loyaltyResult.error}`);
            }
          } else {
            console.log(`[Jules] Skipping loyalty credit issuance - no customer info for match ${charge.id} ↔ ${bestMatch.ticket.ticketId}`);
          }
        } catch (loyaltyError) {
          // Don't fail reconciliation if loyalty issuance fails
          console.error('[Jules] Error issuing loyalty credits:', loyaltyError);
        }
      }

      matchedPairs.push({
        stripeChargeId: charge.id,
        posTicketId: bestMatch.ticket.ticketId,
        amount: charge.amount,
        matchConfidence: bestMatch.confidence,
      });

      usedTicketIds.add(bestMatch.ticket.ticketId);
    } else {
      // Orphaned charge
      await prisma.settlementReconciliation.create({
        data: {
          stripeChargeId: charge.id,
          sessionId: charge.metadata?.sessionId || null,
          amount: charge.amount,
          status: 'orphaned',
          mismatchReason: 'No matching POS ticket found',
        },
      });

      orphanedCharges.push({
        chargeId: charge.id,
        amount: charge.amount,
        sessionId: charge.metadata?.sessionId,
        reason: 'No matching POS ticket found',
      });
    }
  }

  // Mark unmatched POS tickets
  for (const ticket of unmatchedTickets) {
    if (!usedTicketIds.has(ticket.ticketId)) {
      await prisma.settlementReconciliation.create({
        data: {
          posTicketId: ticket.ticketId,
          sessionId: ticket.sessionId || null,
          amount: ticket.amountCents,
          status: 'orphaned',
          mismatchReason: 'No matching Stripe charge found',
        },
      });
    }
  }

  // Calculate metrics
  const totalStripeCharges = unmatchedCharges.length;
  const totalPosTickets = unmatchedTickets.length;
  const matched = matchedPairs.length;
  const orphanedStripeCharges = orphanedCharges.length;
  const orphanedPosTickets = totalPosTickets - matched;

  // Reconciliation rate: matched / total charges
  const reconciliationRate =
    totalStripeCharges > 0 ? matched / totalStripeCharges : 1.0;

  // Pricing parity: exact amount matches / total matches
  const exactMatches = matchedPairs.filter(
    (p) => p.matchConfidence === 'high'
  ).length;
  const pricingParity = matched > 0 ? exactMatches / matched : 1.0;

  // Check if we've achieved target reconciliation rate
  if (validateReconciliationRate(reconciliationRate)) {
    // Set POS_SYNC_READY flag if reconciliation rate meets target
    setPosSyncReady(true);
    console.log(
      `[Noor] POS Sync Ready! Reconciliation rate: ${(
        reconciliationRate * 100
      ).toFixed(2)}%`
    );
  }

  return {
    totalStripeCharges,
    totalPosTickets,
    matched,
    orphanedStripeCharges,
    orphanedPosTickets,
    reconciliationRate,
    pricingParity,
    matchedPairs,
    orphanedCharges,
  };
}

/**
 * Run reconciliation job
 */
export async function runReconciliationJob(options?: { testMode?: boolean }): Promise<ReconciliationResult> {
  console.log('[Noor] Starting POS reconciliation job...');

  try {
    const result = await reconcilePosSettlements({
      amountTolerance: 10, // $0.10
      timeWindowMinutes: 5,
      sessionIdMatch: false, // Optional matching
      testMode: options?.testMode || false,
    });

    console.log('[Noor] Reconciliation complete:', {
      reconciliationRate: `${(result.reconciliationRate * 100).toFixed(2)}%`,
      pricingParity: `${(result.pricingParity * 100).toFixed(2)}%`,
      matched: result.matched,
      orphaned: result.orphanedStripeCharges + result.orphanedPosTickets,
    });

    return result;
  } catch (error) {
    console.error('[Noor] Reconciliation job failed:', error);
    throw error;
  }
}

// CLI execution
if (require.main === module) {
  // Allow test mode via environment variable or command line arg
  const testMode = process.env.TEST_MODE === 'true' || process.argv.includes('--test-mode');
  
  runReconciliationJob({ testMode })
    .then((result) => {
      console.log('Reconciliation job completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Reconciliation job failed:', error);
      process.exit(1);
    });
}

