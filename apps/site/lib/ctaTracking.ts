/**
 * CTA Tracking Utility
 * 
 * Centralized function for tracking CTAs from the website
 * Sends events to /api/cta/track endpoint
 */

export interface CTATrackingData {
  ctaSource: 'website' | 'instagram' | 'linkedin' | 'email' | 'calendly';
  ctaType: 'demo_request' | 'onboarding_signup' | 'contact_form' | 'social_click' | 'newsletter_signup' | 'lead_magnet_download' | 'founder_signup';
  data?: {
    name?: string;
    email?: string;
    phone?: string;
    businessName?: string;
    [key: string]: any;
  };
  metadata?: Record<string, any>;
  campaignId?: string;
  page?: string;
  component?: string;
}

/**
 * Track a CTA event
 */
export async function trackCTA(params: CTATrackingData): Promise<void> {
  try {
    // Get current page path
    const page = typeof window !== 'undefined' ? window.location.pathname : params.page || 'unknown';
    
    // Build tracking payload
    const payload = {
      ctaSource: params.ctaSource,
      ctaType: params.ctaType,
      data: params.data || {},
      metadata: {
        ...params.metadata,
        timestamp: new Date().toISOString(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        referrer: typeof document !== 'undefined' ? document.referrer : undefined
      },
      campaignId: params.campaignId,
      page,
      component: params.component
    };

    // Send to tracking API (use app build URL in production)
    const apiUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
    
    // Use fetch with timeout and better error handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    try {
      const response = await fetch(`${apiUrl}/api/cta/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Only log in development to reduce console noise
        if (process.env.NODE_ENV === 'development') {
          console.warn('[CTA Tracking] Failed to track CTA:', await response.text());
        }
      } else {
        const result = await response.json();
        if (process.env.NODE_ENV === 'development') {
          console.log('[CTA Tracking] Success:', result);
        }
      }
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      // Only log connection errors in development
      // Connection refused is expected if app build isn't running
      if (process.env.NODE_ENV === 'development' && !fetchError.message?.includes('aborted')) {
        console.debug('[CTA Tracking] Connection error (app build may not be running):', fetchError.message);
      }
      // Fail silently in production - don't break user experience
    }
  } catch (error) {
    // Fail silently - don't break user experience if tracking fails
    if (process.env.NODE_ENV === 'development') {
      console.debug('[CTA Tracking] Error:', error);
    }
  }
}

/**
 * Helper: Track demo request CTA
 */
export function trackDemoRequest(component: string, metadata?: Record<string, any>) {
  trackCTA({
    ctaSource: 'website',
    ctaType: 'demo_request',
    component,
    metadata
  });
}

/**
 * Helper: Track onboarding signup CTA
 */
export function trackOnboardingSignup(data?: CTATrackingData['data'], metadata?: Record<string, any>) {
  trackCTA({
    ctaSource: 'website',
    ctaType: 'onboarding_signup',
    data,
    metadata
  });
}

/**
 * Helper: Track contact form CTA
 */
export function trackContactForm(data?: CTATrackingData['data'], metadata?: Record<string, any>) {
  trackCTA({
    ctaSource: 'website',
    ctaType: 'contact_form',
    data,
    metadata
  });
}

/**
 * Helper: Track Calendly CTA (when Calendly is integrated)
 */
export function trackCalendlyCTA(data?: CTATrackingData['data'], metadata?: Record<string, any>) {
  trackCTA({
    ctaSource: 'calendly',
    ctaType: 'demo_request',
    data,
    metadata
  });
}

/**
 * Helper: Track newsletter signup CTA
 */
export function trackNewsletterSignup(data?: CTATrackingData['data'], metadata?: Record<string, any>) {
  trackCTA({
    ctaSource: 'website',
    ctaType: 'newsletter_signup',
    data,
    metadata
  });
}

/**
 * Helper: Track founder signup CTA (from /owners page)
 */
export function trackFounderSignup(data?: CTATrackingData['data'], metadata?: Record<string, any>) {
  trackCTA({
    ctaSource: 'website',
    ctaType: 'founder_signup',
    data,
    metadata
  });
}

