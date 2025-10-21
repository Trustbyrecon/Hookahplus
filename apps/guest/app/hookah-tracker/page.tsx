'use client';

import React from 'react';
import { HookahTracker } from '../../components/HookahTracker';

export default function HookahTrackerPage() {
  // Get URL parameters
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const sessionId = searchParams.get('sessionId') || 'session_demo';
  const loungeId = searchParams.get('loungeId') || 'lounge_001';
  const tableId = searchParams.get('tableId') || 'T-001';

  const handleTrackerComplete = () => {
    // When tracking is complete, redirect to App build FSM/FSD
    const appBuildUrl = `https://hookahplus-app-prod.vercel.app/fire-session-dashboard?session=${sessionId}&table=${tableId}&lounge=${loungeId}`;
    window.open(appBuildUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black">
      <HookahTracker
        sessionId={sessionId}
        loungeId={loungeId}
        tableId={tableId}
        onComplete={handleTrackerComplete}
      />
    </div>
  );
}
