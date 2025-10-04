import { PosAdapter, SessionPayload } from "./adapter";

export class SquareAdapter implements PosAdapter {
  constructor(private cfg: { accessToken: string; locationId: string }) {}
  
  async sessionStart(p: SessionPayload): Promise<{ posId: string }> { 
    return { posId: `sq_${p.id}` }; 
  }
  
  async sessionUpdate(_posId: string, _p: SessionPayload): Promise<void> { 
    return; 
  }
  
  async syncBill(_posId: string, _p: SessionPayload): Promise<{ status: "OK" }> { 
    return { status: "OK" as const }; 
  }
  
  async closeBill(_posId: string): Promise<{ receiptUrl?: string }> { 
    return { receiptUrl: "" }; 
  }
  
  async refund(_posId: string, _amount: number, _reason: string): Promise<{ refundId: string }> {
    return { refundId: `refund_${Date.now()}` };
  }
}