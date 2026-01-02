/**
 * LaunchPad Session Manager
 * 
 * Handles anonymous setup session creation, loading, and progress saving
 */

import { prisma } from '../db';
import { LaunchPadProgress, SetupSessionResponse } from '../../types/launchpad';
import { randomBytes } from 'crypto';

const SESSION_EXPIRY_DAYS = 7;

/**
 * Generate a secure random token for setup session
 */
function generateToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Calculate expiration date (7 days from now)
 */
function calculateExpiration(): Date {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);
  return expiresAt;
}

/**
 * Create a new anonymous setup session
 */
export async function createSetupSession(
  source: 'manychat' | 'web' | 'direct' = 'web',
  prefillData?: any
): Promise<SetupSessionResponse> {
  const token = generateToken();
  const expiresAt = calculateExpiration();

  const initialProgress: LaunchPadProgress = {
    currentStep: 1,
    completedSteps: [],
    data: {},
    sessionToken: token,
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
  };

  // If prefill data exists (from ManyChat), merge it into progress
  if (prefillData) {
    if (prefillData.lounge_name) {
      initialProgress.data.step1 = {
        loungeName: prefillData.lounge_name,
        operatingHours: {},
        tablesCount: parseInt(prefillData.seats_tables || '0', 10),
        baseSessionPrice: 0, // Will be set in step 1
        primaryGoal: 'all_above',
      };
    }
    if (prefillData.top_5_flavors) {
      const flavors = prefillData.top_5_flavors.split(',').map((f: string) => ({
        name: f.trim(),
        premium: false,
      }));
      initialProgress.data.step2 = {
        topFlavors: flavors,
      };
    }
  }

  const setupSession = await prisma.setupSession.create({
    data: {
      token,
      progress: initialProgress as any,
      expiresAt,
      source,
      prefillData: prefillData ? (prefillData as any) : null,
      manychatUserId: prefillData?.subscriber_id || null,
      instagramHandle: prefillData?.instagram_username || null,
    },
  });

  return {
    token: setupSession.token,
    expiresAt: setupSession.expiresAt.toISOString(),
    progress: setupSession.progress as LaunchPadProgress,
  };
}

/**
 * Load an existing setup session by token
 */
export async function loadSetupSession(
  token: string
): Promise<LaunchPadProgress | null> {
  const setupSession = await prisma.setupSession.findUnique({
    where: { token },
  });

  if (!setupSession) {
    return null;
  }

  // Check if session is expired
  if (new Date() > setupSession.expiresAt) {
    return null;
  }

  return setupSession.progress as LaunchPadProgress;
}

/**
 * Save progress for a setup session
 */
export async function saveProgress(
  token: string,
  step: number,
  data: Partial<LaunchPadProgress['data']>
): Promise<void> {
  const existing = await prisma.setupSession.findUnique({
    where: { token },
  });

  if (!existing) {
    throw new Error('Setup session not found');
  }

  if (new Date() > existing.expiresAt) {
    throw new Error('Setup session has expired');
  }

  const currentProgress = existing.progress as LaunchPadProgress;
  const updatedProgress: LaunchPadProgress = {
    ...currentProgress,
    currentStep: step + 1, // Move to next step
    completedSteps: [...new Set([...currentProgress.completedSteps, step])],
    data: {
      ...currentProgress.data,
      ...data,
    },
    lastUpdated: new Date().toISOString(),
  };

  // Extend expiration on each save (reset to 7 days)
  const expiresAt = calculateExpiration();

  await prisma.setupSession.update({
    where: { token },
    data: {
      progress: updatedProgress as any,
      expiresAt,
      updatedAt: new Date(),
    },
  });
}

/**
 * Link setup session to a user and lounge at Go Live
 */
export async function linkSetupSessionToLounge(
  token: string,
  userId: string,
  loungeId: string
): Promise<void> {
  await prisma.setupSession.update({
    where: { token },
    data: {
      userId,
      loungeId,
    },
  });
}

/**
 * Get setup session by lounge ID (for post-activation lookups)
 */
export async function getSetupSessionByLoungeId(
  loungeId: string
): Promise<LaunchPadProgress | null> {
  const setupSession = await prisma.setupSession.findUnique({
    where: { loungeId },
  });

  if (!setupSession) {
    return null;
  }

  return setupSession.progress as LaunchPadProgress;
}

