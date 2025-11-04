'use client';

import React, { useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  ShoppingCart,
  Percent,
  Calendar,
  ArrowLeft,
  BarChart3,
  PieChart,
  Clock,
  Star,
  Flame
} from 'lucide-react';

export default function CampaignAnalyticsPage() {
  const campaignId = typeof window !== 'undefined' 
    ? new URLSearchParams(window.location.search).get('campaignId') || 'winter-2024'
    : 'winter-2024';

  const campaignData = {
    id: campaignId,
    name: 'Winter 2024 Flavor Campaign',
    status: 'ACTIVE',
    startDate: '2024-11-01',
    endDate: '2024-12-31',
    discount: 15,
    totalOrders: 342,
    maxOrders: 500,
    revenue: 12850.00,
    conversionRate: 24.5,
    averageOrderValue: 37.57,
    topFlavors: [
      { name: 'Cinnamon Apple Cider', orders: 156, revenue: 5850.00, percentage: 45.6 },
      { name: 'Champagne Rose', orders: 98, revenue: 3675.00, percentage: 28.7 },
      { name: 'Winter Mint Delight', orders: 88, revenue: 3325.00, percentage: 25.7 },
    ],
    customerBreakdown: {
      newCustomers: 128,
      returningCustomers: 214,
      vipCustomers: 45,
    },
    dailyPerformance: [
      { date: '2024-11-01', orders: 12, revenue: 450.00 },
      { date: '2024-11-02', orders: 18, revenue: 675.00 },
      { date: '2024-11-03', orders: 15, revenue: 562.50 },
      { date: '2024-11-04', orders: 22, revenue: 825.00 },
      { date: '2024-11-05', orders: 20, revenue: 750.00 },
    ],
    timeDistribution: {
      peakHours: ['7 PM - 9 PM', '9 PM - 11 PM'],
      offPeakHours: ['2 PM - 5 PM'],
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Header */}
      <div className="bg-zinc-950 border-b border-teal-500/50">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.history.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-8 h-8 text-teal-400" />
                  Campaign Analytics
                </h1>
                <p className="text-zinc-400 mt-2">{campaignData.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/30">
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-green-300">Total Revenue</h3>
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">${campaignData.revenue.toLocaleString()}</div>
              <div className="text-xs text-zinc-400">From {campaignData.totalOrders} orders</div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-500/30">
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-blue-300">Conversion Rate</h3>
                <Percent className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{campaignData.conversionRate}%</div>
              <div className="text-xs text-zinc-400">Above industry avg</div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30">
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-purple-300">Avg Order Value</h3>
                <ShoppingCart className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">${campaignData.averageOrderValue}</div>
              <div className="text-xs text-zinc-400">+12% vs regular</div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border-orange-500/30">
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-orange-300">Progress</h3>
                <TrendingUp className="w-5 h-5 text-orange-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {Math.round((campaignData.totalOrders / campaignData.maxOrders) * 100)}%
              </div>
              <div className="text-xs text-zinc-400">{campaignData.totalOrders}/{campaignData.maxOrders} orders</div>
            </div>
          </Card>
        </div>

        {/* Top Performing Flavors */}
        <div className="mb-8">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-400" />
                Top Performing Flavors
              </h3>
              <div className="space-y-4">
                {campaignData.topFlavors.map((flavor, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-zinc-400 text-sm font-medium">#{index + 1}</span>
                        <span className="text-white font-medium">{flavor.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-zinc-400 text-sm">{flavor.orders} orders</span>
                        <span className="text-green-400 font-semibold">${flavor.revenue.toLocaleString()}</span>
                        <span className="text-teal-400 font-semibold">{flavor.percentage}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-zinc-700 rounded-full h-2">
                      <div 
                        className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${flavor.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Customer Breakdown & Daily Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Customer Breakdown
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded">
                  <span className="text-zinc-300">New Customers</span>
                  <span className="text-green-400 font-semibold">{campaignData.customerBreakdown.newCustomers}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded">
                  <span className="text-zinc-300">Returning Customers</span>
                  <span className="text-blue-400 font-semibold">{campaignData.customerBreakdown.returningCustomers}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded">
                  <span className="text-zinc-300">VIP Customers</span>
                  <span className="text-purple-400 font-semibold">{campaignData.customerBreakdown.vipCustomers}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-400" />
                Peak Hours
              </h3>
              <div className="space-y-3">
                {campaignData.timeDistribution.peakHours.map((hour, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded">
                    <Star className="w-4 h-4 text-green-400" />
                    <span className="text-white">{hour}</span>
                    <span className="ml-auto text-green-400 text-sm font-medium">Peak</span>
                  </div>
                ))}
                {campaignData.timeDistribution.offPeakHours.map((hour, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-zinc-800/50 rounded">
                    <Clock className="w-4 h-4 text-zinc-400" />
                    <span className="text-zinc-300">{hour}</span>
                    <span className="ml-auto text-zinc-400 text-sm">Off-Peak</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Daily Performance */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              Daily Performance (Last 5 Days)
            </h3>
            <div className="space-y-2">
              {campaignData.dailyPerformance.map((day, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-zinc-800/50 rounded">
                  <span className="text-zinc-300">{day.date}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-zinc-400">{day.orders} orders</span>
                    <span className="text-green-400 font-semibold">${day.revenue.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

