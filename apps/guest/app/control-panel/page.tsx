'use client';

import React, { Suspense } from 'react';
import GuestControlPanel from '../../components/GuestControlPanel';

export default function ControlPanelPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading...</p>
        </div>
      </div>
    }>
      <GuestControlPanel />
    </Suspense>
  );
}
