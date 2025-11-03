'use client';

import React, { useEffect, useState } from 'react';
import SessionCard from './SessionCard';

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
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

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-400">
        Loading sessions...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400">
        Error: {error}
      </div>
    );
  }

  const activeSessions = sessions.filter(s => !s.endTime);
  const completedSessions = sessions.filter(s => s.endTime);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Active Sessions</h2>
        <span className="text-sm text-gray-400">
          {activeSessions.length} active • {completedSessions.length} completed
        </span>
      </div>

      {activeSessions.length === 0 ? (
        <div className="p-8 text-center text-gray-400 bg-gray-900/30 rounded-lg border border-gray-800">
          No active sessions
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activeSessions.map((session) => (
            <SessionCard
              key={session.id}
              title={`Table ${session.table}`}
              flavor={session.flavors.join(', ')}
              startAt={new Date(session.startTime)}
              status="active"
              href={`/dashboard/sessions/${session.id}`}
            />
          ))}
        </div>
      )}

      {completedSessions.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-white mb-4">Recent Sessions</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {completedSessions.slice(0, 6).map((session) => (
              <SessionCard
                key={session.id}
                title={`Table ${session.table}`}
                flavor={session.flavors.join(', ')}
                startAt={new Date(session.startTime)}
                status="complete"
                href={`/dashboard/sessions/${session.id}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
