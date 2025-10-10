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
  };
  trustScore: number;
  loyaltyTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  badges: Badge[];
  sessionHistory: SessionSummary[];
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  earnedAt: string;
  category: 'loyalty' | 'spending' | 'social' | 'special' | 'achievement';
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

interface EnhancedStaffPanelProps {
  sessionId?: string;
  tableId?: string;
  onClose: () => void;
}

export default function EnhancedStaffPanel({ sessionId, tableId, onClose }: EnhancedStaffPanelProps) {
  const [behavioralMemory, setBehavioralMemory] = useState<BehavioralMemory | null>(null);
  const [sessionNotes, setSessionNotes] = useState<SessionNote[]>([]);
  const [piiMaskingEnabled, setPiiMaskingEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'memory' | 'notes' | 'badges'>('overview');
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
        visitFrequency: 'regular'
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
      ]
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
              <h2 className="text-xl font-bold text-white">Enhanced Staff Panel</h2>
              <p className="text-sm text-zinc-400">
                {tableId ? `Table ${tableId}` : 'Session Overview'} • Behavioral Memory & PII Protection
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
            { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
            { id: 'memory', label: 'Behavioral Memory', icon: <Brain className="w-4 h-4" /> },
            { id: 'badges', label: 'Badges & Achievements', icon: <Award className="w-4 h-4" /> },
            { id: 'notes', label: 'Session Notes', icon: <MessageSquare className="w-4 h-4" /> }
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
          {activeTab === 'overview' && behavioralMemory && (
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
                </div>
              </div>
            </div>
          )}

          {activeTab === 'memory' && behavioralMemory && (
            <div className="space-y-6">
              <div className="bg-zinc-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-blue-400" />
                  <span>Session History</span>
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

          {activeTab === 'badges' && behavioralMemory && (
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
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-6">
              <div className="bg-zinc-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5 text-blue-400" />
                    <span>Session Notes</span>
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
