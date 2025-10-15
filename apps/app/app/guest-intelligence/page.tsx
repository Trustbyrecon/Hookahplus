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
          // Load session data from the root Prisma-based API
          const response = await fetch(`/api/sessions/${sessionId}`);
          if (response.ok) {
            const data = await response.json();
            // Convert Prisma session to FireSession format
            const fireSession: FireSession = {
              id: data.id,
              tableId: data.tableId,
              customerName: data.customerRef || 'Unknown Customer',
              customerPhone: data.customerPhone || '',
              flavor: data.flavor || 'Unknown Flavor',
              amount: data.priceCents || 0,
              status: mapPrismaStateToFireSession(data.state),
              currentStage: mapStateToStage(data.state),
              assignedStaff: {
                boh: data.assignedBOHId || undefined,
                foh: data.assignedFOHId || undefined
              },
              createdAt: new Date(data.createdAt).getTime(),
              updatedAt: new Date(data.updatedAt).getTime(),
              sessionStartTime: data.startedAt ? new Date(data.startedAt).getTime() : undefined,
              sessionDuration: data.durationSecs || 45 * 60,
              coalStatus: 'active',
              refillStatus: 'none',
              notes: data.tableNotes || '',
              edgeCase: data.edgeCase || null,
              sessionTimer: data.timerStartedAt ? {
                remaining: calculateRemainingTimeFromPrisma(data),
                total: data.timerDuration || 45 * 60,
                isActive: data.timerStatus === 'active',
                startedAt: new Date(data.timerStartedAt).getTime()
              } : undefined,
              bohState: 'PREPARING',
              guestTimerDisplay: true
            };
            setSession(fireSession);
          } else {
            throw new Error('Session not found');
          }
        } else if (tableId) {
          // Load session data by table ID
          const response = await fetch(`/api/sessions?tableId=${tableId}`);
          if (response.ok) {
            const data = await response.json();
            if (data.sessions && data.sessions.length > 0) {
              const sessionData = data.sessions[0];
              // Convert Prisma session to FireSession format
              const fireSession: FireSession = {
                id: sessionData.id,
                tableId: sessionData.tableId,
                customerName: sessionData.customerRef || 'Unknown Customer',
                customerPhone: sessionData.customerPhone || '',
                flavor: sessionData.flavor || 'Unknown Flavor',
                amount: sessionData.priceCents || 0,
                status: mapPrismaStateToFireSession(sessionData.state),
                currentStage: mapStateToStage(sessionData.state),
                assignedStaff: {
                  boh: sessionData.assignedBOHId || undefined,
                  foh: sessionData.assignedFOHId || undefined
                },
                createdAt: new Date(sessionData.createdAt).getTime(),
                updatedAt: new Date(sessionData.updatedAt).getTime(),
                sessionStartTime: sessionData.startedAt ? new Date(sessionData.startedAt).getTime() : undefined,
                sessionDuration: sessionData.durationSecs || 45 * 60,
                coalStatus: 'active',
                refillStatus: 'none',
                notes: sessionData.tableNotes || '',
                edgeCase: sessionData.edgeCase || null,
                sessionTimer: sessionData.timerStartedAt ? {
                  remaining: calculateRemainingTimeFromPrisma(sessionData),
                  total: sessionData.timerDuration || 45 * 60,
                  isActive: sessionData.timerStatus === 'active',
                  startedAt: new Date(sessionData.timerStartedAt).getTime()
                } : undefined,
                bohState: 'PREPARING',
                guestTimerDisplay: true
              };
              setSession(fireSession);
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

  // Helper function to map Prisma session state to FireSession status
  const mapPrismaStateToFireSession = (state: string): any => {
    const stateMap: Record<string, any> = {
      'active': 'ACTIVE',
      'prep_in_progress': 'PREP_IN_PROGRESS',
      'ready_for_delivery': 'READY_FOR_DELIVERY',
      'delivered': 'DELIVERED',
      'paused': 'STAFF_HOLD',
      'completed': 'CLOSED',
      'cancelled': 'VOIDED'
    };
    return stateMap[state] || 'NEW';
  };

  // Helper function to map state to stage
  const mapStateToStage = (state: string): 'BOH' | 'FOH' | 'CUSTOMER' => {
    if (['prep_in_progress', 'ready_for_delivery'].includes(state)) return 'BOH';
    if (['delivered'].includes(state)) return 'FOH';
    return 'CUSTOMER';
  };

  // Helper function to calculate remaining time from Prisma session
  const calculateRemainingTimeFromPrisma = (session: any): number => {
    if (!session.timerStartedAt || !session.timerDuration) return 0;
    
    const now = Date.now();
    const startedAt = new Date(session.timerStartedAt).getTime();
    const elapsed = Math.floor((now - startedAt) / 1000);
    const pausedTime = session.timerPausedDuration || 0;
    
    return Math.max(0, session.timerDuration - elapsed + pausedTime);
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
