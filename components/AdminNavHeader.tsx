// components/AdminNavHeader.tsx
"use client";

import Link from 'next/link';

export default function AdminNavHeader() {
  return (
    <div className="bg-zinc-900 border-b border-purple-500/30 px-4 py-2">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard" 
            className="text-zinc-300 hover:text-white transition-colors"
          >
            🏠 Dashboard
          </Link>
          <Link 
            href="/admin" 
            className="text-purple-400 hover:text-purple-300 transition-colors font-medium"
          >
            ⚙️ Admin Control
          </Link>
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <span className="text-green-400">🔒</span>
          <span>Trust-Lock: Active</span>
        </div>
      </div>
    </div>
  );
}
