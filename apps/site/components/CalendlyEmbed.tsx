'use client';

import React, { useEffect, useRef } from 'react';
import { Calendar } from 'lucide-react';

interface CalendlyEmbedProps {
  url?: string;
  className?: string;
}

export default function CalendlyEmbed({ url, className = '' }: CalendlyEmbedProps) {
  const calendlyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Calendly widget script only if it doesn't already exist
    const scriptUrl = 'https://assets.calendly.com/assets/external/widget.js';
    let existingScript = document.querySelector(`script[src="${scriptUrl}"]`);
    
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = scriptUrl;
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // If no URL provided, show placeholder with contact link
  if (!url) {
    return (
      <div className={`rounded-xl overflow-hidden border border-zinc-700 bg-zinc-900 ${className}`}>
        <div className="w-full h-full min-h-[600px] flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-800">
          <div className="text-center p-8">
            <Calendar className="w-16 h-16 text-teal-400 mx-auto mb-4" />
            <h4 className="text-xl font-semibold text-white mb-2">Schedule Your Demo</h4>
            <p className="text-zinc-400 mb-6 max-w-md">
              Book a 15-minute walkthrough to see how Hookah+ can transform your operations.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
            >
              Contact Us to Schedule
              <Calendar className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Extract Calendly URL path (remove query parameters for widget)
  // URL format: https://calendly.com/username/event-type?params
  const urlObj = new URL(url);
  const calendlyUrl = `${urlObj.origin}${urlObj.pathname}`;

  return (
    <div className={`rounded-xl overflow-hidden border border-zinc-700 bg-zinc-900 ${className}`}>
      <div
        ref={calendlyRef}
        className="calendly-inline-widget w-full min-h-[600px]"
        data-url={calendlyUrl}
        style={{ minWidth: '320px', height: '600px' }}
      />
    </div>
  );
}

