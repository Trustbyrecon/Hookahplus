'use client';

import React, { useState, useEffect } from 'react';
import { GuestProfile, FeatureFlags } from '../../types/guest';
import { createGhostLogEntry } from '../../libs/ghostlog/hash';
import { History, Clock, MapPin, Star, Flame, Calendar } from 'lucide-react';

interface MemoryBreadcrumbsProps {
  guestProfile: GuestProfile;
  flags: FeatureFlags;
}

interface SessionMemory {
  sessionId: string;
  loungeId: string;
  loungeName: string;
  flavors: string[];
  price: number;
  date: string;
  badges: string[];
  notes?: string;
}

export default function MemoryBreadcrumbs({ guestProfile, flags }: MemoryBreadcrumbsProps) {
  const [memories, setMemories] = useState<SessionMemory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMemories();
  }, [guestProfile.guestId]);

  const loadMemories = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // In production, this would fetch from the API
      // For now, we'll create mock memories based on guest profile
      const mockMemories: SessionMemory[] = [
        {
          sessionId: 'session_001',
          loungeId: 'lounge_001',
          loungeName: 'Hookah Paradise Downtown',
          flavors: ['Blue Mist', 'Mint Fresh'],
          price: 3200,
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
          badges: ['Regular'],
          notes: 'Great mix, will order again'
        },
        {
          sessionId: 'session_002',
          loungeId: 'lounge_002',
          loungeName: 'Cloud Nine Lounge',
          flavors: ['Double Apple', 'Grape'],
          price: 3000,
          date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
          badges: ['Explorer'],
          notes: 'First time here, amazing atmosphere'
        },
        {
          sessionId: 'session_003',
          loungeId: 'lounge_001',
          loungeName: 'Hookah Paradise Downtown',
          flavors: ['Strawberry', 'Lemon', 'Orange'],
          price: 2800,
          date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days ago
          badges: ['MixMaster'],
          notes: 'Tried the citrus mix, very refreshing'
        }
      ];

      setMemories(mockMemories);

      // Log memory view event
      if (flags.ghostlog.lite) {
        const eventPayload = {
          guestId: guestProfile.guestId,
          memoryCount: mockMemories.length,
          timestamp: new Date().toISOString()
        };

        const ghostLogEntry = createGhostLogEntry('memory.viewed', eventPayload);
        console.log('Memory view logged:', ghostLogEntry);
      }

    } catch (err) {
      console.error('Load memories error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load memories');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const formatPrice = (cents: number): string => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'Regular': return <Star className="w-3 h-3 text-yellow-400" />;
      case 'Explorer': return <MapPin className="w-3 h-3 text-blue-400" />;
      case 'MixMaster': return <Flame className="w-3 h-3 text-purple-400" />;
      case 'Loyalist': return <Star className="w-3 h-3 text-amber-400" />;
      default: return <Star className="w-3 h-3 text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <History className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Memory Timeline</h2>
            <p className="text-sm text-zinc-400">Loading...</p>
          </div>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-16 bg-zinc-700 rounded"></div>
          <div className="h-16 bg-zinc-700 rounded"></div>
          <div className="h-16 bg-zinc-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-red-500/20 rounded-lg">
            <History className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Memory Error</h2>
            <p className="text-sm text-red-400">{error}</p>
          </div>
        </div>
        <button
          onClick={loadMemories}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (memories.length === 0) {
    return (
      <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-6">
        <div className="text-center">
          <div className="p-4 bg-zinc-700/50 rounded-lg mb-4">
            <History className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-white mb-2">No Memories Yet</h3>
            <p className="text-sm text-zinc-400">
              Complete your first session to start building your memory timeline
            </p>
          </div>
          <button
            onClick={loadMemories}
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
        <div className="p-2 bg-indigo-500/20 rounded-lg">
          <History className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Memory Timeline</h2>
          <p className="text-sm text-zinc-400">Your last {memories.length} sessions</p>
        </div>
      </div>

      <div className="space-y-4">
        {memories.map((memory, index) => (
          <div
            key={memory.sessionId}
            className="p-4 bg-zinc-700/50 rounded-lg hover:bg-zinc-700 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-zinc-400" />
                <span className="text-sm text-zinc-400">{formatDate(memory.date)}</span>
              </div>
              <span className="text-sm font-medium text-white">{formatPrice(memory.price)}</span>
            </div>

            <div className="mb-2">
              <div className="flex items-center space-x-2 mb-1">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-white">{memory.loungeName}</span>
              </div>
              <div className="text-xs text-zinc-400">Session: {memory.sessionId}</div>
            </div>

            <div className="mb-2">
              <div className="flex flex-wrap gap-1">
                {memory.flavors.map((flavor, flavorIndex) => (
                  <span
                    key={flavorIndex}
                    className="px-2 py-1 bg-primary-500/20 text-primary-400 text-xs rounded"
                  >
                    {flavor}
                  </span>
                ))}
              </div>
            </div>

            {memory.badges.length > 0 && (
              <div className="mb-2">
                <div className="flex items-center space-x-1">
                  {memory.badges.map((badge, badgeIndex) => (
                    <div
                      key={badgeIndex}
                      className="flex items-center space-x-1 px-2 py-1 bg-zinc-600 rounded text-xs"
                    >
                      {getBadgeIcon(badge)}
                      <span className="text-zinc-300">{badge}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {memory.notes && (
              <div className="text-xs text-zinc-400 italic">
                "{memory.notes}"
              </div>
            )}
          </div>
        ))}
      </div>

      {/* View All Memories */}
      <div className="mt-6 text-center">
        <button className="px-4 py-2 bg-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-600 transition-colors">
          View All Memories
        </button>
      </div>

      {/* Trust Lock Indicator */}
      {flags.ghostlog.lite && (
        <div className="mt-4 p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
            <span className="text-xs text-green-400">
              Memories secured with Trust Lock
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
