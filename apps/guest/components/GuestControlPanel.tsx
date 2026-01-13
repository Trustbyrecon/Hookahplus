'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Card from './Card';
import Button from './Button';
import Badge from './Badge';
import { 
  Clock, 
  RefreshCw, 
  Flame, 
  X, 
  Plus,
  CheckCircle,
  AlertCircle,
  ChefHat,
  CreditCard
} from 'lucide-react';
import { useGuestSessionContext } from '../contexts/GuestSessionContext';
import { STATUS_TO_TRACKER_STAGE } from '../../app/types/enhancedSession';
import { FireSession } from '../../app/types/enhancedSession';

interface GuestControlPanelProps {
  sessionId?: string;
  onClose?: () => void;
}

export default function GuestControlPanel({ sessionId: sessionIdProp, onClose }: GuestControlPanelProps) {
  const searchParams = useSearchParams();
  const { activeSession, refreshSessions, tableId, customerPhone, loading } = useGuestSessionContext();
  const [selectedExtension, setSelectedExtension] = useState('20min');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'extend' | 'refill' | 'newbowl' | 'closeout' | null>(null);
  const [sessionFromUrl, setSessionFromUrl] = useState<FireSession | null>(null);
  const [loadingFromUrl, setLoadingFromUrl] = useState(false);
  
  // Get sessionId from URL params or prop
  const sessionIdFromUrl = searchParams.get('sessionId') || sessionIdProp;
  
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
                tableId: session.tableId || searchParams.get('tableId') || 'T-001',
                customerName: session.customerName || 'Guest',
                flavor: session.flavorMix?.join(' + ') || session.flavor || 'Custom Mix',
                status: session.status || session.state || 'ACTIVE',
                sessionDuration: session.sessionDuration || 45 * 60,
                sessionType: session.sessionType || 'FLAT',
                amount: session.totalAmount || session.amount || 3000,
                ...session
              };
              setSessionFromUrl(fireSession);
            }
          } else {
            // If API fails, check if demo mode
            const urlParams = new URLSearchParams(window.location.search);
            const isDemo = urlParams.get('demo') === 'true' || urlParams.get('mode') === 'demo';
            
            if (isDemo) {
              // Create mock session for demo
              const demoSession: FireSession = {
                id: sessionIdFromUrl,
                tableId: searchParams.get('tableId') || 'T-001',
                customerName: 'Demo Guest',
                flavor: 'Custom Mix',
                status: 'ACTIVE',
                sessionDuration: 45 * 60,
                sessionType: 'FLAT',
                amount: 3000
              };
              setSessionFromUrl(demoSession);
            }
          }
        } catch (err) {
          console.error('[ControlPanel] Failed to fetch session from URL:', err);
          
          // If error and demo mode, create mock session
          const urlParams = new URLSearchParams(window.location.search);
          const isDemo = urlParams.get('demo') === 'true' || urlParams.get('mode') === 'demo';
          
          if (isDemo && sessionIdFromUrl) {
            const demoSession: FireSession = {
              id: sessionIdFromUrl,
              tableId: searchParams.get('tableId') || 'T-001',
              customerName: 'Demo Guest',
              flavor: 'Custom Mix',
              status: 'ACTIVE',
              sessionDuration: 45 * 60,
              sessionType: 'flat',
              amount: 3000
            };
            setSessionFromUrl(demoSession);
          }
        } finally {
          setLoadingFromUrl(false);
        }
      };
      fetchSession();
    }
  }, [sessionIdFromUrl, activeSession, loadingFromUrl, searchParams]);
  
  // Load active session on mount (if no sessionId in URL)
  // Only refresh if we don't have a session from URL and we have table/customer info
  useEffect(() => {
    // Don't refresh if we have a session from URL or if we already have an active session
    if (sessionIdFromUrl || activeSession || sessionFromUrl) {
      return;
    }
    
    // Only refresh if we have table/customer info and we're not already loading
    if ((tableId || customerPhone) && !loading) {
      refreshSessions();
    }
  }, [sessionIdFromUrl, activeSession, sessionFromUrl, tableId, customerPhone, loading, refreshSessions]);
  
  // Use session from URL if available, otherwise use context session
  const currentSession = sessionFromUrl || activeSession;

  const extensionOptions = [
    { id: '20min', duration: '20 Minutes', price: 10.00, popular: true },
    { id: '30min', duration: '30 Minutes', price: 15.00, popular: false },
    { id: '45min', duration: '45 Minutes', price: 22.00, popular: false },
    { id: '60min', duration: '60 Minutes', price: 28.00, popular: false }
  ];

  const handleExtendSession = async () => {
    if (!currentSession) {
      setError('No active session found.');
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    
    try {
      const selectedOption = extensionOptions.find(opt => opt.id === selectedExtension);
      if (!selectedOption) {
        throw new Error('Invalid extension option');
      }
      
      const minutes = parseInt(selectedOption.duration.split(' ')[0]);
      
      const response = await fetch(`/api/sessions/${currentSession.id}/extend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          extensionMinutes: minutes,
          pricingModel: currentSession.sessionType === 'TIME_BASED' ? 'time-based' : 'flat',
          paymentConfirmed: false,
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.details || 'Failed to extend session');
      }
      
      const data = await response.json();
      
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      
      if (data.success) {
        setSuccess(`Session extended by ${selectedOption.duration}!`);
        setActionType(null);
        await refreshSessions();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(data.error || 'Failed to extend session');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extend session. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestRefill = async () => {
    if (!currentSession) {
      setError('No active session found.');
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch(`/api/sessions/${currentSession.id}/refill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userRole: 'GUEST',
          operatorId: `guest-${currentSession.id}`
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.details || 'Failed to request refill');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Coal refill requested! Staff will bring fresh coals shortly.');
        setActionType(null);
        await refreshSessions();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(data.error || 'Failed to request refill');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request refill. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestNewBowl = async () => {
    if (!currentSession) {
      setError('No active session found.');
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Request new bowl via session action
      const response = await fetch(`/api/sessions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentSession.id,
          action: 'REQUEST_REMAKE',
          userRole: 'GUEST',
          operatorId: `guest-${currentSession.id}`,
          notes: 'Guest requested new bowl'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.details || 'Failed to request new bowl');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('New bowl requested! Staff will prepare a fresh bowl for you.');
        setActionType(null);
        await refreshSessions();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(data.error || 'Failed to request new bowl');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request new bowl. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseOut = async () => {
    if (!currentSession) {
      setError('No active session found.');
      return;
    }
    
    if (!confirm('Are you ready to close out? This will end your session.')) {
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch(`/api/sessions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentSession.id,
          action: 'CLOSE_SESSION',
          userRole: 'GUEST',
          operatorId: `guest-${currentSession.id}`,
          notes: 'Guest requested close out'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.details || 'Failed to close session');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Session closed! Thank you for visiting.');
        setActionType(null);
        await refreshSessions();
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        throw new Error(data.error || 'Failed to close session');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to close session. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading || loadingFromUrl) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!currentSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
        <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <Card className="p-8">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">No Active Session</h2>
              <p className="text-zinc-400 mb-6">
                You don't have an active session. Start a new session to use these controls.
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

  const selectedOption = extensionOptions.find(opt => opt.id === selectedExtension);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Manage Your Session</h1>
          <p className="text-zinc-400">Control your hookah experience</p>
        </div>

        {/* Active Session Info */}
        <Card className="mb-6 p-6 border-teal-500/30 bg-teal-500/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <Flame className="w-5 h-5 text-teal-400" />
              <span className="font-semibold">Active Session</span>
              <Badge className="bg-teal-500/20 text-teal-400">
                {STATUS_TO_TRACKER_STAGE[currentSession.status as keyof typeof STATUS_TO_TRACKER_STAGE] || 'Active'}
              </Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-zinc-300">
            <div>
              <div className="text-zinc-400">Table</div>
              <div className="font-medium text-white">{currentSession.tableId}</div>
            </div>
            <div>
              <div className="text-zinc-400">Flavor</div>
              <div className="font-medium text-white">{currentSession.flavor || 'Custom Mix'}</div>
            </div>
            <div>
              <div className="text-zinc-400">Duration</div>
              <div className="font-medium text-white">{Math.round((currentSession.sessionDuration || 0) / 60)} min</div>
            </div>
            <div>
              <div className="text-zinc-400">Status</div>
              <div className="font-medium text-white">{currentSession.status || 'Active'}</div>
            </div>
          </div>
        </Card>

        {/* Success/Error Messages */}
        {success && (
          <Card className="mb-6 p-4 bg-green-900/20 border-green-500/30">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-400">{success}</span>
            </div>
          </Card>
        )}

        {error && (
          <Card className="mb-6 p-4 bg-red-900/20 border-red-500/30">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400">{error}</span>
            </div>
          </Card>
        )}

        {/* Action Buttons Grid */}
        {!actionType && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card 
              className="p-6 cursor-pointer hover:bg-zinc-800/50 transition-colors border-blue-500/30"
              onClick={() => setActionType('extend')}
            >
              <div className="flex items-center space-x-3 mb-2">
                <Clock className="w-6 h-6 text-blue-400" />
                <h3 className="text-lg font-semibold">Extend Session</h3>
              </div>
              <p className="text-sm text-zinc-400">Add more time to your session</p>
            </Card>

            <Card 
              className="p-6 cursor-pointer hover:bg-zinc-800/50 transition-colors border-orange-500/30"
              onClick={() => setActionType('refill')}
            >
              <div className="flex items-center space-x-3 mb-2">
                <RefreshCw className="w-6 h-6 text-orange-400" />
                <h3 className="text-lg font-semibold">Request Coal Refill</h3>
              </div>
              <p className="text-sm text-zinc-400">Get fresh coals for your hookah</p>
            </Card>

            <Card 
              className="p-6 cursor-pointer hover:bg-zinc-800/50 transition-colors border-purple-500/30"
              onClick={() => setActionType('newbowl')}
            >
              <div className="flex items-center space-x-3 mb-2">
                <ChefHat className="w-6 h-6 text-purple-400" />
                <h3 className="text-lg font-semibold">Request New Bowl</h3>
              </div>
              <p className="text-sm text-zinc-400">Get a fresh bowl with new flavors</p>
            </Card>

            <Card 
              className="p-6 cursor-pointer hover:bg-zinc-800/50 transition-colors border-red-500/30"
              onClick={() => setActionType('closeout')}
            >
              <div className="flex items-center space-x-3 mb-2">
                <CreditCard className="w-6 h-6 text-red-400" />
                <h3 className="text-lg font-semibold">Ready to Close Out</h3>
              </div>
              <p className="text-sm text-zinc-400">End your session and pay</p>
            </Card>
          </div>
        )}

        {/* Extend Session Form */}
        {actionType === 'extend' && (
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Extend Your Session</h2>
              <Button variant="outline" size="sm" onClick={() => setActionType(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4 mb-6">
              {extensionOptions.map((option) => (
                <div
                  key={option.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedExtension === option.id
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-zinc-700 hover:border-zinc-600'
                  }`}
                  onClick={() => setSelectedExtension(option.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedExtension === option.id
                          ? 'border-blue-500 bg-blue-500'
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
                            <Badge className="bg-blue-500 text-white text-xs">Popular</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-blue-400">
                      ${option.price.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
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
          </Card>
        )}

        {/* Refill Confirmation */}
        {actionType === 'refill' && (
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Request Coal Refill</h2>
              <Button variant="outline" size="sm" onClick={() => setActionType(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <p className="text-zinc-400 mb-6">
              Request fresh coals for your hookah. Staff will be notified and bring them to your table.
            </p>

            <Button
              variant="primary"
              className="w-full"
              onClick={handleRequestRefill}
              disabled={isProcessing}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              {isProcessing ? 'Requesting...' : 'Request Coal Refill'}
            </Button>
          </Card>
        )}

        {/* New Bowl Confirmation */}
        {actionType === 'newbowl' && (
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Request New Bowl</h2>
              <Button variant="outline" size="sm" onClick={() => setActionType(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <p className="text-zinc-400 mb-6">
              Request a fresh bowl with new flavors. Staff will prepare and deliver it to your table.
            </p>

            <Button
              variant="primary"
              className="w-full"
              onClick={handleRequestNewBowl}
              disabled={isProcessing}
              leftIcon={<ChefHat className="w-4 h-4" />}
            >
              {isProcessing ? 'Requesting...' : 'Request New Bowl'}
            </Button>
          </Card>
        )}

        {/* Close Out Confirmation */}
        {actionType === 'closeout' && (
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Ready to Close Out</h2>
              <Button variant="outline" size="sm" onClick={() => setActionType(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <p className="text-zinc-400 mb-6">
              End your session and proceed to payment. Staff will bring your check.
            </p>

            <Button
              variant="primary"
              className="w-full bg-red-600 hover:bg-red-700"
              onClick={handleCloseOut}
              disabled={isProcessing}
              leftIcon={<CreditCard className="w-4 h-4" />}
            >
              {isProcessing ? 'Closing...' : 'Close Out & Pay'}
            </Button>
          </Card>
        )}

        {/* Back Button */}
        {onClose && (
          <div className="text-center">
            <Button variant="outline" onClick={onClose}>
              Back to Session
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
