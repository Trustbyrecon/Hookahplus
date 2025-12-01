"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import SessionConfirmation from '../../../components/SessionConfirmation';
import GlobalNavigation from '../../../components/GlobalNavigation';

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
    const mode = searchParams.get('mode');
    const payment = searchParams.get('payment');
    const isDemoMode = mode === 'demo';
    
    // Handle demo mode payment confirmation redirect
    if (isDemoMode && payment === 'confirmed') {
      const sessionId = checkoutSessionId || searchParams.get('session');
      if (sessionId) {
        console.log('[Checkout Success] 🎭 Demo Mode: Payment confirmed, redirecting to FSD');
        // Redirect to FSD with demo mode and session ID
        window.location.href = `/fire-session-dashboard?mode=demo&session=${sessionId}&payment=confirmed`;
        return;
      }
    }
    
    if (!checkoutSessionId) {
      setError('No session ID found');
      setLoading(false);
      return;
    }

    // Fetch session details from Stripe and then find/create database session
    const fetchSessionDetails = async () => {
      try {
        // In demo mode, skip Stripe API call and use demo session
        if (isDemoMode) {
          console.log('[Checkout Success] 🎭 Demo Mode: Using demo session data');
          setSessionId(checkoutSessionId);
          setSessionData({
            tableId: 'table-001',
            flavorMix: 'Demo Flavor Mix',
            amount: 3000, // $30.00 in cents
          });
          setLoading(false);
          return;
        }
        
        // First get Stripe checkout session details
        // Use path parameter format: /api/checkout-session/[sessionId]
        const stripeResponse = await fetch(`/api/checkout-session/${checkoutSessionId}`);
        
        if (!stripeResponse.ok) {
          const errorText = await stripeResponse.text();
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { error: errorText || `HTTP ${stripeResponse.status}` };
          }
          
          console.warn('[Checkout Success] Failed to fetch Stripe session:', {
            status: stripeResponse.status,
            error: errorData.error || errorData.details,
            sessionId: checkoutSessionId.substring(0, 20) + '...'
          });
          
          // Continue anyway - we can still show success page with session ID
          // The webhook may still be processing
          throw new Error(errorData.error || errorData.details || 'Failed to fetch session details');
        }

        const stripeResult = await stripeResponse.json();
        
        if (stripeResult.success && stripeResult.session) {
          const stripeSession = stripeResult.session;
          
          // Poll for database session (webhook may still be processing)
          let attempts = 0;
          const maxAttempts = 10; // Try for up to 10 seconds (10 attempts * 1 second)
          
          const pollForDatabaseSession = async (): Promise<string | null> => {
            while (attempts < maxAttempts) {
              // Find database session by externalRef (Stripe checkout session ID)
              const dbResponse = await fetch(`/api/sessions/${checkoutSessionId}`);
              
              if (dbResponse.ok) {
                const dbSession = await dbResponse.json();
                return dbSession.id; // Use actual database session ID
              }
              
              // Wait 1 second before retrying
              attempts++;
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
            return null; // Failed to find database session
          };
          
          const dbSessionId = await pollForDatabaseSession();
          
          if (dbSessionId) {
            setSessionId(dbSessionId); // Use database session ID for QR code
            console.log('[Checkout Success] Found database session:', dbSessionId);
          } else {
            // Fallback to Stripe session ID (API endpoint can handle it)
            console.warn('[Checkout Success] Database session not found after polling. Webhook may still be processing.');
            setSessionId(checkoutSessionId);
            // Note: The QR code will still work because the API endpoint handles externalRef lookup
          }
          
          setSessionData({
            tableId: stripeSession.metadata?.tableId,
            flavorMix: stripeSession.metadata?.flavorMix || stripeSession.metadata?.flavors,
            amount: stripeSession.amount_total,
          });
        }
      } catch (err) {
        console.error('Error fetching session details:', err);
        // Continue with Stripe session ID if database lookup fails
        setSessionId(checkoutSessionId);
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
