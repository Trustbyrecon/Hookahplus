// apps/web/components/AgentMDIntegration.tsx
"use client";

import { useState, useEffect } from 'react';

interface CustomOrderData {
  recentOrders: any[];
  trendingFlavors: any[];
  analytics: any;
  popularFlavors: string[];
}

interface AgentStatus {
  agentId: string;
  status: 'active' | 'warning' | 'error';
  lastActivity: number;
  kpis: Record<string, number>;
}

export default function AgentMDIntegration() {
  const [customOrderData, setCustomOrderData] = useState<CustomOrderData | null>(null);
  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      // Fetch custom order data
      const customOrderRes = await fetch('/api/custom-orders?action=dashboard');
      const customOrderData = await customOrderRes.json();

      // Fetch agent statuses
      const commanderRes = await fetch('/api/agents/commander?action=status');
      const commanderData = await commanderRes.json();

      const aliethiaRes = await fetch('/api/agents/aliethia?action=kpis');
      const aliethiaData = await aliethiaRes.json();

      const sentinelRes = await fetch('/api/agents/sentinel?action=risk_summary');
      const sentinelData = await sentinelRes.json();

      setCustomOrderData(customOrderData.data);
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
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch AGENT.MD data:', error);
      setLoading(false);
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
      {/* AGENT.MD Suite Status */}
      <div className="bg-zinc-900 rounded-xl border border-orange-500 p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🤖</span>
          <h3 className="text-xl font-semibold text-orange-300">AGENT.MD Suite</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {agentStatuses.map((agent) => (
            <div key={agent.agentId} className="bg-zinc-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-white">{agent.agentId}</h4>
                <span className="text-lg">{getStatusIcon(agent.status)}</span>
              </div>
              <div className={`text-xs ${getStatusColor(agent.status)} mb-2`}>
                {agent.status.toUpperCase()}
              </div>
              <div className="space-y-1">
                {Object.entries(agent.kpis).slice(0, 2).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-xs">
                    <span className="text-zinc-400">{key}:</span>
                    <span className="text-white">{typeof value === 'number' ? value.toFixed(1) : value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Order Logic */}
      {customOrderData && (
        <div className="bg-zinc-900 rounded-xl border border-teal-500 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🍯</span>
            <h3 className="text-xl font-semibold text-teal-300">Custom Order Logic</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <div>
              <h4 className="text-lg font-medium text-white mb-3">Recent Orders</h4>
              <div className="space-y-2">
                {customOrderData.recentOrders.slice(0, 5).map((order, index) => (
                  <div key={index} className="bg-zinc-800 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-white font-medium">{order.flavor}</div>
                        <div className="text-sm text-zinc-400">Table {order.tableId}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-teal-400 font-medium">${(order.amount / 100).toFixed(2)}</div>
                        {order.isPopular && (
                          <div className="text-xs bg-orange-600 text-white px-2 py-1 rounded">POPULAR</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trending Flavors */}
            <div>
              <h4 className="text-lg font-medium text-white mb-3">Trending Flavors</h4>
              <div className="space-y-2">
                {customOrderData.trendingFlavors.slice(0, 5).map((flavor, index) => (
                  <div key={index} className="bg-zinc-800 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-white font-medium">{flavor.flavor}</div>
                        <div className="text-sm text-zinc-400">{flavor.orderCount} orders</div>
                      </div>
                      <div className="text-right">
                        <div className="text-orange-400 font-medium">{flavor.popularityScore}</div>
                        <div className="text-xs text-green-400">TRENDING</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Analytics Summary */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{customOrderData.analytics.totalOrders}</div>
              <div className="text-sm text-zinc-400">Total Orders</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">{customOrderData.analytics.popularOrders}</div>
              <div className="text-sm text-zinc-400">Popular Orders</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-400">{customOrderData.analytics.popularityRate.toFixed(1)}%</div>
              <div className="text-sm text-zinc-400">Popularity Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{customOrderData.analytics.trendingFlavors}</div>
              <div className="text-sm text-zinc-400">Trending</div>
            </div>
          </div>
        </div>
      )}

      {/* Popular Flavors List */}
      {customOrderData && (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <h3 className="text-lg font-semibold text-teal-300 mb-4">Popular Flavor Detection</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {customOrderData.popularFlavors.map((flavor, index) => (
              <div key={index} className="bg-zinc-800 rounded-lg p-3 text-center">
                <div className="text-white text-sm font-medium">{flavor}</div>
                <div className="text-xs text-orange-400 mt-1">POPULAR</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
