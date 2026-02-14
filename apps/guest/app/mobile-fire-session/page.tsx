'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MobileFireSessionDashboard from '../../components/customer/MobileFireSessionDashboard';
import MobileTouchHandler from '../../components/customer/MobileTouchHandler';
import MobilePerformanceOptimizer from '../../components/customer/MobilePerformanceOptimizer';
import { ArrowLeft, Home, RefreshCw } from 'lucide-react';

/**
 * Mobile Fire Session Dashboard Page
 * ---------------------------------
 * Dedicated mobile page for Fire Session Dashboard with:
 * - Full-screen mobile experience
 * - Touch gesture support
 * - Performance optimizations
 * - Real-time session tracking
 */

interface SessionData {
  sessionId: string;
  tableId: string;
  startTime: Date;
  duration: number;
  timeRemaining: number;
  totalAmount: number;
  flavors: string[];
  status: 'active' | 'paused' | 'completed' | 'expired';
  progress: number;
}

export default function MobileFireSessionPage() {
  const router = useRouter();
  const [session, setSession] = useState<SessionData>({
    sessionId: 'session-001',
    tableId: 'T-001',
    startTime: new Date(),
    duration: 60,
    timeRemaining: 60,
    totalAmount: 3000,
    flavors: ['mint', 'mango'],
    status: 'active',
    progress: 0
  });

  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle session updates
  const handleSessionUpdate = (updatedSession: SessionData) => {
    setSession(updatedSession);
  };

  // Handle session end
  const handleSessionEnd = () => {
    router.push('/');
  };

  // Handle swipe gestures
  const handleSwipe = (direction: 'left' | 'right' | 'up' | 'down', distance: number) => {
    console.log(`Swipe ${direction} detected with distance ${distance}`);
    
    // Navigate based on swipe direction
    switch (direction) {
      case 'right':
        router.back();
        break;
      case 'left':
        // Could navigate to next session or settings
        break;
      case 'up':
        // Could show session details
        break;
      case 'down':
        // Could hide session details
        break;
    }
  };

  // Handle tap gestures
  const handleTap = (position: { x: number; y: number }) => {
    console.log(`Tap detected at ${position.x}, ${position.y}`);
  };

  // Handle double tap
  const handleDoubleTap = (position: { x: number; y: number }) => {
    console.log(`Double tap detected at ${position.x}, ${position.y}`);
    // Could toggle fullscreen or show additional controls
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-700">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors min-h-[44px] min-w-[44px]"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">🔥</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold">Fire Session</h1>
              <p className="text-xs text-zinc-400">Table {session.tableId}</p>
            </div>
          </div>
          
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors min-h-[44px] min-w-[44px]"
          >
            <Home className="w-5 h-5" />
            <span className="hidden sm:inline">Home</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        <MobilePerformanceOptimizer 
          enableLazyLoading={true}
          enablePerformanceTracking={true}
          enableMemoryManagement={true}
          enableNetworkOptimization={true}
          enableBatteryMonitoring={true}
        >
          <MobileTouchHandler
            onSwipe={handleSwipe}
            onTap={handleTap}
            onDoubleTap={handleDoubleTap}
            swipeThreshold={50}
            enableHaptics={true}
          >
            <MobileFireSessionDashboard
              sessionData={session}
              onSessionUpdate={handleSessionUpdate}
              onSessionEnd={handleSessionEnd}
              className="w-full"
            />
          </MobileTouchHandler>
        </MobilePerformanceOptimizer>
      </div>

      {/* Mobile Footer */}
      <div className="sticky bottom-0 z-50 bg-zinc-950/95 backdrop-blur-sm border-t border-zinc-700">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Live Session</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors min-h-[44px] min-w-[44px]"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
          
          <div className="text-xs text-zinc-400">
            Mobile Optimized
          </div>
        </div>
      </div>
    </div>
  );
}
