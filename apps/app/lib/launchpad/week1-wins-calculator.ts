/**
 * Week-1 Wins Calculator
 * 
 * Calculates metrics for Week-1 Wins tracker:
 * - Comped sessions avoided
 * - Add-ons captured
 * - Repeat guests recognized
 * - Time saved per shift
 */

import { prisma } from '../db';
import { Prisma } from '@prisma/client';

export interface WeekOneWinsMetrics {
  daysActive: number;
  compedSessionsAvoided: number;
  addOnsCaptured: number;
  repeatGuestsRecognized: number;
  timeSavedPerShift: number; // minutes
  totalWins: number;
  startDate: Date;
  endDate: Date;
}

/**
 * Calculate Week-1 Wins metrics for a lounge
 */
export async function calculateWeekOneWins(
  loungeId: string,
  startDate?: Date
): Promise<WeekOneWinsMetrics | null> {
  try {
    // Get lounge config to check if Week-1 Wins tracking is enabled
    const loungeConfig = await prisma.loungeConfig.findFirst({
      where: { loungeId },
      orderBy: { version: 'desc' },
    });

    if (!loungeConfig) {
      return null;
    }

    const config = JSON.parse(loungeConfig.configData as string);

    // Determine start date (when lounge was activated or Week-1 Wins started)
    const lounge = await prisma.tenant.findUnique({
      where: { id: loungeId },
      select: { createdAt: true },
    });

    if (!lounge) {
      return null;
    }

    const weekStart = startDate || lounge.createdAt || new Date();
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const now = new Date();
    const daysActive = Math.min(
      Math.ceil((now.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24)),
      7
    );

    // Calculate comped sessions avoided
    // This is sessions that would have been comped but weren't due to comp policy
    const compedSessionsAvoided = await calculateCompedSessionsAvoided(
      loungeId,
      weekStart,
      weekEnd,
      config.comp_policy_enabled
    );

    // Calculate add-ons captured
    // Count sessions with add-ons (flavors, extras, etc.)
    const addOnsCaptured = await calculateAddOnsCaptured(
      loungeId,
      weekStart,
      weekEnd
    );

    // Calculate repeat guests recognized
    // Count unique customers who have multiple sessions
    const repeatGuestsRecognized = await calculateRepeatGuestsRecognized(
      loungeId,
      weekStart,
      weekEnd
    );

    // Calculate time saved per shift
    // Estimate based on session count and average time saved per session
    const timeSavedPerShift = await calculateTimeSavedPerShift(
      loungeId,
      weekStart,
      weekEnd
    );

    // Calculate total wins (weighted score)
    const totalWins =
      compedSessionsAvoided * 10 + // Each avoided comp = $10 value
      addOnsCaptured * 5 + // Each add-on = $5 value
      repeatGuestsRecognized * 3 + // Each repeat guest = $3 value
      timeSavedPerShift * 2; // Each minute saved = $2 value

    return {
      daysActive,
      compedSessionsAvoided,
      addOnsCaptured,
      repeatGuestsRecognized,
      timeSavedPerShift,
      totalWins,
      startDate: weekStart,
      endDate: weekEnd,
    };
  } catch (error) {
    console.error('[Week-1 Wins Calculator] Error:', error);
    return null;
  }
}

/**
 * Calculate comped sessions avoided
 */
async function calculateCompedSessionsAvoided(
  loungeId: string,
  startDate: Date,
  endDate: Date,
  compPolicyEnabled: boolean
): Promise<number> {
  if (!compPolicyEnabled) {
    // If comp policy is disabled, we assume all sessions that could be comped are avoided
    // This is a simplified calculation - in reality, you'd track actual comp requests
    const totalSessions = await prisma.session.count({
      where: {
        tenantId: loungeId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        state: 'CLOSED',
      },
    });

    // Estimate: 5% of sessions would typically be comped without policy
    return Math.floor(totalSessions * 0.05);
  }

  // If comp policy is enabled, count sessions that required approval but weren't comped
  // This would require tracking comp requests in a separate table
  // For now, return 0 as a placeholder
  return 0;
}

/**
 * Calculate add-ons captured
 */
async function calculateAddOnsCaptured(
  loungeId: string,
  startDate: Date,
  endDate: Date
): Promise<number> {
  // Count sessions with add-ons (flavors beyond base, extras, etc.)
  // This is simplified - in reality, you'd track individual add-on items
  const sessionsWithAddOns = await prisma.session.count({
    where: {
      tenantId: loungeId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      // Sessions with flavor mix (indicates add-ons)
      flavorMix: {
        not: Prisma.JsonNull,
      },
    },
  });

  return sessionsWithAddOns;
}

/**
 * Calculate repeat guests recognized
 */
async function calculateRepeatGuestsRecognized(
  loungeId: string,
  startDate: Date,
  endDate: Date
): Promise<number> {
  // Count unique customers with multiple sessions
  const sessions = await prisma.session.findMany({
    where: {
      tenantId: loungeId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      customerRef: {
        not: null,
      },
    },
    select: {
      customerRef: true,
    },
  });

  // Count customers with 2+ sessions
  const customerSessionCounts = new Map<string, number>();
  sessions.forEach((session) => {
    if (session.customerRef) {
      const count = customerSessionCounts.get(session.customerRef) || 0;
      customerSessionCounts.set(session.customerRef, count + 1);
    }
  });

  // Count repeat customers (2+ sessions)
  let repeatGuests = 0;
  customerSessionCounts.forEach((count) => {
    if (count >= 2) {
      repeatGuests++;
    }
  });

  return repeatGuests;
}

/**
 * Calculate time saved per shift
 */
async function calculateTimeSavedPerShift(
  loungeId: string,
  startDate: Date,
  endDate: Date
): Promise<number> {
  // Estimate time saved based on:
  // - Faster checkout (memory reduces lookup time)
  // - Less time on shift handoff (notes carry forward)
  // - Quicker session management

  const totalSessions = await prisma.session.count({
    where: {
      tenantId: loungeId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  // Estimate: 2 minutes saved per session on average
  // (1 min faster checkout + 1 min saved on handoff/management)
  const totalMinutesSaved = totalSessions * 2;

  // Estimate shifts: assume 2 shifts per day, 7 days = 14 shifts
  const estimatedShifts = 14;
  const timeSavedPerShift = Math.floor(totalMinutesSaved / estimatedShifts);

  return timeSavedPerShift;
}

