"use client";

import React, { useState } from 'react';
import { 
  Target, 
  Plus, 
  Calendar, 
  Users, 
  TrendingUp, 
  BarChart3,
  Mail,
  MessageSquare,
  Gift,
  Star,
  Clock,
  Eye,
  Edit,
  Trash2,
  Play,
  Pause,
  CheckCircle,
  AlertTriangle,
  Filter,
  Search,
  Download,
  Share2,
  Settings,
  ShoppingCart,
  DollarSign
} from 'lucide-react';
import GlobalNavigation from '../../components/GlobalNavigation';
import { Card, Button, Badge } from '../../components';

interface Campaign {
  id: string;
  name: string;
  type: 'loyalty' | 'promotional' | 'email' | 'sms' | 'social' | 'percentage_off' | 'first_x_customers' | 'buy_x_get_y' | 'time_limited';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'scheduled';
  startDate: Date;
  endDate?: Date;
  targetAudience: string;
  budget: number;
  spent: number;
  reach: number;
  engagement: number;
  conversions: number;
  roi: number;
  description: string;
  channels: string[];
  createdAt: Date;
  createdBy: string;
}

export default function CampaignsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: 'camp_1',
      name: 'Summer Hookah Special',
      type: 'promotional',
      status: 'active',
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000),
      targetAudience: 'All Customers',
      budget: 5000,
      spent: 1250,
      reach: 2500,
      engagement: 15.2,
      conversions: 180,
      roi: 2.4,
      description: '20% off all hookah sessions during summer months',
      channels: ['Email', 'SMS', 'Social Media'],
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      createdBy: 'Marketing Team'
    },
    {
      id: 'camp_2',
      name: 'VIP Loyalty Program',
      type: 'loyalty',
      status: 'active',
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      targetAudience: 'Frequent Customers',
      budget: 10000,
      spent: 3200,
      reach: 800,
      engagement: 45.8,
      conversions: 120,
      roi: 3.8,
      description: 'Exclusive rewards for VIP members',
      channels: ['Email', 'In-App'],
      createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
      createdBy: 'Loyalty Team'
    },
    {
      id: 'camp_3',
      name: 'New Customer Welcome',
      type: 'email',
      status: 'scheduled',
      startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      targetAudience: 'New Customers',
      budget: 1000,
      spent: 0,
      reach: 0,
      engagement: 0,
      conversions: 0,
      roi: 0,
      description: 'Welcome email series for new customers',
      channels: ['Email'],
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      createdBy: 'Email Team'
    }
  ]);

  const [newCampaign, setNewCampaign] = useState({
    name: '',
    type: 'promotional' as Campaign['type'],
    description: '',
    targetAudience: '',
    budget: 0,
    startDate: '',
    endDate: '',
    channels: [] as string[],
    // Campaign-specific fields
    percentageOff: 10,
    firstXCustomers: 50,
    buyXGetY: { buy: 2, get: 1 },
    timeLimit: 24, // hours
    discountAmount: 0,
    minimumSpend: 0
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'campaigns', label: 'Campaigns', icon: <Target className="w-4 h-4" /> },
    { id: 'loyalty', label: 'Loyalty', icon: <Star className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="w-4 h-4" /> }
  ];

  const campaignTypes = [
    { value: 'loyalty', label: 'Loyalty Program', icon: <Star className="w-4 h-4" /> },
    { value: 'percentage_off', label: 'Percentage Off', icon: <Gift className="w-4 h-4" /> },
    { value: 'first_x_customers', label: 'First X Customers', icon: <Users className="w-4 h-4" /> },
    { value: 'buy_x_get_y', label: 'Buy X Get Y', icon: <ShoppingCart className="w-4 h-4" /> },
    { value: 'time_limited', label: 'Time Limited', icon: <Clock className="w-4 h-4" /> },
    { value: 'email', label: 'Email Marketing', icon: <Mail className="w-4 h-4" /> },
    { value: 'sms', label: 'SMS Campaign', icon: <MessageSquare className="w-4 h-4" /> },
    { value: 'social', label: 'Social Media', icon: <Share2 className="w-4 h-4" /> }
  ];

  const statusColors = {
    draft: 'bg-gray-500/20 text-gray-400',
    active: 'bg-green-500/20 text-green-400',
    paused: 'bg-yellow-500/20 text-yellow-400',
    completed: 'bg-blue-500/20 text-blue-400',
    scheduled: 'bg-purple-500/20 text-purple-400'
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    const matchesType = typeFilter === 'all' || campaign.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleCreateCampaign = () => {
    if (!newCampaign.name.trim()) return;

    const campaign: Campaign = {
      id: `camp_${Date.now()}`,
      name: newCampaign.name,
      type: newCampaign.type,
      status: 'draft',
      startDate: newCampaign.startDate ? new Date(newCampaign.startDate) : new Date(),
      endDate: newCampaign.endDate ? new Date(newCampaign.endDate) : undefined,
      targetAudience: newCampaign.targetAudience,
      budget: newCampaign.budget,
      spent: 0,
      reach: 0,
      engagement: 0,
      conversions: 0,
      roi: 0,
      description: newCampaign.description,
      channels: newCampaign.channels,
      createdAt: new Date(),
      createdBy: 'Current User'
    };

    setCampaigns(prev => [campaign, ...prev]);
    setNewCampaign({
      name: '',
      type: 'promotional' as Campaign['type'],
      description: '',
      targetAudience: '',
      budget: 0,
      startDate: '',
      endDate: '',
      channels: [],
      percentageOff: 10,
      firstXCustomers: 50,
      buyXGetY: { buy: 2, get: 1 },
      timeLimit: 24,
      discountAmount: 0,
      minimumSpend: 0
    });
    setShowCreateModal(false);
  };

  const handleStatusChange = (campaignId: string, newStatus: Campaign['status']) => {
    setCampaigns(prev => prev.map(campaign => 
      campaign.id === campaignId ? { ...campaign, status: newStatus } : campaign
    ));
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Active Campaigns</p>
              <p className="text-2xl font-bold text-white">
                {campaigns.filter(c => c.status === 'active').length}
              </p>
            </div>
            <Target className="w-8 h-8 text-teal-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Total Reach</p>
              <p className="text-2xl font-bold text-white">
                {campaigns.reduce((sum, c) => sum + c.reach, 0).toLocaleString()}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Avg. ROI</p>
              <p className="text-2xl font-bold text-white">
                {campaigns.length > 0 ? (campaigns.reduce((sum, c) => sum + c.roi, 0) / campaigns.length).toFixed(1) : 0}x
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Total Conversions</p>
              <p className="text-2xl font-bold text-white">
                {campaigns.reduce((sum, c) => sum + c.conversions, 0)}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-purple-400" />
          </div>
        </Card>
      </div>

      {/* Recent Campaigns */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Campaigns</h3>
        <div className="space-y-4">
          {campaigns.slice(0, 3).map(campaign => (
            <div key={campaign.id} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-lg ${
                  campaign.type === 'loyalty' ? 'bg-yellow-500/20' :
                  campaign.type === 'promotional' ? 'bg-green-500/20' :
                  campaign.type === 'email' ? 'bg-blue-500/20' :
                  campaign.type === 'sms' ? 'bg-purple-500/20' :
                  'bg-pink-500/20'
                }`}>
                  {campaignTypes.find(t => t.value === campaign.type)?.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-white">{campaign.name}</h4>
                  <p className="text-sm text-zinc-400">{campaign.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Badge className={statusColors[campaign.status]}>
                  {campaign.status}
                </Badge>
                <span className="text-sm text-zinc-400">
                  {campaign.roi.toFixed(1)}x ROI
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderCampaigns = () => (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
            <option value="scheduled">Scheduled</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Types</option>
            <option value="loyalty">Loyalty</option>
            <option value="promotional">Promotional</option>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="social">Social</option>
          </select>
        </div>

        <Button onClick={() => setShowCreateModal(true)} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Create Campaign</span>
        </Button>
      </div>

      {/* Campaigns List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCampaigns.map(campaign => (
          <Card key={campaign.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  campaign.type === 'loyalty' ? 'bg-yellow-500/20' :
                  campaign.type === 'promotional' ? 'bg-green-500/20' :
                  campaign.type === 'email' ? 'bg-blue-500/20' :
                  campaign.type === 'sms' ? 'bg-purple-500/20' :
                  'bg-pink-500/20'
                }`}>
                  {campaignTypes.find(t => t.value === campaign.type)?.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{campaign.name}</h3>
                  <p className="text-sm text-zinc-400">{campaign.type}</p>
                </div>
              </div>
              <Badge className={statusColors[campaign.status]}>
                {campaign.status}
              </Badge>
            </div>

            <p className="text-sm text-zinc-300 mb-4">{campaign.description}</p>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Reach:</span>
                <span className="text-white">{campaign.reach.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Engagement:</span>
                <span className="text-white">{campaign.engagement}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">ROI:</span>
                <span className="text-white">{campaign.roi.toFixed(1)}x</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                {campaign.status === 'draft' && (
                  <Button size="sm" onClick={() => handleStatusChange(campaign.id, 'active')}>
                    <Play className="w-4 h-4" />
                  </Button>
                )}
                {campaign.status === 'active' && (
                  <Button size="sm" variant="outline" onClick={() => handleStatusChange(campaign.id, 'paused')}>
                    <Pause className="w-4 h-4" />
                  </Button>
                )}
                <Button size="sm" variant="outline">
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
              <span className="text-xs text-zinc-500">
                {campaign.createdAt.toLocaleDateString()}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderLoyalty = () => (
    <div className="space-y-6">
      {/* Loyalty Program Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Active Members</p>
              <p className="text-2xl font-bold text-white">1,247</p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Points Redeemed</p>
              <p className="text-2xl font-bold text-white">15,420</p>
            </div>
            <Star className="w-8 h-8 text-yellow-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Avg. Points per Visit</p>
              <p className="text-2xl font-bold text-white">125</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
        </Card>
      </div>

      {/* Loyalty Tiers */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Loyalty Tiers</h3>
        <div className="space-y-4">
          {[
            { name: 'Bronze', points: '0-499', benefits: '5% off all orders', members: 456, color: 'bg-orange-500' },
            { name: 'Silver', points: '500-999', benefits: '10% off + free refills', members: 623, color: 'bg-gray-400' },
            { name: 'Gold', points: '1000-1999', benefits: '15% off + priority seating', members: 168, color: 'bg-yellow-500' },
            { name: 'Platinum', points: '2000+', benefits: '20% off + exclusive flavors', members: 12, color: 'bg-purple-500' }
          ].map((tier, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`w-4 h-4 rounded-full ${tier.color}`} />
                <div>
                  <h4 className="font-semibold text-white">{tier.name}</h4>
                  <p className="text-sm text-zinc-400">{tier.points} points • {tier.benefits}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-semibold">{tier.members} members</p>
                <p className="text-sm text-zinc-400">Active</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Redemptions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Redemptions</h3>
        <div className="space-y-3">
          {[
            { customer: 'John Doe', item: 'Free Hookah Session', points: 500, date: '2 hours ago' },
            { customer: 'Sarah Chen', item: '10% Discount', points: 200, date: '4 hours ago' },
            { customer: 'Mike Wilson', item: 'Priority Seating', points: 100, date: '6 hours ago' },
            { customer: 'Emma Davis', item: 'Free Refill', points: 150, date: '8 hours ago' }
          ].map((redemption, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg">
              <div>
                <p className="text-white font-medium">{redemption.customer}</p>
                <p className="text-sm text-zinc-400">{redemption.item}</p>
              </div>
              <div className="text-right">
                <p className="text-yellow-400 font-semibold">-{redemption.points} pts</p>
                <p className="text-sm text-zinc-500">{redemption.date}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* Campaign Performance */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Total Reach</p>
              <p className="text-2xl font-bold text-white">12,450</p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Engagement Rate</p>
              <p className="text-2xl font-bold text-white">18.5%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Conversions</p>
              <p className="text-2xl font-bold text-white">2,340</p>
            </div>
            <CheckCircle className="w-8 h-8 text-purple-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Avg. ROI</p>
              <p className="text-2xl font-bold text-white">3.2x</p>
            </div>
            <DollarSign className="w-8 h-8 text-yellow-400" />
          </div>
        </Card>
      </div>

      {/* Campaign Performance Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Campaign Performance</h3>
        <div className="h-64 flex items-center justify-center bg-zinc-800/50 rounded-lg">
          <div className="text-center text-zinc-400">
            <BarChart3 className="w-12 h-12 mx-auto mb-2" />
            <p>Campaign performance chart visualization</p>
          </div>
        </div>
      </Card>

      {/* Top Performing Campaigns */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Top Performing Campaigns</h3>
        <div className="space-y-4">
          {[
            { name: 'Summer Hookah Special', reach: 2500, engagement: 22.3, conversions: 456, roi: 4.2 },
            { name: 'VIP Loyalty Program', reach: 800, engagement: 45.8, conversions: 120, roi: 3.8 },
            { name: 'New Customer Welcome', reach: 1200, engagement: 15.2, conversions: 180, roi: 2.1 }
          ].map((campaign, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
              <div className="flex-1">
                <h4 className="font-semibold text-white">{campaign.name}</h4>
                <div className="flex items-center space-x-4 mt-2 text-sm text-zinc-400">
                  <span>Reach: {campaign.reach.toLocaleString()}</span>
                  <span>Engagement: {campaign.engagement}%</span>
                  <span>Conversions: {campaign.conversions}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-green-400 font-semibold">{campaign.roi}x ROI</p>
                <p className="text-sm text-zinc-400">Performance</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'campaigns': return renderCampaigns();
      case 'loyalty': return renderLoyalty();
      case 'analytics': return renderAnalytics();
      default: return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Target className="w-8 h-8 text-teal-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Marketing Campaigns
            </h1>
          </div>
          <p className="text-xl text-zinc-400">
            Create and manage marketing campaigns, loyalty programs, and promotional activities
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-teal-600 text-white'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        {renderContent()}

        {/* Create Campaign Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-800 rounded-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold text-white mb-4">Create New Campaign</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Campaign Name</label>
                  <input
                    type="text"
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Enter campaign name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Campaign Type</label>
                  <select
                    value={newCampaign.type}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, type: e.target.value as Campaign['type'] }))}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {campaignTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                {/* Campaign-specific fields */}
                {newCampaign.type === 'percentage_off' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">Percentage Off</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={newCampaign.percentageOff}
                        onChange={(e) => setNewCampaign(prev => ({ ...prev, percentageOff: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">Minimum Spend ($)</label>
                      <input
                        type="number"
                        min="0"
                        value={newCampaign.minimumSpend}
                        onChange={(e) => setNewCampaign(prev => ({ ...prev, minimumSpend: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="0"
                      />
                    </div>
                  </div>
                )}

                {newCampaign.type === 'first_x_customers' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">First X Customers</label>
                      <input
                        type="number"
                        min="1"
                        value={newCampaign.firstXCustomers}
                        onChange={(e) => setNewCampaign(prev => ({ ...prev, firstXCustomers: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">Discount Amount ($)</label>
                      <input
                        type="number"
                        min="0"
                        value={newCampaign.discountAmount}
                        onChange={(e) => setNewCampaign(prev => ({ ...prev, discountAmount: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="0"
                      />
                    </div>
                  </div>
                )}

                {newCampaign.type === 'buy_x_get_y' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">Buy X Items</label>
                      <input
                        type="number"
                        min="1"
                        value={newCampaign.buyXGetY.buy}
                        onChange={(e) => setNewCampaign(prev => ({ 
                          ...prev, 
                          buyXGetY: { ...prev.buyXGetY, buy: parseInt(e.target.value) || 1 }
                        }))}
                        className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">Get Y Items</label>
                      <input
                        type="number"
                        min="1"
                        value={newCampaign.buyXGetY.get}
                        onChange={(e) => setNewCampaign(prev => ({ 
                          ...prev, 
                          buyXGetY: { ...prev.buyXGetY, get: parseInt(e.target.value) || 1 }
                        }))}
                        className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="1"
                      />
                    </div>
                  </div>
                )}

                {newCampaign.type === 'time_limited' && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Time Limit (hours)</label>
                    <input
                      type="number"
                      min="1"
                      max="168"
                      value={newCampaign.timeLimit}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 24 }))}
                      className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="24"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Description</label>
                  <textarea
                    value={newCampaign.description}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    rows={3}
                    placeholder="Describe your campaign"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Target Audience</label>
                  <input
                    type="text"
                    value={newCampaign.targetAudience}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, targetAudience: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="e.g., All Customers, VIP Members"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Budget ($)</label>
                  <input
                    type="number"
                    value={newCampaign.budget}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, budget: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <Button onClick={handleCreateCampaign} className="flex-1">
                  Create Campaign
                </Button>
                <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
