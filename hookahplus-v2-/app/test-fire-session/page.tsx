"use client";

import { useState, useEffect } from "react";
import { sessionCommands } from "@/lib/cmd";
import { getSession, seedSession, type SessionState } from "@/lib/sessionState";

const TestFireSession = () => {
  const [session, setSession] = useState<SessionState | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastCommand, setLastCommand] = useState<string>("");

  useEffect(() => {
    // Seed a demo session on component mount
    const demoSession = seedSession("test_session");
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
        if (updatedSession) {
          setSession(updatedSession);
        }
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
    const demoSession = seedSession("test_session");
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
              <p className="text-sm text-gray-900">{session.tableNumber}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Current State</label>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {session.status.replace(/_/g, ' ')}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Customer</label>
              <p className="text-sm text-gray-900">{session.customerName}</p>
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
                disabled={loading || session.status !== "NEW"}
                className="w-full bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Payment
              </button>
              <button
                onClick={() => handleCommand("PAYMENT_FAILED")}
                disabled={loading || session.status !== "NEW"}
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
                disabled={loading || session.status !== "PAID_CONFIRMED"}
                className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Claim Prep
              </button>
              <button
                onClick={() => handleCommand("START_PREP")}
                disabled={loading || session.status !== "PAID_CONFIRMED"}
                className="w-full bg-orange-600 text-white px-3 py-2 rounded text-sm hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Prep
              </button>
            </div>

            {/* FOH Commands */}
            <div className="space-y-2">
              <h3 className="font-medium text-gray-700 text-sm">Front of House</h3>
              <button
                onClick={() => handleCommand("START_ACTIVE")}
                disabled={loading || session.status !== "PREP_IN_PROGRESS"}
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
                disabled={loading || session.status !== "ACTIVE"}
                className="w-full bg-yellow-600 text-white px-3 py-2 rounded text-sm hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Close Session
              </button>
              <button
                onClick={() => handleCommand("REMAKE", { reason: "Test remake" })}
                disabled={loading || !["PREP_IN_PROGRESS", "ACTIVE"].includes(session.status)}
                className="w-full bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Remake
              </button>
            </div>
          </div>
        </div>

        {/* Session Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Session Information</h2>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              <strong>Total Amount:</strong> ${session.totalAmount.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Items:</strong> {session.items.length} item(s)
            </p>
            {session.notes && (
              <p className="text-sm text-gray-600">
                <strong>Notes:</strong> {session.notes}
              </p>
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