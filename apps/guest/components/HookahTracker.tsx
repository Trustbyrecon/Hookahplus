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
import { cn } from '@/utils/cn';

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
  loungeId: string;
  tableId: string;
  onComplete?: () => void;
}

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

  // Simulate the tracking progression
  useEffect(() => {
    const startTime = new Date();
    setActualStartTime(startTime);

    // Simulate progression through steps
    const timeouts = [
      setTimeout(() => {
        setCurrentStep(1);
        addNotification('Your hookah is being prepared!');
      }, 3000),
      
      setTimeout(() => {
        setCurrentStep(2);
        addNotification('Coals are heating up - almost ready!');
      }, 8000),
      
      setTimeout(() => {
        setCurrentStep(3);
        addNotification('Your hookah is ready and on its way!');
      }, 15000),
      
      setTimeout(() => {
        setIsComplete(true);
        addNotification('Enjoy your hookah session!');
        onComplete?.();
      }, 18000)
    ];

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [onComplete]);

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

  const getElapsedTime = () => {
    if (!actualStartTime) return '0:00';
    const elapsed = Math.floor((Date.now() - actualStartTime.getTime()) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white p-4">
      <div className="max-w-2xl mx-auto">
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

        {/* Tracking Steps */}
        <div className="space-y-4 mb-8">
          {trackingSteps.map((step, index) => {
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

        {/* Staff Contact */}
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
            
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>Contact Staff</span>
            </button>
          </div>
        </div>

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
                  Enjoy Your Hookah!
                </h2>
                <p className="text-zinc-300 mb-6">
                  Your hookah is ready and waiting at your table. 
                  Have a great session!
                </p>
                
                <button
                  onClick={() => setIsComplete(false)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Continue to Dashboard
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
