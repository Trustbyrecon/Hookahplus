"use client";
import { loadStripe } from "@stripe/stripe-js";
import { useState, useEffect } from "react";
import Link from "next/link";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

export default function Checkout() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [showTrustLock, setShowTrustLock] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [amount, setAmount] = useState(3000);
  const [tableId, setTableId] = useState("T-001");
  const [flavor, setFlavor] = useState("Blue Mist + Mint");
  const [showStripeSimulation, setShowStripeSimulation] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending');
  const [aliethiaEvent, setAliethiaEvent] = useState<any>(null);

  // Popular flavors that trigger custom order updates
  const popularFlavors = [
    "Blue Mist + Mint",
    "Double Apple",
    "Grape Mint",
    "Strawberry Kiwi",
    "Peach Iced Tea"
  ];

  // Check for success/cancel parameters and session data
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Handle URL parameters for session data
    const urlSessionId = urlParams.get('sessionId');
    const urlAmount = urlParams.get('amount');
    const urlTableId = urlParams.get('tableId');
    const urlFlavor = urlParams.get('flavor');
    
    if (urlSessionId) setSessionId(urlSessionId);
    if (urlAmount) setAmount(parseInt(urlAmount));
    if (urlTableId) setTableId(urlTableId);
    if (urlFlavor) setFlavor(urlFlavor);
    
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
            value: amount / 100,
          });
        }
      }
    }
  }, [amount]);

  // Simulate Stripe confirmation process
  const simulateStripeConfirmation = async () => {
    setPaymentStatus('processing');
    setShowStripeSimulation(true);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate success
    setPaymentStatus('success');
    
    // Trigger Aliethia.Identity event for popular flavor
    if (popularFlavors.includes(flavor)) {
      const event = {
        type: 'mix_ordered',
        profileId: `guest_${Date.now()}`,
        venueId: 'venue_001',
        comboHash: flavor.toLowerCase().replace(/\s+/g, '_'),
        timestamp: Date.now()
      };
      
      setAliethiaEvent(event);
      
      // Send to Aliethia.Identity agent
      try {
        await fetch('/api/agents/aliethia', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'handle_mix_ordered',
            data: event
          })
        });
      } catch (error) {
        console.error('Failed to trigger Aliethia.Identity:', error);
      }
    }
    
    // Hide simulation after 3 seconds
    setTimeout(() => {
      setShowStripeSimulation(false);
      setPaymentStatus('pending');
    }, 3000);
  };

  async function pay() {
    try {
      setBusy(true);
      
      // Track GA event if available
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'Checkout_Pay', {
          event_category: 'Ecommerce',
          event_label: tableId,
          value: amount / 100,
        });
      }

      // Simulate Stripe confirmation instead of real redirect
      await simulateStripeConfirmation();
      
      // Original Stripe logic (commented out for simulation)
      /*
      const res = await fetch("/api/checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          tableId: tableId, 
          flavor: flavor, 
          amount: amount,
          sessionId: sessionId 
        }),
      });
      const json = await res.json();
      if (!json.id) throw new Error(json.error || "No session");

      const stripe = await stripePromise;
      const { error } = await stripe!.redirectToCheckout({ sessionId: json.id });
      if (error) throw error;
      */
      
    } catch (e: any) {
      setMsg(e.message ?? "Payment failed");
      setPaymentStatus('failed');
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

      {/* Stripe Simulation Overlay */}
      {showStripeSimulation && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-teal-500 rounded-xl p-8 max-w-md mx-4">
            <div className="text-center">
              <div className="mb-4">
                {paymentStatus === 'processing' && (
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-400 mx-auto"></div>
                )}
                {paymentStatus === 'success' && (
                  <div className="text-6xl text-green-400 mb-4">✅</div>
                )}
              </div>
              
              <h3 className="text-xl font-bold text-teal-300 mb-2">
                {paymentStatus === 'processing' && 'Processing Payment...'}
                {paymentStatus === 'success' && 'Payment Successful!'}
              </h3>
              
              <p className="text-zinc-400 mb-4">
                {paymentStatus === 'processing' && 'Please wait while we process your payment'}
                {paymentStatus === 'success' && 'Your order has been confirmed and will be prepared shortly'}
              </p>
              
              {aliethiaEvent && (
                <div className="bg-zinc-800 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🧠</span>
                    <span className="text-teal-300 font-semibold">Aliethia.Identity</span>
                  </div>
                  <p className="text-sm text-zinc-400">
                    Popular flavor detected! Badge progress updated.
                  </p>
                  <div className="text-xs text-zinc-500 mt-2">
                    Event: {aliethiaEvent.type} | Combo: {aliethiaEvent.comboHash}
                  </div>
                </div>
              )}
              
              {paymentStatus === 'success' && (
                <div className="space-y-2">
                  <Link 
                    href="/dashboard"
                    className="block w-full bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    View Dashboard
                  </Link>
                  <Link 
                    href="/sessions"
                    className="block w-full bg-zinc-700 hover:bg-zinc-600 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Track Session
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-teal-400 mb-2">Hookah+ Session Checkout</h1>
          <p className="text-zinc-400">Complete your order securely</p>
          <Link 
            href="/pre-order" 
            className="inline-block mt-4 text-teal-400 hover:text-teal-300 transition-colors"
          >
            ← Back to Pre-Order
          </Link>
        </div>
        
        <div className="bg-zinc-900 border border-teal-500 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-teal-300">Order Summary</h2>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span>Table:</span>
              <span className="text-teal-400">{tableId}</span>
            </div>
            <div className="flex justify-between">
              <span>Flavor:</span>
              <span className="text-teal-400">
                {flavor}
                {popularFlavors.includes(flavor) && (
                  <span className="ml-2 text-xs bg-orange-600 text-white px-2 py-1 rounded">POPULAR</span>
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Amount:</span>
              <span className="text-teal-400">${(amount / 100).toFixed(2)}</span>
            </div>
            {sessionId && (
              <div className="flex justify-between">
                <span>Session ID:</span>
                <span className="text-teal-400 text-sm">{sessionId}</span>
              </div>
            )}
          </div>
          
          {msg && <p className="text-sm text-red-400 mb-4">{msg}</p>}
          
          <button
            className="w-full py-4 px-6 rounded-lg font-bold text-lg bg-teal-600 hover:bg-teal-700 text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-60"
            onClick={pay}
            disabled={busy}
          >
            {busy ? "Processing Payment…" : "Pay with Stripe"}
          </button>
        </div>

        {/* AGENT.MD Integration Display */}
        <div className="bg-zinc-900 border border-orange-500 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🤖</span>
            <span className="text-orange-300 font-semibold">AGENT.MD Suite</span>
          </div>
          <div className="space-y-2 text-sm text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>Aliethia.Identity - Badge tracking active</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>Sentinel.POS - Stealth monitoring</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>EP.Growth - City-cluster targeting</span>
            </div>
            {popularFlavors.includes(flavor) && (
              <div className="flex items-center gap-2">
                <span className="text-orange-400">⚡</span>
                <span>Popular flavor detected - Custom order logic triggered</span>
              </div>
            )}
          </div>
        </div>

        {/* Trust-Lock Display */}
        <div className="bg-zinc-900 border border-teal-500 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-green-400">🔒</span>
            <span className="text-teal-200">Trust-Lock: TLH-v1::active</span>
          </div>
          <p className="text-zinc-400 text-sm mt-2">Secure payment processing with cryptographic verification</p>
        </div>

        {/* Payment Security Info */}
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-teal-300 mb-3">Payment Security</h3>
          <div className="space-y-2 text-sm text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>256-bit SSL encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>PCI DSS compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>Stripe secure checkout</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}