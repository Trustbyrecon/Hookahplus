import type { PosAdapter, HpItem, HpOrder, ExternalTender, AttachResult } from "./types";

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
}
