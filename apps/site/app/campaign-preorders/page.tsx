'use client';

import React, { useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { 
  Calendar, 
  Package, 
  Users, 
  TrendingUp, 
  Clock, 
  Star,
  ShoppingCart,
  Gift,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Clock as ClockIcon,
  DollarSign,
  Percent,
  Flame,
  Sparkles
} from 'lucide-react';
import { 
  campaignPreOrdersData,
  getActiveCampaigns,
  getCompletedCampaigns,
  getUpcomingCampaigns,
  getCustomerPreOrders,
  formatCurrency,
  formatDate,
  getCampaignStatusColor,
  getOrderStatusColor
} from '../../lib/campaignPreOrdersData';

export default function CampaignPreOrdersPage() {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'orders' | 'analytics'>('campaigns');
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);

  const activeCampaigns = getActiveCampaigns();
  const completedCampaigns = getCompletedCampaigns();
  const upcomingCampaigns = getUpcomingCampaigns();
  const customerPreOrders = getCustomerPreOrders();

  const metrics = [
    {
      title: 'Active Campaigns',
      value: campaignPreOrdersData.analytics.activeCampaigns.toString(),
      icon: <Flame className="w-6 h-6" />,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      change: '+1',
      changeType: 'positive' as const
    },
    {
      title: 'Total Pre-Orders',
      value: campaignPreOrdersData.analytics.totalPreOrders.toString(),
      icon: <ShoppingCart className="w-6 h-6" />,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      change: '+12',
      changeType: 'positive' as const
    },
    {
      title: 'Campaign Revenue',
      value: formatCurrency(campaignPreOrdersData.analytics.totalRevenue),
      icon: <DollarSign className="w-6 h-6" />,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      change: '+15%',
      changeType: 'positive' as const
    },
    {
      title: 'Conversion Rate',
      value: `${campaignPreOrdersData.analytics.conversionRate}%`,
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      change: '+3%',
      changeType: 'positive' as const
    }
  ];

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
                <h1 className="text-3xl font-bold text-white">Campaign Pre-Orders</h1>
                <p className="text-zinc-400 mt-2">Manage exclusive flavor campaigns and customer pre-orders</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="primary" 
                className="flex items-center gap-2"
                onClick={() => {
                  console.log('Creating new campaign');
                  alert('Creating new campaign - Opening campaign creation interface');
                }}
              >
                <Sparkles className="w-4 h-4" />
                Create Campaign
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <Card key={index} className="hover:border-teal-500/50 transition-colors">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-zinc-400 text-sm font-medium">{metric.title}</p>
                    <p className="text-2xl font-bold text-white mt-1">{metric.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg ${metric.bgColor} flex items-center justify-center`}>
                    <div className={metric.color}>
                      {metric.icon}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span className={`text-sm font-medium ${
                    metric.changeType === 'positive' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {metric.change}
                  </span>
                  <span className="text-zinc-400 text-sm ml-2">vs last month</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          {[
            { id: 'campaigns', label: 'CAMPAIGNS', icon: '🎯' },
            { id: 'orders', label: 'PRE-ORDERS', icon: '📦' },
            { id: 'analytics', label: 'ANALYTICS', icon: '📊' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'bg-teal-500 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            {/* Active Campaigns */}
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Flame className="w-6 h-6 text-orange-400" />
                Active Campaigns ({activeCampaigns.length})
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {activeCampaigns.map((campaign) => (
                  <Card key={campaign.id} className="hover:border-teal-500/50 transition-colors">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-white">{campaign.name}</h3>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            campaign.status === 'ACTIVE' ? 'bg-green-400' : 'bg-gray-400'
                          }`}></div>
                          <span className={`text-sm font-medium ${getCampaignStatusColor(campaign.status)}`}>
                            {campaign.status}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-zinc-400 mb-4">{campaign.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-zinc-400 text-sm">Discount</p>
                          <p className="text-teal-400 font-semibold">{campaign.discount}% OFF</p>
                        </div>
                        <div>
                          <p className="text-zinc-400 text-sm">Orders</p>
                          <p className="text-white font-semibold">{campaign.currentOrders}/{campaign.maxOrders}</p>
                        </div>
                        <div>
                          <p className="text-zinc-400 text-sm">Revenue</p>
                          <p className="text-green-400 font-semibold">{formatCurrency(campaign.revenue)}</p>
                        </div>
                        <div>
                          <p className="text-zinc-400 text-sm">Ends</p>
                          <p className="text-white font-semibold">{formatDate(campaign.endDate)}</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-zinc-400 mb-1">
                          <span>Progress</span>
                          <span>{Math.round((campaign.currentOrders / campaign.maxOrders) * 100)}%</span>
                        </div>
                        <div className="w-full bg-zinc-700 rounded-full h-2">
                          <div 
                            className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(campaign.currentOrders / campaign.maxOrders) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Flavors Preview */}
                      <div className="mb-4">
                        <p className="text-zinc-400 text-sm mb-2">Featured Flavors</p>
                        <div className="flex flex-wrap gap-2">
                          {campaign.flavors.slice(0, 3).map((flavor) => (
                            <span 
                              key={flavor.id}
                              className="px-2 py-1 bg-teal-500/20 text-teal-400 text-xs rounded"
                            >
                              {flavor.name}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => setSelectedCampaign(campaign.id)}
                        >
                          View Details
                        </Button>
                        <Button 
                          variant="primary" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => {
                            console.log(`Managing campaign ${campaign.id}`);
                            alert(`Managing ${campaign.name} campaign`);
                          }}
                        >
                          Manage
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Upcoming Campaigns */}
            {upcomingCampaigns.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-blue-400" />
                  Upcoming Campaigns ({upcomingCampaigns.length})
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {upcomingCampaigns.map((campaign) => (
                    <Card key={campaign.id} className="hover:border-blue-500/50 transition-colors">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-semibold text-white">{campaign.name}</h3>
                          <div className="flex items-center gap-2">
                            <ClockIcon className="w-4 h-4 text-blue-400" />
                            <span className="text-blue-400 text-sm font-medium">UPCOMING</span>
                          </div>
                        </div>
                        <p className="text-zinc-400 mb-4">{campaign.description}</p>
                        <div className="flex justify-between text-sm text-zinc-400">
                          <span>Starts: {formatDate(campaign.startDate)}</span>
                          <span>{campaign.discount}% OFF</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Package className="w-6 h-6 text-green-400" />
              Customer Pre-Orders ({customerPreOrders.length})
            </h2>
            <div className="space-y-4">
              {customerPreOrders.map((order) => (
                <Card key={order.id} className="hover:border-teal-500/50 transition-colors">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{order.customerName}</h3>
                        <p className="text-zinc-400 text-sm">{order.customerEmail}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${getOrderStatusColor(order.status)}`}>
                          {order.status}
                        </p>
                        <p className="text-zinc-400 text-xs">{formatDate(order.orderDate)}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-zinc-400 text-sm">Total Amount</p>
                        <p className="text-green-400 font-semibold">{formatCurrency(order.totalAmount)}</p>
                      </div>
                      <div>
                        <p className="text-zinc-400 text-sm">Payment Status</p>
                        <p className={`font-semibold ${
                          order.paymentStatus === 'PAID' ? 'text-green-400' : 'text-yellow-400'
                        }`}>
                          {order.paymentStatus}
                        </p>
                      </div>
                      <div>
                        <p className="text-zinc-400 text-sm">Estimated Delivery</p>
                        <p className="text-white font-semibold">{formatDate(order.estimatedDelivery)}</p>
                      </div>
                      <div>
                        <p className="text-zinc-400 text-sm">Items</p>
                        <p className="text-white font-semibold">{order.items.length} items</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          console.log(`Viewing order ${order.id}`);
                          alert(`Viewing order details for ${order.customerName}`);
                        }}
                      >
                        View Details
                      </Button>
                      <Button 
                        variant="primary" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          console.log(`Processing order ${order.id}`);
                          alert(`Processing order for ${order.customerName}`);
                        }}
                      >
                        Process Order
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-purple-400" />
              Campaign Analytics
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Top Performing Flavors</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-300">Cinnamon Apple Cider</span>
                      <span className="text-teal-400 font-semibold">92%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-300">Champagne Rose</span>
                      <span className="text-teal-400 font-semibold">88%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-300">Winter Mint Delight</span>
                      <span className="text-teal-400 font-semibold">85%</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Campaign Performance</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-300">Average Order Value</span>
                      <span className="text-green-400 font-semibold">{formatCurrency(campaignPreOrdersData.analytics.averageOrderValue)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-300">Conversion Rate</span>
                      <span className="text-blue-400 font-semibold">{campaignPreOrdersData.analytics.conversionRate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-300">Total Revenue</span>
                      <span className="text-purple-400 font-semibold">{formatCurrency(campaignPreOrdersData.analytics.totalRevenue)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

