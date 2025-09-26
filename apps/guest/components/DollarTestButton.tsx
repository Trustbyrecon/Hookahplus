"use client";

import React, { useState } from "react";

export default function DollarTestButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | { ok: boolean; message: string }>(null);

  async function runTest() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/payments/live-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "guests:$1-smoke" }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Request failed");

      setResult({ ok: true, message: data?.message ?? "Succeeded" });
    } catch (err: any) {
      setResult({ ok: false, message: err?.message ?? "Failed" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3 flex items-center gap-8">
      <button
        onClick={runTest}
        disabled={loading}
        className="rounded-md px-3 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white border border-emerald-400"
        aria-busy={loading}
      >
        {loading ? "Running $1 test…" : "Run $1 Stripe test"}
      </button>

      {result && (
        <span className={`text-sm ${result.ok ? "text-emerald-400" : "text-rose-400"}`} role="status">
          {result.ok ? "✅ " : "❌ "}
          {result.message}
        </span>
      )}
    </div>
  );
}


