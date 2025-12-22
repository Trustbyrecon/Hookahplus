import { prisma } from '../db';
import { SquareAdapter } from './square';
import { ToastAdapter } from './toast';
import { CloverAdapter } from './clover';

export interface PosSyncResult {
  success: boolean;
  syncedCount: number;
  failedCount: number;
  errors: string[];
  reconciliationRate?: number;
}

export interface PosSyncOptions {
  loungeId: string;
  tenantId?: string | null;
  posSystem: 'square' | 'toast' | 'clover';
  startDate?: Date;
  endDate?: Date;
  autoReconcile?: boolean;
}

/**
 * POS Sync Service
 * Handles synchronization between Hookah+ sessions and POS systems
 */
export class PosSyncService {
  /**
   * Sync sessions with POS system
   */
  async syncSessions(options: PosSyncOptions): Promise<PosSyncResult> {
    const { loungeId, tenantId, posSystem, startDate, endDate, autoReconcile = true } = options;
    const errors: string[] = [];
    let syncedCount = 0;
    let failedCount = 0;

    try {
      // Get adapter for POS system
      const adapter = this.getAdapter(posSystem);
      if (!adapter) {
        return {
          success: false,
          syncedCount: 0,
          failedCount: 0,
          errors: [`POS system ${posSystem} not supported`]
        };
      }

      // Get sessions that need syncing
      const where: any = {
        loungeId,
        ...(tenantId ? { tenantId } : {}),
        paymentStatus: 'succeeded'
      };

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = startDate;
        if (endDate) where.createdAt.lte = endDate;
      }

      const sessions = await prisma.session.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 100 // Limit for performance
      });

      // Sync each session
      for (const session of sessions) {
        try {
          // Check if already synced
          const existingTicket = await prisma.posTicket.findFirst({
            where: {
              sessionId: session.id,
              posSystem
            }
          });

          if (existingTicket) {
            continue; // Already synced
          }

          // Create POS order/ticket
          const posResult = await adapter.createOrder({
            sessionId: session.id,
            amountCents: session.priceCents || 0,
            items: this.extractSessionItems(session),
            customerRef: session.customerRef || undefined,
            customerPhone: session.customerPhone || undefined,
            metadata: {
              loungeId: session.loungeId,
              tableId: session.tableId || undefined
            }
          });

          if (posResult.success && posResult.ticketId) {
            // Create POS ticket record
            await prisma.posTicket.create({
              data: {
                ticketId: posResult.ticketId,
                sessionId: session.id,
                amountCents: session.priceCents || 0,
                status: 'pending',
                posSystem
              }
            });

            syncedCount++;

            // Auto-reconcile if enabled
            if (autoReconcile && session.paymentIntent) {
              await this.reconcileSession(session.id, posResult.ticketId, posSystem);
            }
          } else {
            failedCount++;
            errors.push(`Failed to sync session ${session.id}: ${posResult.error || 'Unknown error'}`);
          }
        } catch (error) {
          failedCount++;
          errors.push(`Error syncing session ${session.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Calculate reconciliation rate if auto-reconcile was enabled
      let reconciliationRate: number | undefined;
      if (autoReconcile && syncedCount > 0) {
        const reconciled = await prisma.settlementReconciliation.count({
          where: {
            sessionId: { in: sessions.map(s => s.id) },
            status: 'matched'
          }
        });
        reconciliationRate = (reconciled / syncedCount) * 100;
      }

      return {
        success: failedCount === 0,
        syncedCount,
        failedCount,
        errors: errors.slice(0, 10), // Limit errors
        reconciliationRate
      };
    } catch (error) {
      return {
        success: false,
        syncedCount,
        failedCount,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Reconcile a session with POS ticket
   */
  async reconcileSession(sessionId: string, ticketId: string, posSystem: string): Promise<boolean> {
    try {
      const session = await prisma.session.findUnique({
        where: { id: sessionId }
      });

      if (!session || !session.paymentIntent) {
        return false;
      }

      // Check if already reconciled
      const existing = await prisma.settlementReconciliation.findFirst({
        where: {
          sessionId,
          posTicketId: ticketId
        }
      });

      if (existing && existing.status === 'matched') {
        return true; // Already reconciled
      }

      // Create or update reconciliation record
      await prisma.settlementReconciliation.upsert({
        where: {
          id: existing?.id || `recon_${sessionId}_${ticketId}`
        },
        create: {
          stripeChargeId: session.paymentIntent,
          posTicketId: ticketId,
          sessionId,
          amount: session.priceCents || 0,
          currency: 'USD',
          status: 'matched',
          matchedAt: new Date()
        },
        update: {
          status: 'matched',
          matchedAt: new Date()
        }
      });

      return true;
    } catch (error) {
      console.error('[POS Sync] Error reconciling session:', error);
      return false;
    }
  }

  /**
   * Get reconciliation statistics
   */
  async getReconciliationStats(loungeId: string, tenantId?: string | null): Promise<{
    totalSessions: number;
    reconciledSessions: number;
    reconciliationRate: number;
    orphanedCharges: number;
    unmatchedTickets: number;
  }> {
    try {
      const where: any = { loungeId };
      if (tenantId) where.tenantId = tenantId;

      // Get total paid sessions
      const totalSessions = await prisma.session.count({
        where: {
          ...where,
          paymentStatus: 'succeeded'
        }
      });

      // Get reconciled sessions
      const reconciledSessions = await prisma.settlementReconciliation.count({
        where: {
          ...where,
          status: 'matched'
        }
      });

      // Get orphaned charges (Stripe charges without POS tickets)
      const orphanedCharges = await prisma.settlementReconciliation.count({
        where: {
          ...where,
          status: 'orphaned',
          stripeChargeId: { not: null },
          posTicketId: null
        }
      });

      // Get unmatched tickets (POS tickets without Stripe charges)
      const unmatchedTickets = await prisma.settlementReconciliation.count({
        where: {
          ...where,
          status: 'orphaned',
          posTicketId: { not: null },
          stripeChargeId: null
        }
      });

      const reconciliationRate = totalSessions > 0 
        ? (reconciledSessions / totalSessions) * 100 
        : 0;

      return {
        totalSessions,
        reconciledSessions,
        reconciliationRate,
        orphanedCharges,
        unmatchedTickets
      };
    } catch (error) {
      console.error('[POS Sync] Error getting reconciliation stats:', error);
      return {
        totalSessions: 0,
        reconciledSessions: 0,
        reconciliationRate: 0,
        orphanedCharges: 0,
        unmatchedTickets: 0
      };
    }
  }

  /**
   * Get POS adapter instance
   */
  private getAdapter(posSystem: string) {
    switch (posSystem) {
      case 'square':
        return new SquareAdapter();
      case 'toast':
        return new ToastAdapter();
      case 'clover':
        return new CloverAdapter();
      default:
        return null;
    }
  }

  /**
   * Extract items from session for POS
   */
  private extractSessionItems(session: any): Array<{ name: string; quantity: number; priceCents: number }> {
    const items: Array<{ name: string; quantity: number; priceCents: number }> = [];

    // Base session
    items.push({
      name: 'Hookah Session',
      quantity: 1,
      priceCents: session.priceCents || 0
    });

    // Add flavor mix if available
    if (session.flavorMix) {
      try {
        const mix = typeof session.flavorMix === 'string' 
          ? JSON.parse(session.flavorMix) 
          : session.flavorMix;
        
        if (Array.isArray(mix.flavors)) {
          mix.flavors.forEach((flavor: string) => {
            items.push({
              name: `Flavor: ${flavor}`,
              quantity: 1,
              priceCents: 0 // Flavors included in base price
            });
          });
        }
      } catch (e) {
        // Ignore parse errors
      }
    }

    return items;
  }
}

// Singleton instance
export const posSyncService = new PosSyncService();

