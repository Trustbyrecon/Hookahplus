'use client';

import React, { useState } from 'react';
import { 
  Brain, 
  Users, 
  Star, 
  Flame, 
  Clock, 
  MapPin, 
  TrendingUp, 
  Award, 
  Heart, 
  Sparkles, 
  Crown, 
  Target,
  BarChart3,
  Filter,
  Search,
  RefreshCw,
  Eye,
  Zap
} from 'lucide-react';

export default function GuestIntelligencePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedGuest, setSelectedGuest] = useState('guest_001');

  // Mock guest data
  const guests = [
    {
      id: 'guest_001',
      name: 'Sarah Johnson',
      trustScore: 87,
      loyaltyTier: 'GOLD',
      visitFrequency: 'REGULAR',
      lastVisit: '2024-01-20',
      totalVisits: 15,
      averageSpend: 45.50,
      favoriteFlavors: ['Blue Mist', 'Double Apple', 'Mint Fresh'],
      preferredTimeSlots: ['7:00 PM', '8:00 PM', '9:00 PM'],
      preferredZone: 'VIP',
      spendingPattern: 'PREMIUM',
      typicalOrder: ['Blue Mist + Extra Mint', 'Strawberry Mojito', 'Premium Service'],
      nextVisitPrediction: 'Likely to visit within 1-2 weeks',
      likelyOrder: ['Blue Mist + Extra Mint', 'Strawberry Mojito'],
      optimalServiceTiming: 'Start cleanup at 40 minutes (prefers 45-min sessions)',
      upsellProbability: 75,
      loyaltyPoints: 1250,
      streakCount: 7,
      nextRewardMilestone: 1500,
      personalizedOffers: [
        {
          id: 'offer_001',
          title: 'Flavor Explorer',
          description: 'Try 3 new flavors and get 20% off',
          discount: 20,
          validUntil: '2024-02-15',
          category: 'flavor'
        },
        {
          id: 'offer_002',
          title: 'Premium Upgrade',
          description: 'Upgrade to VIP service for 15% off',
          discount: 15,
          validUntil: '2024-02-01',
          category: 'premium'
        }
      ],
      socialConnections: [
        { id: 'social_001', name: 'Alex M.', type: 'friend', lastSeen: '2024-01-18', sharedInterests: ['Blue Mist', 'VIP Zone'], mutualSessions: 3 },
        { id: 'social_002', name: 'Sarah K.', type: 'friend', lastSeen: '2024-01-15', sharedInterests: ['Mint Fresh', 'Evening Sessions'], mutualSessions: 2 }
      ],
      achievementProgress: [
        { id: 'achieve_001', name: 'Flavor Master', description: 'Try 10 different flavors', currentProgress: 7, targetProgress: 10, reward: 'Free premium flavor upgrade', category: 'exploration' },
        { id: 'achieve_002', name: 'Social Connector', description: 'Bring 5 friends to sessions', currentProgress: 3, targetProgress: 5, reward: 'Group discount for next visit', category: 'social' }
      ]
    },
    {
      id: 'guest_002',
      name: 'Mike Chen',
      trustScore: 72,
      loyaltyTier: 'SILVER',
      visitFrequency: 'OCCASIONAL',
      lastVisit: '2024-01-15',
      totalVisits: 8,
      averageSpend: 32.00,
      favoriteFlavors: ['Double Apple', 'Mint Fresh'],
      preferredTimeSlots: ['6:00 PM', '7:00 PM'],
      preferredZone: 'Main Floor',
      spendingPattern: 'MODERATE',
      typicalOrder: ['Double Apple', 'Standard Service'],
      nextVisitPrediction: 'Likely to visit within 2-3 weeks',
      likelyOrder: ['Double Apple', 'Mint Fresh'],
      optimalServiceTiming: 'Start cleanup at 35 minutes (prefers 40-min sessions)',
      upsellProbability: 45,
      loyaltyPoints: 680,
      streakCount: 3,
      nextRewardMilestone: 1000,
      personalizedOffers: [
        {
          id: 'offer_003',
          title: 'Welcome Back',
          description: '20% off your next visit',
          discount: 20,
          validUntil: '2024-02-10',
          category: 'retention'
        }
      ],
      socialConnections: [],
      achievementProgress: [
        { id: 'achieve_003', name: 'Regular Visitor', description: 'Visit 10 times', currentProgress: 8, targetProgress: 10, reward: 'Free session upgrade', category: 'loyalty' }
      ]
    }
  ];

  const selectedGuestData = guests.find(g => g.id === selectedGuest) || guests[0];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'profile', label: 'Profile', icon: <Users className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'insights', label: 'Insights', icon: <Brain className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-4">
            <Brain className="w-10 h-10 text-green-400" />
            Guest Intelligence Dashboard
          </h1>
          <p className="text-xl text-zinc-400">
            Customer analytics, predictive insights, and personalized service optimization
          </p>
        </div>

        {/* Guest Selection */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Select Guest</h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search guests..."
                  className="pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-green-500"
                />
              </div>
              <button className="p-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors">
                <RefreshCw className="w-4 h-4 text-zinc-400" />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {guests.map(guest => (
              <div
                key={guest.id}
                onClick={() => setSelectedGuest(guest.id)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedGuest === guest.id
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{guest.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      guest.loyaltyTier === 'GOLD' ? 'bg-yellow-500/20 text-yellow-400' :
                      guest.loyaltyTier === 'SILVER' ? 'bg-gray-500/20 text-gray-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {guest.loyaltyTier}
                    </span>
                    <span className="text-sm text-zinc-400">{guest.trustScore}</span>
                  </div>
                </div>
                <div className="text-sm text-zinc-400 space-y-1">
                  <div>Last visit: {guest.lastVisit}</div>
                  <div>Total visits: {guest.totalVisits}</div>
                  <div>Avg spend: ${guest.averageSpend}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-green-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-zinc-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-zinc-400">Trust Score</span>
                    <Star className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div className="text-2xl font-bold text-yellow-400">{selectedGuestData.trustScore}</div>
                </div>
                <div className="bg-zinc-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-zinc-400">Loyalty Tier</span>
                    <Crown className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div className="text-2xl font-bold text-yellow-400">{selectedGuestData.loyaltyTier}</div>
                </div>
                <div className="bg-zinc-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-zinc-400">Visit Frequency</span>
                    <Clock className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-blue-400">{selectedGuestData.visitFrequency}</div>
                </div>
                <div className="bg-zinc-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-zinc-400">Upsell Probability</span>
                    <Target className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="text-2xl font-bold text-green-400">{selectedGuestData.upsellProbability}%</div>
                </div>
              </div>

              {/* Quick Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-zinc-700/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-400" />
                    Predictive Insights
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-zinc-400">Next Visit Prediction</div>
                      <div className="text-white">{selectedGuestData.nextVisitPrediction}</div>
                    </div>
                    <div>
                      <div className="text-sm text-zinc-400">Likely Order</div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedGuestData.likelyOrder.map((item, index) => (
                          <span key={index} className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-zinc-400">Optimal Service Timing</div>
                      <div className="text-white">{selectedGuestData.optimalServiceTiming}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-700/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-400" />
                    Loyalty & Engagement
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-400">Loyalty Points</span>
                      <span className="text-lg font-bold text-yellow-400">{selectedGuestData.loyaltyPoints}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-400">Visit Streak</span>
                      <span className="text-lg font-bold text-orange-400">{selectedGuestData.streakCount} days</span>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-zinc-400">Next Reward</span>
                        <span className="text-sm text-purple-400">{selectedGuestData.nextRewardMilestone} points</span>
                      </div>
                      <div className="w-full bg-zinc-600 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${Math.min(100, (selectedGuestData.loyaltyPoints / selectedGuestData.nextRewardMilestone) * 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Customer Preferences */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Customer Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-zinc-400 mb-2">Favorite Flavors</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedGuestData.favoriteFlavors.map((flavor, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                            {flavor}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-zinc-400 mb-2">Preferred Time Slots</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedGuestData.preferredTimeSlots.map((time, index) => (
                          <span key={index} className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                            {time}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-zinc-400 mb-2">Preferred Zone</div>
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                        {selectedGuestData.preferredZone}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm text-zinc-400 mb-2">Spending Pattern</div>
                      <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
                        {selectedGuestData.spendingPattern}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm text-zinc-400 mb-2">Average Session Duration</div>
                      <span className="text-white">45 minutes</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Typical Order Pattern */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Typical Order Pattern</h3>
                <div className="bg-zinc-700/50 rounded-lg p-4">
                  <ul className="space-y-2">
                    {selectedGuestData.typicalOrder.map((item, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-zinc-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
        </div>
      </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Guest Analytics</h3>
              <div className="text-center py-12 text-zinc-400">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
                <p>Analytics dashboard coming soon...</p>
              </div>
    </div>
          )}

          {activeTab === 'insights' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">AI Insights</h3>
              <div className="text-center py-12 text-zinc-400">
                <Brain className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
                <p>AI-powered insights coming soon...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}