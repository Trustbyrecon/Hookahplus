/**
 * Campaign Tracking Utility
 * 
 * Advanced tracking for World Shisha 2026 and other campaigns
 * Includes conversion funnels, source attribution, and exhibitor tracking
 */

import { trackConversion } from './conversionTracking';
import { trackCTA } from './ctaTracking';

export interface CampaignEvent {
  eventName: string;
  eventCategory: 'campaign' | 'engagement' | 'conversion' | 'attribution';
  eventLabel: string;
  value?: number;
  metadata?: Record<string, any>;
}

export interface CampaignFunnelStep {
  step: number;
  stepName: string;
  eventName: string;
  targetConversionRate?: number;
}

export interface ExhibitorAttribution {
  exhibitorName?: string;
  boothNumber?: string;
  referralCode?: string;
  source?: string;
}

/**
 * World Shisha 2026 Campaign Configuration
 */
export const WORLD_SHISHA_2026_CAMPAIGN = {
  campaignId: 'world_shisha_2026',
  startDate: '2026-01-01',
  endDate: '2026-02-28',
  showDates: {
    start: '2026-02-04',
    end: '2026-02-05'
  },
  timeZone: 'Asia/Dubai',
  conversionGoals: {
    briefDownloads: 200,
    pilotPackSignups: 30,
    calendarBookings: 15,
    exhibitorPartnerships: 2
  }
};

/**
 * World Shisha 2026 Conversion Funnel
 */
export const WORLD_SHISHA_2026_FUNNEL: CampaignFunnelStep[] = [
  {
    step: 1,
    stepName: 'Landing Page View',
    eventName: 'world_shisha_2026_landing_view',
    targetConversionRate: 100 // Baseline
  },
  {
    step: 2,
    stepName: 'Video Play',
    eventName: 'world_shisha_2026_video_play',
    targetConversionRate: 30 // 30% of views should play video
  },
  {
    step: 3,
    stepName: 'Brief Download',
    eventName: 'world_shisha_2026_brief_download',
    targetConversionRate: 20 // 20% of video plays should download brief
  },
  {
    step: 4,
    stepName: 'Pilot Pack Signup',
    eventName: 'world_shisha_2026_pilot_pack_signup',
    targetConversionRate: 15 // 15% of brief downloads should sign up
  },
  {
    step: 5,
    stepName: 'Calendar Booking',
    eventName: 'world_shisha_2026_calendar_booked',
    targetConversionRate: 50 // 50% of signups should book calendar
  }
];

/**
 * Track campaign page view
 */
export function trackCampaignPageView(campaignId: string, page: string, metadata?: Record<string, any>) {
  trackConversion({
    eventName: `${campaignId}_${page}_view`,
    eventCategory: 'campaign',
    eventLabel: page,
    metadata: {
      campaign: campaignId,
      page,
      timestamp: new Date().toISOString(),
      ...metadata
    }
  });
}

/**
 * Track campaign engagement event
 */
export function trackCampaignEngagement(
  campaignId: string,
  engagementType: 'video_play' | 'video_complete' | 'calendar_click' | 'calendar_booked' | 'qr_generated',
  metadata?: Record<string, any>
) {
  trackConversion({
    eventName: `${campaignId}_${engagementType}`,
    eventCategory: 'engagement',
    eventLabel: engagementType,
    metadata: {
      campaign: campaignId,
      engagementType,
      timestamp: new Date().toISOString(),
      ...metadata
    }
  });
}

/**
 * Track campaign conversion event
 */
export function trackCampaignConversion(
  campaignId: string,
  conversionType: 'brief_download' | 'pilot_pack_signup' | 'lead_capture',
  metadata?: Record<string, any>
) {
  trackConversion({
    eventName: `${campaignId}_${conversionType}`,
    eventCategory: 'conversion',
    eventLabel: conversionType,
    value: 1,
    metadata: {
      campaign: campaignId,
      conversionType,
      timestamp: new Date().toISOString(),
      ...metadata
    }
  });
}

/**
 * Track exhibitor attribution
 */
export function trackExhibitorAttribution(
  campaignId: string,
  attribution: ExhibitorAttribution,
  eventType: 'referral' | 'booth_scan' | 'qr_generated'
) {
  trackConversion({
    eventName: `${campaignId}_exhibitor_${eventType}`,
    eventCategory: 'attribution',
    eventLabel: attribution.exhibitorName || 'unknown',
    metadata: {
      campaign: campaignId,
      eventType,
      exhibitorName: attribution.exhibitorName,
      boothNumber: attribution.boothNumber,
      referralCode: attribution.referralCode,
      source: attribution.source,
      timestamp: new Date().toISOString()
    }
  });
}

/**
 * Track conversion funnel step
 */
export function trackFunnelStep(
  campaignId: string,
  step: number,
  stepName: string,
  metadata?: Record<string, any>
) {
  trackConversion({
    eventName: `${campaignId}_funnel_step_${step}`,
    eventCategory: 'conversion',
    eventLabel: stepName,
    value: step,
    metadata: {
      campaign: campaignId,
      step,
      stepName,
      timestamp: new Date().toISOString(),
      ...metadata
    }
  });
}

/**
 * World Shisha 2026 specific tracking helpers
 */
export const WorldShisha2026Tracking = {
  trackLandingView: (metadata?: Record<string, any>) => {
    trackCampaignPageView('world_shisha_2026', 'landing', metadata);
  },

  trackBriefView: (metadata?: Record<string, any>) => {
    trackCampaignPageView('world_shisha_2026', 'brief', metadata);
  },

  trackPilotPackView: (metadata?: Record<string, any>) => {
    trackCampaignPageView('world_shisha_2026', 'pilot_pack', metadata);
  },

  trackVideoPlay: (metadata?: Record<string, any>) => {
    trackCampaignEngagement('world_shisha_2026', 'video_play', metadata);
  },

  trackVideoComplete: (metadata?: Record<string, any>) => {
    trackCampaignEngagement('world_shisha_2026', 'video_complete', metadata);
  },

  trackCalendarClick: (metadata?: Record<string, any>) => {
    trackCampaignEngagement('world_shisha_2026', 'calendar_click', metadata);
  },

  trackCalendarBooked: (metadata?: Record<string, any>) => {
    trackCampaignEngagement('world_shisha_2026', 'calendar_booked', metadata);
  },

  trackBriefDownload: (attribution?: ExhibitorAttribution) => {
    trackCampaignConversion('world_shisha_2026', 'brief_download', {
      exhibitor: attribution?.exhibitorName,
      referralCode: attribution?.referralCode
    });
  },

  trackPilotPackSignup: (attribution?: ExhibitorAttribution) => {
    trackCampaignConversion('world_shisha_2026', 'pilot_pack_signup', {
      exhibitor: attribution?.exhibitorName,
      referralCode: attribution?.referralCode
    });
  },

  trackQRGenerated: (attribution: ExhibitorAttribution) => {
    trackCampaignEngagement('world_shisha_2026', 'qr_generated', {
      exhibitorName: attribution.exhibitorName,
      boothNumber: attribution.boothNumber
    });
    trackExhibitorAttribution('world_shisha_2026', attribution, 'qr_generated');
  },

  trackExhibitorReferral: (attribution: ExhibitorAttribution) => {
    trackExhibitorAttribution('world_shisha_2026', attribution, 'referral');
  },

  trackBoothScan: (attribution: ExhibitorAttribution) => {
    trackExhibitorAttribution('world_shisha_2026', attribution, 'booth_scan');
  }
};

