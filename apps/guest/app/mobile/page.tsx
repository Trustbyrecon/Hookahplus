'use client';

import React, { useState, useEffect } from 'react';
import MobileGuestPortal from '../../components/guest/MobileGuestPortal';
import MobilePerformanceOptimizer from '../../components/guest/MobilePerformanceOptimizer';
import MobileTouchHandler from '../../components/guest/MobileTouchHandler';
import { useMobilePerformance } from '../../components/guest/MobilePerformanceOptimizer';

export default function MobileGuestPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { optimizeForMobile, isOptimized } = useMobilePerformance();

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(mobile || isSmallScreen);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Optimize for mobile
    if (isMobile && !isOptimized) {
      optimizeForMobile();
    }

    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000);

    return () => window.removeEventListener('resize', checkMobile);
  }, [isMobile, isOptimized, optimizeForMobile]);

  // Show loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-xl">H+</span>
          </div>
          <h2 className="text-xl font-bold mb-2">Hookah+ Guest Portal</h2>
          <p className="text-zinc-400">Optimizing for mobile experience...</p>
          <div className="mt-4 w-48 h-1 bg-zinc-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // Mobile-optimized layout
  return (
    <MobilePerformanceOptimizer enableOptimizations={true}>
      <MobileTouchHandler
        onSwipeUp={() => console.log('Swipe up detected')}
        onSwipeDown={() => console.log('Swipe down detected')}
        onSwipeLeft={() => console.log('Swipe left detected')}
        onSwipeRight={() => console.log('Swipe right detected')}
        onTap={() => console.log('Tap detected')}
        onLongPress={() => console.log('Long press detected')}
        swipeThreshold={50}
        longPressDelay={500}
      >
        <MobileGuestPortal />
      </MobileTouchHandler>
    </MobilePerformanceOptimizer>
  );
}
