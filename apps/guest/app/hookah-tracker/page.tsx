'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { HookahTracker } from '../../components/HookahTracker';

export default function HookahTrackerPage() {
  const searchParams = useSearchParams();
  const [sessionId, setSessionId] = useState('session_demo');
  const [loungeId, setLoungeId] = useState('lounge_001');
  const [tableId, setTableId] = useState('T-001');

  useEffect(() => {
    // Get URL parameters on client side only
    setSessionId(searchParams.get('sessionId') || 'session_demo');
    setLoungeId(searchParams.get('loungeId') || 'lounge_001');
    setTableId(searchParams.get('tableId') || 'T-001');
  }, [searchParams]);

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
