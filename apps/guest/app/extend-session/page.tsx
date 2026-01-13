'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { Clock, CreditCard, AlertCircle, CheckCircle, Flame } from 'lucide-react';
import { useGuestSessionContext } from '../../contexts/GuestSessionContext';
import { STATUS_TO_TRACKER_STAGE } from '../../../app/types/enhancedSession';
import Badge from '../../components/Badge';
import { FireSession } from '../../../app/types/enhancedSession';

function ExtendSessionContent() {
  const searchParams = useSearchParams();
  const { activeSession, refreshSessions, tableId, customerPhone, loading } = useGuestSessionContext();
  const [selectedExtension, setSelectedExtension] = useState('20min');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sessionFromUrl, setSessionFromUrl] = useState<FireSession | null>(null);
  const [loadingFromUrl, setLoadingFromUrl] = useState(false);
  
  // Get sessionId from URL params
  const sessionIdFromUrl = searchParams.get('sessionId');
  
  // Fetch session directly from URL if provided
  useEffect(() => {
    if (sessionIdFromUrl && !activeSession && !loadingFromUrl) {
      setLoadingFromUrl(true);
      const fetchSession = async () => {
        try {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
          const response = await fetch(`${appUrl}/api/sessions/status?sessionId=${sessionIdFromUrl}`);
          
          if (response.ok) {
            const data = await response.json();
            const session = data.session || data;
            if (session && session.id) {
              // Convert to FireSession format
              const fireSession: FireSession = {
                id: session.id,
                tableId: session.tableId || 'T-001',
                customerName: session.customerName || 'Guest',
                flavor: session.flavorMix?.join(' + ') || session.flavor || 'Custom Mix',
                status: session.status || session.state || 'ACTIVE',
                sessionDuration: session.sessionDuration || 45 * 60,
                sessionType: session.sessionType || 'flat',
                amount: session.totalAmount || session.amount || 3000,
                ...session
              };
              setSessionFromUrl(fireSession);
            }
          }
        } catch (err) {
          console.error('[ExtendSession] Failed to fetch session from URL:', err);
        } finally {
          setLoadingFromUrl(false);
        }
      };
      fetchSession();
    }
  }, [sessionIdFromUrl, activeSession, loadingFromUrl]);
  
  // Load active session on mount (if no sessionId in URL)
  useEffect(() => {
    if (!sessionIdFromUrl && !activeSession && (tableId || customerPhone) && !loading) {
      refreshSessions();
    }
  }, [sessionIdFromUrl, activeSession, tableId, customerPhone, loading, refreshSessions]);
  
  // Use session from URL if available, otherwise use context session
  const currentSession = sessionFromUrl || activeSession;

  const extensionOptions = [
    {
      id: '20min',
      duration: '20 Minutes',
      price: 10.00,
      description: 'Extend your hookah session for $10.00',
      popular: true
    },
    {
      id: '30min',
      duration: '30 Minutes',
      price: 15.00,
      description: 'Extend your hookah session for $15.00',
      popular: false
    },
    {
      id: '45min',
      duration: '45 Minutes',
      price: 22.00,
      description: 'Extend your hookah session for $22.00',
      popular: false
    },
    {
      id: '60min',
      duration: '60 Minutes',
      price: 28.00,
      description: 'Extend your hookah session for $28.00',
      popular: false
    }
  ];

  const handleExtendSession = async () => {
    if (!currentSession) {
      setError('No active session found. Please start a session first.');
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const selectedOption = extensionOptions.find(opt => opt.id === selectedExtension);
      if (!selectedOption) {
        throw new Error('Invalid extension option');
      }
      
      // Extract minutes from duration string (e.g., "20 Minutes" -> 20)
      const minutes = parseInt(selectedOption.duration.split(' ')[0]);
      
      // Call extend API
      const response = await fetch(`/api/sessions/${currentSession.id}/extend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          extensionMinutes: minutes,
          pricingModel: currentSession.sessionType === 'TIME_BASED' ? 'time-based' : 'flat',
          paymentConfirmed: false, // Will create Stripe checkout if needed
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.details || 'Failed to extend session');
      }
      
      const data = await response.json();
      
      // If Stripe checkout URL is returned, redirect to payment
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      
      // If extension was successful without payment
      if (data.success) {
        setSuccess(true);
        await refreshSessions();
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        throw new Error(data.error || 'Failed to extend session');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extend session. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedOption = extensionOptions.find(opt => opt.id === selectedExtension);
  
  // Show loading state
  if (loading || loadingFromUrl) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
        <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
            <p className="text-zinc-400">Loading session data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error if no active session
  if (!currentSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
        <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <Card className="p-8">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">No Active Session</h2>
              <p className="text-zinc-400 mb-6">
                You don't have an active session to extend. Please start a session first.
              </p>
              <Button
                variant="primary"
                onClick={() => window.location.href = '/'}
                className="w-full"
              >
                Start New Session
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      
      <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Extend Your Session</h1>
          <p className="text-zinc-400">Add more time to your current hookah session</p>
        </div>
        
        {/* Active Session Info */}
        {currentSession && (
          <Card className="mb-6 p-6 border-teal-500/30 bg-teal-500/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Flame className="w-5 h-5 text-teal-400" />
                <span className="font-semibold">Current Session</span>
                <Badge className="bg-teal-500/20 text-teal-400">
                  {STATUS_TO_TRACKER_STAGE[currentSession.status as keyof typeof STATUS_TO_TRACKER_STAGE] || 'Active'}
                </Badge>
              </div>
            </div>
            <div className="text-sm text-zinc-300 space-y-1">
              <div>Table: {currentSession.tableId}</div>
              <div>Flavor: {currentSession.flavor || 'Custom Mix'}</div>
              <div>Duration: {Math.round((currentSession.sessionDuration || 0) / 60)} minutes</div>
            </div>
          </Card>
        )}

        <Card className="p-8">
          {success ? (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-400 mb-2">Session Extended!</h2>
              <p className="text-zinc-400 mb-6">Your session has been successfully extended.</p>
              <Button 
                variant="primary" 
                onClick={() => window.location.href = '/'}
                className="w-full"
              >
                Return to Session
              </Button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-6">Select Extension Duration</h2>
              
              <div className="space-y-4 mb-6">
                {extensionOptions.map((option) => (
                  <div
                    key={option.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      selectedExtension === option.id
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-zinc-700 hover:border-zinc-600'
                    }`}
                    onClick={() => setSelectedExtension(option.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          selectedExtension === option.id
                            ? 'border-primary-500 bg-primary-500'
                            : 'border-zinc-600'
                        }`}>
                          {selectedExtension === option.id && (
                            <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{option.duration}</span>
                            {option.popular && (
                              <span className="px-2 py-1 bg-primary-500 text-white text-xs rounded-full">
                                Popular
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-zinc-400">{option.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary-400">
                          ${option.price.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span className="text-red-400">{error}</span>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="p-4 bg-zinc-800 rounded-lg">
                  <h3 className="font-medium mb-2">Session Details</h3>
                  <div className="space-y-2 text-sm text-zinc-400">
                    <div className="flex justify-between">
                      <span>Current Table:</span>
                      <span className="text-white">{currentSession?.tableId || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Extension:</span>
                      <span className="text-white">{selectedOption?.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Cost:</span>
                      <span className="text-primary-400 font-semibold">
                        ${selectedOption?.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleExtendSession}
                  disabled={isProcessing}
                  leftIcon={<Clock className="w-4 h-4" />}
                >
                  {isProcessing ? 'Processing...' : `Extend Session - $${selectedOption?.price.toFixed(2)}`}
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.location.href = '/'}
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
        </Card>

        {/* Additional Info */}
        <Card className="mt-6 p-6">
          <h3 className="font-semibold mb-4">Session Extension Policy</h3>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li>• Extensions are charged immediately upon confirmation</li>
            <li>• You can extend your session multiple times</li>
            <li>• Extensions start immediately after your current session ends</li>
            <li>• All extensions are non-refundable</li>
            <li>• Staff will be notified of your extension request</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

export default function ExtendSessionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
        <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
            <p className="text-zinc-400">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <ExtendSessionContent />
    </Suspense>
  );
}
