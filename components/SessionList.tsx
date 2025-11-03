'use client';

import React, { useEffect, useState } from 'react';
import SessionCard from '../components/SessionCard';

interface Session {
  id: number;
  table: string;
  flavors: string[];
  startTime: number;
  endTime: number | null;
  refills: number;
  notes: string[];
}

export default function SessionList() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/sessions');
      if (!response.ok) throw new Error('Failed to fetch sessions');
      const data = await response.json();
      setSessions(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSessions, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter active sessions (no endTime)
  const activeSessions = sessions.filter(s => !s.endTime);

  if (loading) {
    return <div className="text-center py-8">Loading sessions...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-goldLumen">Active Sessions</h2>
        <span className="text-sm text-gray-400">
          {activeSessions.length} active • {sessions.length} total
        </span>
      </div>

      {activeSessions.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          No active sessions at this time
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeSessions.map((session) => (
            <SessionCard
              key={session.id}
              title={`Table ${session.table}`}
              flavor={session.flavors.join(', ')}
              startAt={new Date(session.startTime)}
              status="active"
            />
          ))}
        </div>
      )}
    </div>
  );
}
