"use client";
import { loadStripe } from "@stripe/stripe-js";
import { useState, useEffect } from "react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

export default function Checkout() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [showTrustLock, setShowTrustLock] = useState(false);
  const [preview, setPreview] = useState<any | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Check for success/cancel parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === '1') {
      setShowTrustLock(true);
      // Hide after 5 seconds
      setTimeout(() => setShowTrustLock(false), 5000);
      
      // Return-from-Stripe toast and GA event
      const orderId = urlParams.get('order');
      if (orderId) {
        // Fire Order_Confirmed GA event
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'Order_Confirmed', {
            event_category: 'Ecommerce',
            event_label: orderId,
            value: 30.00,
          });
        }
      }
    }
  }, []);

  async function pay() {
    try {
      setBusy(true);
      setMsg("");
      
      // Track GA event if available
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'Checkout_Pay', {
          event_category: 'Ecommerce',
          event_label: 'T-001',
          value: 30.00,
        });
      }

      // Require staff preview confirmation
      const previewKey = `preview:checkout:${Date.now()}`;
      const previewRes = await fetch("/api/receipt/preview", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Idempotency-Key": previewKey
        },
        body: JSON.stringify({
          basePriceCents: 3000,
          premiumAddOns: [],
          marginCents: 500,
          sessionId: "T-001",
          tableId: "T-001"
        })
      });
      const previewJson = await previewRes.json();
      if (!previewJson?.preview) throw new Error(previewJson.error || "Preview failed");
      setPreview(previewJson.preview);
      setShowPreview(true);
    } catch (e: any) {
      setMsg(e.message ?? "Payment failed");
    } finally {
      setBusy(false);
    }
  }

  async function confirmPayment() {
    if (!preview) return;
    try {
      setBusy(true);
      const checkoutKey = `checkout:${Date.now()}`;
      const res = await fetch("/api/checkout-session", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Idempotency-Key": checkoutKey
        },
        body: JSON.stringify({ 
          tableId: preview.tableId || "T-001", 
          flavor: "Blue Mist + Mint", 
          amount: preview.totalCents ?? 3000,
          sessionId: preview.sessionId || "T-001",
          marginCents: preview.loungeMarginCents,
          premiumAddOns: preview.premiumAddOns,
        }),
      });
      const json = await res.json();
      if (!json.sessionId) throw new Error(json.error || "No session");

      const stripe = await stripePromise;
      const { error } = await stripe!.redirectToCheckout({ sessionId: json.sessionId });
      if (error) throw error;
    } catch (e: any) {
      setMsg(e.message ?? "Payment failed");
    } finally {
      setBusy(false);
      setShowPreview(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white p-8">
      {/* Trust-Lock Verification Banner */}
      {showTrustLock && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
          🔒 Trust-Lock: Verified
        </div>
      )}

      <div className="mx-auto max-w-md space-y-6">
        <h1 className="text-3xl font-bold text-teal-400 text-center">Hookah+ Session Checkout</h1>
        
        <div className="bg-zinc-900 border border-teal-500 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-teal-300">Order Summary</h2>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span>Table:</span>
              <span className="text-teal-400">T-001</span>
            </div>
            <div className="flex justify-between">
              <span>Flavor:</span>
              <span className="text-teal-400">Blue Mist + Mint</span>
            </div>
            <div className="flex justify-between">
              <span>Amount:</span>
              <span className="text-teal-400">$30.00</span>
            </div>
          </div>
          
          {msg && <p className="text-sm text-red-400 mb-4">{msg}</p>}

          {showPreview && preview && (
            <div className="mb-4 rounded-lg border border-emerald-600/50 bg-zinc-950 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Base price</span>
                <span className="text-emerald-300">${(preview.basePriceCents / 100).toFixed(2)}</span>
              </div>
              {preview.premiumAddOns?.length > 0 && preview.premiumAddOns.map((addon: any, idx: number) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>{addon.name || "Premium add-on"}</span>
                  <span className="text-emerald-300">${(addon.priceCents / 100).toFixed(2)}</span>
                </div>
              ))}
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
                  onClick={confirmPayment}
                  disabled={busy}
                >
                  {busy ? "Submitting..." : "Confirm and pay"}
                </button>
                <button
                  className="flex-1 py-3 rounded-lg font-semibold bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"
                  onClick={() => setShowPreview(false)}
                  disabled={busy}
                >
                  Cancel
                </button>
              </div>
              <p className="text-xs text-zinc-500">Receipt preview must be confirmed before Stripe is created.</p>
            </div>
          )}
          
          <button
            className="w-full py-4 px-6 rounded-lg font-bold text-lg bg-teal-600 hover:bg-teal-700 text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-60"
            onClick={pay}
            disabled={busy}
          >
            {busy ? "Building preview…" : "Preview receipt"}
          </button>
        </div>

        {/* Trust-Lock Display */}
        <div className="bg-zinc-900 border border-teal-500 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-green-400">🔒</span>
            <span className="text-teal-200">Trust-Lock: TLH-v1::active</span>
          </div>
          <p className="text-zinc-400 text-sm mt-2">Secure payment processing with cryptographic verification</p>
        </div>
      </div>
    </main>
  );
}
