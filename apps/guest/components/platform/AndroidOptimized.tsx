'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Fingerprint, 
  Smartphone, 
  Globe,
  Wifi,
  Battery,
  Signal,
  Lock,
  Unlock,
  Volume2,
  VolumeX
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { usePlatformDetection, PlatformUtils } from '@/utils/platformDetection';

/**
 * Android-Specific Mobile Optimizations
 * ------------------------------------
 * Enhanced mobile components optimized specifically for Android:
 * - Chrome-specific optimizations
 * - Fingerprint authentication
 * - Android-specific gestures and animations
 * - Material Design components
 * - Android-specific haptic feedback
 * - Chrome PWA features
 */

interface AndroidOptimizedProps {
  children: React.ReactNode;
  enableBiometrics?: boolean;
  enableHaptics?: boolean;
  enableMaterialDesign?: boolean;
  className?: string;
}

export default function AndroidOptimized({
  children,
  enableBiometrics = true,
  enableHaptics = true,
  enableMaterialDesign = true,
  className
}: AndroidOptimizedProps) {
  const platform = usePlatformDetection();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showBiometricPrompt, setShowBiometricPrompt] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Apply Android-specific styles
  useEffect(() => {
    if (platform.isAndroid) {
      PlatformUtils.android.addAndroidStyles();
      
      // Add Android-specific meta tags
      const metaTags = [
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'theme-color', content: '#0ea5e9' },
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
  }, [platform.isAndroid]);

  // Handle Android-specific touch events
  useEffect(() => {
    if (platform.isAndroid && containerRef.current) {
      PlatformUtils.android.handleAndroidTouch(containerRef.current);
    }
  }, [platform.isAndroid]);

  // Request biometric authentication
  const handleBiometricAuth = async () => {
    if (!enableBiometrics || !platform.hasBiometrics) return;
    
    setIsLoading(true);
    try {
      const success = await PlatformUtils.common.requestBiometricAuth();
      if (success) {
        setIsAuthenticated(true);
        if (enableHaptics) {
          PlatformUtils.android.requestHaptic('success');
        }
      } else {
        if (enableHaptics) {
          PlatformUtils.android.requestHaptic('error');
        }
      }
    } catch (error) {
      console.log('Biometric authentication failed:', error);
      if (enableHaptics) {
        PlatformUtils.android.requestHaptic('error');
      }
    } finally {
      setIsLoading(false);
      setShowBiometricPrompt(false);
    }
  };

  // Android-specific gesture handlers
  const handleAndroidGesture = (type: 'swipe' | 'pinch' | 'tap', data: any) => {
    if (enableHaptics) {
      PlatformUtils.android.requestHaptic('light');
    }
    
    switch (type) {
      case 'swipe':
        // Android-specific swipe handling
        if (data.direction === 'left') {
          // Swipe left to go back
          window.history.back();
        } else if (data.direction === 'right') {
          // Swipe right to open menu
          // Could implement drawer menu here
        }
        break;
      case 'pinch':
        // Android-specific pinch handling
        if (data.scale > 1.2) {
          // Zoom in with Material Design animation
          document.body.style.transform = `scale(${Math.min(data.scale, 1.5)})`;
          document.body.style.transition = 'transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)';
        }
        break;
      case 'tap':
        // Android-specific tap handling
        if (data.tapCount === 2) {
          // Double tap to zoom with Material Design ripple
          const ripple = document.createElement('div');
          ripple.className = 'android-ripple';
          ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(14, 165, 233, 0.3);
            transform: scale(0);
            animation: android-ripple-animation 0.6s ease-out;
            pointer-events: none;
            z-index: 1000;
          `;
          ripple.style.left = `${data.position.x - 25}px`;
          ripple.style.top = `${data.position.y - 25}px`;
          ripple.style.width = '50px';
          ripple.style.height = '50px';
          
          document.body.appendChild(ripple);
          setTimeout(() => ripple.remove(), 600);
        }
        break;
    }
  };

  if (!platform.isAndroid) {
    return <>{children}</>;
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        "android-optimized",
        enableMaterialDesign && "material-design",
        isDarkMode && "dark-theme",
        className
      )}
    >
      {/* Android Status Bar */}
      <div className="android-status-bar bg-blue-600">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2 text-white text-sm">
            <Smartphone className="w-4 h-4" />
            <span>Android {platform.version}</span>
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
              className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Fingerprint className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Authenticate with Fingerprint
                </h3>
                
                <p className="text-gray-600 text-sm mb-6">
                  Use your fingerprint to access the Hookah+ Guest portal
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
      <div className="android-content">
        {children}
      </div>

      {/* Android Navigation Bar */}
      <div className="android-nav-bar bg-gray-900">
        <div className="flex items-center justify-center py-2">
          <div className="w-32 h-1 bg-white/30 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}

// Android-specific components
export function AndroidFlavorWheel({ children, ...props }: any) {
  const platform = usePlatformDetection();
  
  if (!platform.isAndroid) return children;
  
  return (
    <div className="android-flavor-wheel android-scroll" {...props}>
      {children}
    </div>
  );
}

export function AndroidFireSessionDashboard({ children, ...props }: any) {
  const platform = usePlatformDetection();
  
  if (!platform.isAndroid) return children;
  
  return (
    <div className="android-fire-session android-scroll" {...props}>
      {children}
    </div>
  );
}

export function AndroidTouchHandler({ children, onGesture, ...props }: any) {
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

  if (!platform.isAndroid) return children;
  
  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="android-touch-handler"
      {...props}
    >
      {children}
    </div>
  );
}
