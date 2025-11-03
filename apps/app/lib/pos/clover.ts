import type { PosAdapter, HpItem, HpOrder, ExternalTender, AttachResult, ReconciliationMatch, ReconciliationReport } from "./types";
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-08-27.basil' as any })
  : null;

/** ENV:
 * CLOVER_BASE_URL=https://api.clover.com
 * CLOVER_MERCHANT_ID=<merchant>
 * CLOVER_ACCESS_TOKEN=<oauth token>
 */
export class CloverAdapter implements PosAdapter {
  private base = process.env.CLOVER_BASE_URL!;
  private merchantId = process.env.CLOVER_MERCHANT_ID!;
  private token = process.env.CLOVER_ACCESS_TOKEN!;
  
  constructor(private cfg: { venueId: string }) {
    if (!this.base) {
      throw new Error("CLOVER_BASE_URL environment variable is required");
    }
    if (!this.merchantId) {
      throw new Error("CLOVER_MERCHANT_ID environment variable is required");
    }
    if (!this.token) {
      throw new Error("CLOVER_ACCESS_TOKEN environment variable is required");
    }
  }

  async capabilities() {
    return { orderInjection: true, externalTender: true };
  }

  async attachOrder(hpOrder: HpOrder): Promise<AttachResult> {
    try {
      // Doc: https://www.clover.com/api-docs
      const res = await fetch(`${this.base}/v3/merchants/${this.merchantId}/orders`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${this.token}` 
        },
        body: JSON.stringify({
          title: `Hookah+ ${hpOrder.table ?? ""}`.trim(),
          note: hpOrder.hp_order_id,
          state: "open",
          venueId: this.cfg.venueId
        })
      });
      
      if (!res.ok) {
        throw new Error(`Clover attachOrder failed: ${await res.text()}`);
      }
      
      const json = await res.json();
      return { pos_order_id: json.id, created: true };
    } catch (error) {
      console.error("Clover attachOrder error:", error);
      throw new Error(`Failed to attach order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async upsertItems(pos_order_id: string, items: HpItem[]): Promise<void> {
    try {
      // Clover uses line item endpoints; use "custom line item" for MVP
      for (const it of items) {
        const res = await fetch(`${this.base}/v3/merchants/${this.merchantId}/orders/${pos_order_id}/line_items`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json", 
            Authorization: `Bearer ${this.token}` 
          },
          body: JSON.stringify({
            name: it.name,
            price: it.unit_amount,
            unitQty: it.qty,
            userData: it.sku,
            notes: it.notes
          })
        });
        
        if (!res.ok) {
          throw new Error(`Clover upsertItems failed: ${await res.text()}`);
        }
      }
    } catch (error) {
      console.error("Clover upsertItems error:", error);
      throw new Error(`Failed to upsert items: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async closeOrder(pos_order_id: string, tender?: ExternalTender): Promise<void> {
    try {
      // For external payment, add a note/line indicating external paid, then mark order as paid/complete if API supports
      // Many Clover flows expect payment capture on device; MVP = annotate & close
      const res = await fetch(`${this.base}/v3/merchants/${this.merchantId}/orders/${pos_order_id}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${this.token}` 
        },
        body: JSON.stringify({
          note: tender ? `External Paid ${tender.provider}:${tender.reference}` : "Closed",
          state: "paid"
        })
      });
      
      if (!res.ok) {
        throw new Error(`Clover closeOrder failed: ${await res.text()}`);
      }
    } catch (error) {
      console.error("Clover closeOrder error:", error);
      throw new Error(`Failed to close order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Reconciliation: Match Clover order with Stripe charge
   * Agent: Noor - Objective O1.4
   */
  async reconcileTicket(posTicketId: string, stripeChargeId?: string): Promise<ReconciliationMatch | null> {
    if (!stripe) {
      throw new Error('Stripe not configured for reconciliation');
    }

    try {
      const posTicket = await prisma.posTicket.findUnique({
        where: { ticketId: posTicketId },
      });

      if (!posTicket) {
        return null;
      }

      if (stripeChargeId) {
        const charge = await stripe.charges.retrieve(stripeChargeId);
        const amountDiff = Math.abs(charge.amount - posTicket.amountCents);

        if (amountDiff <= 10) {
          return {
            posTicketId,
            stripeChargeId,
            amountCents: charge.amount,
            matchConfidence: amountDiff === 0 ? 'high' : 'medium',
            matchReason: `Amount match (diff: $${(amountDiff / 100).toFixed(2)})`,
          };
        }
      }

      // Search for matching charge
      const orderCreatedTime = posTicket.createdAt.getTime() / 1000;
      const charges = await stripe.charges.list({
        limit: 10,
        created: {
          gte: Math.floor(orderCreatedTime - 300),
          lte: Math.floor(orderCreatedTime + 300),
        },
      });

      for (const charge of charges.data) {
        if (!charge.paid) continue;

        const amountDiff = Math.abs(charge.amount - posTicket.amountCents);
        if (amountDiff <= 10) {
          return {
            posTicketId,
            stripeChargeId: charge.id,
            amountCents: charge.amount,
            matchConfidence: amountDiff === 0 ? 'high' : amountDiff <= 5 ? 'medium' : 'low',
            matchReason: `Amount match within window (diff: $${(amountDiff / 100).toFixed(2)})`,
          };
        }
      }

      return null;
    } catch (error) {
      console.error('[Clover] Reconciliation error:', error);
      return null;
    }
  }

  /**
   * Get reconciliation report for date range
   */
  async getReconciliationReport(startDate: Date, endDate: Date): Promise<ReconciliationReport> {
    if (!stripe) {
      throw new Error('Stripe not configured for reconciliation');
    }

    try {
      const posTickets = await prisma.posTicket.findMany({
        where: {
          posSystem: 'clover',
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          status: 'paid',
        },
      });

      const charges = await stripe.charges.list({
        limit: 100,
        created: {
          gte: Math.floor(startDate.getTime() / 1000),
          lte: Math.floor(endDate.getTime() / 1000),
        },
      });

      const matches: ReconciliationMatch[] = [];

      for (const ticket of posTickets) {
        const match = await this.reconcileTicket(ticket.ticketId);
        if (match) {
          matches.push(match);
        }
      }

      const totalPosTickets = posTickets.length;
      const totalStripeCharges = charges.data.filter((c) => c.paid).length;
      const matched = matches.length;
      const orphanedPosTickets = totalPosTickets - matched;
      const orphanedStripeCharges = totalStripeCharges - matched;

      const reconciliationRate = totalPosTickets > 0 ? matched / totalPosTickets : 0;
      const exactMatches = matches.filter((m) => m.matchConfidence === 'high').length;
      const pricingParity = matched > 0 ? exactMatches / matched : 0;

      return {
        totalPosTickets,
        totalStripeCharges,
        matched,
        orphanedPosTickets,
        orphanedStripeCharges,
        reconciliationRate,
        pricingParity,
        matches,
      };
    } catch (error) {
      console.error('[Clover] Reconciliation report error:', error);
      throw error;
    }
  }
}
