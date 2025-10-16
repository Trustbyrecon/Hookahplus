'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Button, Badge } from '../../components';
import GlobalNavigation from '../../components/GlobalNavigation';
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
  Sparkles,
  Plus,
  BarChart3,
  Settings,
  ChefHat,
  UserCheck,
  AlertTriangle,
  Crown,
  Folder,
  FileText,
  RefreshCw,
  Flag,
  Pause,
  Zap,
  Trash2,
  Edit3,
  Menu,
  X,
  Activity,
  TrendingDown,
  Shield,
  CheckCircle2,
  Clock3,
  User,
  Phone,
  MapPin,
  Filter,
  Search,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Minus,
  Target,
  Zap as Lightning,
  Heart,
  Coffee,
  Wind,
  Brain,
  Lock,
  CreditCard,
  Smartphone,
  QrCode,
  Play,
  Save,
  Eye,
  EyeOff,
  Star as StarIcon
} from 'lucide-react';

// Mock data for campaigns
const campaignData = {
  activeCampaigns: [
    {
      id: 'campaign_001',
      name: 'Winter Wonderland Collection',
      description: 'Exclusive winter flavors with premium accessories',
      status: 'ACTIVE',
      startDate: '2025-10-15',
      endDate: '2025-12-31',
      discount: 20,
      minOrder: 50,
      maxOrders: 100,
      currentOrders: 47,
      revenue: 23500,
      flavors: [
        {
          id: 'winter_mint',
          name: 'Winter Mint Delight',
          description: 'Cool mint with winter spices',
          price: 2500,
          preOrderPrice: 2000,
          image: '/images/winter-mint.jpg',
          popularity: 85
        },
        {
          id: 'cinnamon_apple',
          name: 'Cinnamon Apple Cider',
          description: 'Warm apple with cinnamon spice',
          price: 2800,
          preOrderPrice: 2240,
          image: '/images/cinnamon-apple.jpg',
          popularity: 92
        },
        {
          id: 'vanilla_snow',
          name: 'Vanilla Snow',
          description: 'Creamy vanilla with winter notes',
          price: 2200,
          preOrderPrice: 1760,
          image: '/images/vanilla-snow.jpg',
          popularity: 78
        }
      ],
      accessories: [
        {
          id: 'winter_coal',
          name: 'Winter Coal Set',
          description: 'Premium coal for winter sessions',
          price: 1500,
          preOrderPrice: 1200,
          image: '/images/winter-coal.jpg'
        },
        {
          id: 'snow_globe',
          name: 'Snow Globe Hookah',
          description: 'Limited edition winter hookah',
          price: 15000,
          preOrderPrice: 12000,
          image: '/images/snow-globe-hookah.jpg'
        }
      ]
    },
    {
      id: 'campaign_002',
      name: 'Valentine\'s Special',
      description: 'Romantic flavors for couples',
      status: 'ACTIVE',
      startDate: '2025-01-15',
      endDate: '2025-02-14',
      discount: 15,
      minOrder: 75,
      maxOrders: 50,
      currentOrders: 23,
      revenue: 17250,
      flavors: [
        {
          id: 'rose_chocolate',
          name: 'Rose Chocolate',
          description: 'Rich chocolate with rose petals',
          price: 3000,
          preOrderPrice: 2550,
          image: '/images/rose-chocolate.jpg',
          popularity: 88
        },
        {
          id: 'strawberry_cream',
          name: 'Strawberry Cream',
          description: 'Sweet strawberry with cream',
          price: 2600,
          preOrderPrice: 2210,
          image: '/images/strawberry-cream.jpg',
          popularity: 82
        }
      ],
      accessories: [
        {
          id: 'heart_coal',
          name: 'Heart Shaped Coal',
          description: 'Special heart-shaped coal',
          price: 2000,
          preOrderPrice: 1700,
          image: '/images/heart-coal.jpg'
        }
      ]
    }
  ],
  completedCampaigns: [
    {
      id: 'campaign_003',
      name: 'Holiday Special 2024',
      description: 'Festive holiday flavors',
      status: 'COMPLETED',
      startDate: '2024-11-01',
      endDate: '2024-12-31',
      discount: 25,
      minOrder: 100,
      maxOrders: 200,
      currentOrders: 200,
      revenue: 50000,
      flavors: [],
      accessories: []
    }
  ],
  upcomingCampaigns: [
    {
      id: 'campaign_004',
      name: 'Spring Fresh Collection',
      description: 'Fresh spring flavors coming soon',
      status: 'UPCOMING',
      startDate: '2025-03-01',
      endDate: '2025-05-31',
      discount: 18,
      minOrder: 60,
      maxOrders: 150,
      currentOrders: 0,
      revenue: 0,
      flavors: [],
      accessories: []
    }
  ]
};

const customerPreOrders = [
  {
    id: 'order_001',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    campaignId: 'campaign_001',
    campaignName: 'Winter Wonderland Collection',
    items: [
      { name: 'Winter Mint Delight', quantity: 2, price: 2000 },
      { name: 'Winter Coal Set', quantity: 1, price: 1200 }
    ],
    totalAmount: 5200,
    status: 'PENDING',
    orderDate: '2025-01-15',
    estimatedDelivery: '2025-01-20'
  },
  {
    id: 'order_002',
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    campaignId: 'campaign_002',
    campaignName: 'Valentine\'s Special',
    items: [
      { name: 'Rose Chocolate', quantity: 1, price: 2550 },
      { name: 'Heart Shaped Coal', quantity: 2, price: 1700 }
    ],
    totalAmount: 5950,
    status: 'CONFIRMED',
    orderDate: '2025-01-14',
    estimatedDelivery: '2025-02-10'
  }
];

