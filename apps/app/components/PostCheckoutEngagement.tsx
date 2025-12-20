'use client';

import React, { useState } from 'react';
import {
  Gift,
  Clock,
  Instagram,
  MessageCircle,
  ExternalLink,
  Star,
  TrendingUp,
  Users,
  Sparkles,
  ArrowRight,
  X,
  Brain
} from 'lucide-react';

interface PostCheckoutEngagementProps {
  sessionId: string;
  pointsEarned: number;
  totalPoints?: number;
  loungeId: string;
  loungeName?: string;
  loungeInstagram?: string;
  operatorInstagram?: string;
  hookahPlusInstagram?: string;
  onExtendSession?: () => void;
  onContinue?: () => void;
  onClose?: () => void;
  onShowIntelligence?: () => void;
}

export function PostCheckoutEngagement({
  sessionId,
  pointsEarned,
  totalPoints = 0,
  loungeId,
  loungeName,
  loungeInstagram,
  operatorInstagram,
  hookahPlusInstagram = 'hookahplus',
  onExtendSession,
  onContinue,
  onClose,
  onShowIntelligence
}: PostCheckoutEngagementProps) {
  const [activeTab, setActiveTab] = useState<'rewards' | 'extend' | 'social'>('rewards');
  const [showIntelligence, setShowIntelligence] = useState(false);

  const handleInstagramFollow = (username: string) => {
    if (username) {
      window.open(`https://instagram.com/${username.replace('@', '')}`, '_blank');
    }
  };

  const handleInstagramDM = (username: string) => {
    if (username) {
      window.open(`https://instagram.com/direct/inbox/?username=${username.replace('@', '')}`, '_blank');
    }
  };

  const calculateNextTier = () => {
    const tiers = [
      { name: 'Bronze', points: 0, reward: '5% off next visit' },
      { name: 'Silver', points: 500, reward: '10% off + free upgrade' },
      { name: 'Gold', points: 1500, reward: '15% off + priority booking' },
      { name: 'Platinum', points: 3000, reward: '20% off + VIP access' },
      { name: 'Diamond', points: 5000, reward: '25% off + exclusive events' }
    ];

    const currentTier = tiers.findIndex(tier => totalPoints < tier.points);
    const nextTier = currentTier === -1 ? tiers[tiers.length - 1] : tiers[currentTier];
    const progress = currentTier === 0 ? (totalPoints / nextTier.points) * 100 : 
                     currentTier === -1 ? 100 : 
                     ((totalPoints - tiers[currentTier - 1].points) / (nextTier.points - tiers[currentTier - 1].points)) * 100;

    return { current: tiers[Math.max(0, currentTier - 1)], next: nextTier, progress: Math.min(100, progress) };
  };

  const tierInfo = calculateNextTier();

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-gradient-to-r from-teal-900/20 to-cyan-900/20">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-teal-400" />
              Welcome Back!
            </h2>
            <p className="text-zinc-400 mt-1">Your session is ready. Explore your rewards and connect with us!</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800 bg-zinc-800/50">
          <button
            onClick={() => setActiveTab('rewards')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'rewards'
                ? 'text-teal-400 border-b-2 border-teal-400 bg-zinc-900/50'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Gift className="w-4 h-4" />
              Your Rewards
            </div>
          </button>
          <button
            onClick={() => setActiveTab('extend')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'extend'
                ? 'text-teal-400 border-b-2 border-teal-400 bg-zinc-900/50'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-4 h-4" />
              Extend Session
            </div>
          </button>
          <button
            onClick={() => setActiveTab('social')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'social'
                ? 'text-teal-400 border-b-2 border-teal-400 bg-zinc-900/50'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Instagram className="w-4 h-4" />
              Connect
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'rewards' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-teal-900/30 to-cyan-900/30 border border-teal-500/30 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Points Earned This Session</h3>
                  <div className="text-3xl font-bold text-teal-400">+{pointsEarned}</div>
                </div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span className="text-lg font-semibold">{totalPoints + pointsEarned} Total Points</span>
                </div>
              </div>

              <div className="bg-zinc-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Loyalty Tier</h3>
                  <span className="px-3 py-1 bg-teal-600/20 text-teal-400 rounded-full text-sm font-medium">
                    {tierInfo.current.name}
                  </span>
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-sm text-zinc-400 mb-1">
                    <span>Progress to {tierInfo.next.name}</span>
                    <span>{Math.round(tierInfo.progress)}%</span>
                  </div>
                  <div className="w-full bg-zinc-700 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-teal-500 to-cyan-500 h-full transition-all duration-500"
                      style={{ width: `${tierInfo.progress}%` }}
                    />
                  </div>
                </div>
                <p className="text-sm text-zinc-400 mt-2">
                  {tierInfo.next.points - (totalPoints + pointsEarned)} points until {tierInfo.next.name}
                </p>
                <div className="mt-4 p-3 bg-zinc-900/50 rounded-lg">
                  <p className="text-sm text-zinc-300">
                    <span className="font-semibold text-teal-400">{tierInfo.next.name} Benefits:</span> {tierInfo.next.reward}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-zinc-800 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <h4 className="font-semibold text-white">Recent Activity</h4>
                  </div>
                  <p className="text-sm text-zinc-400">Session completed • {pointsEarned} points earned</p>
                </div>
                <div className="bg-zinc-800 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    <h4 className="font-semibold text-white">Referral Bonus</h4>
                  </div>
                  <p className="text-sm text-zinc-400">Refer friends and earn 100 points per referral</p>
                </div>
              </div>

              {onShowIntelligence && (
                <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Brain className="w-6 h-6 text-blue-400" />
                      <div>
                        <h4 className="font-semibold text-white">Guest Intelligence Dashboard</h4>
                        <p className="text-sm text-zinc-400">View your session insights and preferences</p>
                      </div>
                    </div>
                    <button
                      onClick={onShowIntelligence}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      View Dashboard
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'extend' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-8 h-8 text-purple-400" />
                  <div>
                    <h3 className="text-xl font-bold text-white">Extend Your Session</h3>
                    <p className="text-zinc-300">Add more time to your current hookah session</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { duration: '30 min', price: 1500, popular: false },
                  { duration: '1 hour', price: 2500, popular: true },
                  { duration: '2 hours', price: 4500, popular: false }
                ].map((option) => (
                  <div
                    key={option.duration}
                    className={`bg-zinc-800 rounded-lg p-6 border-2 transition-all ${
                      option.popular
                        ? 'border-teal-500 bg-teal-900/10'
                        : 'border-zinc-700 hover:border-zinc-600'
                    }`}
                  >
                    {option.popular && (
                      <div className="text-xs font-semibold text-teal-400 mb-2">MOST POPULAR</div>
                    )}
                    <div className="text-2xl font-bold text-white mb-1">{option.duration}</div>
                    <div className="text-3xl font-bold text-teal-400 mb-4">
                      ${(option.price / 100).toFixed(2)}
                    </div>
                    <button
                      onClick={onExtendSession}
                      className="w-full px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Extend Now
                    </button>
                  </div>
                ))}
              </div>

              <div className="bg-zinc-800 rounded-lg p-4">
                <p className="text-sm text-zinc-400">
                  <span className="font-semibold text-white">Note:</span> Session extensions are added immediately
                  to your current session. Payment will be processed securely.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-pink-900/30 to-purple-900/30 border border-pink-500/30 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Instagram className="w-8 h-8 text-pink-400" />
                  <div>
                    <h3 className="text-xl font-bold text-white">Connect With Us</h3>
                    <p className="text-zinc-300">Follow us on Instagram and stay connected!</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {loungeInstagram && (
                  <div className="bg-zinc-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-white">{loungeName || 'Lounge'}</h4>
                        <p className="text-sm text-zinc-400">@{loungeInstagram.replace('@', '')}</p>
                      </div>
                      <Instagram className="w-8 h-8 text-pink-400" />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleInstagramFollow(loungeInstagram)}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <Instagram className="w-4 h-4" />
                        Follow
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleInstagramDM(loungeInstagram)}
                        className="flex-1 px-4 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Message
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {operatorInstagram && operatorInstagram !== loungeInstagram && (
                  <div className="bg-zinc-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-white">Operator</h4>
                        <p className="text-sm text-zinc-400">@{operatorInstagram.replace('@', '')}</p>
                      </div>
                      <Instagram className="w-8 h-8 text-pink-400" />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleInstagramFollow(operatorInstagram)}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <Instagram className="w-4 h-4" />
                        Follow
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleInstagramDM(operatorInstagram)}
                        className="flex-1 px-4 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Message
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="bg-zinc-800 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-white">Hookah+</h4>
                      <p className="text-sm text-zinc-400">@hookahplus</p>
                    </div>
                    <Instagram className="w-8 h-8 text-pink-400" />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleInstagramFollow(hookahPlusInstagram)}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Instagram className="w-4 h-4" />
                      Follow
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleInstagramDM(hookahPlusInstagram)}
                      className="flex-1 px-4 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Message
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-800/50 rounded-lg p-4">
                <p className="text-sm text-zinc-400 text-center">
                  Stay connected for exclusive offers, events, and updates!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-zinc-800 bg-zinc-800/50">
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors text-sm"
          >
            Skip for now
          </button>
          <button
            onClick={onContinue}
            className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            Continue to Session
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

