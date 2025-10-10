import type { PosAdapter, HpItem, HpOrder, ExternalTender, AttachResult } from "./types";

/** ENV:
 * SQUARE_ACCESS_TOKEN=<secret>
 * SQUARE_LOCATION_ID=<location>
 */
export class SquareAdapter implements PosAdapter {
  private locationId = process.env.SQUARE_LOCATION_ID!;
  private accessToken = process.env.SQUARE_ACCESS_TOKEN!;
  
  constructor(private cfg: { venueId: string }) {
    if (!this.locationId) {
      throw new Error("SQUARE_LOCATION_ID environment variable is required");
    }
    if (!this.accessToken) {
      throw new Error("SQUARE_ACCESS_TOKEN environment variable is required");
    }
  }

  async capabilities() {
    return { orderInjection: true, externalTender: true };
  }

  async attachOrder(hpOrder: HpOrder): Promise<AttachResult> {
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
          location_id: this.locationId,
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
          "Square-Version": "2024-01-17",
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
          "Square-Version": "2024-01-17",
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
    try {
      if (tender) {
        // Pattern B: add "External Paid: Hookah+ $X" adjustment or note
        // Square often expects Payments API to capture money; for MVP, we can mark it externally in order metadata
        // Alternatively, create a non-capturing "other tender" is not directly supported; many teams use a "note" + set state.
        await fetch(`https://connect.squareup.com/v2/orders/${pos_order_id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Square-Version": "2024-01-17",
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
            "Square-Version": "2024-01-17",
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
    try {
      const response = await fetch("https://connect.squareup.com/v2/orders/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Square-Version": "2024-01-17",
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({
          location_ids: [this.locationId],
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
    const res = await fetch(`https://connect.squareup.com/v2/orders/${orderId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Square-Version": "2024-01-17",
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to get order: ${res.statusText}`);
    }

    return res.json();
  }
}
