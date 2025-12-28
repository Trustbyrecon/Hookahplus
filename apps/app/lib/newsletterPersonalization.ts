/**
 * Newsletter Personalization Service
 * 
 * Uses newsletter engagement data to personalize onboarding experience
 * Part of MOAT strategy: Newsletter → Customer → Network Node
 */

import { prisma } from './prisma';

export interface NewsletterEngagement {
  hid: string;
  email: string;
  subscribedAt: Date;
  contentPages: string[];
  contentTimeSpent: number;
  firstPage?: string;
  lastPage?: string;
  source?: string;
}

export interface PersonalizationProfile {
  hid: string;
  email: string;
  subscribedAt: Date;
  interests: string[]; // Derived from content pages
  intentLevel: 'high' | 'medium' | 'low'; // Based on engagement
  recommendedOnboardingPath: string[];
  contentPreferences: {
    topics: string[];
    engagementScore: number;
  };
}

/**
 * Get newsletter engagement data for a HID
 */
export async function getNewsletterEngagement(hid: string): Promise<NewsletterEngagement | null> {
  try {
    // Find newsletter signup events
    const events = await prisma.reflexEvent.findMany({
      where: {
        type: { startsWith: 'cta.' },
        ctaType: 'newsletter_signup',
      },
      orderBy: { createdAt: 'desc' },
      take: 100, // Get recent events to search through
    });

    // Find event with matching HID in metadata
    let matchingEvent = null;
    for (const event of events) {
      try {
        // Parse metadata (stored as JSON string)
        const metadata = event.metadata 
          ? (typeof event.metadata === 'string' ? JSON.parse(event.metadata) : event.metadata)
          : {};
        
        // Check if HID matches
        if (metadata.hid === hid) {
          matchingEvent = { event, metadata };
          break;
        }

        // Also check payload for HID
        if (event.payload) {
          const payload = typeof event.payload === 'string' 
            ? JSON.parse(event.payload) 
            : event.payload;
          
          if (payload.data?.hid === hid || payload.metadata?.hid === hid) {
            matchingEvent = { event, metadata: { ...metadata, ...payload.metadata } };
            break;
          }
        }
      } catch (parseError) {
        // Skip events with invalid JSON
        continue;
      }
    }

    if (!matchingEvent) {
      return null;
    }

    const { event, metadata } = matchingEvent;

    // Extract email from payload or metadata
    let email = '';
    try {
      if (event.payload) {
        const payload = typeof event.payload === 'string' 
          ? JSON.parse(event.payload) 
          : event.payload;
        email = payload.data?.email || payload.lead?.email || '';
      }
    } catch (e) {
      // Ignore parse errors
    }

    return {
      hid,
      email: email || '',
      subscribedAt: event.createdAt,
      contentPages: metadata.contentPages || metadata.contentEngagement?.pages || [],
      contentTimeSpent: metadata.contentTimeSpent || metadata.contentEngagement?.timeSpent || 0,
      firstPage: metadata.contentEngagement?.firstPage,
      lastPage: metadata.contentEngagement?.lastPage || metadata.contentPages?.[metadata.contentPages.length - 1],
      source: event.ctaSource || metadata.source,
    };
  } catch (error) {
    console.error('[Newsletter Personalization] Error getting engagement:', error);
    return null;
  }
}

/**
 * Get personalization profile for onboarding
 */
export async function getPersonalizationProfile(hid: string): Promise<PersonalizationProfile | null> {
  const engagement = await getNewsletterEngagement(hid);
  
  if (!engagement) {
    return null;
  }

  // Derive interests from content pages
  const interests = deriveInterests(engagement.contentPages);
  
  // Calculate intent level
  const intentLevel = calculateIntentLevel(engagement);
  
  // Recommend onboarding path
  const recommendedOnboardingPath = recommendOnboardingPath(engagement, interests);
  
  // Content preferences
  const contentPreferences = {
    topics: interests,
    engagementScore: calculateEngagementScore(engagement),
  };

  return {
    hid: engagement.hid,
    email: engagement.email,
    subscribedAt: engagement.subscribedAt,
    interests,
    intentLevel,
    recommendedOnboardingPath,
    contentPreferences,
  };
}

/**
 * Derive interests from content pages
 */
function deriveInterests(pages: string[]): string[] {
  const interests: string[] = [];
  
  for (const page of pages) {
    if (page.includes('/blog/square')) {
      interests.push('square-integration');
    }
    if (page.includes('/blog/session-timing')) {
      interests.push('session-management');
    }
    if (page.includes('/blog/loyalty')) {
      interests.push('customer-memory');
    }
    if (page.includes('/works-with-square')) {
      interests.push('pos-integration');
    }
    if (page.includes('/session-timer-pos')) {
      interests.push('timing-software');
    }
  }
  
  // Remove duplicates
  return [...new Set(interests)];
}

/**
 * Calculate intent level based on engagement
 */
function calculateIntentLevel(engagement: NewsletterEngagement): 'high' | 'medium' | 'low' {
  let score = 0;
  
  // More pages = higher intent
  score += engagement.contentPages.length * 10;
  
  // More time = higher intent
  score += Math.min(engagement.contentTimeSpent / 60, 30); // Max 30 points for time
  
  // Specific high-intent pages
  if (engagement.contentPages.some(p => p.includes('/works-with-square'))) {
    score += 20;
  }
  if (engagement.contentPages.some(p => p.includes('/onboarding'))) {
    score += 30;
  }
  
  if (score >= 50) return 'high';
  if (score >= 20) return 'medium';
  return 'low';
}

/**
 * Recommend onboarding path based on interests
 */
function recommendOnboardingPath(
  engagement: NewsletterEngagement,
  interests: string[]
): string[] {
  const path: string[] = [];
  
  // Always start with welcome
  path.push('welcome');
  
  // Add interest-based steps
  if (interests.includes('square-integration') || interests.includes('pos-integration')) {
    path.push('square-setup');
  }
  
  if (interests.includes('session-management') || interests.includes('timing-software')) {
    path.push('session-timer-demo');
  }
  
  if (interests.includes('customer-memory')) {
    path.push('customer-memory-overview');
  }
  
  // Default onboarding steps
  if (path.length === 1) {
    path.push('features-overview', 'getting-started');
  }
  
  return path;
}

/**
 * Calculate engagement score (0-100)
 */
function calculateEngagementScore(engagement: NewsletterEngagement): number {
  let score = 0;
  
  // Pages visited (max 40 points)
  score += Math.min(engagement.contentPages.length * 10, 40);
  
  // Time spent (max 40 points)
  score += Math.min((engagement.contentTimeSpent / 60) * 2, 40);
  
  // Depth of engagement (max 20 points)
  if (engagement.contentPages.length >= 3) {
    score += 20;
  } else if (engagement.contentPages.length >= 2) {
    score += 10;
  }
  
  return Math.min(score, 100);
}

/**
 * Check if HID has newsletter engagement
 */
export async function hasNewsletterEngagement(hid: string): Promise<boolean> {
  const engagement = await getNewsletterEngagement(hid);
  return engagement !== null;
}

