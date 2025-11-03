"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import SessionConfirmation from '../../components/SessionConfirmation';
import GlobalNavigation from '../../components/GlobalNavigation';
import Stripe from 'stripe';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<{
    tableId?: string;
    flavorMix?: string;
    amount?: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkoutSessionId = searchParams.get('session_id');
    
    if (!checkoutSessionId) {
      setError('No session ID found');
      setLoading(false);
      return;
    }

    setSessionId(checkoutSessionId);

    // Fetch session details from Stripe
    const fetchSessionDetails = async () => {
      try {
        const response = await fetch(`/api/checkout-session/${checkoutSessionId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch session details');
        }

        const result = await response.json();
        
        if (result.success && result.session) {
          const session = result.session;
          setSessionData({
            tableId: session.metadata?.tableId,
            flavorMix: session.metadata?.flavorMix || session.metadata?.flavors,
            amount: session.amount_total,
          });
        }
      } catch (err) {
        console.error('Error fetching session details:', err);
        // Continue with basic display even if fetch fails
        setSessionData({
          tableId: undefined,
          flavorMix: undefined,
          amount: undefined,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSessionDetails();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading session details...</p>
        </div>
      </div>
    );
  }

  if (error || !sessionId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-2xl">!</span>
          </div>
          <h1 className="text-2xl font-bold mb-4">Payment Confirmed</h1>
          <p className="text-zinc-300 mb-6">
            {error || 'Your payment was successful. Session details will be available shortly.'}
          </p>
          <a
            href="/fire-session-dashboard"
            className="inline-block bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-500 transition-colors"
          >
            View Sessions
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <SessionConfirmation
            sessionId={sessionId}
            tableId={sessionData?.tableId}
            flavorMix={sessionData?.flavorMix}
            amount={sessionData?.amount}
          />

          <div className="mt-6 flex gap-4 justify-center">
            <a
              href="/fire-session-dashboard"
              className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              View All Sessions
            </a>
            <a
              href="/"
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Return to Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading...</p>
        </div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
