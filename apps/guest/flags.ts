import { FeatureFlags } from '@guest-types';

/**
 * Feature Flags Configuration
 * 
 * Controls feature rollout and A/B testing for the guest build.
 * Flags can be toggled per lounge, per guest, or globally.
 */

// Default feature flags
const DEFAULT_FLAGS: FeatureFlags = {
  guest: {
    enabled: true,
    qrFirst: true,
    anonymousMode: true,
  },
  rewards: {
    badges: {
      v1: true,
    },
    points: true,
  },
  referral: {
    qr: {
      v1: true,
    },
    p2p: true,
    connector: true,
  },
  memory: {
    breadcrumbs: {
      v1: true,
    },
    timeline: true,
  },
  ghostlog: {
    lite: true,
    full: false,
  },
  pricing: {
    dynamic: true,
    promos: true,
  },
};

// Pilot lounge flags (enhanced features)
const PILOT_FLAGS: FeatureFlags = {
  ...DEFAULT_FLAGS,
  rewards: {
    ...DEFAULT_FLAGS.rewards,
    badges: {
      v1: true,
    },
  },
  memory: {
    ...DEFAULT_FLAGS.memory,
    breadcrumbs: {
      v1: true,
    },
  },
  pricing: {
    ...DEFAULT_FLAGS.pricing,
    dynamic: true,
    promos: true,
  },
};

// Production flags (stable features)
const PRODUCTION_FLAGS: FeatureFlags = {
  ...DEFAULT_FLAGS,
  guest: {
    enabled: true,
    qrFirst: true,
    anonymousMode: true,
  },
  rewards: {
    badges: {
      v1: true,
    },
    points: true,
  },
  referral: {
    qr: {
      v1: true,
    },
    p2p: true,
    connector: false, // Disable connector referrals in production initially
  },
  memory: {
    breadcrumbs: {
      v1: true,
    },
    timeline: true,
  },
  ghostlog: {
    lite: true,
    full: false,
  },
  pricing: {
    dynamic: false, // Disable dynamic pricing in production initially
    promos: true,
  },
};

// Pilot lounge IDs
const PILOT_LOUNGES = [
  'lounge_001', // Hookah Paradise Downtown
  'lounge_002', // Second pilot lounge
];

// Connector IDs for referral testing
const PILOT_CONNECTORS = [
  'connector_001',
  'connector_002',
];

class FeatureFlagService {
  private static instance: FeatureFlagService;
  private flags: Map<string, FeatureFlags> = new Map();
  private guestFlags: Map<string, Partial<FeatureFlags>> = new Map();

  static getInstance(): FeatureFlagService {
    if (!FeatureFlagService.instance) {
      FeatureFlagService.instance = new FeatureFlagService();
    }
    return FeatureFlagService.instance;
  }

  constructor() {
    this.initializeFlags();
  }

  private initializeFlags(): void {
    // Set default flags
    this.flags.set('default', DEFAULT_FLAGS);
    this.flags.set('pilot', PILOT_FLAGS);
    this.flags.set('production', PRODUCTION_FLAGS);
  }

  /**
   * Get feature flags for a lounge
   */
  getLoungeFlags(loungeId: string): FeatureFlags {
    // Check if lounge is in pilot program
    if (PILOT_LOUNGES.includes(loungeId)) {
      return this.flags.get('pilot') || DEFAULT_FLAGS;
    }

    // Check environment
    const env = process.env.NODE_ENV || 'development';
    if (env === 'production') {
      return this.flags.get('production') || DEFAULT_FLAGS;
    }

    return this.flags.get('default') || DEFAULT_FLAGS;
  }

  /**
   * Get feature flags for a specific guest
   */
  getGuestFlags(guestId: string, loungeId: string): FeatureFlags {
    const loungeFlags = this.getLoungeFlags(loungeId);
    const guestOverrides = this.guestFlags.get(guestId);

    if (!guestOverrides) {
      return loungeFlags;
    }

    // Merge guest-specific overrides
    return this.mergeFlags(loungeFlags, guestOverrides);
  }

