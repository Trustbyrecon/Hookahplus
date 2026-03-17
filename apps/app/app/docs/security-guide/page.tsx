"use client";

import React from 'react';
import { ArrowLeft, Shield } from 'lucide-react';
import Link from 'next/link';
import GlobalNavigation from '../../../components/GlobalNavigation';

export default function SecurityGuidePage() {
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
          <div className="p-3 bg-blue-500/20 rounded-lg">
            <Shield className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Security Guide</h1>
            <p className="text-zinc-400">Best practices for security</p>
          </div>
        </div>
        <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800">
          <p className="text-zinc-400 mb-4">
            Content coming soon. The Security Guide will cover authentication, role-based access,
            payment security (PCI compliance), and data protection best practices.
          </p>
          <p className="text-sm text-zinc-500">
            See the project root <code className="px-1 py-0.5 bg-zinc-800 rounded">SECURITY.md</code> for
            vulnerability reporting and security overview.
          </p>
        </div>
      </div>
    </div>
  );
}
