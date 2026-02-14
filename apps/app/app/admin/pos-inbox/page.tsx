"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import GlobalNavigation from "../../../components/GlobalNavigation";
import Button from "../../../components/Button";

type PosTicketRow = {
  ticketId: string;
  stripeChargeId: string | null;
  sessionId: string | null;
  amountCents: number | null;
  currency: string | null;
  status: string;
  posSystem: string | null;
  items: string | null;
  createdAt: string;
  updatedAt: string;
  sessionMeta?: { loungeId: string; tableId: string | null } | null;
};

function formatMoney(amountCents: number | null, currency: string | null) {
  if (amountCents == null) return "-";
  const cur = (currency || "USD").toUpperCase();
  return `${cur} $${(amountCents / 100).toFixed(2)}`;
}

export default function PosInboxPage() {
  const [loungeId, setLoungeId] = useState("AliethiaSandbox");
  const [status, setStatus] = useState<string>("");
  const [includeUnassigned, setIncludeUnassigned] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<PosTicketRow[]>([]);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    p.set("take", "50");
    if (status) p.set("status", status);
    if (loungeId) p.set("loungeId", loungeId);
    if (includeUnassigned) p.set("includeUnassigned", "true");
    return p.toString();
  }, [includeUnassigned, loungeId, status]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/pos/tickets?${query}`, { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(data?.details || data?.error || `HTTP ${res.status}`);
      }
      setRows(Array.isArray(data?.data) ? data.data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load POS tickets");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    load();
  }, [load]);

  const attach = async (ticketId: string) => {
    const sessionId = prompt("Attach to sessionId (paste a Session ID):");
    if (!sessionId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/pos/tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, sessionId, status: "attached" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(data?.details || data?.error || `HTTP ${res.status}`);
      }
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to attach ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation />

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">POS Inbox</h1>
            <p className="text-zinc-400 mt-1">
              View ingested POS tickets and attach them to sessions. (Local lane: use <span className="font-mono">AliethiaSandbox</span>)
            </p>
          </div>
          <Button onClick={load} loading={loading}>
            Refresh
          </Button>
        </div>

        <div className="card-tablet mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Lounge ID (optional filter)</label>
              <input
                value={loungeId}
                onChange={(e) => setLoungeId(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                placeholder="AliethiaSandbox"
              />
              <p className="text-xs text-zinc-500 mt-1">Filters via session.loungeId when a ticket is already attached.</p>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Status</label>
              <input
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                placeholder="pending / attached / matched / orphaned"
              />
            </div>
            <div className="flex items-end">
              <label className="inline-flex items-center gap-2 text-sm text-zinc-300 select-none">
                <input
                  type="checkbox"
                  checked={includeUnassigned}
                  onChange={(e) => setIncludeUnassigned(e.target.checked)}
                />
                Include unassigned tickets (no sessionId)
              </label>
            </div>
          </div>

          {error && <div className="mt-4 text-sm text-red-300">Error: {error}</div>}
        </div>

        <div className="card-tablet">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800 text-left text-xs text-zinc-400">
                  <th className="py-3 pr-4">Ticket</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4">Amount</th>
                  <th className="py-3 pr-4">POS</th>
                  <th className="py-3 pr-4">Session</th>
                  <th className="py-3 pr-4">Updated</th>
                  <th className="py-3 pr-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td className="py-6 text-zinc-400" colSpan={7}>
                      {loading ? "Loading..." : "No tickets found."}
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.ticketId} className="border-b border-zinc-900 hover:bg-zinc-900/30">
                      <td className="py-3 pr-4">
                        <div className="font-mono text-sm text-white">{r.ticketId}</div>
                        {r.stripeChargeId && <div className="text-xs text-zinc-500">stripe: {r.stripeChargeId}</div>}
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-sm text-zinc-200">{r.status}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-sm text-zinc-200">{formatMoney(r.amountCents, r.currency)}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-sm text-zinc-200">{r.posSystem || "-"}</span>
                      </td>
                      <td className="py-3 pr-4">
                        {r.sessionId ? (
                          <div>
                            <div className="font-mono text-xs text-white">{r.sessionId}</div>
                            {r.sessionMeta?.tableId && (
                              <div className="text-xs text-zinc-500">table: {r.sessionMeta.tableId}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-zinc-500">—</span>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-xs text-zinc-400">{new Date(r.updatedAt).toLocaleString()}</span>
                      </td>
                      <td className="py-3 pr-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => attach(r.ticketId)}
                          disabled={loading}
                        >
                          Attach
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

