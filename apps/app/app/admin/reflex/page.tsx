"use client";
import { useEffect, useMemo, useState } from "react";

export default function ReflexAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [type, setType] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const url = new URL("/api/admin/reflex", window.location.origin);
      if (type) url.searchParams.set("type", type);
      if (q) url.searchParams.set("q", q);
      const r = await fetch(url.toString(), { cache: "no-store" });
      const j = await r.json();
      setItems(j.items || []);
    } catch (error) {
      console.error("Failed to load events:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [type, q]);

  const counters = useMemo(() => {
    const c: Record<string, number> = {}; 
    items.forEach(i => { c[i.type] = (c[i.type]||0)+1; }); 
    return c;
  }, [items]);

  return (
    <div className="min-h-screen w-full bg-[#0b0f12] text-white">
      <div className="mx-auto max-w-7xl px-6 py-10 space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">Reflex Events Dashboard</h1>
          <p className="text-white/70">Monitor pricing intelligence and user behavior patterns</p>
        </header>

        <div className="flex gap-3 items-end">
          <div>
            <label className="text-xs text-white/60">Event Type</label>
            <input 
              className="block mt-1 bg-white/5 border border-white/10 rounded p-2 text-white" 
              value={type} 
              onChange={e=>setType(e.target.value)} 
              placeholder="ui.sub.select" 
            />
          </div>
          <div>
            <label className="text-xs text-white/60">Search</label>
            <input 
              className="block mt-1 bg-white/5 border border-white/10 rounded p-2 text-white" 
              value={q} 
              onChange={e=>setQ(e.target.value)} 
              placeholder="sessionId / paymentIntent" 
            />
          </div>
          <button 
            onClick={load} 
            disabled={loading}
            className="h-9 px-3 rounded bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(counters).map(([k,v])=> (
            <div key={k} className="rounded-xl border border-white/10 p-3 bg-white/5">
              <div className="text-xs text-white/60">{k}</div>
              <div className="text-xl font-semibold">{v}</div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/5">
              <tr className="text-left">
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Session</th>
                <th className="px-4 py-3">Payment Intent</th>
                <th className="px-4 py-3">IP</th>
                <th className="px-4 py-3">Payload</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.id} className="border-t border-white/10 hover:bg-white/5">
                  <td className="px-4 py-3">{new Date(i.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs bg-emerald-500/15 text-emerald-300">
                      {i.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-500/15 text-blue-300">
                      {i.source}
                    </span>
                  </td>
                  <td className="px-4 py-3">{i.sessionId || "-"}</td>
                  <td className="px-4 py-3">{i.paymentIntent || "-"}</td>
                  <td className="px-4 py-3">{i.ip || "-"}</td>
                  <td className="px-4 py-3">
                    {i.payload ? (
                      <details className="cursor-pointer">
                        <summary className="text-xs text-white/60">View</summary>
                        <pre className="mt-2 text-xs bg-black/20 p-2 rounded overflow-auto max-w-xs">
                          {JSON.stringify(JSON.parse(i.payload), null, 2)}
                        </pre>
                      </details>
                    ) : "-"}
                  </td>
                </tr>
              ))}
              {items.length === 0 && !loading && (
                <tr>
                  <td className="px-4 py-6 text-white/50 text-center" colSpan={7}>
                    No events found.
                  </td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td className="px-4 py-6 text-white/50 text-center" colSpan={7}>
                    Loading events...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
