# Task 3 — pos.adapter.square
**Role:** Scaffold a Square POS adapter behind a stable interface.

## Objective
Create a typed adapter interface and a Square implementation stub (idempotent), with mocks and tests.

## Inputs
- Node 18+
- Integration folder: `/integrations/square/`

## Deliverables
- `/integrations/square/adapter.ts`
- `/integrations/square/squareAdapter.ts`
- `/integrations/square/README.md`
- `/integrations/square/__tests__/squareAdapter.test.ts`

## Checklist
- [ ] Create interface (`sessionStart`, `sessionUpdate`, `syncBill`, `closeBill`, `refund`)
- [ ] Implement Square stub (no live calls)
- [ ] Add mocks & one unit test
- [ ] README with TODOs (OAuth, location mapping, tender types)

## Files (minimal)

**adapter.ts**
```typescript
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
```

**squareAdapter.ts**
```typescript
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
```

**README.md**
- How to obtain Square access token & locationId
- Map Hookah+ lines → Square CatalogObject line items
- Error handling contract `{ code, hint, retryable }`
- TODOs for live SDK integration

**test**
```typescript
import { SquareAdapter } from "../squareAdapter";

test("sessionStart returns posId", async () => {
  const sq = new SquareAdapter({ accessToken: "test", locationId: "L1" });
  const r = await sq.sessionStart({ id: "sess_demo", table: "T-1", lines: [] });
  expect(r.posId).toMatch(/^sq_/);
});
```

## Acceptance
- TypeScript compiles
- Test passes
- README describes next steps for OAuth and live calls

## Guardrails
- No live payments in this task
- Throw typed errors for downstream UI to show actionable messages

## Reflex Score
- +0.4 compile/tests
- +0.3 interface clarity
- +0.2 README
- +0.1 mocks
