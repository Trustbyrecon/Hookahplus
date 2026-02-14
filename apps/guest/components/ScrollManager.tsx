'use client';

import { useEffect } from 'react';

/**
 * ScrollManager - Best Practice Mobile Scroll Optimization
 * 
 * This component helps optimize scroll behavior by:
 * - Adding mobile-specific scroll enhancements
 * - Handling iOS Safari viewport issues
 * - Optimizing touch scrolling without breaking natural flow
 */
export default function ScrollManager() {
  useEffect(() => {
    // Mobile scroll optimizations
    const optimizeMobileScroll = () => {
      const body = document.body;
      const html = document.documentElement;
      
      // Only apply mobile optimizations on mobile devices
      if (window.innerWidth <= 768) {
        // iOS Safari viewport fix
        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
          html.style.height = '-webkit-fill-available';
          body.style.minHeight = '-webkit-fill-available';
          
          // iOS momentum scrolling
          (body.style as any).webkitOverflowScrolling = 'touch';
          body.style.overscrollBehavior = 'contain';
          body.style.touchAction = 'pan-y';
        }
        
        // General mobile optimizations
        body.style.scrollBehavior = 'smooth';
      }
    };
    
    // Run on mount
    optimizeMobileScroll();
    
    // Re-run on resize (important for mobile orientation changes)
    const handleResize = () => {
      setTimeout(optimizeMobileScroll, 100);
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
