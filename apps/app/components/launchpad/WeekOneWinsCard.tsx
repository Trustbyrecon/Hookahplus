'use client';

import React, { useEffect, useState } from 'react';
import { TrendingUp, Clock, Users, DollarSign, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface WeekOneWinsMetrics {
  daysActive: number;
  compedSessionsAvoided: number;
  addOnsCaptured: number;
  repeatGuestsRecognized: number;
  timeSavedPerShift: number;
  totalWins: number;
  startDate: string;
  endDate: string;
}

interface WeekOneWinsCardProps {
  loungeId: string;
}

export function WeekOneWinsCard({ loungeId }: WeekOneWinsCardProps) {
  const [metrics, setMetrics] = useState<WeekOneWinsMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const response = await fetch(`/api/launchpad/week1-wins/${loungeId}`);
        if (response.ok) {
          const data = await response.json();
          setMetrics(data.metrics);
        }
      } catch (error) {
        console.error('[Week-1 Wins Card] Error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, [loungeId]);

  if (loading) {
    return (
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-zinc-800 rounded w-1/3 mb-4"></div>
          <div className="h-12 bg-zinc-800 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-zinc-800 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return null; // Don't show card if metrics aren't available
  }

  const progress = Math.min((metrics.daysActive / 7) * 100, 100);
  const isComplete = metrics.daysActive >= 7;

  return (
    <div className="bg-gradient-to-br from-teal-900/20 to-emerald-900/20 border border-teal-600/50 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">
            Week-1 Wins Tracker
          </h3>
          <p className="text-sm text-zinc-400">
            {metrics.daysActive} of 7 days active
          </p>
        </div>
        <TrendingUp className="w-5 h-5 text-teal-400" />
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-zinc-800 rounded-full h-2">
          <div
            className="bg-teal-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-xs text-zinc-500 mt-1">
          {isComplete ? 'Week complete! View full report →' : `${7 - metrics.daysActive} days remaining`}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-zinc-900/40 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-teal-400" />
            <span className="text-xs text-zinc-400">Comped Avoided</span>
          </div>
          <p className="text-xl font-bold text-white">
            {metrics.compedSessionsAvoided}
          </p>
        </div>

        <div className="bg-zinc-900/40 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-zinc-400">Add-ons</span>
          </div>
          <p className="text-xl font-bold text-white">
            {metrics.addOnsCaptured}
          </p>
        </div>

        <div className="bg-zinc-900/40 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-zinc-400">Repeat Guests</span>
          </div>
          <p className="text-xl font-bold text-white">
            {metrics.repeatGuestsRecognized}
          </p>
        </div>

        <div className="bg-zinc-900/40 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-zinc-400">Time Saved</span>
          </div>
          <p className="text-xl font-bold text-white">
            {metrics.timeSavedPerShift}m
          </p>
        </div>
      </div>

      {/* Total Wins Score */}
      <div className="bg-zinc-900/60 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-400">Total Wins Score</span>
          <span className="text-2xl font-bold text-teal-400">
            {metrics.totalWins}
          </span>
        </div>
      </div>

      {/* View Details Link */}
      <Link
        href={`/dashboard/${loungeId}/week1-wins`}
        className="flex items-center justify-center gap-2 w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        View Full Report
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

