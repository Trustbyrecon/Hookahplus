import type { PosAdapter, HpItem, HpOrder, ExternalTender, AttachResult } from "./types";

/** Toast Reflex Adapter - Phase 1 Scaffolding
 * 
 * ENV Configuration:
 * TOAST_BASE_URL=https://api.toasttab.com
 * TOAST_API_KEY=<partner key>
 * TOAST_RESTAURANT_GUID=<restaurant guid>
 * TOAST_WEBHOOK_SECRET=<webhook secret>
 * 
 * Toast API Features:
 * - Check-based workflow (similar to tickets)
 * - External payment support
 * - Menu item injection
 * - Custom line items
 * - Webhook notifications
 */
export class ToastAdapter implements PosAdapter {
  private base = process.env.TOAST_BASE_URL!;
  private apiKey = process.env.TOAST_API_KEY!;
  private restaurantGuid = process.env.TOAST_RESTAURANT_GUID!;
  private webhookSecret = process.env.TOAST_WEBHOOK_SECRET!;
  
  constructor(private cfg: { venueId: string }) {
    this.validateConfiguration();
  }

  private validateConfiguration() {
    const required = [
      { key: 'TOAST_BASE_URL', value: this.base },
      { key: 'TOAST_API_KEY', value: this.apiKey },
      { key: 'TOAST_RESTAURANT_GUID', value: this.restaurantGuid }
    ];

    for (const { key, value } of required) {
      if (!value) {
        throw new Error(`${key} environment variable is required for Toast integration`);
      }
    }
  }

  async capabilities() {
    return { 
      orderInjection: true, 
      externalTender: true,
      webhookSupport: true,
      menuIntegration: true,
      customItems: true,
      checkBasedWorkflow: true
    };
  }

