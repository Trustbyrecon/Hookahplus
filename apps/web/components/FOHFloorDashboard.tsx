"use client";

import { useState, useEffect } from "react";
import { sessionCommands } from "@/lib/cmd";
import { getSession, getAllSessions, type Session, type SessionState } from "@/lib/sessionState";

const FOHFloorDashboard = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  // Refresh sessions
  const refreshSessions = () => {
    const allSessions = getAllSessions();
    const floorSessions = allSessions.filter(s => 
      ["READY_FOR_DELIVERY", "OUT_FOR_DELIVERY", "DELIVERED", "ACTIVE", "CLOSE_PENDING"].includes(s.state)
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
      
      if (result?.ok) {
        refreshSessions();
        // Show success message
        console.log(`✅ ${command} successful for session ${sessionId}`);
      } else {
        console.error(`❌ ${command} failed:`, result?.error);
      }
    } catch (error) {
      console.error(`❌ ${command} error:`, error);
    } finally {
      setLoading(prev => ({ ...prev, [sessionId]: false }));
    }
  };

  const getStatusColor = (state: SessionState) => {
    switch (state) {
      case "READY_FOR_DELIVERY": return "text-green-400";
      case "OUT_FOR_DELIVERY": return "text-blue-400";
      case "DELIVERED": return "text-purple-400";
      case "ACTIVE": return "text-yellow-400";
      case "CLOSE_PENDING": return "text-orange-400";
      default: return "text-gray-400";
    }
  };

  const getStatusIcon = (state: SessionState) => {
    switch (state) {
      case "READY_FOR_DELIVERY": return "📦";
      case "OUT_FOR_DELIVERY": return "🚚";
      case "DELIVERED": return "✅";
      case "ACTIVE": return "🔥";
      case "CLOSE_PENDING": return "⏰";
      default: return "❓";
    }
  };

  const getSessionDuration = (session: Session) => {
    if (!session.timers.deliveredAt) return "Not delivered";
    const now = Date.now();
    const deliveredAt = session.timers.deliveredAt;
    const duration = Math.floor((now - deliveredAt) / 1000 / 60); // minutes
    return `${duration} min`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-green-300">Floor Sessions</h2>
        <div className="text-sm text-gray-400">
          {sessions.length} active floor sessions
        </div>
      </div>

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <div className="text-4xl mb-2">👥</div>
          <p>No sessions on floor</p>
          <p className="text-sm">Ready sessions will appear here</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {sessions.map((session) => (
            <div key={session.id} className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getStatusIcon(session.state)}</span>
                  <div>
                    <h3 className="font-semibold text-white">Table {session.table}</h3>
                    <p className="text-sm text-gray-400">
                      {session.items.map(item => `${item.sku} x${item.qty}`).join(", ")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${getStatusColor(session.state)}`}>
                    {session.state.replace(/_/g, " ")}
                  </div>
                  <div className="text-xs text-gray-400">
                    {getSessionDuration(session)}
                  </div>
                </div>
              </div>

              {/* Session Details */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-400">Payment:</span>
                  <span className={`ml-2 ${
                    session.payment.status === 'confirmed' ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {session.payment.status}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">VIP:</span>
                  <span className={`ml-2 ${session.flags.vip ? 'text-yellow-400' : 'text-gray-400'}`}>
                    {session.flags.vip ? 'Yes' : 'No'}
                  </span>
                </div>
                {session.flags.allergy && (
                  <div className="col-span-2">
                    <span className="text-red-400">⚠️ Allergy Alert:</span>
                    <span className="ml-2 text-red-300">{session.flags.allergy}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 flex-wrap">
                {session.state === "READY_FOR_DELIVERY" && (
                  <button
                    onClick={() => handleCommand(session.id, "DELIVER_NOW")}
                    disabled={loading[session.id]}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm rounded transition-colors"
                  >
                    {loading[session.id] ? "..." : "🚚 Deliver Now"}
                  </button>
                )}
                
                {session.state === "OUT_FOR_DELIVERY" && (
                  <button
                    onClick={() => handleCommand(session.id, "MARK_DELIVERED")}
                    disabled={loading[session.id]}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white text-sm rounded transition-colors"
                  >
                    {loading[session.id] ? "..." : "✅ Mark Delivered"}
                  </button>
                )}
                
                {session.state === "DELIVERED" && (
                  <button
                    onClick={() => handleCommand(session.id, "START_ACTIVE")}
                    disabled={loading[session.id]}
                    className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white text-sm rounded transition-colors"
                  >
                    {loading[session.id] ? "..." : "🔥 Start Active Session"}
                  </button>
                )}

                {session.state === "ACTIVE" && (
                  <button
                    onClick={() => handleCommand(session.id, "CLOSE_SESSION")}
                    disabled={loading[session.id]}
                    className="px-3 py-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white text-sm rounded transition-colors"
                  >
                    {loading[session.id] ? "..." : "⏰ Close Session"}
                  </button>
                )}

                {/* Edge Case Buttons */}
                <button
                  onClick={() => handleCommand(session.id, "REMAKE", { reason: "Customer complaint" })}
                  disabled={loading[session.id]}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white text-sm rounded transition-colors"
                >
                  🔄 Remake
                </button>
                
                <button
                  onClick={() => handleCommand(session.id, "STAFF_HOLD", { reason: "Customer request" })}
                  disabled={loading[session.id]}
                  className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white text-sm rounded transition-colors"
                >
                  ⏸️ Hold
                </button>
              </div>

              {/* Session Timer */}
              {session.state === "ACTIVE" && session.timers.expiresAt && (
                <div className="mt-3 pt-3 border-t border-zinc-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Session Timer:</span>
                    <span className="text-yellow-400">
                      {Math.max(0, Math.floor((session.timers.expiresAt - Date.now()) / 1000 / 60))} min remaining
                    </span>
                  </div>
                  <div className="w-full bg-zinc-700 rounded-full h-2 mt-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${Math.max(0, Math.min(100, ((session.timers.expiresAt - Date.now()) / (session.timers.expiresAt - session.timers.deliveredAt!)) * 100))}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Session Notes */}
              {session.audit.length > 0 && (
                <div className="mt-3 pt-3 border-t border-zinc-700">
                  <div className="text-xs text-gray-400 mb-1">Recent Activity:</div>
                  <div className="space-y-1">
                    {session.audit.slice(-3).map((event, index) => (
                      <div key={index} className="text-xs text-gray-300">
                        <span className="text-gray-500">
                          {new Date(event.ts).toLocaleTimeString()}
                        </span>
                        <span className="mx-2">•</span>
                        <span className="text-green-300">{event.actor.role}</span>
                        <span className="mx-1">•</span>
                        <span>{event.cmd || event.type}</span>
                        {event.reason && (
                          <span className="text-gray-400 ml-1">({event.reason})</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Selected Session Details */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-800 rounded-lg p-6 max-w-md w-full max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Session {selectedSession.id} Details
              </h3>
              <button
                onClick={() => setSelectedSession(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-2 text-sm">
              <div><span className="text-gray-400">Table:</span> {selectedSession.table}</div>
              <div><span className="text-gray-400">State:</span> {selectedSession.state}</div>
              <div><span className="text-gray-400">Payment:</span> {selectedSession.payment.status}</div>
              <div><span className="text-gray-400">VIP:</span> {selectedSession.flags.vip ? 'Yes' : 'No'}</div>
              {selectedSession.flags.allergy && (
                <div><span className="text-red-400">Allergy:</span> {selectedSession.flags.allergy}</div>
              )}
              <div><span className="text-gray-400">Duration:</span> {getSessionDuration(selectedSession)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FOHFloorDashboard;








