"use client";

import React, { useMemo, useState } from "react";
import GlobalNavigation from "../../../components/GlobalNavigation";
import { ToastContainer } from "../../../components/MicroInteractions";
import { PrepCard } from "@/components/boh/PrepCard";
import { RunCard } from "@/components/foh/RunCard";

export default function Page() {
  const [sessionKey, setSessionKey] = useState("sess_demo");
  const [last, setLast] = useState<any>(null);
  const [toasts, setToasts] = useState<
    Array<{ id: string; message: string; type: "success" | "error" | "warning" | "info" }>
  >([]);

  const addToast = (message: string, type: "success" | "error" | "warning" | "info") => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    setToasts((t) => [...t, { id, message, type }]);
  };

  const onResult = (r: any) => {
    setLast(r);
    if (r?.ok) {
      addToast(`OK → ${r?.new_state ?? "updated"}`, "success");
      return;
    }
    const status = r?._httpStatus;
    if (status === 409) addToast(`409: ${r?.error ?? "Invalid transition"}`, "warning");
    else if (status === 423) addToast(`423: ${r?.error ?? "TrustLock/permission"}`, "warning");
    else addToast(r?.error ?? "Command failed", "error");
  };

  const prettyLast = useMemo(() => {
    try {
      return JSON.stringify(last, null, 2);
    } catch {
      return String(last);
    }
  }, [last]);

  const createDemoSession = async () => {
    try {
      const res = await fetch("/api/sessions?mode=demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId: "T-001",
          customerName: "Demo Guest",
          customerPhone: "+15550000000",
          flavorMix: ["Double Apple"],
          sessionDuration: 45 * 60,
          source: "WALK_IN",
          notes: "Demo session (auto-confirmed payment)",
        }),
      });
      const json = await res.json();
      const createdId = json?.id || json?.sessionId || json?.session?.id;
      if (!createdId) throw new Error(json?.error || "No session id returned");
      setSessionKey(String(createdId));
      addToast(`Demo session created: ${createdId}`, "success");
      setLast(json);
    } catch (e: any) {
      addToast(e?.message || "Failed to create demo session", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation />
      <ToastContainer toasts={toasts} onRemove={(id) => setToasts((t) => t.filter((x) => x.id !== id))} />

      <div className="mx-auto max-w-5xl p-6 space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Fire Session Demo (Orchestrator)</h1>
            <p className="text-sm text-zinc-400">
              BOH/FOH buttons call <code className="text-zinc-200">/api/sessions/[id]/command</code>.
            </p>
          </div>
          <button
            onClick={createDemoSession}
            className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-teal-400 transition-colors"
          >
            Create demo session
          </button>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <label className="block text-xs text-zinc-400 mb-2">Session id / table id / external ref</label>
          <input
            value={sessionKey}
            onChange={(e) => setSessionKey(e.target.value)}
            className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
            placeholder="sess_demo"
          />
          <div className="mt-2 text-xs text-zinc-500">
            Tip: after creating a demo session, this field auto-populates with the new session id.
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <PrepCard id={sessionKey} onResult={onResult} />
          <RunCard id={sessionKey} onResult={onResult} />
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
          <div className="text-sm font-medium text-zinc-200">Last response</div>
          <pre className="mt-2 overflow-auto text-xs text-zinc-300">{prettyLast || "—"}</pre>
        </div>
      </div>
    </div>
  );
}

