"use client";

import React from 'react';
import { ArrowLeft, BookOpen, FileText } from 'lucide-react';
import Link from 'next/link';
import GlobalNavigation from '../../../components/GlobalNavigation';

export default function UserManualPage() {
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
          <div className="p-3 bg-teal-500/20 rounded-lg">
            <BookOpen className="w-8 h-8 text-teal-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">User Manual</h1>
            <p className="text-zinc-400">Complete guide to using HookahPLUS</p>
          </div>
        </div>
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800">
            <h2 className="text-lg font-semibold text-white mb-4">Quick Links</h2>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/docs/getting-started/quick-start"
                  className="flex items-center gap-2 text-teal-400 hover:text-teal-300"
                >
                  <FileText className="w-4 h-4" />
                  Quick Start Guide
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/getting-started/first-session"
                  className="flex items-center gap-2 text-teal-400 hover:text-teal-300"
                >
                  <FileText className="w-4 h-4" />
                  First Session
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/getting-started/user-roles"
                  className="flex items-center gap-2 text-teal-400 hover:text-teal-300"
                >
                  <FileText className="w-4 h-4" />
                  User Roles
                </Link>
              </li>
            </ul>
          </div>
          <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800">
            <p className="text-zinc-400">
              The full User Manual consolidates key documentation for operators and staff.
              Content is being expanded. Use the quick links above for getting started.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
