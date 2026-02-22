export type VenueIdentity = 'casino_velocity' | 'sports_momentum' | 'luxury_memory';

export type AliethiaSurface =
  | 'upsell_strip'
  | 'vip_banner'
  | 'soft_confirm'
  | 'one_tap_confirm'
  | 'timed_assist_prompts'
  | 'batch_session_view'
  | 'memory_confidence_score';

export interface AliethiaPolicyContext {
  loungeId: string;
  sessionId?: string;
  tenantId?: string | null;
  now?: Date;
  /**
   * Optional: if the caller already computed demand, pass it in.
   * Otherwise policy evaluation will best-effort compute it.
   */
  activeSessionsLast2h?: number;
  /**
   * Optional: guest trust / tier signals (best-effort).
   */
  loyaltyTier?: 'bronze' | 'silver' | 'gold' | 'platinum' | null;
  trustScore0to100?: number | null;
}

export interface AliethiaKpiFrame {
  primaryKpi: string;
  guardrailKpis: string[];
  failureMode: string;
  throttleBackRule: string;
}

export interface AliethiaUpsellPolicy {
  enabled: boolean;
  /**
   * Cooldown between prompt surfaces firing.
   */
  minMinutesBetweenPrompts: number;
  /**
   * Gateupsell by trust tier and/or session timing.
   */
  eligibility: {
    minTrustScore0to100?: number;
    allowedTiers?: Array<'bronze' | 'silver' | 'gold' | 'platinum'>;
    minSessionAgeMinutes?: number;
    maxSessionAgeMinutes?: number;
  };
}

export interface AliethiaVipPolicy {
  enabled: boolean;
  /**
   * These are *recommendations* for thresholds; actual tiering may be DB-driven.
   */
  suggestedTierThresholds?: Partial<Record<'silver' | 'gold' | 'platinum', number>>;
}

export interface AliethiaPolicy {
  venueIdentity: VenueIdentity;
  surfacesEnabled: Record<AliethiaSurface, boolean>;
  upsell: AliethiaUpsellPolicy;
  vip: AliethiaVipPolicy;
  tone: 'concise_tactical' | 'timely_minimal' | 'discreet_precise';
  kpis: AliethiaKpiFrame;
  /**
   * When true, policy advises suppressing non-essential prompts/upsells.
   * This is a read-only signal; enforcement happens at call sites.
   */
  throttleBackRecommended: boolean;
}

