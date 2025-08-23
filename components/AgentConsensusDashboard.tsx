"use client";

import React, { useEffect, useState } from 'react';
import { Activity, Shield, CreditCard, Navigation, Brain, Zap, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import agentConsensus, { type ConsensusState, type AgentPulse } from '../lib/agentConsensus';

interface AgentIconProps {
  agentId: string;
  size?: number;
}

function AgentIcon({ agentId, size = 20 }: AgentIconProps) {
  const icons = {
    aliethia: <Brain className={`w-${size} h-${size}`} />,
    ep: <CreditCard className={`w-${size} h-${size}`} />,
    navigator: <Navigation className={`w-${size} h-${size}`} />,
    sentinel: <Shield className={`w-${size} h-${size}`} />,
  };
  
  return icons[agentId as keyof typeof icons] || <Activity className={`w-${size} h-${size}`} />;
}

function AgentPulseDisplay({ pulse }: { pulse: AgentPulse }) {
  const statusColors = {
    green: 'text-emerald-400',
    amber: 'text-amber-400',
    red: 'text-rose-400',
  };
  
  const statusIcons = {
    green: <CheckCircle className="w-4 h-4" />,
    amber: <AlertTriangle className="w-4 h-4" />,
    red: <XCircle className="w-4 h-4" />,
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-zinc-900/40 rounded-lg border border-zinc-800">
      <div className={`${statusColors[pulse.status]}`}>
        {statusIcons[pulse.status]}
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-zinc-200">
          {pulse.agentId.charAt(0).toUpperCase() + pulse.agentId.slice(1)}
        </div>
        <div className="text-xs text-zinc-400">{pulse.message}</div>
        {pulse.metadata && Object.keys(pulse.metadata).length > 0 && (
          <div className="text-xs text-zinc-500 mt-1">
            {Object.entries(pulse.metadata).map(([key, value]) => (
              <span key={key} className="mr-2">
                {key}: {String(value)}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="text-xs text-zinc-500">
        {new Date(pulse.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
}

function ReflexScoreGauge({ score }: { score: number }) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Attention';
  };

  return (
    <div className="text-center">
      <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
        {score}
      </div>
      <div className="text-sm text-zinc-400">{getScoreLabel(score)}</div>
      <div className="w-full bg-zinc-800 rounded-full h-2 mt-2">
        <div 
          className={`h-2 rounded-full ${getScoreColor(score).replace('text-', 'bg-')}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export default function AgentConsensusDashboard() {
  const [consensusState, setConsensusState] = useState<ConsensusState | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const unsubscribe = agentConsensus.subscribe((state) => {
      setConsensusState(state);
    });

    // Get initial state
    setConsensusState(agentConsensus.getState());

    return unsubscribe;
  }, []);

  if (!consensusState) {
    return (
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-zinc-800 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-zinc-800 rounded"></div>
            <div className="h-3 bg-zinc-800 rounded w-5/6"></div>
            <div className="h-3 bg-zinc-800 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  const { agents, consensus, reflexScore, lastCycle, cycleCount } = consensusState;
  const activeAgents = Object.values(agents).filter(agent => agent.status === 'green').length;

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-medium flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-400" />
            Agent Consensus Dashboard
          </h2>
          <p className="text-sm text-zinc-400">
            Real-time agent coordination and Reflex Score monitoring
          </p>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      {/* Consensus Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-950/40 border border-zinc-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">{activeAgents}/4</div>
          <div className="text-sm text-zinc-400">Active Agents</div>
        </div>
        <div className="bg-zinc-950/40 border border-zinc-800 rounded-lg p-4 text-center">
          <div className={`text-2xl font-bold ${consensus ? 'text-emerald-400' : 'text-amber-400'}`}>
            {consensus ? '✓' : '⏳'}
          </div>
          <div className="text-sm text-zinc-400">
            {consensus ? 'Consensus' : 'Building'}
          </div>
        </div>
        <div className="bg-zinc-950/40 border border-zinc-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{cycleCount}</div>
          <div className="text-sm text-zinc-400">Operational Cycles</div>
        </div>
      </div>

      {/* Reflex Score */}
      <div className="bg-zinc-950/40 border border-zinc-800 rounded-lg p-4">
        <h3 className="text-sm font-medium mb-3 text-center">Reflex Score</h3>
        <ReflexScoreGauge score={reflexScore.score} />
        
        {showDetails && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-zinc-800">
            <div className="text-center">
              <div className="text-lg font-semibold text-emerald-400">{reflexScore.confirmedOrders}</div>
              <div className="text-xs text-zinc-400">Orders</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-400">{reflexScore.returningCustomers}</div>
              <div className="text-xs text-zinc-400">Returning</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-rose-400">{reflexScore.anomalyFlags}</div>
              <div className="text-xs text-zinc-400">Anomalies</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-purple-400">{reflexScore.trustLockUptime.toFixed(1)}%</div>
              <div className="text-xs text-zinc-400">Trust Lock</div>
            </div>
          </div>
        )}
      </div>

      {/* Agent Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(agents).map(([agentId, pulse]) => (
          <AgentPulseDisplay key={agentId} pulse={pulse} />
        ))}
      </div>

      {/* Operational Cycle Info */}
      <div className="bg-zinc-950/40 border border-zinc-800 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-400">Last Cycle:</span>
          <span className="text-zinc-200">
            {new Date(lastCycle).toLocaleTimeString()}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-zinc-400">Next Cycle:</span>
          <span className="text-zinc-200">
            {new Date(lastCycle + 5000).toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Test Controls */}
      <div className="bg-zinc-950/40 border border-zinc-800 rounded-lg p-4">
        <h3 className="text-sm font-medium mb-3">Test Controls</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => agentConsensus.triggerOrder({
              customerId: 'test_customer',
              flavor: 'Mint Storm',
              amount: 32
            })}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded transition-colors"
          >
            Simulate Order
          </button>
          <button
            onClick={() => agentConsensus.aliethiaPulse('green', 'Manual activation', { manual: true })}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
          >
            Activate Aliethia
          </button>
          <button
            onClick={() => agentConsensus.sentinelPulse('red', 'Test anomaly', { test: true })}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs rounded transition-colors"
          >
            Test Anomaly
          </button>
        </div>
      </div>
    </div>
  );
}
