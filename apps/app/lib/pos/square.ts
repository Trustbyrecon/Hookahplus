import type { PosAdapter, HpItem, HpOrder, ExternalTender, AttachResult, ReconciliationMatch, ReconciliationReport } from "./types";
import Stripe from 'stripe';
import { prisma } from '../db';
import { decrypt, encrypt } from '../utils/encryption';
import { SquareOAuth } from '../square/oauth';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-08-27.basil' as any })
  : null;

/**
 * Square POS Adapter
 * Supports both OAuth (App Marketplace) and static token (legacy) modes
 */
export class SquareAdapter implements PosAdapter {
  private locationId: string | null = null;
  private accessToken: string | null = null;
  private merchantId: string | null = null;
  private initialized = false;
  
  constructor(private cfg: { venueId: string }) {
    // Initialization is now async - use initialize() method
  }

  /**
   * Initialize adapter by loading merchant credentials
   * Must be called before using adapter methods
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const squareMerchantDelegate = (prisma as any)?.squareMerchant;

      // Try to load from database (OAuth mode) when the Prisma model exists.
      const merchant =
        squareMerchantDelegate?.findUnique
          ? await squareMerchantDelegate.findUnique({ where: { loungeId: this.cfg.venueId } })
          : null;

      if (merchant) {
        // Check if token needs refresh
        if (merchant.expiresAt && merchant.expiresAt < new Date()) {
          await this.refreshAccessToken(merchant);
          // Reload after refresh
          const refreshed =
            squareMerchantDelegate?.findUnique
              ? await squareMerchantDelegate.findUnique({ where: { loungeId: this.cfg.venueId } })
              : null;
          if (refreshed) {
            this.accessToken = decrypt(refreshed.accessToken);
            this.locationId = refreshed.locationIds[0] || null;
            this.merchantId = refreshed.merchantId;
          }
        } else {
          this.accessToken = decrypt(merchant.accessToken);
          this.locationId = merchant.locationIds[0] || null;
          this.merchantId = merchant.merchantId;
        }
      } else {
        // Fallback to environment variables (legacy mode)
        this.locationId = process.env.SQUARE_LOCATION_ID?.trim() || null;
        this.accessToken = process.env.SQUARE_ACCESS_TOKEN?.trim() || null;
      }

      if (!this.accessToken) {
        throw new Error("Square not connected. Please connect your Square account in settings.");
      }

      if (!this.locationId) {
        throw new Error("No Square location configured. Please connect your Square account.");
      }

      this.initialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize Square adapter: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Refresh expired access token
   */
  private async refreshAccessToken(merchant: any): Promise<void> {
    if (!merchant.refreshToken) {
      throw new Error('No refresh token available. Please reconnect your Square account.');
    }

    try {
      const tokens = await SquareOAuth.refreshToken(decrypt(merchant.refreshToken));
      const expiresAt = new Date(Date.now() + tokens.expiresIn * 1000);

      const squareMerchantDelegate = (prisma as any)?.squareMerchant;
      if (!squareMerchantDelegate?.update) {
        throw new Error('Square OAuth store is not configured in Prisma (missing squareMerchant model)');
      }

      await squareMerchantDelegate.update({
        where: { id: merchant.id },
        data: {
          accessToken: encrypt(tokens.accessToken),
          refreshToken: encrypt(tokens.refreshToken),
          expiresAt
        }
      });
    } catch (error) {
      console.error('[Square] Token refresh failed:', error);
      throw new Error('Failed to refresh Square access token. Please reconnect your account.');
    }
  }

