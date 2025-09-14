"use client";

import { useState, useEffect } from "react";
import { sessionCommands } from "@/lib/cmd";
import { getSession, getAllSessions, type Session, type SessionState } from "@/lib/sessionState";
import MobileQRGenerator from "./MobileQRGenerator";

const FOHFloorDashboard = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [floorQueue, setFloorQueue] = useState<any[]>([]);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);

  // Refresh sessions
  const refreshSessions = async () => {
    // Get sessions from local state
    const allSessions = getAllSessions();
    const floorSessions = allSessions.filter(s => 
      ["READY_FOR_DELIVERY", "OUT_FOR_DELIVERY", "DELIVERED", "ACTIVE", "CLOSE_PENDING"].includes(s.state)
    );
    
    // Also fetch sessions from API (preorder flow)
    try {
      const response = await fetch('/api/sessions');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.sessions) {
          const apiSessions = data.sessions.map((session: any) => ({
            id: session.id,
            table: session.table,
            state: session.state,
            meta: session.meta,
            timers: session.timers
          }));
          
          // Merge API sessions with local sessions
          const allFloorSessions = [...floorSessions, ...apiSessions];
          setSessions(allFloorSessions);
          return;
        }
      }
    } catch (error) {
      console.error('Failed to fetch API sessions:', error);
    }
    
    setSessions(floorSessions);
  };

  // Handle Mobile QR order creation
  const handleMobileQROrder = (order: any) => {
    console.log('Mobile QR Order received:', order);
    
    // Add to floor queue
    const queueItem = {
      id: order.id,
      tableId: order.tableId,
      customerName: order.customerName,
      partySize: order.partySize,
      flavor: order.flavor,
      status: 'waiting',
      estimatedWait: order.estimatedWait,
      priority: order.priority,
      createdAt: new Date().toISOString(),
      source: 'mobile_qr'
    };
    
    setFloorQueue(prev => [queueItem, ...prev]);
    
    // Also add to active sessions for immediate processing
    const activeSession = {
      id: order.id,
      tableId: order.tableId,
      customerName: order.customerName,
      partySize: order.partySize,
      flavor: order.flavor,
      status: 'prep',
      startTime: new Date().toISOString(),
      estimatedEndTime: new Date(Date.now() + 5400000).toISOString(), // 90 minutes
      staffAssigned: {
        prep: 'Alex Chen',
        front: 'Emma Wilson',
        hookah_room: 'Chris Taylor'
      },
      source: 'mobile_qr'
    };
    
    setActiveSessions(prev => [activeSession, ...prev]);
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
          setSelectedSession(getSession(sessionId));
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

  const getStateColor = (state: SessionState) => {
    switch (state) {
      case "READY_FOR_DELIVERY": return "bg-green-100 text-green-800";
      case "OUT_FOR_DELIVERY": return "bg-blue-100 text-blue-800";
      case "DELIVERED": return "bg-purple-100 text-purple-800";
      case "ACTIVE": return "bg-emerald-100 text-emerald-800";
      case "CLOSE_PENDING": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStateIcon = (state: SessionState) => {
    switch (state) {
      case "READY_FOR_DELIVERY": return "✅";
      case "OUT_FOR_DELIVERY": return "🚚";
      case "DELIVERED": return "🎯";
      case "ACTIVE": return "🍃";
      case "CLOSE_PENDING": return "⏰";
      default: return "❓";
    }
  };

  const getPriorityScore = (session: Session) => {
    // Higher score = higher priority
    switch (session.state) {
      case "READY_FOR_DELIVERY": return 100;
      case "OUT_FOR_DELIVERY": return 90;
      case "DELIVERED": return 80;
      case "ACTIVE": return 70;
      case "CLOSE_PENDING": return 60;
      default: return 0;
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
            <MobileQRGenerator 
              onOrderCreated={handleMobileQROrder}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Floor Queue */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Floor Queue</h2>
                <p className="text-sm text-gray-500">
                  {floorQueue.length + activeSessions.length} sessions on floor
                  {floorQueue.length > 0 && ` (${floorQueue.length} waiting, ${activeSessions.length} active)`}
                </p>
              </div>
              <div className="p-6">
                {floorQueue.length === 0 && activeSessions.length === 0 && sessions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">🍃</div>
                    <p>No sessions on floor</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Mobile QR Orders in Queue */}
                    {floorQueue.map((queueItem) => (
                      <div
                        key={queueItem.id}
                        className="p-4 rounded-lg border border-purple-200 bg-purple-50 cursor-pointer transition-all hover:shadow-md hover:border-purple-300"
                        onClick={() => setSelectedSession({
                          id: queueItem.id,
                          table: queueItem.tableId,
                          state: 'WAITING',
                          meta: { customerId: queueItem.customerName },
                          timers: {},
                          source: 'mobile_qr'
                        } as any)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">📱</span>
                            <div>
                              <div className="font-medium text-gray-900">
                                {queueItem.tableId} - {queueItem.customerName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {queueItem.flavor} • Party of {queueItem.partySize}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              queueItem.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {queueItem.priority} priority
                            </span>
                            <div className="text-xs text-gray-500 mt-1">
                              Wait: {queueItem.estimatedWait}m
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Active Mobile QR Sessions */}
                    {activeSessions.map((activeSession) => (
                      <div
                        key={activeSession.id}
                        className="p-4 rounded-lg border border-green-200 bg-green-50 cursor-pointer transition-all hover:shadow-md hover:border-green-300"
                        onClick={() => setSelectedSession({
                          id: activeSession.id,
                          table: activeSession.tableId,
                          state: 'PREP',
                          meta: { customerId: activeSession.customerName },
                          timers: { heatUpStart: activeSession.startTime },
                          source: 'mobile_qr'
                        } as any)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">🔥</span>
                            <div>
                              <div className="font-medium text-gray-900">
                                {activeSession.tableId} - {activeSession.customerName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {activeSession.flavor} • Party of {activeSession.partySize}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {activeSession.status}
                            </span>
                            <div className="text-xs text-gray-500 mt-1">
                              Started: {new Date(activeSession.startTime).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-600">
                          Staff: {activeSession.staffAssigned.prep} (Prep), {activeSession.staffAssigned.front} (Front)
                        </div>
                      </div>
                    ))}

                    {/* Regular Sessions */}
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
                            <span className="text-2xl">{getStateIcon(session.state)}</span>
                            <div>
                              <div className="font-medium text-gray-900">
                                Table {session.table}
                              </div>
                              <div className="text-sm text-gray-500">
                                Session {session.id.slice(-6)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStateColor(session.state)}`}>
                              {session.state.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </div>
                        
                        {session.meta.customerId && (
                          <div className="mt-2 text-sm text-gray-600">
                            Customer: {session.meta.customerId}
                          </div>
                        )}

                        {/* Timer info */}
                        {session.timers.heatUpStart && (
                          <div className="mt-2 text-xs text-gray-500">
                            Heat started: {new Date(session.timers.heatUpStart).toLocaleTimeString()}
                          </div>
                        )}
                        {session.timers.deliveredAt && (
                          <div className="mt-1 text-xs text-gray-500">
                            Delivered: {new Date(session.timers.deliveredAt).toLocaleTimeString()}
                          </div>
                        )}
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
                    Table {selectedSession.table} - {selectedSession.state.replace(/_/g, ' ')}
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
                    {/* Mobile QR Order Controls */}
                    {selectedSession.source === 'mobile_qr' && (
                      <>
                        {selectedSession.state === "WAITING" && (
                          <div className="space-y-3">
                            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                              <h3 className="font-medium text-purple-900 mb-2">Mobile QR Order</h3>
                              <p className="text-sm text-purple-700">
                                Ready to start preparation. This order was created via Mobile QR.
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                // Move from queue to active
                                setFloorQueue(prev => prev.filter(item => item.id !== selectedSession.id));
                                setActiveSessions(prev => [...prev, {
                                  id: selectedSession.id,
                                  tableId: selectedSession.table,
                                  customerName: selectedSession.meta.customerId,
                                  status: 'prep',
                                  startTime: new Date().toISOString(),
                                  estimatedEndTime: new Date(Date.now() + 5400000).toISOString(),
                                  staffAssigned: {
                                    prep: 'Alex Chen',
                                    front: 'Emma Wilson',
                                    hookah_room: 'Chris Taylor'
                                  }
                                }]);
                                setSelectedSession({
                                  ...selectedSession,
                                  state: 'PREP'
                                });
                              }}
                              className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                            >
                              Start Preparation
                            </button>
                          </div>
                        )}
                        
                        {selectedSession.state === "PREP" && (
                          <div className="space-y-3">
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                              <h3 className="font-medium text-green-900 mb-2">In Preparation</h3>
                              <p className="text-sm text-green-700">
                                Mobile QR order is being prepared by staff.
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedSession({
                                  ...selectedSession,
                                  state: 'READY_FOR_DELIVERY'
                                });
                              }}
                              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                            >
                              Mark Ready for Delivery
                            </button>
                          </div>
                        )}
                      </>
                    )}

                    {/* FOH Commands */}
                    {selectedSession.state === "READY_FOR_DELIVERY" && (
                      <button
                        onClick={() => handleCommand(selectedSession.id, "DELIVER_NOW")}
                        disabled={loading[selectedSession.id]}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading[selectedSession.id] ? "Processing..." : "Start Delivery"}
                      </button>
                    )}

                    {selectedSession.state === "OUT_FOR_DELIVERY" && (
                      <button
                        onClick={() => handleCommand(selectedSession.id, "MARK_DELIVERED")}
                        disabled={loading[selectedSession.id]}
                        className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading[selectedSession.id] ? "Processing..." : "Mark Delivered"}
                      </button>
                    )}

                    {selectedSession.state === "DELIVERED" && (
                      <button
                        onClick={() => handleCommand(selectedSession.id, "START_ACTIVE")}
                        disabled={loading[selectedSession.id]}
                        className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading[selectedSession.id] ? "Processing..." : "Start Active Session"}
                      </button>
                    )}

                    {selectedSession.state === "ACTIVE" && (
                      <button
                        onClick={() => handleCommand(selectedSession.id, "CLOSE_SESSION")}
                        disabled={loading[selectedSession.id]}
                        className="w-full bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading[selectedSession.id] ? "Processing..." : "Close Session"}
                      </button>
                    )}

                    {/* Common Commands */}
                    {["READY_FOR_DELIVERY", "OUT_FOR_DELIVERY", "DELIVERED", "ACTIVE"].includes(selectedSession.state) && (
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
                        <div>Table: {selectedSession.table}</div>
                        <div>State: {selectedSession.state}</div>
                        <div>Items: {selectedSession.items.length}</div>
                        {selectedSession.timers.heatUpStart && (
                          <div>Heat Start: {new Date(selectedSession.timers.heatUpStart).toLocaleTimeString()}</div>
                        )}
                        {selectedSession.timers.deliveredAt && (
                          <div>Delivered: {new Date(selectedSession.timers.deliveredAt).toLocaleTimeString()}</div>
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
    </div>
  );
};

export default FOHFloorDashboard;
