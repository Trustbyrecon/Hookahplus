"use client";
import { useEffect, useMemo, useState } from "react";

type SyncEvent = {
  event_id: string;
  type: string;
  created_at: string;
  session_id?: string;
  payment_intent_id?: string;
  payload_hash?: string;
  flags?: string[];
};

export default function SyncInspectorPage() {
  const [events, setEvents] = useState<SyncEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(50);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const res = await fetch(`/api/admin/sync/events?limit=${limit}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!alive) return;
        setEvents(data.events || []);
        setError(null);
      } catch (e: any) {
        setError(e.message);
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    const t = setInterval(load, 2000);
    return () => { alive = false; clearInterval(t); };
  }, [limit]);

  const counters = useMemo(() => {
    const c: Record<string, number> = {};
    for (const e of events) c[e.type] = (c[e.type] || 0) + 1;
    return c;
  }, [events]);

  function flagColor(flags?: string[]) {
    if (!flags || flags.length === 0) return "bg-green-100 text-green-800";
    if (flags.includes("missing_join") || flags.includes("webhook_error")) return "bg-red-100 text-red-800";
    return "bg-yellow-100 text-yellow-800";
  }

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Sync Inspector</h1>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(counters).map(([k, v]) => (
          <div key={k} className="rounded-xl p-4 shadow border">
            <div className="text-xs uppercase text-gray-500">{k}</div>
            <div className="text-2xl font-bold">{v}</div>
          </div>
        ))}
        <div className="rounded-xl p-4 shadow border">
          <div className="text-xs uppercase text-gray-500">Limit</div>
          <input
            type="number"
            className="mt-1 w-full border rounded-lg p-2"
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value || "50", 10))}
          />
        </div>
      </section>

      {error && <div className="p-3 rounded bg-red-100 text-red-700">Error: {error}</div>}
      {loading && <div className="p-3 rounded bg-gray-100">Loading events…</div>}

      <table className="w-full text-sm border-separate border-spacing-y-2">
        <thead>
          <tr className="text-left">
            <th className="px-2">Time</th>
            <th className="px-2">Type</th>
            <th className="px-2">Session</th>
            <th className="px-2">Payment</th>
            <th className="px-2">Seal</th>
            <th className="px-2">Flags</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => (
            <tr key={e.event_id} className="bg-white shadow rounded">
              <td className="px-2 py-2">{new Date(e.created_at).toLocaleTimeString()}</td>
              <td className="px-2 py-2">{e.type}</td>
              <td className="px-2 py-2 font-mono text-xs">{e.session_id || "-"}</td>
              <td className="px-2 py-2 font-mono text-xs">{e.payment_intent_id || "-"}</td>
              <td className="px-2 py-2 font-mono text-xs">{e.payload_hash?.slice(0, 10) || "-"}</td>
              <td className="px-2 py-2">
                <span className={`px-2 py-1 rounded ${flagColor(e.flags)}`}>
                  {(e.flags && e.flags.join(", ")) || "ok"}
                </span>
              </td>
            </tr>
          ))}
          {events.length === 0 && !loading && (
            <tr><td className="px-2 py-6 text-gray-500" colSpan={6}>No events.</td></tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
