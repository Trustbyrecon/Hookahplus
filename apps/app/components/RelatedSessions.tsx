'use client';

import React from 'react';
import Link from 'next/link';
import { Flame, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import { useSessionContext } from '../contexts/SessionContext';

interface RelatedSessionsProps {
  currentSessionId?: string;
  maxItems?: number;
  className?: string;
}

export default function RelatedSessions({ 
  currentSessionId, 
  maxItems = 3,
  className = '' 
}: RelatedSessionsProps) {
  const { sessions, loading } = useSessionContext();

  // Filter out current session and get related sessions
  const relatedSessions = sessions
    .filter(session => session.id !== currentSessionId)
    .slice(0, maxItems);

  if (loading || relatedSessions.length === 0) {
    return null;
  }

  return (
    <div className={`bg-zinc-900/50 border border-zinc-700 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-400" />
          Related Sessions
        </h3>
        <Link 
          href="/fire-session-dashboard"
          className="text-xs text-teal-400 hover:text-teal-300 transition-colors flex items-center gap-1"
        >
          View All
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="space-y-2">
        {relatedSessions.map((session) => (
          <Link
            key={session.id}
            href={`/fire-session-dashboard?session=${session.id}`}
            className="block p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-white">{session.tableId}</div>
                <div className="text-xs text-zinc-400">{session.flavor}</div>
              </div>
              <div className="text-right">
                <div className={`text-xs font-medium ${
                  session.status === 'ACTIVE' ? 'text-green-400' :
                  session.status === 'PREP_IN_PROGRESS' ? 'text-yellow-400' :
                  'text-zinc-400'
                }`}>
                  {session.status.replace(/_/g, ' ')}
                </div>
                {session.sessionTimer && (
                  <div className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    {Math.floor(session.sessionTimer.remaining / 60)}m
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

