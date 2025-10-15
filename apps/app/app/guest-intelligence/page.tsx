'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import GuestIntelligenceDashboard from '../../components/GuestIntelligenceDashboard';
import { FireSession } from '../../types/enhancedSession';

export default function GuestIntelligencePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [session, setSession] = useState<FireSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get('sessionId');
  const tableId = searchParams.get('tableId');

  useEffect(() => {
    const loadSessionData = async () => {
      try {
        if (sessionId) {
          // Load session data from API
          const response = await fetch(`/api/sessions/${sessionId}`);
          if (response.ok) {
            const data = await response.json();
            setSession(data.session);
          } else {
            throw new Error('Session not found');
          }
        } else if (tableId) {
          // Load session data by table ID
          const response = await fetch(`/api/sessions?tableId=${tableId}`);
          if (response.ok) {
            const data = await response.json();
            if (data.sessions && data.sessions.length > 0) {
              setSession(data.sessions[0]); // Get the most recent session for this table
            } else {
              throw new Error('No session found for this table');
            }
          } else {
            throw new Error('Failed to load session data');
          }
        } else {
          throw new Error('No session ID or table ID provided');
        }
      } catch (err) {
        console.error('Error loading session data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load session data');
      } finally {
        setLoading(false);
      }
    };

    loadSessionData();
  }, [sessionId, tableId]);

  const handleClose = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white">Loading Guest Intelligence...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-600/20 border border-red-600/30 rounded-lg p-6 max-w-md">
            <h2 className="text-red-400 text-xl font-semibold mb-2">Error Loading Intelligence</h2>
            <p className="text-gray-300 mb-4">{error}</p>
            <button
              onClick={handleClose}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <GuestIntelligenceDashboard
        session={session || undefined}
        sessionId={sessionId || undefined}
        tableId={tableId || undefined}
        onClose={handleClose}
      />
    </div>
  );
}
