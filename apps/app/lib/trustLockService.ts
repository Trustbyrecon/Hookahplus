// Trust Lock Architecture - Cross-Venue Identity Layer
// This creates the foundational identity moat that travels across lounges

export interface CrossVenueIdentity {
  customerId: string;           // UUID-based customer identifier
  sessionCount: number;         // Total sessions across all venues
  badges: string[];            // Array of earned badge IDs
  trustHashes: string[];       // Immutable trust stamps
  lastSeen: Date;              // Last activity timestamp
  loyaltyTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  totalSpent: number;          // Lifetime spending across venues
  favoriteFlavors: string[];   // Behavioral preferences
  venueHistory: string[];      // List of venues visited
  createdAt: Date;
  updatedAt: Date;
}

export interface TrustStamp {
  id: string;
  customerId: string;
  eventType: 'session_start' | 'session_end' | 'badge_earned' | 'loyalty_action';
  eventData: Record<string, any>;
  timestamp: Date;
  hash: string;                 // Immutable hash of the event
  venueId: string;
  sessionId?: string;
  previousHash?: string;        // Chain of trust
}

export interface LoyaltyProfile {
  customerId: string;
  crossVenueIdentity: CrossVenueIdentity;
  sessionNotes: string[];       // Bound to SessionNotes
  behavioralPatterns: {
    preferredTimeSlots: string[];
    averageSessionLength: number;
    favoriteStaff: string[];
    spendingPatterns: Record<string, number>;
  };
  trustScore: number;           // 0-100 trust rating
  lastUpdated: Date;
}

// Trust Lock Service - Core identity management
export class TrustLockService {
  private static instance: TrustLockService;
  private trustChain: Map<string, TrustStamp> = new Map();
  private crossVenueIdentities: Map<string, CrossVenueIdentity> = new Map();

  static getInstance(): TrustLockService {
    if (!TrustLockService.instance) {
      TrustLockService.instance = new TrustLockService();
    }
    return TrustLockService.instance;
  }

