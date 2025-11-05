'use client';

import React, { useState, useEffect } from 'react';
import { GuestProfile, FeatureFlags, ReferralCreateResponse } from '@guest-types';
import { QrCode, Share2, Copy, Users, Gift, ExternalLink, Trophy, Target, TrendingUp, Zap } from 'lucide-react';

interface ReferralQRProps {
  guestProfile: GuestProfile;
  loungeId: string;
  flags: FeatureFlags;
  onReferralCreate: () => void;
}

interface ReferralProgress {
  totalReferrals: number;
  totalClicks: number;
  totalJoins: number;
  totalRewards: number;
  conversionRate: number;
  referrals: Array<{
    code: string;
    clicks: number;
    joins: number;
    rewards: number;
    createdAt: string;
    isActive: boolean;
  }>;
}

interface ReferralBadge {
  id: string;
  name: string;
  description: string;
  goal: number;
  current: number;
  unlocked: boolean;
  icon: React.ReactNode;
  color: string;
}

export default function ReferralQR({ guestProfile, loungeId, flags, onReferralCreate }: ReferralQRProps) {
  const [referralData, setReferralData] = useState<ReferralCreateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState<ReferralProgress | null>(null);
  const [badges, setBadges] = useState<ReferralBadge[]>([]);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);

  useEffect(() => {
    // Load referral progress and badges
    if (referralData) {
      loadReferralProgress();
    }
  }, [referralData, guestProfile.guestId]);

  const loadReferralProgress = async () => {
    try {
      setIsLoadingProgress(true);
      const response = await fetch(`/api/guest/referral/create?guestId=${guestProfile.guestId}&loungeId=${loungeId}`);
      
      if (response.ok) {
        const data = await response.json();
        setProgress(data.analytics);
        
        // Calculate badges based on progress
        const calculatedBadges: ReferralBadge[] = [
          {
            id: 'sharer',
            name: 'Social Butterfly',
            description: 'Share your referral link',
            goal: 1,
            current: data.analytics.totalReferrals,
            unlocked: data.analytics.totalReferrals >= 1,
            icon: <Share2 className="w-4 h-4" />,
            color: 'from-purple-500 to-pink-500'
          },
          {
            id: 'connector',
            name: 'Community Connector',
            description: 'Refer 3+ friends',
            goal: 3,
            current: data.analytics.totalJoins,
            unlocked: data.analytics.totalJoins >= 3,
            icon: <Users className="w-4 h-4" />,
            color: 'from-blue-500 to-cyan-500'
          },
          {
            id: 'influencer',
            name: 'Hookah+ Influencer',
            description: 'Refer 10+ friends',
            goal: 10,
            current: data.analytics.totalJoins,
            unlocked: data.analytics.totalJoins >= 10,
            icon: <Trophy className="w-4 h-4" />,
            color: 'from-yellow-500 to-orange-500'
          },
          {
            id: 'evangelist',
            name: 'Brand Evangelist',
            description: 'Refer 25+ friends',
            goal: 25,
            current: data.analytics.totalJoins,
            unlocked: data.analytics.totalJoins >= 25,
            icon: <Zap className="w-4 h-4" />,
            color: 'from-green-500 to-teal-500'
          }
        ];
        
        setBadges(calculatedBadges);
      }
    } catch (err) {
      console.error('Failed to load referral progress:', err);
    } finally {
      setIsLoadingProgress(false);
    }
  };

  const createReferral = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/guest/referral/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loungeId,
          inviterGuestId: guestProfile.guestId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create referral');
      }

      const data = await response.json();
      setReferralData(data);
      onReferralCreate();

      // Log referral creation event (client-side logging only - server-side logging happens in API)
      if (flags.ghostlog.lite) {
        const eventPayload = {
          code: data.code,
          loungeId,
          inviterGuestId: guestProfile.guestId,
          url: data.url,
          timestamp: new Date().toISOString()
        };

        // Client-side logging only - actual ghostlog entry is created server-side in /api/guest/referral/create
        console.log('Referral created:', eventPayload);
      }
      
      // Load progress after creating referral
      loadReferralProgress();

    } catch (err) {
      console.error('Create referral error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create referral');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const shareReferral = async () => {
    if (!referralData) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me at Hookah+',
          text: 'Check out this amazing hookah lounge!',
          url: referralData.url
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      // Fallback to copy
      copyToClipboard(referralData.url);
    }
  };

  if (error) {
    return (
      <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-red-500/20 rounded-lg">
            <QrCode className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Referral Error</h2>
            <p className="text-sm text-red-400">{error}</p>
          </div>
        </div>
        <button
          onClick={createReferral}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!referralData) {
    return (
      <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <QrCode className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Invite Friends</h2>
            <p className="text-sm text-zinc-400">Earn rewards for bringing friends</p>
          </div>
        </div>

        <div className="text-center space-y-4">
          <div className="p-4 bg-zinc-700/50 rounded-lg">
            <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-white mb-2">Share the Experience</h3>
            <p className="text-sm text-zinc-400 mb-4">
              Create a referral link and earn 50 points for each friend who joins!
            </p>
          </div>

          <button
            onClick={createReferral}
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating...</span>
              </>
            ) : (
              <>
                <QrCode className="w-5 h-5" />
                <span>Create Referral Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-purple-500/20 rounded-lg">
          <QrCode className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Your Referral Link</h2>
          <p className="text-sm text-zinc-400">Share and earn rewards</p>
        </div>
      </div>

      {/* QR Code */}
      <div className="text-center mb-6">
        <div className="inline-block p-4 bg-white rounded-lg">
          {referralData.qrCode ? (
            <img
              src={referralData.qrCode}
              alt="Referral QR Code"
              className="w-32 h-32"
            />
          ) : (
            <div className="w-32 h-32 bg-gray-200 rounded flex items-center justify-center">
              <QrCode className="w-16 h-16 text-gray-400" />
            </div>
          )}
        </div>
        <p className="text-xs text-zinc-400 mt-2">Scan to join this lounge</p>
      </div>

      {/* Referral Code */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-white mb-2">
          Referral Code
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={referralData.code}
            readOnly
            className="flex-1 px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white font-mono text-sm"
          />
          <button
            onClick={() => copyToClipboard(referralData.code)}
            className="px-3 py-2 bg-zinc-600 text-white rounded-lg hover:bg-zinc-700 transition-colors"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
        {copied && (
          <p className="text-xs text-green-400 mt-1">Copied to clipboard!</p>
        )}
      </div>

      {/* Referral URL */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-white mb-2">
          Referral Link
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={referralData.url}
            readOnly
            className="flex-1 px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white text-sm truncate"
          />
          <button
            onClick={() => copyToClipboard(referralData.url)}
            className="px-3 py-2 bg-zinc-600 text-white rounded-lg hover:bg-zinc-700 transition-colors"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Share Actions */}
      <div className="space-y-2">
        <button
          onClick={shareReferral}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Share2 className="w-4 h-4" />
          <span>Share with Friends</span>
        </button>
        
        <button
          onClick={() => window.open(referralData.url, '_blank')}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-600 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Open Link</span>
        </button>
      </div>

      {/* Progress & Future Rewards */}
      {progress && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <Target className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Progress & Future Rewards</h3>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-3 bg-zinc-700/50 rounded-lg">
              <div className="text-lg font-bold text-white">{progress.totalClicks}</div>
              <div className="text-xs text-zinc-400">Clicks</div>
            </div>
            <div className="text-center p-3 bg-zinc-700/50 rounded-lg">
              <div className="text-lg font-bold text-teal-400">{progress.totalJoins}</div>
              <div className="text-xs text-zinc-400">Joined</div>
            </div>
            <div className="text-center p-3 bg-zinc-700/50 rounded-lg">
              <div className="text-lg font-bold text-yellow-400">{progress.totalRewards}</div>
              <div className="text-xs text-zinc-400">Points</div>
            </div>
          </div>

          {/* Referral Progress Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-300">Referral Progress</span>
              <span className="text-teal-400 font-medium">
                {progress.totalJoins} friends joined
              </span>
            </div>
            <div className="w-full bg-zinc-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (progress.totalJoins / 10) * 100)}%` }}
              />
            </div>
            <div className="text-xs text-zinc-400">
              {progress.totalJoins < 10 
                ? `${10 - progress.totalJoins} more referrals to unlock "Hookah+ Influencer" badge`
                : '🎉 You\'ve unlocked the "Hookah+ Influencer" badge!'}
            </div>
          </div>

          {/* Badges for Sharers */}
          {badges.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-400" />
                Your Badges
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      badge.unlocked
                        ? `bg-gradient-to-br ${badge.color}/20 ${badge.id === 'sharer' ? 'border-purple-500/50' : badge.id === 'connector' ? 'border-blue-500/50' : badge.id === 'influencer' ? 'border-yellow-500/50' : 'border-green-500/50'}`
                        : 'bg-zinc-700/50 border-zinc-600 opacity-60'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <div className={`${badge.unlocked ? 'text-white' : 'text-zinc-500'}`}>
                        {badge.icon}
                      </div>
                      <span className={`text-xs font-medium ${badge.unlocked ? 'text-white' : 'text-zinc-500'}`}>
                        {badge.name}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-400 mb-2">{badge.description}</div>
                    {!badge.unlocked && (
                      <div className="mt-2">
                        <div className="w-full bg-zinc-600 rounded-full h-1.5">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full"
                            style={{ width: `${Math.min(100, (badge.current / badge.goal) * 100)}%` }}
                          />
                        </div>
                        <div className="text-xs text-zinc-500 mt-1">
                          {badge.current}/{badge.goal}
                        </div>
                      </div>
                    )}
                    {badge.unlocked && (
                      <div className="flex items-center space-x-1 mt-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-xs text-green-400">Unlocked!</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rewards Info */}
      <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Gift className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium text-green-400">Earn Rewards</span>
        </div>
        <p className="text-xs text-zinc-400">
          Get 50 points for each friend who joins using your link. 
          They'll also get a welcome bonus!
        </p>
        {progress && progress.totalRewards > 0 && (
          <div className="mt-2 pt-2 border-t border-green-500/20">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400">Total Points Earned:</span>
              <span className="text-sm font-bold text-yellow-400">{progress.totalRewards} pts</span>
            </div>
          </div>
        )}
      </div>

      {/* Trust Lock Indicator */}
      {flags.ghostlog.lite && (
        <div className="mt-4 p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
            <span className="text-xs text-green-400">
              Referral tracking secured with Trust Lock
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
