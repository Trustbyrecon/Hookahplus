"use client";

import { useState, useEffect } from "react";
import { sessionCommands } from "@/lib/cmd";
import { getSession, getAllSessions, type SessionState } from "@/lib/sessionState";

const BOHPrepRoom = () => {
  const [sessions, setSessions] = useState<SessionState[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionState | null>(null);
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const refreshSessions = () => {
    const allSessions = getAllSessions();
    const prepSessions = allSessions.filter(s => 
      ["PAID_CONFIRMED", "PREP_IN_PROGRESS"].includes(s.status)
    );
    setSessions(prepSessions);
  };

  useEffect(() => {
    refreshSessions();
    // Auto-refresh every 5 seconds
    const interval = setInterval(refreshSessions, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCommand = async (sessionId: string, cmd: string, data?: any) => {
    setLoading(prev => ({ ...prev, [sessionId]: true }));
    
    try {
      const result = await fetch(`/api/sessions/${sessionId}/command`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cmd, data, actor: "boh_staff" })
      });
      
      if (result.ok) {
        refreshSessions();
        // Update selected session if it's the one we just modified
        if (selectedSession?.id === sessionId) {
          const updatedSession = getSession(sessionId);
          if (updatedSession) {
            setSelectedSession(updatedSession);
          }
        }
      } else {
        const error = await result.json();
        alert(`Command failed: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Command error:", error);
      alert("Command failed");
    } finally {
      setLoading(prev => ({ ...prev, [sessionId]: false }));
    }
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case "PAID_CONFIRMED": return "bg-yellow-100 text-yellow-800";
      case "PREP_IN_PROGRESS": return "bg-blue-100 text-blue-800";
      case "ACTIVE": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStateIcon = (state: string) => {
    switch (state) {
      case "PAID_CONFIRMED": return "⏳";
      case "PREP_IN_PROGRESS": return "🔥";
      case "ACTIVE": return "✅";
      default: return "❓";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Back of House - Prep Room</h1>
          <p className="text-gray-600">Manage session preparation and heating</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Session Queue */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Session Queue</h2>
                <button
                  onClick={refreshSessions}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Refresh
                </button>
              </div>
              
              <div className="space-y-3">
                {sessions.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No sessions in prep queue</p>
                ) : (
                  sessions.map(session => (
                    <div
                      key={session.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedSession?.id === session.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedSession(session)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{getStateIcon(session.status)}</span>
                            <span className="font-medium text-gray-900">
                              Session {session.id.slice(-6)}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${getStateColor(session.status)}`}>
                              {session.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            <div>Table: {session.tableNumber}</div>
                            <div>Customer: {session.customerName}</div>
                            <div>Items: {session.items.length}</div>
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <div>${session.totalAmount.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Session Controls */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900">Session Controls</h2>
              {selectedSession && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-4">
                    Table {selectedSession.tableNumber} - {selectedSession.status.replace(/_/g, ' ')}
                  </p>
                  
                  <div className="space-y-3">
                    {!selectedSession ? (
                      <p className="text-gray-500 text-sm">Select a session to view controls</p>
                    ) : (
                      <>
                        {selectedSession.status === "PAID_CONFIRMED" && (
                          <button
                            onClick={() => handleCommand(selectedSession.id, "CLAIM_PREP")}
                            disabled={loading[selectedSession.id]}
                            className="w-full bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                          >
                            {loading[selectedSession.id] ? "Processing..." : "Claim Prep"}
                          </button>
                        )}
                        
                        {selectedSession.status === "PREP_IN_PROGRESS" && (
                          <button
                            onClick={() => handleCommand(selectedSession.id, "START_PREP")}
                            disabled={loading[selectedSession.id]}
                            className="w-full bg-orange-600 text-white px-4 py-2 rounded text-sm hover:bg-orange-700 disabled:opacity-50"
                          >
                            {loading[selectedSession.id] ? "Processing..." : "Start Prep"}
                          </button>
                        )}
                        
                        {selectedSession.status === "PREP_IN_PROGRESS" && (
                          <button
                            onClick={() => handleCommand(selectedSession.id, "START_ACTIVE")}
                            disabled={loading[selectedSession.id]}
                            className="w-full bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                          >
                            {loading[selectedSession.id] ? "Processing..." : "Ready for Service"}
                          </button>
                        )}
                        
                        {["PREP_IN_PROGRESS", "ACTIVE"].includes(selectedSession.status) && (
                          <div className="space-y-2">
                            <button
                              onClick={() => {
                                const reason = prompt("Remake reason:");
                                if (reason) {
                                  handleCommand(selectedSession.id, "REMAKE", { reason });
                                }
                              }}
                              disabled={loading[selectedSession.id]}
                              className="w-full bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                            >
                              Remake
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt("Hold reason:");
                                if (reason) {
                                  handleCommand(selectedSession.id, "STAFF_HOLD", { reason });
                                }
                              }}
                              disabled={loading[selectedSession.id]}
                              className="w-full bg-yellow-600 text-white px-4 py-2 rounded text-sm hover:bg-yellow-700 disabled:opacity-50"
                            >
                              Staff Hold
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  
                  {/* Session Info */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h3 className="font-medium text-gray-900 mb-2">Session Details</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>ID: {selectedSession.id}</div>
                      <div>Table: {selectedSession.tableNumber}</div>
                      <div>Status: {selectedSession.status}</div>
                      <div>Items: {selectedSession.items.length}</div>
                      <div>Total: ${selectedSession.totalAmount.toFixed(2)}</div>
                      {selectedSession.notes && (
                        <div>Notes: {selectedSession.notes}</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BOHPrepRoom;