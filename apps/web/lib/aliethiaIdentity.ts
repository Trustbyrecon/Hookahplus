// lib/aliethiaIdentity.ts
// Aliethia.Identity agent implementation

export interface Badge {
  code: string;
  label: string;
  hint: string;
  earnedAt: number;
  venueId: string;
}

export interface Profile {
  id: string;
  name: string;
  phone: string;
  email: string;
  tier: string;
  badges: Badge[];
  preferences: string[];
  networkBadges: Badge[];
  lastVisit: number;
  totalVisits: number;
}

export class AliethiaIdentity {
  private profiles: Map<string, Profile> = new Map();
  private badgeConfig = {
    EXPLORER: { label: 'Explorer', hint: 'Visited 3+ venues', threshold: 3 },
    MIX: { label: 'Mix Master', hint: '10 unique combos', threshold: 10 },
    LOYAL: { label: 'Loyalist', hint: '10 sessions at a venue', threshold: 10 }
  };

  // Event handlers
  public handleCheckIn(profileId: string, venueId: string, staffId: string): void {
    console.log('🧠 Aliethia.Identity: Processing check-in', { profileId, venueId, staffId });
    
    const profile = this.getOrCreateProfile(profileId);
    profile.lastVisit = Date.now();
    profile.totalVisits++;
    
    this.evaluateBadges(profile, venueId);
    this.saveProfile(profile);
  }

  public handleVisitClosed(profileId: string, venueId: string, comboHash?: string): void {
    console.log('🧠 Aliethia.Identity: Processing visit closed', { profileId, venueId, comboHash });
    
    const profile = this.getProfile(profileId);
    if (!profile) return;

    if (comboHash) {
      profile.preferences.push(comboHash);
      // Keep only last 10 preferences
      if (profile.preferences.length > 10) {
        profile.preferences = profile.preferences.slice(-10);
      }
    }

    this.evaluateBadges(profile, venueId);
    this.saveProfile(profile);
  }

  public handleMixOrdered(profileId: string, venueId: string, comboHash: string): void {
    console.log('🧠 Aliethia.Identity: Processing mix ordered', { profileId, venueId, comboHash });
    
    const profile = this.getProfile(profileId);
    if (!profile) return;

    profile.preferences.push(comboHash);
    this.evaluateBadges(profile, venueId);
    this.saveProfile(profile);
  }

  // Badge evaluation
  private evaluateBadges(profile: Profile, venueId: string): void {
    // Explorer badge (3+ venues)
    const uniqueVenues = new Set(profile.badges.map(b => b.venueId));
    if (uniqueVenues.size >= this.badgeConfig.EXPLORER.threshold) {
      this.awardBadge(profile, 'EXPLORER', venueId);
    }

    // Mix Master badge (10+ unique combos)
    const uniqueCombos = new Set(profile.preferences);
    if (uniqueCombos.size >= this.badgeConfig.MIX.threshold) {
      this.awardBadge(profile, 'MIX', venueId);
    }

    // Loyalist badge (10+ sessions at this venue)
    const venueSessions = profile.badges.filter(b => b.venueId === venueId).length;
    if (venueSessions >= this.badgeConfig.LOYAL.threshold) {
      this.awardBadge(profile, 'LOYAL', venueId);
    }
  }

  private awardBadge(profile: Profile, badgeCode: string, venueId: string): void {
    const badgeConfig = this.badgeConfig[badgeCode as keyof typeof this.badgeConfig];
    if (!badgeConfig) return;

    // Check if already awarded
    const alreadyAwarded = profile.badges.some(b => b.code === badgeCode && b.venueId === venueId);
    if (alreadyAwarded) return;

    const badge: Badge = {
      code: badgeCode,
      label: badgeConfig.label,
      hint: badgeConfig.hint,
      earnedAt: Date.now(),
      venueId
    };

    profile.badges.push(badge);
    console.log(`🏆 Badge awarded: ${badgeCode} to ${profile.name} at ${venueId}`);
  }

  // Profile management
  private getOrCreateProfile(profileId: string): Profile {
    let profile = this.profiles.get(profileId);
    if (!profile) {
      profile = {
        id: profileId,
        name: 'Guest User',
        phone: '',
        email: '',
        tier: 'Bronze',
        badges: [],
        preferences: [],
        networkBadges: [],
        lastVisit: Date.now(),
        totalVisits: 0
      };
      this.profiles.set(profileId, profile);
    }
    return profile;
  }

  public getProfile(profileId: string): Profile | undefined {
    return this.profiles.get(profileId);
  }

  private saveProfile(profile: Profile): void {
    this.profiles.set(profile.id, profile);
    // In production, this would save to database
  }

  // Public API

  public getAllProfiles(): Profile[] {
    return Array.from(this.profiles.values());
  }

  public getBadges(profileId: string, venueId?: string): Badge[] {
    const profile = this.getProfile(profileId);
    if (!profile) return [];

    if (venueId) {
      return profile.badges.filter(b => b.venueId === venueId);
    }
    return profile.badges;
  }

  public exportProfile(profileId: string): string {
    const profile = this.getProfile(profileId);
    if (!profile) throw new Error('Profile not found');

    return JSON.stringify(profile, null, 2);
  }

  // KPIs
  public getKPIs(): Record<string, number> {
    const profiles = this.getAllProfiles();
    const totalProfiles = profiles.length;
    const profilesWithBadges = profiles.filter(p => p.badges.length > 0).length;
    const explorerCount = profiles.filter(p => p.badges.some(b => b.code === 'EXPLORER')).length;
    const repeatVisitors = profiles.filter(p => p.totalVisits > 1).length;

    return {
      totalProfiles,
      badgeEarnedRate: totalProfiles > 0 ? (profilesWithBadges / totalProfiles) * 100 : 0,
      explorerRate: totalProfiles > 0 ? (explorerCount / totalProfiles) * 100 : 0,
      repeatRate: totalProfiles > 0 ? (repeatVisitors / totalProfiles) * 100 : 0
    };
  }
}

// Singleton instance
export const aliethiaIdentity = new AliethiaIdentity();
