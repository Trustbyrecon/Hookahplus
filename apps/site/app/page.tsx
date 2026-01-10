'use client';

// WHY-first homepage - optimized for AI agents, search, and LLM retrieval
// Build timestamp: 2025-01-XX
import React from 'react';
import Script from 'next/script';
import WhyFirstHero from '../components/WhyFirstHero';
import ProblemSection from '../components/ProblemSection';
import SolutionSection from '../components/SolutionSection';
import OperationalMirrorSection from '../components/OperationalMirrorSection';
import HowItWorksSection from '../components/HowItWorksSection';
import WhatItIsSection from '../components/WhatItIsSection';
import FeatureGridSection from '../components/FeatureGridSection';
import ComparisonSection from '../components/ComparisonSection';
import FAQSection from '../components/FAQSection';
import FinalCTASection from '../components/FinalCTASection';
import { SoftwareApplicationSchema } from '../components/SchemaMarkup';

export default function Home() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hookahplus.net';

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Hookah+",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "description": "Session-based hookah lounge management software that remembers guests, tracks sessions, and powers loyalty above Square, Clover, and Toast.",
    "brand": {
      "@type": "Brand",
      "name": "Hookah+"
    },
    "offers": {
      "@type": "Offer",
      "price": "0.00",
      "priceCurrency": "USD",
      "description": "Pilot pricing varies by lounge. Request demo for current plans."
    },
    "url": siteUrl,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "12"
    }
  };

  return (
    <>
      <Script
        id="software-application-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
        {/* Section 1: Hero (WHY-first) */}
        <WhyFirstHero />

        {/* Section 2: Problem (WHY Context) */}
        <ProblemSection />

        {/* Section 3: Solution (HOW) */}
        <SolutionSection />

        {/* Section 3.5: Operational Mirror (NON-SELLING SALES) */}
        <OperationalMirrorSection />

        {/* Section 4: How It Works (PROOF) */}
        <HowItWorksSection />

        {/* Section 5: What It Is (EXPLICIT CATEGORY LOCK) */}
        <WhatItIsSection />

        {/* Section 6: Feature Grid (SCAN + COMPARISON) */}
        <FeatureGridSection />

        {/* Section 7: Comparison (HIGH-INTENT SEO) */}
        <ComparisonSection />

        {/* Section 8: FAQ (AI ANSWER ENGINE) */}
        <FAQSection />

        {/* Section 9: Final CTA (WHY REINFORCED) */}
        <FinalCTASection />
      </div>
    </>
  );
}
