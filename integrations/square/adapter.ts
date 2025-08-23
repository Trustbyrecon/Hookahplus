export type BillLine = { 
  sku: string; 
  name: string; 
  qty: number; 
  unitAmount: number; 
  notes?: string 
};

export type SessionPayload = { 
  id: string; 
  table: string; 
  lines: BillLine[]; 
  meta?: Record<string, any> 
};

export interface PosAdapter {
  sessionStart(p: SessionPayload): Promise<{ posId: string }>;
  sessionUpdate(posId: string, p: SessionPayload): Promise<void>;
  syncBill(posId: string, p: SessionPayload): Promise<{ status: "OK" }>;
  closeBill(posId: string): Promise<{ receiptUrl?: string }>;
  refund(posId: string, amount: number, reason: string): Promise<{ refundId: string }>;
}
