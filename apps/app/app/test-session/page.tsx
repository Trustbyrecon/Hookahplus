"use client";

import React, { useState, useEffect } from 'react';
import CreateSessionModal from '../../components/CreateSessionModal';
import { Session } from '../../types/session';

export default function TestSessionPage() {
  const [isPrettyTheme, setIsPrettyTheme] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    // Check for pretty theme on client side
    setIsPrettyTheme(process.env.NEXT_PUBLIC_PRETTY_THEME === '1' || window.location.hostname.includes('vercel.app'));
  }, []);

  const handleCreateSession = (sessionData: any) => {
    const newSession: Session = {
      id: `session_${sessionData.tableId}_${Date.now()}`,
      tableId: sessionData.tableId,
      customerRef: sessionData.customerName,
      flavor: sessionData.flavor,
      priceCents: Math.round(sessionData.amount * 100),
      state: 'NEW',
      assignedBOHId: sessionData.bohStaff,
      assignedFOHId: sessionData.fohStaff,
      createdAt: new Date(),
      updatedAt: new Date(),
      // UI computed fields
      statusColor: 'bg-blue-500',
      statusIcon: '🆕',
      assignedBOH: sessionData.bohStaff,
      assignedFOH: sessionData.fohStaff,
      notes: sessionData.notes,
      created: new Date().toLocaleTimeString(),
      team: 'BOH'
    };
    setSessions(prev => [newSession, ...prev]);
    console.log('Session created:', newSession);
  };

  return (
    <div className={`min-h-screen ${isPrettyTheme ? 'bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white' : 'bg-gray-100 text-black'}`}>
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">
          {isPrettyTheme ? '🧪 Session Testing Page' : 'Session Testing Page'}
        </h1>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Theme Status</h2>
          <div className={`p-4 rounded-lg ${isPrettyTheme ? 'bg-teal-500/20 border border-teal-500/30' : 'bg-gray-200'}`}>
            <p className={isPrettyTheme ? 'text-teal-400' : 'text-gray-700'}>
              Pretty Theme: {isPrettyTheme ? '✅ ENABLED' : '❌ DISABLED'}
            </p>
            <p className={isPrettyTheme ? 'text-zinc-400 text-sm mt-2' : 'text-gray-600 text-sm mt-2'}>
              Environment: {process.env.NODE_ENV} | Hostname: {typeof window !== 'undefined' ? window.location.hostname : 'N/A'}
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Create Session Test</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
              isPrettyTheme 
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            🆕 Test Create New Session Modal
          </button>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Created Sessions ({sessions.length})</h2>
          {sessions.length === 0 ? (
            <p className={isPrettyTheme ? 'text-zinc-400' : 'text-gray-600'}>
              No sessions created yet. Click the button above to create one.
            </p>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div 
                  key={session.id} 
                  className={`p-4 rounded-lg border ${
                    isPrettyTheme 
                      ? 'bg-zinc-800 border-zinc-700' 
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className={`font-semibold ${isPrettyTheme ? 'text-blue-400' : 'text-blue-600'}`}>
                        Table {session.tableId} - {session.customerRef}
                      </h3>
                      <p className={isPrettyTheme ? 'text-zinc-400 text-sm' : 'text-gray-600 text-sm'}>
                        {session.flavor} • ${(session.priceCents / 100).toFixed(2)} • {session.state}
                      </p>
                      <p className={isPrettyTheme ? 'text-zinc-500 text-xs mt-1' : 'text-gray-500 text-xs mt-1'}>
                        BOH: {session.assignedBOH} | FOH: {session.assignedFOH}
                      </p>
                      {session.notes && (
                        <p className={isPrettyTheme ? 'text-zinc-300 text-sm mt-2' : 'text-gray-700 text-sm mt-2'}>
                          Notes: {session.notes}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        isPrettyTheme ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {session.state}
                      </span>
                      <p className={isPrettyTheme ? 'text-zinc-500 text-xs mt-1' : 'text-gray-500 text-xs mt-1'}>
                        {session.created}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
          <div className={`p-4 rounded-lg font-mono text-sm ${isPrettyTheme ? 'bg-zinc-800 border border-zinc-700' : 'bg-gray-100 border border-gray-300'}`}>
            <pre className={isPrettyTheme ? 'text-zinc-300' : 'text-gray-700'}>
{JSON.stringify({
  isPrettyTheme,
  nodeEnv: process.env.NODE_ENV,
  hostname: typeof window !== 'undefined' ? window.location.hostname : 'N/A',
  sessionsCount: sessions.length,
  prettyThemeEnv: process.env.NEXT_PUBLIC_PRETTY_THEME
}, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      {/* Create Session Modal */}
      <CreateSessionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateSession={handleCreateSession}
      />
    </div>
  );
}
