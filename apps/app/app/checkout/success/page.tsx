'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [amount, setAmount] = useState<string | null>(null);
  const [stripeUrl, setStripeUrl] = useState<string | null>(null);
  const [isSmokeTest, setIsSmokeTest] = useState(false);

  useEffect(() => {
    const order = searchParams.get('order');
    const session = searchParams.get('session_id');
    const amt = searchParams.get('amount');
    const stripe = searchParams.get('stripe_url');
    
    if (order) setOrderId(order);
    if (session) setSessionId(session);
    if (amt) setAmount(amt);
    if (stripe) setStripeUrl(decodeURIComponent(stripe));
    
    // Check if this is a smoke test
    if (session && session.includes('test') || amt === '100') {
      setIsSmokeTest(true);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-4">
          {isSmokeTest ? '$1 Smoke Test Succeeded!' : 'Payment Successful!'}
        </h1>
        <p className="text-zinc-300 mb-6">
          {isSmokeTest ? (
            <>
              RWO smoke test completed successfully!<br/>
              Session ID: {sessionId || 'N/A'}<br/>
              Amount: ${amount ? (parseInt(amount) / 100).toFixed(2) : '1.00'}
            </>
          ) : (
            `Your hookah session has been confirmed. Order ID: ${orderId || 'N/A'}`
          )}
        </p>
        <div className="space-y-4">
          {isSmokeTest && stripeUrl && (
            <a
              href={stripeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors mr-4"
            >
              View in Stripe Dashboard
            </a>
          )}
          <a
            href="/"
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Return to Dashboard
          </a>
          <a
            href="/fire-session-dashboard"
            className="inline-block border border-zinc-600 text-zinc-300 px-6 py-3 rounded-lg hover:bg-zinc-800 transition-colors ml-4"
          >
            View Sessions
          </a>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccess() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">Loading...</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
