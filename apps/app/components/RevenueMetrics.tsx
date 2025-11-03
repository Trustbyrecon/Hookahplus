'use client';

import React, { useEffect, useState } from 'react';

interface RevenueData {
  today: number;
  week: number;
  month: number;
  averageSessionValue: number;
  sessionCount: number;
  trend: Array<{ date: string; revenue: number }>;
  breakdown: {
    byFlavor: Record<string, number>;
    byTable: Record<string, number>;
    byTimeOfDay: Record<string, number>;
  };
}

export default function RevenueMetrics() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('month');

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const response = await fetch(`/api/revenue?range=${dateRange}`);
        if (!response.ok) throw new Error('Failed to fetch revenue');
        const revenueData = await response.json();
        setData(revenueData);
      } catch (err) {
        console.error('Error fetching revenue:', err);
        // Fallback: calculate from sessions
        const sessionsRes = await fetch('/api/sessions');
        if (sessionsRes.ok) {
          const sessions = await sessionsRes.json();
          const revenue = calculateRevenueFromSessions(sessions, dateRange);
          setData(revenue);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRevenue();
  }, [dateRange]);

  const calculateRevenueFromSessions = (sessions: any[], range: string): RevenueData => {
    const now = new Date();
    const cutoff = new Date();
    
    if (range === 'today') {
      cutoff.setHours(0, 0, 0, 0);
    } else if (range === 'week') {
      cutoff.setDate(now.getDate() - 7);
    } else {
      cutoff.setMonth(now.getMonth() - 1);
    }

    const filteredSessions = sessions.filter(s => 
      new Date(s.startTime) >= cutoff && s.endTime
    );

    let totalRevenue = 0;
    const flavorRevenue: Record<string, number> = {};
    const tableRevenue: Record<string, number> = {};
    const timeRevenue: Record<string, number> = {};

    filteredSessions.forEach(session => {
      // Calculate session price: base $30 + $5 per flavor + $5 per refill
      const basePrice = 30;
      const flavorPrice = session.flavors.length * 5;
      const refillPrice = (session.refills || 0) * 5;
      const sessionRevenue = basePrice + flavorPrice + refillPrice;

      totalRevenue += sessionRevenue;
      
      // Breakdown by flavor
      session.flavors.forEach((flavor: string) => {
        flavorRevenue[flavor] = (flavorRevenue[flavor] || 0) + sessionRevenue / session.flavors.length;
      });

      // Breakdown by table
      tableRevenue[session.table] = (tableRevenue[session.table] || 0) + sessionRevenue;

      // Breakdown by time of day
      const hour = new Date(session.startTime).getHours();
      const timeSlot = hour < 12 ? 'Morning' : hour < 18 ? 'Afternoon' : 'Evening';
      timeRevenue[timeSlot] = (timeRevenue[timeSlot] || 0) + sessionRevenue;
    });

    const avgSessionValue = filteredSessions.length > 0 
      ? totalRevenue / filteredSessions.length 
      : 0;

    // Generate trend data (last 7 days)
    const trend: Array<{ date: string; revenue: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayRevenue = sessions
        .filter(s => {
          const sDate = new Date(s.startTime);
          return sDate >= date && sDate < nextDate && s.endTime;
        })
        .reduce((sum, s) => {
          const basePrice = 30;
          const flavorPrice = s.flavors.length * 5;
          const refillPrice = (s.refills || 0) * 5;
          return sum + basePrice + flavorPrice + refillPrice;
        }, 0);

      trend.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: dayRevenue
      });
    }

    return {
      today: range === 'today' ? totalRevenue : 0,
      week: range === 'week' ? totalRevenue : 0,
      month: range === 'month' ? totalRevenue : totalRevenue,
      averageSessionValue: avgSessionValue,
      sessionCount: filteredSessions.length,
      trend,
      breakdown: {
        byFlavor: flavorRevenue,
        byTable: tableRevenue,
        byTimeOfDay: timeRevenue
      }
    };
  };

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
        Loading revenue metrics...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg text-yellow-400">
        No revenue data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Revenue Metrics</h2>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value as 'today' | 'week' | 'month')}
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          label={dateRange === 'today' ? 'Today' : dateRange === 'week' ? 'This Week' : 'This Month'}
          value={formatCurrency(
            dateRange === 'today' ? data.today :
            dateRange === 'week' ? data.week :
            data.month
          )}
        />
        <MetricCard
          label="Average Session Value"
          value={formatCurrency(data.averageSessionValue)}
        />
        <MetricCard
          label="Total Sessions"
          value={data.sessionCount.toString()}
        />
        <MetricCard
          label="Projected Revenue"
          value={formatCurrency(data.averageSessionValue * data.sessionCount * 1.2)}
          subtitle="Based on trend"
        />
      </div>

      {/* Revenue Trend Chart */}
      <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">Revenue Trend (Last 7 Days)</h3>
        <div className="h-64 flex items-end justify-between gap-2">
          {data.trend.map((point, idx) => {
            const maxRevenue = Math.max(...data.trend.map(p => p.revenue), 1);
            const height = (point.revenue / maxRevenue) * 100;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex items-end justify-center" style={{ height: '200px' }}>
                  <div
                    className="w-full bg-green-500 rounded-t transition-all"
                    style={{ height: `${height}%`, minHeight: point.revenue > 0 ? '4px' : '0' }}
                    title={`${point.date}: ${formatCurrency(point.revenue)}`}
                  />
                </div>
                <span className="text-xs text-gray-400">{point.date}</span>
                <span className="text-xs text-white font-semibold">
                  {formatCurrency(point.revenue)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BreakdownCard
          title="Top Flavors"
          data={Object.entries(data.breakdown.byFlavor)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, value]) => ({ name, value }))}
          formatValue={formatCurrency}
        />
        <BreakdownCard
          title="Top Tables"
          data={Object.entries(data.breakdown.byTable)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, value]) => ({ name, value }))}
          formatValue={formatCurrency}
        />
        <BreakdownCard
          title="By Time of Day"
          data={Object.entries(data.breakdown.byTimeOfDay)
            .map(([name, value]) => ({ name, value }))}
          formatValue={formatCurrency}
        />
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            const csv = generateCSV(data);
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `revenue-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
          }}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold"
        >
          Export CSV
        </button>
      </div>
    </div>
  );
}

function MetricCard({ label, value, subtitle }: { label: string; value: string; subtitle?: string }) {
  return (
    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
      <div className="text-sm text-gray-400 mb-1">{label}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
    </div>
  );
}

function BreakdownCard({ 
  title, 
  data, 
  formatValue 
}: { 
  title: string; 
  data: Array<{ name: string; value: number }>; 
  formatValue: (val: number) => string;
}) {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  
  return (
    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
      <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>
      <div className="space-y-2">
        {data.map((item, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">{item.name}</span>
              <span className="text-white font-semibold">{formatValue(item.value)}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function generateCSV(data: RevenueData): string {
  const rows = [
    ['Metric', 'Value'],
    ['Total Revenue', data.month.toString()],
    ['Average Session Value', data.averageSessionValue.toString()],
    ['Session Count', data.sessionCount.toString()],
    [''],
    ['Top Flavors', 'Revenue'],
    ...Object.entries(data.breakdown.byFlavor)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => [name, value.toString()]),
    [''],
    ['Top Tables', 'Revenue'],
    ...Object.entries(data.breakdown.byTable)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => [name, value.toString()])
  ];

  return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
}
