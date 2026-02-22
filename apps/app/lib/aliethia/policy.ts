import { PrismaClient } from '@prisma/client';
import type { AliethiaPolicy, AliethiaPolicyContext, VenueIdentity } from './types';

const prisma = new PrismaClient();

function parseVenueIdentity(value: unknown): VenueIdentity | null {
  if (value === 'casino_velocity' || value === 'sports_momentum' || value === 'luxury_memory') return value;
  return null;
}

async function resolveVenueIdentity(loungeId: string): Promise<VenueIdentity> {
  // Identity is stable and manually defined per location.
  // We store it in the LoungeConfig JSON as `venue_identity`.
  try {
    const cfg = await prisma.loungeConfig.findFirst({
      where: { loungeId },
      orderBy: { version: 'desc' },
      select: { configData: true },
    });
    const parsed = cfg?.configData ? JSON.parse(cfg.configData) : null;
    const vi = parseVenueIdentity(parsed?.venue_identity);
    if (vi) return vi;
  } catch {
    // ignore and fall back
  }
  // Safe default when not yet manually set.
  return 'sports_momentum';
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
  const venueIdentity = await resolveVenueIdentity(ctx.loungeId);
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

