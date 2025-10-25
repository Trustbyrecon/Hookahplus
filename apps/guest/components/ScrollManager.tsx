'use client';

import { useEffect } from 'react';

/**
 * ScrollManager - Ensures body owns vertical scrolling
 * 
 * This component helps manage scroll behavior by:
 * - Ensuring body owns vertical scroll
 * - Preventing containers from hijacking scroll
 * - Optimizing for mobile touch scrolling
 */
export default function ScrollManager() {
  useEffect(() => {
    // Ensure body owns vertical scrolling
    const ensureBodyScroll = () => {
      const body = document.body;
      const html = document.documentElement;
      
      // Set body scroll properties
      body.style.overflowY = 'auto';
      body.style.overflowX = 'hidden';
      body.style.scrollBehavior = 'smooth';
      
      // iOS optimizations
      if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        (body.style as any).webkitOverflowScrolling = 'touch';
        body.style.overscrollBehavior = 'contain';
        (body.style as any).overscrollBehaviorY = 'contain';
        body.style.touchAction = 'pan-y';
      }
      
      // Prevent containers from creating scroll contexts
      const containers = document.querySelectorAll('.min-h-screen, .flex, .container');
      containers.forEach(container => {
        const element = container as HTMLElement;
        if (element.style.overflowY === 'auto' || element.style.overflowY === 'scroll') {
          element.style.overflowY = 'visible';
        }
        if (element.style.height === '100vh' && element.style.overflowY !== 'visible') {
          element.style.overflowY = 'visible';
        }
      });
    };
    
    // Run on mount
    ensureBodyScroll();
    
    // Re-run on resize (important for mobile orientation changes)
    const handleResize = () => {
      setTimeout(ensureBodyScroll, 100);
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);
  
  return null; // This component doesn't render anything
}

/**
 * Hook to manage scroll behavior
 */
export function useScrollManager() {
  useEffect(() => {
    // Prevent default scroll behavior on containers
    const preventContainerScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target && target !== document.body && target !== document.documentElement) {
        // If a container tries to scroll, let body handle it
        if (target.scrollTop > 0 && target.scrollHeight > target.clientHeight) {
          const scrollAmount = target.scrollTop;
          target.scrollTop = 0;
          window.scrollBy(0, scrollAmount);
        }
      }
    };
    
    // Add scroll event listeners
    document.addEventListener('scroll', preventContainerScroll, { passive: true });
    
    return () => {
      document.removeEventListener('scroll', preventContainerScroll);
    };
  }, []);
}

/**
 * Utility function to scroll to element smoothly
 */
export function scrollToElement(elementId: string, offset: number = 0) {
  const element = document.getElementById(elementId);
  if (element) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
}

/**
 * Utility function to scroll to top
 */
export function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}
