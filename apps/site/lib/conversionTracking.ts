/**
 * Conversion Tracking Utility
 * 
 * Standardized conversion event tracking for GA4, Meta Pixel, and LinkedIn Insight Tag
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    lintrk?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export interface ConversionEvent {
  eventName: string;
  eventCategory?: string;
  eventLabel?: string;
  value?: number;
  currency?: string;
  metadata?: Record<string, any>;
}

/**
 * Track conversion event across all platforms
 */
export function trackConversion(event: ConversionEvent): void {
  if (typeof window === 'undefined') return;

  const {
    eventName,
    eventCategory = 'conversion',
    eventLabel,
    value,
    currency = 'USD',
    metadata = {}
  } = event;

  // Google Analytics 4
  if (window.gtag) {
    window.gtag('event', eventName, {
      event_category: eventCategory,
      event_label: eventLabel,
      value: value,
      currency: currency,
      ...metadata
    });
  }

  // Meta Pixel (Facebook)
  if (window.fbq) {
    // Map common event names to Meta Pixel events
    const metaEventMap: Record<string, string> = {
      'demo_request_submitted': 'Lead',
      'onboarding_signup_completed': 'CompleteRegistration',
      'newsletter_signup_completed': 'Subscribe',
      'lead_magnet_downloaded': 'Lead',
      'contact_form_submitted': 'Contact'
    };

    const metaEvent = metaEventMap[eventName] || 'Lead';
    
    window.fbq('track', metaEvent, {
      content_name: eventLabel || eventName,
      content_category: eventCategory,
      value: value,
      currency: currency,
      ...metadata
    });
  }

  // LinkedIn Insight Tag
  if (window.lintrk) {
    const conversionMap: Record<string, string> = {
      'demo_request_submitted': 'demo_request',
      'onboarding_signup_completed': 'onboarding_signup',
      'newsletter_signup_completed': 'newsletter_signup',
      'lead_magnet_downloaded': 'lead_magnet_download',
      'contact_form_submitted': 'contact_form'
    };

    const conversionId = conversionMap[eventName] || 'conversion';
    window.lintrk('track', { conversion_id: conversionId });
  }

  console.log(`[Conversion Tracking] Tracked: ${eventName}`, {
    category: eventCategory,
    label: eventLabel,
    value,
    currency
  });
}

/**
 * Helper: Track demo request conversion
 */
export function trackDemoRequestConversion(metadata?: Record<string, any>) {
  trackConversion({
    eventName: 'demo_request_submitted',
    eventCategory: 'conversion',
    eventLabel: 'demo_request',
    value: 1,
    metadata
  });
}

/**
 * Helper: Track onboarding signup conversion
 */
export function trackOnboardingSignupConversion(metadata?: Record<string, any>) {
  trackConversion({
    eventName: 'onboarding_signup_completed',
    eventCategory: 'conversion',
    eventLabel: 'onboarding_signup',
    value: 1,
    metadata
  });
}

/**
 * Helper: Track newsletter signup conversion
 */
export function trackNewsletterSignupConversion(metadata?: Record<string, any>) {
  trackConversion({
    eventName: 'newsletter_signup_completed',
    eventCategory: 'conversion',
    eventLabel: 'newsletter_signup',
    value: 1,
    metadata
  });
}

/**
 * Helper: Track lead magnet download conversion
 */
export function trackLeadMagnetDownloadConversion(leadMagnetId: string, metadata?: Record<string, any>) {
  trackConversion({
    eventName: 'lead_magnet_downloaded',
    eventCategory: 'conversion',
    eventLabel: leadMagnetId,
    value: 1,
    metadata: {
      leadMagnetId,
      ...metadata
    }
  });
}

/**
 * Helper: Track contact form conversion
 */
export function trackContactFormConversion(metadata?: Record<string, any>) {
  trackConversion({
    eventName: 'contact_form_submitted',
    eventCategory: 'conversion',
    eventLabel: 'contact_form',
    value: 1,
    metadata
  });
}

