'use client';

import React from 'react';
import Link from 'next/link';
import { Flame, ArrowLeft, Mail } from 'lucide-react';

export default function CodigoAccessExpiredPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl mb-6 inline-block">
          <Flame className="w-16 h-16 text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">CODIGO access has expired</h1>
        <p className="text-zinc-400 mb-8">
          Your access window for this CODIGO instance has ended. If you need more time or want continued access, please contact support or request an extension.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="mailto:support@hookahplus.com?subject=CODIGO%20Access%20Extension%20Request"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-medium transition-colors"
          >
            <Mail className="w-4 h-4" />
            Request extension
          </a>
          <Link
            href="/fire-session-dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
