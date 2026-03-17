"use client";

import React from 'react';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import GlobalNavigation from '../../../components/GlobalNavigation';

export default function AnalyticsGuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation />
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/docs"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Docs
        </Link>
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-green-500/20 rounded-lg">
            <BarChart3 className="w-8 h-8 text-green-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Analytics Guide</h1>
            <p className="text-zinc-400">Understanding your data and metrics</p>
          </div>
        </div>
        <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800">
          <p className="text-zinc-400 mb-4">
            Content coming soon. The Analytics Guide will cover session metrics, revenue tracking,
            table utilization, and performance dashboards.
          </p>
          <Link
            href="/analytics"
            className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300"
          >
            View Analytics Dashboard →
          </Link>
        </div>
      </div>
    </div>
  );
}
