"use client";
import React, { useEffect, useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { StatusIndicator } from '../../components/StatusIndicator';
import { TrustLock } from '../../components/TrustLock';
import { 
  Brain, 
  Shield, 
  CreditCard, 
  RefreshCw,
  Play,
  Square,
  BarChart3,
  Settings
} from 'lucide-react';

interface AgentScore {
  name: string;
  score: number;
  status: 'calibrating' | 'stable' | 'ready';
  lastUpdate: number;
  drift: number;
}

interface ReflexCycle {
  id: number;
  status: 'calibrating' | 'stable' | 'ready';
  consensus: number;
  calibrationRounds: number;
  mvpTriggered: boolean;
}

export default function AdminControlCenter() {
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
      default: return 'text-zinc-400';
    }
  }

  useEffect(() => {
    fetchReflexStatus();
    const interval = setInterval(fetchReflexStatus, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Header */}
      <div className="bg-zinc-950 border-b border-teal-500/50">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                Admin <span className="text-teal-400">Control Center</span>
              </h1>
              <p className="text-zinc-400 mt-1">
                System administration and Reflex Agent monitoring
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <StatusIndicator status="online" label="System" value="Operational" />
              <StatusIndicator status="online" label="Agents" value="Running" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Trust Lock Display */}
        <div className="mb-8 flex justify-center">
          <TrustLock trustScore={0.87} status="active" version="TLH-v1" size="lg" />
        </div>

        {/* Reflex Agent Monitoring */}
        <Card className="mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-teal-400 flex items-center gap-2">
                  <Brain className="w-6 h-6" />
                  Reflex Agent Monitoring
                </h2>
                <p className="text-zinc-400">Cycle 09 — Full MVP-Ready Run</p>
              </div>
              <div className="flex items-center gap-4">
                {!isCalibrating ? (
                  <Button
                    onClick={startCalibration}
                    variant="primary"
                    leftIcon={<Play className="w-4 h-4" />}
                  >
                    Start Calibration
                  </Button>
                ) : (
                  <Button
                    onClick={stopCalibration}
                    variant="outline"
                    leftIcon={<Square className="w-4 h-4" />}
                  >
                    Stop Calibration
                  </Button>
                )}
                <Button
                  onClick={fetchReflexStatus}
                  variant="outline"
                  leftIcon={<RefreshCw className="w-4 h-4" />}
                >
                  Refresh
                </Button>
              </div>
            </div>

            {/* Cycle Status */}
            {cycleStatus && (
              <div className="mb-6 p-4 bg-zinc-800 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-zinc-400">Cycle ID</div>
                    <div className="text-lg font-semibold">{cycleStatus.id}</div>
                  </div>
                  <div>
                    <div className="text-sm text-zinc-400">Status</div>
                    <div className={`text-lg font-semibold ${getStatusColor(cycleStatus.status)}`}>
                      {cycleStatus.status.toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-zinc-400">Consensus</div>
                    <div className="text-lg font-semibold text-teal-400">
                      {(cycleStatus.consensus * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-zinc-400">MVP Ready</div>
                    <div className={`text-lg font-semibold ${cycleStatus.mvpTriggered ? 'text-green-400' : 'text-yellow-400'}`}>
                      {cycleStatus.mvpTriggered ? 'YES' : 'NO'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Agent Scores */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(agentScores).map(([name, agent]) => (
                <div key={name} className="p-4 bg-zinc-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold">{agent.name}</div>
                    <div className={`text-sm ${getStatusColor(agent.status)}`}>
                      {agent.status.toUpperCase()}
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-teal-400 mb-1">
                    {agent.score.toFixed(2)}
                  </div>
                  <div className="text-xs text-zinc-400">
                    Drift: {agent.drift.toFixed(3)}
                  </div>
                </div>
              ))}
            </div>

            {/* System Health */}
            <div className="mt-6 p-4 bg-zinc-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-zinc-400">System Health</div>
                  <div className="text-lg font-semibold text-green-400">EXCELLENT</div>
                </div>
                <div>
                  <div className="text-sm text-zinc-400">Last Updated</div>
                  <div className="text-lg font-semibold">
                    {new Date().toLocaleTimeString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-zinc-400">HiTrust</div>
                  <div className="text-lg font-semibold text-teal-400">TLH-v1::active</div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="w-6 h-6 text-teal-400" />
                <h3 className="text-lg font-semibold">Analytics</h3>
              </div>
              <p className="text-zinc-400 text-sm mb-4">
                View system performance and agent metrics
              </p>
              <Button variant="outline" size="sm">
                View Analytics
              </Button>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Settings className="w-6 h-6 text-teal-400" />
                <h3 className="text-lg font-semibold">Configuration</h3>
              </div>
              <p className="text-zinc-400 text-sm mb-4">
                Manage system settings and agent parameters
              </p>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-teal-400" />
                <h3 className="text-lg font-semibold">Security</h3>
              </div>
              <p className="text-zinc-400 text-sm mb-4">
                Monitor security status and access controls
              </p>
              <Button variant="outline" size="sm">
                Security Panel
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
