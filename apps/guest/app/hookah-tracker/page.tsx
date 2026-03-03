'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { HookahTracker } from '../../components/HookahTracker';

function HookahTrackerContent() {
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
    // When tracking is complete, redirect to guest control panel
    // Check if demo mode
    const urlParams = new URLSearchParams(window.location.search);
    const isDemo = urlParams.get('demo') === 'true' || urlParams.get('mode') === 'demo';
    
    // Always include session info in redirect
    const isAccelerated = urlParams.get('accelerated') === 'true';
    window.location.href = `/control-panel?sessionId=${sessionId}&tableId=${tableId}&loungeId=${loungeId}&demo=${isDemo ? 'true' : 'false'}${isDemo ? '&mode=demo' : ''}${isAccelerated ? '&accelerated=true' : ''}`;
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

export default function HookahTrackerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <HookahTrackerContent />
    </Suspense>
  );
}
