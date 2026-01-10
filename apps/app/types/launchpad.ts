/**
 * LaunchPad TypeScript Types
 * 
 * Types for H+ LaunchPad onboarding flow
 */

export interface VenueSnapshotData {
  loungeName: string;
  operatingHours: {
    [key: string]: { open: string; close: string } | null; // day: { open, close } or null for closed
  };
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
  posType: 'square' | 'clover' | 'toast' | 'none';
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
  };
  sessionToken: string;
  createdAt: string;
  lastUpdated: string;
}

export interface SetupSessionResponse {
  token: string;
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
  session_type: 'flat' | 'timed';
  base_session_price: number;
  grace_period_minutes: number;
  extension_policy: 'manual' | 'auto' | 'na';
  comp_policy_enabled: boolean;
  flavors: {
    standard: Array<{ name: string; price?: number }>;
    premium: Array<{ name: string; price: number }>;
  };
  staff: Array<{
    email: string;
    role: 'owner' | 'manager' | 'staff';
  }>;
  pos_bridge: {
    pos_type: 'square' | 'clover' | 'toast' | 'none';
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

