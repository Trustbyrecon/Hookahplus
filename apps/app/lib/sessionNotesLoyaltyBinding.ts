// SessionNotes to Loyalty Profile Binding
// This creates the behavioral anchors that connect staff notes to customer identity

import { trustLockService, LoyaltyProfile } from './trustLockService';

export interface SessionNoteBinding {
  id: string;
  sessionId: string;
  customerId: string;
  noteId: string;
  noteContent: string;
  noteType: 'staff_observation' | 'customer_preference' | 'service_issue' | 'loyalty_milestone';
  loyaltyImpact: number;        // 0-100 impact on loyalty score
  behavioralTag: string[];      // Tags for behavioral analysis
  createdAt: Date;
  createdBy: string;            // Staff member who created the note
  venueId: string;
}

export interface LoyaltyProgression {
  customerId: string;
  currentTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  progressToNext: number;       // 0-100 progress to next tier
  milestones: {
    sessionsCompleted: number;
    badgesEarned: number;
    totalSpent: number;
    venuesVisited: number;
    loyaltyActions: number;
  };
  nextMilestone: {
    type: 'sessions' | 'badges' | 'spending' | 'venues';
    target: number;
    current: number;
    description: string;
  };
  lastUpdated: Date;
}

export class SessionNotesLoyaltyBinding {
  private static instance: SessionNotesLoyaltyBinding;
  private bindings: Map<string, SessionNoteBinding> = new Map();

  static getInstance(): SessionNotesLoyaltyBinding {
    if (!SessionNotesLoyaltyBinding.instance) {
      SessionNotesLoyaltyBinding.instance = new SessionNotesLoyaltyBinding();
    }
    return SessionNotesLoyaltyBinding.instance;
  }

