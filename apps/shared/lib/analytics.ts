/**
 * Analytics Utility for Hookah+ Apps
 * Provides GA4 tracking, conversion events, and error monitoring
 */

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export interface AnalyticsEvent {
  event_name: string;
  event_category?: string;
  event_label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}

export interface ConversionEvent extends AnalyticsEvent {
  conversion_type: 'session_start' | 'flavor_selection' | 'checkout_complete' | 'support_contact' | 'docs_view';
  conversion_value?: number;
  currency?: string;
}

export interface ErrorEvent {
  error_type: 'javascript' | 'api' | 'network' | 'validation';
  error_message: string;
  error_stack?: string;
  component?: string;
  user_action?: string;
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private isInitialized = false;
  private gaId: string | null = null;

  private constructor() {
    this.gaId = process.env.NEXT_PUBLIC_GA_ID || null;
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Initialize GA4 tracking
   */
  public initialize(): void {
    if (typeof window === 'undefined' || this.isInitialized || !this.gaId) {
      return;
    }

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    
    // Define gtag function
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };

    // Configure GA4
    window.gtag('js', new Date());
    window.gtag('config', this.gaId, {
      page_title: document.title,
      page_location: window.location.href,
      send_page_view: true
    });

    this.isInitialized = true;
    console.log(`[Analytics] ✅ GA4 initialized with ID: ${this.gaId}`);
  }

  /**
   * Track custom events
   */
  public trackEvent(event: AnalyticsEvent): void {
    if (typeof window === 'undefined' || !this.isInitialized) {
      console.warn('[Analytics] Not initialized or running on server');
      return;
    }

    const gtagEvent: any = {
      event_category: event.event_category || 'engagement',
      event_label: event.event_label,
      value: event.value
    };

    // Add custom parameters
    if (event.custom_parameters) {
      Object.assign(gtagEvent, event.custom_parameters);
    }

    window.gtag('event', event.event_name, gtagEvent);
    console.log(`[Analytics] 📊 Event tracked: ${event.event_name}`, gtagEvent);
  }

  /**
   * Track conversion events
   */
  public trackConversion(event: ConversionEvent): void {
    if (typeof window === 'undefined' || !this.isInitialized) {
      console.warn('[Analytics] Not initialized or running on server');
      return;
    }

    const conversionEvent: any = {
      event_category: 'conversion',
      event_label: event.conversion_type,
      value: event.conversion_value || 0,
      currency: event.currency || 'USD'
    };

    // Add custom parameters
    if (event.custom_parameters) {
      Object.assign(conversionEvent, event.custom_parameters);
    }

    window.gtag('event', 'conversion', conversionEvent);
    console.log(`[Analytics] 💰 Conversion tracked: ${event.conversion_type}`, conversionEvent);
  }

  /**
   * Track page views
   */
  public trackPageView(pagePath?: string, pageTitle?: string): void {
    if (typeof window === 'undefined' || !this.isInitialized) {
      console.warn('[Analytics] Not initialized or running on server');
      return;
    }

    window.gtag('config', this.gaId!, {
      page_path: pagePath || window.location.pathname,
      page_title: pageTitle || document.title
    });

    console.log(`[Analytics] 📄 Page view tracked: ${pagePath || window.location.pathname}`);
  }

  /**
   * Track errors
   */
  public trackError(error: ErrorEvent): void {
    if (typeof window === 'undefined' || !this.isInitialized) {
      console.warn('[Analytics] Not initialized or running on server');
      return;
    }

    const errorEvent: any = {
      event_category: 'error',
      event_label: error.error_type,
      custom_parameters: {
        error_message: error.error_message,
        error_stack: error.error_stack,
        component: error.component,
        user_action: error.user_action
      }
    };

    window.gtag('event', 'exception', errorEvent);
    console.error(`[Analytics] ❌ Error tracked: ${error.error_type}`, errorEvent);
  }

  /**
   * Track performance metrics
   */
  public trackPerformance(metric: string, value: number, unit: string = 'ms'): void {
    if (typeof window === 'undefined' || !this.isInitialized) {
      console.warn('[Analytics] Not initialized or running on server');
      return;
    }

    window.gtag('event', 'timing_complete', {
      name: metric,
      value: value,
      event_category: 'performance',
      event_label: unit
    });

    console.log(`[Analytics] ⚡ Performance tracked: ${metric} = ${value}${unit}`);
  }

  /**
   * Track user engagement
   */
  public trackEngagement(action: string, component: string, details?: Record<string, any>): void {
    this.trackEvent({
      event_name: 'engagement',
      event_category: 'user_interaction',
      event_label: `${component}:${action}`,
      custom_parameters: details
    });
  }

  /**
   * Track AI agent interactions
   */
  public trackAIAgent(agent: string, action: string, efficiency?: number): void {
    this.trackEvent({
      event_name: 'ai_agent_interaction',
      event_category: 'ai_system',
      event_label: `${agent}:${action}`,
      custom_parameters: {
        agent_name: agent,
        action_type: action,
        efficiency_score: efficiency
      }
    });
  }

  /**
   * Track Flow Constant metrics
   */
  public trackFlowConstant(lambda: number, resonance: string, alignment: number): void {
    this.trackEvent({
      event_name: 'flow_constant_update',
      event_category: 'ai_system',
      event_label: 'flow_constant_λ∞',
      custom_parameters: {
        lambda_value: lambda,
        resonance_level: resonance,
        alignment_percentage: alignment
      }
    });
  }

  /**
   * Get analytics status
   */
  public getStatus(): { initialized: boolean; gaId: string | null; hasGtag: boolean } {
    return {
      initialized: this.isInitialized,
      gaId: this.gaId,
      hasGtag: typeof window !== 'undefined' && typeof window.gtag === 'function'
    };
  }
}

// Export singleton instance
export const analytics = AnalyticsService.getInstance();

// Export convenience functions
export const trackEvent = (event: AnalyticsEvent) => analytics.trackEvent(event);
export const trackConversion = (event: ConversionEvent) => analytics.trackConversion(event);
export const trackPageView = (pagePath?: string, pageTitle?: string) => analytics.trackPageView(pagePath, pageTitle);
export const trackError = (error: ErrorEvent) => analytics.trackError(error);
export const trackPerformance = (metric: string, value: number, unit?: string) => analytics.trackPerformance(metric, value, unit);
export const trackEngagement = (action: string, component: string, details?: Record<string, any>) => analytics.trackEngagement(action, component, details);
export const trackAIAgent = (agent: string, action: string, efficiency?: number) => analytics.trackAIAgent(agent, action, efficiency);
export const trackFlowConstant = (lambda: number, resonance: string, alignment: number) => analytics.trackFlowConstant(lambda, resonance, alignment);

export default analytics;
