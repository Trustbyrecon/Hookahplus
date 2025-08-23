export type Money = { amount: number; currency: "USD" }; // cents

export type HpItem = {
  sku: string;
  name: string;
  qty: number;
  unit_amount: number; // cents
  tax_code?: string;
  notes?: string;
};

export type HpOrder = {
  hp_order_id: string;          // e.g. hp_ord_xxx (idempotency key)
  venue_id: string;             // your venue identifier
  table?: string;
  guest_count?: number;
  items: HpItem[];
  service_charge?: Money;
  discounts?: { name: string; amount: number }[];
  taxes?: { name: string; amount: number }[];
  totals?: { subtotal: number; tax?: number; grand_total: number };
  payment?: {
    mode: "external" | "pos";
    provider?: "stripe";
    payment_intent?: string;
    status?: "pending" | "succeeded" | "failed";
  };
  trust_lock: { sig: string };
};

export type ExternalTender = {
  provider: "stripe";
  reference: string; // payment_intent or charge id
  amount: number;    // cents
  currency: "USD";
};

export type AttachResult = { pos_order_id: string; created: boolean };

export interface PosAdapter {
  /** Create or attach to an open ticket in the POS for this table/order */
  attachOrder(hpOrder: HpOrder): Promise<AttachResult>;

  /** Idempotently upsert items onto the POS ticket */
  upsertItems(pos_order_id: string, items: HpItem[]): Promise<void>;

  /** Close/settle the POS ticket, optionally recording external tender (Stripe) */
  closeOrder(pos_order_id: string, tender?: ExternalTender): Promise<void>;

  /** Health check / capabilities */
  capabilities(): Promise<{ orderInjection: boolean; externalTender: boolean }>;
}
