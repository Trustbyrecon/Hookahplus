'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Brain, 
  Star, 
  TrendingUp, 
  Clock, 
  Users, 
  Eye, 
  EyeOff,
  Lock,
  Unlock,
  Award,
  Target,
  Zap,
  Heart,
  Coffee,
  Wind,
  Sparkles,
  BarChart3,
  Activity,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Crown,
  Flame,
  X
} from 'lucide-react';

interface BehavioralMemory {
  guestId: string;
  preferences: {
    favoriteFlavors: string[];
    preferredZone: string;
    averageSessionDuration: number;
    spendingPattern: 'budget' | 'premium' | 'luxury';
    visitFrequency: 'regular' | 'occasional' | 'first-time';
    preferredTimeSlots: string[];
    typicalOrderPattern: string[];
  };
  trustScore: number;
  loyaltyTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  badges: Badge[];
  badgeProgress: BadgeProgress[];
  sessionHistory: SessionSummary[];
  predictiveInsights: {
    nextVisitPrediction: string;
    likelyOrder: string[];
    optimalServiceTiming: string;
    upsellProbability: number;
  };
  engagementSeeds: {
    loyaltyPoints: number;
    streakCount: number;
    lastVisitDate: string;
    nextRewardMilestone: number;
    personalizedOffers: PersonalizedOffer[];
    socialConnections: SocialConnection[];
    achievementProgress: AchievementProgress[];
  };
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  earnedAt: string;
  category: 'loyalty' | 'spending' | 'social' | 'special' | 'achievement' | 'community';
}

interface BadgeProgress {
  badgeId: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  currentProgress: number;
  targetProgress: number;
  nextMilestone: string;
  estimatedTimeToEarn: string;
  category: 'loyalty' | 'spending' | 'social' | 'special' | 'achievement' | 'community';
}

interface SessionSummary {
  id: string;
  date: string;
  duration: number;
  totalSpent: number;
  satisfaction: number;
  notes: string;
  piiMasked: boolean;
}

interface SessionNote {
  id: string;
  content: string;
  author: string;
  createdAt: string;
  piiLevel: 'none' | 'low' | 'medium' | 'high';
  category: 'service' | 'equipment' | 'customer' | 'operational';
}

interface PersonalizedOffer {
  id: string;
  title: string;
  description: string;
  discount: number;
  validUntil: string;
  category: 'flavor' | 'session' | 'premium' | 'social';
  icon: React.ReactNode;
  color: string;
}

interface SocialConnection {
  id: string;
  name: string;
  type: 'friend' | 'group' | 'community';
  lastSeen: string;
  sharedInterests: string[];
  mutualSessions: number;
}

interface AchievementProgress {
  id: string;
  name: string;
  description: string;
  currentProgress: number;
  targetProgress: number;
  reward: string;
  icon: React.ReactNode;
  color: string;
  category: 'loyalty' | 'social' | 'exploration' | 'premium';
}

interface GuestIntelligenceDashboardProps {
  sessionId?: string;
  tableId?: string;
  onClose: () => void;
}