  /**
   * Bind a session note to loyalty progression
   */
  async bindNoteToLoyalty(
    sessionId: string,
    customerId: string,
    noteId: string,
    noteContent: string,
    noteType: SessionNoteBinding['noteType'],
    createdBy: string,
    venueId: string
  ): Promise<SessionNoteBinding> {
    // Analyze note content for behavioral insights
    const behavioralTag = this.analyzeNoteContent(noteContent);
    const loyaltyImpact = this.calculateLoyaltyImpact(noteType, noteContent);

    const binding: SessionNoteBinding = {
      id: `binding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      customerId,
      noteId,
      noteContent,
      noteType,
      loyaltyImpact,
      behavioralTag,
      createdAt: new Date(),
      createdBy,
      venueId
    };

    this.bindings.set(binding.id, binding);

    // Update trust lock with this binding
    await trustLockService.bindSessionNotesToLoyalty(
      customerId,
      sessionId,
      [noteContent],
      venueId
    );

    // Check for loyalty milestones
    await this.checkLoyaltyMilestones(customerId, venueId);

    return binding;
  }

  /**
   * Get loyalty progression for a customer
   */
  async getLoyaltyProgression(customerId: string, venueId: string): Promise<LoyaltyProgression> {
    const loyaltyProfile = await trustLockService.getLoyaltyProfile(customerId, venueId);
    const customerBindings = Array.from(this.bindings.values())
      .filter(binding => binding.customerId === customerId);

    const milestones = {
      sessionsCompleted: loyaltyProfile.crossVenueIdentity.sessionCount,
      badgesEarned: loyaltyProfile.crossVenueIdentity.badges.length,
      totalSpent: loyaltyProfile.crossVenueIdentity.totalSpent,
      venuesVisited: loyaltyProfile.crossVenueIdentity.venueHistory.length,
      loyaltyActions: customerBindings.length
    };

    const nextMilestone = this.calculateNextMilestone(loyaltyProfile.crossVenueIdentity.loyaltyTier, milestones);
    const progressToNext = this.calculateProgressToNext(loyaltyProfile.crossVenueIdentity.loyaltyTier, milestones);

    return {
      customerId,
      currentTier: loyaltyProfile.crossVenueIdentity.loyaltyTier,
      progressToNext,
      milestones,
      nextMilestone,
      lastUpdated: new Date()
    };
  }

  /**
   * Get behavioral insights from session notes
   */
  getBehavioralInsights(customerId: string): {
    preferences: string[];
    patterns: string[];
    recommendations: string[];
  } {
    const customerBindings = Array.from(this.bindings.values())
      .filter(binding => binding.customerId === customerId);

    const allTags = customerBindings.flatMap(binding => binding.behavioralTag);
    const preferences = this.extractPreferences(allTags);
    const patterns = this.identifyPatterns(customerBindings);
    const recommendations = this.generateRecommendations(preferences, patterns);

    return {
      preferences,
      patterns,
      recommendations
    };
  }

  /**
   * Analyze note content for behavioral insights
   */
  private analyzeNoteContent(noteContent: string): string[] {
    const tags: string[] = [];
    const content = noteContent.toLowerCase();

    // Flavor preferences
    if (content.includes('apple') || content.includes('double apple')) tags.push('prefers_apple');
    if (content.includes('mint') || content.includes('peppermint')) tags.push('prefers_mint');
    if (content.includes('grape') || content.includes('grapefruit')) tags.push('prefers_grape');
    if (content.includes('mixed') || content.includes('blend')) tags.push('likes_mixed_flavors');

    // Service preferences
    if (content.includes('quick') || content.includes('fast')) tags.push('prefers_quick_service');
    if (content.includes('slow') || content.includes('patient')) tags.push('prefers_detailed_service');
    if (content.includes('quiet') || content.includes('peaceful')) tags.push('prefers_quiet_atmosphere');
    if (content.includes('social') || content.includes('chatty')) tags.push('prefers_social_atmosphere');

    // Timing patterns
    if (content.includes('morning') || content.includes('early')) tags.push('morning_customer');
    if (content.includes('evening') || content.includes('late')) tags.push('evening_customer');
    if (content.includes('weekend') || content.includes('friday')) tags.push('weekend_customer');

    // Spending patterns
    if (content.includes('expensive') || content.includes('premium')) tags.push('premium_customer');
    if (content.includes('budget') || content.includes('cheap')) tags.push('budget_conscious');
    if (content.includes('tip') || content.includes('generous')) tags.push('generous_tipper');

    // Social patterns
    if (content.includes('group') || content.includes('friends')) tags.push('group_customer');
    if (content.includes('alone') || content.includes('solo')) tags.push('solo_customer');
    if (content.includes('regular') || content.includes('frequent')) tags.push('regular_customer');

    return tags;
  }

  /**
   * Calculate loyalty impact of a note
   */
  private calculateLoyaltyImpact(noteType: SessionNoteBinding['noteType'], content: string): number {
    let impact = 0;
    const contentLower = content.toLowerCase();

    // Base impact by note type
    switch (noteType) {
      case 'loyalty_milestone':
        impact = 20;
        break;
      case 'customer_preference':
        impact = 15;
        break;
      case 'staff_observation':
        impact = 10;
        break;
      case 'service_issue':
        impact = -5;
        break;
    }

    // Positive sentiment bonus
    if (contentLower.includes('excellent') || contentLower.includes('amazing') || contentLower.includes('love')) {
      impact += 10;
    }

    // Negative sentiment penalty
    if (contentLower.includes('complaint') || contentLower.includes('issue') || contentLower.includes('problem')) {
      impact -= 10;
    }

    // Regular customer bonus
    if (contentLower.includes('regular') || contentLower.includes('frequent')) {
      impact += 5;
    }

    return Math.max(0, Math.min(100, impact));
  }

  /**
   * Check for loyalty milestones and award badges
   */
  private async checkLoyaltyMilestones(customerId: string, venueId: string): Promise<void> {
    const progression = await this.getLoyaltyProgression(customerId, venueId);
    
    // Award badges based on milestones
    if (progression.milestones.sessionsCompleted === 1) {
      await trustLockService.awardBadge(customerId, 'first_session', 'First session completed', venueId);
    }
    
    if (progression.milestones.sessionsCompleted === 5) {
      await trustLockService.awardBadge(customerId, 'regular', '5 sessions completed', venueId);
    }
    
    if (progression.milestones.sessionsCompleted === 10) {
      await trustLockService.awardBadge(customerId, 'loyalist', '10 sessions completed', venueId);
    }
    
    if (progression.milestones.venuesVisited >= 2) {
      await trustLockService.awardBadge(customerId, 'explorer', 'Visited multiple venues', venueId);
    }
    
    if (progression.milestones.totalSpent >= 10000) {
      await trustLockService.awardBadge(customerId, 'mix_master', 'High-value customer', venueId);
    }
  }

  /**
   * Calculate next milestone
   */
  private calculateNextMilestone(
    currentTier: string,
    milestones: LoyaltyProgression['milestones']
  ): LoyaltyProgression['nextMilestone'] {
    const tierRequirements = {
      'Bronze': { sessions: 5, badges: 2, spending: 5000, venues: 1 },
      'Silver': { sessions: 15, badges: 5, spending: 15000, venues: 2 },
      'Gold': { sessions: 30, badges: 8, spending: 30000, venues: 3 },
      'Platinum': { sessions: 50, badges: 12, spending: 50000, venues: 5 }
    };

    const current = tierRequirements[currentTier as keyof typeof tierRequirements];
    const next = tierRequirements[this.getNextTier(currentTier) as keyof typeof tierRequirements];

    // Find the closest milestone
    const sessionProgress = (milestones.sessionsCompleted / next.sessions) * 100;
    const badgeProgress = (milestones.badgesEarned / next.badges) * 100;
    const spendingProgress = (milestones.totalSpent / next.spending) * 100;
    const venueProgress = (milestones.venuesVisited / next.venues) * 100;

    const progressValues = [
      { type: 'sessions' as const, progress: sessionProgress, target: next.sessions, current: milestones.sessionsCompleted },
      { type: 'badges' as const, progress: badgeProgress, target: next.badges, current: milestones.badgesEarned },
      { type: 'spending' as const, progress: spendingProgress, target: next.spending, current: milestones.totalSpent },
      { type: 'venues' as const, progress: venueProgress, target: next.venues, current: milestones.venuesVisited }
    ];

    const closest = progressValues.reduce((min, current) => 
      current.progress < min.progress ? current : min
    );

    return {
      type: closest.type,
      target: closest.target,
      current: closest.current,
      description: `Complete ${closest.target - closest.current} more ${closest.type} to reach ${this.getNextTier(currentTier)} tier`
    };
  }

  /**
   * Calculate progress to next tier
   */
  private calculateProgressToNext(currentTier: string, milestones: LoyaltyProgression['milestones']): number {
    const progression = this.calculateNextMilestone(currentTier, milestones);
    return Math.round((progression.current / progression.target) * 100);
  }

  /**
   * Get next tier
   */
  private getNextTier(currentTier: string): string {
    const tiers = ['Bronze', 'Silver', 'Gold', 'Platinum'];
    const currentIndex = tiers.indexOf(currentTier);
    return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : 'Platinum';
  }

  /**
   * Extract preferences from behavioral tags
   */
  private extractPreferences(tags: string[]): string[] {
    const preferences: string[] = [];
    
    if (tags.includes('prefers_apple')) preferences.push('Apple flavors');
    if (tags.includes('prefers_mint')) preferences.push('Mint flavors');
    if (tags.includes('prefers_grape')) preferences.push('Grape flavors');
    if (tags.includes('likes_mixed_flavors')) preferences.push('Mixed flavor combinations');
    if (tags.includes('prefers_quick_service')) preferences.push('Quick service');
    if (tags.includes('prefers_detailed_service')) preferences.push('Detailed service');
    if (tags.includes('prefers_quiet_atmosphere')) preferences.push('Quiet atmosphere');
    if (tags.includes('prefers_social_atmosphere')) preferences.push('Social atmosphere');
    
    return preferences;
  }

  /**
   * Identify patterns from bindings
   */
  private identifyPatterns(bindings: SessionNoteBinding[]): string[] {
    const patterns: string[] = [];
    
    // Time patterns
    const morningNotes = bindings.filter(b => b.noteContent.toLowerCase().includes('morning')).length;
    const eveningNotes = bindings.filter(b => b.noteContent.toLowerCase().includes('evening')).length;
    
    if (morningNotes > eveningNotes) patterns.push('Morning customer');
    if (eveningNotes > morningNotes) patterns.push('Evening customer');
    
    // Service patterns
    const quickServiceNotes = bindings.filter(b => b.noteContent.toLowerCase().includes('quick')).length;
    if (quickServiceNotes > 0) patterns.push('Prefers quick service');
    
    // Social patterns
    const groupNotes = bindings.filter(b => b.noteContent.toLowerCase().includes('group')).length;
    const soloNotes = bindings.filter(b => b.noteContent.toLowerCase().includes('alone')).length;
    
    if (groupNotes > soloNotes) patterns.push('Group customer');
    if (soloNotes > groupNotes) patterns.push('Solo customer');
    
    return patterns;
  }

  /**
   * Generate recommendations based on preferences and patterns
   */
  private generateRecommendations(preferences: string[], patterns: string[]): string[] {
    const recommendations: string[] = [];
    
    if (preferences.includes('Apple flavors')) {
      recommendations.push('Suggest new apple blends when available');
    }
    
    if (preferences.includes('Mixed flavor combinations')) {
      recommendations.push('Offer custom flavor mixing options');
    }
    
    if (patterns.includes('Morning customer')) {
      recommendations.push('Send morning session promotions');
    }
    
    if (patterns.includes('Group customer')) {
      recommendations.push('Offer group discounts and reservations');
    }
    
    if (patterns.includes('Solo customer')) {
      recommendations.push('Provide quiet seating options');
    }
    
    return recommendations;
  }
}

// Export singleton instance
export const sessionNotesLoyaltyBinding = SessionNotesLoyaltyBinding.getInstance();
