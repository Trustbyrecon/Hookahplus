'use client';

import React, { useState, useEffect } from 'react';
import { Network, Shield, Flame, CreditCard, FileText, Link2 } from 'lucide-react';

interface TrustNode {
  id: string;
  type: 'session' | 'payment' | 'note' | 'customer';
  label: string;
  x: number;
  y: number;
}

interface TrustEdge {
  from: string;
  to: string;
  type: 'session_payment' | 'session_note' | 'customer_session';
  strength: number;
}

interface TrustGraphProps {
  className?: string;
}

export default function TrustGraph({ className = '' }: TrustGraphProps) {
  const [nodes, setNodes] = useState<TrustNode[]>([]);
  const [edges, setEdges] = useState<TrustEdge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrustGraph();
  }, []);

  const loadTrustGraph = async () => {
    try {
      setLoading(true);
      // Fetch trust relationships from API
      // For now, generate demo data
      const demoNodes: TrustNode[] = [
        { id: 's1', type: 'session', label: 'Session T-001', x: 100, y: 100 },
        { id: 'p1', type: 'payment', label: 'Payment $35.00', x: 200, y: 100 },
        { id: 'n1', type: 'note', label: 'VIP Customer', x: 150, y: 200 },
        { id: 'c1', type: 'customer', label: 'Customer #123', x: 50, y: 150 },
      ];

      const demoEdges: TrustEdge[] = [
        { from: 's1', to: 'p1', type: 'session_payment', strength: 0.95 },
        { from: 's1', to: 'n1', type: 'session_note', strength: 0.85 },
        { from: 'c1', to: 's1', type: 'customer_session', strength: 0.90 },
      ];

      setNodes(demoNodes);
      setEdges(demoEdges);
    } catch (error) {
      console.error('[TrustGraph] Error loading graph:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNodeIcon = (type: TrustNode['type']) => {
    switch (type) {
      case 'session': return <Flame className="w-4 h-4" />;
      case 'payment': return <CreditCard className="w-4 h-4" />;
      case 'note': return <FileText className="w-4 h-4" />;
      case 'customer': return <Shield className="w-4 h-4" />;
    }
  };

  const getNodeColor = (type: TrustNode['type']) => {
    switch (type) {
      case 'session': return 'bg-orange-500/20 border-orange-500/50 text-orange-400';
      case 'payment': return 'bg-green-500/20 border-green-500/50 text-green-400';
      case 'note': return 'bg-blue-500/20 border-blue-500/50 text-blue-400';
      case 'customer': return 'bg-purple-500/20 border-purple-500/50 text-purple-400';
    }
  };

  const getEdgeColor = (type: TrustEdge['type']) => {
    switch (type) {
      case 'session_payment': return 'stroke-green-400';
      case 'session_note': return 'stroke-blue-400';
      case 'customer_session': return 'stroke-purple-400';
    }
  };

  if (loading) {
    return (
      <div className={`bg-zinc-900/50 border border-zinc-700 rounded-lg p-8 ${className}`}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading Trust Graph...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-zinc-900/50 border border-zinc-700 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Network className="w-5 h-5 text-teal-400" />
          <h3 className="text-lg font-semibold text-white">Trust Graph</h3>
        </div>
        <span className="text-xs text-zinc-400">{nodes.length} nodes • {edges.length} connections</span>
      </div>

      {/* Graph Visualization */}
      <div className="relative bg-zinc-950/50 rounded-lg p-8 min-h-[400px] overflow-hidden">
        <svg className="w-full h-full absolute inset-0" viewBox="0 0 400 300">
          {/* Render edges */}
          {edges.map((edge, index) => {
            const fromNode = nodes.find(n => n.id === edge.from);
            const toNode = nodes.find(n => n.id === edge.to);
            if (!fromNode || !toNode) return null;

            return (
              <line
                key={index}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                strokeWidth={edge.strength * 3}
                className={getEdgeColor(edge.type)}
                opacity={0.6}
              />
            );
          })}

          {/* Render nodes */}
          {nodes.map((node) => (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r={20}
                className={`${getNodeColor(node.type)} fill-current opacity-20`}
              />
              <foreignObject
                x={node.x - 40}
                y={node.y + 30}
                width={80}
                height={40}
              >
                <div className={`flex flex-col items-center ${getNodeColor(node.type)} rounded-lg p-2 border`}>
                  <div className="flex items-center gap-1 mb-1">
                    {getNodeIcon(node.type)}
                    <span className="text-xs font-medium">{node.label}</span>
                  </div>
                </div>
              </foreignObject>
            </g>
          ))}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-zinc-900/90 border border-zinc-700 rounded-lg p-3">
          <div className="text-xs font-semibold text-white mb-2">Legend</div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500/50"></div>
              <span className="text-zinc-300">Sessions</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
              <span className="text-zinc-300">Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500/50"></div>
              <span className="text-zinc-300">Notes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500/50"></div>
              <span className="text-zinc-300">Customers</span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-zinc-400 mt-4 text-center">
        Visual representation of trust relationships between sessions, payments, notes, and customers
      </p>
    </div>
  );
}

