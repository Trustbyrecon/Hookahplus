'use client';
import React, { useEffect } from 'react';
import { useSession } from './SessionContext';

export default function TimerController() {
  const { session, setSession } = useSession();

  useEffect(() => {
    if (!session.isActive) return;
    const interval = setInterval(() => {
      setSession(prev => ({ ...prev, seconds: prev.seconds + 1 }));
    }, 1000);
    return () => clearInterval(interval);
  }, [session.isActive]);

  const formatTime = (sec) => {
    const mins = String(Math.floor(sec / 60)).padStart(2, '0');
    const secs = String(sec % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="flex justify-between items-center text-sm mb-2">
      <span className="text-green-400 flex items-center">
        <span className="h-2 w-2 rounded-full bg-green-400 mr-2" />
        {session.isActive ? 'Active' : 'Paused'}
      </span>
      <span>{formatTime(session.seconds)}</span>
    </div>
  );
}
