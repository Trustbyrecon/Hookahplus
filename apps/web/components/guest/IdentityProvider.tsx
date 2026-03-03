// apps/web/components/guest/IdentityProvider.tsx
"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

type IdentityCtx = { guestId?: string; loading: boolean };
const Ctx = createContext<IdentityCtx>({ loading: true });

export function IdentityProvider({ loungeId, children }: { loungeId: string; children: React.ReactNode }) {
  const [state, setState] = useState<IdentityCtx>({ loading: true });

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/guest/enter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ loungeId }),
      });
      const json = await res.json();
      setState({ guestId: json.guestId, loading: false });
      // Fire event log (optional)
      await fetch("/api/guest/event/log", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ type: "guest.view", payload: { loungeId, guestId: json.guestId } }),
      });
    })();
  }, [loungeId]);

  return <Ctx.Provider value={state}>{children}</Ctx.Provider>;
}

export function useIdentity() {
  return useContext(Ctx);
}
