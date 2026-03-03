// Memory Bloom Timeline UI - Visual narrative of customer identity
// This creates the visual anchor that signals Hookah+ = trusted memory

"use client";

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  MapPin, 
  Star, 
  Trophy, 
  Heart, 
  Users, 
  Calendar,
  Sparkles,
  Award,
  Flame,
  Coffee,
  Wind
} from 'lucide-react';
import { cn } from '../utils/cn';

export interface MemoryTimelineEvent {
  id: string;
  type: 'session' | 'badge' | 'milestone' | 'preference';
  title: string;
  description: string;
  timestamp: Date;
  venueId: string;
  venueName: string;
  icon: React.ReactNode;
  color: string;
  metadata: Record<string, any>;
}

export interface MemoryBloomData {
  customerId: string;
  customerName: string;
  loyaltyTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  totalSessions: number;
  totalSpent: number;
  venuesVisited: number;
  badgesEarned: number;
  trustScore: number;
  recentEvents: MemoryTimelineEvent[];
  favoriteFlavors: string[];
  behavioralInsights: {
    preferredTimeSlots: string[];
    averageSessionLength: number;
    socialPattern: 'solo' | 'group' | 'mixed';
    spendingPattern: 'budget' | 'moderate' | 'premium';
  };
  nextMilestone: {
    type: string;
    target: number;
    current: number;
    description: string;
  };
}

interface MemoryBloomTimelineProps {
  customerId: string;
  venueId: string;
  className?: string;
}

export const MemoryBloomTimeline: React.FC<MemoryBloomTimelineProps> = ({
  customerId,
  venueId,
  className
}) => {
  const [memoryData, setMemoryData] = useState<MemoryBloomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMemoryData();
  }, [customerId, venueId]);

  const loadMemoryData = async () => {
    try {
      setLoading(true);
      // This would fetch from the trust lock service
      const data = await generateMockMemoryData(customerId, venueId);
      setMemoryData(data);
    } catch (err) {
      setError('Failed to load memory data');
      console.error('Memory data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={cn('p-6 bg-zinc-800/50 rounded-xl border border-zinc-700', className)}>
        <div className="animate-pulse">
          <div className="h-4 bg-zinc-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex space-x-3">
                <div className="w-8 h-8 bg-zinc-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-zinc-700 rounded w-3/4"></div>
                  <div className="h-2 bg-zinc-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !memoryData) {
    return (
      <div className={cn('p-6 bg-zinc-800/50 rounded-xl border border-zinc-700', className)}>
        <div className="text-center text-zinc-400">
          <Sparkles className="w-8 h-8 mx-auto mb-2" />
          <p>Memory timeline unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('p-6 bg-zinc-800/50 rounded-xl border border-zinc-700', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Memory Bloom</h3>
            <p className="text-sm text-zinc-400">{memoryData.customerName}'s Journey</p>
          </div>
        </div>
        <div className="text-right">
          <div className={cn(
            'px-3 py-1 rounded-full text-xs font-medium',
            memoryData.loyaltyTier === 'Platinum' && 'bg-purple-500/20 text-purple-300',
            memoryData.loyaltyTier === 'Gold' && 'bg-yellow-500/20 text-yellow-300',
            memoryData.loyaltyTier === 'Silver' && 'bg-gray-500/20 text-gray-300',
            memoryData.loyaltyTier === 'Bronze' && 'bg-orange-500/20 text-orange-300'
          )}>
            {memoryData.loyaltyTier} Member
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-teal-400">{memoryData.totalSessions}</div>
          <div className="text-xs text-zinc-400">Sessions</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400">{memoryData.badgesEarned}</div>
          <div className="text-xs text-zinc-400">Badges</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">{memoryData.venuesVisited}</div>
          <div className="text-xs text-zinc-400">Venues</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400">{memoryData.trustScore}</div>
          <div className="text-xs text-zinc-400">Trust Score</div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-zinc-300 mb-3">Recent Activity</h4>
        {memoryData.recentEvents.map((event, index) => (
          <div key={event.id} className="flex items-start space-x-3">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-white text-sm',
              event.color
            )}>
              {event.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h5 className="text-sm font-medium text-white truncate">{event.title}</h5>
                <span className="text-xs text-zinc-400">
                  {event.timestamp.toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">{event.description}</p>
              <div className="flex items-center space-x-2 mt-1">
                <MapPin className="w-3 h-3 text-zinc-500" />
                <span className="text-xs text-zinc-500">{event.venueName}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Next Milestone */}
      <div className="mt-6 p-4 bg-zinc-700/30 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Trophy className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-medium text-white">Next Milestone</span>
        </div>
        <p className="text-xs text-zinc-300 mb-2">{memoryData.nextMilestone.description}</p>
        <div className="w-full bg-zinc-600 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-teal-400 to-cyan-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(memoryData.nextMilestone.current / memoryData.nextMilestone.target) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-zinc-400 mt-1">
          <span>{memoryData.nextMilestone.current}</span>
          <span>{memoryData.nextMilestone.target}</span>
        </div>
      </div>

      {/* Behavioral Insights */}
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-zinc-300 mb-3">Insights</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Clock className="w-3 h-3 text-zinc-500" />
            <span className="text-xs text-zinc-400">
              Prefers {memoryData.behavioralInsights.preferredTimeSlots.join(', ')} sessions
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-3 h-3 text-zinc-500" />
            <span className="text-xs text-zinc-400">
              {memoryData.behavioralInsights.socialPattern} customer
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Heart className="w-3 h-3 text-zinc-500" />
            <span className="text-xs text-zinc-400">
              Loves {memoryData.favoriteFlavors.join(', ')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Mock data generator for development
async function generateMockMemoryData(customerId: string, venueId: string): Promise<MemoryBloomData> {
  const mockEvents: MemoryTimelineEvent[] = [
    {
      id: '1',
      type: 'session',
      title: 'Evening Session',
      description: 'Double Apple with friends',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      venueId: 'venue1',
      venueName: 'Downtown Lounge',
      icon: <Flame className="w-4 h-4" />,
      color: 'bg-orange-500',
      metadata: { duration: 90, groupSize: 3 }
    },
    {
      id: '2',
      type: 'badge',
      title: 'Regular Badge Earned',
      description: 'Completed 5 sessions',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      venueId: 'venue1',
      venueName: 'Downtown Lounge',
      icon: <Award className="w-4 h-4" />,
      color: 'bg-yellow-500',
      metadata: { badgeId: 'regular' }
    },
    {
      id: '3',
      type: 'session',
      title: 'Solo Session',
      description: 'Mint flavor, quiet evening',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      venueId: 'venue2',
      venueName: 'Riverside Lounge',
      icon: <Coffee className="w-4 h-4" />,
      color: 'bg-green-500',
      metadata: { duration: 60, groupSize: 1 }
    }
  ];

  return {
    customerId,
    customerName: 'Alex Johnson',
    loyaltyTier: 'Silver',
    totalSessions: 8,
    totalSpent: 24000,
    venuesVisited: 2,
    badgesEarned: 3,
    trustScore: 85,
    recentEvents: mockEvents,
    favoriteFlavors: ['Double Apple', 'Mint', 'Grape'],
    behavioralInsights: {
      preferredTimeSlots: ['evening', 'night'],
      averageSessionLength: 75,
      socialPattern: 'mixed',
      spendingPattern: 'moderate'
    },
    nextMilestone: {
      type: 'sessions',
      target: 10,
      current: 8,
      description: 'Complete 2 more sessions to reach Gold tier'
    }
  };
}

export default MemoryBloomTimeline;
