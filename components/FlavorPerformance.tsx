'use client';

import React, { useEffect, useState } from 'react';

interface FlavorPerformance {
  flavor: string;
  sessions: number;
  revenue: number;
  averageSessionValue: number;
  popularity: number; // percentage of total sessions
}

export default function FlavorPerformance() {
  const [data, setData] = useState<FlavorPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sessionsRes = await fetch('/api/sessions');
        if (!sessionsRes.ok) throw new Error('Failed to fetch sessions');
        const sessions = await sessionsRes.json();

        // Calculate flavor performance
        const flavorMap: Record<string, { sessions: number; revenue: number }> = {};
        let totalSessions = 0;

        sessions.forEach((session: any) => {
          if (!session.endTime) return; // Only count completed sessions
          
          totalSessions++;
          const basePrice = 30;
          const flavorPrice = session.flavors.length * 5;
          const refillPrice = (session.refills || 0) * 5;
          const sessionRevenue = basePrice + flavorPrice + refillPrice;

          session.flavors.forEach((flavor: string) => {
            if (!flavorMap[flavor]) {
              flavorMap[flavor] = { sessions: 0, revenue: 0 };
            }
            flavorMap[flavor].sessions += 1;
            flavorMap[flavor].revenue += sessionRevenue / session.flavors.length;
          });
        });

        const flavorPerformance: FlavorPerformance[] = Object.entries(flavorMap).map(([flavor, stats]) => ({
          flavor,
          sessions: stats.sessions,
          revenue: stats.revenue,
          averageSessionValue: stats.revenue / stats.sessions,
          popularity: totalSessions > 0 ? (stats.sessions / totalSessions) * 100 : 0
        }));

        // Sort by revenue descending
        flavorPerformance.sort((a, b) => b.revenue - a.revenue);
        setData(flavorPerformance);
      } catch (err) {
        console.error('Error fetching flavor performance:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-400">
        Loading flavor performance...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="p-4 bg-gray-900/30 rounded-lg border border-gray-800 text-gray-400">
        No flavor data available yet
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map(d => d.revenue), 1);
  const maxPopularity = Math.max(...data.map(d => d.popularity), 1);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Flavor Performance</h2>
        <span className="text-sm text-gray-400">
          {data.length} flavors tracked
        </span>
      </div>

      {/* Leaderboard */}
      <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">Top Flavors by Revenue</h3>
        <div className="space-y-3">
          {data.slice(0, 10).map((item, idx) => (
            <div key={item.flavor} className="flex items-center gap-4">
              <div className="w-8 text-center text-gray-400 font-semibold">
                #{idx + 1}
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-white font-semibold">{item.flavor}</span>
                  <span className="text-green-400 font-bold">{formatCurrency(item.revenue)}</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${(item.revenue / maxRevenue) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>{item.sessions} sessions</span>
                  <span>{item.popularity.toFixed(1)}% popularity</span>
                  <span>Avg: {formatCurrency(item.averageSessionValue)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Mixes */}
      <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">Recommendations</h3>
        <div className="space-y-2 text-sm">
          <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
            <div className="text-green-400 font-semibold mb-1">🔥 Top Performer</div>
            <div className="text-white">
              {data[0]?.flavor} is generating the most revenue. Consider promoting this flavor.
            </div>
          </div>
          {data.length > 1 && (
            <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <div className="text-blue-400 font-semibold mb-1">💡 Mix Suggestion</div>
              <div className="text-white">
                Try pairing {data[0]?.flavor} with {data[1]?.flavor} for a premium mix option.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
