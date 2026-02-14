/**
 * Content Engagement Tracking
 * 
 * Tracks which blog posts and pages users read before subscribing
 * This data is used for MOAT alignment and personalization
 */

interface ContentEngagement {
  pages: string[];
  timeSpent: number; // Total time in seconds
  lastPage?: string;
  firstPage?: string;
}

const STORAGE_KEY = 'hookahplus_content_engagement';
const SESSION_START_KEY = 'hookahplus_session_start';

/**
 * Initialize content engagement tracking
 * Call this on page load
 */
export function initContentEngagement() {
  if (typeof window === 'undefined') return;

  // Track session start time
  const sessionStart = sessionStorage.getItem(SESSION_START_KEY);
  if (!sessionStart) {
    sessionStorage.setItem(SESSION_START_KEY, Date.now().toString());
  }

  // Track current page
  trackPageView(window.location.pathname);
}

/**
 * Track a page view
 */
export function trackPageView(pathname: string) {
  if (typeof window === 'undefined') return;

  const engagement = getContentEngagement();
  
  // Add page if not already tracked
  if (!engagement.pages.includes(pathname)) {
    engagement.pages.push(pathname);
  }

  // Update last page
  engagement.lastPage = pathname;

  // Set first page if not set
  if (!engagement.firstPage) {
    engagement.firstPage = pathname;
  }

  // Calculate time spent
  const sessionStart = parseInt(sessionStorage.getItem(SESSION_START_KEY) || '0');
  if (sessionStart > 0) {
    engagement.timeSpent = Math.floor((Date.now() - sessionStart) / 1000);
  }

  saveContentEngagement(engagement);
}

/**
 * Get current content engagement data
 */
export function getContentEngagement(): ContentEngagement {
  if (typeof window === 'undefined') {
    return { pages: [], timeSpent: 0 };
  }

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('[Content Engagement] Failed to parse stored data:', error);
  }

  return { pages: [], timeSpent: 0 };
}

/**
 * Save content engagement data
 */
function saveContentEngagement(engagement: ContentEngagement) {
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(engagement));
  } catch (error) {
    console.error('[Content Engagement] Failed to save data:', error);
  }
}

/**
 * Clear content engagement data (after signup)
 */
export function clearContentEngagement() {
  if (typeof window === 'undefined') return;

  sessionStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(SESSION_START_KEY);
}

/**
 * Get content engagement for newsletter signup
 * Returns the engagement data to send with subscription
 */
export function getContentEngagementForSignup(): ContentEngagement {
  return getContentEngagement();
}

