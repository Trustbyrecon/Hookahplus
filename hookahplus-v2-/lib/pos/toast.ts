import type { PosAdapter, HpItem, HpOrder, ExternalTender, AttachResult } from "./types";

/** ENV:
 * TOAST_BASE_URL=https://api.toasttab.com
 * TOAST_API_KEY=<partner key>
 */
export class ToastAdapter implements PosAdapter {
  private base = process.env.TOAST_BASE_URL!;
  private apiKey = process.env.TOAST_API_KEY!;
  
  constructor(private cfg: { venueId: string }) {
    if (!this.base) {
      throw new Error("TOAST_BASE_URL environment variable is required");
    }
    if (!this.apiKey) {
      throw new Error("TOAST_API_KEY environment variable is required");
    }
  }

  async capabilities() {
    return { orderInjection: true, externalTender: true };
  }

  async attachOrder(hpOrder: HpOrder): Promise<AttachResult> {
    try {
      // Pseudo: Toast "checks" concept; create a check with reference
      const res = await fetch(`${this.base}/v1/checks`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${this.apiKey}` 
        },
        body: JSON.stringify({
          idempotencyKey: hpOrder.hp_order_id,
          table: hpOrder.table,
          reference: hpOrder.hp_order_id,
          venueId: this.cfg.venueId
        })
      });
      
      if (!res.ok) {
        throw new Error(`Toast attachOrder failed: ${await res.text()}`);
      }
      
      const json = await res.json();
      return { pos_order_id: json.id, created: true };
    } catch (error) {
      console.error("Toast attachOrder error:", error);
      throw new Error(`Failed to attach order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async upsertItems(pos_order_id: string, items: HpItem[]): Promise<void> {
    try {
      // Pseudo: Add menu items or "custom items" with price
      const res = await fetch(`${this.base}/v1/checks/${pos_order_id}/items:batchUpsert`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${this.apiKey}` 
        },
        body: JSON.stringify({
          idempotencyKey: `${pos_order_id}-items`,
          items: items.map((it) => ({
            name: it.name,
            quantity: it.qty,
            price: it.unit_amount,
            sku: it.sku,
            notes: it.notes
          }))
        })
      });
      
      if (!res.ok) {
        throw new Error(`Toast upsertItems failed: ${await res.text()}`);
      }
    } catch (error) {
      console.error("Toast upsertItems error:", error);
      throw new Error(`Failed to upsert items: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async closeOrder(pos_order_id: string, tender?: ExternalTender): Promise<void> {
    try {
      // Pseudo: mark the check paid with "external tender"
      const res = await fetch(`${this.base}/v1/checks/${pos_order_id}/close`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${this.apiKey}` 
        },
        body: JSON.stringify({
          idempotencyKey: `${pos_order_id}-close`,
          externalPayment: tender ? {
            provider: tender.provider,
            reference: tender.reference,
            amount: tender.amount,
            currency: tender.currency
          } : undefined
        })
      });
      
      if (!res.ok) {
        throw new Error(`Toast closeOrder failed: ${await res.text()}`);
      }
    } catch (error) {
      console.error("Toast closeOrder error:", error);
      throw new Error(`Failed to close order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
