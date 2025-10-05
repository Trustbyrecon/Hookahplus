"use client";

import { useState, useEffect } from "react";
import { sessionCommands } from "@/lib/cmd";
import { getSession, getAllSessions, type SessionState } from "@/lib/sessionState";

const FOHFloorDashboard = () => {
  const [sessions, setSessions] = useState<SessionState[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionState | null>(null);
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  // Refresh sessions
  const refreshSessions = () => {
    const allSessions = getAllSessions();
    const floorSessions = allSessions.filter(s => 
      ["ACTIVE"].includes(s.status)
    );
    setSessions(floorSessions);
  };

  useEffect(() => {
    refreshSessions();
    // Refresh every 5 seconds
    const interval = setInterval(refreshSessions, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCommand = async (sessionId: string, command: string, data?: any) => {
    setLoading(prev => ({ ...prev, [sessionId]: true }));
    try {
      let result;
      switch (command) {
        case "DELIVER_NOW":
          result = await sessionCommands.deliverNow(sessionId, data);
          break;
        case "MARK_DELIVERED":
          result = await sessionCommands.markDelivered(sessionId, data);
          break;
        case "START_ACTIVE":
          result = await sessionCommands.startActive(sessionId, data);
          break;
        case "CLOSE_SESSION":
          result = await sessionCommands.closeSession(sessionId, data);
          break;
        case "REMAKE":
          result = await sessionCommands.remake(sessionId, data.reason || "FOH remake", "foh");
          break;
        case "STAFF_HOLD":
          result = await sessionCommands.staffHold(sessionId, data.reason || "FOH hold", "foh");
          break;
        default:
          console.error("Unknown command:", command);
          return;
      }
      
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
        console.error("Command failed:", result.error);
        alert(`Command failed: ${result.error}`);
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
      case "ACTIVE": return "bg-emerald-100 text-emerald-800";
      case "PREP_IN_PROGRESS": return "bg-blue-100 text-blue-800";
      case "PAID_CONFIRMED": return "bg-green-100 text-green-800";
      case "NEW": return "bg-yellow-100 text-yellow-800";
      case "CLOSED": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStateIcon = (state: string) => {
    switch (state) {
      case "ACTIVE": return "🍃";
      case "PREP_IN_PROGRESS": return "🔧";
      case "PAID_CONFIRMED": return "✅";
      case "NEW": return "🆕";
      case "CLOSED": return "🔒";
      default: return "❓";
    }
  };

  const getPriorityScore = (session: SessionState) => {
    // Higher score = higher priority
    switch (session.status) {
      case "ACTIVE": return 100;
      case "PREP_IN_PROGRESS": return 90;
      case "PAID_CONFIRMED": return 80;
      case "NEW": return 70;
      case "CLOSED": return 60;
      default: return 50;
    }
  };

  const sortedSessions = [...sessions].sort((a, b) => getPriorityScore(b) - getPriorityScore(a));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Floor Dashboard</h1>
              <p className="text-gray-600">Front of House - Customer Delivery & Table Management</p>
            </div>
            <button
              onClick={() => {
                // Generate mobile QR demo data
                const mobileOrder = {
                  id: `mobile_${Date.now()}`,
                  tableId: `T-${Math.floor(Math.random() * 10) + 1}`,
                  flavor: ['Double Apple', 'Mint', 'Strawberry', 'Grape'][Math.floor(Math.random() * 4)],
                  amount: 2500 + Math.floor(Math.random() * 2000),
                  status: 'paid',
                  createdAt: Date.now(),
                  customerName: `Mobile Customer ${Math.floor(Math.random() * 100)}`,
                  customerId: `cust_${Math.floor(Math.random() * 1000)}`
                };
                
                // Create a new session for this mobile order
                const sessionId = `mobile_${mobileOrder.tableId}_${Date.now()}`;
                fetch(`/api/sessions/${sessionId}/command`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ 
                    cmd: "PAYMENT_CONFIRMED",
                    data: { 
                      table: mobileOrder.tableId,
                      customerId: mobileOrder.customerId,
                      flavor: mobileOrder.flavor,
                      amount: mobileOrder.amount
                    }
                  })
                }).then(() => {
                  alert(`Mobile QR order created for ${mobileOrder.tableId}! Check the floor queue.`);
                  refreshSessions();
                });
              }}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              📱 Generate Mobile QR
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Session Queue */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Floor Queue</h2>
                <p className="text-sm text-gray-500">{sessions.length} sessions on floor</p>
              </div>
              <div className="p-6">
                {sessions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">🍃</div>
                    <p>No sessions on floor</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sortedSessions.map((session) => (
                      <div
                        key={session.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                          selectedSession?.id === session.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedSession(session)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{getStateIcon(session.status)}</span>
                            <div>
                              <div className="font-medium text-gray-900">
                                Table {session.tableNumber}
                              </div>
                              <div className="text-sm text-gray-500">
                                Session {session.id.slice(-6)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStateColor(session.status)}`}>
                              {session.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </div>
                        

                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Session Controls */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Session Controls</h2>
                {selectedSession && (
                  <p className="text-sm text-gray-500">
                    Table {selectedSession.tableNumber} - {selectedSession.status.replace(/_/g, ' ')}
                  </p>
                )}
              </div>
              <div className="p-6">
                {!selectedSession ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Select a session to control</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* FOH Commands */}
                    {selectedSession.status === "ACTIVE" && (
                      <button
                        onClick={() => handleCommand(selectedSession.id, "DELIVER_NOW")}
                        disabled={loading[selectedSession.id]}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading[selectedSession.id] ? "Processing..." : "Start Delivery"}
                      </button>
                    )}

                    {selectedSession.status === "PREP_IN_PROGRESS" && (
                      <button
                        onClick={() => handleCommand(selectedSession.id, "MARK_DELIVERED")}
                        disabled={loading[selectedSession.id]}
                        className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading[selectedSession.id] ? "Processing..." : "Mark Delivered"}
                      </button>
                    )}

                    {selectedSession.status === "CLOSED" && (
                      <button
                        onClick={() => handleCommand(selectedSession.id, "START_ACTIVE")}
                        disabled={loading[selectedSession.id]}
                        className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading[selectedSession.id] ? "Processing..." : "Start Active Session"}
                      </button>
                    )}

                    {selectedSession.status === "ACTIVE" && (
                      <button
                        onClick={() => handleCommand(selectedSession.id, "CLOSE_SESSION")}
                        disabled={loading[selectedSession.id]}
                        className="w-full bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading[selectedSession.id] ? "Processing..." : "Close Session"}
                      </button>
                    )}

                    {/* Common Commands */}
                    {["READY_FOR_DELIVERY", "OUT_FOR_DELIVERY", "DELIVERED", "ACTIVE"].includes(selectedSession.status) && (
                      <>
                        <button
                          onClick={() => {
                            const reason = prompt("Remake reason:");
                            if (reason) {
                              handleCommand(selectedSession.id, "REMAKE", { reason });
                            }
                          }}
                          disabled={loading[selectedSession.id]}
                          className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Remake Hookah
                        </button>

                        <button
                          onClick={() => {
                            const reason = prompt("Hold reason:");
                            if (reason) {
                              handleCommand(selectedSession.id, "STAFF_HOLD", { reason });
                            }
                          }}
                          disabled={loading[selectedSession.id]}
                          className="w-full bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Staff Hold
                        </button>
                      </>
                    )}

                    {/* Session Info */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-2">Session Details</h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>ID: {selectedSession.id}</div>
                        <div>Table: {selectedSession.tableNumber}</div>
                        <div>State: {selectedSession.status}</div>
                        <div>Items: {selectedSession.items.length}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FOHFloorDashboard;
