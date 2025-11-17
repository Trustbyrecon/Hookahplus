'use client';

// Site build deployment trigger - updated for proper Vercel alignment
// Build timestamp: 2025-10-16T17:20:00Z
// Campaign Pre-Orders deployment trigger - 2025-10-16T19:15:00Z
// Signal Optimization Update - 2025-01-XX
import React from 'react';
import Hero from '../components/Hero';
import PricingTeaser from '../components/PricingTeaser';
import ROICalculator from '../components/ROICalculator';
import Demo from '../components/Demo';
import DataOptimization from '../components/DataOptimization';
import ProofSection from '../components/ProofSection';
import StickyCTA from '../components/StickyCTA';
import ExitIntentPopup from '../components/ExitIntentPopup';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Hero Section - Above the Fold */}
      <Hero />

      {/* Demo Section with Flow Visualization */}
      <Demo />

      {/* Data Optimization Section */}
      <DataOptimization />

      {/* Pricing Teaser */}
      <PricingTeaser />

      {/* ROI Calculator */}
      <ROICalculator />

      {/* Proof & Social Signals */}
      <ProofSection />

      {/* Sticky CTA */}
      <StickyCTA />

      {/* Exit Intent Popup */}
      <ExitIntentPopup />
    </div>
  );
}
