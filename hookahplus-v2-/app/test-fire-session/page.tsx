"use client";

import { useState, useEffect } from "react";
import { sessionCommands } from "@/lib/cmd";
import { getSession, seedSession, type Session } from "@/lib/sessionState";

const TestFireSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastCommand, setLastCommand] = useState<string>("");

  useEffect(() => {
    // Seed a demo session on component mount
    const demoSession = seedSession("test_session", "T-99");
    setSession(demoSession);
  }, []);

  const handleCommand = async (cmd: string, data?: any) => {
    if (!session) return;
    
    setLoading(true);
    setLastCommand(cmd);
    
    try {
      const result = await fetch(`/api/sessions/${session.id}/command`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cmd, data, actor: "system" })
      });
      
      const response = await result.json();
      
      if (response.ok) {
        // Refresh session data
        const updatedSession = getSession(session.id);
        setSession(updatedSession);
      } else {
        alert(`Command failed: ${response.error}`);
      }
    } catch (error) {
      console.error("Command error:", error);
      alert("Command failed");
    } finally {
      setLoading(false);
    }
  };

  const resetSession = () => {
    const demoSession = seedSession("test_session", "T-99");
    setSession(demoSession);
    setLastCommand("");
  };

  if (!session) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Fire Session State Machine Test</h1>
          <p className="text-gray-600">Test all session transitions and commands</p>
        </div>

        {/* Session Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Session Status</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Session ID</label>
              <p className="text-sm text-gray-900">{session.id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Table</label>
              <p className="text-sm text-gray-900">{session.table}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Current State</label>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {session.state.replace(/_/g, ' ')}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Status</label>
              <p className="text-sm text-gray-900">{session.payment.status}</p>
            </div>
          </div>
          
          {lastCommand && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-green-800">
                Last command: <strong>{lastCommand}</strong>
              </p>
            </div>
          )}
        </div>

        {/* Available Commands */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Commands</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Payment Commands */}
            <div className="space-y-2">
              <h3 className="font-medium text-gray-700 text-sm">Payment</h3>
              <button
                onClick={() => handleCommand("PAYMENT_CONFIRMED")}
                disabled={loading || session.state !== "NEW"}
                className="w-full bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Payment
              </button>
              <button
                onClick={() => handleCommand("PAYMENT_FAILED")}
                disabled={loading || session.state !== "NEW"}
                className="w-full bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Payment Failed
              </button>
            </div>

            {/* BOH Commands */}
            <div className="space-y-2">
              <h3 className="font-medium text-gray-700 text-sm">Back of House</h3>
              <button
                onClick={() => handleCommand("CLAIM_PREP")}
                disabled={loading || session.state !== "PAID_CONFIRMED"}
                className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Claim Prep
              </button>
              <button
                onClick={() => handleCommand("HEAT_UP")}
                disabled={loading || session.state !== "PREP_IN_PROGRESS"}
                className="w-full bg-orange-600 text-white px-3 py-2 rounded text-sm hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Heating
              </button>
              <button
                onClick={() => handleCommand("READY_FOR_DELIVERY")}
                disabled={loading || session.state !== "HEAT_UP"}
                className="w-full bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Ready for Delivery
              </button>
            </div>

            {/* FOH Commands */}
            <div className="space-y-2">
              <h3 className="font-medium text-gray-700 text-sm">Front of House</h3>
              <button
                onClick={() => handleCommand("DELIVER_NOW")}
                disabled={loading || session.state !== "READY_FOR_DELIVERY"}
                className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Delivery
              </button>
              <button
                onClick={() => handleCommand("MARK_DELIVERED")}
                disabled={loading || session.state !== "OUT_FOR_DELIVERY"}
                className="w-full bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mark Delivered
              </button>
              <button
                onClick={() => handleCommand("START_ACTIVE")}
                disabled={loading || session.state !== "DELIVERED"}
                className="w-full bg-emerald-600 text-white px-3 py-2 rounded text-sm hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Active Session
              </button>
            </div>

            {/* Session Management */}
            <div className="space-y-2">
              <h3 className="font-medium text-gray-700 text-sm">Session Management</h3>
              <button
                onClick={() => handleCommand("CLOSE_SESSION")}
                disabled={loading || session.state !== "ACTIVE"}
                className="w-full bg-yellow-600 text-white px-3 py-2 rounded text-sm hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Close Session
              </button>
              <button
                onClick={() => handleCommand("REMAKE", { reason: "Test remake" })}
                disabled={loading || !["PREP_IN_PROGRESS", "HEAT_UP", "READY_FOR_DELIVERY", "DELIVERED", "ACTIVE"].includes(session.state)}
                className="w-full bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Remake
              </button>
              <button
                onClick={() => handleCommand("STAFF_HOLD", { reason: "Test hold" })}
                disabled={loading || !["PREP_IN_PROGRESS", "HEAT_UP", "READY_FOR_DELIVERY", "OUT_FOR_DELIVERY", "DELIVERED", "ACTIVE"].includes(session.state)}
                className="w-full bg-yellow-600 text-white px-3 py-2 rounded text-sm hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Staff Hold
              </button>
            </div>
          </div>
        </div>

        {/* Session Audit */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Session Audit Trail</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {session.audit.length === 0 ? (
              <p className="text-gray-500 text-sm">No audit events yet</p>
            ) : (
              session.audit.map((event, index) => (
                <div key={event.id} className="p-3 bg-gray-50 rounded border-l-4 border-blue-500">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {event.cmd || event.type}
                      </p>
                      <p className="text-xs text-gray-600">
                        {event.from && event.to ? `${event.from} → ${event.to}` : event.type}
                      </p>
                      {event.reason && (
                        <p className="text-xs text-gray-500 mt-1">Reason: {event.reason}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(event.ts).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Reset Button */}
        <div className="mt-6 text-center">
          <button
            onClick={resetSession}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
          >
            Reset Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestFireSession;
