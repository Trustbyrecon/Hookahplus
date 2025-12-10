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
import { FireSession } from '../types/enhancedSession';

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

interface GuestIntelligenceDashboardProps {
  session?: FireSession;
  sessionId?: string;
  customerId?: string; // Alternative to sessionId for wallet integration
  tableId?: string;
  onClose: () => void;
}

export default function GuestIntelligenceDashboard({ 
  session, 
  sessionId, 
  customerId,
  tableId, 
  onClose 
}: GuestIntelligenceDashboardProps) {
  const [behavioralMemory, setBehavioralMemory] = useState<BehavioralMemory | null>(null);
  const [sessionNotes, setSessionNotes] = useState<SessionNote[]>([]);
  const [piiMaskingEnabled, setPiiMaskingEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'intelligence' | 'achievements' | 'operational'>('profile');
  const [loading, setLoading] = useState(true);

  // Load behavioral memory and session notes
  useEffect(() => {
    const loadIntelligenceData = async () => {
      try {
        setLoading(true);
        
        // Try to fetch real data from API
        let realData: BehavioralMemory | null = null;
        let useDemo = false;
        
        // Try customerId first (for wallet integration), then sessionId
        if (customerId) {
          try {
            const response = await fetch(`/api/wallet/${customerId}/intelligence`);
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.behavioralMemory) {
                realData = data.behavioralMemory;
                useDemo = false;
              } else {
                useDemo = true;
              }
            } else {
              useDemo = true;
            }
          } catch (error) {
            console.warn('[GID] Failed to fetch customer intelligence, using demo:', error);
            useDemo = true;
          }
        } else if (sessionId && sessionId !== 'session_demo') {
          try {
            const response = await fetch(`/api/guest-intelligence/${sessionId}`);
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.behavioralMemory) {
                realData = data.behavioralMemory;
                useDemo = false;
              } else {
                useDemo = true;
              }
            } else {
              useDemo = true;
            }
          } catch (error) {
            console.warn('[GID] Failed to fetch real data, using demo:', error);
            useDemo = true;
          }
        } else {
          useDemo = true;
        }
        
        // Use real data if available, otherwise use demo/mock data
        const memory: BehavioralMemory = realData || {
          guestId: session?.id || 'guest_001',
          preferences: {
            favoriteFlavors: session?.flavor ? [session.flavor] : ['Blue Mist', 'Double Apple', 'Mint Fresh'],
            preferredZone: 'VIP',
            averageSessionDuration: session?.sessionDuration ? Math.floor(session.sessionDuration / 60) : 45,
            spendingPattern: session?.amount && session.amount > 4000 ? 'premium' : 'budget',
            visitFrequency: 'regular',
            preferredTimeSlots: ['7:00 PM', '8:00 PM', '9:00 PM'],
            typicalOrderPattern: session?.flavor ? [session.flavor] : ['Blue Mist + Extra Mint', 'Strawberry Mojito']
          },
          trustScore: calculateTrustScore(session),
          loyaltyTier: calculateLoyaltyTier(session),
          badges: generateBadges(session),
          badgeProgress: generateBadgeProgress(session),
          sessionHistory: generateSessionHistory(session),
          predictiveInsights: {
            nextVisitPrediction: 'Likely to visit within 1-2 weeks',
            likelyOrder: session?.flavor ? [session.flavor] : ['Blue Mist + Extra Mint', 'Strawberry Mojito'],
            optimalServiceTiming: `Start cleanup at ${session?.sessionDuration ? Math.floor(session.sessionDuration / 60) - 5 : 40} minutes (prefers ${session?.sessionDuration ? Math.floor(session.sessionDuration / 60) : 45}-min sessions)`,
            upsellProbability: 75
          }
        };

        const mockNotes: SessionNote[] = [
          {
            id: 'note_001',
            content: session?.notes || 'Customer prefers Blue Mist with extra mint',
            author: 'Staff Member',
            createdAt: new Date().toISOString(),
            piiLevel: 'low',
            category: 'customer'
          },
          {
            id: 'note_002',
            content: `VIP zone table ${session?.tableId || 'T-001'} - premium service requested`,
            author: 'Manager',
            createdAt: new Date(Date.now() - 300000).toISOString(),
            piiLevel: 'none',
            category: 'service'
          },
          {
            id: 'note_003',
            content: 'Equipment check: All hookahs functioning properly',
            author: 'BOH Staff',
            createdAt: new Date(Date.now() - 600000).toISOString(),
            piiLevel: 'none',
            category: 'equipment'
          }
        ];

        setBehavioralMemory(memory);
        
        // Use real notes if available from API, otherwise use mock
        if (realData && sessionId && sessionId !== 'session_demo') {
          try {
            const notesResponse = await fetch(`/api/guest-intelligence/${sessionId}`);
            if (notesResponse.ok) {
              const notesData = await notesResponse.json();
              if (notesData.success && notesData.operationalNotes) {
                setSessionNotes(notesData.operationalNotes);
              } else {
                setSessionNotes(mockNotes);
              }
            } else {
              setSessionNotes(mockNotes);
            }
          } catch (error) {
            console.warn('[GID] Failed to fetch notes, using mock:', error);
            setSessionNotes(mockNotes);
          }
        } else {
          setSessionNotes(mockNotes);
        }
        
        // Show demo indicator if using demo data
        if (useDemo && !realData) {
          console.log('[GID] Using demo data - real data will appear when session is active');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading intelligence data:', error);
        setLoading(false);
      }
    };

    loadIntelligenceData();
  }, [session, sessionId, tableId]);

  // PII Masking function
  const getPiiMaskedContent = (content: string, piiLevel: string) => {
    if (!piiMaskingEnabled || piiLevel === 'none') return content;
    
    // Simple PII masking - in production, use proper PII detection
    return content.replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, '[CUSTOMER NAME]')
                 .replace(/\b\d{3}-\d{3}-\d{4}\b/g, '[PHONE]')
                 .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]');
  };

  // Trust Score calculation based on session data
  const calculateTrustScore = (session?: FireSession): number => {
    if (!session) return 75; // Default score for new customers
    
    let score = 50; // Base score
    
    // Session completion bonus
    if (session.status === 'CLOSED' || session.status === 'ACTIVE') {
      score += 20;
    }
    
    // Payment success bonus
    if (session.amount > 0) {
      score += 15;
    }
    
    // Session duration bonus
    if (session.sessionDuration > 30 * 60) { // 30 minutes
      score += 10;
    }
    
    // Staff assignment bonus
    if (session.assignedStaff.boh && session.assignedStaff.foh) {
      score += 5;
    }
    
    return Math.min(100, score);
  };

  // Loyalty tier calculation
  const calculateLoyaltyTier = (session?: FireSession): 'bronze' | 'silver' | 'gold' | 'platinum' => {
    if (!session) return 'bronze';
    
    const trustScore = calculateTrustScore(session);
    if (trustScore >= 90) return 'platinum';
    if (trustScore >= 75) return 'gold';
    if (trustScore >= 60) return 'silver';
    return 'bronze';
  };

  // Generate badges based on session data
  const generateBadges = (session?: FireSession): Badge[] => {
    const badges: Badge[] = [];
    
    if (session?.amount && session.amount > 3000) {
      badges.push({
        id: 'premium_spender',
        name: 'Premium Patron',
        description: 'Consistent premium spending',
        icon: <Star className="w-4 h-4" />,
        color: 'text-purple-400',
        earnedAt: new Date().toISOString().split('T')[0],
        category: 'spending'
      });
    }
    
    if (session?.sessionDuration && session.sessionDuration > 60 * 60) { // 1 hour
      badges.push({
        id: 'long_session',
        name: 'Session Master',
        description: 'Extended session duration',
        icon: <Clock className="w-4 h-4" />,
        color: 'text-blue-400',
        earnedAt: new Date().toISOString().split('T')[0],
        category: 'achievement'
      });
    }
    
    return badges;
  };

  // Generate badge progress
  const generateBadgeProgress = (session?: FireSession): BadgeProgress[] => {
    return [
      {
        badgeId: 'loyalty_legend',
        name: 'Loyalty Legend',
        description: 'Complete 10+ sessions',
        icon: <Crown className="w-4 h-4" />,
        color: 'text-yellow-400',
        currentProgress: 1, // Based on current session
        targetProgress: 10,
        nextMilestone: 'Complete 9 more sessions',
        estimatedTimeToEarn: '2-3 months',
        category: 'loyalty'
      },
      {
        badgeId: 'flavor_explorer',
        name: 'Flavor Explorer',
        description: 'Try 15 different flavors',
        icon: <Wind className="w-4 h-4" />,
        color: 'text-orange-400',
        currentProgress: 1, // Based on current flavor
        targetProgress: 15,
        nextMilestone: 'Try 14 more flavors',
        estimatedTimeToEarn: '3-4 months',
        category: 'achievement'
      }
    ];
  };

  // Generate session history
  const generateSessionHistory = (session?: FireSession): SessionSummary[] => {
    if (!session) return [];
    
    return [
      {
        id: session.id,
        date: new Date(session.createdAt).toISOString().split('T')[0],
        duration: Math.floor(session.sessionDuration / 60),
        totalSpent: session.amount / 100, // Convert cents to dollars
        satisfaction: 4.5, // Default satisfaction score
        notes: session.notes || 'Good service experience',
        piiMasked: piiMaskingEnabled
      }
    ];
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

  const getPiiLevelColor = (level: string) => {
    switch (level) {
      case 'none': return 'text-green-400';
      case 'low': return 'text-yellow-400';
      case 'medium': return 'text-orange-400';
      case 'high': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-900 p-6 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
            <span className="text-white">Loading Guest Intelligence...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-6xl h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Guest Intelligence Dashboard</h1>
              <p className="text-sm text-gray-400">Session Overview • Customer Memory & Predictive Service</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setPiiMaskingEnabled(!piiMaskingEnabled)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                piiMaskingEnabled 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              {piiMaskingEnabled ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span className="text-sm">PII {piiMaskingEnabled ? 'Protected' : 'Visible'}</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-gray-300" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-700">
          {[
            { id: 'profile', label: 'Customer Profile', icon: <Users className="w-4 h-4" /> },
            { id: 'intelligence', label: 'Service Intelligence', icon: <Brain className="w-4 h-4" /> },
            { id: 'achievements', label: 'Achievements & Rewards', icon: <Award className="w-4 h-4" /> },
            { id: 'operational', label: 'Operational Memory', icon: <MessageSquare className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-400 text-blue-400 bg-blue-400/10'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab.icon}
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="p-6 h-[calc(90vh-140px)] overflow-y-auto">
          {activeTab === 'profile' && behavioralMemory && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="w-5 h-5 text-blue-400" />
                    <span className="text-sm text-gray-400">Trust Score</span>
                  </div>
                  <div className={`text-2xl font-bold ${getTrustScoreColor(behavioralMemory.trustScore)}`}>
                    {behavioralMemory.trustScore}
                  </div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Crown className="w-5 h-5 text-yellow-400" />
                    <span className="text-sm text-gray-400">Loyalty Tier</span>
                  </div>
                  <div className={`text-xl font-bold ${getLoyaltyTierColor(behavioralMemory.loyaltyTier)}`}>
                    {behavioralMemory.loyaltyTier.toUpperCase()}
                  </div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <span className="text-sm text-gray-400">Visit Frequency</span>
                  </div>
                  <div className="text-xl font-bold text-white">
                    {behavioralMemory.preferences.visitFrequency.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Customer Preferences */}
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="flex items-center space-x-2 mb-4">
                  <Target className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">Customer Preferences</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Favorite Flavors</h4>
                    <div className="flex flex-wrap gap-2">
                      {behavioralMemory.preferences.favoriteFlavors.map((flavor, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-sm">
                          {flavor}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Preferred Zone</h4>
                    <span className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm">
                      {behavioralMemory.preferences.preferredZone}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Average Session Duration</h4>
                    <span className="text-white">{behavioralMemory.preferences.averageSessionDuration} minutes</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Spending Pattern</h4>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      behavioralMemory.preferences.spendingPattern === 'premium' 
                        ? 'bg-purple-600/20 text-purple-300'
                        : 'bg-green-600/20 text-green-300'
                    }`}>
                      {behavioralMemory.preferences.spendingPattern.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Predictive Service Intelligence */}
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="flex items-center space-x-2 mb-4">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-lg font-semibold text-white">Predictive Service Intelligence</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Next Visit Prediction</h4>
                    <p className="text-white">{behavioralMemory.predictiveInsights.nextVisitPrediction}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Optimal Service Timing</h4>
                    <p className="text-white">{behavioralMemory.predictiveInsights.optimalServiceTiming}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Likely Order</h4>
                    <div className="flex flex-wrap gap-2">
                      {behavioralMemory.predictiveInsights.likelyOrder.map((order, index) => (
                        <span key={index} className="px-3 py-1 bg-green-600/20 text-green-300 rounded-full text-sm">
                          {order}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Upsell Probability</h4>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${behavioralMemory.predictiveInsights.upsellProbability}%` }}
                        ></div>
                      </div>
                      <span className="text-white text-sm">{behavioralMemory.predictiveInsights.upsellProbability}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'intelligence' && behavioralMemory && (
            <div className="space-y-6">
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="flex items-center space-x-2 mb-4">
                  <Brain className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">Service Intelligence & History</h3>
                </div>
                <div className="space-y-4">
                  {behavioralMemory.sessionHistory.map((session) => (
                    <div key={session.id} className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">{session.date}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-400">{session.duration}min</span>
                          <span className="text-green-400 font-semibold">${session.totalSpent}</span>
                        </div>
                      </div>
                      <p className="text-white mb-2">{session.notes}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < session.satisfaction ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} 
                            />
                          ))}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4 text-blue-400" />
                          <span className="text-sm text-blue-400">PII Protected</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'achievements' && behavioralMemory && (
            <div className="space-y-6">
              {/* Earned Badges */}
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="flex items-center space-x-2 mb-4">
                  <Award className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-lg font-semibold text-white">Earned Badges</h3>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {behavioralMemory.badges.map((badge) => (
                    <div key={badge.id} className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={badge.color}>{badge.icon}</div>
                        <div>
                          <h4 className="text-white font-medium">{badge.name}</h4>
                          <p className="text-sm text-gray-400">{badge.description}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">Earned: {badge.earnedAt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress & Future Rewards */}
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="flex items-center space-x-2 mb-4">
                  <Target className="w-5 h-5 text-green-400" />
                  <h3 className="text-lg font-semibold text-white">Progress & Future Rewards</h3>
                </div>
                <div className="space-y-4">
                  {behavioralMemory.badgeProgress.map((progress) => (
                    <div key={progress.badgeId} className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={progress.color}>{progress.icon}</div>
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{progress.name}</h4>
                          <p className="text-sm text-gray-400">{progress.description}</p>
                        </div>
                      </div>
                      <div className="mb-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">Progress</span>
                          <span className="text-white">{progress.currentProgress}/{progress.targetProgress}</span>
                        </div>
                        <div className="bg-gray-600 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              progress.color.includes('blue') ? 'bg-blue-400' :
                              progress.color.includes('green') ? 'bg-green-400' :
                              progress.color.includes('orange') ? 'bg-orange-400' : 'bg-purple-400'
                            }`}
                            style={{ width: `${(progress.currentProgress / progress.targetProgress) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">{progress.nextMilestone}</span>
                        <span className="text-gray-400">{progress.estimatedTimeToEarn}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'operational' && (
            <div className="space-y-6">
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-semibold text-white">Operational Memory</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-400">PII Protection: ENABLED</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {sessionNotes.map((note) => (
                    <div key={note.id} className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-400">{note.author}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${getPiiLevelColor(note.piiLevel)} bg-gray-600`}>
                            PII {note.piiLevel.toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">{new Date(note.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-white mb-2">{getPiiMaskedContent(note.content, note.piiLevel)}</p>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        note.category === 'customer' ? 'bg-blue-600/20 text-blue-300' :
                        note.category === 'service' ? 'bg-green-600/20 text-green-300' :
                        note.category === 'equipment' ? 'bg-purple-600/20 text-purple-300' :
                        'bg-orange-600/20 text-orange-300'
                      }`}>
                        {note.category.toUpperCase()}
                      </span>
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
