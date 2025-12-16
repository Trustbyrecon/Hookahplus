'use client';

import React, { useState, useEffect } from 'react';
import Button from './Button';
import CalendlyEmbed from './CalendlyEmbed';
import { Calendar, X } from 'lucide-react';
import { trackDemoRequest } from '../lib/ctaTracking';

export default function StickyCTA() {
  const [showCalendly, setShowCalendly] = useState(false);

  return (
    <>
      {/* Sticky CTA Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          variant="primary"
          size="lg"
          className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-6 py-4 text-base font-semibold shadow-lg shadow-teal-500/30 rounded-full flex items-center gap-2 animate-pulse hover:animate-none"
          onClick={() => {
            trackDemoRequest('StickyCTA', { action: 'open_calendly_modal' });
            setShowCalendly(true);
          }}
        >
          <Calendar className="w-5 h-5" />
          Book 15-min Demo via Calendly
        </Button>
      </div>

      {/* Calendly Modal */}
      {showCalendly && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-zinc-700 relative">
            <button
              onClick={() => setShowCalendly(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Schedule Your Demo</h2>
              <CalendlyEmbed url="https://calendly.com/clark-dwayne/new-meeting?embed_domain=hookahplus.net&embed_type=Inline" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

