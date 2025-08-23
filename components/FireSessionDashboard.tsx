'use client';

import { useState, useEffect } from 'react';
import { 
  getSession, 
  getAllSessions, 
  sessionCommands,
  type Session 
} from '@/lib/cmd';
import { 
  getStateDisplayName, 
  getStateColor, 
  getAvailableCommands,
  type SessionState 
} from '@/lib/sessionState';

export default function FireSessionDashboard() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const response = await getAllSessions();
      setSessions(response.sessions);
      if (response.sessions.length > 0 && !selectedSession) {
        setSelectedSession(response.sessions[0]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const executeCommand = async (sessionId: string, command: string, data: any = {}, actor: "foh" | "boh" | "system" = "foh") => {
    try {
      setLoading(true);
      setError(null);
      
      // Execute the command
      await sessionCommands[command as keyof typeof sessionCommands](sessionId, data, actor);
      
      // Reload sessions to get updated state
      await loadSessions();
      
      // Update selected session if it's the one we just modified
      if (selectedSession?.id === sessionId) {
        const updated = await getSession(sessionId);
        setSelectedSession(updated.session);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createNewSession = async () => {
    try {
      setLoading(true);
      const table = prompt('Enter table number (e.g., T-15):') || 'T-15';
      await sessionCommands.createSession({ table });
      await loadSessions();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCommandButton = (session: Session, command: string, label: string, actor: "foh" | "boh" = "foh", color = "blue") => {
    const isAvailable = getAvailableCommands(session.state).includes(command as any);
    
    return (
      <button
        key={command}
        onClick={() => executeCommand(session.id, command, {}, actor)}
        disabled={!isAvailable || loading}
        className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
          isAvailable 
            ? `bg-${color}-500 hover:bg-${color}-600 text-white` 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {label}
      </button>
    );
  };

  if (loading && sessions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading Fire Session Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Fire Session Dashboard
          </h1>
          <p className="text-gray-600">
            Manage hookah sessions with real-time state machine
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Controls */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={createNewSession}
            disabled={loading}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded font-medium"
          >
            Create New Session
          </button>
          <button
            onClick={loadSessions}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium"
          >
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sessions List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Active Sessions</h2>
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => setSelectedSession(session)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedSession?.id === session.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          {session.table}
                        </div>
                        <div className="text-sm text-gray-500">
                          {session.id.slice(-8)}
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStateColor(session.state)}`}>
                        {getStateDisplayName(session.state)}
                      </div>
                    </div>
                  </div>
                ))}
                {sessions.length === 0 && (
                  <div className="text-gray-500 text-center py-8">
                    No sessions found. Create one to get started!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Session Details & Controls */}
          <div className="lg:col-span-2">
            {selectedSession ? (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Table {selectedSession.table}
                    </h2>
                    <p className="text-gray-600">Session {selectedSession.id}</p>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-sm font-medium ${getStateColor(selectedSession.state)}`}>
                    {getStateDisplayName(selectedSession.state)}
                  </div>
                </div>

                {/* Session Info */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Status
                    </label>
                    <div className="text-sm text-gray-900 capitalize">
                      {selectedSession.payment.status}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Items
                    </label>
                    <div className="text-sm text-gray-900">
                      {selectedSession.items.map(item => `${item.sku} (${item.qty})`).join(', ')}
                    </div>
                  </div>
                </div>

                {/* FOH Controls */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 text-blue-600">Front of House (FOH)</h3>
                  <div className="flex flex-wrap gap-2">
                    {getCommandButton(selectedSession, "DELIVER_NOW", "Deliver Now", "foh", "blue")}
                    {getCommandButton(selectedSession, "MARK_DELIVERED", "Mark Delivered", "foh", "green")}
                    {getCommandButton(selectedSession, "START_ACTIVE", "Start Active", "foh", "purple")}
                    {getCommandButton(selectedSession, "MOVE_TABLE", "Move Table", "foh", "yellow")}
                    {getCommandButton(selectedSession, "CLOSE_SESSION", "Close Session", "foh", "red")}
                    {getCommandButton(selectedSession, "REMAKE", "Remake", "foh", "orange")}
                    {getCommandButton(selectedSession, "STAFF_HOLD", "Staff Hold", "foh", "yellow")}
                  </div>
                </div>

                {/* BOH Controls */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 text-green-600">Back of House (BOH)</h3>
                  <div className="flex flex-wrap gap-2">
                    {getCommandButton(selectedSession, "CLAIM_PREP", "Claim Prep", "boh", "purple")}
                    {getCommandButton(selectedSession, "HEAT_UP", "Heat Up", "boh", "red")}
                    {getCommandButton(selectedSession, "READY_FOR_DELIVERY", "Ready for Delivery", "boh", "green")}
                    {getCommandButton(selectedSession, "REMAKE", "Remake", "boh", "orange")}
                    {getCommandButton(selectedSession, "STAFF_HOLD", "Staff Hold", "boh", "yellow")}
                  </div>
                </div>

                {/* System Controls */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 text-gray-600">System</h3>
                  <div className="flex flex-wrap gap-2">
                    {getCommandButton(selectedSession, "PAYMENT_CONFIRMED", "Confirm Payment", "system", "green")}
                    {getCommandButton(selectedSession, "PAYMENT_FAILED", "Fail Payment", "system", "red")}
                    {getCommandButton(selectedSession, "VOID", "Void Session", "system", "gray")}
                    {getCommandButton(selectedSession, "REFUND_REQUEST", "Request Refund", "system", "orange")}
                    {getCommandButton(selectedSession, "REFUND_COMPLETE", "Complete Refund", "system", "blue")}
                  </div>
                </div>

                {/* Audit Trail */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Recent Activity</h3>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {selectedSession.audit.slice(-5).reverse().map((event) => (
                      <div key={event.id} className="text-sm p-2 bg-gray-50 rounded">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{event.cmd || event.type}</span>
                          <span className="text-gray-500 text-xs">
                            {new Date(event.ts).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="text-gray-600 text-xs">
                          {event.from && event.to && `${event.from} → ${event.to}`}
                          {event.reason && ` (${event.reason})`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center text-gray-500 py-12">
                  Select a session to view details and controls
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
