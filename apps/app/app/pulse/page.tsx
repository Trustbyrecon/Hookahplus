'use client';

import React, { useState } from 'react';
import GlobalNavigation from '../../components/GlobalNavigation';
import PulseCard from '../../components/PulseCard';
import Breadcrumbs from '../../components/Breadcrumbs';
import PageHero from '../../components/PageHero';
import { Clock, TrendingUp } from 'lucide-react';

export default function PulsePage() {
  const [selectedWindow, setSelectedWindow] = useState<'24h' | 'pm'>('24h');

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: 'Dashboard', href: '/fire-session-dashboard' },
            { label: 'Daily Pulse', href: '/pulse' },
          ]}
        />

        <PageHero
          headline="Daily Pulse Briefings"
          subheadline="Real-time insights into your lounge operations and performance"
          benefit={{
            value: "Morning & 3PM briefings",
            description: "Get comprehensive summaries of session activity, revenue, and operational insights"
          }}
          trustIndicators={[
            { icon: <Clock className="w-4 h-4 text-teal-400" />, text: "Updated every 5 minutes" },
            { icon: <TrendingUp className="w-4 h-4 text-teal-400" />, text: "Data-driven insights" },
          ]}
        />

        <div className="mt-8 space-y-6">
          {/* Window Toggle */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setSelectedWindow('24h')}
              className={`px-6 py-3 rounded-lg border transition-colors ${
                selectedWindow === '24h'
                  ? 'bg-teal-500/20 border-teal-500/50 text-teal-300'
                  : 'bg-zinc-800/30 border-zinc-700 text-zinc-400 hover:border-zinc-600'
              }`}
            >
              Morning Briefing (24h)
            </button>
            <button
              onClick={() => setSelectedWindow('pm')}
              className={`px-6 py-3 rounded-lg border transition-colors ${
                selectedWindow === 'pm'
                  ? 'bg-teal-500/20 border-teal-500/50 text-teal-300'
                  : 'bg-zinc-800/30 border-zinc-700 text-zinc-400 hover:border-zinc-600'
              }`}
            >
              3PM Briefing (12h)
            </button>
          </div>

          {/* Pulse Card */}
          <PulseCard 
            compact={false}
            window={selectedWindow}
            autoRefresh={true}
          />

          {/* Historical Pulses Section (Future Enhancement) */}
          <div className="mt-8 p-6 bg-zinc-800/30 rounded-lg border border-zinc-700">
            <h3 className="text-lg font-semibold text-zinc-300 mb-2">Historical View</h3>
            <p className="text-sm text-zinc-400">
              Historical pulse data (last 7 days) will be available in a future update.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

