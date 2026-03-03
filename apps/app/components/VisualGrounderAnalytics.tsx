"use client";

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  Target, 
  Zap,
  Activity,
  PieChart,
  Download,
  RefreshCw,
  Calendar,
  Filter,
  AlertCircle
} from 'lucide-react';

interface AnalyticsData {
  layoutId: string;
  totalZones: number;
  totalCapacity: number;
  averageUtilization: number;
  peakHours: string[];
  popularZones: Array<{
    zoneId: string;
    name: string;
    utilization: number;
    revenue: number;
  }>;
  staffEfficiency: {
    averageResponseTime: number;
    tasksCompleted: number;
    customerSatisfaction: number;
  };
  aiPerformance: {
    accuracy: number;
    recommendationsAccepted: number;
    timeSaved: number;
  };
  timeRange: {
    start: string;
    end: string;
  };
}

interface VisualGrounderAnalyticsProps {
  layoutId: string;
  onExport?: (data: AnalyticsData) => void;
}

export function VisualGrounderAnalytics({ layoutId, onExport }: VisualGrounderAnalyticsProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('utilization');

  useEffect(() => {
    fetchAnalyticsData();
  }, [layoutId, timeRange]);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock analytics data
      const mockData: AnalyticsData = {
        layoutId,
        totalZones: 6,
        totalCapacity: 84,
        averageUtilization: 78.5,
        peakHours: ['7:00 PM', '8:00 PM', '9:00 PM'],
        popularZones: [
          { zoneId: 'ai_bar_main', name: 'Main Bar', utilization: 92, revenue: 1250 },
          { zoneId: 'ai_booth_west', name: 'West Booths', utilization: 88, revenue: 980 },
          { zoneId: 'ai_table_center', name: 'Center Tables', utilization: 75, revenue: 1100 },
          { zoneId: 'ai_vip_exclusive', name: 'VIP Lounge', utilization: 65, revenue: 800 }
        ],
        staffEfficiency: {
          averageResponseTime: 2.3,
          tasksCompleted: 156,
          customerSatisfaction: 4.7
        },
        aiPerformance: {
          accuracy: 94.2,
          recommendationsAccepted: 87,
          timeSaved: 12.5
        },
        timeRange: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString()
        }
      };
      
      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (analyticsData && onExport) {
      onExport(analyticsData);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 text-teal-400 animate-spin" />
        <span className="ml-2 text-zinc-400">Loading analytics...</span>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
        <p className="text-zinc-400">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-teal-400 mb-2">Layout Analytics</h2>
          <p className="text-zinc-400">Performance insights for your Visual Grounder layout</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button
            onClick={handleExport}
            className="btn-pretty-secondary"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">Total Capacity</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{analyticsData.totalCapacity}</div>
          <div className="text-xs text-zinc-500">seats available</div>
        </div>

        <div className="bg-zinc-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">Utilization</span>
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">{analyticsData.averageUtilization}%</div>
          <div className="text-xs text-zinc-500">average usage</div>
        </div>

        <div className="bg-zinc-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">AI Accuracy</span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">{analyticsData.aiPerformance.accuracy}%</div>
          <div className="text-xs text-zinc-500">layout optimization</div>
        </div>

        <div className="bg-zinc-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">Time Saved</span>
            <Clock className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-white">{analyticsData.aiPerformance.timeSaved}h</div>
          <div className="text-xs text-zinc-500">per week</div>
        </div>
      </div>

      {/* Zone Performance */}
      <div className="bg-zinc-800/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-teal-400" />
          Zone Performance
        </h3>
        <div className="space-y-3">
          {analyticsData.popularZones.map((zone, index) => (
            <div key={zone.zoneId} className="flex items-center justify-between p-3 bg-zinc-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium text-white">{zone.name}</div>
                  <div className="text-sm text-zinc-400">Zone {zone.zoneId}</div>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <div className="text-sm font-semibold text-white">{zone.utilization}%</div>
                  <div className="text-xs text-zinc-400">utilization</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-green-400">${zone.revenue}</div>
                  <div className="text-xs text-zinc-400">revenue</div>
                </div>
                <div className="w-16 bg-zinc-600 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-teal-400 to-cyan-400 h-2 rounded-full"
                    style={{ width: `${zone.utilization}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-800/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-purple-400" />
            AI Performance
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-zinc-300">Recommendations Accepted</span>
              <span className="text-white font-semibold">{analyticsData.aiPerformance.recommendationsAccepted}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-300">Layout Accuracy</span>
              <span className="text-white font-semibold">{analyticsData.aiPerformance.accuracy}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-300">Time Saved</span>
              <span className="text-white font-semibold">{analyticsData.aiPerformance.timeSaved}h</span>
            </div>
          </div>
        </div>

        <div className="bg-zinc-800/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-400" />
            Staff Efficiency
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-zinc-300">Avg Response Time</span>
              <span className="text-white font-semibold">{analyticsData.staffEfficiency.averageResponseTime}m</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-300">Tasks Completed</span>
              <span className="text-white font-semibold">{analyticsData.staffEfficiency.tasksCompleted}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-300">Customer Satisfaction</span>
              <span className="text-white font-semibold">{analyticsData.staffEfficiency.customerSatisfaction}/5</span>
            </div>
          </div>
        </div>
      </div>

      {/* Peak Hours */}
      <div className="bg-zinc-800/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-orange-400" />
          Peak Hours
        </h3>
        <div className="flex items-center space-x-4">
          {analyticsData.peakHours.map((hour, index) => (
            <div key={index} className="text-center">
              <div className="w-12 h-12 bg-orange-500/20 text-orange-400 rounded-lg flex items-center justify-center font-semibold">
                {hour}
              </div>
              <div className="text-xs text-zinc-400 mt-1">Peak {index + 1}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
