// app/preorder/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

    window.dispatchEvent(new CustomEvent("reflex-agent-log", {
      detail: { agentId, trustLevel, routeName, sessionContext },
    }));

    localStorage.setItem("user_visited_before", "true");
  }, [routeName]);
}

export default function PreOrder() {
  useReflexAgent("PreOrder");

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-teal-400 mb-6">Pre-Order Station</h1>
        <p className="mb-6 text-lg text-zinc-300">
          Customize and reserve your Hookah+ session ahead of time. Trust tokens apply.
        </p>

        {/* Sentinel: Trust Lock Display */}
        <div className="mb-8 p-6 border border-teal-500 rounded-lg bg-zinc-900">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-green-400">🔒</span>
            <span className="text-teal-200 text-lg font-semibold">Trust Lock: TLH-v1::active</span>
          </div>
          <p className="text-zinc-400">Secure pre-order system with cryptographic verification</p>
        </div>

        {/* Quick Order Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-zinc-900 border border-teal-500 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-teal-300 mb-3">Quick Order</h3>
            <p className="text-zinc-400 mb-4">Ready to order? Head straight to checkout with our signature flavor.</p>
            <Link 
              href="/checkout"
              className="inline-block w-full py-3 px-6 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg text-center transition-colors"
            >
              Order Blue Mist + Mint ($30.00)
            </Link>
          </div>

          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-zinc-300 mb-3">Custom Order</h3>
            <p className="text-zinc-400 mb-4">Coming soon! Customize your flavor selection and quantities.</p>
            <button 
              disabled
              className="w-full py-3 px-6 bg-zinc-600 text-zinc-400 font-medium rounded-lg cursor-not-allowed"
            >
              Customize (Coming Soon)
            </button>
          </div>
        </div>

        {/* Order Flow Guide */}
        <div className="bg-zinc-900 border border-teal-500 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-teal-300 mb-4">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl mb-2">1️⃣</div>
              <div className="text-sm text-zinc-400">Select your flavor</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">2️⃣</div>
              <div className="text-sm text-zinc-400">Pay securely with Stripe</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">3️⃣</div>
              <div className="text-sm text-zinc-400">See it in the dashboard</div>
            </div>
          </div>
        </div>

        {/* Reflex Agent Monitoring */}
        <div className="border border-teal-500 p-6 rounded-xl bg-zinc-900 shadow-xl">
          <p className="text-teal-200">🌀 Reflex Agent Monitoring — Loyalty Sync Enabled</p>
          <p className="text-zinc-400 text-sm mt-2">EP: Payment pipeline ready | Sentinel: Trust validation active | Navigator: UX flow optimized</p>
        </div>
      </div>
    </div>
  );
}
