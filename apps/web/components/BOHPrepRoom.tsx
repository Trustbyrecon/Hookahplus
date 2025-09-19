"use client";

import { useState, useEffect } from "react";
import { sessionCommands } from "@/lib/cmd";
import { getSession, getAllSessions, type Session, type SessionState } from "@/lib/sessionState";

const BOHPrepRoom = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  // Refresh sessions
  const refreshSessions = () => {
    const allSessions = getAllSessions();
    const prepSessions = allSessions.filter(s => 
      ["PAID_CONFIRMED", "QUEUED_PREP", "PREP_IN_PROGRESS", "HEAT_UP", "READY_FOR_DELIVERY"].includes(s.state)
    );
    setSessions(prepSessions);
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
        case "CLAIM_PREP":
          result = await sessionCommands.claimPrep(sessionId, data);
          break;
        case "HEAT_UP":
          result = await sessionCommands.heatUp(sessionId, data);
          break;
        case "READY_FOR_DELIVERY":
          result = await sessionCommands.readyForDelivery(sessionId, data);
          break;
        case "REMAKE":
          result = await sessionCommands.remake(sessionId, data.reason || "BOH remake", "boh");
          break;
        case "STAFF_HOLD":
          result = await sessionCommands.staffHold(sessionId, data.reason || "BOH hold", "boh");
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
      case "PAID_CONFIRMED": return "text-blue-400";
      case "QUEUED_PREP": return "text-yellow-400";
      case "PREP_IN_PROGRESS": return "text-orange-400";
      case "HEAT_UP": return "text-red-400";
      case "READY_FOR_DELIVERY": return "text-green-400";
      default: return "text-gray-400";
    }
  };

  const getStatusIcon = (state: SessionState) => {
    switch (state) {
      case "PAID_CONFIRMED": return "💰";
      case "QUEUED_PREP": return "⏳";
      case "PREP_IN_PROGRESS": return "👨‍🍳";
      case "HEAT_UP": return "🔥";
      case "READY_FOR_DELIVERY": return "✅";
      default: return "❓";
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-blue-300">Prep Room Sessions</h2>
        <div className="text-sm text-gray-400">
          {sessions.length} active prep sessions
        </div>
      </div>

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <div className="text-4xl mb-2">👨‍🍳</div>
          <p>No sessions in prep room</p>
          <p className="text-sm">New orders will appear here</p>
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
                    {new Date(session.meta.createdBy).toLocaleTimeString()}
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
                {session.state === "PAID_CONFIRMED" && (
                  <button
                    onClick={() => handleCommand(session.id, "CLAIM_PREP")}
                    disabled={loading[session.id]}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm rounded transition-colors"
                  >
                    {loading[session.id] ? "..." : "🚀 Claim Prep"}
                  </button>
                )}
                
                {session.state === "PREP_IN_PROGRESS" && (
                  <button
                    onClick={() => handleCommand(session.id, "HEAT_UP")}
                    disabled={loading[session.id]}
                    className="px-3 py-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white text-sm rounded transition-colors"
                  >
                    {loading[session.id] ? "..." : "🔥 Heat Up"}
                  </button>
                )}
                
                {session.state === "HEAT_UP" && (
                  <button
                    onClick={() => handleCommand(session.id, "READY_FOR_DELIVERY")}
                    disabled={loading[session.id]}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white text-sm rounded transition-colors"
                  >
                    {loading[session.id] ? "..." : "✅ Ready for Delivery"}
                  </button>
                )}

                {/* Edge Case Buttons */}
                <button
                  onClick={() => handleCommand(session.id, "REMAKE", { reason: "Quality issue" })}
                  disabled={loading[session.id]}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white text-sm rounded transition-colors"
                >
                  🔄 Remake
                </button>
                
                <button
                  onClick={() => handleCommand(session.id, "STAFF_HOLD", { reason: "Waiting for ingredients" })}
                  disabled={loading[session.id]}
                  className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white text-sm rounded transition-colors"
                >
                  ⏸️ Hold
                </button>
              </div>

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
                        <span className="text-blue-300">{event.actor.role}</span>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BOHPrepRoom;



