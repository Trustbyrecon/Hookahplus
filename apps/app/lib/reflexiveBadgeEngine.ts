// Reflexive Badge Engine - Visible proof of identity continuity
// This creates the first UI-facing proof that identity travels with the customer

export interface ReflexiveBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  requirements: BadgeRequirement[];
  rewards: BadgeReward[];
  isActive: boolean;
  createdAt: Date;
}

export interface BadgeRequirement {
  type: 'sessions' | 'spending' | 'venues' | 'badges' | 'time' | 'custom';
  target: number;
  current: number;
  description: string;
}

export interface BadgeReward {
  type: 'discount' | 'free_item' | 'priority' | 'exclusive_access' | 'recognition';
  value: number;
  description: string;
}

export interface BadgeProgress {
  badgeId: string;
  customerId: string;
  progress: number; // 0-100
  requirements: BadgeRequirement[];
  isEarned: boolean;
  earnedAt?: Date;
  nextMilestone: string;
}

export class ReflexiveBadgeEngine {
  private static instance: ReflexiveBadgeEngine;
  private badges: Map<string, ReflexiveBadge> = new Map();
  private badgeProgress: Map<string, BadgeProgress> = new Map();

  static getInstance(): ReflexiveBadgeEngine {
    if (!ReflexiveBadgeEngine.instance) {
      ReflexiveBadgeEngine.instance = new ReflexiveBadgeEngine();
      ReflexiveBadgeEngine.instance.initializeDefaultBadges();
    }
    return ReflexiveBadgeEngine.instance;
  }

  /**
   * Initialize default reflexive badges
   */
  private initializeDefaultBadges(): void {
    const defaultBadges: ReflexiveBadge[] = [
      {
        id: 'first_session',
        name: 'First Smoke',
        description: 'Completed your first hookah session',
        icon: '🌱',
        color: '#8B4513',
        tier: 'Bronze',
        requirements: [
          {
            type: 'sessions',
            target: 1,
            current: 0,
            description: 'Complete 1 session'
          }
        ],
        rewards: [
          {
            type: 'recognition',
            value: 0,
            description: 'Welcome to the Hookah+ community!'
          }
        ],
        isActive: true,
        createdAt: new Date()
      },
      {
        id: 'regular',
        name: 'Regular',
        description: 'A familiar face around here',
        icon: '⭐',
        color: '#C0C0C0',
        tier: 'Silver',
        requirements: [
          {
            type: 'sessions',
            target: 5,
            current: 0,
            description: 'Complete 5 sessions'
          }
        ],
        rewards: [
          {
            type: 'discount',
            value: 5,
            description: '5% off all sessions'
          }
        ],
        isActive: true,
        createdAt: new Date()
      },
      {
        id: 'loyalist',
        name: 'Loyalist',
        description: 'True dedication to the hookah experience',
        icon: '💎',
        color: '#FFD700',
        tier: 'Gold',
        requirements: [
          {
            type: 'sessions',
            target: 10,
            current: 0,
            description: 'Complete 10 sessions'
          }
        ],
        rewards: [
          {
            type: 'discount',
            value: 10,
            description: '10% off all sessions'
          },
          {
            type: 'priority',
            value: 0,
            description: 'Priority seating'
          }
        ],
        isActive: true,
        createdAt: new Date()
      },
      {
        id: 'explorer',
        name: 'Explorer',
        description: 'Journeyed across multiple venues',
        icon: '🗺️',
        color: '#4169E1',
        tier: 'Gold',
        requirements: [
          {
            type: 'venues',
            target: 2,
            current: 0,
            description: 'Visit 2 different venues'
          }
        ],
        rewards: [
          {
            type: 'exclusive_access',
            value: 0,
            description: 'Access to exclusive venues'
          }
        ],
        isActive: true,
        createdAt: new Date()
      },
      {
        id: 'mix_master',
        name: 'Mix Master',
        description: 'High-value customer and flavor expert',
        icon: '🎨',
        color: '#FF6347',
        tier: 'Platinum',
        requirements: [
          {
            type: 'spending',
            target: 10000,
            current: 0,
            description: 'Spend $100+ across sessions'
          },
          {
            type: 'sessions',
            target: 15,
            current: 0,
            description: 'Complete 15 sessions'
          }
        ],
        rewards: [
          {
            type: 'discount',
            value: 15,
            description: '15% off all sessions'
          },
          {
            type: 'free_item',
            value: 1,
            description: 'Free premium flavor upgrade'
          },
          {
            type: 'exclusive_access',
            value: 0,
            description: 'Access to VIP areas'
          }
        ],
        isActive: true,
        createdAt: new Date()
      },
      {
        id: 'night_owl',
        name: 'Night Owl',
        description: 'Prefers late-night sessions',
        icon: '🦉',
        color: '#4B0082',
        tier: 'Silver',
        requirements: [
          {
            type: 'time',
            target: 5,
            current: 0,
            description: '5 sessions after 10 PM'
          }
        ],
        rewards: [
          {
            type: 'discount',
            value: 8,
            description: '8% off late-night sessions'
          }
        ],
        isActive: true,
        createdAt: new Date()
      },
      {
        id: 'social_butterfly',
        name: 'Social Butterfly',
        description: 'Loves group sessions and socializing',
        icon: '🦋',
        color: '#FF69B4',
        tier: 'Silver',
        requirements: [
          {
            type: 'sessions',
            target: 8,
            current: 0,
            description: '8 group sessions (3+ people)'
          }
        ],
        rewards: [
          {
            type: 'discount',
            value: 7,
            description: '7% off group bookings'
          }
        ],
        isActive: true,
        createdAt: new Date()
      }
    ];

    defaultBadges.forEach(badge => {
      this.badges.set(badge.id, badge);
    });
  }

