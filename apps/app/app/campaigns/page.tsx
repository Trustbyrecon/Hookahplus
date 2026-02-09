"use client";

import React, { useState, useEffect } from 'react';
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
  campaignConfig?: any; // JSON field from Prisma
}

export default function CampaignsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Aliethia-aligned default lounge/tenant id (env override; replaces dated HOPE_GLOBAL_FORUM)
  const [loungeId, setLoungeId] = useState<string>(
    () => process.env.NEXT_PUBLIC_DEFAULT_LOUNGE_ID || process.env.NEXT_PUBLIC_ALIETHIA_LOUNGE_ID || 'ALIETHIA'
  );
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Loyalty Program state
  const [loyaltyTiers, setLoyaltyTiers] = useState<any[]>([]);
  const [loyaltyRewards, setLoyaltyRewards] = useState<any[]>([]);
  const [loyaltyLoading, setLoyaltyLoading] = useState(false);
  const [showTierModal, setShowTierModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [editingTier, setEditingTier] = useState<any>(null);
  const [editingReward, setEditingReward] = useState<any>(null);
  const [newTier, setNewTier] = useState({
    tierName: 'bronze',
    minPoints: 0,
    maxPoints: '',
    discountPercent: 0,
    pointsPerDollar: 1,
    benefits: '',
    displayOrder: 0
  });
  const [newReward, setNewReward] = useState({
    name: '',
    description: '',
    tierId: '',
    pointsCost: 0,
    discountPercent: '',
    discountAmountCents: '',
    rewardType: 'discount',
    maxRedemptions: '',
    validFrom: '',
    validUntil: '',
    displayOrder: 0
  });

  // Load campaigns from API
  useEffect(() => {
    loadCampaigns();
  }, [statusFilter, typeFilter, loungeId]);

  // Load analytics when on analytics tab
  useEffect(() => {
    if (activeTab === 'analytics') {
      loadAnalytics();
    }
  }, [activeTab, loungeId]);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (loungeId) params.append('loungeId', loungeId);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);

      const response = await fetch(`/api/campaigns?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to load campaigns');
      }

      const data = await response.json();
      if (data.success) {
        // Convert API response to Campaign format
        const formattedCampaigns: Campaign[] = data.campaigns.map((c: any) => ({
          id: c.id,
          name: c.name,
          type: c.type as Campaign['type'],
          status: c.status as Campaign['status'],
          startDate: new Date(c.startDate),
          endDate: c.endDate ? new Date(c.endDate) : undefined,
          targetAudience: c.targetAudience || '',
          budget: c.budget,
          spent: c.spent,
          reach: c.reach,
          engagement: c.engagement,
          conversions: c.conversions,
          roi: c.roi,
          description: c.description || '',
          channels: c.channels || [],
          createdAt: new Date(c.createdAt),
          createdBy: c.createdBy || 'System',
          campaignConfig: c.campaignConfig || null
        }));
        setCampaigns(formattedCampaigns);
      }
    } catch (err) {
      console.error('Error loading campaigns:', err);
      setError(err instanceof Error ? err.message : 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const loadLoyaltyData = async () => {
    try {
      setLoyaltyLoading(true);
      const params = new URLSearchParams();
      if (loungeId) params.append('loungeId', loungeId);

      // Load tiers
      const tiersResponse = await fetch(`/api/loyalty/tiers?${params.toString()}`);
      if (tiersResponse.ok) {
        const tiersData = await tiersResponse.json();
        if (tiersData.success) {
          setLoyaltyTiers(tiersData.tiers || []);
        }
      }

      // Load rewards
      const rewardsResponse = await fetch(`/api/loyalty/rewards?${params.toString()}`);
      if (rewardsResponse.ok) {
        const rewardsData = await rewardsResponse.json();
        if (rewardsData.success) {
          setLoyaltyRewards(rewardsData.rewards || []);
        }
      }
    } catch (err) {
      console.error('Error loading loyalty data:', err);
    } finally {
      setLoyaltyLoading(false);
    }
  };

  const [newCampaign, setNewCampaign] = useState({
    name: '',
    type: 'promotional' as Campaign['type'],
    description: '',
    targetAudience: '',
    budget: 0,
    startDate: '',
    endDate: '',
    channels: [] as string[],
    qrPrefix: '', // QR prefix for tracking
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
    { id: 'pricing', label: 'Pricing', icon: <DollarSign className="w-4 h-4" /> },
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

  const handleCreateCampaign = async () => {
    if (!newCampaign.name.trim()) {
      alert('Please enter a campaign name');
      return;
    }

    try {
      // Build campaign config based on type
      let campaignConfig: any = {};
      if (newCampaign.type === 'percentage_off') {
        campaignConfig = {
          percentageOff: newCampaign.percentageOff,
          minimumSpend: newCampaign.minimumSpend
        };
      } else if (newCampaign.type === 'first_x_customers') {
        campaignConfig = {
          firstXCustomers: newCampaign.firstXCustomers,
          discountAmount: newCampaign.discountAmount
        };
      } else if (newCampaign.type === 'buy_x_get_y') {
        campaignConfig = {
          buyXGetY: newCampaign.buyXGetY
        };
      } else if (newCampaign.type === 'time_limited') {
        campaignConfig = {
          timeLimit: newCampaign.timeLimit,
          discountAmount: newCampaign.discountAmount,
          daysOfWeek: newCampaign.daysOfWeek?.length ? newCampaign.daysOfWeek : undefined,
          startTime: newCampaign.startTime || undefined,
          endTime: newCampaign.endTime || undefined
        };
      }

      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCampaign.name,
          type: newCampaign.type,
          description: newCampaign.description,
          targetAudience: newCampaign.targetAudience,
          startDate: newCampaign.startDate || new Date().toISOString(),
          endDate: newCampaign.endDate || null,
          budget: newCampaign.budget,
          channels: newCampaign.channels,
          campaignConfig,
          qrPrefix: newCampaign.qrPrefix || null,
          loungeId
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create campaign');
      }

      const data = await response.json();
      if (data.success) {
        // Reload campaigns
        await loadCampaigns();
        setNewCampaign({
          name: '',
          type: 'promotional' as Campaign['type'],
          description: '',
          targetAudience: '',
          budget: 0,
          startDate: '',
          endDate: '',
          channels: [],
          qrPrefix: '',
          percentageOff: 10,
          firstXCustomers: 50,
          buyXGetY: { buy: 2, get: 1 },
          timeLimit: 24,
          discountAmount: 0,
          minimumSpend: 0,
          daysOfWeek: [],
          startTime: '17:00',
          endTime: '20:00'
        });
        setShowCreateModal(false);
      }
    } catch (err) {
      console.error('Error creating campaign:', err);
      alert(err instanceof Error ? err.message : 'Failed to create campaign');
    }
  };

  const handleStatusChange = async (campaignId: string, newStatus: Campaign['status']) => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update campaign status');
      }

      // Reload campaigns to get updated data
      await loadCampaigns();
      if (activeTab === 'analytics') {
        await loadAnalytics();
      }
    } catch (err) {
      console.error('Error updating campaign status:', err);
      alert(err instanceof Error ? err.message : 'Failed to update campaign status');
    }
  };

  const loadAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const params = new URLSearchParams();
      if (loungeId) params.append('loungeId', loungeId);

      const response = await fetch(`/api/campaigns/analytics?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to load analytics');
      }

      const data = await response.json();
      if (data.success) {
        setAnalyticsData(data);
      }
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    // Populate edit form with campaign data
    setNewCampaign({
      name: campaign.name,
      type: campaign.type,
      description: campaign.description || '',
      targetAudience: campaign.targetAudience || '',
      budget: campaign.budget,
      startDate: campaign.startDate.toISOString().split('T')[0],
      endDate: campaign.endDate ? campaign.endDate.toISOString().split('T')[0] : '',
      channels: campaign.channels || [],
      qrPrefix: '', // QR prefix is read-only for edits
      percentageOff: (campaign.campaignConfig as any)?.percentageOff || 10,
      firstXCustomers: (campaign.campaignConfig as any)?.firstXCustomers || 50,
      buyXGetY: (campaign.campaignConfig as any)?.buyXGetY || { buy: 2, get: 1 },
      timeLimit: (campaign.campaignConfig as any)?.timeLimit || 24,
      discountAmount: (campaign.campaignConfig as any)?.discountAmount || 0,
      minimumSpend: (campaign.campaignConfig as any)?.minimumSpend || 0,
      daysOfWeek: (campaign.campaignConfig as any)?.daysOfWeek ?? [],
      startTime: (campaign.campaignConfig as any)?.startTime ?? '17:00',
      endTime: (campaign.campaignConfig as any)?.endTime ?? '20:00'
    });
    setShowEditModal(true);
  };

  const handleUpdateCampaign = async () => {
    if (!editingCampaign || !newCampaign.name.trim()) {
      alert('Please enter a campaign name');
      return;
    }

    try {
      // Build campaign config based on type
      let campaignConfig: any = {};
      if (newCampaign.type === 'percentage_off') {
        campaignConfig = {
          percentageOff: newCampaign.percentageOff,
          minimumSpend: newCampaign.minimumSpend
        };
      } else if (newCampaign.type === 'first_x_customers') {
        campaignConfig = {
          firstXCustomers: newCampaign.firstXCustomers,
          discountAmount: newCampaign.discountAmount
        };
      } else if (newCampaign.type === 'buy_x_get_y') {
        campaignConfig = {
          buyXGetY: newCampaign.buyXGetY
        };
      } else if (newCampaign.type === 'time_limited') {
        campaignConfig = {
          timeLimit: newCampaign.timeLimit,
          discountAmount: newCampaign.discountAmount,
          daysOfWeek: newCampaign.daysOfWeek?.length ? newCampaign.daysOfWeek : undefined,
          startTime: newCampaign.startTime || undefined,
          endTime: newCampaign.endTime || undefined
        };
      }

      const response = await fetch(`/api/campaigns/${editingCampaign.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCampaign.name,
          type: newCampaign.type,
          description: newCampaign.description,
          targetAudience: newCampaign.targetAudience,
          startDate: newCampaign.startDate || new Date().toISOString(),
          endDate: newCampaign.endDate || null,
          budget: newCampaign.budget,
          channels: newCampaign.channels,
          campaignConfig
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update campaign');
      }

      const data = await response.json();
      if (data.success) {
        // Reload campaigns
        await loadCampaigns();
        if (activeTab === 'analytics') {
          await loadAnalytics();
        }
        setShowEditModal(false);
        setEditingCampaign(null);
        // Reset form
        setNewCampaign({
          name: '',
          type: 'promotional' as Campaign['type'],
          description: '',
          targetAudience: '',
          budget: 0,
          startDate: '',
          endDate: '',
          channels: [],
          qrPrefix: '',
          percentageOff: 10,
          firstXCustomers: 50,
          buyXGetY: { buy: 2, get: 1 },
          timeLimit: 24,
          discountAmount: 0,
          minimumSpend: 0,
          daysOfWeek: [],
          startTime: '17:00',
          endTime: '20:00'
        });
      }
    } catch (err) {
      console.error('Error updating campaign:', err);
      alert(err instanceof Error ? err.message : 'Failed to update campaign');
    }
  };

  const handleCreateTier = async () => {
    if (!newTier.tierName.trim()) {
      alert('Please enter a tier name');
      return;
    }

    try {
      const response = await fetch('/api/loyalty/tiers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loungeId,
          tierName: newTier.tierName,
          minPoints: newTier.minPoints,
          maxPoints: newTier.maxPoints || null,
          discountPercent: newTier.discountPercent,
          benefits: newTier.benefits ? newTier.benefits.split(',').map(b => b.trim()) : [],
          pointsPerDollar: newTier.pointsPerDollar,
          displayOrder: newTier.displayOrder
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create tier');
      }

      const data = await response.json();
      if (data.success) {
        // Reload tiers
        await loadLoyaltyData();
        setNewTier({
          tierName: 'bronze',
          minPoints: 0,
          maxPoints: '',
          discountPercent: 0,
          pointsPerDollar: 1,
          benefits: '',
          displayOrder: 0
        });
        setShowTierModal(false);
        setEditingTier(null);
      }
    } catch (err) {
      console.error('Error creating tier:', err);
      alert(err instanceof Error ? err.message : 'Failed to create tier');
    }
  };

  const handleCreateReward = async () => {
    if (!newReward.name.trim()) {
      alert('Please enter a reward name');
      return;
    }

    if (!newReward.pointsCost) {
      alert('Please enter points cost');
      return;
    }

    try {
      const response = await fetch('/api/loyalty/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loungeId,
          tierId: newReward.tierId || null,
          name: newReward.name,
          description: newReward.description || null,
          pointsCost: newReward.pointsCost,
          discountPercent: newReward.discountPercent || null,
          discountAmountCents: newReward.discountAmountCents || null,
          rewardType: newReward.rewardType,
          maxRedemptions: newReward.maxRedemptions || null,
          validFrom: newReward.validFrom || null,
          validUntil: newReward.validUntil || null,
          displayOrder: newReward.displayOrder
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create reward');
      }

      const data = await response.json();
      if (data.success) {
        // Reload rewards
        await loadLoyaltyData();
        setNewReward({
          name: '',
          description: '',
          tierId: '',
          pointsCost: 0,
          discountPercent: '',
          discountAmountCents: '',
          rewardType: 'discount',
          maxRedemptions: '',
          validFrom: '',
          validUntil: '',
          displayOrder: 0
        });
        setShowRewardModal(false);
        setEditingReward(null);
      }
    } catch (err) {
      console.error('Error creating reward:', err);
      alert(err instanceof Error ? err.message : 'Failed to create reward');
    }
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
                <Button size="sm" variant="outline" onClick={() => handleEditCampaign(campaign)}>
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

  const renderLoyalty = () => {
    if (loyaltyLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-zinc-400">Loading loyalty program...</div>
        </div>
      );
    }

    const tierColors: Record<string, string> = {
      bronze: 'bg-orange-500',
      silver: 'bg-gray-400',
      gold: 'bg-yellow-500',
      platinum: 'bg-purple-500'
    };

    return (
      <div className="space-y-6">
        {/* Actions */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Loyalty Program</h2>
          <div className="flex space-x-3">
            <Button onClick={() => setShowTierModal(true)} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Tier
            </Button>
            <Button onClick={() => setShowRewardModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Reward
            </Button>
          </div>
        </div>

        {/* Loyalty Tiers */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Loyalty Tiers</h3>
          </div>
          {loyaltyTiers.length === 0 ? (
            <div className="text-center py-8 text-zinc-400">
              <Star className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No tiers configured. Create your first tier to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {loyaltyTiers.map((tier) => (
                <div key={tier.id} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-4 h-4 rounded-full ${tierColors[tier.tierName] || 'bg-zinc-500'}`} />
                    <div>
                      <h4 className="font-semibold text-white capitalize">{tier.tierName}</h4>
                      <p className="text-sm text-zinc-400">
                        {tier.minPoints} - {tier.maxPoints || '∞'} points
                        {tier.discountPercent > 0 && ` • ${tier.discountPercent}% discount`}
                        {tier.pointsPerDollar !== 1 && ` • ${tier.pointsPerDollar}x points per dollar`}
                      </p>
                      {tier.benefits && Array.isArray(tier.benefits) && tier.benefits.length > 0 && (
                        <p className="text-xs text-zinc-500 mt-1">
                          Benefits: {tier.benefits.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={tier.isActive ? 'bg-green-500/20 text-green-400' : 'bg-zinc-500/20 text-zinc-400'}>
                      {tier.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Rewards Catalog */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Rewards Catalog</h3>
          </div>
          {loyaltyRewards.length === 0 ? (
            <div className="text-center py-8 text-zinc-400">
              <Gift className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No rewards available. Create rewards for customers to redeem.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loyaltyRewards.map((reward) => (
                <div key={reward.id} className="p-4 bg-zinc-800/50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-white">{reward.name}</h4>
                    {reward.tier && (
                      <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                        {reward.tier.tierName}
                      </Badge>
                    )}
                  </div>
                  {reward.description && (
                    <p className="text-sm text-zinc-400 mb-3">{reward.description}</p>
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-400">Cost:</span>
                      <span className="text-yellow-400 font-semibold">{reward.pointsCost} points</span>
                    </div>
                    {reward.discountPercent && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-400">Discount:</span>
                        <span className="text-green-400">{reward.discountPercent}%</span>
                      </div>
                    )}
                    {reward.discountAmountCents && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-400">Discount:</span>
                        <span className="text-green-400">${(reward.discountAmountCents / 100).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs text-zinc-500 mt-2">
                      <span>Type: {reward.rewardType}</span>
                      {reward.maxRedemptions && (
                        <span>{reward.redemptionCount} / {reward.maxRedemptions} redeemed</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    );
  };

  const renderPricing = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Campaign Pricing</h2>
        <p className="text-zinc-400 mb-6">
          Manage pricing for your campaigns and promotional offers.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 bg-zinc-800/50">
            <h3 className="text-lg font-semibold mb-2">Budget Management</h3>
            <p className="text-zinc-400 text-sm mb-4">
              Total budget allocated: ${campaigns.reduce((sum, c) => sum + c.budget, 0).toLocaleString()}
            </p>
            <p className="text-zinc-400 text-sm">
              Total spent: ${campaigns.reduce((sum, c) => sum + c.spent, 0).toLocaleString()}
            </p>
          </Card>
          <Card className="p-6 bg-zinc-800/50">
            <h3 className="text-lg font-semibold mb-2">ROI Overview</h3>
            <p className="text-zinc-400 text-sm mb-4">
              Average ROI: {campaigns.length > 0 
                ? (campaigns.reduce((sum, c) => sum + c.roi, 0) / campaigns.length).toFixed(2)
                : '0.00'}x
            </p>
            <p className="text-zinc-400 text-sm">
              Total conversions: {campaigns.reduce((sum, c) => sum + c.conversions, 0).toLocaleString()}
            </p>
          </Card>
        </div>
      </Card>
    </div>
  );

  const renderAnalytics = () => {
    if (analyticsLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-zinc-400">Loading analytics...</div>
        </div>
      );
    }

    if (!analyticsData) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-zinc-400">No analytics data available</div>
        </div>
      );
    }

    const { aggregateMetrics, analytics } = analyticsData;

    return (
      <div className="space-y-6">
        {/* Aggregate Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Total Reach</p>
                <p className="text-2xl font-bold text-white">
                  {aggregateMetrics.totalReach.toLocaleString()}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Avg. Conversion Rate</p>
                <p className="text-2xl font-bold text-white">
                  {aggregateMetrics.avgConversionRate}%
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
                  {aggregateMetrics.totalConversions.toLocaleString()}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-400" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Avg. ROI</p>
                <p className="text-2xl font-bold text-white">
                  {parseFloat(aggregateMetrics.avgROI) > 0 ? '+' : ''}{aggregateMetrics.avgROI}%
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-400" />
            </div>
          </Card>
        </div>

        {/* Budget Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Total Budget</p>
                <p className="text-2xl font-bold text-white">
                  ${aggregateMetrics.totalBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-400" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Total Spent</p>
                <p className="text-2xl font-bold text-white">
                  ${aggregateMetrics.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-orange-400" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Active Campaigns</p>
                <p className="text-2xl font-bold text-white">
                  {aggregateMetrics.activeCampaigns} / {aggregateMetrics.totalCampaigns}
                </p>
              </div>
              <Target className="w-8 h-8 text-teal-400" />
            </div>
          </Card>
        </div>

        {/* Individual Campaign Performance */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Campaign Performance Details</h3>
          {analytics.length === 0 ? (
            <div className="text-center py-8 text-zinc-400">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No campaign data available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {analytics.map((campaign: any) => (
                <div key={campaign.campaignId} className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-white">{campaign.campaignName}</h4>
                        <Badge className={statusColors[campaign.status as keyof typeof statusColors]}>
                          {campaign.status}
                        </Badge>
                        <span className="text-xs text-zinc-500">{campaign.campaignType}</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-zinc-400">Reach</p>
                          <p className="text-sm font-semibold text-white">{campaign.metrics.reach.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-400">Conversions</p>
                          <p className="text-sm font-semibold text-white">{campaign.metrics.conversions.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-400">Conversion Rate</p>
                          <p className="text-sm font-semibold text-green-400">{campaign.metrics.conversionRate}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-400">ROI</p>
                          <p className={`text-sm font-semibold ${parseFloat(campaign.metrics.roi) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {parseFloat(campaign.metrics.roi) >= 0 ? '+' : ''}{campaign.metrics.roi}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ROI and Performance Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t border-zinc-700">
                    <div>
                      <p className="text-xs text-zinc-400">Total Spent</p>
                      <p className="text-sm font-semibold text-white">
                        ${parseFloat(campaign.metrics.totalSpent).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-400">Budget</p>
                      <p className="text-sm font-semibold text-white">
                        ${parseFloat(campaign.metrics.budget).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-400">Budget Used</p>
                      <p className="text-sm font-semibold text-white">{campaign.metrics.budgetUtilization}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-400">Cost/Conversion</p>
                      <p className="text-sm font-semibold text-white">
                        ${parseFloat(campaign.metrics.costPerConversion).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-400">Avg Discount</p>
                      <p className="text-sm font-semibold text-white">
                        ${parseFloat(campaign.metrics.avgDiscountPerUsage).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  {/* ROI Visualization */}
                  <div className="mt-4 pt-4 border-t border-zinc-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-zinc-400">ROI Performance</span>
                      <span className={`text-sm font-semibold ${parseFloat(campaign.metrics.roi) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {parseFloat(campaign.metrics.roi) >= 0 ? '+' : ''}{campaign.metrics.roi}%
                      </span>
                    </div>
                    <div className="w-full bg-zinc-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          parseFloat(campaign.metrics.roi) >= 0 ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        style={{
                          width: `${Math.min(100, Math.abs(parseFloat(campaign.metrics.roi)))}%`
                        }}
                      />
                    </div>
                  </div>

                  {/* Conversion Rate Visualization */}
                  <div className="mt-4 pt-4 border-t border-zinc-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-zinc-400">Conversion Rate</span>
                      <span className="text-sm font-semibold text-green-400">
                        {campaign.metrics.conversionRate}%
                      </span>
                    </div>
                    <div className="w-full bg-zinc-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-teal-500"
                        style={{
                          width: `${Math.min(100, parseFloat(campaign.metrics.conversionRate))}%`
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1 text-xs text-zinc-500">
                      <span>{campaign.metrics.conversions} conversions</span>
                      <span>{campaign.metrics.reach} reach</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'campaigns': return renderCampaigns();
      case 'loyalty': return renderLoyalty();
      case 'pricing': return renderPricing();
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

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-zinc-400">Loading campaigns...</div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-400">Error: {error}</p>
            <button
              onClick={loadCampaigns}
              className="mt-2 text-sm text-red-300 hover:text-red-200 underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && renderContent()}

        {/* Create/Edit Campaign Modal */}
        {(showCreateModal || showEditModal) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-800 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-semibold text-white mb-4">
                {editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
              </h3>
              
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
                  <>
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">Time Limit (hours)</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={newCampaign.timeLimit}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, '');
                          const n = v === '' ? 24 : Math.min(168, Math.max(1, parseInt(v, 10) || 24));
                          setNewCampaign(prev => ({ ...prev, timeLimit: v === '' ? 24 : n }));
                        }}
                        onBlur={(e) => {
                          const v = e.target.value.trim();
                          if (v === '' || Number.isNaN(parseInt(v, 10))) setNewCampaign(prev => ({ ...prev, timeLimit: 24 }));
                        }}
                        className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="e.g. 3"
                      />
                      <p className="text-xs text-zinc-400 mt-1">Valid for this many hours once active (no up/down arrows)</p>
                    </div>
                    <div className="space-y-3 pt-2 border-t border-zinc-700">
                      <p className="text-sm font-medium text-zinc-300">Happy hour window (optional)</p>
                      <p className="text-xs text-zinc-400">Apply only on selected days and times (e.g. Wed 5pm–8pm)</p>
                      <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-2">Apply on days</label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { value: 0, label: 'Sun' },
                            { value: 1, label: 'Mon' },
                            { value: 2, label: 'Tue' },
                            { value: 3, label: 'Wed' },
                            { value: 4, label: 'Thu' },
                            { value: 5, label: 'Fri' },
                            { value: 6, label: 'Sat' }
                          ].map(({ value, label }) => (
                            <label key={value} className="inline-flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={(newCampaign.daysOfWeek || []).includes(value)}
                                onChange={(e) => {
                                  const current = newCampaign.daysOfWeek || [];
                                  const next = e.target.checked ? [...current, value] : current.filter(d => d !== value);
                                  setNewCampaign(prev => ({ ...prev, daysOfWeek: next }));
                                }}
                                className="rounded border-zinc-600 bg-zinc-700 text-teal-500 focus:ring-teal-500"
                              />
                              <span className="text-sm text-zinc-300">{label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-zinc-400 mb-1">Start time</label>
                          <input
                            type="time"
                            value={newCampaign.startTime || '17:00'}
                            onChange={(e) => setNewCampaign(prev => ({ ...prev, startTime: e.target.value }))}
                            className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-zinc-400 mb-1">End time</label>
                          <input
                            type="time"
                            value={newCampaign.endTime || '20:00'}
                            onChange={(e) => setNewCampaign(prev => ({ ...prev, endTime: e.target.value }))}
                            className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                      </div>
                    </div>
                  </>
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={newCampaign.startDate}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">End Date (Optional)</label>
                    <input
                      type="date"
                      value={newCampaign.endDate}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                {!editingCampaign && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">QR Prefix (for tracking)</label>
                    <input
                      type="text"
                      value={newCampaign.qrPrefix}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, qrPrefix: e.target.value }))}
                      className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="e.g., weekend25"
                    />
                    <p className="text-xs text-zinc-400 mt-1">Used in QR codes for campaign tracking</p>
                  </div>
                )}
              </div>

              <div className="flex space-x-3 mt-6">
                <Button 
                  onClick={editingCampaign ? handleUpdateCampaign : handleCreateCampaign} 
                  className="flex-1"
                >
                  {editingCampaign ? 'Update Campaign' : 'Create Campaign'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setEditingCampaign(null);
                    // Reset form
                    setNewCampaign({
                      name: '',
                      type: 'promotional' as Campaign['type'],
                      description: '',
                      targetAudience: '',
                      budget: 0,
                      startDate: '',
                      endDate: '',
                      channels: [],
                      qrPrefix: '', // QR prefix for tracking
                      percentageOff: 10,
                      firstXCustomers: 50,
                      buyXGetY: { buy: 2, get: 1 },
                      timeLimit: 24,
                      discountAmount: 0,
                      minimumSpend: 0,
                      daysOfWeek: [],
                      startTime: '17:00',
                      endTime: '20:00'
                    });
                  }} 
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Tier Management Modal */}
        {showTierModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-800 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-semibold text-white mb-4">
                {editingTier ? 'Edit Tier' : 'Create New Tier'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Tier Name</label>
                  <select
                    value={newTier.tierName}
                    onChange={(e) => setNewTier(prev => ({ ...prev, tierName: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="bronze">Bronze</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                    <option value="platinum">Platinum</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Min Points</label>
                    <input
                      type="number"
                      min="0"
                      value={newTier.minPoints}
                      onChange={(e) => setNewTier(prev => ({ ...prev, minPoints: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Max Points (optional)</label>
                    <input
                      type="number"
                      min="0"
                      value={newTier.maxPoints}
                      onChange={(e) => setNewTier(prev => ({ ...prev, maxPoints: e.target.value }))}
                      className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Leave empty for unlimited"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Discount %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={newTier.discountPercent}
                      onChange={(e) => setNewTier(prev => ({ ...prev, discountPercent: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Points per Dollar</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={newTier.pointsPerDollar}
                      onChange={(e) => setNewTier(prev => ({ ...prev, pointsPerDollar: parseFloat(e.target.value) || 1 }))}
                      className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Benefits (comma-separated)</label>
                  <input
                    type="text"
                    value={newTier.benefits}
                    onChange={(e) => setNewTier(prev => ({ ...prev, benefits: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="e.g., Priority seating, Free refills, Exclusive flavors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Display Order</label>
                  <input
                    type="number"
                    min="0"
                    value={newTier.displayOrder}
                    onChange={(e) => setNewTier(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <Button onClick={handleCreateTier} className="flex-1">
                  {editingTier ? 'Update Tier' : 'Create Tier'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowTierModal(false);
                    setEditingTier(null);
                    setNewTier({
                      tierName: 'bronze',
                      minPoints: 0,
                      maxPoints: '',
                      discountPercent: 0,
                      pointsPerDollar: 1,
                      benefits: '',
                      displayOrder: 0
                    });
                  }} 
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Reward Management Modal */}
        {showRewardModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-800 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-semibold text-white mb-4">
                {editingReward ? 'Edit Reward' : 'Create New Reward'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Reward Name</label>
                  <input
                    type="text"
                    value={newReward.name}
                    onChange={(e) => setNewReward(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="e.g., 10% Off Next Visit"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Description</label>
                  <textarea
                    value={newReward.description}
                    onChange={(e) => setNewReward(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    rows={2}
                    placeholder="Describe the reward"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Tier (optional)</label>
                  <select
                    value={newReward.tierId}
                    onChange={(e) => setNewReward(prev => ({ ...prev, tierId: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">All Tiers</option>
                    {loyaltyTiers.map(tier => (
                      <option key={tier.id} value={tier.id}>{tier.tierName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Points Cost</label>
                  <input
                    type="number"
                    min="1"
                    value={newReward.pointsCost}
                    onChange={(e) => setNewReward(prev => ({ ...prev, pointsCost: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Reward Type</label>
                  <select
                    value={newReward.rewardType}
                    onChange={(e) => setNewReward(prev => ({ ...prev, rewardType: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="discount">Discount</option>
                    <option value="free_item">Free Item</option>
                    <option value="upgrade">Upgrade</option>
                    <option value="perk">Perk</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Discount % (optional)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={newReward.discountPercent}
                      onChange={(e) => setNewReward(prev => ({ ...prev, discountPercent: e.target.value }))}
                      className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Discount Amount $ (optional)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newReward.discountAmountCents}
                      onChange={(e) => setNewReward(prev => ({ ...prev, discountAmountCents: e.target.value }))}
                      className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Max Redemptions (optional)</label>
                  <input
                    type="number"
                    min="1"
                    value={newReward.maxRedemptions}
                    onChange={(e) => setNewReward(prev => ({ ...prev, maxRedemptions: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Leave empty for unlimited"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Valid From (optional)</label>
                    <input
                      type="date"
                      value={newReward.validFrom}
                      onChange={(e) => setNewReward(prev => ({ ...prev, validFrom: e.target.value }))}
                      className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Valid Until (optional)</label>
                    <input
                      type="date"
                      value={newReward.validUntil}
                      onChange={(e) => setNewReward(prev => ({ ...prev, validUntil: e.target.value }))}
                      className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Display Order</label>
                  <input
                    type="number"
                    min="0"
                    value={newReward.displayOrder}
                    onChange={(e) => setNewReward(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <Button onClick={handleCreateReward} className="flex-1">
                  {editingReward ? 'Update Reward' : 'Create Reward'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowRewardModal(false);
                    setEditingReward(null);
                    setNewReward({
                      name: '',
                      description: '',
                      tierId: '',
                      pointsCost: 0,
                      discountPercent: '',
                      discountAmountCents: '',
                      rewardType: 'discount',
                      maxRedemptions: '',
                      validFrom: '',
                      validUntil: '',
                      displayOrder: 0
                    });
                  }} 
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Tier Management Modal */}
        {showTierModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-800 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-semibold text-white mb-4">
                {editingTier ? 'Edit Tier' : 'Create New Tier'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Tier Name</label>
                  <select
                    value={newTier.tierName}
                    onChange={(e) => setNewTier(prev => ({ ...prev, tierName: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="bronze">Bronze</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                    <option value="platinum">Platinum</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Min Points</label>
                    <input
                      type="number"
                      min="0"
                      value={newTier.minPoints}
                      onChange={(e) => setNewTier(prev => ({ ...prev, minPoints: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Max Points (optional)</label>
                    <input
                      type="number"
                      min="0"
                      value={newTier.maxPoints}
                      onChange={(e) => setNewTier(prev => ({ ...prev, maxPoints: e.target.value }))}
                      className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Leave empty for unlimited"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Discount %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={newTier.discountPercent}
                      onChange={(e) => setNewTier(prev => ({ ...prev, discountPercent: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Points per Dollar</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={newTier.pointsPerDollar}
                      onChange={(e) => setNewTier(prev => ({ ...prev, pointsPerDollar: parseFloat(e.target.value) || 1 }))}
                      className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Benefits (comma-separated)</label>
                  <input
                    type="text"
                    value={newTier.benefits}
                    onChange={(e) => setNewTier(prev => ({ ...prev, benefits: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="e.g., Priority seating, Free refills, Exclusive flavors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Display Order</label>
                  <input
                    type="number"
                    min="0"
                    value={newTier.displayOrder}
                    onChange={(e) => setNewTier(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <Button onClick={handleCreateTier} className="flex-1">
                  {editingTier ? 'Update Tier' : 'Create Tier'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowTierModal(false);
                    setEditingTier(null);
                    setNewTier({
                      tierName: 'bronze',
                      minPoints: 0,
                      maxPoints: '',
                      discountPercent: 0,
                      pointsPerDollar: 1,
                      benefits: '',
                      displayOrder: 0
                    });
                  }} 
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Reward Management Modal */}
        {showRewardModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-800 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-semibold text-white mb-4">
                {editingReward ? 'Edit Reward' : 'Create New Reward'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Reward Name</label>
                  <input
                    type="text"
                    value={newReward.name}
                    onChange={(e) => setNewReward(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="e.g., 10% Off Next Visit"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Description</label>
                  <textarea
                    value={newReward.description}
                    onChange={(e) => setNewReward(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    rows={2}
                    placeholder="Describe the reward"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Tier (optional)</label>
                  <select
                    value={newReward.tierId}
                    onChange={(e) => setNewReward(prev => ({ ...prev, tierId: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">All Tiers</option>
                    {loyaltyTiers.map(tier => (
                      <option key={tier.id} value={tier.id}>{tier.tierName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Points Cost</label>
                  <input
                    type="number"
                    min="1"
                    value={newReward.pointsCost}
                    onChange={(e) => setNewReward(prev => ({ ...prev, pointsCost: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Reward Type</label>
                  <select
                    value={newReward.rewardType}
                    onChange={(e) => setNewReward(prev => ({ ...prev, rewardType: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="discount">Discount</option>
                    <option value="free_item">Free Item</option>
                    <option value="upgrade">Upgrade</option>
                    <option value="perk">Perk</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Discount % (optional)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={newReward.discountPercent}
                      onChange={(e) => setNewReward(prev => ({ ...prev, discountPercent: e.target.value }))}
                      className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Discount Amount $ (optional)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newReward.discountAmountCents}
                      onChange={(e) => setNewReward(prev => ({ ...prev, discountAmountCents: e.target.value }))}
                      className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Max Redemptions (optional)</label>
                  <input
                    type="number"
                    min="1"
                    value={newReward.maxRedemptions}
                    onChange={(e) => setNewReward(prev => ({ ...prev, maxRedemptions: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Leave empty for unlimited"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Valid From (optional)</label>
                    <input
                      type="date"
                      value={newReward.validFrom}
                      onChange={(e) => setNewReward(prev => ({ ...prev, validFrom: e.target.value }))}
                      className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Valid Until (optional)</label>
                    <input
                      type="date"
                      value={newReward.validUntil}
                      onChange={(e) => setNewReward(prev => ({ ...prev, validUntil: e.target.value }))}
                      className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Display Order</label>
                  <input
                    type="number"
                    min="0"
                    value={newReward.displayOrder}
                    onChange={(e) => setNewReward(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <Button onClick={handleCreateReward} className="flex-1">
                  {editingReward ? 'Update Reward' : 'Create Reward'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowRewardModal(false);
                    setEditingReward(null);
                    setNewReward({
                      name: '',
                      description: '',
                      tierId: '',
                      pointsCost: 0,
                      discountPercent: '',
                      discountAmountCents: '',
                      rewardType: 'discount',
                      maxRedemptions: '',
                      validFrom: '',
                      validUntil: '',
                      displayOrder: 0
                    });
                  }} 
                  className="flex-1"
                >
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
