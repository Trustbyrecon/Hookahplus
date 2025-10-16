// apps/guest/hooks/useHapticFeedback.ts
import { useCallback } from 'react';

export const useHapticFeedback = () => {
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    // Check if device supports haptic feedback
    if ('vibrate' in navigator) {
      const patterns = {
        light: 10,    // Light tap
        medium: 25,   // Medium tap
        heavy: 50     // Heavy tap
      };
      
      navigator.vibrate(patterns[type]);
    }
  }, []);

  const triggerSuccess = useCallback(() => {
    if ('vibrate' in navigator) {
      // Success pattern: short-short-long
      navigator.vibrate([10, 50, 10, 50, 25]);
    }
  }, []);

  const triggerError = useCallback(() => {
    if ('vibrate' in navigator) {
      // Error pattern: long-short-long
      navigator.vibrate([50, 100, 25, 100, 50]);
    }
  }, []);

  const triggerSelection = useCallback(() => {
    if ('vibrate' in navigator) {
      // Selection pattern: quick double tap
      navigator.vibrate([15, 30, 15]);
    }
  }, []);

  return {
    triggerHaptic,
    triggerSuccess,
    triggerError,
    triggerSelection
  };
};
