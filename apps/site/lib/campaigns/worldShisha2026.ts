/**
 * World Shisha 2026 Campaign Configuration
 * 
 * Centralized configuration for the World Shisha Trade Show 2026 virtual engagement campaign
 */

export const WORLD_SHISHA_2026_CONFIG = {
  // Campaign Identification
  campaignId: 'world_shisha_2026',
  campaignName: 'World Shisha Trade Show 2026',
  
  // Campaign Dates
  startDate: new Date('2026-01-01'), // 30 days before show
  endDate: new Date('2026-02-28'), // 30 days after show
  showDates: {
    start: new Date('2026-02-04'),
    end: new Date('2026-02-05')
  },
  
  // Time Zone
  timeZone: 'Asia/Dubai',
  timeZoneOffset: '+04:00',
  
  // Show Location
  location: {
    venue: 'Dubai World Trade Centre',
    city: 'Dubai',
    country: 'United Arab Emirates'
  },
  
  // Conversion Goals
  conversionGoals: {
    landingPageViews: 500,
    briefDownloads: 200,
    pilotPackSignups: 30,
    calendarBookings: 15,
    exhibitorPartnerships: 2,
    qrCodesGenerated: 5
  },
  
  // Target Exhibitors
  targetExhibitors: {
    count: 40, // 40-60 priority companies
    categories: [
      'premium_tobacco_flavor_brands',
      'charcoal_brands',
      'lounge_furniture_design',
      'hardware_companies',
      'distributors'
    ]
  },
  
  // Campaign URLs
  urls: {
    landing: '/world-shisha-2026',
    brief: '/world-shisha-2026/brief',
    pilotPack: '/world-shisha-2026/pilot-pack',
    qrGenerator: '/world-shisha-2026/qr-generator'
  },
  
  // Email Configuration
  email: {
    primaryRecipient: 'hookahplusconnector@gmail.com',
    fallbackRecipient: 'clark.dwayne@gmail.com',
    fromEmail: 'Hookah+ <noreply@hookahplus.net>'
  },
  
  // Analytics Configuration
  analytics: {
    campaignId: 'world_shisha_2026',
    conversionFunnel: [
      { step: 1, name: 'Landing Page View', targetRate: 100 },
      { step: 2, name: 'Video Play', targetRate: 30 },
      { step: 3, name: 'Brief Download', targetRate: 20 },
      { step: 4, name: 'Pilot Pack Signup', targetRate: 15 },
      { step: 5, name: 'Calendar Booking', targetRate: 50 }
    ]
  },
  
  // Pilot Pack Offer Details
  pilotPack: {
    duration: 60, // days
    included: [
      '1 lounge location setup',
      'Session tracking + flavor analytics',
      'Basic loyalty tracking',
      'QR code setup & integration'
    ],
    targetAudience: [
      'Lounge owners exploring operations tech',
      'Distributors evaluating partner solutions',
      'Exhibitors looking to add value to their booths'
    ]
  },
  
  // Outreach Sequence
  outreachSequence: {
    step1: {
      name: 'Initial Email/LinkedIn',
      eventName: 'exhibitor_outreach_step_1',
      timing: '90-60 days before show'
    },
    step2: {
      name: 'Follow-up with Mock Dashboard',
      eventName: 'exhibitor_outreach_step_2',
      timing: '60-30 days before show'
    },
    step3: {
      name: 'Featured Partner Offer',
      eventName: 'exhibitor_outreach_step_3',
      timing: '30 days before show'
    }
  }
};

/**
 * Check if campaign is currently active
 */
export function isCampaignActive(): boolean {
  const now = new Date();
  return now >= WORLD_SHISHA_2026_CONFIG.startDate && now <= WORLD_SHISHA_2026_CONFIG.endDate;
}

/**
 * Check if show is currently happening
 */
export function isShowActive(): boolean {
  const now = new Date();
  return now >= WORLD_SHISHA_2026_CONFIG.showDates.start && now <= WORLD_SHISHA_2026_CONFIG.showDates.end;
}

/**
 * Get days until show starts
 */
export function getDaysUntilShow(): number {
  const now = new Date();
  const diff = WORLD_SHISHA_2026_CONFIG.showDates.start.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Get Dubai time
 */
export function getDubaiTime(): string {
  return new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Dubai',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

