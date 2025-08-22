"use client";
import { loadStripe } from "@stripe/stripe-js";
import { useState, useEffect } from "react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

export default function Checkout() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [showTrustLock, setShowTrustLock] = useState(false);

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
      
      // Track GA event if available
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'Checkout_Pay', {
          event_category: 'Ecommerce',
          event_label: 'T-001',
          value: 30.00,
        });
      }

      // For demo, table + flavor could be passed via query or local state
      const res = await fetch("/api/checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableId: "T-001", flavor: "Blue Mist + Mint", amount: 3000 }),
      });
      const json = await res.json();
      if (!json.id) throw new Error(json.error || "No session");

      const stripe = await stripePromise;
      const { error } = await stripe!.redirectToCheckout({ sessionId: json.id });
      if (error) throw error;
    } catch (e: any) {
      setMsg(e.message ?? "Payment failed");
    } finally {
      setBusy(false);
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
          
          <button
            className="w-full py-4 px-6 rounded-lg font-bold text-lg bg-teal-600 hover:bg-teal-700 text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-60"
            onClick={pay}
            disabled={busy}
          >
            {busy ? "Redirecting to Stripe…" : "Pay with Stripe"}
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
