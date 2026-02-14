// apps/web/components/AgentCommanderDashboard.tsx
"use client";

import { useState, useEffect } from 'react';

interface AgentStatus {
  agentId: string;
  status: 'active' | 'warning' | 'error';
  lastActivity: number;
  kpis: Record<string, number>;
}

interface KillSwitch {
  key: string;
  value: boolean;
  description: string;
}

export default function AgentCommanderDashboard() {
  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>([]);
  const [killSwitches, setKillSwitches] = useState<KillSwitch[]>([]);
  const [riskSummary, setRiskSummary] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgentData();
    const interval = setInterval(fetchAgentData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAgentData = async () => {
    try {
      // Fetch commander status
      const commanderRes = await fetch('/api/agents/commander?action=status');
      const commanderData = await commanderRes.json();

      // Fetch Aliethia KPIs
      const aliethiaRes = await fetch('/api/agents/aliethia?action=kpis');
      const aliethiaData = await aliethiaRes.json();

      // Fetch Sentinel risk summary
      const sentinelRes = await fetch('/api/agents/sentinel?action=risk_summary');
      const sentinelData = await sentinelRes.json();

      setAgentStatuses([
        {
          agentId: 'Aliethia.Identity',
          status: 'active',
          lastActivity: Date.now(),
          kpis: aliethiaData.data || {}
        },
        {
          agentId: 'EP.Growth',
          status: 'active',
          lastActivity: Date.now(),
          kpis: {}
        },
        {
          agentId: 'Sentinel.POS',
          status: 'active',
          lastActivity: Date.now(),
          kpis: sentinelData.data || {}
        },
        {
          agentId: 'Care.DPO',
          status: 'active',
          lastActivity: Date.now(),
          kpis: {}
        }
      ]);

      setKillSwitches([
        {
          key: 'POS_CONNECTOR_ENABLED',
          value: commanderData.data?.killSwitches?.POS_CONNECTOR_ENABLED || false,
          description: 'Enable POS API connectors'
        },
        {
          key: 'DISABLE_NETWORK_BADGES',
          value: commanderData.data?.killSwitches?.DISABLE_NETWORK_BADGES || false,
          description: 'Disable network badge system'
        },
        {
          key: 'BADGES_V1_USE_DB',
          value: commanderData.data?.killSwitches?.BADGES_V1_USE_DB || true,
          description: 'Use database for badge storage'
        }
      ]);

      setRiskSummary(sentinelData.data || {});
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch agent data:', error);
      setLoading(false);
    }
  };

  const toggleKillSwitch = async (key: string, currentValue: boolean) => {
    try {
      await fetch('/api/agents/commander', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_killswitch',
          data: { key, value: !currentValue }
        })
      });
      fetchAgentData();
    } catch (error) {
      console.error('Failed to toggle kill switch:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-zinc-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '🟢';
      case 'warning': return '🟡';
      case 'error': return '🔴';
      default: return '⚪';
    }
  };

  if (loading) {
    return (
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-zinc-700 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-zinc-700 rounded"></div>
            <div className="h-4 bg-zinc-700 rounded"></div>
            <div className="h-4 bg-zinc-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <h2 className="text-2xl font-bold text-teal-300 mb-2">Agent Commander Dashboard</h2>
        <p className="text-zinc-400">Monitor and control the AGENT.MD suite</p>
      </div>

      {/* Agent Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {agentStatuses.map((agent) => (
          <div key={agent.agentId} className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">{agent.agentId}</h3>
              <span className="text-2xl">{getStatusIcon(agent.status)}</span>
            </div>
            <div className={`text-sm ${getStatusColor(agent.status)} mb-4`}>
              Status: {agent.status.toUpperCase()}
            </div>
            <div className="space-y-2">
              {Object.entries(agent.kpis).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-zinc-400">{key}:</span>
                  <span className="text-white">{typeof value === 'number' ? value.toFixed(1) : value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Kill Switches */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <h3 className="text-xl font-semibold text-teal-300 mb-4">Kill Switches</h3>
        <div className="space-y-4">
          {killSwitches.map((killSwitch) => (
            <div key={killSwitch.key} className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
              <div>
                <div className="font-medium text-white">{killSwitch.key}</div>
                <div className="text-sm text-zinc-400">{killSwitch.description}</div>
              </div>
              <button
                onClick={() => toggleKillSwitch(killSwitch.key, killSwitch.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  killSwitch.value
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {killSwitch.value ? 'DISABLED' : 'ENABLED'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Summary */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <h3 className="text-xl font-semibold text-teal-300 mb-4">Risk Summary (Last 24h)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(riskSummary).map(([key, value]) => (
            <div key={key} className="text-center">
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="text-sm text-zinc-400">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <h3 className="text-xl font-semibold text-teal-300 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={fetchAgentData}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            🔄 Refresh Data
          </button>
          <button
            onClick={() => window.open('/api/agents/commander?action=events', '_blank')}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            📊 View Events
          </button>
          <button
            onClick={() => window.open('/api/agents/sentinel?action=telemetry', '_blank')}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
          >
            🛡️ View Telemetry
          </button>
        </div>
      </div>
    </div>
  );
}
