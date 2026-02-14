'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { initContentEngagement, trackPageView } from '../lib/contentEngagement';

/**
 * Client component that tracks content engagement
 * Place this at the top level of pages you want to track
 */
export default function ContentEngagementTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Initialize tracking on mount
    initContentEngagement();
  }, []);

  useEffect(() => {
    // Track page view when pathname changes
    if (pathname) {
      trackPageView(pathname);
    }
  }, [pathname]);

  return null; // This component doesn't render anything
}