  /** Toast-specific: Get restaurant configuration */
  async getRestaurantConfig() {
    try {
      const res = await fetch(`${this.base}/v1/restaurants/${this.restaurantGuid}`, {
        headers: { 
          "Authorization": `Bearer ${this.apiKey}`,
          "Toast-Restaurant-External-ID": this.cfg.venueId
        }
      });
      
      if (!res.ok) {
        throw new Error(`Failed to get restaurant config: ${await res.text()}`);
      }
      
      return await res.json();
    } catch (error) {
      console.error("Toast getRestaurantConfig error:", error);
      throw new Error(`Failed to get restaurant config: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /** Toast-specific: Get available menu items */
  async getMenuItems() {
    try {
      const res = await fetch(`${this.base}/v1/restaurants/${this.restaurantGuid}/menu-items`, {
        headers: { 
          "Authorization": `Bearer ${this.apiKey}`,
          "Toast-Restaurant-External-ID": this.cfg.venueId
        }
      });
      
      if (!res.ok) {
        throw new Error(`Failed to get menu items: ${await res.text()}`);
      }
      
      return await res.json();
    } catch (error) {
      console.error("Toast getMenuItems error:", error);
      throw new Error(`Failed to get menu items: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async attachOrder(hpOrder: HpOrder): Promise<AttachResult> {
    try {
      // Toast API: Create a new check (equivalent to POS ticket)
      const checkPayload = {
        idempotencyKey: hpOrder.hp_order_id,
        restaurantGuid: this.restaurantGuid,
        table: hpOrder.table || "T-001", // Default table if not specified
        guestCount: hpOrder.guest_count || 1,
        externalReferenceId: hpOrder.hp_order_id,
        metadata: {
          hookahPlusOrderId: hpOrder.hp_order_id,
          venueId: this.cfg.venueId,
          source: "hookah-plus-integration"
        }
      };

      const res = await fetch(`${this.base}/v1/checks`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${this.apiKey}`,
          "Toast-Restaurant-External-ID": this.cfg.venueId
        },
        body: JSON.stringify(checkPayload)
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Toast attachOrder failed: ${res.status} ${errorText}`);
      }
      
      const json = await res.json();
      console.log(`[Toast] Check created: ${json.guid} for order ${hpOrder.hp_order_id}`);
      
      return { 
        pos_order_id: json.guid, 
        created: true,
        metadata: {
          checkGuid: json.guid,
          restaurantGuid: this.restaurantGuid,
          table: json.table
        }
      };
    } catch (error) {
      console.error("Toast attachOrder error:", error);
      throw new Error(`Failed to attach order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async upsertItems(pos_order_id: string, items: HpItem[]): Promise<void> {
    try {
      // Toast API: Add items to the check
      const itemsPayload = items.map((item) => ({
        idempotencyKey: `${pos_order_id}-${item.sku}-${Date.now()}`,
        menuItemGuid: item.sku.startsWith('MENU_') ? item.sku : undefined, // If it's a menu item
        name: item.name,
        quantity: item.qty,
        unitPrice: item.unit_amount / 100, // Convert cents to dollars
        notes: item.notes || `Hookah+ Item: ${item.name}`,
        metadata: {
          hookahPlusSku: item.sku,
          hookahPlusItemId: `${pos_order_id}-${item.sku}`,
          taxCode: item.tax_code
        }
      }));

      const res = await fetch(`${this.base}/v1/checks/${pos_order_id}/items`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${this.apiKey}`,
          "Toast-Restaurant-External-ID": this.cfg.venueId
        },
        body: JSON.stringify({
          idempotencyKey: `${pos_order_id}-items-${Date.now()}`,
          items: itemsPayload
        })
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Toast upsertItems failed: ${res.status} ${errorText}`);
      }
      
      const json = await res.json();
      console.log(`[Toast] Items added to check ${pos_order_id}:`, json);
    } catch (error) {
      console.error("Toast upsertItems error:", error);
      throw new Error(`Failed to upsert items: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async closeOrder(pos_order_id: string, tender?: ExternalTender): Promise<void> {
    try {
      // Toast API: Close the check and record external payment if provided
      const closePayload: any = {
        idempotencyKey: `${pos_order_id}-close-${Date.now()}`,
        checkGuid: pos_order_id,
        closeType: "PAID"
      };

      // If external tender is provided (e.g., Stripe payment), record it
      if (tender) {
        closePayload.externalPayments = [{
          paymentType: "EXTERNAL",
          amount: tender.amount / 100, // Convert cents to dollars
          currency: tender.currency,
          externalPaymentId: tender.reference,
          externalPaymentProvider: tender.provider.toUpperCase(),
          metadata: {
            hookahPlusPaymentIntent: tender.reference,
            hookahPlusProvider: tender.provider,
            hookahPlusAmount: tender.amount
          }
        }];
      }

      const res = await fetch(`${this.base}/v1/checks/${pos_order_id}/close`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${this.apiKey}`,
          "Toast-Restaurant-External-ID": this.cfg.venueId
        },
        body: JSON.stringify(closePayload)
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Toast closeOrder failed: ${res.status} ${errorText}`);
      }
      
      const json = await res.json();
      console.log(`[Toast] Check ${pos_order_id} closed successfully:`, json);
    } catch (error) {
      console.error("Toast closeOrder error:", error);
      throw new Error(`Failed to close order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /** Toast-specific: Get check details */
  async getCheckDetails(checkGuid: string) {
    try {
      const res = await fetch(`${this.base}/v1/checks/${checkGuid}`, {
        headers: { 
          "Authorization": `Bearer ${this.apiKey}`,
          "Toast-Restaurant-External-ID": this.cfg.venueId
        }
      });
      
      if (!res.ok) {
        throw new Error(`Failed to get check details: ${await res.text()}`);
      }
      
      return await res.json();
    } catch (error) {
      console.error("Toast getCheckDetails error:", error);
      throw new Error(`Failed to get check details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /** Toast-specific: Verify webhook signature */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.webhookSecret) {
      console.warn("[Toast] Webhook secret not configured, skipping signature verification");
      return true; // Allow in development
    }

    // Toast webhook signature verification logic
    // This would implement HMAC-SHA256 verification similar to Stripe
    try {
      // TODO: Implement actual Toast webhook signature verification
      // For now, return true for development
      return true;
    } catch (error) {
      console.error("Toast webhook signature verification failed:", error);
      return false;
    }
  }
}