  /**
   * Ensure adapter is initialized before use
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
    if (!this.accessToken || !this.locationId) {
      throw new Error('Square adapter not properly initialized');
    }
  }

  async capabilities() {
    return { orderInjection: true, externalTender: true };
  }

  async attachOrder(hpOrder: HpOrder): Promise<AttachResult> {
    await this.ensureInitialized();
    
    try {
      // Check if order already exists (idempotency)
      const existingOrder = await this.findOrderByHpId(hpOrder.hp_order_id);
      if (existingOrder) {
        return { pos_order_id: existingOrder.id, created: false };
      }

      // MVP: create a Square Order draft with reference to hpOrder.hp_order_id (idempotency)
      // Doc: https://developer.squareup.com/reference/square/orders-api/create-order
      const body = {
        idempotency_key: hpOrder.hp_order_id,
        order: {
          location_id: this.locationId!,
          reference_id: hpOrder.hp_order_id,
          customer_id: undefined, // optional
          line_items: [], // we will add via upsertItems()
          ...(hpOrder.table && { note: `Table: ${hpOrder.table}` }),
          ...(hpOrder.guest_count && { note: `Guests: ${hpOrder.guest_count}` })
        },
      };

      const res = await fetch("https://connect.squareup.com/v2/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Square-Version": "2024-01-18",
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Square attachOrder failed: ${err}`);
      }

      const json = await res.json();
      return { pos_order_id: json.order.id, created: true };
    } catch (error) {
      console.error("Square attachOrder error:", error);
      throw new Error(`Failed to attach order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async upsertItems(pos_order_id: string, items: HpItem[]): Promise<void> {
    await this.ensureInitialized();
    
    try {
      // Get current order to preserve existing data
      const currentOrder = await this.getOrder(pos_order_id);
      
      // Build line items from Hookah+ items
      const line_items = items.map((it) => ({
        name: it.name,
        quantity: String(it.qty),
        base_price_money: { amount: it.unit_amount, currency: "USD" },
        note: it.notes || `SKU: ${it.sku}`,
        // taxes/discounts can be added via order-level or line-level depending on venue config
      }));

      // Square: use Orders API → Update Order
      const res = await fetch(`https://connect.squareup.com/v2/orders/${pos_order_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Square-Version": "2024-01-18",
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({ 
          order: { 
            ...currentOrder.order,
            line_items,
            version: currentOrder.order.version
          } 
        }),
      });
      
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Square upsertItems failed: ${err}`);
      }
    } catch (error) {
      console.error("Square upsertItems error:", error);
      throw new Error(`Failed to upsert items: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async closeOrder(pos_order_id: string, tender?: ExternalTender): Promise<void> {
    await this.ensureInitialized();
    
    try {
      if (tender) {
        // Pattern B: add "External Paid: Hookah+ $X" adjustment or note
        // Square often expects Payments API to capture money; for MVP, we can mark it externally in order metadata
        // Alternatively, create a non-capturing "other tender" is not directly supported; many teams use a "note" + set state.
        await fetch(`https://connect.squareup.com/v2/orders/${pos_order_id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Square-Version": "2024-01-18",
            Authorization: `Bearer ${this.accessToken}`,
          },
          body: JSON.stringify({
            order: {
              state: "COMPLETED",
              reference_id: `${tender.provider}:${tender.reference}`,
              // optional: add service charge or a line item "External Paid (Hookah+)"
            },
          }),
        });
      } else {
        // If payment is captured inside Square, you'd use Payments API here instead
        await fetch(`https://connect.squareup.com/v2/orders/${pos_order_id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Square-Version": "2024-01-18",
            Authorization: `Bearer ${this.accessToken}`,
          },
          body: JSON.stringify({ order: { state: "COMPLETED" } }),
        });
      }
    } catch (error) {
      console.error("Square closeOrder error:", error);
      throw new Error(`Failed to close order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async findOrderByHpId(hpOrderId: string): Promise<{ id: string } | null> {
    await this.ensureInitialized();
    
    try {
      const response = await fetch("https://connect.squareup.com/v2/orders/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Square-Version": "2024-01-18",
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({
          location_ids: [this.locationId!],
          query: {
            filter: {
              reference_id: {
                exact: hpOrderId
              }
            }
          }
        })
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.orders?.[0] ? { id: data.orders[0].id } : null;
    } catch (error) {
      console.warn("Could not search for existing order:", error);
      return null;
    }
  }

  private async getOrder(orderId: string) {
    await this.ensureInitialized();
    
    const res = await fetch(`https://connect.squareup.com/v2/orders/${orderId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Square-Version": "2024-01-18",
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to get order: ${res.statusText}`);
    }

    return res.json();
  }

  /**
   * Reconciliation: Match Square order with Stripe charge
   * Agent: Noor - Objective O1.3
   */
  async reconcileTicket(posTicketId: string, stripeChargeId?: string): Promise<ReconciliationMatch | null> {
    await this.ensureInitialized();
    
    if (!stripe) {
      throw new Error('Stripe not configured for reconciliation');
    }

    try {
      // Get POS ticket from database
      const posTicket = await prisma.posTicket.findUnique({
        where: { ticketId: posTicketId },
      });

      if (!posTicket) {
        return null;
      }

      // If Stripe charge ID provided, fetch and match directly
      if (stripeChargeId) {
        const charge = await stripe.charges.retrieve(stripeChargeId);
        const amountDiff = Math.abs(charge.amount - (posTicket.amountCents || 0));

        if (amountDiff <= 10) { // $0.10 tolerance
          return {
            posTicketId,
            stripeChargeId,
            amountCents: charge.amount,
            matchConfidence: amountDiff === 0 ? 'high' : 'medium',
            matchReason: `Amount match (diff: $${(amountDiff / 100).toFixed(2)})`,
          };
        }
      }

      // Search for matching Stripe charge by amount and timestamp
      const order = await this.getOrder(posTicketId);
      const orderCreatedTime = order.order?.created_at 
        ? new Date(order.order.created_at).getTime() / 1000
        : posTicket.createdAt.getTime() / 1000;

      const charges = await stripe.charges.list({
        limit: 10,
        created: {
          gte: Math.floor(orderCreatedTime - 300), // 5 minute window
          lte: Math.floor(orderCreatedTime + 300),
        },
      });

      for (const charge of charges.data) {
        if (!charge.paid) continue;

        const amountDiff = Math.abs(charge.amount - (posTicket.amountCents || 0));
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
      console.error('[Square] Reconciliation error:', error);
      return null;
    }
  }

  /**
   * Get reconciliation report for date range
   */
  async getReconciliationReport(startDate: Date, endDate: Date): Promise<ReconciliationReport> {
    await this.ensureInitialized();
    
    if (!stripe) {
      throw new Error('Stripe not configured for reconciliation');
    }

    try {
      // Get POS tickets in date range
      const posTickets = await prisma.posTicket.findMany({
        where: {
          posSystem: 'square',
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          status: 'paid',
        },
      });

      // Get Stripe charges in date range
      const charges = await stripe.charges.list({
        limit: 100,
        created: {
          gte: Math.floor(startDate.getTime() / 1000),
          lte: Math.floor(endDate.getTime() / 1000),
        },
      });

      const matches: ReconciliationMatch[] = [];
      const matchedTicketIds = new Set<string>();
      const matchedChargeIds = new Set<string>();

      // Match tickets to charges
      for (const ticket of posTickets) {
        const match = await this.reconcileTicket(ticket.ticketId);
        if (match) {
          matches.push(match);
          matchedTicketIds.add(ticket.ticketId);
          matchedChargeIds.add(match.stripeChargeId);
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
      console.error('[Square] Reconciliation report error:', error);
      throw error;
    }
  }
}
