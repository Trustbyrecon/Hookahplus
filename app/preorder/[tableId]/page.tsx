"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PreOrderTable({ params }: { params: { tableId: string } }) {
  const [flavor, setFlavor] = useState("Blue Mist + Mint");
  const [amount, setAmount] = useState(3000);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [preview, setPreview] = useState<any | null>(null);
  const [showPreview, setShowPreview] = useState(false);
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
      setMsg("");

      // Track GA event if available
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'Preorder_Submit', {
          event_category: 'Ecommerce',
          event_label: params.tableId,
          value: amount / 100,
        });
      }

      // Build receipt preview first (staff confirmation gate)
      const previewKey = `preview:${params.tableId}:${Date.now()}`;
      const res = await fetch("/api/receipt/preview", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Idempotency-Key": previewKey
        },
        body: JSON.stringify({ 
          basePriceCents: amount,
          premiumAddOns: [],
          marginCents: 500,
          sessionId: params.tableId,
          tableId: params.tableId
        }),
      });

      const json = await res.json();
      if (!json?.preview) throw new Error(json.error || "Preview failed");
      setPreview(json.preview);
      setShowPreview(true);
    } catch (e: any) {
      setMsg(e.message ?? "Preorder failed");
    } finally {
      setBusy(false);
    }
  }

  async function confirmAndPay() {
    if (!preview) return;
    try {
      setBusy(true);
      const checkoutKey = `checkout:${params.tableId}:${Date.now()}`;
      const res = await fetch("/api/checkout-session", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Idempotency-Key": checkoutKey
        },
        body: JSON.stringify({ 
          tableId: params.tableId, 
          flavor, 
          amount, 
          sessionId: preview.sessionId ?? params.tableId,
          marginCents: preview.loungeMarginCents,
          premiumAddOns: preview.premiumAddOns,
          qrLink: preview.qrLink
        }),
      });

      const json = await res.json();
      if (!json.sessionId) throw new Error(json.error || "No session");

      // Redirect to checkout
      router.push(`/checkout?session=${json.sessionId}`);
    } catch (e: any) {
      setMsg(e.message ?? "Preorder failed");
    } finally {
      setBusy(false);
      setShowPreview(false);
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
          
          {showPreview && preview && (
            <div className="mb-4 rounded-lg border border-emerald-600/50 bg-zinc-950 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Base price</span>
                <span className="text-emerald-300">${(preview.basePriceCents / 100).toFixed(2)}</span>
              </div>
              {preview.premiumAddOns?.length > 0 && (
                <div className="space-y-1 text-sm">
                  {preview.premiumAddOns.map((addon: any, idx: number) => (
                    <div key={idx} className="flex justify-between">
                      <span>{addon.name || "Premium add-on"}</span>
                      <span className="text-emerald-300">
                        ${(addon.priceCents / 100).toFixed(2)}
                        {addon.quantity && addon.quantity > 1 ? ` x${addon.quantity}` : ""}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>Lounge margin</span>
                <span className="text-emerald-300">${(preview.loungeMarginCents / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold pt-2 border-t border-zinc-800">
                <span>Total</span>
                <span className="text-emerald-300">${(preview.totalCents / 100).toFixed(2)}</span>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  className="flex-1 py-3 rounded-lg font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={confirmAndPay}
                  disabled={busy}
                >
                  {busy ? "Submitting..." : "Confirm and charge"}
                </button>
                <button
                  className="flex-1 py-3 rounded-lg font-semibold bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"
                  onClick={() => setShowPreview(false)}
                  disabled={busy}
                >
                  Cancel
                </button>
              </div>
              <p className="text-xs text-zinc-500">Staff confirmation required before payment.</p>
            </div>
          )}

          <button
            className="w-full py-4 px-6 rounded-lg font-bold text-lg bg-teal-600 hover:bg-teal-700 text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-60"
            onClick={submitPreorder}
            disabled={busy}
          >
            {busy ? "Building preview..." : "Preview receipt"}
          </button>
        </div>
      </div>
    </main>
  );
}