  /**
   * Create or retrieve cross-venue identity
   */
  async getOrCreateIdentity(customerId: string, venueId: string): Promise<CrossVenueIdentity> {
    let identity = this.crossVenueIdentities.get(customerId);
    
    if (!identity) {
      identity = {
        customerId,
        sessionCount: 0,
        badges: [],
        trustHashes: [],
        lastSeen: new Date(),
        loyaltyTier: 'Bronze',
        totalSpent: 0,
        favoriteFlavors: [],
        venueHistory: [venueId],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.crossVenueIdentities.set(customerId, identity);
    } else {
      // Update venue history if new venue
      if (!identity.venueHistory.includes(venueId)) {
        identity.venueHistory.push(venueId);
      }
      identity.lastSeen = new Date();
      identity.updatedAt = new Date();
    }

    return identity;
  }

  /**
   * Create immutable trust stamp
   */
  async createTrustStamp(
    customerId: string,
    eventType: TrustStamp['eventType'],
    eventData: Record<string, any>,
    venueId: string,
    sessionId?: string
  ): Promise<TrustStamp> {
    const timestamp = new Date();
    const previousHash = this.getLastHash(customerId);
    
    // Create immutable hash
    const hashData = {
      customerId,
      eventType,
      eventData,
      timestamp: timestamp.toISOString(),
      venueId,
      sessionId,
      previousHash
    };
    
    const hash = await this.createHash(JSON.stringify(hashData));
    
    const trustStamp: TrustStamp = {
      id: `trust_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      customerId,
      eventType,
      eventData,
      timestamp,
      hash,
      venueId,
      sessionId,
      previousHash
    };

    this.trustChain.set(trustStamp.id, trustStamp);
    
    // Update customer's trust hashes
    const identity = await this.getOrCreateIdentity(customerId, venueId);
    identity.trustHashes.push(hash);
    
    return trustStamp;
  }

  /**
   * Bind SessionNotes to Loyalty Profile
   */
  async bindSessionNotesToLoyalty(
    customerId: string,
    sessionId: string,
    notes: string[],
    venueId: string
  ): Promise<void> {
    const identity = await this.getOrCreateIdentity(customerId, venueId);
    
    // Create trust stamp for session notes
    await this.createTrustStamp(
      customerId,
      'loyalty_action',
      {
        action: 'session_notes_added',
        sessionId,
        notes,
        noteCount: notes.length
      },
      venueId,
      sessionId
    );

    // Update behavioral patterns
    identity.updatedAt = new Date();
  }

  /**
   * Award reflexive badge
   */
  async awardBadge(
    customerId: string,
    badgeId: string,
    reason: string,
    venueId: string,
    sessionId?: string
  ): Promise<void> {
    const identity = await this.getOrCreateIdentity(customerId, venueId);
    
    if (!identity.badges.includes(badgeId)) {
      identity.badges.push(badgeId);
      
      // Create trust stamp for badge award
      await this.createTrustStamp(
        customerId,
        'badge_earned',
        {
          badgeId,
          reason,
          totalBadges: identity.badges.length
        },
        venueId,
        sessionId
      );

      // Update loyalty tier based on badges
      identity.loyaltyTier = this.calculateLoyaltyTier(identity);
      identity.updatedAt = new Date();
    }
  }

  /**
   * Get customer's trust chain
   */
  getTrustChain(customerId: string): TrustStamp[] {
    return Array.from(this.trustChain.values())
      .filter(stamp => stamp.customerId === customerId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * Get loyalty profile with session notes binding
   */
  async getLoyaltyProfile(customerId: string, venueId: string): Promise<LoyaltyProfile> {
    const identity = await this.getOrCreateIdentity(customerId, venueId);
    const trustChain = this.getTrustChain(customerId);
    
    // Extract session notes from trust chain
    const sessionNotes = trustChain
      .filter(stamp => stamp.eventType === 'loyalty_action' && stamp.eventData.action === 'session_notes_added')
      .map(stamp => stamp.eventData.notes)
      .flat();

    // Calculate behavioral patterns
    const behavioralPatterns = this.calculateBehavioralPatterns(trustChain);
    
    // Calculate trust score
    const trustScore = this.calculateTrustScore(identity, trustChain);

    return {
      customerId,
      crossVenueIdentity: identity,
      sessionNotes,
      behavioralPatterns,
      trustScore,
      lastUpdated: new Date()
    };
  }

  /**
   * Create cryptographic hash
   */
  private async createHash(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Get last hash for chaining
   */
  private getLastHash(customerId: string): string | undefined {
    const customerStamps = this.getTrustChain(customerId);
    return customerStamps.length > 0 ? customerStamps[customerStamps.length - 1].hash : undefined;
  }

  /**
   * Calculate loyalty tier based on badges and activity
   */
  private calculateLoyaltyTier(identity: CrossVenueIdentity): CrossVenueIdentity['loyaltyTier'] {
    const badgeCount = identity.badges.length;
    const sessionCount = identity.sessionCount;
    const totalSpent = identity.totalSpent;

    if (badgeCount >= 10 && sessionCount >= 50 && totalSpent >= 50000) return 'Platinum';
    if (badgeCount >= 6 && sessionCount >= 25 && totalSpent >= 25000) return 'Gold';
    if (badgeCount >= 3 && sessionCount >= 10 && totalSpent >= 10000) return 'Silver';
    return 'Bronze';
  }

  /**
   * Calculate behavioral patterns from trust chain
   */
  private calculateBehavioralPatterns(trustChain: TrustStamp[]): LoyaltyProfile['behavioralPatterns'] {
    const sessions = trustChain.filter(stamp => stamp.eventType === 'session_start');
    const timeSlots = sessions.map(session => {
      const hour = new Date(session.timestamp).getHours();
      if (hour < 12) return 'morning';
      if (hour < 17) return 'afternoon';
      if (hour < 21) return 'evening';
      return 'night';
    });

    const preferredTimeSlots = this.getMostFrequent(timeSlots);
    const averageSessionLength = this.calculateAverageSessionLength(trustChain);
    const favoriteStaff = this.extractFavoriteStaff(trustChain);
    const spendingPatterns = this.calculateSpendingPatterns(trustChain);

    return {
      preferredTimeSlots,
      averageSessionLength,
      favoriteStaff,
      spendingPatterns
    };
  }

  /**
   * Calculate trust score (0-100)
   */
  private calculateTrustScore(identity: CrossVenueIdentity, trustChain: TrustStamp[]): number {
    let score = 0;
    
    // Base score from session count
    score += Math.min(identity.sessionCount * 2, 40);
    
    // Badge bonus
    score += Math.min(identity.badges.length * 5, 30);
    
    // Cross-venue bonus
    score += Math.min(identity.venueHistory.length * 3, 15);
    
    // Trust chain integrity
    score += Math.min(trustChain.length * 0.5, 15);
    
    return Math.min(Math.round(score), 100);
  }

  /**
   * Helper methods
   */
  private getMostFrequent(items: string[]): string[] {
    const frequency: Record<string, number> = {};
    items.forEach(item => {
      frequency[item] = (frequency[item] || 0) + 1;
    });
    
    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([item]) => item);
  }

  private calculateAverageSessionLength(trustChain: TrustStamp[]): number {
    // Implementation would calculate average session duration
    return 60; // Default 60 minutes
  }

  private extractFavoriteStaff(trustChain: TrustStamp[]): string[] {
    // Implementation would extract staff preferences from trust chain
    return []; // Default empty array
  }

  private calculateSpendingPatterns(trustChain: TrustStamp[]): Record<string, number> {
    // Implementation would calculate spending patterns
    return {}; // Default empty object
  }
}

// Export singleton instance
export const trustLockService = TrustLockService.getInstance();
