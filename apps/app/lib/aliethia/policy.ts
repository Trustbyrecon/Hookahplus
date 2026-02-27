import { PrismaClient } from '@prisma/client';
import type { AliethiaPolicy, AliethiaPolicyContext, VenueIdentity } from './types';
import { isAliethiaEnabledForLounge } from '../env';

const prisma = new PrismaClient();

function parseVenueIdentity(value: unknown): VenueIdentity | null {
  if (value === 'casino_velocity' || value === 'sports_momentum' || value === 'luxury_memory') return value;
  return null;
}

interface LoungeConfigResolved {
  venueIdentity: VenueIdentity;
  softLaunchEnabled: boolean;
}

async function resolveLoungeConfig(loungeId: string): Promise<LoungeConfigResolved> {
  // Fetch venue identity and CODIGO soft launch flag in one query.
  try {
    const cfg = await prisma.loungeConfig.findFirst({
      where: { loungeId },
      orderBy: { version: 'desc' },
      select: { configData: true, softLaunchEnabled: true },
    });
    const parsed = cfg?.configData ? JSON.parse(cfg.configData) : null;
    const venueIdentity = parseVenueIdentity(parsed?.venue_identity) ?? 'sports_momentum';
    const softLaunchEnabled = cfg?.softLaunchEnabled ?? false;
    return { venueIdentity, softLaunchEnabled };
  } catch {
    return { venueIdentity: 'sports_momentum', softLaunchEnabled: false };
  }
}

/** Returns soft launch status for a lounge. Used by staff session console banner. */
export async function getSoftLaunchEnabled(loungeId: string): Promise<boolean> {
  const { softLaunchEnabled } = await resolveLoungeConfig(loungeId);
  return softLaunchEnabled;
}

async function resolveDemandSignal(ctx: AliethiaPolicyContext): Promise<{ activeSessionsLast2h: number; demandLevel: 'low' | 'medium' | 'high' }> {
  const activeSessionsLast2h =
    typeof ctx.activeSessionsLast2h === 'number'
      ? ctx.activeSessionsLast2h
      : await prisma.session.count({
          where: {
            loungeId: ctx.loungeId,
            ...(ctx.tenantId ? { tenantId: ctx.tenantId } : {}),
            state: { in: ['PENDING', 'ACTIVE'] as any },
            createdAt: { gte: new Date(Date.now() - 2 * 60 * 60 * 1000) },
          } as any,
        });

  // Mirror the thresholds used by dynamic pricing (`apps/app/lib/pricing/dynamic.ts`).
  const demandLevel = activeSessionsLast2h >= 10 ? 'high' : activeSessionsLast2h >= 5 ? 'medium' : 'low';
  return { activeSessionsLast2h, demandLevel };
}

