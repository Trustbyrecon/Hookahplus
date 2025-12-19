'use client';

import React from 'react';
import Button from './Button';
import { Calendar } from 'lucide-react';
import { trackDemoRequest } from '../lib/ctaTracking';

// Use Instagram's ig.me short link to open a DM with @hookahplusnet.
// This is generally more reliable across devices than the /direct/t/username pattern.
const INSTAGRAM_DEMO_URL = 'https://ig.me/m/hookahplusnet';

export default function StickyCTA() {
  const handleClick = () => {
    trackDemoRequest('StickyCTA', { action: 'click_instagram_session_engine_demo' });

    if (typeof window !== 'undefined') {
      window.open(INSTAGRAM_DEMO_URL, '_blank');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        variant="primary"
        size="lg"
        aria-label="Get a 15-minute HookahPlus Session Engine demo on Instagram"
        className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-6 py-4 text-base font-semibold shadow-lg shadow-teal-500/30 rounded-full flex items-center gap-2 animate-pulse hover:animate-none"
        onClick={handleClick}
      >
        <Calendar className="w-5 h-5" />
        Get a 15-min Session Engine demo
      </Button>
    </div>
  );
}

