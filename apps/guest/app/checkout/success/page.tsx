'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, ExternalLink, Loader2 } from 'lucide-react';
import Button from '../../../components/Button';
import RewardsSignupModal from '../../../components/RewardsSignupModal';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [appSessionId, setAppSessionId] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<{
    tableId?: string;
    flavorMix?: string;
    amount?: number;
    loungeId?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRouting, setIsRouting] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  useEffect(() => {
    const stripeSessionId = searchParams.get('session_id');
    const appSession = searchParams.get('app_session');
    
    if (!stripeSessionId) {
      setError('No checkout session ID found');
      setLoading(false);
      return;
    }

    setSessionId(stripeSessionId);
    setAppSessionId(appSession);
    
    // Fetch Stripe checkout session details to extract h_session (opaque session ID)
    const fetchSessionDetails = async () => {
      try {
        setLoading(true);
        
        // First, get Stripe checkout session details
        const stripeResponse = await fetch(`/api/checkout-session/${stripeSessionId}`);
        
        if (!stripeResponse.ok) {
          throw new Error('Failed to fetch checkout session details');
        }

        const stripeResult = await stripeResponse.json();
        
        if (stripeResult.success && stripeResult.session) {
          const stripeSession = stripeResult.session;
          
          // Extract opaque session ID from metadata (h_session)
          const hSessionId = stripeSession.metadata?.h_session || appSession;
          const loungeId = stripeSession.metadata?.lounge_id || 'default-lounge';
          
          if (hSessionId) {
            setAppSessionId(hSessionId);
            
            // Poll for database session (webhook may still be processing)
            let attempts = 0;
            const maxAttempts = 10; // Try for up to 10 seconds
            
            const pollForDatabaseSession = async (): Promise<string | null> => {
              while (attempts < maxAttempts) {
                try {
                  // Try to find database session by ID
                  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
                  const dbResponse = await fetch(`${appUrl}/api/sessions/${hSessionId}`, {
                    method: 'GET',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    // CORS: credentials not needed for GET requests
                  });
                  
                  if (dbResponse.ok) {
                    const dbSession = await dbResponse.json();
                    // Handle both response formats
                    const sessionId = dbSession.id || dbSession.session?.id || hSessionId;
                    if (sessionId) {
                      return sessionId; // Use actual database session ID
                    }
                  } else if (dbResponse.status === 404) {
                    // Session not found yet, continue polling
                    console.log(`[Checkout Success] Session not found yet, attempt ${attempts + 1}/${maxAttempts}`);
                  } else {
                    console.warn(`[Checkout Success] Unexpected response status: ${dbResponse.status}`);
                  }
                } catch (fetchError) {
                  console.error(`[Checkout Success] Fetch error on attempt ${attempts + 1}:`, fetchError);
                  // Continue polling on error
                }
                
                // Wait 1 second before retrying
                attempts++;
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
              return null;
            };
            
            const dbSessionId = await pollForDatabaseSession();
            
            if (dbSessionId) {
              setAppSessionId(dbSessionId);
              console.log('[Checkout Success] Found database session:', dbSessionId);
            } else {
              // Fallback to h_session ID (API endpoint can handle it)
              console.warn('[Checkout Success] Database session not found after polling. Webhook may still be processing.');
            }
            
            // Set session data for display
            setSessionData({
              tableId: stripeSession.metadata?.tableId,
              flavorMix: stripeSession.metadata?.flavorMix || stripeSession.metadata?.flavors,
              amount: stripeSession.amount_total ? stripeSession.amount_total / 100 : undefined,
              loungeId: loungeId
            });
          } else {
            console.warn('[Checkout Success] No h_session found in Stripe metadata');
          }
        }
      } catch (err) {
        console.error('Error fetching session details:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch session details');
      } finally {
        setLoading(false);
      }
    };

    fetchSessionDetails();
  }, [searchParams]);

  const handleRouteToTracker = () => {
    if (appSessionId) {
      setIsRouting(true);
      const loungeId = sessionData?.loungeId || 'default-lounge';
      const tableId = sessionData?.tableId || 'T-001';
      window.location.href = `/hookah-tracker?sessionId=${appSessionId}&loungeId=${loungeId}&tableId=${tableId}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-800/50 border border-zinc-700 rounded-lg p-8 text-center">
          <Loader2 className="w-16 h-16 text-teal-400 mx-auto mb-4 animate-spin" />
          <h2 className="text-lg font-semibold mb-2">Confirming Payment...</h2>
          <p className="text-zinc-400 text-sm">Please wait while we process your order.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-800/50 border border-zinc-700 rounded-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4">Payment Failed</h2>
          <p className="text-zinc-300 mb-6">{error}</p>
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="w-full"
          >
            Return to Guest Portal
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-800/50 border border-zinc-700 rounded-lg p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Payment Confirmed!</h1>
          <p className="text-zinc-400">
            Your hookah session payment has been processed successfully.
          </p>
        </div>

        {sessionData && (
          <div className="mb-6 p-4 bg-zinc-900/50 rounded-lg text-left space-y-2">
            {sessionData.tableId && (
              <div>
                <p className="text-sm text-zinc-400">Table:</p>
                <p className="text-zinc-300 font-semibold">{sessionData.tableId}</p>
              </div>
            )}
            {sessionData.flavorMix && (
              <div>
                <p className="text-sm text-zinc-400">Flavor Mix:</p>
                <p className="text-zinc-300 font-semibold">{sessionData.flavorMix}</p>
              </div>
            )}
            {sessionData.amount && (
              <div>
                <p className="text-sm text-zinc-400">Amount Paid:</p>
                <p className="text-zinc-300 font-semibold">${sessionData.amount.toFixed(2)}</p>
              </div>
            )}
            {appSessionId && (
              <div>
                <p className="text-sm text-zinc-400">Session ID:</p>
                <p className="text-xs font-mono text-zinc-300 break-all">{appSessionId.substring(0, 8)}...</p>
              </div>
            )}
          </div>
        )}

        {isRouting && (
          <div className="mb-6">
            <p className="text-zinc-400 animate-pulse">
              Opening your live hookah tracker...
            </p>
          </div>
        )}

        {/* Rewards Signup Nudge */}
        <div className="mb-6 p-4 bg-gradient-to-r from-teal-900/30 to-cyan-900/30 border border-teal-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-teal-500/20 rounded-full flex items-center justify-center">
              <span className="text-teal-400 text-lg">🎁</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-teal-300 mb-1">Unlock Rewards & Track Your Sessions</p>
              <p className="text-xs text-zinc-400 mb-3">
                Sign up to earn points, get exclusive offers, and never lose track of your favorite sessions.
              </p>
              <button
                onClick={() => setShowSignupModal(true)}
                className="text-xs bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Sign Up for Rewards
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {appSessionId && !isRouting && (
            <Button
              onClick={handleRouteToTracker}
              className="w-full bg-teal-600 hover:bg-teal-700"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Live Hookah Tracker
            </Button>
          )}
          
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="w-full"
          >
            Return to Guest Portal
          </Button>
        </div>

        {/* Rewards Signup Modal */}
        <RewardsSignupModal
          isOpen={showSignupModal}
          onClose={() => setShowSignupModal(false)}
          onSuccess={(guestInfo) => {
            console.log('Guest registered:', guestInfo);
            // Optionally show a success message or update UI
          }}
          sessionId={appSessionId || undefined}
          loungeId={sessionData?.loungeId || undefined}
        />
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}

