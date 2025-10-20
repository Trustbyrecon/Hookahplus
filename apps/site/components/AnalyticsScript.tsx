'use client';

import { useEffect } from 'react';
import Script from 'next/script';

/**
 * Analytics Script Component for Site
 * Handles GA4 initialization and marketing/support tracking
 */
export default function AnalyticsScript() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  useEffect(() => {
    // Initialize analytics when component mounts
    if (typeof window !== 'undefined' && gaId) {
      // Initialize dataLayer
      window.dataLayer = window.dataLayer || [];
      
      // Define gtag function
      window.gtag = function() {
        window.dataLayer.push(arguments);
      };

      // Configure GA4
      window.gtag('js', new Date());
      window.gtag('config', gaId, {
        page_title: document.title,
        page_location: window.location.href,
        send_page_view: true
      });

      console.log(`[Analytics] ✅ GA4 initialized for Site with ID: ${gaId}`);

      // Track page view
      window.gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname
      });

      // Track site-specific events
      window.gtag('event', 'app_loaded', {
        event_category: 'engagement',
        event_label: 'marketing_site',
        app_type: 'site'
      });

      // Track navigation interactions
      window.gtag('event', 'navigation_interaction', {
        event_category: 'user_engagement',
        event_label: 'site_navigation',
        flow_constant_active: true
      });
    }

    // Global error handler
    const handleError = (event: ErrorEvent) => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'exception', {
          description: event.message,
          fatal: false,
          event_category: 'error',
          event_label: 'javascript_error',
          app_type: 'site'
        });
      }
    };

    // Global unhandled promise rejection handler
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'exception', {
          description: event.reason?.toString() || 'Unhandled promise rejection',
          fatal: false,
          event_category: 'error',
          event_label: 'promise_rejection',
          app_type: 'site'
        });
      }
    };

    // Add event listeners
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [gaId]);

  if (!gaId) {
    console.warn('[Analytics] NEXT_PUBLIC_GA_ID not found in environment variables');
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', {
            page_title: document.title,
            page_location: window.location.href,
            send_page_view: true
          });
        `}
      </Script>
    </>
  );
}
