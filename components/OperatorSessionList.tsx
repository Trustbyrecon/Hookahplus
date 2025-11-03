'use client';

import React, { useEffect, useState } from 'react';
import SessionCard from '../../components/SessionCard';

interface Session {
  id: number;
  table: string;
  flavors: string[];
  startTime: number;
  endTime: number | null;
  refills: number;
  notes: string[];
}

export default function OperatorSessionList() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/sessions');
      if (!response.ok) throw new Error('Failed to fetch sessions');
      const data = await response.json();
      setSessions(data);
    } catch (err) {
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

  const handleRefill = async (sessionId: number) => {
    try {
      const session = sessions.find(s => s.id === sessionId);
      if (!session) return;

      const response = await fetch('/api/sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: sessionId,
          refills: session.refills + 1,
          notes: session.notes,
          start_time: session.startTime,
          end_time: session.endTime,
        }),
      });

      if (response.ok) {
        await fetchSessions();
      }
    } catch (err) {
      console.error('Error adding refill:', err);
      alert('Failed to add refill');
    }
  };

  const handleEndSession = async (sessionId: number) => {
    if (!confirm('End this session?')) return;

    try {
      const session = sessions.find(s => s.id === sessionId);
      if (!session) return;

      const response = await fetch('/api/sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: sessionId,
          refills: session.refills,
          notes: session.notes,
          start_time: session.startTime,
          end_time: Date.now(),
        }),
      });

      if (response.ok) {
        await fetchSessions();
      }
    } catch (err) {
      console.error('Error ending session:', err);
      alert('Failed to end session');
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-400">
        Loading sessions...
      </div>
    );
  }

  const activeSessions = sessions.filter(s => !s.endTime);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Active Sessions</h2>
        <span className="text-sm text-gray-400">
          {activeSessions.length} active
        </span>
      </div>

      {activeSessions.length === 0 ? (
        <div className="p-8 text-center text-gray-400 bg-gray-900/30 rounded-lg border border-gray-800">
          No active sessions
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activeSessions.map((session) => {
            const duration = Date.now() - session.startTime;
            const hours = Math.floor(duration / (1000 * 60 * 60));
            const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

            return (
              <div
                key={session.id}
                className="bg-gray-900/50 rounded-lg p-6 border border-gray-800"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">
                    Table {session.table}
                  </h3>
                  <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
                    Active
                  </span>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Flavors:</span>
                    <span className="text-white">{session.flavors.join(', ') || 'None'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration:</span>
                    <span className="text-white">{hours}h {minutes}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Refills:</span>
                    <span className="text-white">{session.refills}</span>
                  </div>
                  {session.notes.length > 0 && (
                    <div className="mt-2 p-2 bg-gray-800/50 rounded text-xs">
                      {session.notes.map((note, idx) => (
                        <div key={idx} className="text-gray-300">{note}</div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleRefill(session.id)}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm"
                  >
                    Add Refill
                  </button>
                  <button
                    onClick={() => setSelectedSession(session)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold text-sm"
                  >
                    Notes
                  </button>
                  <button
                    onClick={() => handleEndSession(session.id)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm"
                  >
                    End
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Session Notes Modal */}
      {selectedSession && (
        <SessionNotesModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
          onSave={async (notes) => {
            try {
              const response = await fetch('/api/sessions', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  id: selectedSession.id,
                  refills: selectedSession.refills,
                  notes: notes,
                  start_time: selectedSession.startTime,
                  end_time: selectedSession.endTime,
                }),
              });

              if (response.ok) {
                await fetchSessions();
                setSelectedSession(null);
              }
            } catch (err) {
              console.error('Error saving notes:', err);
              alert('Failed to save notes');
            }
          }}
        />
      )}
    </div>
  );
}

function SessionNotesModal({
  session,
  onClose,
  onSave,
}: {
  session: Session;
  onClose: () => void;
  onSave: (notes: string[]) => void;
}) {
  const [notes, setNotes] = useState<string[]>(session.notes || []);

  const addNote = () => {
    setNotes([...notes, '']);
  };

  const updateNote = (index: number, value: string) => {
    const updated = [...notes];
    updated[index] = value;
    setNotes(updated);
  };

  const removeNote = (index: number) => {
    setNotes(notes.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full border border-gray-800">
        <h3 className="text-xl font-semibold text-white mb-4">
          Session Notes - Table {session.table}
        </h3>

        <div className="space-y-2 mb-4">
          {notes.map((note, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                type="text"
                value={note}
                onChange={(e) => updateNote(idx, e.target.value)}
                placeholder="Enter note..."
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
              />
              <button
                onClick={() => removeNote(idx)}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={addNote}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
          >
            Add Note
          </button>
          <button
            onClick={() => onSave(notes)}
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold"
          >
            Save Notes
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
