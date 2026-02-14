'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Mobile Touch Handler Component
 * -----------------------------
 * Enhanced touch interaction component with:
 * - Swipe gestures (left, right, up, down)
 * - Pinch gestures (zoom in/out)
 * - Tap gestures (single, double, long press)
 * - Touch feedback and haptics
 * - Performance optimizations
 */

interface TouchEvent {
  type: 'swipe' | 'pinch' | 'tap' | 'longpress';
  direction?: 'left' | 'right' | 'up' | 'down';
  distance?: number;
  duration?: number;
  scale?: number;
  center?: { x: number; y: number };
}

interface MobileTouchHandlerProps {
  children: React.ReactNode;
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down', distance: number) => void;
  onPinch?: (scale: number, center: { x: number; y: number }) => void;
  onTap?: (position: { x: number; y: number }) => void;
  onDoubleTap?: (position: { x: number; y: number }) => void;
  onLongPress?: (position: { x: number; y: number }) => void;
  swipeThreshold?: number;
  pinchThreshold?: number;
  longPressThreshold?: number;
  className?: string;
  enableHaptics?: boolean;
}

export default function MobileTouchHandler({
  children,
  onSwipe,
  onPinch,
  onTap,
  onDoubleTap,
  onLongPress,
  swipeThreshold = 50,
  pinchThreshold = 0.1,
  longPressThreshold = 500,
  className,
  enableHaptics = true
}: MobileTouchHandlerProps) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number; time: number } | null>(null);
  const [touchCount, setTouchCount] = useState(0);
  const [lastTap, setLastTap] = useState<number>(0);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [touchFeedback, setTouchFeedback] = useState<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Haptic feedback function
  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (enableHaptics && 'vibrate' in navigator) {
      switch (type) {
        case 'light':
          navigator.vibrate(10);
          break;
        case 'medium':
          navigator.vibrate(50);
          break;
        case 'heavy':
          navigator.vibrate(100);
          break;
      }
    }
  };

  // Touch start handler
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const startPos = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    
    setTouchStart(startPos);
    setTouchEnd(null);
    setTouchCount(e.touches.length);
    
    // Start long press timer
    if (e.touches.length === 1) {
      const timer = setTimeout(() => {
        setIsLongPressing(true);
        triggerHaptic('medium');
        
        if (onLongPress) {
          onLongPress({ x: touch.clientX, y: touch.clientY });
        }
      }, longPressThreshold);
      
      setLongPressTimer(timer);
    }
    
    // Show touch feedback
    setTouchFeedback({ x: touch.clientX, y: touch.clientY, active: true });
  };

  // Touch move handler
  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const movePos = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    
    setTouchEnd(movePos);
    
    // Cancel long press if moving
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    
    // Handle pinch gestures
    if (e.touches.length === 2 && onPinch) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + 
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      const center = {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2
      };
      
      // Calculate scale based on distance change
      if (touchStart) {
        const initialDistance = Math.sqrt(
          Math.pow(touch2.clientX - touchStart.x, 2) + 
          Math.pow(touch2.clientY - touchStart.y, 2)
        );
        
        const scale = distance / initialDistance;
        
        if (Math.abs(scale - 1) > pinchThreshold) {
          onPinch(scale, center);
        }
      }
    }
  };

  // Touch end handler
  const handleTouchEnd = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    const endPos = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    
    setTouchEnd(endPos);
    setIsLongPressing(false);
    
    // Clear long press timer
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    
    // Hide touch feedback
    setTimeout(() => {
      setTouchFeedback(prev => ({ ...prev, active: false }));
    }, 150);
    
    // Handle single touch gestures
    if (touchCount === 1 && touchStart) {
      const distanceX = endPos.x - touchStart.x;
      const distanceY = endPos.y - touchStart.y;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
      const duration = endPos.time - touchStart.time;
      
      // Determine if it's a swipe or tap
      if (distance > swipeThreshold) {
        // It's a swipe
        const absX = Math.abs(distanceX);
        const absY = Math.abs(distanceY);
        
        if (absX > absY) {
          // Horizontal swipe
          const direction = distanceX > 0 ? 'right' : 'left';
          triggerHaptic('light');
          if (onSwipe) {
            onSwipe(direction, absX);
          }
        } else {
          // Vertical swipe
          const direction = distanceY > 0 ? 'down' : 'up';
          triggerHaptic('light');
          if (onSwipe) {
            onSwipe(direction, absY);
          }
        }
      } else if (duration < 300) {
        // It's a tap
        const now = Date.now();
        const timeDiff = now - lastTap;
        
        if (timeDiff < 300 && timeDiff > 0) {
          // Double tap
          triggerHaptic('medium');
          if (onDoubleTap) {
            onDoubleTap({ x: endPos.x, y: endPos.y });
          }
        } else {
          // Single tap
          triggerHaptic('light');
          if (onTap) {
            onTap({ x: endPos.x, y: endPos.y });
          }
        }
        
        setLastTap(now);
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
    };
  }, [longPressTimer]);

  return (
    <div
      ref={containerRef}
      className={`relative touch-none ${className || ''}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ userSelect: 'none' }}
    >
      {children}
      
      {/* Touch Feedback Ripple */}
      <AnimatePresence>
        {touchFeedback.active && (
          <motion.div
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 0 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute pointer-events-none"
            style={{
              left: touchFeedback.x - 20,
              top: touchFeedback.y - 20,
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
              zIndex: 1000
            }}
          />
        )}
      </AnimatePresence>
      
      {/* Long Press Indicator */}
      <AnimatePresence>
        {isLongPressing && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute pointer-events-none"
            style={{
              left: touchStart ? touchStart.x - 15 : 0,
              top: touchStart ? touchStart.y - 15 : 0,
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: 'rgba(34, 197, 94, 0.2)',
              border: '2px solid rgba(34, 197, 94, 0.8)',
              zIndex: 1000
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Hook for using touch gestures in components
export function useTouchGestures() {
  const [gestures, setGestures] = useState<TouchEvent[]>([]);
  
  const addGesture = (gesture: TouchEvent) => {
    setGestures(prev => [...prev.slice(-9), gesture]); // Keep last 10 gestures
  };
  
  const clearGestures = () => {
    setGestures([]);
  };
  
  return {
    gestures,
    addGesture,
    clearGestures
  };
}
