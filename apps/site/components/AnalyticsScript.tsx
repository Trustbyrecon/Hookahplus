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
    // Early return if no GA ID - prevents unnecessary work
    if (!gaId || typeof window === 'undefined') {
      return;
    }

    // Initialize analytics when component mounts
    if (gaId) {
      // Initialize dataLayer
      if (!window.dataLayer) {
        window.dataLayer = [];
      }
      
      // Define gtag function
      window.gtag = function() {
        window.dataLayer!.push(arguments);
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
    // Silently skip analytics if GA_ID is not configured (development mode)
    // Only log in development to reduce console noise
    if (process.env.NODE_ENV === 'development') {
      console.debug('[Analytics] NEXT_PUBLIC_GA_ID not found - analytics disabled');
    }
    return null;
  }

  // Get IDs from environment variables (set these in Vercel)
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const linkedInInsightTagId = process.env.NEXT_PUBLIC_LINKEDIN_INSIGHT_TAG_ID;

  return (
    <>
      {/* Google Analytics */}
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

      {/* Meta Pixel (Facebook Pixel) */}
      {metaPixelId && (
        <>
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${metaPixelId}');
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}

      {/* LinkedIn Insight Tag */}
      {linkedInInsightTagId && (
        <Script id="linkedin-insight" strategy="afterInteractive">
          {`
            _linkedin_partner_id = "${linkedInInsightTagId}";
            window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
            window._linkedin_data_partner_ids.push(_linkedin_partner_id);
            (function(l) {
              if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
              window.lintrk.q=[]}
              var s = document.getElementsByTagName("script")[0];
              var b = document.createElement("script");
              b.type = "text/javascript";b.async = true;
              b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
              s.parentNode.insertBefore(b, s);
            })(window.lintrk);
          `}
        </Script>
      )}
    </>
  );
}