export default function GuestIntelligenceDashboard({ sessionId, tableId, onClose }: GuestIntelligenceDashboardProps) {
  const [behavioralMemory, setBehavioralMemory] = useState<BehavioralMemory | null>(null);
  const [sessionNotes, setSessionNotes] = useState<SessionNote[]>([]);
  const [piiMaskingEnabled, setPiiMaskingEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'intelligence' | 'achievements' | 'operational'>('profile');
  const [loading, setLoading] = useState(true);

  // Mock behavioral memory data
  useEffect(() => {
    const mockMemory: BehavioralMemory = {
      guestId: 'guest_001',
      preferences: {
        favoriteFlavors: ['Blue Mist', 'Double Apple', 'Mint Fresh'],
        preferredZone: 'VIP',
        averageSessionDuration: 45,
        spendingPattern: 'premium',
        visitFrequency: 'regular',
        preferredTimeSlots: ['7:00 PM', '8:00 PM', '9:00 PM'],
        typicalOrderPattern: ['Blue Mist + Extra Mint', 'Strawberry Mojito', 'Premium Service']
      },
      trustScore: 87,
      loyaltyTier: 'gold',
      badges: [
        {
          id: 'loyalty_10',
          name: 'Loyalty Legend',
          description: '10+ sessions completed',
          icon: <Crown className="w-4 h-4" />,
          color: 'text-yellow-400',
          earnedAt: '2024-01-15',
          category: 'loyalty'
        },
        {
          id: 'spending_premium',
          name: 'Premium Patron',
          description: 'Consistent premium spending',
          icon: <Star className="w-4 h-4" />,
          color: 'text-purple-400',
          earnedAt: '2024-01-10',
          category: 'spending'
        },
        {
          id: 'social_referral',
          name: 'Social Butterfly',
          description: 'Referred 3+ friends',
          icon: <Heart className="w-4 h-4" />,
          color: 'text-pink-400',
          earnedAt: '2024-01-05',
          category: 'social'
        }
      ],
      badgeProgress: [
        {
          badgeId: 'community_champion',
          name: 'Community Champion',
          description: 'Share 5 experiences on social media',
          icon: <Sparkles className="w-4 h-4" />,
          color: 'text-blue-400',
          currentProgress: 3,
          targetProgress: 5,
          nextMilestone: 'Share 2 more experiences',
          estimatedTimeToEarn: '2-3 visits',
          category: 'community'
        },
        {
          badgeId: 'review_master',
          name: 'Review Master',
          description: 'Leave 10 reviews across Hookah+ network',
          icon: <MessageSquare className="w-4 h-4" />,
          color: 'text-green-400',
          currentProgress: 7,
          targetProgress: 10,
          nextMilestone: 'Leave 3 more reviews',
          estimatedTimeToEarn: '1-2 visits',
          category: 'community'
        },
        {
          badgeId: 'flavor_explorer',
          name: 'Flavor Explorer',
          description: 'Try 15 different flavors',
          icon: <Wind className="w-4 h-4" />,
          color: 'text-orange-400',
          currentProgress: 12,
          targetProgress: 15,
          nextMilestone: 'Try 3 more flavors',
          estimatedTimeToEarn: '3-4 visits',
          category: 'achievement'
        }
      ],
      sessionHistory: [
        {
          id: 'session_001',
          date: '2024-01-20',
          duration: 50,
          totalSpent: 45.00,
          satisfaction: 5,
          notes: 'Excellent service, very satisfied',
          piiMasked: true
        },
        {
          id: 'session_002',
          date: '2024-01-15',
          duration: 40,
          totalSpent: 38.00,
          satisfaction: 4,
          notes: 'Good experience, minor delay',
          piiMasked: true
        }
      ],
      predictiveInsights: {
        nextVisitPrediction: 'Likely to visit within 1-2 weeks',
        likelyOrder: ['Blue Mist + Extra Mint', 'Strawberry Mojito'],
        optimalServiceTiming: 'Start cleanup at 40 minutes (prefers 45-min sessions)',
        upsellProbability: 75
      },
      engagementSeeds: {
        loyaltyPoints: 1250,
        streakCount: 7,
        lastVisitDate: '2024-01-20',
        nextRewardMilestone: 1500,
        personalizedOffers: [
          {
            id: 'offer_001',
            title: 'Flavor Explorer',
            description: 'Try 3 new flavors and get 20% off',
            discount: 20,
            validUntil: '2024-02-15',
            category: 'flavor',
            icon: <Sparkles className="w-4 h-4" />,
            color: 'bg-purple-500'
          },
          {
            id: 'offer_002',
            title: 'Premium Upgrade',
            description: 'Upgrade to VIP service for 15% off',
            discount: 15,
            validUntil: '2024-02-01',
            category: 'premium',
            icon: <Crown className="w-4 h-4" />,
            color: 'bg-yellow-500'
          }
        ],
        socialConnections: [
          {
            id: 'social_001',
            name: 'Alex M.',
            type: 'friend',
            lastSeen: '2024-01-18',
            sharedInterests: ['Blue Mist', 'VIP Zone'],
            mutualSessions: 3
          },
          {
            id: 'social_002',
            name: 'Sarah K.',
            type: 'friend',
            lastSeen: '2024-01-15',
            sharedInterests: ['Mint Fresh', 'Evening Sessions'],
            mutualSessions: 2
          }
        ],
        achievementProgress: [
          {
            id: 'achieve_001',
            name: 'Flavor Master',
            description: 'Try 10 different flavors',
            currentProgress: 7,
            targetProgress: 10,
            reward: 'Free premium flavor upgrade',
            icon: <Star className="w-4 h-4" />,
            color: 'text-purple-400',
            category: 'exploration'
          },
          {
            id: 'achieve_002',
            name: 'Social Connector',
            description: 'Bring 5 friends to sessions',
            currentProgress: 3,
            targetProgress: 5,
            reward: 'Group discount for next visit',
            icon: <Users className="w-4 h-4" />,
            color: 'text-blue-400',
            category: 'social'
          }
        ]
      }
    };

    const mockNotes: SessionNote[] = [
      {
        id: 'note_001',
        content: 'Customer prefers Blue Mist with extra mint',
        author: 'Staff Member',
        createdAt: '2024-01-20T10:30:00Z',
        piiLevel: 'low',
        category: 'customer'
      },
      {
        id: 'note_002',
        content: 'VIP zone table T-001 - premium service requested',
        author: 'Manager',
        createdAt: '2024-01-20T10:25:00Z',
        piiLevel: 'none',
        category: 'service'
      },
      {
        id: 'note_003',
        content: 'Equipment check: All hookahs functioning properly',
        author: 'BOH Staff',
        createdAt: '2024-01-20T10:20:00Z',
        piiLevel: 'none',
        category: 'equipment'
      }
    ];

    setTimeout(() => {
      setBehavioralMemory(mockMemory);
      setSessionNotes(mockNotes);
      setLoading(false);
    }, 1000);
  }, [sessionId]);

  const getPiiMaskedContent = (content: string, piiLevel: string) => {
    if (!piiMaskingEnabled || piiLevel === 'none') return content;
    
    // Simple PII masking - in production, use proper PII detection
    return content.replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, '[CUSTOMER NAME]')
                 .replace(/\b\d{3}-\d{3}-\d{4}\b/g, '[PHONE]')
                 .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]');
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getLoyaltyTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'text-purple-400';
      case 'gold': return 'text-yellow-400';
      case 'silver': return 'text-gray-400';
      case 'bronze': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-zinc-900 rounded-lg p-6 flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
          <span className="text-white">Loading Staff Panel...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Guest Intelligence Dashboard</h2>
              <p className="text-sm text-zinc-400">
                {tableId ? `Table ${tableId}` : 'Session Overview'} • Customer Memory & Predictive Service
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setPiiMaskingEnabled(!piiMaskingEnabled)}
              className={`p-2 rounded-lg transition-colors ${
                piiMaskingEnabled 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-red-600 hover:bg-red-700'
              }`}
              title={piiMaskingEnabled ? 'PII Masking Enabled' : 'PII Masking Disabled'}
            >
              {piiMaskingEnabled ? <EyeOff className="w-5 h-5 text-white" /> : <Eye className="w-5 h-5 text-white" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-700">
          {[
            { id: 'profile', label: 'Customer Profile', icon: <BarChart3 className="w-4 h-4" /> },
            { id: 'intelligence', label: 'Service Intelligence', icon: <Brain className="w-4 h-4" /> },
            { id: 'achievements', label: 'Achievements & Rewards', icon: <Award className="w-4 h-4" /> },
            { id: 'operational', label: 'Operational Memory', icon: <MessageSquare className="w-4 h-4" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'profile' && behavioralMemory && (
            <div className="space-y-6">
              {/* Trust Score & Loyalty */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-zinc-800 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-8 h-8 text-blue-400" />
                    <div>
                      <p className="text-sm text-zinc-400">Trust Score</p>
                      <p className={`text-2xl font-bold ${getTrustScoreColor(behavioralMemory.trustScore)}`}>
                        {behavioralMemory.trustScore}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-zinc-800 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <Crown className="w-8 h-8 text-yellow-400" />
                    <div>
                      <p className="text-sm text-zinc-400">Loyalty Tier</p>
                      <p className={`text-xl font-bold ${getLoyaltyTierColor(behavioralMemory.loyaltyTier)}`}>
                        {behavioralMemory.loyaltyTier.toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-zinc-800 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="w-8 h-8 text-green-400" />
                    <div>
                      <p className="text-sm text-zinc-400">Visit Frequency</p>
                      <p className="text-xl font-bold text-white">
                        {behavioralMemory.preferences.visitFrequency.replace('-', ' ').toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div className="bg-zinc-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <Target className="w-5 h-5 text-blue-400" />
                  <span>Customer Preferences</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-zinc-400 mb-2">Favorite Flavors</p>
                    <div className="flex flex-wrap gap-2">
                      {behavioralMemory.preferences.favoriteFlavors.map(flavor => (
                        <span key={flavor} className="px-3 py-1 bg-blue-600 text-blue-100 rounded-full text-sm">
                          {flavor}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400 mb-2">Preferred Zone</p>
                    <span className="px-3 py-1 bg-purple-600 text-purple-100 rounded-full text-sm">
                      {behavioralMemory.preferences.preferredZone}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400 mb-2">Average Session Duration</p>
                    <span className="text-white font-medium">
                      {behavioralMemory.preferences.averageSessionDuration} minutes
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400 mb-2">Spending Pattern</p>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      behavioralMemory.preferences.spendingPattern === 'premium' 
                        ? 'bg-purple-600 text-purple-100'
                        : 'bg-green-600 text-green-100'
                    }`}>
                      {behavioralMemory.preferences.spendingPattern.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400 mb-2">Preferred Time Slots</p>
                    <div className="flex flex-wrap gap-1">
                      {behavioralMemory.preferences.preferredTimeSlots.map(time => (
                        <span key={time} className="px-2 py-1 bg-blue-600 text-blue-100 rounded text-xs">
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400 mb-2">Typical Order Pattern</p>
                    <div className="space-y-1">
                      {behavioralMemory.preferences.typicalOrderPattern.map(order => (
                        <div key={order} className="text-xs text-zinc-300">• {order}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Predictive Insights */}
              <div className="bg-zinc-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <span>Predictive Service Intelligence</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-zinc-400 mb-2">Next Visit Prediction</p>
                    <p className="text-white font-medium">{behavioralMemory.predictiveInsights.nextVisitPrediction}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400 mb-2">Likely Order</p>
                    <div className="flex flex-wrap gap-1">
                      {behavioralMemory.predictiveInsights.likelyOrder.map(item => (
                        <span key={item} className="px-2 py-1 bg-green-600 text-green-100 rounded text-xs">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400 mb-2">Optimal Service Timing</p>
                    <p className="text-white text-sm">{behavioralMemory.predictiveInsights.optimalServiceTiming}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400 mb-2">Upsell Probability</p>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-zinc-700 rounded-full h-2">
                        <div 
                          className="bg-green-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${behavioralMemory.predictiveInsights.upsellProbability}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-white">{behavioralMemory.predictiveInsights.upsellProbability}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Engagement Seeds & Loyalty Experience */}
              <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Heart className="w-6 h-6 text-pink-400" />
                  <h3 className="text-lg font-semibold text-white">Loyalty & Engagement</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Loyalty Points & Streak */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Star className="w-5 h-5 text-yellow-400" />
                        <span className="text-white font-medium">Loyalty Points</span>
                      </div>
                      <span className="text-2xl font-bold text-yellow-400">
                        {behavioralMemory.engagementSeeds?.loyaltyPoints || 0}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Flame className="w-5 h-5 text-orange-400" />
                        <span className="text-white font-medium">Visit Streak</span>
                      </div>
                      <span className="text-xl font-bold text-orange-400">
                        {behavioralMemory.engagementSeeds?.streakCount || 0} days
                      </span>
                    </div>

                    <div className="bg-zinc-800/50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-zinc-400">Next Reward</span>
                        <span className="text-sm text-purple-400">
                          {behavioralMemory.engagementSeeds?.nextRewardMilestone || 100} points
                        </span>
                      </div>
                      <div className="w-full bg-zinc-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${Math.min(100, ((behavioralMemory.engagementSeeds?.loyaltyPoints || 0) / (behavioralMemory.engagementSeeds?.nextRewardMilestone || 100)) * 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Personalized Offers */}
                  <div className="space-y-3">
                    <h4 className="text-white font-medium flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span>Personalized Offers</span>
                    </h4>
                    <div className="space-y-2">
                      {behavioralMemory.engagementSeeds?.personalizedOffers?.slice(0, 2).map((offer) => (
                        <div key={offer.id} className="bg-zinc-800/50 rounded-lg p-3 border border-purple-500/20">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className={`p-1 rounded ${offer.color}`}>
                                {offer.icon}
                              </div>
                              <div>
                                <p className="text-white text-sm font-medium">{offer.title}</p>
                                <p className="text-zinc-400 text-xs">{offer.description}</p>
                              </div>
                            </div>
                            <span className="text-green-400 font-bold">{offer.discount}% OFF</span>
                          </div>
                        </div>
                      )) || (
                        <div className="text-center py-4 text-zinc-500">
                          <Sparkles className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
                          <p className="text-sm">No personalized offers available</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Social Connections */}
                {behavioralMemory.engagementSeeds?.socialConnections && behavioralMemory.engagementSeeds.socialConnections.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-white font-medium mb-3 flex items-center space-x-2">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span>Social Connections</span>
                    </h4>
                    <div className="flex space-x-3">
                      {behavioralMemory.engagementSeeds.socialConnections.slice(0, 3).map((connection) => (
                        <div key={connection.id} className="bg-zinc-800/50 rounded-lg p-3 border border-blue-500/20">
                          <div className="text-center">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                              <span className="text-white text-xs font-bold">
                                {connection.name.charAt(0)}
                              </span>
                            </div>
                            <p className="text-white text-xs font-medium">{connection.name}</p>
                            <p className="text-zinc-400 text-xs">{connection.type}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'intelligence' && behavioralMemory && (
            <div className="space-y-6">
              <div className="bg-zinc-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-blue-400" />
                  <span>Service Intelligence & History</span>
                </h3>
                <div className="space-y-4">
                  {behavioralMemory.sessionHistory.map(session => (
                    <div key={session.id} className="border border-zinc-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-zinc-400">{session.date}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-zinc-400">{session.duration}min</span>
                          <span className="text-sm font-medium text-green-400">${session.totalSpent}</span>
                        </div>
                      </div>
                      <p className="text-white text-sm mb-2">{session.notes}</p>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${
                                i < session.satisfaction ? 'text-yellow-400 fill-current' : 'text-zinc-600'
                              }`} 
                            />
                          ))}
                        </div>
                        {session.piiMasked && (
                          <span className="text-xs text-blue-400 flex items-center space-x-1">
                            <Shield className="w-3 h-3" />
                            <span>PII Protected</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'achievements' && behavioralMemory && (
            <div className="space-y-6">
              <div className="bg-zinc-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <Award className="w-5 h-5 text-yellow-400" />
                  <span>Earned Badges</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {behavioralMemory.badges.map(badge => (
                    <div key={badge.id} className="border border-zinc-700 rounded-lg p-4 hover:border-zinc-600 transition-colors">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`p-2 rounded-lg bg-zinc-700 ${badge.color}`}>
                          {badge.icon}
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{badge.name}</h4>
                          <p className="text-xs text-zinc-400">{badge.earnedAt}</p>
                        </div>
                      </div>
                      <p className="text-sm text-zinc-300">{badge.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress Tracking */}
              <div className="bg-zinc-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <Target className="w-5 h-5 text-green-400" />
                  <span>Progress & Future Rewards</span>
                </h3>
                <div className="space-y-4">
                  {behavioralMemory.badgeProgress.map(progress => (
                    <div key={progress.badgeId} className="border border-zinc-700 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`p-2 rounded-lg bg-zinc-700 ${progress.color}`}>
                          {progress.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-white">{progress.name}</h4>
                          <p className="text-sm text-zinc-300">{progress.description}</p>
                        </div>
                      </div>
                      <div className="mb-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-zinc-400">Progress</span>
                          <span className="text-sm text-white">{progress.currentProgress}/{progress.targetProgress}</span>
                        </div>
                        <div className="w-full bg-zinc-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              progress.category === 'community' ? 'bg-blue-400' :
                              progress.category === 'achievement' ? 'bg-orange-400' :
                              'bg-green-400'
                            }`}
                            style={{ width: `${(progress.currentProgress / progress.targetProgress) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-400">{progress.nextMilestone}</span>
                        <span className="text-blue-400">{progress.estimatedTimeToEarn}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'operational' && (
            <div className="space-y-6">
              <div className="bg-zinc-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5 text-blue-400" />
                    <span>Operational Memory</span>
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-zinc-400">PII Protection:</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      piiMaskingEnabled 
                        ? 'bg-green-600 text-green-100' 
                        : 'bg-red-600 text-red-100'
                    }`}>
                      {piiMaskingEnabled ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  {sessionNotes.map(note => (
                    <div key={note.id} className="border border-zinc-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-white">{note.author}</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            note.piiLevel === 'none' ? 'bg-green-600 text-green-100' :
                            note.piiLevel === 'low' ? 'bg-yellow-600 text-yellow-100' :
                            note.piiLevel === 'medium' ? 'bg-orange-600 text-orange-100' :
                            'bg-red-600 text-red-100'
                          }`}>
                            PII {note.piiLevel.toUpperCase()}
                          </span>
                        </div>
                        <span className="text-xs text-zinc-400">{note.createdAt}</span>
                      </div>
                      <p className="text-sm text-zinc-300 mb-2">
                        {getPiiMaskedContent(note.content, note.piiLevel)}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          note.category === 'customer' ? 'bg-blue-600 text-blue-100' :
                          note.category === 'equipment' ? 'bg-purple-600 text-purple-100' :
                          note.category === 'service' ? 'bg-green-600 text-green-100' :
                          'bg-gray-600 text-gray-100'
                        }`}>
                          {note.category.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
