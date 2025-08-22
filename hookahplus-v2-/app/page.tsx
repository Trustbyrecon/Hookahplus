
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

function useReflexAgent(routeName: string) {
  useEffect(() => {
    const agentId = `reflex-${routeName.toLowerCase()}`;
    const trustLevel = localStorage.getItem("trust_tier") || "Tier I";
    const sessionContext = {
      timestamp: Date.now(),
      returning: localStorage.getItem("user_visited_before") === "true",
    };

    console.log(`[ReflexAgent] ${agentId} loaded`, {
      trustLevel,
      sessionContext,
    });

    // Simulated reflex log and bloom trigger
    window.dispatchEvent(new CustomEvent("reflex-agent-log", {
      detail: { agentId, trustLevel, routeName, sessionContext },
    }));

    localStorage.setItem("user_visited_before", "true");
  }, [routeName]);
}

export default function Home() {
  useReflexAgent("Home");
  const [videoLoaded, setVideoLoaded] = useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="text-6xl md:text-7xl font-bold mb-6">
          Hookah<span className="text-teal-400">+</span>
        </h1>
        <p className="text-xl md:text-2xl text-center mb-8 max-w-3xl text-zinc-300">
          Experience the future of lounge sessions with AI-powered personalization, 
          secure payments, and seamless ordering.
        </p>
        
        {/* Main CTA - "Start preorders" */}
        <div className="mb-12">
          <Link href="/preorder/T-001">
            <button 
              className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-full text-xl shadow-2xl hover:shadow-teal-500/25 transition-all transform hover:scale-105"
              onClick={() => {
                if (typeof window !== 'undefined' && (window as any).gtag) {
                  (window as any).gtag('event', 'Hero_StartPreorders', {
                    event_category: 'Navigation',
                    event_label: 'T-001',
                  });
                }
              }}
            >
              🚀 Start Preorders
            </button>
          </Link>
          <p className="text-zinc-400 text-sm mt-3">QR scan → Menu browse → Flavor personalize → Pay securely</p>
        </div>

        {/* Secondary CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Link href="/demo">
            <button 
              className="bg-zinc-700 hover:bg-zinc-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              onClick={() => {
                if (typeof window !== 'undefined' && (window as any).gtag) {
                  (window as any).gtag('event', 'Hero_ViewDemo', {
                    event_category: 'Navigation',
                    event_label: 'Demo',
                  });
                }
              }}
            >
              🎬 See Demo
            </button>
          </Link>
          <Link href="/onboarding#waitlist">
            <button 
              className="bg-zinc-700 hover:bg-zinc-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              onClick={() => {
                if (typeof window !== 'undefined' && (window as any).gtag) {
                  (window as any).gtag('event', 'Hero_ViewDemo', {
                    event_category: 'Navigation',
                    event_label: 'Waitlist',
                  });
                }
              }}
            >
              📋 POS Waitlist
            </button>
          </Link>
        </div>

        {/* Trust Lock Display */}
        <div className="mb-8 p-4 border border-teal-500 rounded-lg bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <span className="text-green-400">🔒</span>
            <span className="text-teal-200">Trust-Lock: TLH-v1::active</span>
          </div>
        </div>
      </div>

      {/* Demo Video Section */}
      <div className="px-4 py-12 bg-zinc-900/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-teal-300">See Hookah+ in Action</h2>
          <div className="relative aspect-video bg-zinc-800 rounded-2xl overflow-hidden">
            {!videoLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎬</div>
                  <div className="text-zinc-400">Demo Video Loading...</div>
                </div>
              </div>
            )}
            <iframe
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0&rel=0"
              title="Hookah+ Demo"
              className="w-full h-full"
              onLoad={() => setVideoLoaded(true)}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-teal-300">Powered by Reflex Intelligence</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-zinc-900 border border-teal-500 rounded-xl">
              <div className="text-4xl mb-4">🧠</div>
              <h3 className="text-xl font-semibold mb-3 text-teal-300">Aliethia Memory</h3>
              <p className="text-zinc-400">Learns your flavor preferences and suggests perfect pairings</p>
            </div>
            <div className="text-center p-6 bg-zinc-900 border border-teal-500 rounded-xl">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-3 text-teal-300">Sentinel Trust</h3>
              <p className="text-zinc-400">Cryptographic verification for every transaction</p>
            </div>
            <div className="text-center p-6 bg-zinc-900 border border-teal-500 rounded-xl">
              <div className="text-4xl mb-4">💳</div>
              <h3 className="text-xl font-semibold mb-3 text-teal-300">EP Payments</h3>
              <p className="text-zinc-400">Secure Stripe integration with real-time processing</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-teal-300">Quick Access</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/dashboard">
              <div className="bg-zinc-900 border border-teal-500 rounded-lg p-4 text-center hover:bg-teal-900/20 transition-colors">
                <div className="text-2xl mb-2">📊</div>
                <div className="text-sm">Dashboard</div>
              </div>
            </Link>
            <Link href="/pre-order">
              <div className="bg-zinc-900 border border-teal-500 rounded-lg p-4 text-center hover:bg-teal-900/20 transition-colors">
                <div className="text-2xl mb-2">📱</div>
                <div className="text-sm">Pre-Order</div>
              </div>
            </Link>
            <Link href="/checkout">
              <div className="bg-zinc-900 border border-teal-500 rounded-lg p-4 text-center hover:bg-teal-900/20 transition-colors">
                <div className="text-2xl mb-2">💳</div>
                <div className="text-sm">Checkout</div>
              </div>
            </Link>
            <Link href="/admin">
              <div className="bg-zinc-900 border border-teal-500 rounded-lg p-4 text-center hover:bg-teal-900/20 transition-colors">
                <div className="text-2xl mb-2">⚙️</div>
                <div className="text-sm">Admin</div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Reflex Agent Status Footer */}
      <div className="px-4 py-8 border-t border-teal-500 bg-zinc-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-teal-200 mb-2">🌀 Reflex Agent Monitoring — Cycle 09 Consensus Achieved</p>
          <div className="flex justify-center gap-4 text-sm text-zinc-400">
            <span>Aliethia: 0.87 ✅</span>
            <span>EP: 0.82 ✅</span>
            <span>Session Agent: 0.90 ✅</span>
            <span>Demo Agent: 0.78 🚧</span>
          </div>
        </div>
      </div>
    </main>
  );
}
