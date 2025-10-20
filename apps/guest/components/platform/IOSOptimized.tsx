'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TouchID, 
  FaceID, 
  Apple, 
  Safari,
  Wifi,
  Battery,
  Signal,
  Lock,
  Unlock
} from 'lucide-react';
import { cn } from '../utils/cn';
import { usePlatformDetection, PlatformUtils } from '../utils/platformDetection';

/**
 * iOS-Specific Mobile Optimizations
 * --------------------------------
 * Enhanced mobile components optimized specifically for iOS:
 * - Safari-specific optimizations
 * - Touch ID / Face ID integration
 * - iOS-specific gestures and animations
 * - Safe area handling
 * - iOS-specific haptic feedback
 * - Safari PWA features
 */

interface IOSOptimizedProps {
  children: React.ReactNode;
  enableBiometrics?: boolean;
  enableHaptics?: boolean;
  enableSafeArea?: boolean;
  className?: string;
}

export default function IOSOptimized({
  children,
  enableBiometrics = true,
  enableHaptics = true,
  enableSafeArea = true,
  className
}: IOSOptimizedProps) {
  const platform = usePlatformDetection();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showBiometricPrompt, setShowBiometricPrompt] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Apply iOS-specific styles
  useEffect(() => {
    if (platform.isIOS) {
      PlatformUtils.ios.addIOSStyles();
      
      // Add iOS-specific meta tags
      const metaTags = [
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'Hookah+ Guest' },
        { name: 'format-detection', content: 'telephone=no' }
      ];

      metaTags.forEach(tag => {
        if (!document.querySelector(`meta[name="${tag.name}"]`)) {
          const meta = document.createElement('meta');
          meta.name = tag.name;
          meta.content = tag.content;
          document.head.appendChild(meta);
        }
      });
    }
  }, [platform.isIOS]);

  // Handle iOS-specific touch events
  useEffect(() => {
    if (platform.isIOS && containerRef.current) {
      PlatformUtils.ios.handleIOSTouch(containerRef.current);
    }
  }, [platform.isIOS]);

  // Request biometric authentication
  const handleBiometricAuth = async () => {
    if (!enableBiometrics || !platform.hasBiometrics) return;
    
    setIsLoading(true);
    try {
      const success = await PlatformUtils.common.requestBiometricAuth();
      if (success) {
        setIsAuthenticated(true);
        if (enableHaptics) {
          PlatformUtils.ios.requestHaptic('success');
        }
      } else {
        if (enableHaptics) {
          PlatformUtils.ios.requestHaptic('error');
        }
      }
    } catch (error) {
      console.log('Biometric authentication failed:', error);
      if (enableHaptics) {
        PlatformUtils.ios.requestHaptic('error');
      }
    } finally {
      setIsLoading(false);
      setShowBiometricPrompt(false);
    }
  };

  // iOS-specific gesture handlers
  const handleIOSGesture = (type: 'swipe' | 'pinch' | 'tap', data: any) => {
    if (enableHaptics) {
      PlatformUtils.ios.requestHaptic('light');
    }
    
    switch (type) {
      case 'swipe':
        // iOS-specific swipe handling
        if (data.direction === 'left') {
          // Swipe left to go back
          window.history.back();
        }
        break;
      case 'pinch':
        // iOS-specific pinch handling
        if (data.scale > 1.2) {
          // Zoom in
          document.body.style.transform = `scale(${Math.min(data.scale, 1.5)})`;
        }
        break;
      case 'tap':
        // iOS-specific tap handling
        if (data.tapCount === 2) {
          // Double tap to zoom
          document.body.style.transform = 'scale(1.1)';
          setTimeout(() => {
            document.body.style.transform = 'scale(1)';
          }, 200);
        }
        break;
    }
  };

  if (!platform.isIOS) {
    return <>{children}</>;
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        "ios-optimized",
        enableSafeArea && "ios-safe-area",
        className
      )}
    >
      {/* iOS Status Bar */}
      <div className="ios-status-bar bg-black/20 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2 text-white text-sm">
            <Apple className="w-4 h-4" />
            <span>iOS {platform.version}</span>
          </div>
          
          <div className="flex items-center gap-3 text-white text-sm">
            <div className="flex items-center gap-1">
              <Signal className="w-3 h-3" />
              <span>100%</span>
            </div>
            <div className="flex items-center gap-1">
              <Wifi className="w-3 h-3" />
            </div>
            <div className="flex items-center gap-1">
              <Battery className="w-3 h-3" />
              <span>85%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Biometric Authentication Prompt */}
      <AnimatePresence>
        {showBiometricPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  {platform.hasBiometrics ? (
                    <FaceID className="w-8 h-8 text-white" />
                  ) : (
                    <TouchID className="w-8 h-8 text-white" />
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Authenticate with {platform.hasBiometrics ? 'Face ID' : 'Touch ID'}
                </h3>
                
                <p className="text-gray-600 text-sm mb-6">
                  Use your biometric authentication to access the Hookah+ Guest portal
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowBiometricPrompt(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBiometricAuth}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
                  >
                    {isLoading ? 'Authenticating...' : 'Authenticate'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="ios-content">
        {children}
      </div>

      {/* iOS Home Indicator */}
      <div className="ios-home-indicator">
        <div className="w-32 h-1 bg-white/30 rounded-full mx-auto"></div>
      </div>
    </div>
  );
}

// iOS-specific components
export function IOSFlavorWheel({ children, ...props }: any) {
  const platform = usePlatformDetection();
  
  if (!platform.isIOS) return children;
  
  return (
    <div className="ios-flavor-wheel ios-scroll" {...props}>
      {children}
    </div>
  );
}

export function IOSFireSessionDashboard({ children, ...props }: any) {
  const platform = usePlatformDetection();
  
  if (!platform.isIOS) return children;
  
  return (
    <div className="ios-fire-session ios-scroll" {...props}>
      {children}
    </div>
  );
}

export function IOSTouchHandler({ children, onGesture, ...props }: any) {
  const platform = usePlatformDetection();
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number; time: number } | null>(null);
  const [lastTap, setLastTap] = useState<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY, time: Date.now() });
    setTouchEnd(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchEnd({ x: touch.clientX, y: touch.clientY, time: Date.now() });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    const endPos = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    
    setTouchEnd(endPos);
    
    if (touchStart) {
      const distanceX = endPos.x - touchStart.x;
      const distanceY = endPos.y - touchStart.y;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
      const duration = endPos.time - touchStart.time;
      
      if (distance > 50) {
        // Swipe gesture
        const direction = Math.abs(distanceX) > Math.abs(distanceY) 
          ? (distanceX > 0 ? 'right' : 'left')
          : (distanceY > 0 ? 'down' : 'up');
        
        onGesture?.('swipe', { direction, distance });
      } else if (duration < 300) {
        // Tap gesture
        const now = Date.now();
        const timeDiff = now - lastTap;
        
        if (timeDiff < 300 && timeDiff > 0) {
          // Double tap
          onGesture?.('tap', { tapCount: 2, position: endPos });
        } else {
          // Single tap
          onGesture?.('tap', { tapCount: 1, position: endPos });
        }
        
        setLastTap(now);
      }
    }
  };

  if (!platform.isIOS) return children;
  
  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="ios-touch-handler"
      {...props}
    >
      {children}
    </div>
  );
}
