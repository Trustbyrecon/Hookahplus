'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';
import {
  Clock,
  ChefHat,
  Flame,
  CheckCircle,
  MapPin,
  Timer,
  Bell,
  Zap,
  Truck
} from 'lucide-react';

interface TrackingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'active' | 'completed';
  estimatedTime?: string;
  color: string;
  bgColor: string;
}

interface HookahTrackerDemoProps {
  sessionId?: string;
  tableId?: string;
  flavorMix?: string[];
  onComplete?: () => void;
}

export default function HookahTrackerDemo({ 
  sessionId = 'demo-session-1',
  tableId = 'T-005',
  flavorMix = ['Mango', 'Lemon'],
  onComplete
}: HookahTrackerDemoProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);

  const trackingSteps: TrackingStep[] = [
    {
      id: 'order-received',
      title: 'Order Received',
      description: `Your ${flavorMix.join(' + ')} hookah order has been confirmed`,
      icon: <CheckCircle className="w-6 h-6" />,
      status: 'completed',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20'
    },
    {
      id: 'preparation',
      title: 'Preparing Your Hookah',
      description: `Our staff is selecting premium coals and preparing your ${flavorMix.join(' + ')} mix`,
      icon: <ChefHat className="w-6 h-6" />,
      status: 'active',
      estimatedTime: '3-5 minutes',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20'
    },
    {
      id: 'heating',
      title: 'Heating Up',
      description: 'Coals are reaching the perfect temperature for optimal flavor',
      icon: <Flame className="w-6 h-6" />,
      status: 'pending',
      estimatedTime: '5-7 minutes',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20'
    },
    {
      id: 'ready',
      title: 'Ready for You!',
      description: 'Your hookah is ready and being delivered to your table',
      icon: <Truck className="w-6 h-6" />,
      status: 'pending',
      estimatedTime: '2-3 minutes',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20'
    }
  ];

  // Simulate progression through steps
  useEffect(() => {
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

  // Update elapsed time
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const addNotification = (message: string) => {
    setNotifications(prev => [message, ...prev.slice(0, 4)]);
  };

  const getStepStatus = (stepIndex: number): TrackingStep['status'] => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'active';
    return 'pending';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            Live Hookah Tracker
          </h3>
          <p className="text-sm text-zinc-400">See your order progress in real-time</p>
        </div>
        <div className="flex items-center gap-4 text-sm text-zinc-400">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{tableId}</span>
          </div>
          <div className="flex items-center gap-1">
            <Timer className="w-4 h-4" />
            <span>{formatTime(elapsedTime)}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-zinc-400">Progress</span>
          <span className="text-xs text-zinc-400">
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
      <div className="space-y-3 mb-6">
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
              className={`p-4 rounded-lg border transition-all duration-300 ${
                isActive ? 'border-orange-400/50 bg-orange-500/10' :
                isCompleted ? 'border-green-400/50 bg-green-500/10' :
                'border-zinc-700 bg-zinc-800/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isActive ? 'bg-orange-500/20 border-2 border-orange-400' :
                  isCompleted ? 'bg-green-500/20 border-2 border-green-400' :
                  'bg-zinc-700 border-2 border-zinc-600'
                } ${step.color}`}>
                  {step.icon}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`text-sm font-semibold ${
                      isActive ? 'text-orange-400' :
                      isCompleted ? 'text-green-400' :
                      'text-zinc-400'
                    }`}>
                      {step.title}
                    </h4>
                    
                    <div className="flex items-center gap-2">
                      {isActive && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          <Zap className="w-3 h-3 text-orange-400" />
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
                    </div>
                  </div>
                  
                  <p className="text-xs text-zinc-300">{step.description}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Live Updates */}
      {notifications.length > 0 && (
        <div className="bg-zinc-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-4 h-4 text-blue-400" />
            <h4 className="text-xs font-semibold text-zinc-300">Live Updates</h4>
          </div>
          
          <div className="space-y-1 max-h-20 overflow-y-auto">
            <AnimatePresence>
              {notifications.map((notification, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 text-xs"
                >
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                  <span className="text-zinc-300">{notification}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {isComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-center"
        >
          <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-green-400">Session Ready!</p>
          <p className="text-xs text-zinc-400 mt-1">Your hookah is at your table. Enjoy!</p>
        </motion.div>
      )}
    </div>
  );
}

