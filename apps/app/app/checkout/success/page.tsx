"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import GlobalNavigation from '../../../components/GlobalNavigation';
import { PostCheckoutEngagement } from '../../../components/PostCheckoutEngagement';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<{
    tableId?: string;
    flavorMix?: string;
    amount?: number;
    demoSlug?: string;
    loungeId?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEngagement, setShowEngagement] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  
  // Extract search params at component level for use in return statement
  const lounge = searchParams.get('lounge'); // Demo slug from URL
  const mode = searchParams.get('mode');
  const isDemoMode = mode === 'demo';

  useEffect(() => {
    const checkoutSessionId = searchParams.get('session_id');
    const payment = searchParams.get('payment');
    
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
            demoSlug: lounge || undefined,
            loungeId: 'demo-lounge',
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
          const maxAttempts = 20; // Try for up to 20 seconds (20 attempts * 1 second) - webhooks can be slow
          
          const pollForDatabaseSession = async (): Promise<string | null> => {
            while (attempts < maxAttempts) {
              // Try finding by externalRef first (Stripe checkout session ID)
              const dbResponse = await fetch(`/api/sessions/${checkoutSessionId}`);
              
              if (dbResponse.ok) {
                const dbSession = await dbResponse.json();
                const sessionId = dbSession.id || dbSession.session?.id;
                if (sessionId) {
                  return sessionId; // Use actual database session ID
                }
              }
              
              // Also try finding by searching all sessions for this externalRef
              try {
                const allSessionsResponse = await fetch('/api/sessions');
                if (allSessionsResponse.ok) {
                  const allSessionsData = await allSessionsResponse.json();
                  const sessions = allSessionsData.sessions || allSessionsData;
                  const foundSession = Array.isArray(sessions) 
                    ? sessions.find((s: any) => s.externalRef === checkoutSessionId || s.id === checkoutSessionId)
                    : null;
                  if (foundSession) {
                    return foundSession.id;
                  }
                }
              } catch (searchError) {
                console.warn('[Checkout Success] Error searching all sessions:', searchError);
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
            console.log('[Checkout Success] ✅ Found database session:', dbSessionId);
          } else {
            // Fallback to Stripe session ID (API endpoint can handle it)
            console.warn('[Checkout Success] ⚠️ Database session not found after polling. Webhook may still be processing.');
            console.warn('[Checkout Success] Using Stripe session ID as fallback:', checkoutSessionId);
            setSessionId(checkoutSessionId);
            // Note: The QR code will still work because the API endpoint handles externalRef lookup
          }
          
          setSessionData({
            tableId: stripeSession.metadata?.tableId,
            flavorMix: stripeSession.metadata?.flavorMix || stripeSession.metadata?.flavors,
            amount: stripeSession.amount_total,
            loungeId: stripeSession.metadata?.loungeId,
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
          loungeId: undefined,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSessionDetails();
  }, [searchParams]);

  // Fetch points/rewards data and show engagement hub
  useEffect(() => {
    if (sessionId && sessionData && !loading) {
      // Calculate points earned (3% of total, matching guest checkout logic)
      const earned = sessionData.amount ? Math.round(sessionData.amount * 0.03) : 0;
      setPointsEarned(earned);
      
      // Fetch guest profile for total points (if available)
      // For now, use a mock or fetch from API if guest ID is available
      setTotalPoints(earned); // Will be updated if we can fetch from API
      
      // Show engagement hub instead of immediate redirect
      setShowEngagement(true);
    }
  }, [sessionId, sessionData, loading]);

  const handleContinueToTracker = () => {
    if (!sessionId || !sessionData) return;
    
    const guestTrackerUrl = process.env.NEXT_PUBLIC_GUEST_URL || 'https://guest.hookahplus.net';
    const loungeId = sessionData.loungeId || 'default-lounge';
    const tableId = sessionData.tableId || 'T-001';
    
    const isDemo = isDemoMode || sessionId.startsWith('demo_');
    const demoParam = isDemo ? '&demo=true&mode=demo' : '';
    const acceleratedParam = isDemo ? '&accelerated=true' : '';
    
    const trackerUrl = `${guestTrackerUrl}/hookah-tracker?sessionId=${sessionId}&loungeId=${loungeId}&tableId=${tableId}${demoParam}${acceleratedParam}`;
    
    console.log('[Checkout Success] ✅ Redirecting to hookah tracker:', trackerUrl);
    window.location.href = trackerUrl;
  };

  const handleExtendSession = () => {
    // TODO: Implement session extension flow
    console.log('[PostCheckout] Extend session requested for:', sessionId);
    alert('Session extension feature coming soon!');
  };

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
      
      {showEngagement && sessionId ? (
        <PostCheckoutEngagement
          sessionId={sessionId}
          pointsEarned={pointsEarned}
          totalPoints={totalPoints}
          loungeId={sessionData?.loungeId || 'default-lounge'}
          loungeName={sessionData?.loungeId ? undefined : undefined} // TODO: Fetch lounge name
          loungeInstagram={undefined} // TODO: Fetch from lounge config
          operatorInstagram={undefined} // TODO: Fetch from operator config
          onExtendSession={handleExtendSession}
          onContinue={handleContinueToTracker}
          onClose={handleContinueToTracker}
        />
      ) : (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Payment Confirmed!</h2>
              <p className="text-zinc-400 mb-4">Your hookah session has been created successfully</p>
              
              {sessionData?.tableId && (
                <p className="text-zinc-300 mb-6">
                  Table: <span className="font-semibold">{sessionData.tableId}</span>
                </p>
              )}
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between p-3 bg-zinc-900 rounded-lg">
                  <span className="text-zinc-300">Session ID:</span>
                  <span className="text-white font-mono text-sm">{sessionId}</span>
                </div>
                
                {sessionData?.amount && (
                  <div className="flex items-center justify-between p-3 bg-zinc-900 rounded-lg">
                    <span className="text-zinc-300">Amount Paid:</span>
                    <span className="text-green-400 font-semibold">${(sessionData.amount / 100).toFixed(2)}</span>
                  </div>
                )}
              </div>
              
              <p className="text-teal-400 mb-4 animate-pulse">
                Loading engagement hub...
              </p>

              <div className="mt-6 flex gap-4 justify-center">
                <button
                  onClick={handleContinueToTracker}
                  className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Continue to Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
