"use client";

import React, { useState } from "react";
import { DollarSign, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface TestResult {
  ok: boolean;
  message: string;
  intentId?: string;
  duration?: number;
}

export default function DollarTestButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  async function runTest() {
    setLoading(true);
    setResult(null);
    
    try {
      const startTime = Date.now();
      
      const res = await fetch("/api/payments/live-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          source: "app:$1-smoke",
          cartTotal: 100,
          itemsCount: 1
        }),
      });

      const data = await res.json();
      const duration = Date.now() - startTime;
      
      if (!res.ok) {
        console.error('$1 Test API Error:', data);
        throw new Error(data?.error || `Request failed with status ${res.status}`);
      }

      setResult({ 
        ok: true, 
        message: data?.message || "Payment succeeded",
        intentId: data?.intentId,
        duration
      });
      
      // Auto-clear success message after 5 seconds
      setTimeout(() => setResult(null), 5000);
      
    } catch (err: any) {
      setResult({ 
        ok: false, 
        message: err?.message || "Test failed",
        duration: Date.now() - Date.now()
      });
      
      // Auto-clear error message after 8 seconds
      setTimeout(() => setResult(null), 8000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center space-x-3">
      <button
        onClick={runTest}
        disabled={loading}
        className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg border border-emerald-400 transition-all duration-200 text-sm font-medium"
        aria-busy={loading}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Testing...</span>
          </>
        ) : (
          <>
            <DollarSign className="w-4 h-4" />
            <span>$1 Test</span>
          </>
        )}
      </button>

      {result && (
        <div className={`flex items-center space-x-2 text-sm font-medium ${
          result.ok ? "text-emerald-400" : "text-red-400"
        }`}>
          {result.ok ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          <span>{result.message}</span>
          {result.intentId && (
            <span className="text-xs text-zinc-400">
              ({result.intentId.slice(-8)})
            </span>
          )}
          {result.duration && (
            <span className="text-xs text-zinc-400">
              ({result.duration}ms)
            </span>
          )}
        </div>
      )}
    </div>
  );
}
