// app/reflex-monitoring/page.tsx
"use client";
import { useEffect, useState } from "react";
import { reflexOrchestrator } from "../../lib/reflex-orchestrator";

interface AgentScore {
  name: string;
  score: number;
  status: 'calibrating' | 'stable' | 'ready';
  lastUpdate: number;
  drift: number;
}

interface ReflexCycle {
  id: number;
  status: 'active' | 'calibrating' | 'mvp-ready' | 'locked';
  startTime: number;
  consensus: number;
  agents: Record<string, AgentScore>;
  calibrationRounds: number;
  mvpTriggered: boolean;
}

export default function ReflexMonitoringDashboard() {
  const [cycleStatus, setCycleStatus] = useState<ReflexCycle | null>(null);
  const [agentScores, setAgentScores] = useState<Record<string, AgentScore>>({});
  const [consensus, setConsensus] = useState(0);
  const [isMVPReady, setIsMVPReady] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);

  async function fetchReflexStatus() {
    try {
      const res = await fetch("/api/reflex-monitoring", { 
        cache: "no-store",
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      const json = await res.json();
      if (json.success) {
        setCycleStatus(json.cycle);
        setAgentScores(json.agents);
        setConsensus(json.consensus);
        setIsMVPReady(json.isMVPReady);
      }
    } catch (error) {
      console.error('Error fetching Reflex status:', error);
    }
  }

  async function startCalibration() {
    try {
      const res = await fetch('/api/reflex-monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start_calibration' })
      });
      if (res.ok) {
        setIsCalibrating(true);
        console.log('🚀 Calibration loop started');
      }
    } catch (error) {
      console.error('Error starting calibration:', error);
    }
  }

  async function stopCalibration() {
    try {
      const res = await fetch('/api/reflex-monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop_calibration' })
      });
      if (res.ok) {
        setIsCalibrating(false);
        console.log('🛑 Calibration loop stopped');
      }
    } catch (error) {
      console.error('Error stopping calibration:', error);
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'ready': return 'text-green-400';
      case 'stable': return 'text-blue-400';
      case 'calibrating': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'ready': return '✅';
      case 'stable': return '🟢';
      case 'calibrating': return '🔄';
      default: return '⚪';
    }
  }

  function getCycleStatusColor(status: string) {
    switch (status) {
      case 'mvp-ready': return 'text-green-400';
      case 'locked': return 'text-purple-400';
      case 'calibrating': return 'text-yellow-400';
      case 'active': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  }

  function formatTime(timestamp: number) {
    return new Date(timestamp).toLocaleTimeString();
  }

  useEffect(() => {
    fetchReflexStatus();
    const interval = setInterval(fetchReflexStatus, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-teal-400">Reflex Agent Monitoring</h1>
            <p className="text-zinc-400 text-lg">Cycle 10 — Full MVP-Ready Run</p>
          </div>
          <div className="flex items-center gap-4">
            {!isCalibrating ? (
              <button
                onClick={startCalibration}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg text-lg font-medium transition-colors"
              >
                🚀 Start Calibration
              </button>
            ) : (
              <button
                onClick={stopCalibration}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg text-lg font-medium transition-colors"
              >
                🛑 Stop Calibration
              </button>
            )}
            <button
              onClick={fetchReflexStatus}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg text-lg font-medium transition-colors"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Cycle Status */}
        {cycleStatus && (
          <div className="bg-zinc-900 border border-teal-500 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-teal-300">Cycle {cycleStatus.id} Status</h2>
              <div className={`text-xl font-bold ${getCycleStatusColor(cycleStatus.status)}`}>
                {cycleStatus.status.toUpperCase()}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-400">{cycleStatus.id}</div>
                <div className="text-zinc-400 text-sm">Cycle ID</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">
                  {cycleStatus.calibrationRounds}
                </div>
                <div className="text-zinc-400 text-sm">Calibration Rounds</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">
                  {consensus.toFixed(2)}
                </div>
                <div className="text-zinc-400 text-sm">Consensus Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">
                  {cycleStatus.mvpTriggered ? 'YES' : 'NO'}
                </div>
                <div className="text-zinc-400 text-sm">MVP Triggered</div>
              </div>
            </div>

            {cycleStatus.startTime && (
              <div className="mt-4 text-center text-zinc-400">
                Started: {formatTime(cycleStatus.startTime)}
              </div>
            )}
          </div>
        )}

        {/* Agent Scores */}
        <div className="bg-zinc-900 border border-teal-500 rounded-xl p-6">
          <h2 className="text-2xl font-semibold text-teal-300 mb-6">Agent Performance</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(agentScores).map(([key, agent]) => (
              <div key={key} className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">{agent.name}</h3>
                  <span className={`text-2xl ${getStatusColor(agent.status)}`}>
                    {getStatusIcon(agent.status)}
                  </span>
                </div>
                
                <div className="text-center mb-3">
                  <div className="text-3xl font-bold text-teal-400">
                    {agent.score.toFixed(2)}
                  </div>
                  <div className="text-zinc-400 text-sm">Score</div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Status:</span>
                    <span className={`font-medium ${getStatusColor(agent.status)}`}>
                      {agent.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Drift:</span>
                    <span className={`font-medium ${agent.drift >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {agent.drift >= 0 ? '+' : ''}{agent.drift.toFixed(3)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Updated:</span>
                    <span className="text-zinc-300">
                      {formatTime(agent.lastUpdate)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MVP Ready Status */}
        <div className={`bg-zinc-900 border rounded-xl p-6 ${
          isMVPReady ? 'border-green-500' : 'border-yellow-500'
        }`}>
          <div className="text-center">
            <div className="text-6xl mb-4">
              {isMVPReady ? '🎉' : '⏳'}
            </div>
            <h2 className={`text-2xl font-bold mb-2 ${
              isMVPReady ? 'text-green-400' : 'text-yellow-400'
            }`}>
              {isMVPReady ? 'MVP READY!' : 'Calibrating for MVP...'}
            </h2>
            <p className="text-zinc-400 text-lg">
              {isMVPReady 
                ? 'Cycle 10 has achieved consensus ≥0.85 and is ready for deployment'
                : `Target consensus: ≥0.85 (Current: ${consensus.toFixed(2)})`
              }
            </p>
            
            {isMVPReady && (
              <div className="mt-4 p-4 bg-green-900/20 border border-green-500 rounded-lg">
                <h3 className="text-lg font-semibold text-green-300 mb-2">🚀 MVP Deployment Sequence:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="text-green-200">✅ Netlify Deploy (hookahplus.net/demo)</div>
                  <div className="text-green-200">✅ Stripe Checkout (Sandbox)</div>
                  <div className="text-green-200">✅ QR Onboarding</div>
                  <div className="text-green-200">✅ Session Assistant</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-zinc-900 border border-blue-500 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-blue-300 mb-4">📋 Cycle 10 Instructions</h2>
          <div className="space-y-3 text-zinc-300">
            <div className="flex items-start gap-2">
              <span className="text-blue-400">1.</span>
              <span>Click "Start Calibration" to begin the MVP-ready run</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-400">2.</span>
              <span>Monitor agent scores as they calibrate toward consensus ≥0.85</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-400">3.</span>
              <span>When consensus ≥0.85 is achieved, MVP deployment will automatically trigger</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-400">4.</span>
              <span>After deployment, Cycle 10 will be locked as MVP-Ready</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
