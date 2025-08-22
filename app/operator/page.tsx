// app/operator/page.tsx
"use client";

import { useEffect } from "react";
// Removed: import { Button } from "@/components/ui/button";
// import { button } from "@/components/ui/button";

function useReflexAgent(routeName: string) {
  useEffect(() => {
    const agentId = `reflex-${routeName.toLowerCase()}`;
    const trustLevel = localStorage.getItem("trust_tier") || "Tier I";
    const sessionContext = {
      timestamp: Date.now(),
      returning: localStorage.getItem("user_visited_before") === "true",
    };

    console.log(`[ReflexAgent] ${agentId} loaded`, {
      trustLevel,
      sessionContext,
    });

    window.dispatchEvent(
      new CustomEvent("reflex-agent-log", {
        detail: { agentId, trustLevel, routeName, sessionContext },
      })
    );

    localStorage.setItem("user_visited_before", "true");
  }, [routeName]);
}

export default function OperatorPage() {
  useReflexAgent("Operator");

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white p-8">
      <h1 className="text-4xl font-extrabold text-teal-400 mb-6">Main Operator Dashboard</h1>
      <p className="mb-4 text-lg max-w-xl">
        Manage sessions, layouts, and view Reflex Agent state in real-time.
      </p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <button className="bg-teal-600 hover:bg-teal-500 text-white py-6 text-lg rounded" type="button">
          Start New Session
        </button>
        <button className="border border-teal-400 text-teal-300 hover:text-white py-6 text-lg rounded bg-transparent" type="button">
          Lounge Layout Manager
        </button>
        <button className="text-teal-200 hover:text-white py-6 text-lg rounded bg-transparent" type="button">
          Sync Reflex Logs
        </button>
      </div>

      <div className="mt-12 border border-teal-600 p-6 rounded-2xl bg-zinc-800 shadow-xl">
        <p className="text-teal-200 text-lg">🌀 Reflex Agent Live — Operational Flow Synced</p>
      </div>
    </div>
  );
}
