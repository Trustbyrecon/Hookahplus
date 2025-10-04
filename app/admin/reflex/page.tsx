// app/admin/reflex/page.tsx
// Reflex System Dashboard

'use client';

import React, { useState } from 'react';
import ReflexMonitor from '../../../components/ReflexMonitor';
import ReflexScoreIndicator from '../../../components/ReflexScoreIndicator';
import ReflexAlert from '../../../components/ReflexAlert';
import type { GhostLogEntry, ReflexScore } from '../../../types/reflex';

export default function ReflexDashboard() {
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [refreshInterval, setRefreshInterval] = useState<number>(5000);
  const [showDetails, setShowDetails] = useState<boolean>(true);
  const [recentEntries, setRecentEntries] = useState<GhostLogEntry[]>([]);

  // Mock data for demonstration
  const mockScore: ReflexScore = {
    value: 0.89,
    components: {
      accuracy: 0.92,
      completeness: 0.88,
      consistency: 0.85,
      efficiency: 0.91,
      security: 0.95
    },
    gateDecision: 'recover',
    confidence: 0.87,
    timestamp: Date.now(),
    agentId: 'badge_engine_001',
    operationId: 'op_123456'
  };

  const agents = [
    { id: 'badge_engine_001', name: 'Badge Engine' },
    { id: 'events_api_001', name: 'Events API' },
    { id: 'badges_api_001', name: 'Badges API' },
    { id: 'export_api_001', name: 'Export API' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reflex System Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Real-time monitoring of AI agent performance and self-diagnostic capabilities
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Dashboard Controls</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Agent
              </label>
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Agents</option>
                {agents.map(agent => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Refresh Interval (seconds)
              </label>
              <select
                value={refreshInterval / 1000}
                onChange={(e) => setRefreshInterval(parseInt(e.target.value) * 1000)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>1 second</option>
                <option value={5}>5 seconds</option>
                <option value={10}>10 seconds</option>
                <option value={30}>30 seconds</option>
                <option value={60}>1 minute</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showDetails}
                  onChange={(e) => setShowDetails(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Show Detailed Operations</span>
              </label>
            </div>
          </div>
        </div>

        {/* Current Score Indicator */}
        <div className="mb-6">
          <ReflexScoreIndicator
            score={mockScore}
            showDetails={true}
            size="lg"
            showGateDecision={true}
          />
        </div>

        {/* Main Monitor */}
        <ReflexMonitor
          agentId={selectedAgent || undefined}
          refreshInterval={refreshInterval}
          showDetails={showDetails}
        />

        {/* Reflex Manifesto Link */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            🧠 Agent Reflex Manifesto
          </h3>
          <p className="text-blue-800 mb-4">
            This dashboard implements the Agent Reflex Manifesto principles for self-aware AI systems.
            Every operation is scored, logged, and monitored for continuous improvement.
          </p>
          <div className="flex space-x-4">
            <a
              href="/docs/agent_reflex_manifesto.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              View Manifesto →
            </a>
            <a
              href="/admin"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Back to Admin Panel →
            </a>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <ReflexAlert
        entries={recentEntries}
        autoDismiss={true}
        dismissDelay={10000}
      />
    </div>
  );
}