  /**
   * Update badge progress for a customer
   */
  async updateBadgeProgress(
    customerId: string,
    eventType: string,
    eventData: Record<string, any>
  ): Promise<BadgeProgress[]> {
    const updatedProgress: BadgeProgress[] = [];
    const activeBadges = Array.from(this.badges.values()).filter(badge => badge.isActive);

    for (const badge of activeBadges) {
      const progress = await this.calculateBadgeProgress(customerId, badge, eventType, eventData);
      
      if (progress) {
        this.badgeProgress.set(`${customerId}_${badge.id}`, progress);
        updatedProgress.push(progress);

        // Check if badge is earned
        if (progress.isEarned && !progress.earnedAt) {
          progress.earnedAt = new Date();
          console.log(`[BadgeEngine] 🏆 Badge earned: ${badge.name} by customer ${customerId}`);
        }
      }
    }

    return updatedProgress;
  }

  /**
   * Get customer's badge progress
   */
  getCustomerBadgeProgress(customerId: string): BadgeProgress[] {
    return Array.from(this.badgeProgress.values())
      .filter(progress => progress.customerId === customerId);
  }

  /**
   * Get earned badges for a customer
   */
  getEarnedBadges(customerId: string): (ReflexiveBadge & { earnedAt: Date })[] {
    const earnedProgress = this.getCustomerBadgeProgress(customerId)
      .filter(progress => progress.isEarned && progress.earnedAt);

    return earnedProgress.map(progress => {
      const badge = this.badges.get(progress.badgeId)!;
      return {
        ...badge,
        earnedAt: progress.earnedAt!
      };
    });
  }

  /**
   * Get available badges for a customer
   */
  getAvailableBadges(customerId: string): (ReflexiveBadge & { progress: BadgeProgress })[] {
    const activeBadges = Array.from(this.badges.values()).filter(badge => badge.isActive);
    
    return activeBadges.map(badge => {
      const progress = this.badgeProgress.get(`${customerId}_${badge.id}`) || {
        badgeId: badge.id,
        customerId,
        progress: 0,
        requirements: badge.requirements,
        isEarned: false,
        nextMilestone: this.getNextMilestone(badge.requirements)
      };

      return {
        ...badge,
        progress
      };
    });
  }

  /**
   * Calculate badge progress
   */
  private async calculateBadgeProgress(
    customerId: string,
    badge: ReflexiveBadge,
    eventType: string,
    eventData: Record<string, any>
  ): Promise<BadgeProgress | null> {
    const currentProgress = this.badgeProgress.get(`${customerId}_${badge.id}`);
    
    if (currentProgress?.isEarned) {
      return currentProgress; // Already earned
    }

    const updatedRequirements = badge.requirements.map(req => {
      let current = req.current;
      
      // Update based on event type
      switch (req.type) {
        case 'sessions':
          if (eventType === 'session_completed') {
            current = Math.min(current + 1, req.target);
          }
          break;
        case 'spending':
          if (eventType === 'session_completed' && eventData.amount) {
            current = Math.min(current + eventData.amount, req.target);
          }
          break;
        case 'venues':
          if (eventType === 'session_completed' && eventData.venueId) {
            // This would need to track unique venues
            current = Math.min(current + 1, req.target);
          }
          break;
        case 'time':
          if (eventType === 'session_completed' && eventData.timeOfDay === 'night') {
            current = Math.min(current + 1, req.target);
          }
          break;
        case 'custom':
          // Custom logic based on event data
          if (eventType === 'session_completed' && eventData.groupSize >= 3) {
            current = Math.min(current + 1, req.target);
          }
          break;
      }

      return {
        ...req,
        current
      };
    });

    const totalProgress = updatedRequirements.reduce((sum, req) => {
      return sum + (req.current / req.target) * 100;
    }, 0) / updatedRequirements.length;

    const isEarned = updatedRequirements.every(req => req.current >= req.target);

    return {
      badgeId: badge.id,
      customerId,
      progress: Math.round(totalProgress),
      requirements: updatedRequirements,
      isEarned,
      earnedAt: isEarned ? new Date() : undefined,
      nextMilestone: this.getNextMilestone(updatedRequirements)
    };
  }

  /**
   * Get next milestone description
   */
  private getNextMilestone(requirements: BadgeRequirement[]): string {
    const incomplete = requirements.find(req => req.current < req.target);
    if (!incomplete) return 'Badge earned!';
    
    const remaining = incomplete.target - incomplete.current;
    return `${remaining} more ${incomplete.type} needed`;
  }

  /**
   * Get badge statistics
   */
  getBadgeStatistics(): {
    totalBadges: number;
    activeBadges: number;
    totalEarned: number;
    mostPopularBadge: string;
    averageProgress: number;
  } {
    const badges = Array.from(this.badges.values());
    const activeBadges = badges.filter(badge => badge.isActive);
    const allProgress = Array.from(this.badgeProgress.values());
    const earnedBadges = allProgress.filter(progress => progress.isEarned);
    
    // Find most popular badge
    const badgeCounts: Record<string, number> = {};
    earnedBadges.forEach(progress => {
      badgeCounts[progress.badgeId] = (badgeCounts[progress.badgeId] || 0) + 1;
    });
    
    const mostPopularBadge = Object.entries(badgeCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';
    
    const averageProgress = allProgress.length > 0 
      ? allProgress.reduce((sum, progress) => sum + progress.progress, 0) / allProgress.length 
      : 0;

    return {
      totalBadges: badges.length,
      activeBadges: activeBadges.length,
      totalEarned: earnedBadges.length,
      mostPopularBadge,
      averageProgress: Math.round(averageProgress)
    };
  }
}

// Export singleton instance
export const reflexiveBadgeEngine = ReflexiveBadgeEngine.getInstance();