  /**
   * Set guest-specific feature flags
   */
  setGuestFlags(guestId: string, flags: Partial<FeatureFlags>): void {
    this.guestFlags.set(guestId, flags);
  }

  /**
   * Check if a specific feature is enabled
   */
  isEnabled(
    feature: string,
    guestId?: string,
    loungeId?: string
  ): boolean {
    const flags = guestId && loungeId 
      ? this.getGuestFlags(guestId, loungeId)
      : this.getLoungeFlags(loungeId || 'default');

    return this.getNestedValue(flags, feature) === true;
  }

  /**
   * Get feature flag value
   */
  getFlag(
    feature: string,
    guestId?: string,
    loungeId?: string
  ): any {
    const flags = guestId && loungeId 
      ? this.getGuestFlags(guestId, loungeId)
      : this.getLoungeFlags(loungeId || 'default');

    return this.getNestedValue(flags, feature);
  }

  /**
   * Check if lounge is in pilot program
   */
  isPilotLounge(loungeId: string): boolean {
    return PILOT_LOUNGES.includes(loungeId);
  }

  /**
   * Check if connector is in pilot program
   */
  isPilotConnector(connectorId: string): boolean {
    return PILOT_CONNECTORS.includes(connectorId);
  }

  /**
   * Get all flags for debugging
   */
  getAllFlags(): Record<string, FeatureFlags> {
    const result: Record<string, FeatureFlags> = {};
    for (const [key, value] of this.flags.entries()) {
      result[key] = value;
    }
    return result;
  }

  /**
   * Reset all flags to default
   */
  reset(): void {
    this.flags.clear();
    this.guestFlags.clear();
    this.initializeFlags();
  }

  private mergeFlags(base: FeatureFlags, overrides: Partial<FeatureFlags>): FeatureFlags {
    return {
      guest: { ...base.guest, ...overrides.guest },
      rewards: { 
        ...base.rewards, 
        ...overrides.rewards,
        badges: { ...base.rewards.badges, ...overrides.rewards?.badges },
      },
      referral: { 
        ...base.referral, 
        ...overrides.referral,
        qr: { ...base.referral.qr, ...overrides.referral?.qr },
      },
      memory: { 
        ...base.memory, 
        ...overrides.memory,
        breadcrumbs: { ...base.memory.breadcrumbs, ...overrides.memory?.breadcrumbs },
      },
      ghostlog: { ...base.ghostlog, ...overrides.ghostlog },
      pricing: { ...base.pricing, ...overrides.pricing },
    };
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }
}

export const featureFlags = FeatureFlagService.getInstance();

// Helper functions for common flag checks
export const isGuestEnabled = (loungeId: string): boolean => 
  featureFlags.isEnabled('guest.enabled', undefined, loungeId);

export const isQRFirst = (loungeId: string): boolean => 
  featureFlags.isEnabled('guest.qrFirst', undefined, loungeId);

export const isAnonymousMode = (loungeId: string): boolean => 
  featureFlags.isEnabled('guest.anonymousMode', undefined, loungeId);

export const isBadgesEnabled = (loungeId: string): boolean => 
  featureFlags.isEnabled('rewards.badges.v1', undefined, loungeId);

export const isReferralEnabled = (loungeId: string): boolean => 
  featureFlags.isEnabled('referral.qr.v1', undefined, loungeId);

export const isMemoryBreadcrumbsEnabled = (loungeId: string): boolean => 
  featureFlags.isEnabled('memory.breadcrumbs.v1', undefined, loungeId);

export const isGhostLogEnabled = (loungeId: string): boolean => 
  featureFlags.isEnabled('ghostlog.lite', undefined, loungeId);

export const isDynamicPricingEnabled = (loungeId: string): boolean => 
  featureFlags.isEnabled('pricing.dynamic', undefined, loungeId);

export const isPromosEnabled = (loungeId: string): boolean => 
  featureFlags.isEnabled('pricing.promos', undefined, loungeId);