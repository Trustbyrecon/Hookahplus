"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ReflexCard from '../components/ReflexCard';
import OnboardingModal from '../components/OnboardingModal';
import StickyNav from '../components/StickyNav';
import {
  WhisperTrigger,
  TrustArcDisplay,
  ReflexPromptModal,
  MemoryPulseTracker,
} from '../components/ReflexOverlay';
 codex/add-global-whisperlayer-ui-support
import WhisperOverlayEngine from '../components/WhisperOverlayEngine';

import SessionReplaySection from '../components/SessionReplaySection';
import WhisperCatch from '../components/WhisperCatch';
 main
import { sessionIgnition } from '../sessionIgnition';

declare const reflex:
  | { logEvent: (event: string, payload: Record<string, unknown>) => void }
  | undefined;

export default function Home() {
  const router = useRouter();
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    reflex?.logEvent('trust_load', {
      page: 'homepage',
      score: 8.9,
      timestamp: Date.now(),
    });
  }, []);

  const cards = [
    {
      title: 'Dashboard',
      description: 'Monitor operations and insights.',
      cta: 'View Dashboard',
      href: '/dashboard',
    },
    {
      title: 'Onboarding',
      description: 'Begin the journey and align your lounge.',
      cta: 'Start Onboarding',
      href: '/onboarding',
    },
    {
      title: 'Demo',
      description: 'Preview capabilities and flow.',
      cta: 'See a Demo',
      href: '/demo',
    },
    {
      title: 'Live Session',
      description: 'Engage with a real-time session.',
      cta: 'Initiate Live Session',
      onClick: () => setShowOverlay(true),
    },
  ];

  const handleSessionStart = () => {
    sessionIgnition(
      { live: true },
      { mix: true },
      { preview: true }
    );
    reflex?.logEvent('session_started', { timestamp: Date.now() });
    setShowOverlay(false);
    router.push('/live-session');
  };

  return (
    <>
      <StickyNav onStartSession={() => setShowOverlay(true)} />
      <WhisperOverlayEngine />
      <main className="min-h-screen bg-gradient-to-br from-charcoal via-deepMoss to-charcoal text-goldLumen px-6 py-12 font-sans">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl font-display font-extrabold tracking-tight">Hookah+</h1>
          <div className="mt-2 h-1 w-32 bg-mystic mx-auto rounded-full animate-pulse" />
          <p className="mt-4 text-xl text-goldLumen/90">Session Reimagined. Loyalty Reinforced.</p>
          <p className="mt-6 text-lg text-goldLumen/80">Navigate the experience portal: dashboard, onboarding, demo, and live session.</p>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {cards.map((card) => (
              <ReflexCard key={card.title} {...card} />
            ))}
          </div>
          <div className="mt-12 space-y-4">
            <WhisperTrigger />
            <ReflexPromptModal />
          </div>
        </div>
        <SessionReplaySection />
        {showOverlay && <OnboardingModal onComplete={handleSessionStart} />}
        <TrustArcDisplay score={8.9} />
        <MemoryPulseTracker />
        <WhisperCatch />
      </main>
    </>
  );
}
