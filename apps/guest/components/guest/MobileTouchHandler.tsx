'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, PanInfo } from 'framer-motion';

interface TouchGesture {
  type: 'swipe' | 'pinch' | 'tap' | 'longPress';
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  duration?: number;
}

interface MobileTouchHandlerProps {
  children: React.ReactNode;
  onSwipe?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onPinch?: (scale: number) => void;
  onTap?: () => void;
  onLongPress?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  swipeThreshold?: number;
  longPressDelay?: number;
  className?: string;
}

export default function MobileTouchHandler({
  children,
  onSwipe,
  onPinch,
  onTap,
  onLongPress,
  onSwipeUp,
  onSwipeDown,
  onSwipeLeft,
  onSwipeRight,
  swipeThreshold = 50,
  longPressDelay = 500,
  className = ''
}: MobileTouchHandlerProps) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number; time: number } | null>(null);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [pinchStart, setPinchStart] = useState<{ distance: number; scale: number } | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const startPos = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    setTouchStart(startPos);
    setTouchEnd(null);

    // Start long press timer
    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        setIsLongPressing(true);
        onLongPress();
      }, longPressDelay);
    }

    // Handle pinch start
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      setPinchStart({ distance, scale: 1 });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchEnd({ x: touch.clientX, y: touch.clientY, time: Date.now() });

    // Cancel long press if moved
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    // Handle pinch
    if (e.touches.length === 2 && pinchStart) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      const scale = distance / pinchStart.distance;
      
      if (onPinch) {
        onPinch(scale);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (!touchStart || !touchEnd) return;

    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = touchEnd.y - touchStart.y;
    const deltaTime = touchEnd.time - touchStart.time;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Determine gesture type
    if (distance < 10 && deltaTime < 300) {
      // Tap
      if (onTap && !isLongPressing) {
        onTap();
      }
    } else if (distance > swipeThreshold && deltaTime < 500) {
      // Swipe
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      
      if (absX > absY) {
        // Horizontal swipe
        if (deltaX > 0) {
          onSwipeRight?.();
          onSwipe?.('right');
        } else {
          onSwipeLeft?.();
          onSwipe?.('left');
        }
      } else {
        // Vertical swipe
        if (deltaY > 0) {
          onSwipeDown?.();
          onSwipe?.('down');
        } else {
          onSwipeUp?.();
          onSwipe?.('up');
        }
      }
    }

    // Reset states
    setTouchStart(null);
    setTouchEnd(null);
    setIsLongPressing(false);
    setPinchStart(null);
  };

  const handlePan = (event: any, info: PanInfo) => {
    // Handle pan gestures for more complex interactions
    const { offset, velocity } = info;
    
    // Detect swipe based on velocity and offset
    if (Math.abs(velocity.x) > 500 || Math.abs(velocity.y) > 500) {
      if (Math.abs(velocity.x) > Math.abs(velocity.y)) {
        // Horizontal swipe
        if (velocity.x > 0) {
          onSwipeRight?.();
          onSwipe?.('right');
        } else {
          onSwipeLeft?.();
          onSwipe?.('left');
        }
      } else {
        // Vertical swipe
        if (velocity.y > 0) {
          onSwipeDown?.();
          onSwipe?.('down');
        } else {
          onSwipeUp?.();
          onSwipe?.('up');
        }
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

  return (
    <motion.div
      className={className}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onPan={handlePan}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {children}
    </motion.div>
  );
}

// Hook for mobile touch interactions
export function useMobileTouch() {
  const [gestures, setGestures] = useState<TouchGesture[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const addGesture = (gesture: TouchGesture) => {
    setGestures(prev => [...prev.slice(-9), gesture]); // Keep last 10 gestures
  };

  const clearGestures = () => {
    setGestures([]);
  };

  return {
    gestures,
    isMobile,
    addGesture,
    clearGestures
  };
}
