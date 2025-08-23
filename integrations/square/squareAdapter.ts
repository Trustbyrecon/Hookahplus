import { PosAdapter, SessionPayload } from "./adapter";

export class SquareAdapter implements PosAdapter {
  constructor(private cfg: { accessToken: string; locationId: string }) {}
  
  async sessionStart(p: SessionPayload) { 
    return { posId: `sq_${p.id}` }; 
  }
  
  async sessionUpdate(_posId: string, _p: SessionPayload) { 
    return; 
  }
  
  async syncBill(_posId: string, _p: SessionPayload) { 
    return { status: "OK" }; 
  }
  
  async closeBill(_posId: string) { 
    return { receiptUrl: "" }; 
  }
  
  async refund(_posId: string, _amount: number, _reason: string) { 
    return { refundId: `rf_${Date.now()}` }; 
  }
}
