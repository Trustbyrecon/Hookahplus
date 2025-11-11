'use client';

import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  ChefHat, 
  Users, 
  Package, 
  CreditCard, 
  Award,
  ArrowRight,
  CheckCircle2,
  Play,
  Loader2
} from 'lucide-react';

interface FlowStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  action?: () => Promise<void>; // Optional action handler
}

const flowSteps: FlowStep[] = [
  {
    id: 'qr',
    title: 'QR Scan',
    description: 'Customer scans QR code to start session',
    icon: <QrCode className="w-8 h-8" />,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'prep',
    title: 'Prep',
    description: 'BOH prepares hookah with selected flavors',
    icon: <ChefHat className="w-8 h-8" />,
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'foh',
    title: 'FOH Handoff',
    description: 'Front of house receives prepared session',
    icon: <Users className="w-8 h-8" />,
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'delivery',
    title: 'Delivery',
    description: 'Session delivered to customer table',
    icon: <Package className="w-8 h-8" />,
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'checkout',
    title: 'Checkout',
    description: 'Payment processed seamlessly',
    icon: <CreditCard className="w-8 h-8" />,
    color: 'from-teal-500 to-cyan-500'
  },
  {
    id: 'loyalty',
    title: 'Loyalty',
    description: 'Points and badges awarded',
    icon: <Award className="w-8 h-8" />,
    color: 'from-yellow-500 to-amber-500'
  }
];

export default function ReflexFlowVisualization() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isPlaying || isProcessing) return;

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % flowSteps.length);
    }, 2500); // Change step every 2.5 seconds

    return () => clearInterval(interval);
  }, [isPlaying, isProcessing]);

  const handleStepClick = async (index: number) => {
    setActiveStep(index);
    setIsPlaying(false);
    
    // If clicking on QR step, create a test session
    if (index === 0 && !sessionId) {
      await handleCreateSession();
    }
  };

  const handleCreateSession = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // Create a test session via the app build API
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
      
      const response = await fetch(`${appUrl}/api/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableId: `T-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
          customerName: 'Demo Customer',
          customerPhone: '+1234567890',
          flavor: 'Demo Flavor Mix',
          amount: 3000, // $30.00 in cents
          source: 'WALK_IN',
          loungeId: 'demo-lounge',
          sessionDuration: 45 * 60, // 45 minutes
        }),
      });

      // Parse response safely
      let responseData;
      const responseText = await response.text();
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error('[Flow] Failed to parse response:', parseError);
        throw new Error(`Invalid response from server: ${response.status} ${response.statusText}`);
      }

      if (!response.ok) {
        console.error('[Flow] API Error:', {
          status: response.status,
          statusText: response.statusText,
          data: responseData
        });
        throw new Error(responseData.error || responseData.details || `Failed to create session: ${response.status}`);
      }

      if (responseData.success && responseData.session) {
        setSessionId(responseData.session.id);
        // Auto-advance through steps
        setIsPlaying(true);
      } else {
        throw new Error(responseData.error || 'Session creation failed');
      }
    } catch (err) {
      console.error('[Flow] Error creating session:', err);
      setError(err instanceof Error ? err.message : 'Failed to create session');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="w-full">
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Flow Steps */}
      <div className="relative mb-8">
        {/* Connection Lines */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-zinc-700/50 -translate-y-1/2 hidden md:block" 
             style={{ zIndex: 0 }}>
          <div 
            className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-1000 ease-in-out"
            style={{ width: `${(activeStep / (flowSteps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 relative" style={{ zIndex: 1 }}>
          {flowSteps.map((step, index) => {
            const isActive = index === activeStep;
            const isCompleted = index < activeStep;
            const isUpcoming = index > activeStep;

            return (
              <div
                key={step.id}
                className="relative"
                onClick={() => handleStepClick(index)}
              >
                {/* Step Card */}
                <div
                  className={`
                    relative p-4 md:p-6 rounded-xl border-2 transition-all duration-500 cursor-pointer
                    transform hover:scale-105
                    ${isProcessing && index === 0 ? 'opacity-50 cursor-wait' : ''}
                    ${isActive 
                      ? `border-teal-500 bg-gradient-to-br ${step.color} shadow-lg shadow-teal-500/50 scale-105` 
                      : isCompleted
                      ? 'border-teal-500/50 bg-zinc-900/50 opacity-75'
                      : 'border-zinc-700 bg-zinc-900/30 opacity-50'
                    }
                  `}
                >
                  {/* Loading Indicator */}
                  {isProcessing && index === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80 rounded-xl">
                      <Loader2 className="w-6 h-6 text-teal-400 animate-spin" />
                    </div>
                  )}

                  {/* Icon */}
                  <div className={`
                    w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 rounded-full flex items-center justify-center
                    transition-all duration-500
                    ${isActive 
                      ? 'bg-white/20 text-white scale-110' 
                      : isCompleted
                      ? 'bg-teal-500/20 text-teal-400'
                      : 'bg-zinc-700/50 text-zinc-500'
                    }
                  `}>
                    {step.icon}
                  </div>

                  {/* Title */}
                  <h3 className={`
                    text-sm md:text-base font-semibold text-center mb-1
                    transition-colors duration-300
                    ${isActive ? 'text-white' : isCompleted ? 'text-teal-400' : 'text-zinc-400'}
                  `}>
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className={`
                    text-xs md:text-sm text-center
                    transition-colors duration-300
                    ${isActive ? 'text-white/90' : isCompleted ? 'text-zinc-400' : 'text-zinc-500'}
                  `}>
                    {step.description}
                  </p>

                  {/* Active Indicator */}
                  {isActive && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center animate-pulse">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                  )}

                  {/* Completed Checkmark */}
                  {isCompleted && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                  )}

                  {/* Arrow (hidden on last step) */}
                  {index < flowSteps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 md:-right-6 transform -translate-y-1/2">
                      <ArrowRight className={`
                        w-4 h-4 md:w-6 md:h-6 transition-colors duration-300
                        ${isActive || isCompleted ? 'text-teal-500' : 'text-zinc-700'}
                      `} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500 transition-all duration-1000 ease-in-out"
            style={{ width: `${((activeStep + 1) / flowSteps.length) * 100}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-zinc-400">
            Step {activeStep + 1} of {flowSteps.length}
            {sessionId && <span className="ml-2 text-teal-400">• Session: {sessionId.substring(0, 8)}...</span>}
          </span>
          <button
            onClick={handlePlayPause}
            disabled={isProcessing}
            className="text-xs text-teal-400 hover:text-teal-300 transition-colors disabled:opacity-50"
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
        </div>
      </div>

      {/* Active Step Details */}
      <div className={`
        p-6 rounded-xl border border-zinc-700 bg-gradient-to-br from-zinc-900/50 to-zinc-800/30
        transition-all duration-500
      `}>
        <div className="flex items-start gap-4">
          <div className={`
            w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0
            bg-gradient-to-br ${flowSteps[activeStep].color}
          `}>
            {flowSteps[activeStep].icon}
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-white mb-2">
              {flowSteps[activeStep].title}
            </h4>
            <p className="text-zinc-300 text-sm leading-relaxed">
              {flowSteps[activeStep].description}
            </p>
            {activeStep === 0 && !sessionId && (
              <button
                data-demo-session-button
                onClick={handleCreateSession}
                disabled={isProcessing}
                className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating Session...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Start Demo Session
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
