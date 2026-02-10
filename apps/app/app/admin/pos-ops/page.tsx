"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import GlobalNavigation from "../../../components/GlobalNavigation";
import Button from "../../../components/Button";

type OpsPayload = {
  success: boolean;
  loungeId: string | null;
  totals: { ticketsForLounge: number; unassignedTicketsGlobal: number };
  statusBucketsForLounge: Array<{ status: string; count: number }>;
  reconciliation:
    | null
    | {
        total: number;
        matched: number;
        orphaned: number;
        reconciliationRate: number;
      };
  recentTickets: Array<{
    ticketId: string;
    sessionId: string | null;
    amountCents: number | null;
    currency: string | null;
    status: string;
    posSystem: string | null;
    updatedAt: string;
  }>;
};

function pct(n: number) {
  return `${Math.round(n * 1000) / 10}%`;
}

function formatMoney(amountCents: number | null, currency: string | null) {
  if (amountCents == null) return "-";
  const cur = (currency || "USD").toUpperCase();
  return `${cur} $${(amountCents / 100).toFixed(2)}`;
}

export default function PosOpsPage() {
  const [loungeId, setLoungeId] = useState("AliethiaSandbox");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<OpsPayload | null>(null);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (loungeId) p.set("loungeId", loungeId);
    p.set("take", "20");
    return p.toString();
  }, [loungeId]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/pos/ops?${query}`, { cache: "no-store" });
      const json = (await res.json().catch(() => ({}))) as any;
      if (!res.ok || !json?.success) {
        throw new Error(json?.details || json?.error || `HTTP ${res.status}`);
      }
      setData(json as OpsPayload);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load POS ops snapshot");
    } finally {
      setLoading(false);
    }
  }, [query]);

  const pullSquare = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/pos/pull-square", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loungeId, sinceMinutes: 120, limit: 50 }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.success) {
        throw new Error(json?.details || json?.error || `HTTP ${res.status}`);
      }
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to pull Square tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation />

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">POS Ops</h1>
            <p className="text-zinc-400 mt-1">Operational view: exceptions + reconciliation health.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={load} loading={loading}>
              Refresh
            </Button>
            <Button onClick={pullSquare} loading={loading}>
              Pull Square (2h)
            </Button>
          </div>
        </div>

        <div className="card-tablet mb-6">
          <label className="block text-sm text-zinc-400 mb-2">Lounge ID</label>
          <input
            value={loungeId}
            onChange={(e) => setLoungeId(e.target.value)}
            className="w-full md:w-[420px] px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
            placeholder="AliethiaSandbox"
          />
          <p className="text-xs text-zinc-500 mt-2">
            Local lane: <span className="font-mono">AliethiaSandbox</span>. Prod lane: <span className="font-mono">Aliethia</span>.
          </p>
          {error && <div className="mt-3 text-sm text-red-300">Error: {error}</div>}
        </div>

        {data && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="card-tablet">
                <div className="text-xs text-zinc-400">Tickets (attached to lounge)</div>
                <div className="text-2xl font-bold mt-2">{data.totals.ticketsForLounge}</div>
              </div>
              <div className="card-tablet">
                <div className="text-xs text-zinc-400">Unassigned tickets (global)</div>
                <div className="text-2xl font-bold mt-2">{data.totals.unassignedTicketsGlobal}</div>
                <div className="text-xs text-zinc-500 mt-1">No sessionId → needs operator attach or mapping rule</div>
              </div>
              <div className="card-tablet">
                <div className="text-xs text-zinc-400">Reconciliation rate</div>
                <div className="text-2xl font-bold mt-2">
                  {data.reconciliation ? pct(data.reconciliation.reconciliationRate) : "—"}
                </div>
                <div className="text-xs text-zinc-500 mt-1">
                  {data.reconciliation ? `${data.reconciliation.matched}/${data.reconciliation.total} matched` : "No lounge selected"}
                </div>
              </div>
              <div className="card-tablet">
                <div className="text-xs text-zinc-400">Orphaned recon records</div>
                <div className="text-2xl font-bold mt-2">{data.reconciliation ? data.reconciliation.orphaned : "—"}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="card-tablet">
                <h3 className="text-lg font-semibold mb-3">Ticket status buckets (lounge-attached)</h3>
                {data.statusBucketsForLounge.length === 0 ? (
                  <div className="text-sm text-zinc-400">No tickets yet.</div>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {data.statusBucketsForLounge.map((b) => (
                      <li key={b.status} className="flex items-center justify-between">
                        <span className="font-mono text-zinc-300">{b.status}</span>
                        <span className="text-zinc-200">{b.count}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="card-tablet">
                <h3 className="text-lg font-semibold mb-3">Recent tickets</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-zinc-800 text-left text-xs text-zinc-400">
                        <th className="py-2 pr-3">Ticket</th>
                        <th className="py-2 pr-3">Status</th>
                        <th className="py-2 pr-3">Amount</th>
                        <th className="py-2 pr-3">Session</th>
                        <th className="py-2 pr-3">Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentTickets.map((t) => (
                        <tr key={t.ticketId} className="border-b border-zinc-900">
                          <td className="py-2 pr-3 font-mono text-xs text-white">{t.ticketId}</td>
                          <td className="py-2 pr-3 text-xs text-zinc-200">{t.status}</td>
                          <td className="py-2 pr-3 text-xs text-zinc-200">{formatMoney(t.amountCents, t.currency)}</td>
                          <td className="py-2 pr-3 font-mono text-xs text-zinc-300">{t.sessionId || "—"}</td>
                          <td className="py-2 pr-3 text-xs text-zinc-500">{new Date(t.updatedAt).toLocaleString()}</td>
                        </tr>
                      ))}
                      {data.recentTickets.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-4 text-sm text-zinc-400">
                            No tickets found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {!data && !error && (
          <div className="text-sm text-zinc-400">{loading ? "Loading..." : "No data yet."}</div>
        )}
      </div>
    </div>
  );
}