export async function getAliethiaPolicy(ctx: AliethiaPolicyContext): Promise<AliethiaPolicy> {
  // Cost/rollout control: default to baseline/manual mode unless explicitly enabled for this lounge.
  if (!isAliethiaEnabledForLounge(ctx.loungeId)) {
    return {
      venueIdentity: 'sports_momentum',
      tone: 'timely_minimal',
      surfacesEnabled: {
        upsell_strip: false,
        vip_banner: false,
        soft_confirm: false,
        one_tap_confirm: false,
        timed_assist_prompts: false,
        batch_session_view: true,
        memory_confidence_score: false,
      },
      upsell: {
        enabled: false,
        minMinutesBetweenPrompts: 999,
        eligibility: {},
      },
      vip: { enabled: false },
      kpis: {
        primaryKpi: 'Baseline Validation',
        guardrailKpis: ['Order accuracy', 'Staff friction'],
        failureMode: 'Over-automation increases confusion or errors.',
        throttleBackRule: 'Keep prompts suppressed until baseline + lift are validated for rollout.',
      },
      throttleBackRecommended: true,
    };
  }

  const { venueIdentity, softLaunchEnabled } = await resolveLoungeConfig(ctx.loungeId);

  // CODIGO Week 1: Soft launch guard — when enabled, disable all optimization/automation surfaces
  // but allow core tracking (session start/end, premium flag, floor tagging, member linking).
  // Remove this block after week 1.
  if (softLaunchEnabled) {
    return {
      venueIdentity,
      tone: 'timely_minimal',
      surfacesEnabled: {
        upsell_strip: false,
        vip_banner: false,
        soft_confirm: false,
        one_tap_confirm: false,
        timed_assist_prompts: false,
        batch_session_view: true,
        memory_confidence_score: false,
      },
      upsell: {
        enabled: false,
        minMinutesBetweenPrompts: 999,
        eligibility: {},
      },
      vip: { enabled: false },
      kpis: {
        primaryKpi: 'Baseline Validation',
        guardrailKpis: ['Order accuracy', 'Staff friction'],
        failureMode: 'Over-automation increases confusion or errors.',
        throttleBackRule: 'Keep prompts suppressed until baseline + lift are validated for rollout.',
      },
      throttleBackRecommended: true,
    };
  }

  const { demandLevel } = await resolveDemandSignal(ctx);

  // Defaults are intentionally conservative; call sites must still respect guardrails.
  if (venueIdentity === 'casino_velocity') {
    return {
      venueIdentity,
      tone: 'concise_tactical',
      surfacesEnabled: {
        upsell_strip: true,
        vip_banner: false,
        soft_confirm: false,
        one_tap_confirm: true,
        timed_assist_prompts: false,
        batch_session_view: true,
        memory_confidence_score: false,
      },
      upsell: {
        enabled: true,
        minMinutesBetweenPrompts: demandLevel === 'high' ? 8 : 6,
        eligibility: {
          minTrustScore0to100: 55,
          minSessionAgeMinutes: 5,
          maxSessionAgeMinutes: 120,
        },
      },
      vip: {
        enabled: false,
      },
      kpis: {
        primaryKpi: 'Session Setup Time (SST)',
        guardrailKpis: ['Order modification rate', 'Add-on reversal rate', 'Order accuracy'],
        failureMode: 'Staff prompt overload increases errors or reversals.',
        throttleBackRule: 'If guardrail KPI worsens by >15% over baseline for two consecutive peak windows, reduce cadence by 50% and suppress upsells temporarily.',
      },
      throttleBackRecommended: false,
    };
  }

  if (venueIdentity === 'luxury_memory') {
    return {
      venueIdentity,
      tone: 'discreet_precise',
      surfacesEnabled: {
        upsell_strip: false,
        vip_banner: true,
        soft_confirm: true,
        one_tap_confirm: false,
        timed_assist_prompts: false,
        batch_session_view: false,
        memory_confidence_score: true,
      },
      upsell: {
        enabled: true,
        minMinutesBetweenPrompts: 12,
        eligibility: {
          allowedTiers: ['gold', 'platinum'],
          minTrustScore0to100: 75,
          minSessionAgeMinutes: 10,
          maxSessionAgeMinutes: 180,
        },
      },
      vip: {
        enabled: true,
        // Suggestion only. Actual tier thresholds should be sourced from `LoyaltyTier` rows.
        suggestedTierThresholds: {
          silver: 800,
          gold: 2000,
          platinum: 5000,
        },
      },
      kpis: {
        primaryKpi: 'VIP Return Velocity',
        guardrailKpis: ['Profile correction rate', 'Over-personalization friction'],
        failureMode: 'Overconfident memory creates correction friction and damages trust.',
        throttleBackRule: 'If guardrail KPI worsens by >15% over baseline for two consecutive peak windows, reduce cadence by 50% and suppress upsells temporarily.',
      },
      throttleBackRecommended: false,
    };
  }

  // sports_momentum (default)
  return {
    venueIdentity: 'sports_momentum',
    tone: 'timely_minimal',
    surfacesEnabled: {
      upsell_strip: true,
      vip_banner: false,
      soft_confirm: false,
      one_tap_confirm: false,
      timed_assist_prompts: true,
      batch_session_view: true,
      memory_confidence_score: false,
    },
    upsell: {
      enabled: true,
      minMinutesBetweenPrompts: demandLevel === 'high' ? 10 : 7,
      eligibility: {
        minTrustScore0to100: 60,
        minSessionAgeMinutes: 8,
        maxSessionAgeMinutes: 150,
      },
    },
    vip: {
      enabled: false,
    },
    kpis: {
      primaryKpi: 'Halftime Refill Conversion Rate (HRCR)',
      guardrailKpis: ['Repeat velocity stability', 'Voluntary add-ons', 'Staff friction'],
      failureMode: 'Prompts mistimed with peak windows increase staff friction.',
      throttleBackRule: 'If guardrail KPI worsens by >15% over baseline for two consecutive peak windows, reduce cadence by 50% and suppress upsells temporarily.',
    },
    throttleBackRecommended: false,
  };
}

