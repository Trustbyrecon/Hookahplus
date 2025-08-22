"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PreOrderTable({ params }: { params: { tableId: string } }) {
  const [flavor, setFlavor] = useState("Blue Mist + Mint");
  const [amount, setAmount] = useState(3000);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const router = useRouter();

  const flavors = [
    "Blue Mist + Mint",
    "Double Apple",
    "Grape + Mint",
    "Peach + Mint",
    "Strawberry + Mint"
  ];

  const amounts = [
    { label: "30 min", value: 3000, time: "30" },
    { label: "60 min", value: 5000, time: "60" },
    { label: "90 min", value: 7000, time: "90" }
  ];

  async function submitPreorder() {
    try {
      setBusy(true);
      
      // Track GA event if available
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'Preorder_Submit', {
          event_category: 'Ecommerce',
          event_label: params.tableId,
          value: amount / 100,
        });
      }

      const res = await fetch("/api/checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          tableId: params.tableId, 
          flavor, 
          amount 
        }),
      });
      
      const json = await res.json();
      if (!json.id) throw new Error(json.error || "No session");

      // Redirect to checkout
      router.push(`/checkout?session=${json.id}`);
    } catch (e: any) {
      setMsg(e.message ?? "Preorder failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-teal-400 mb-2">Table {params.tableId}</h1>
          <p className="text-xl text-zinc-300">Pre-order your Hookah+ session</p>
        </div>

        {/* Trust-Lock Display */}
        <div className="bg-zinc-900 border border-teal-500 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-green-400">🔒</span>
            <span className="text-teal-200">Trust-Lock: TLH-v1::active</span>
          </div>
          <p className="text-zinc-400 text-sm mt-2">Secure pre-order with cryptographic verification</p>
        </div>

        {/* Flavor Selection */}
        <div className="bg-zinc-900 border border-teal-500 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-teal-300">Select Your Flavor</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {flavors.map((f) => (
              <button
                key={f}
                onClick={() => setFlavor(f)}
                className={`p-3 rounded-lg border transition-all ${
                  flavor === f 
                    ? "border-teal-500 bg-teal-600/20 text-teal-300" 
                    : "border-zinc-700 hover:border-zinc-600 text-zinc-300"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Duration Selection */}
        <div className="bg-zinc-900 border border-teal-500 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-teal-300">Session Duration</h2>
          <div className="grid grid-cols-3 gap-3">
            {amounts.map((a) => (
              <button
                key={a.value}
                onClick={() => setAmount(a.value)}
                className={`p-4 rounded-lg border transition-all ${
                  amount === a.value 
                    ? "border-teal-500 bg-teal-600/20 text-teal-300" 
                    : "border-zinc-700 hover:border-zinc-600 text-zinc-300"
                }`}
              >
                <div className="text-lg font-semibold">{a.label}</div>
                <div className="text-sm text-zinc-400">${(a.value / 100).toFixed(2)}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-zinc-900 border border-teal-500 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-teal-300">Order Summary</h2>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span>Table:</span>
              <span className="text-teal-400">{params.tableId}</span>
            </div>
            <div className="flex justify-between">
              <span>Flavor:</span>
              <span className="text-teal-400">{flavor}</span>
            </div>
            <div className="flex justify-between">
              <span>Duration:</span>
              <span className="text-teal-400">{amounts.find(a => a.value === amount)?.label}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold">
              <span>Total:</span>
              <span className="text-teal-400">${(amount / 100).toFixed(2)}</span>
            </div>
          </div>
          
          {msg && <p className="text-sm text-red-400 mb-4">{msg}</p>}
          
          <button
            className="w-full py-4 px-6 rounded-lg font-bold text-lg bg-teal-600 hover:bg-teal-700 text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-60"
            onClick={submitPreorder}
            disabled={busy}
          >
            {busy ? "Creating Order..." : "Continue to Checkout"}
          </button>
        </div>
      </div>
    </main>
  );
}
