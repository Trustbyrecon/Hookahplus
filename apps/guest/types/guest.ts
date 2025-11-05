// Guest Profile Schema
export type GuestProfile = {
  guestId: string;            // UUID (portable)
  anon: boolean;              // true until opt-in
  phone?: string;             // optional, if user links
  email?: string;             // optional, if user links
  lastLoungeId?: string;
  badges: string[];           // ["Regular","MixMaster","Explorer","Loyalist"]
  sessions: string[];         // sessionIds (recent first)
  points: number;             // loyalty points
  createdAt: string; 
  updatedAt: string;
  deviceId?: string;          // for anonymous tracking
  preferences?: {
    favoriteFlavors: string[];
    savedMixes: MixProfile[];
    notifications: boolean;
  };
}

// Mix Profile for saved flavor combinations
export type MixProfile = {
  mixId: string;
  name: string;
  flavors: string[];
  notes?: string;
  createdAt: string;
  timesUsed: number;
}

// Session Schema
export type Session = {
  sessionId: string;
  loungeId: string;
  guestId: string;
  mix: { 
    flavors: string[]; 
    notes?: string;
    mixId?: string; // if using saved mix
  };
  price: { 
    base: number; 
    addons: number; 
    total: number; 
    currency: "USD";
    promo?: {
      code: string;
      discount: number;
      type: 'percentage' | 'fixed';
    };
  };
  status: "started"|"in_progress"|"served"|"closed"|"cancelled";
  ts: { 
    startedAt: string; 
    servedAt?: string;
    closedAt?: string;
  };
  trust: { 
    ghostHash: string; 
    signature: string;
  }; // GhostLog Lite
  tableId?: string;
  staffAssigned?: {
    foh?: string;
    boh?: string;
  };
}

// Loyalty Event Schema
export type LoyaltyEvent = {
  eventId: string;
  guestId: string;
  loungeId: string;
  type: "EARN"|"REDEEM"|"BADGE_AWARDED"|"REFERRAL_BONUS"|"MIX_SAVED";
  value: number;              // points or token units
  badgeId?: string;
  sessionId?: string;
  description?: string;
  ts: string;
  ghostHash: string;
}

// Referral Link Schema
export type ReferralLink = {
  code: string;               // short id
  connectorId?: string;       // optional partner
  inviterGuestId?: string;    // P2P referrals
  loungeId: string;
  clicks: number; 
  joins: number;
  rewards: number;            // points earned from referrals
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
}

// Badge Definition
export type BadgeDefinition = {
  badgeId: string;
  name: string;
  description: string;
  icon: string;
  category: 'loyalty' | 'exploration' | 'social' | 'achievement';
  requirements: {
    type: 'sessions' | 'lounges' | 'mixes' | 'referrals' | 'points';
    count: number;
    timeframe?: number; // days
    conditions?: Record<string, any>;
  };
  rewards: {
    points: number;
    perks?: string[];
  };
}

// QR Code Data
export type QRData = {
  loungeId: string;
  ref?: string;               // referral code
  s?: string;                 // pre-seeded session
  u?: string;                 // guest token
  tableId?: string;
  zone?: string;
}

// API Request/Response Types
export type GuestEnterRequest = {
  loungeId: string;
  ref?: string;
  u?: string;
  guestId?: string;      // registered guest ID from localStorage
  deviceId?: string;
}

export type GuestEnterResponse = {
  guestId: string;
  sessionId?: string;
  flags: FeatureFlags;
  isNewGuest: boolean;
  existingProfile?: GuestProfile;
}

export type SessionStartRequest = {
  loungeId: string;
  guestId: string;
  tableId?: string;
}

export type SessionStartResponse = {
  sessionId: string;
  tableId?: string;
  estimatedWait?: number;
}

export type MixSaveRequest = {
  sessionId: string;
  flavors: string[];
  notes?: string;
  name?: string;
}

export type MixSaveResponse = {
  ok: boolean;
  mixId?: string;
  suggestions: string[];
}

export type PriceQuoteRequest = {
  sessionId: string;
  promoCode?: string;
}

export type PriceQuoteResponse = {
  base: number;
  addons: number;
  total: number;
  currency: "USD";
  promo?: {
    code: string;
    discount: number;
    type: 'percentage' | 'fixed';
  };
  breakdown: {
    item: string;
    price: number;
  }[];
}

export type CheckoutRequest = {
  sessionId: string;
  method: 'card' | 'cash' | 'points';
  promoCode?: string;
}

export type CheckoutResponse = {
  receiptId: string;
  pointsEarned: number;
  totalPaid: number;
  transactionId?: string;
}

export type RewardsResponse = {
  points: number;
  badges: BadgeDefinition[];
  nextBadge?: BadgeDefinition;
  level: string;
  progress: number; // 0-100
}

export type ReferralCreateRequest = {
  loungeId: string;
  inviterGuestId?: string;
  connectorId?: string;
}

export type ReferralCreateResponse = {
  url: string;
  code: string;
  qrCode: string; // base64 encoded QR image
}

export type EventLogRequest = {
  type: string;
  payload: Record<string, any>;
  sessionId?: string;
  guestId?: string;
}

export type EventLogResponse = {
  ok: boolean;
  ghostHash: string;
  eventId: string;
}

// Feature Flags
export type FeatureFlags = {
  guest: {
    enabled: boolean;
    qrFirst: boolean;
    anonymousMode: boolean;
  };
  rewards: {
    badges: {
      v1: boolean;
    };
    points: boolean;
  };
  referral: {
    qr: {
      v1: boolean;
    };
    p2p: boolean;
    connector: boolean;
  };
  memory: {
    breadcrumbs: {
      v1: boolean;
    };
    timeline: boolean;
  };
  ghostlog: {
    lite: boolean;
    full: boolean;
  };
  pricing: {
    dynamic: boolean;
    promos: boolean;
  };
}

// Lounge Data
export type LoungeData = {
  loungeId: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  features: string[];
  timezone: string;
  currency: string;
  taxRate: number;
  zones: {
    id: string;
    name: string;
    capacity: number;
    premium: boolean;
  }[];
  flavors: {
    id: string;
    name: string;
    category: string;
    price: number;
    popular: boolean;
    available: boolean;
  }[];
}

// Error Types
export type GuestError = {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Analytics Event Types
export type AnalyticsEvent = {
  eventType: 'guest.entered' | 'session.started' | 'mix.selected' | 'price.quoted' | 
            'checkout.completed' | 'rewards.viewed' | 'badge.awarded' | 'referral.created';
  guestId: string;
  loungeId: string;
  sessionId?: string;
  payload: Record<string, any>;
  timestamp: string;
  ghostHash: string;
}
