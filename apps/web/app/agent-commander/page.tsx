// apps/web/app/agent-commander/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AgentCommanderDashboard from '../../components/AgentCommanderDashboard';

export default function AgentCommanderPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simple authorization check (in production, use proper auth)
    const checkAuth = () => {
      const role = localStorage.getItem('user_role') || 'guest';
      const isAdmin = role === 'admin' || role === 'owner';
      setIsAuthorized(isAdmin);
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-400"></div>
        </div>
      </main>
    );
  }

  if (!isAuthorized) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-red-400 mb-4">Access Denied</h1>
            <p className="text-zinc-400 mb-8">You need admin privileges to access the Agent Commander Dashboard.</p>
            <Link 
              href="/dashboard" 
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Header */}
      <div className="px-4 py-6 border-b border-teal-500/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-teal-300">Agent Commander</h1>
              <p className="text-zinc-400">AGENT.MD Suite Orchestration & Control</p>
            </div>
            <div className="flex gap-4">
              <Link 
                href="/dashboard" 
                className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                ← Dashboard
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <AgentCommanderDashboard />
      </div>

      {/* Footer Info */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <h3 className="text-lg font-semibold text-teal-300 mb-4">AGENT.MD Suite Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-white mb-2">Active Agents</h4>
              <ul className="space-y-1 text-sm text-zinc-400">
                <li>🧠 Aliethia.Identity - Badge & memory engine</li>
                <li>📈 EP.Growth - City-cluster rollout</li>
                <li>🛡️ Sentinel.POS - Stealth monitoring</li>
                <li>🔒 Care.DPO - Privacy & export handling</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">Guardrails Active</h4>
              <ul className="space-y-1 text-sm text-zinc-400">
                <li>✅ POS-agnostic architecture</li>
                <li>✅ No vendor API dependencies</li>
                <li>✅ Stealth mode enabled</li>
                <li>✅ HiTL escalation gates</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
