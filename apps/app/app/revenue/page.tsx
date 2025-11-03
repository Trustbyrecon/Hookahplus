"use client";

import React, { useState, useEffect } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import RevenueMetrics from '../components/RevenueMetrics';
import RevenueChart from '../components/RevenueChart';
import DateRangeSelector from '../components/DateRangeSelector';
import Card from '../components/Card';
import GlobalNavigation from '../components/GlobalNavigation';

interface RevenueData {
  today: number;
  week: number;
  month: number;
  trend: Array<{ date: string; revenue: number; sessions: number }>;
  avgSessionValue: number;
  sessionCount: number;
  breakdown: {
    byFlavor: Array<{ flavor: string; revenue: number; count: number }>;
    byTable: Array<{ table: string; revenue: number; count: number }>;
    byTimeOfDay: Array<{ period: string; revenue: number; count: number }>;
  };
}

export default function RevenuePage() {
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  });
  
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `/api/revenue?startDate=${startDate}&endDate=${endDate}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch revenue data');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setRevenueData(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch revenue data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching revenue data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueData();
  }, [startDate, endDate]);

  const handleExportCSV = () => {
    if (!revenueData) return;

    // Create CSV content
    const csvRows = [
      ['Metric', 'Value'],
      ['Today\'s Revenue', `$${revenueData.today.toFixed(2)}`],
      ['Week Revenue', `$${revenueData.week.toFixed(2)}`],
      ['Month Revenue', `$${revenueData.month.toFixed(2)}`],
      ['Average Session Value', `$${revenueData.avgSessionValue.toFixed(2)}`],
      ['Total Sessions', revenueData.sessionCount.toString()],
      [],
      ['Date', 'Revenue', 'Sessions'],
      ...revenueData.trend.map((item) => [
        item.date,
        `$${item.revenue.toFixed(2)}`,
        item.sessions.toString(),
      ]),
      [],
      ['Flavor', 'Revenue', 'Count'],
      ...revenueData.breakdown.byFlavor.map((item) => [
        item.flavor,
        `$${item.revenue.toFixed(2)}`,
        item.count.toString(),
      ]),
      [],
      ['Table', 'Revenue', 'Count'],
      ...revenueData.breakdown.byTable.map((item) => [
        item.table,
        `$${item.revenue.toFixed(2)}`,
        item.count.toString(),
      ]),
      [],
      ['Time Period', 'Revenue', 'Count'],
      ...revenueData.breakdown.byTimeOfDay.map((item) => [
        item.period,
        `$${item.revenue.toFixed(2)}`,
        item.count.toString(),
      ]),
    ];

    const csvContent = csvRows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-report-${startDate}-to-${endDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Revenue Dashboard</h1>
            <p className="text-zinc-400">
              Track revenue metrics and performance analytics
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={fetchRevenueData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            <button
              onClick={handleExportCSV}
              disabled={!revenueData || loading}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        <DateRangeSelector
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          className="mb-6"
        />

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-zinc-400">Loading revenue data...</p>
            </div>
          </div>
        )}

        {error && (
          <Card className="p-6 mb-6 border-red-500/30 bg-red-500/10">
            <div className="flex items-center gap-2 text-red-400">
              <span className="text-lg font-semibold">Error:</span>
              <span>{error}</span>
            </div>
          </Card>
        )}

        {revenueData && !loading && (
          <>
            <RevenueMetrics
              today={revenueData.today}
              week={revenueData.week}
              month={revenueData.month}
              avgSessionValue={revenueData.avgSessionValue}
              sessionCount={revenueData.sessionCount}
              className="mb-6"
            />

            <RevenueChart data={revenueData.trend} className="mb-6" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Revenue by Flavor */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Revenue by Flavor
                </h3>
                <div className="space-y-3">
                  {revenueData.breakdown.byFlavor
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, 5)
                    .map((item) => (
                      <div
                        key={item.flavor}
                        className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg"
                      >
                        <div>
                          <div className="text-white font-medium">
                            {item.flavor}
                          </div>
                          <div className="text-sm text-zinc-400">
                            {item.count} sessions
                          </div>
                        </div>
                        <div className="text-teal-400 font-semibold">
                          ${item.revenue.toFixed(2)}
                        </div>
                      </div>
                    ))}
                </div>
              </Card>

              {/* Revenue by Table */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Revenue by Table
                </h3>
                <div className="space-y-3">
                  {revenueData.breakdown.byTable
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, 5)
                    .map((item) => (
                      <div
                        key={item.table}
                        className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg"
                      >
                        <div>
                          <div className="text-white font-medium">
                            {item.table}
                          </div>
                          <div className="text-sm text-zinc-400">
                            {item.count} sessions
                          </div>
                        </div>
                        <div className="text-teal-400 font-semibold">
                          ${item.revenue.toFixed(2)}
                        </div>
                      </div>
                    ))}
                </div>
              </Card>

              {/* Revenue by Time of Day */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Revenue by Time of Day
                </h3>
                <div className="space-y-3">
                  {revenueData.breakdown.byTimeOfDay.map((item) => (
                    <div
                      key={item.period}
                      className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg"
                    >
                      <div>
                        <div className="text-white font-medium">
                          {item.period}
                        </div>
                        <div className="text-sm text-zinc-400">
                          {item.count} sessions
                        </div>
                      </div>
                      <div className="text-teal-400 font-semibold">
                        ${item.revenue.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

