# Task 4 — session.flow.bind
**Role:** Bind FOH/BOH button language to the session command API.

## Objective
Wire UI buttons to `/api/sessions/[id]/command`, using the reducer from `lib/sessionState.ts`.

## Inputs
- `lib/sessionState.ts`, `lib/cmd.ts`
- Components: `PrepCard`, `RunCard`

## Deliverables
- `/components/boh/PrepCard.tsx`
- `/components/foh/RunCard.tsx`
- `/app/demo/fire-session/page.tsx`
- Log: `orchestrator/logs/session_bind.md`

## Checklist
- [ ] Implement `sendCmd` helper
- [ ] Add BOH Prep buttons: Claim Prep, Heat Up, Ready, Remake, Stock Blocked
- [ ] Add FOH buttons: Deliver Now, Delivered, Move Table, Coal Swap, Close
- [ ] Confirm state transitions succeed (200 JSON)

## Snippets

**lib/cmd.ts**
```typescript
export async function sendCmd(
  id: string, 
  cmd: string, 
  data: any = {}, 
  actor: "foh" | "boh" | "system" | "agent" = "agent"
) {
  return fetch(`/api/sessions/${id}/command`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": `${id}:${cmd}:${Date.now()}`
    },
    body: JSON.stringify({ cmd, data, actor })
  }).then(r => r.json());
}
```

**components/boh/PrepCard.tsx**
```typescript
"use client";
import { sendCmd } from "@/lib/cmd";

export function PrepCard({ id }: { id: string }) {
  return (
    <div className="rounded-xl border border-neutral-800 p-4">
      <div className="text-sm">Prep Room · Session {id}</div>
      <div className="mt-3 flex gap-2 flex-wrap">
        <button onClick={() => sendCmd(id, "CLAIM_PREP", {}, "boh")}>
          Claim Prep
        </button>
        <button onClick={() => sendCmd(id, "HEAT_UP", {}, "boh")}>
          Heat Up
        </button>
        <button onClick={() => sendCmd(id, "READY_FOR_DELIVERY", {}, "boh")}>
          Ready
        </button>
        <button onClick={() => sendCmd(id, "REMAKE", { reason: "harsh" }, "boh")}>
          Remake
        </button>
        <button onClick={() => sendCmd(id, "STOCK_BLOCKED", { sku: "coal_cube" }, "boh")}>
          Stock Blocked
        </button>
      </div>
    </div>
  );
}
```

**components/foh/RunCard.tsx**
```typescript
"use client";
import { sendCmd } from "@/lib/cmd";

export function RunCard({ id }: { id: string }) {
  return (
    <div className="rounded-xl border border-neutral-800 p-4">
      <div className="text-sm">Floor · Session {id}</div>
      <div className="mt-3 flex gap-2 flex-wrap">
        <button onClick={() => sendCmd(id, "DELIVER_NOW", {}, "foh")}>
          Deliver Now
        </button>
        <button onClick={() => sendCmd(id, "MARK_DELIVERED", {}, "foh")}>
          Delivered
        </button>
        <button onClick={() => sendCmd(id, "MOVE_TABLE", { table: "T-14" }, "foh")}>
          Move → T-14
        </button>
        <button onClick={() => sendCmd(id, "ADD_COAL_SWAP", {}, "foh")}>
          Coal Swap
        </button>
        <button onClick={() => sendCmd(id, "CLOSE_SESSION", {}, "foh")}>
          Close
        </button>
      </div>
    </div>
  );
}
```

**app/demo/fire-session/page.tsx**
```typescript
import { PrepCard } from "@/components/boh/PrepCard";
import { RunCard } from "@/components/foh/RunCard";

export default function Page() {
  const id = "sess_demo";
  
  return (
    <div className="mx-auto max-w-4xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Fire Session Demo</h1>
      <div className="grid sm:grid-cols-2 gap-4">
        <PrepCard id={id} />
        <RunCard id={id} />
      </div>
      <p className="text-xs text-neutral-400">
        State is in-memory for demo. API: /api/sessions/[id]/command
      </p>
    </div>
  );
}
```

## Acceptance
- Buttons trigger state transitions (HTTP 200)
- Edge actions exist (Remake, Stock Blocked, Move Table)
- Build passes

## Guardrails
- Show toast on 409/423 errors (TrustLock/invalid state)
- Keep idempotency header

## Reflex Score
- +0.5 E2E works
- +0.3 edge buttons
- +0.2 error UX
