'use client';

import React, { useState, useEffect } from 'react';
import { GuestProfile, FeatureFlags, RewardsResponse, BadgeDefinition } from '../../../types/guest';
import { createGhostLogEntry } from '../../libs/ghostlog/hash';
import { Trophy, Star, Gift, Target, Crown, Zap } from 'lucide-react';

interface RewardsBadgeStripProps {
  guestProfile: GuestProfile;
  flags: FeatureFlags;
  onBadgeUpdate: () => void;
}

export default function RewardsBadgeStrip({ guestProfile, flags, onBadgeUpdate }: RewardsBadgeStripProps) {
  const [rewards, setRewards] = useState<RewardsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRewards();
  }, [guestProfile.guestId]);

  const loadRewards = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/guest/rewards?guestId=${guestProfile.guestId}&loungeId=default`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load rewards');
      }

      const data = await response.json();
      setRewards(data);
      onBadgeUpdate();

      // Log rewards view event
      if (flags.ghostlog.lite) {
        const eventPayload = {
          guestId: guestProfile.guestId,
          points: data.points,
          badges: data.badges.map((b: BadgeDefinition) => b.badgeId),
          level: data.level,
          timestamp: new Date().toISOString()
        };

        const ghostLogEntry = createGhostLogEntry('rewards.viewed', eventPayload);
        console.log('Rewards view logged:', ghostLogEntry);
      }

    } catch (err) {
      console.error('Load rewards error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load rewards');
    } finally {
      setIsLoading(false);
    }
  };

  const getBadgeIcon = (badgeId: string) => {
    switch (badgeId) {
      case 'Regular': return <Trophy className="w-4 h-4" />;
      case 'Explorer': return <Star className="w-4 h-4" />;
      case 'MixMaster': return <Gift className="w-4 h-4" />;
      case 'Loyalist': return <Crown className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getBadgeColor = (badgeId: string) => {
    switch (badgeId) {
      case 'Regular': return 'from-yellow-500 to-orange-500';
      case 'Explorer': return 'from-blue-500 to-cyan-500';
      case 'MixMaster': return 'from-purple-500 to-pink-500';
      case 'Loyalist': return 'from-amber-500 to-yellow-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'bronze': return 'text-amber-600';
      case 'silver': return 'text-gray-400';
      case 'gold': return 'text-yellow-500';
      case 'platinum': return 'text-cyan-400';
      default: return 'text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-yellow-500/20 rounded-lg">
            <Trophy className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Rewards</h2>
            <p className="text-sm text-zinc-400">Loading...</p>
          </div>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-zinc-700 rounded w-3/4"></div>
          <div className="h-4 bg-zinc-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-red-500/20 rounded-lg">
            <Trophy className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Rewards Error</h2>
            <p className="text-sm text-red-400">{error}</p>
          </div>
        </div>
        <button
          onClick={loadRewards}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!rewards) {
    return (
      <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">No Rewards Data</h2>
          <p className="text-sm text-zinc-400 mb-4">Complete a session to start earning rewards</p>
          <button
            onClick={loadRewards}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-yellow-500/20 rounded-lg">
          <Trophy className="w-6 h-6 text-yellow-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Your Rewards</h2>
          <p className="text-sm text-zinc-400">
            {rewards.level} • {rewards.points} points
          </p>
        </div>
      </div>

      {/* Points Display */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-white">Points Balance</span>
          <span className="text-lg font-bold text-yellow-400">{rewards.points}</span>
        </div>
        
        {/* Level Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-zinc-400">
            <span>{rewards.level} Level</span>
            <span>{rewards.progress}%</span>
          </div>
          <div className="w-full bg-zinc-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${rewards.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Earned Badges */}
      {rewards.badges.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-white mb-3">Earned Badges</h3>
          <div className="grid grid-cols-2 gap-3">
            {rewards.badges.map((badge) => (
              <div
                key={badge.badgeId}
                className={`p-3 bg-gradient-to-br ${getBadgeColor(badge.badgeId)}/20 border border-${getBadgeColor(badge.badgeId).split('-')[1]}-500/30 rounded-lg`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  {getBadgeIcon(badge.badgeId)}
                  <span className="text-sm font-medium text-white">{badge.name}</span>
                </div>
                <p className="text-xs text-zinc-400">{badge.description}</p>
                <div className="mt-2 flex items-center space-x-1">
                  <Zap className="w-3 h-3 text-yellow-400" />
                  <span className="text-xs text-yellow-400">{badge.rewards.points} pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Badge */}
      {rewards.nextBadge && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-white mb-3">Next Badge</h3>
          <div className="p-4 bg-zinc-700/50 border border-zinc-600 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-zinc-600 rounded-lg">
                {getBadgeIcon(rewards.nextBadge.badgeId)}
              </div>
              <div>
                <div className="text-sm font-medium text-white">{rewards.nextBadge.name}</div>
                <div className="text-xs text-zinc-400">{rewards.nextBadge.description}</div>
              </div>
            </div>
            
            {/* Progress to next badge */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-zinc-400 mb-1">
                <span>Progress to {rewards.nextBadge.name}</span>
                <span>0%</span>
              </div>
              <div className="w-full bg-zinc-600 rounded-full h-1.5">
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 h-1.5 rounded-full w-0" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rewards Actions */}
      <div className="space-y-2">
        <button className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          View All Rewards
        </button>
        <button className="w-full px-4 py-2 bg-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-600 transition-colors">
          Redeem Points
        </button>
      </div>

      {/* Trust Lock Indicator */}
      {flags.ghostlog.lite && (
        <div className="mt-4 p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
            <span className="text-xs text-green-400">
              Rewards secured with Trust Lock
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
