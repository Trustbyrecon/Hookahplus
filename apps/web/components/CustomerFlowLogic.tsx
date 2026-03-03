"use client";

import { useState, useEffect } from 'react';

interface CustomerFlowState {
  stage: 'ARRIVAL' | 'SEATING' | 'ORDERING' | 'PREPARATION' | 'DELIVERY' | 'ACTIVE_SESSION' | 'REFILL_REQUEST' | 'COAL_REPLACEMENT' | 'SESSION_END' | 'PAYMENT' | 'DEPARTURE';
  substage: string;
  timestamp: number;
  staffAssigned: string[];
  notes: string[];
  edgeCases: string[];
  customerSatisfaction: number;
  estimatedWaitTime: number;
}

interface EdgeCase {
  id: string;
  type: 'STAFF_SHORTAGE' | 'EQUIPMENT_FAILURE' | 'INVENTORY_ISSUE' | 'CUSTOMER_COMPLAINT' | 'TECHNICAL_ISSUE' | 'SAFETY_CONCERN';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  reportedAt: number;
  assignedTo: string | null;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'ESCALATED';
  resolution: string | null;
}

export default function CustomerFlowLogic() {
  const [currentFlow, setCurrentFlow] = useState<CustomerFlowState>({
    stage: 'ARRIVAL',
    substage: 'Greeting',
    timestamp: Date.now(),
    staffAssigned: [],
    notes: ['Customer arrived at lounge'],
    edgeCases: [],
    customerSatisfaction: 5,
    estimatedWaitTime: 5
  });

  const [edgeCases, setEdgeCases] = useState<EdgeCase[]>([]);
  const [isDemoMode, setIsDemoMode] = useState(true);

  // Demo mode automatic progression
  useEffect(() => {
    if (!isDemoMode) return;

    const stageProgression = [
      { stage: 'ARRIVAL', substage: 'Greeting', duration: 3000, notes: ['Customer arrived at lounge', 'Host assigned to table'] },
      { stage: 'SEATING', substage: 'Table Assignment', duration: 2000, notes: ['Table T-001 assigned', 'Menu provided'] },
      { stage: 'ORDERING', substage: 'Flavor Selection', duration: 4000, notes: ['Customer selected Blue Mist + Mint', 'Order confirmed'] },
      { stage: 'PREPARATION', substage: 'Hookah Assembly', duration: 6000, notes: ['BOH staff claimed prep', 'Flavor mixing in progress'] },
      { stage: 'DELIVERY', substage: 'Hookah Delivery', duration: 3000, notes: ['FOH staff picked up hookah', 'Delivered to table'] },
      { stage: 'ACTIVE_SESSION', substage: 'Session Active', duration: 8000, notes: ['Session timer started', 'Customer enjoying hookah'] },
      { stage: 'REFILL_REQUEST', substage: 'Refill Needed', duration: 4000, notes: ['Customer requested refill', 'BOH preparing refill'] },
      { stage: 'COAL_REPLACEMENT', substage: 'Coal Replacement', duration: 3000, notes: ['Coals burned out', 'New coals delivered'] },
      { stage: 'SESSION_END', substage: 'Session Complete', duration: 2000, notes: ['Session time completed', 'Customer satisfied'] },
      { stage: 'PAYMENT', substage: 'Checkout', duration: 3000, notes: ['Payment processed', 'Receipt provided'] },
      { stage: 'DEPARTURE', substage: 'Farewell', duration: 2000, notes: ['Customer thanked', 'Table cleared'] }
    ];

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex >= stageProgression.length) {
        currentIndex = 0; // Loop back to start
      }

      const nextStage = stageProgression[currentIndex];
      setCurrentFlow(prev => ({
        ...prev,
        stage: nextStage.stage as any,
        substage: nextStage.substage,
        timestamp: Date.now(),
        notes: [...prev.notes, ...nextStage.notes]
      }));

      // Simulate edge cases
      if (Math.random() < 0.3) { // 30% chance of edge case
        generateEdgeCase();
      }

      currentIndex++;
    }, 3000);

    return () => clearInterval(interval);
  }, [isDemoMode]);

  const generateEdgeCase = () => {
    const edgeCaseTypes: EdgeCase['type'][] = [
      'STAFF_SHORTAGE', 'EQUIPMENT_FAILURE', 'INVENTORY_ISSUE', 
      'CUSTOMER_COMPLAINT', 'TECHNICAL_ISSUE', 'SAFETY_CONCERN'
    ];
    
    const severities: EdgeCase['severity'][] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    
    const newEdgeCase: EdgeCase = {
      id: `edge-${Date.now()}`,
      type: edgeCaseTypes[Math.floor(Math.random() * edgeCaseTypes.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      description: `Edge case generated during ${currentFlow.stage.toLowerCase()}`,
      reportedAt: Date.now(),
      assignedTo: null,
      status: 'OPEN',
      resolution: null
    };

    setEdgeCases(prev => [...prev, newEdgeCase]);
    setCurrentFlow(prev => ({
      ...prev,
      edgeCases: [...prev.edgeCases, newEdgeCase.type]
    }));
  };

  const handleEdgeCaseResolution = (edgeCaseId: string, resolution: string) => {
    setEdgeCases(prev => prev.map(ec => 
      ec.id === edgeCaseId 
        ? { ...ec, status: 'RESOLVED', resolution, assignedTo: 'Staff Member' }
        : ec
    ));

    setCurrentFlow(prev => ({
      ...prev,
      notes: [...prev.notes, `Edge case resolved: ${resolution}`]
    }));
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'ARRIVAL': return 'bg-blue-600/20 border-blue-500/50';
      case 'SEATING': return 'bg-green-600/20 border-green-500/50';
      case 'ORDERING': return 'bg-yellow-600/20 border-yellow-500/50';
      case 'PREPARATION': return 'bg-orange-600/20 border-orange-500/50';
      case 'DELIVERY': return 'bg-purple-600/20 border-purple-500/50';
      case 'ACTIVE_SESSION': return 'bg-teal-600/20 border-teal-500/50';
      case 'REFILL_REQUEST': return 'bg-pink-600/20 border-pink-500/50';
      case 'COAL_REPLACEMENT': return 'bg-red-600/20 border-red-500/50';
      case 'SESSION_END': return 'bg-indigo-600/20 border-indigo-500/50';
      case 'PAYMENT': return 'bg-emerald-600/20 border-emerald-500/50';
      case 'DEPARTURE': return 'bg-gray-600/20 border-gray-500/50';
      default: return 'bg-zinc-600/20 border-zinc-500/50';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'LOW': return 'text-green-400';
      case 'MEDIUM': return 'text-yellow-400';
      case 'HIGH': return 'text-orange-400';
      case 'CRITICAL': return 'text-red-400';
      default: return 'text-zinc-400';
    }
  };

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-teal-300">Customer Flow Logic</h3>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsDemoMode(!isDemoMode)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isDemoMode 
                ? 'bg-green-600 text-white' 
                : 'bg-zinc-700 text-zinc-300'
            }`}
          >
            {isDemoMode ? '🔄 Demo Active' : '▶️ Start Demo'}
          </button>
          <div className="text-sm text-zinc-400">
            Auto-progression: {isDemoMode ? 'ON' : 'OFF'}
          </div>
        </div>
      </div>

      {/* Current Stage Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className={`${getStageColor(currentFlow.stage)} p-4 rounded-lg border`}>
          <div className="text-center">
            <div className="text-2xl mb-2">🎯</div>
            <div className="text-lg font-semibold text-white">{currentFlow.stage.replace(/_/g, ' ')}</div>
            <div className="text-sm text-zinc-300">{currentFlow.substage}</div>
            <div className="text-xs text-zinc-400 mt-2">
              {new Date(currentFlow.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>

        <div className="bg-zinc-800 p-4 rounded-lg border border-zinc-700">
          <div className="text-center">
            <div className="text-2xl mb-2">📊</div>
            <div className="text-lg font-semibold text-white">Flow Metrics</div>
            <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
              <div>
                <div className="text-zinc-400">Satisfaction</div>
                <div className="text-teal-400 font-medium">{currentFlow.customerSatisfaction}/5</div>
              </div>
              <div>
                <div className="text-zinc-400">Wait Time</div>
                <div className="text-orange-400 font-medium">{currentFlow.estimatedWaitTime}min</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Flow Timeline */}
      <div className="mb-6">
        <h4 className="text-lg font-medium text-white mb-3">Flow Timeline</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {currentFlow.notes.slice(-8).map((note, index) => (
            <div key={index} className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
              <span className="text-zinc-300">{note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Edge Cases Management */}
      <div className="mb-6">
        <h4 className="text-lg font-medium text-white mb-3">Edge Cases ({edgeCases.length})</h4>
        <div className="space-y-3 max-h-40 overflow-y-auto">
          {edgeCases.map((edgeCase) => (
            <div key={edgeCase.id} className="bg-zinc-800 rounded-lg p-3 border border-zinc-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${getSeverityColor(edgeCase.severity)}`}>
                    {edgeCase.severity}
                  </span>
                  <span className="text-zinc-300 text-sm">{edgeCase.type.replace(/_/g, ' ')}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  edgeCase.status === 'OPEN' ? 'bg-red-600/20 text-red-400' :
                  edgeCase.status === 'IN_PROGRESS' ? 'bg-yellow-600/20 text-yellow-400' :
                  edgeCase.status === 'RESOLVED' ? 'bg-green-600/20 text-green-400' :
                  'bg-purple-600/20 text-purple-400'
                }`}>
                  {edgeCase.status}
                </span>
              </div>
              <div className="text-sm text-zinc-400 mb-2">{edgeCase.description}</div>
              {edgeCase.status === 'OPEN' && (
                <button
                  onClick={() => handleEdgeCaseResolution(edgeCase.id, 'Automatically resolved by system')}
                  className="text-xs bg-teal-600 hover:bg-teal-700 text-white px-2 py-1 rounded transition-colors"
                >
                  Auto-Resolve
                </button>
              )}
              {edgeCase.resolution && (
                <div className="text-xs text-green-400 mt-2">
                  ✅ Resolved: {edgeCase.resolution}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* BOH/FOH Handoff Status */}
      <div>
        <h4 className="text-lg font-medium text-white mb-3">Staff Handoff Status</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-600/20 border border-blue-500/50 p-3 rounded-lg">
            <div className="text-center">
              <div className="text-blue-400 font-medium">BOH</div>
              <div className="text-sm text-zinc-400">
                {currentFlow.stage === 'PREPARATION' ? 'Active' : 'Standby'}
              </div>
            </div>
          </div>
          <div className="bg-green-600/20 border border-green-500/50 p-3 rounded-lg">
            <div className="text-center">
              <div className="text-green-400 font-medium">FOH</div>
              <div className="text-sm text-zinc-400">
                {['DELIVERY', 'ACTIVE_SESSION', 'REFILL_REQUEST', 'COAL_REPLACEMENT'].includes(currentFlow.stage) ? 'Active' : 'Standby'}
              </div>
            </div>
          </div>
          <div className="bg-purple-600/20 border border-purple-500/50 p-3 rounded-lg">
            <div className="text-center">
              <div className="text-purple-400 font-medium">Customer</div>
              <div className="text-sm text-zinc-400">
                {['ACTIVE_SESSION', 'REFILL_REQUEST', 'COAL_REPLACEMENT'].includes(currentFlow.stage) ? 'Engaged' : 'Waiting'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