export default function CampaignPreOrdersPage() {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'orders' | 'analytics'>('campaigns');
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const activeCampaigns = campaignData.activeCampaigns;
  const completedCampaigns = campaignData.completedCampaigns;
  const upcomingCampaigns = campaignData.upcomingCampaigns;

  const metrics = [
    {
      title: 'Active Campaigns',
      value: activeCampaigns.length.toString(),
      change: '+2',
      changeType: 'positive' as const,
      icon: <Flame className="w-6 h-6" />,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10'
    },
    {
      title: 'Total Orders',
      value: customerPreOrders.length.toString(),
      change: '+12%',
      changeType: 'positive' as const,
      icon: <ShoppingCart className="w-6 h-6" />,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Revenue',
      value: '$1,247',
      change: '+8%',
      changeType: 'positive' as const,
      icon: <DollarSign className="w-6 h-6" />,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Avg Order Value',
      value: '$55.80',
      change: '+5%',
      changeType: 'positive' as const,
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'COMPLETED':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'UPCOMING':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'PENDING':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'CONFIRMED':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleCreateCampaign = () => {
    // TODO: Implement campaign creation
    console.log('Create new campaign');
  };

  const handleViewCampaign = (campaignId: string) => {
    setSelectedCampaign(campaignId);
  };

  const handleProcessOrder = (orderId: string) => {
    // TODO: Implement order processing
    console.log('Process order:', orderId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Global Navigation */}
      <GlobalNavigation />
      
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button className="btn-pretty-secondary">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Campaign Pre-Orders</h1>
              <p className="text-zinc-400 mt-1">Manage seasonal campaigns and pre-order collections</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              onClick={handleCreateCampaign}
              className="btn-pretty-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <div key={index} className="card-pretty p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm font-medium">{metric.title}</p>
                  <p className="text-2xl font-bold text-white mt-1">{metric.value}</p>
                  <div className="flex items-center mt-2">
                    <span className={`text-sm font-medium ${metric.changeType === 'positive' ? 'text-green-400' : 'text-red-400'}`}>
                      {metric.change}
                    </span>
                    <span className="text-zinc-400 text-sm ml-2">vs last month</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                  <div className={metric.color}>
                    {metric.icon}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8">
          {[
            { id: 'campaigns', label: 'Campaigns', icon: <Flame className="w-4 h-4" /> },
            { id: 'orders', label: 'Orders', icon: <ShoppingCart className="w-4 h-4" /> },
            { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-teal-600 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            {/* Active Campaigns */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Active Campaigns</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {activeCampaigns.map((campaign) => (
                  <div key={campaign.id} className="card-pretty p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{campaign.name}</h3>
                        <p className="text-zinc-400 text-sm mt-1">{campaign.description}</p>
                      </div>
                      <Badge className={getStatusColor(campaign.status)}>
                        {campaign.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-zinc-400 text-sm">Progress</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex-1 bg-zinc-700 rounded-full h-2">
                            <div 
                              className="bg-teal-500 h-2 rounded-full" 
                              style={{ width: `${(campaign.currentOrders / campaign.maxOrders) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-white">
                            {campaign.currentOrders}/{campaign.maxOrders}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-zinc-400 text-sm">Revenue</p>
                        <p className="text-white font-semibold">{formatCurrency(campaign.revenue)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-zinc-400">
                        <span>{formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}</span>
                        <span>{campaign.discount}% off</span>
                      </div>
                      <Button 
                        onClick={() => handleViewCampaign(campaign.id)}
                        className="btn-pretty-secondary"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Campaigns */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Upcoming Campaigns</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {upcomingCampaigns.map((campaign) => (
                  <div key={campaign.id} className="card-pretty p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{campaign.name}</h3>
                        <p className="text-zinc-400 text-sm mt-1">{campaign.description}</p>
                      </div>
                      <Badge className={getStatusColor(campaign.status)}>
                        {campaign.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-zinc-400">
                        Starts {formatDate(campaign.startDate)}
                      </div>
                      <Button 
                        onClick={() => handleViewCampaign(campaign.id)}
                        className="btn-pretty-secondary"
                      >
                        Preview
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white mb-4">Customer Pre-Orders</h2>
            <div className="card-pretty overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-800/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                        Order
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                        Campaign
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-700">
                    {customerPreOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-zinc-800/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-white">{order.id}</div>
                            <div className="text-sm text-zinc-400">{formatDate(order.orderDate)}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-white">{order.customerName}</div>
                            <div className="text-sm text-zinc-400">{order.customerEmail}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">{order.campaignName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-teal-400">
                            {formatCurrency(order.totalAmount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button 
                            onClick={() => handleProcessOrder(order.id)}
                            className="btn-pretty-secondary"
                          >
                            Process
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white mb-4">Campaign Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card-pretty p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Revenue by Campaign</h3>
                <div className="space-y-4">
                  {activeCampaigns.map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{campaign.name}</p>
                        <p className="text-zinc-400 text-sm">{campaign.currentOrders} orders</p>
                      </div>
                      <div className="text-right">
                        <p className="text-teal-400 font-semibold">{formatCurrency(campaign.revenue)}</p>
                        <p className="text-zinc-400 text-sm">{campaign.discount}% discount</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="card-pretty p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Order Status Distribution</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white">Pending</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-zinc-700 rounded-full h-2">
                        <div className="bg-orange-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                      </div>
                      <span className="text-sm text-zinc-400">60%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white">Confirmed</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-zinc-700 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                      </div>
                      <span className="text-sm text-zinc-400">40%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
