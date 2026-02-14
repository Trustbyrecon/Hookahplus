/**
 * Touch Drag Hook
 * 
 * Enables touch-based dragging for mobile devices
 */

import { useState, useRef, useCallback } from 'react';

interface TouchDragOptions {
  onDragStart?: (e: TouchEvent) => void;
  onDrag?: (e: TouchEvent, deltaX: number, deltaY: number) => void;
  onDragEnd?: (e: TouchEvent) => void;
  threshold?: number; // Minimum distance to start dragging
}

export function useTouchDrag(options: TouchDragOptions = {}) {
  const { onDragStart, onDrag, onDragEnd, threshold = 5 } = options;
  const [isDragging, setIsDragging] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const lastTouchRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
    onDragStart?.(e.nativeEvent as any);
  }, [onDragStart]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current || !lastTouchRef.current) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - lastTouchRef.current.x;
    const deltaY = touch.clientY - lastTouchRef.current.y;
    const totalDeltaX = touch.clientX - touchStartRef.current.x;
    const totalDeltaY = touch.clientY - touchStartRef.current.y;
    const distance = Math.sqrt(totalDeltaX * totalDeltaX + totalDeltaY * totalDeltaY);

    // Start dragging if threshold is met
    if (!isDragging && distance > threshold) {
      setIsDragging(true);
      e.preventDefault(); // Prevent scrolling
    }

    if (isDragging || distance > threshold) {
      onDrag?.(e.nativeEvent as any, deltaX, deltaY);
      lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
      e.preventDefault();
    }
  }, [isDragging, threshold, onDrag]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (isDragging) {
      onDragEnd?.(e.nativeEvent as any);
    }
    setIsDragging(false);
    touchStartRef.current = null;
    lastTouchRef.current = null;
  }, [isDragging, onDragEnd]);

  return {
    isDragging,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}

