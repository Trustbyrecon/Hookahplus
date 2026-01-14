'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode,
  Clock,
  ChefHat,
  Flame,
  CheckCircle,
  AlertCircle,
  MapPin,
  Users,
  Zap,
  Coffee,
  Sparkles,
  Timer,
  Bell,
  Eye,
  Heart
} from 'lucide-react';
import { cn } from '../utils/cn';

interface TrackingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'active' | 'completed' | 'delayed';
  estimatedTime?: string;
  actualTime?: string;
  details?: string[];
  color: string;
  bgColor: string;
}

interface HookahTrackerProps {
  sessionId: string;
  loungeId?: string;
  tableId: string;
  onComplete?: () => void;
}

// Map session status to tracker step index
const getStepFromStatus = (status: string): number => {
  const statusMap: Record<string, number> = {
    'NEW': 0,
    'PAID_CONFIRMED': 0,
    'PREP_IN_PROGRESS': 1,
    'HEAT_UP': 2,
    'READY_FOR_DELIVERY': 2,
    'OUT_FOR_DELIVERY': 3,
    'DELIVERED': 3,
    'ACTIVE': 3,
    'CLOSED': 3
  };
  return statusMap[status] ?? 0;
};

export const HookahTracker: React.FC<HookahTrackerProps> = ({
  sessionId,
  loungeId,
  tableId,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [estimatedTotalTime, setEstimatedTotalTime] = useState('15-20 minutes');
  const [actualStartTime, setActualStartTime] = useState<Date | null>(null);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [sessionData, setSessionData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [useDemo, setUseDemo] = useState(false);

  const trackingSteps: TrackingStep[] = [
    {
      id: 'order-received',
      title: 'Order Received',
      description: 'Your hookah order has been confirmed',
      icon: <QrCode className="w-6 h-6" />,
      status: 'completed',
      actualTime: 'Just now',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20'
    },
    {
      id: 'preparation',
      title: 'Preparing Your Hookah',
      description: 'Our staff is selecting the perfect coals and setting up your flavors',
      icon: <ChefHat className="w-6 h-6" />,
      status: 'active',
      estimatedTime: '3-5 minutes',
      details: [
        'Selecting premium coals',
        'Preparing flavor mixture',
        'Setting up hookah base'
      ],
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20'
    },
    {
      id: 'heating',
      title: 'Heating Up',
      description: 'Coals are heating up to the perfect temperature',
      icon: <Flame className="w-6 h-6" />,
      status: 'pending',
      estimatedTime: '5-7 minutes',
      details: [
        'Coals reaching optimal temperature',
        'Testing heat distribution',
        'Ensuring consistent burn'
      ],
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20'
    },
    {
      id: 'ready',
      title: 'Ready for You!',
      description: 'Your hookah is ready and being brought to your table',
      icon: <CheckCircle className="w-6 h-6" />,
      status: 'pending',
      estimatedTime: '2-3 minutes',
      details: [
        'Quality check completed',
        'Being delivered to your table',
        'Staff will assist with setup'
      ],
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20'
    }
  ];

  // Fetch real session data from app build
  useEffect(() => {
    const fetchSessionData = async () => {
      // Check for demo mode from URL params (client-side only)
      if (typeof window === 'undefined') {
        return;
      }
      
      const urlParams = new URLSearchParams(window.location.search);
      const isDemoMode = urlParams.get('demo') === 'true' || 
                        urlParams.get('mode') === 'demo' ||
                        sessionId?.startsWith('demo_') ||
                        sessionId === 'session_demo';
      const isAccelerated = urlParams.get('accelerated') === 'true';

      if (!sessionId || isDemoMode) {
        console.log('[HookahTracker] Demo mode detected, using demo data', isAccelerated ? '(accelerated 2-3 min trial)' : '(quick 18s demo)');
        setUseDemo(true);
        setIsLoading(false);
        // Store accelerated flag in component state for use in demo simulation
        if (isAccelerated) {
          (window as any).__hookahTrackerAccelerated = true;
        }
        return;
      }

      try {
        // Import retry utility dynamically
        const { fetchWithRetry } = await import('../lib/apiRetry');
        
        // Request notification permission on first load (non-blocking)
        if (typeof window !== 'undefined' && !window.localStorage.getItem('notification-permission-requested')) {
          import('../lib/notifications').then(({ notificationManager }) => {
            notificationManager.requestPermission().catch(err => {
              console.log('[HookahTracker] Notification permission request failed:', err);
            });
          });
          window.localStorage.setItem('notification-permission-requested', 'true');
        }

        // Try session status API first (better format for tracker) with retry logic
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
        let response = await fetchWithRetry(
          `${appUrl}/api/sessions/status?sessionId=${sessionId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          },
          {
            maxRetries: 3,
            initialDelay: 1000,
            onRetry: (attempt, error) => {
              console.log(`[HookahTracker] Retry attempt ${attempt} after error:`, error);
            },
          }
        );

        // If status API fails, try the main sessions endpoint
        if (!response.ok) {
          console.log('[HookahTracker] Status API failed, trying main sessions endpoint');
          response = await fetchWithRetry(
            `${appUrl}/api/sessions/${sessionId}`,
            {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
            },
            {
              maxRetries: 2,
              initialDelay: 1000,
            }
          );
        }

        if (response.ok) {
          const data = await response.json();
          
          // Handle both response formats
          const session = data.session || data;
          const sessionIdFromResponse = session.id || data.id;
          
          if (sessionIdFromResponse) {
            setSessionData(session);
            setUseDemo(false);
            
            // Map session status to tracker step
            const status = session.status || data.status || session.state || data.state || 'NEW';
            const step = getStepFromStatus(status);
            setCurrentStep(step);
            
            // Set actual start time from session
            const startTime = session.startedAt || session.createdAt || data.startedAt || data.createdAt;
            if (startTime) {
              setActualStartTime(new Date(startTime));
            } else {
              setActualStartTime(new Date());
            }
            
            // Calculate estimated time based on session duration
            const duration = session.sessionDuration || session.duration || data.sessionDuration || data.duration;
            if (duration) {
              const minutes = Math.floor(duration / 60);
              setEstimatedTotalTime(`${minutes}-${minutes + 5} minutes`);
            } else {
              setEstimatedTotalTime('15-20 minutes');
            }
            
            // Add notification based on current status
            if (status === 'PREP_IN_PROGRESS' || status === 'HEAT_UP') {
              addNotification('Your hookah is being prepared!');
              // Send browser notification (non-blocking)
              if (typeof window !== 'undefined') {
                import('../lib/notifications').then(({ notificationManager }) => {
                  notificationManager.notifySessionStatusChange(sessionId, status).catch(err => {
                    console.log('[HookahTracker] Notification failed:', err);
                  });
                });
              }
            } else if (status === 'READY_FOR_DELIVERY' || status === 'OUT_FOR_DELIVERY') {
              addNotification('Your hookah is ready and on its way!');
              if (typeof window !== 'undefined') {
                import('../lib/notifications').then(({ notificationManager }) => {
                  notificationManager.notifySessionStatusChange(sessionId, status).catch(err => {
                    console.log('[HookahTracker] Notification failed:', err);
                  });
                });
              }
            } else if (status === 'DELIVERED' || status === 'ACTIVE') {
              addNotification('Enjoy your hookah session!');
              if (typeof window !== 'undefined') {
                import('../lib/notifications').then(({ notificationManager }) => {
                  notificationManager.notifySessionStatusChange(sessionId, status).catch(err => {
                    console.log('[HookahTracker] Notification failed:', err);
                  });
                });
              }
            }
            
            // Check for time warnings if session is active
            if (status === 'ACTIVE' && session.timeRemaining !== undefined) {
              const minutesRemaining = Math.floor(session.timeRemaining / 60);
              if (minutesRemaining <= 5 && minutesRemaining > 0) {
                if (typeof window !== 'undefined') {
                  import('../lib/notifications').then(({ notificationManager }) => {
                    notificationManager.notifyTimeWarning(sessionId, minutesRemaining).catch(err => {
                      console.log('[HookahTracker] Time warning notification failed:', err);
                    });
                  });
                }
              }
            }
          } else {
            // No valid session data, use demo
            console.warn('[HookahTracker] No valid session data in response, using demo');
            setUseDemo(true);
          }
        } else {
          // API error, use demo
          const errorText = await response.text();
          console.warn('[HookahTracker] Failed to fetch session, using demo:', response.status, errorText);
          setUseDemo(true);
        }
      } catch (error) {
        console.error('[HookahTracker] Error fetching session:', error);
        setUseDemo(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionData();

    // Poll for updates every 5 seconds if we have real data
    let pollInterval: NodeJS.Timeout | null = null;
    if (sessionId && sessionId !== 'session_demo' && !sessionId.startsWith('demo_') && !useDemo) {
      pollInterval = setInterval(fetchSessionData, 5000);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [sessionId]);

  // Demo mode: Simulate the tracking progression
  useEffect(() => {
    if (!useDemo || isLoading) return;

    const startTime = new Date();
    setActualStartTime(startTime);

    // Check if accelerated mode is enabled (2-3 minute trial)
    const isAccelerated = (window as any).__hookahTrackerAccelerated === true;
    
    // Accelerated mode: 4 seconds per stage (16s total)
    // Quick mode: 18 second fast demo
    const timings = isAccelerated ? {
      step1: 4000,    // 4s - Order received → Prep in progress
      step2: 8000,    // 8s - Prep → Heat up (4s after step1)
      step3: 12000,   // 12s - Heat up → Ready for delivery (4s after step2)
      complete: 16000 // 16s - Ready → Delivered (4s after step3) = 16 seconds total
    } : {
      step1: 3000,    // 3s - Quick demo
      step2: 8000,    // 8s
      step3: 15000,   // 15s
      complete: 18000 // 18s
    };

    if (isAccelerated) {
      setEstimatedTotalTime('16 seconds');
      addNotification('🎭 Accelerated Demo Mode - Experience the full guest journey in 16 seconds!');
    }

    // Simulate progression through steps
    const timeouts = [
      setTimeout(() => {
        setCurrentStep(1);
        addNotification('Your hookah is being prepared!');
      }, timings.step1),
      
      setTimeout(() => {
        setCurrentStep(2);
        addNotification('Coals are heating up - almost ready!');
      }, timings.step2),
      
      setTimeout(() => {
        setCurrentStep(3);
        addNotification('Your hookah is ready and on its way!');
      }, timings.step3),
      
      setTimeout(() => {
        setIsComplete(true);
        addNotification('Enjoy your hookah session!');
        if (isAccelerated) {
          addNotification('✨ Demo complete! This is what your customers experience.');
        }
        onComplete?.();
      }, timings.complete)
    ];

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [useDemo, isLoading, onComplete]);

  const addNotification = (message: string) => {
    setNotifications(prev => [message, ...prev.slice(0, 4)]);
    
    // Track notification event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'hookah_tracker_notification', {
        event_category: 'tracking',
        event_label: message,
        session_id: sessionId
      });
    }
  };

  const getStepStatus = (stepIndex: number): TrackingStep['status'] => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'active';
    return 'pending';
  };

  // Update tracking steps based on real session data
  const getTrackingSteps = (): TrackingStep[] => {
    const baseSteps = [...trackingSteps];
    
    if (sessionData && !useDemo) {
      // Update step statuses based on real session data
      const sessionStatus = sessionData.status || sessionData.state || 'NEW';
      const activeStep = getStepFromStatus(sessionStatus);
      
      baseSteps.forEach((step, index) => {
        if (index < activeStep) {
          step.status = 'completed';
        } else if (index === activeStep) {
          step.status = 'active';
        } else {
          step.status = 'pending';
        }
      });
      
      // Update descriptions based on real data
      if (sessionData.flavor || sessionData.flavorMix) {
        const flavor = sessionData.flavor || sessionData.flavorMix;
        baseSteps[1].description = `Preparing your ${flavor} hookah`;
      }
    }
    
    return baseSteps;
  };

  const getElapsedTime = () => {
    if (!actualStartTime) return '0:00';
    const elapsed = Math.floor((Date.now() - actualStartTime.getTime()) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const isAccelerated = (window as any).__hookahTrackerAccelerated === true;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white p-4">
      <div className="max-w-2xl mx-auto">
        {/* Accelerated Demo Banner */}
        {useDemo && isAccelerated && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-teal-500/20 to-blue-500/20 border border-teal-500/30 rounded-lg p-3 mb-6 text-center"
          >
            <p className="text-sm font-medium text-teal-200 flex items-center justify-center gap-2">
              <Zap className="w-4 h-4" />
              Accelerated Demo Mode — Full guest experience in 2-3 minutes
            </p>
          </motion.div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center space-x-3 mb-4"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold">Hookah Tracker</h1>
          </motion.div>
          
          <p className="text-zinc-400 mb-2">
            Track your hookah from order to table
          </p>
          
          <div className="flex items-center justify-center space-x-4 text-sm text-zinc-500">
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>Table {tableId}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Timer className="w-4 h-4" />
              <span>{getElapsedTime()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>Est. {estimatedTotalTime}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">Progress</span>
            <span className="text-sm text-zinc-400">
              {Math.round((currentStep / (trackingSteps.length - 1)) * 100)}%
            </span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-2">
            <motion.div
              className="h-2 bg-gradient-to-r from-orange-400 to-red-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / (trackingSteps.length - 1)) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Demo Mode Indicator */}
        {useDemo && !isLoading && (
          <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-center">
            <p className="text-sm text-yellow-200">
              📍 Demo Mode - Waiting for real session data
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg text-center">
            <p className="text-sm text-blue-200">Loading session data...</p>
          </div>
        )}

        {/* Tracking Steps */}
        <div className="space-y-4 mb-8">
          {getTrackingSteps().map((step, index) => {
            const status = getStepStatus(index);
            const isActive = status === 'active';
            const isCompleted = status === 'completed';
            
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'p-6 rounded-lg border transition-all duration-300',
                  isActive && 'border-orange-400/50 bg-orange-500/10',
                  isCompleted && 'border-green-400/50 bg-green-500/10',
                  !isActive && !isCompleted && 'border-zinc-700 bg-zinc-800/50'
                )}
              >
                <div className="flex items-start space-x-4">
                  <div className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300',
                    isActive && 'bg-orange-500/20 border-2 border-orange-400',
                    isCompleted && 'bg-green-500/20 border-2 border-green-400',
                    !isActive && !isCompleted && 'bg-zinc-700 border-2 border-zinc-600'
                  )}>
                    <motion.div
                      animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      {step.icon}
                    </motion.div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={cn(
                        'text-lg font-semibold',
                        isActive && 'text-orange-400',
                        isCompleted && 'text-green-400',
                        !isActive && !isCompleted && 'text-zinc-400'
                      )}>
                        {step.title}
                      </h3>
                      
                      <div className="flex items-center space-x-2">
                        {isActive && (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          >
                            <Zap className="w-4 h-4 text-orange-400" />
                          </motion.div>
                        )}
                        {isCompleted && (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        )}
                        {step.estimatedTime && !isCompleted && (
                          <span className="text-xs text-zinc-500">
                            {step.estimatedTime}
                          </span>
                        )}
                        {step.actualTime && isCompleted && (
                          <span className="text-xs text-green-400">
                            {step.actualTime}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-zinc-300 mb-3">{step.description}</p>
                    
                    {step.details && isActive && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-1"
                      >
                        {step.details.map((detail, detailIndex) => (
                          <motion.div
                            key={detailIndex}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: detailIndex * 0.2 }}
                            className="flex items-center space-x-2 text-sm text-zinc-400"
                          >
                            <div className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                            <span>{detail}</span>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Live Updates */}
        <div className="bg-zinc-800/50 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <Bell className="w-4 h-4 text-blue-400" />
            <h3 className="font-semibold">Live Updates</h3>
          </div>
          
          <div className="space-y-2 max-h-32 overflow-y-auto">
            <AnimatePresence>
              {notifications.map((notification, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center space-x-2 text-sm"
                >
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                  <span className="text-zinc-300">{notification}</span>
                  <span className="text-zinc-500 text-xs">
                    {new Date().toLocaleTimeString()}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Contact Staff & Session Controls - Show after session is active */}
        {(isComplete || (sessionData && (sessionData.status === 'ACTIVE' || sessionData.status === 'DELIVERED'))) && (
          <div className="space-y-4 mb-6">
            {/* Contact Staff */}
            <div className="bg-gradient-to-r from-zinc-800/50 to-zinc-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Need Help?</h4>
                    <p className="text-sm text-zinc-400">
                      Our staff is here to assist you
                    </p>
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                    // TODO: Implement contact staff API call
                    addNotification('Staff notification sent! Someone will be with you shortly.');
                    if (typeof window !== 'undefined' && window.gtag) {
                      window.gtag('event', 'contact_staff', {
                        event_category: 'session',
                        event_label: 'staff_request',
                        session_id: sessionId
                      });
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>Contact Staff</span>
                </button>
              </div>
            </div>

            {/* Session Action Controls */}
            <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-black border border-zinc-700 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Session Controls</h3>
                    <p className="text-sm text-zinc-400">Request service during your session</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Refresh Coals */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    addNotification('Coal refresh requested! Staff will bring fresh coals shortly.');
                    if (typeof window !== 'undefined' && window.gtag) {
                      window.gtag('event', 'session_action', {
                        event_category: 'session',
                        event_label: 'refresh_coals',
                        session_id: sessionId
                      });
                    }
                  }}
                  className="p-4 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Flame className="w-6 h-6 text-white" />
                    <div className="text-center">
                      <div className="text-sm font-semibold text-white">Refresh Coals</div>
                      <div className="text-xs text-white/80">Fresh heat</div>
                    </div>
                  </div>
                </motion.button>

                {/* Request New Bowl */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    addNotification('New bowl requested! Staff will prepare a fresh bowl for you.');
                    if (typeof window !== 'undefined' && window.gtag) {
                      window.gtag('event', 'session_action', {
                        event_category: 'session',
                        event_label: 'request_new_bowl',
                        session_id: sessionId
                      });
                    }
                  }}
                  className="p-4 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Coffee className="w-6 h-6 text-white" />
                    <div className="text-center">
                      <div className="text-sm font-semibold text-white">Request New Bowl</div>
                      <div className="text-xs text-white/80">Fresh flavor</div>
                    </div>
                  </div>
                </motion.button>
              </div>
            </div>
          </div>
        )}

        {/* Completion Message */}
        <AnimatePresence>
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900 border border-green-400/50 rounded-lg p-8 text-center max-w-md mx-4"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                  className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Heart className="w-8 h-8 text-green-400" />
                </motion.div>
                
                <h2 className="text-2xl font-bold text-green-400 mb-2">
                  Your Hookah is on the Way!
                </h2>
                <p className="text-zinc-300 mb-6">
                  Your hookah is being delivered to your table. 
                  Have a great session!
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => {
                      // Redirect to guest control panel with session info
                      const urlParams = new URLSearchParams(window.location.search);
                      const sessionIdParam = urlParams.get('sessionId') || '';
                      const loungeIdParam = urlParams.get('loungeId') || '';
                      const tableIdParam = urlParams.get('tableId') || '';
                      const isDemo = urlParams.get('demo') === 'true' || urlParams.get('mode') === 'demo';
                      const isAccelerated = urlParams.get('accelerated') === 'true';
                      
                      const controlPanelUrl = `/control-panel?sessionId=${sessionIdParam}&loungeId=${loungeIdParam}&tableId=${tableIdParam}${isDemo ? '&demo=true&mode=demo' : ''}${isAccelerated ? '&accelerated=true' : ''}`;
                      window.location.href = controlPanelUrl;
                    }}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                  >
                    Manage Session
                  </button>
                  <button
                    onClick={() => setIsComplete(false)}
                    className="bg-zinc-700 hover:bg-zinc-600 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                  >
                    Continue Tracking
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
