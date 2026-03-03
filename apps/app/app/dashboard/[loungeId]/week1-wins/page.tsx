'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, TrendingUp, Clock, Users, DollarSign, CheckCircle } from 'lucide-react';
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

export default function WeekOneWinsPage() {
  const params = useParams();
  const loungeId = params.loungeId as string;
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
        console.error('[Week-1 Wins Page] Error:', error);
      } finally {
        setLoading(false);
      }
    }

    if (loungeId) {
      fetchMetrics();
    }
  }, [loungeId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-zinc-800 rounded w-1/4 mb-8"></div>
            <div className="h-64 bg-zinc-900 rounded-lg mb-6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-zinc-950 p-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href={`/dashboard/${loungeId}`}
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-8 text-center">
            <p className="text-zinc-400">Week-1 Wins metrics not available yet.</p>
          </div>
        </div>
      </div>
    );
  }

  const progress = Math.min((metrics.daysActive / 7) * 100, 100);
  const isComplete = metrics.daysActive >= 7;

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/dashboard/${loungeId}`}
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Week-1 Wins Tracker</h1>
          <p className="text-zinc-400">
            Track your ROI in the first 7 days with H+
          </p>
        </div>

        {/* Progress Overview */}
        <div className="bg-gradient-to-br from-teal-900/20 to-emerald-900/20 border border-teal-600/50 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">
                {isComplete ? 'Week Complete! 🎉' : `Day ${metrics.daysActive} of 7`}
              </h2>
              <p className="text-sm text-zinc-400">
                {isComplete
                  ? 'You\'ve completed your first week with H+'
                  : `${7 - metrics.daysActive} days remaining`}
              </p>
            </div>
            {isComplete && (
              <CheckCircle className="w-8 h-8 text-teal-400" />
            )}
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-3 mb-2">
            <div
              className="bg-teal-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-zinc-500">
            {Math.round(progress)}% complete
          </p>
        </div>

        {/* Total Wins Score */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Total Wins Score
              </h3>
              <p className="text-sm text-zinc-400">
                Combined value of all wins
              </p>
            </div>
            <div className="text-4xl font-bold text-teal-400">
              {metrics.totalWins}
            </div>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Comped Sessions Avoided */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-teal-900/40 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-teal-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Comped Sessions Avoided
                </h3>
                <p className="text-sm text-zinc-400">
                  Sessions protected by comp policy
                </p>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {metrics.compedSessionsAvoided}
            </div>
            <p className="text-xs text-zinc-500">
              Estimated value: ${metrics.compedSessionsAvoided * 10}
            </p>
          </div>

          {/* Add-ons Captured */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-emerald-900/40 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Add-ons Captured
                </h3>
                <p className="text-sm text-zinc-400">
                  Extra items tracked in sessions
                </p>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {metrics.addOnsCaptured}
            </div>
            <p className="text-xs text-zinc-500">
              Estimated value: ${metrics.addOnsCaptured * 5}
            </p>
          </div>

          {/* Repeat Guests Recognized */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-900/40 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Repeat Guests Recognized
                </h3>
                <p className="text-sm text-zinc-400">
                  Customers with 2+ sessions
                </p>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {metrics.repeatGuestsRecognized}
            </div>
            <p className="text-xs text-zinc-500">
              Building customer loyalty
            </p>
          </div>

          {/* Time Saved Per Shift */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-900/40 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Time Saved Per Shift
                </h3>
                <p className="text-sm text-zinc-400">
                  Minutes saved on average
                </p>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {metrics.timeSavedPerShift}m
            </div>
            <p className="text-xs text-zinc-500">
              Faster checkout & handoff
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Summary</h3>
          <div className="space-y-2 text-sm text-zinc-400">
            <p>
              • <strong className="text-white">{metrics.compedSessionsAvoided}</strong> comped sessions avoided
            </p>
            <p>
              • <strong className="text-white">{metrics.addOnsCaptured}</strong> add-ons captured
            </p>
            <p>
              • <strong className="text-white">{metrics.repeatGuestsRecognized}</strong> repeat guests recognized
            </p>
            <p>
              • <strong className="text-white">{metrics.timeSavedPerShift} minutes</strong> saved per shift on average
            </p>
          </div>
          {!isComplete && (
            <div className="mt-4 p-4 bg-teal-900/20 border border-teal-600/50 rounded-lg">
              <p className="text-sm text-teal-200">
                Keep going! Complete your first week to see your full Week-1 Wins report.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

