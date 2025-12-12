'use client';

// Site build deployment trigger - updated for proper Vercel alignment
// Build timestamp: 2025-10-16T17:20:00Z
// Campaign Pre-Orders deployment trigger - 2025-10-16T19:15:00Z
// Signal Optimization Update - 2025-01-XX
import React from 'react';
import Hero from '../components/Hero';
import WhatHookahDoes from '../components/WhatHookahDoes';
import ProblemsWeSolve from '../components/ProblemsWeSolve';
import Demo from '../components/Demo';
import ResultsSection from '../components/ResultsSection';
import PricingTeaser from '../components/PricingTeaser';
import ROICalculator from '../components/ROICalculator';
import ProofSection from '../components/ProofSection';
import StickyCTA from '../components/StickyCTA';
import ExitIntentPopup from '../components/ExitIntentPopup';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Section 1: Hero */}
      <Hero />

      {/* Section 2: What Hookah+ Does (3 Pillars) */}
      <div id="what-hookah-does">
        <WhatHookahDoes />
      </div>

      {/* Section 3: Problems We Solve */}
      <ProblemsWeSolve />

      {/* Section 4: How It Works (Night After Night) */}
      <Demo />

      {/* Section 5: Results Section */}
      <ResultsSection />

      {/* Section 6: Pricing Overview */}
      <PricingTeaser />

      {/* ROI Calculator (for anchor links) */}
      <div id="roi-calculator">
      <ROICalculator />
      </div>

      {/* Proof & Social Signals */}
      <ProofSection />

      {/* Sticky CTA */}
      <StickyCTA />

      {/* Exit Intent Popup */}
      <ExitIntentPopup />
    </div>
  );
}
