/**
 * Example React component showing how to integrate the durable session API
 * with existing UI components
 */

"use client";

import { useState, useEffect } from "react";
import { sessionClient, Session, SessionSource } from "@/lib/sessionClient";

interface SessionManagerProps {
  loungeId: string;
  onSessionChange?: (session: Session) => void;
}

export default function SessionManager({ loungeId, onSessionChange }: SessionManagerProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, [loungeId]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const response = await sessionClient.listSessions({ loungeId });
      setSessions(response.sessions);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createSession = async (source: SessionSource, externalRef: string, customerPhone?: string) => {
    try {
      setLoading(true);
      const response = await sessionClient.createSession({
        loungeId,
        source,
        externalRef,
        customerPhone,
      });
      
      setSessions(prev => [response.session, ...prev]);
      onSessionChange?.(response.session);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateSession = async (sessionId: string, update: any) => {
    try {
      setLoading(true);
      const session = sessions.find(s => s.id === sessionId);
      if (!session) throw new Error("Session not found");

      const response = await sessionClient.updateSession(sessionId, {
        expectedVersion: session.version,
        ...update,
      });

      setSessions(prev => 
        prev.map(s => s.id === sessionId ? response.session : s)
      );
      onSessionChange?.(response.session);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQRScan = (qrToken: string) => {
    createSession("QR", `qr:${qrToken}`);
  };

  const handleReservation = (reservationId: string) => {
    createSession("RESERVE", `res:${reservationId}`);
  };

  const handleWalkIn = () => {
    createSession("WALK_IN", `walkin:${crypto.randomUUID()}`);
  };

  const handleStartSession = (sessionId: string) => {
    updateSession(sessionId, { state: "ACTIVE" });
  };

  const handlePauseSession = (sessionId: string) => {
    updateSession(sessionId, { state: "PAUSED" });
  };

  const handleCloseSession = (sessionId: string) => {
    updateSession(sessionId, { state: "CLOSED" });
  };

  if (loading) return <div>Loading sessions...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button 
          onClick={() => handleQRScan("demo-qr-token")}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Scan QR Code
        </button>
        <button 
          onClick={() => handleReservation("demo-reservation")}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Check Reservation
        </button>
        <button 
          onClick={handleWalkIn}
          className="px-4 py-2 bg-purple-500 text-white rounded"
        >
          Walk-in Customer
        </button>
      </div>

      <div className="grid gap-4">
        {sessions.map(session => (
          <div key={session.id} className="border rounded p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">
                  {session.source} Session - {session.state}
                </h3>
                <p className="text-sm text-gray-600">
                  Phone: {session.customerPhone || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  Created: {new Date(session.createdAt).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  Version: {session.version}
                </p>
              </div>
              
              <div className="flex gap-2">
                {session.state === "PENDING" && (
                  <button
                    onClick={() => handleStartSession(session.id)}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded"
                  >
                    Start
                  </button>
                )}
                
                {session.state === "ACTIVE" && (
                  <>
                    <button
                      onClick={() => handlePauseSession(session.id)}
                      className="px-3 py-1 bg-yellow-500 text-white text-sm rounded"
                    >
                      Pause
                    </button>
                    <button
                      onClick={() => handleCloseSession(session.id)}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded"
                    >
                      Close
                    </button>
                  </>
                )}
                
                {session.state === "PAUSED" && (
                  <button
                    onClick={() => handleStartSession(session.id)}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded"
                  >
                    Resume
                  </button>
                )}
              </div>
            </div>
            
            {session.flavorMix && (
              <div className="mt-2">
                <p className="text-sm font-medium">Flavor Mix:</p>
                <pre className="text-xs bg-gray-100 p-2 rounded">
                  {JSON.stringify(session.flavorMix, null, 2)}
                </pre>
              </div>
            )}
            
            <div className="mt-2">
              <p className="text-sm font-medium">Events ({session.events.length}):</p>
              <div className="text-xs space-y-1">
                {session.events.slice(-3).map(event => (
                  <div key={event.id} className="flex justify-between">
                    <span>{event.type}</span>
                    <span className="text-gray-500">
                      {new Date(event.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
