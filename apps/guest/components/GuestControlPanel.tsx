'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  CreditCard,
  Sparkles,
  ArrowRight,
  Smartphone,
  ExternalLink
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
  const [hasCheckedSession, setHasCheckedSession] = useState(false); // Track if we've completed initial check
  const hasFetchedRef = useRef(false);
  const hasTrackedViewRef = useRef(false);
  
  // Get sessionId from URL params or prop
  const sessionIdFromUrl = searchParams.get('sessionId') || sessionIdProp;
  
  // Fetch session directly from URL if provided (only once)
  useEffect(() => {
    // Prevent multiple fetches
    if (hasFetchedRef.current || sessionFromUrl || !sessionIdFromUrl || activeSession || loadingFromUrl) {
      return;
    }
    
    hasFetchedRef.current = true;
    setLoadingFromUrl(true);
      const fetchSession = async () => {
        // Check if demo mode first - skip API call entirely
        const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
        const isExplicitDemo = urlParams?.get('demo') === 'true' || 
                              urlParams?.get('mode') === 'demo' ||
                              sessionIdFromUrl?.startsWith('demo_') ||
                              sessionIdFromUrl === 'session_demo';
        
        if (isExplicitDemo) {
          // Create mock session for demo without API call
          const now = Date.now();
          const demoSession: FireSession = {
            id: sessionIdFromUrl,
            tableId: searchParams.get('tableId') || 'T-001',
            customerName: 'Demo Guest',
            flavor: 'Custom Mix',
            status: 'ACTIVE',
            currentStage: 'CUSTOMER',
            sessionDuration: 45 * 60,
            sessionType: 'FLAT',
            amount: 3000,
            assignedStaff: {},
            createdAt: now,
            updatedAt: now,
            coalStatus: 'active',
            refillStatus: 'none',
            notes: '',
            edgeCase: null
          };
          setSessionFromUrl(demoSession);
          setLoadingFromUrl(false);
          return;
        }
        
        // Try to fetch from API, but gracefully handle 404s as demo mode
        try {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
          const response = await fetch(`${appUrl}/api/sessions/status?sessionId=${sessionIdFromUrl}`);
          
          if (response.ok) {
            const data = await response.json();
            const session = data.session || data;
            if (session && session.id) {
              // Convert to FireSession format
              const now = Date.now();
              const fireSession: FireSession = {
                id: session.id,
                tableId: session.tableId || searchParams.get('tableId') || 'T-001',
                customerName: session.customerName || 'Guest',
                flavor: session.flavorMix?.join(' + ') || session.flavor || 'Custom Mix',
                status: session.status || session.state || 'ACTIVE',
                currentStage: session.currentStage || 'CUSTOMER',
                sessionDuration: session.sessionDuration || 45 * 60,
                sessionType: session.sessionType || 'FLAT',
                amount: session.totalAmount || session.amount || 3000,
                assignedStaff: session.assignedStaff || {},
                createdAt: session.createdAt || now,
                updatedAt: session.updatedAt || now,
                coalStatus: session.coalStatus || 'active',
                refillStatus: session.refillStatus || 'none',
                notes: session.notes || '',
                edgeCase: session.edgeCase || null,
                ...session
              };
              setSessionFromUrl(fireSession);
            }
          } else if (response.status === 404) {
            // 404 means session doesn't exist in app build - treat as demo mode
            // Don't log to avoid console spam
            const now = Date.now();
            const demoSession: FireSession = {
              id: sessionIdFromUrl,
              tableId: searchParams.get('tableId') || 'T-001',
              customerName: 'Demo Guest',
              flavor: 'Custom Mix',
              status: 'ACTIVE',
              currentStage: 'CUSTOMER',
              sessionDuration: 45 * 60,
              sessionType: 'FLAT',
              amount: 3000,
              assignedStaff: {},
              createdAt: now,
              updatedAt: now,
              coalStatus: 'active',
              refillStatus: 'none',
              notes: '',
              edgeCase: null
            };
            setSessionFromUrl(demoSession);
          }
        } catch (err: any) {
          // On any error (including AbortError), create mock session (graceful fallback)
          if (err.name !== 'AbortError') {
            console.error('[ControlPanel] Failed to fetch session from URL:', err);
          }
          
          const now = Date.now();
          const demoSession: FireSession = {
            id: sessionIdFromUrl,
            tableId: searchParams.get('tableId') || 'T-001',
            customerName: 'Demo Guest',
            flavor: 'Custom Mix',
            status: 'ACTIVE',
            currentStage: 'CUSTOMER',
            sessionDuration: 45 * 60,
            sessionType: 'FLAT',
            amount: 3000,
            assignedStaff: {},
            createdAt: now,
            updatedAt: now,
            coalStatus: 'active',
            refillStatus: 'none',
            notes: '',
            edgeCase: null
          };
          setSessionFromUrl(demoSession);
        } finally {
          setLoadingFromUrl(false);
          setHasCheckedSession(true); // Mark that we've completed the check
        }
      };
      fetchSession();
  }, [sessionIdFromUrl, activeSession, sessionFromUrl]); // Removed loadingFromUrl and searchParams from deps to prevent re-runs
  
  // Load active session on mount (if no sessionId in URL)
  // Only refresh if we don't have a session from URL and we have table/customer info
  useEffect(() => {
    // Don't refresh if we have a session from URL or if we already have an active session
    if (sessionIdFromUrl || activeSession || sessionFromUrl) {
      if (!sessionIdFromUrl && !activeSession && !sessionFromUrl) {
        // If we've checked and have no session, mark as checked
        setHasCheckedSession(true);
      }
      return;
    }
    
    // Only refresh if we have table/customer info and we're not already loading
    if ((tableId || customerPhone) && !loading) {
      refreshSessions().then(() => {
        setHasCheckedSession(true);
      }).catch(() => {
        setHasCheckedSession(true);
      });
    } else {
      // No table/customer info and no sessionId - mark as checked
      setHasCheckedSession(true);
    }
  }, [sessionIdFromUrl, activeSession, sessionFromUrl, tableId, customerPhone, loading, refreshSessions]);
  
  // Use session from URL if available, otherwise use context session
  const currentSession = sessionFromUrl || activeSession;

  // Auto-open action from URL parameter (e.g., ?action=extend)
  useEffect(() => {
    const actionParam = searchParams.get('action');
    if (actionParam && ['extend', 'refill', 'newbowl', 'closeout'].includes(actionParam)) {
      setActionType(actionParam as 'extend' | 'refill' | 'newbowl' | 'closeout');
    }
  }, [searchParams]);

  // Track control panel view in demo mode (only once)
  useEffect(() => {
    const isDemo = searchParams.get('demo') === 'true' || searchParams.get('mode') === 'demo';
    if (isDemo && currentSession && typeof window !== 'undefined' && !hasTrackedViewRef.current) {
      hasTrackedViewRef.current = true;
      // Track that operator viewed the control panel
      fetch('/api/demo-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'demo_completed',
          data: {
            source: 'guest_control_panel',
            operatorType: searchParams.get('operatorType') || 'mobile',
            sessionId: currentSession.id,
            completedAt: new Date().toISOString(),
            demoType: 'control_panel_view',
            event: 'control_panel_viewed'
          }
        })
      }).catch(err => {
        console.warn('[Demo Tracking] Failed to track control panel view:', err);
      });
    }
  }, [currentSession, searchParams]);

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
      
      // Use guest build proxy route to avoid CORS issues
      const response = await fetch(`/api/sessions/${currentSession.id}/extend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          extensionMinutes: minutes,
          pricingModel: currentSession.sessionType === 'TIME_BASED' ? 'time-based' : 'flat',
          paymentConfirmed: true, // treat as internal/demo to bypass Stripe
          userRole: 'ADMIN'
        })
      });
      
      if (!response.ok) {
        // For demo/offline: if validation fails or session missing, fall back to local success
        if (response.status === 400 || response.status === 404) {
          setSuccess(`Session extended by ${selectedOption.duration}! (Demo mode)`);
          setActionType(null);
          setTimeout(() => setSuccess(null), 3000);
          setIsProcessing(false);
          return;
        }
        
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
      // Use guest build proxy route to avoid CORS issues
      const response = await fetch(`/api/sessions/${currentSession.id}/refill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userRole: 'GUEST',
          operatorId: `guest-${currentSession.id}`
        })
      });
      
      const data = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        // Refill already requested: idempotent, treat as success
        if (data.details === 'Refill already requested' || data.error === 'Refill already requested') {
          setSuccess('Refill already requested — BOH is on it.');
          setActionType(null);
          await refreshSessions();
          setTimeout(() => setSuccess(null), 3000);
          return;
        }
        // Demo/offline fallback: treat as success for 400/404
        if (response.status === 400 || response.status === 404) {
          setSuccess('Coal refill requested! (Demo mode)');
          setActionType(null);
          setTimeout(() => setSuccess(null), 3000);
          setIsProcessing(false);
          return;
        }
        throw new Error(data.error || data.details || 'Failed to request refill');
      }
      
      if (data.success) {
        setSuccess('Coal refill requested! Staff will bring fresh coals shortly.');
        setActionType(null);
        await refreshSessions();
        setTimeout(() => setSuccess(null), 3000);
      } else if (data.details === 'Refill already requested' || data.error === 'Refill already requested') {
        setSuccess('Refill already requested — BOH is on it.');
        setActionType(null);
        await refreshSessions();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(data.error || data.details || 'Failed to request refill');
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
      // Use guest build proxy route to avoid CORS issues
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
        // Demo/offline fallback: treat as success for 400/404
        if (response.status === 400 || response.status === 404) {
          setSuccess('New bowl requested! (Demo mode)');
          setActionType(null);
          setTimeout(() => setSuccess(null), 3000);
          setIsProcessing(false);
          return;
        }
        
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
      // Use guest build proxy route to avoid CORS issues
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
        // Demo/offline fallback: treat as success for 400/404
        if (response.status === 400 || response.status === 404) {
          setSuccess('Session closed! (Demo mode)');
          setActionType(null);
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
          setIsProcessing(false);
          return;
        }
        
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

  // Show loading only if we're actively loading AND haven't completed the check yet
  if ((loading || loadingFromUrl) && !hasCheckedSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading session...</p>
        </div>
      </div>
    );
  }

  // Only show "No Active Session" after we've completed checking (prevents flashing)
  if (!currentSession && hasCheckedSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
        <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <Card className="p-8">
            <div className="text-center">
              <Clock className="w-16 h-16 text-zinc-500 mx-auto mb-4 opacity-50" />
              <h2 className="text-2xl font-bold text-white mb-2">No Active Session</h2>
              <p className="text-zinc-400 mb-6">
                You don't have an active session. Start a new session to use these controls.
              </p>
              <Button
                variant="primary"
                onClick={() => window.location.href = '/'}
                className="w-full transition-all hover:scale-105"
              >
                Start New Session
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // If we haven't checked yet and don't have a session, show a subtle loading state
  if (!currentSession && !hasCheckedSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">
            <Clock className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-500 text-sm">Checking for active session...</p>
          </div>
        </div>
      </div>
    );
  }

  const selectedOption = extensionOptions.find(opt => opt.id === selectedExtension);

  // Check if in demo mode
  const isDemo = searchParams.get('demo') === 'true' || searchParams.get('mode') === 'demo';
  const operatorType = searchParams.get('operatorType') || 'mobile'; // Default to mobile for demo

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Demo Mode Conversion CTA Banner */}
        {isDemo && (
          <Card className="p-6 mb-6 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border-teal-500/50">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-teal-400" />
                  <h3 className="text-xl font-bold text-white">
                    Love this guest experience?
                  </h3>
                </div>
                <p className="text-zinc-300 mb-2">
                  Get Hookah+ for your {operatorType === 'mobile' ? 'mobile hookah business' : 'hookah lounge'}. 
                  {operatorType === 'mobile' && ' No fixed location needed.'}
                </p>
                <div className="flex flex-wrap gap-2 text-sm text-zinc-400">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-teal-400" />
                    Works anywhere
                  </span>
                  {operatorType === 'mobile' && (
                    <>
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-teal-400" />
                        QR codes for events
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-teal-400" />
                        Mobile-friendly dashboard
                      </span>
                    </>
                  )}
                </div>
              </div>
              <Button
                variant="primary"
                size="lg"
                className="whitespace-nowrap"
                onClick={() => {
                  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hookahplus.net';
                  window.open(`${siteUrl}/onboarding?source=demo&type=${operatorType}`, '_blank');
                }}
                leftIcon={<ArrowRight className="w-5 h-5" />}
              >
                Start Free Trial
              </Button>
            </div>
          </Card>
        )}

        {/* Mobile Operator Messaging Banner */}
        {isDemo && operatorType === 'mobile' && (
          <Card className="p-4 mb-6 bg-blue-500/10 border-blue-500/30">
            <div className="flex items-start gap-3">
              <Smartphone className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-300 mb-1">Perfect for Mobile Operators</h4>
                <p className="text-sm text-zinc-300">
                  This guest experience works seamlessly for mobile hookah businesses. Your customers can order from any location, 
                  track their hookah in real-time, and manage their session—all from their phone.
                </p>
              </div>
            </div>
          </Card>
        )}

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
                {currentSession?.status ? (STATUS_TO_TRACKER_STAGE[currentSession.status as keyof typeof STATUS_TO_TRACKER_STAGE] || 'Active') : 'Active'}
              </Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-zinc-300">
            <div>
              <div className="text-zinc-400">Table</div>
              <div className="font-medium text-white">{currentSession?.tableId || 'N/A'}</div>
            </div>
            <div>
              <div className="text-zinc-400">Flavor</div>
              <div className="font-medium text-white">{currentSession?.flavor || 'Custom Mix'}</div>
            </div>
            <div>
              <div className="text-zinc-400">Duration</div>
              <div className="font-medium text-white">{currentSession?.sessionDuration ? `${Math.round(currentSession.sessionDuration / 60)} min` : 'N/A'}</div>
            </div>
            <div>
              <div className="text-zinc-400">Status</div>
              <div className="font-medium text-white">{currentSession?.status || 'Active'}</div>
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

        {/* Operator Dashboard Preview (Demo Mode Only) */}
        {isDemo && (
          <Card className="p-6 mt-8 bg-zinc-900/50 border-zinc-700">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-teal-400" />
                  See the Operator Dashboard
                </h3>
                <p className="text-zinc-400 text-sm mb-3">
                  Experience the full power of Hookah+ from the operator's perspective. 
                  See how easy it is to manage sessions, track orders, and delight customers.
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-zinc-500">
                  <span>• Real-time session tracking</span>
                  <span>• Staff management</span>
                  <span>• Analytics dashboard</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="lg"
                className="whitespace-nowrap"
                onClick={() => {
                  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.hookahplus.net';
                  window.open(`${appUrl}/fire-session-dashboard?demo=true&mode=demo`, '_blank');
                }}
                leftIcon={<ExternalLink className="w-4 h-4" />}
              >
                View Dashboard
              </Button>
            </div>
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
