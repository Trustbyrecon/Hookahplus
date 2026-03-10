/**
 * LaunchPad TypeScript Types
 * 
 * Types for H+ LaunchPad onboarding flow
 */

export interface VenueSnapshotData {
  loungeName: string;
  organizationName?: string;
  multiLocationEnabled?: boolean;
  locations?: Array<{
    name: string;
    tablesCount: number;
    sectionsCount?: number;
    operatingHours?: {
      [key: string]: { open: string; close: string } | null;
    };
  }>;
  operatorType: 'brick_and_mortar' | 'mobile'; // Mobile operators don't have fixed venue hours
  operatingHours?: {
    [key: string]: { open: string; close: string } | null; // day: { open, close } or null for closed
  }; // Optional for mobile operators
  tablesCount: number;
  sectionsCount?: number;
  baseSessionPrice: number; // in cents
  primaryGoal: 'reduce_comped' | 'speed_checkout' | 'capture_preferences' | 'all_above';
}

export interface FlavorsMixesData {
  topFlavors: Array<{
    name: string;
    premium: boolean;
    priceCents?: number;
  }>;
  commonMixes?: string[];
}

export interface SessionRulesData {
  sessionType: 'flat' | 'timed';
  gracePeriodMinutes: 0 | 5 | 10;
  extensionPolicy: 'manual' | 'auto' | 'na';
  compPolicyEnabled: boolean;
}

export interface StaffRoleData {
  email: string;
  role: 'owner' | 'manager' | 'staff';
}

export interface StaffRolesData {
  staff: StaffRoleData[];
  shiftHandoffEnabled: boolean;
}

export interface POSBridgeData {
  /** How the team will use H+ (default: alongside = POS-agnostic) */
  usageMode: 'alongside' | 'without_pos' | 'not_sure';
  /** POS type for reconciliation mapping, staff instructions, receipt conventions */
  posType: 'square' | 'clover' | 'toast' | 'stripe' | 'other' | 'none';
}

export interface LaunchPadProgress {
  currentStep: number;
  completedSteps: number[];
  data: {
    step1?: VenueSnapshotData;
    step2?: FlavorsMixesData;
    step3?: SessionRulesData;
    step4?: StaffRolesData;
    step5?: POSBridgeData;
    billing?: {
      tier?: 'starter' | 'pro' | 'trust_plus';
      stripeCheckoutSessionId?: string;
      stripeCustomerId?: string;
      stripeSubscriptionId?: string;
    };
  };
  sessionToken: string;
  createdAt: string;
  lastUpdated: string;
}

export interface SetupSessionResponse {
  token: string;
  setupLink?: string; // Auto-generated setup link
  expiresAt: string;
  progress?: LaunchPadProgress;
}

export interface ManyChatSetupRequest {
  subscriber_id?: string;
  instagram_username?: string;
  custom_fields?: {
    lounge_name?: string;
    city?: string;
    seats_tables?: string;
    pos_used?: string;
    session_type?: string;
    price_range?: string;
    top_5_flavors?: string;
  };
}

export interface ManyChatSetupResponse {
  success: boolean;
  setupSessionToken: string;
  completionLink: string;
  previewAssets: {
    qrCodesLink: string;
    posGuideLink: string;
    checklistLink: string;
  };
  nextSteps: string;
}

export interface LoungeOpsConfig {
  lounge_name: string;
  slug: string;
  /**
   * Stable, manually-defined venue identity profile.
   * This must never auto-switch; behavior can adapt only within the identity.
   */
  venue_identity?: 'casino_velocity' | 'sports_momentum' | 'luxury_memory';
  session_type: 'flat' | 'timed';
  base_session_price: number;
  grace_period_minutes: number;
  extension_policy: 'manual' | 'auto' | 'na';
  comp_policy_enabled: boolean;
  flavors: {
    standard: Array<{ name: string; price?: number }>;
    premium: Array<{ name: string; price: number }>;
  };
  common_mixes?: string[]; // Common mixes from LaunchPad
  staff: Array<{
    email: string;
    role: 'owner' | 'manager' | 'staff';
  }>;
  pos_bridge: {
    pos_type: 'square' | 'clover' | 'toast' | 'stripe' | 'other' | 'none';
    usage_mode?: 'alongside' | 'without_pos' | 'not_sure';
    integration_guide_url?: string;
  };
  operating_hours: {
    [key: string]: { open: string; close: string } | null;
  };
  tables_count: number;
  sections_count?: number;
}

export interface WeekOneWins {
  daysActive: number;
  compedSessionsAvoided: number;
  addOnsCaptured: number;
  repeatGuestsRecognized: number;
  timeSavedPerShift: number; // minutes
  totalWins: number;
}

