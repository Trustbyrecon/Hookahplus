import React from 'react';
import ReflexCard from '../components/ReflexCard';
import WhisperTrigger from '../components/WhisperTrigger';

export default function Home() {
  const cards = [
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
      cta: 'Join Live Session',
      href: '/live',
    },
  ];

  return (
    <main className="p-8 flex flex-col items-center space-y-8 font-sans">
      <h1 className="text-3xl font-display">Welcome to Hookah+</h1>
      <p className="mt-2 text-center max-w-xl font-sans">
        Your command center for flavor, flow, and loyalty intelligence.
      </p>
      <div className="grid gap-6 md:grid-cols-3">
        {cards.map((card) => (
          <ReflexCard key={card.href} {...card} />
        ))}
      </div>
      <WhisperTrigger />
    </main>
  );
}
