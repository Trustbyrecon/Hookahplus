/**
 * LaunchPad Session Manager
 * 
 * Handles anonymous setup session creation, loading, and progress saving
 * Implements state machine: draft → in_progress → completed → activated
 */

import { prisma } from '../db';
import { LaunchPadProgress, SetupSessionResponse } from '../../types/launchpad';
import { randomBytes } from 'crypto';

const SESSION_EXPIRY_DAYS = 7;
const ABANDONMENT_DAYS = 7;

type SetupSessionStatus = 'draft' | 'in_progress' | 'completed' | 'activated' | 'expired' | 'abandoned';

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
 * Generate setup link from token
 */
function generateSetupLink(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.hookahplus.net';
  return `${baseUrl}/launchpad?token=${token}`;
}

/**
 * Auto-create Soft Lead when SetupSession is created
 */
async function createSoftLead(
  setupSessionId: string,
  source: string,
  prefillData?: any
): Promise<string | null> {
  try {
    // Extract minimal identity
    const identifier = prefillData?.subscriber_id || 
                      prefillData?.instagram_username || 
                      `session_${setupSessionId}`;
    
    const leadPayload = {
      lead_status: 'warm_draft',
      lead_type: 'soft',
      setup_session_id: setupSessionId,
      source: source,
      explicit_submission: false,
      identifier: identifier,
      created_at: new Date().toISOString(),
    };

    // Create ReflexEvent as Lead
    const lead = await prisma.reflexEvent.create({
      data: {
        type: 'lead',
        source: source,
        payload: JSON.stringify(leadPayload),
        metadata: JSON.stringify({
          setup_session_id: setupSessionId,
          auto_created: true,
        }),
      },
    });

    return lead.id;
  } catch (error) {
    console.error('[Session Manager] Error creating soft lead:', error);
    // Don't fail session creation if lead creation fails
    return null;
  }
}

/**
 * Create a new anonymous setup session (auto-created on LaunchPad entry)
 */
export async function createSetupSession(
  source: 'manychat' | 'web' | 'direct' | 'stripe' = 'web',
  prefillData?: any
): Promise<SetupSessionResponse> {
  const token = generateToken();
  const expiresAt = calculateExpiration();
  const setupLink = generateSetupLink(token);
  const now = new Date();

  const initialProgress: LaunchPadProgress = {
    currentStep: 1,
    completedSteps: [],
    data: {},
    sessionToken: token,
    createdAt: now.toISOString(),
    lastUpdated: now.toISOString(),
  };

  // If prefill data exists (from ManyChat), merge it into progress
  if (prefillData) {
    if (prefillData.lounge_name) {
      initialProgress.data.step1 = {
        loungeName: prefillData.lounge_name,
        operatorType: prefillData.operator_type === 'mobile' ? 'mobile' : 'brick_and_mortar', // Default to brick-and-mortar
        operatingHours: prefillData.operator_type === 'mobile' ? undefined : {}, // No hours for mobile
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

    // Optional prefill: POS + session rules when known (keeps onboarding short).
    if (prefillData.pos_used) {
      const pos = String(prefillData.pos_used).trim().toLowerCase();
      const allowed = new Set(['square', 'clover', 'toast', 'stripe', 'other', 'none']);
      initialProgress.data.step5 = {
        usageMode: 'alongside',
        posType: (allowed.has(pos) ? pos : 'none') as any,
      };
    }

    if (prefillData.session_type) {
      const raw = String(prefillData.session_type).toLowerCase();
      const sessionType = raw.includes('tim') ? 'timed' : 'flat';
      initialProgress.data.step3 = {
        sessionType: sessionType as any,
        gracePeriodMinutes: 5,
        extensionPolicy: sessionType === 'flat' ? 'na' : 'manual',
        compPolicyEnabled: false,
      };
    }

    // Stripe provisioning marker (kept separate from step payloads)
    if (prefillData.tier || prefillData.stripe_checkout_session_id) {
      initialProgress.data.billing = {
        tier: prefillData.tier,
        stripeCheckoutSessionId: prefillData.stripe_checkout_session_id,
        stripeCustomerId: prefillData.stripe_customer_id,
        stripeSubscriptionId: prefillData.stripe_subscription_id,
      };
    }
  }

  try {
    // Create SetupSession with status = 'draft' (graceful fallback if status field doesn't exist)
    let setupSession;
    try {
      setupSession = await (prisma as any).setupSession.create({
        data: {
          token,
          setupLink,
          status: 'draft',
          progress: initialProgress as any,
          expiresAt,
          source,
          multiLocationEnabled: Boolean(initialProgress?.data?.step1 && (initialProgress.data as any).step1.multiLocationEnabled),
          locationDrafts: ((initialProgress.data as any).step1?.locations || null) as any,
          prefillData: prefillData ? (prefillData as any) : null,
          manychatUserId: prefillData?.subscriber_id || null,
          instagramHandle: prefillData?.instagram_username || null,
          lastActivityAt: now,
        },
      });
    } catch (createError: any) {
      // Graceful fallback: status field may not exist if migration hasn't run
      if (
        createError?.message?.includes('Unknown argument `status`') ||
        createError?.message?.includes('Unknown argument `multiLocationEnabled`') ||
        createError?.message?.includes('Unknown argument `locationDrafts`') ||
        createError?.code === 'P2025'
      ) {
        console.warn('[Session Manager] Status field not available, creating without status field');
        setupSession = await (prisma as any).setupSession.create({
          data: {
            token,
            setupLink,
            progress: initialProgress as any,
            expiresAt,
            source,
            prefillData: prefillData ? (prefillData as any) : null,
            manychatUserId: prefillData?.subscriber_id || null,
            instagramHandle: prefillData?.instagram_username || null,
            lastActivityAt: now,
          },
        });
      } else {
        throw createError;
      }
    }

    // Auto-create Soft Lead
    const leadId = await createSoftLead(setupSession.id, source, prefillData);
    if (leadId) {
      // Link lead to session
      await prisma.setupSession.update({
        where: { id: setupSession.id },
        data: { leadId },
      });
    }

    return {
      token: setupSession.token,
      setupLink: setupSession.setupLink || setupLink,
      expiresAt: setupSession.expiresAt.toISOString(),
      progress: setupSession.progress as unknown as LaunchPadProgress,
    };
  } catch (error: any) {
    // Check if it's a Prisma schema error (table doesn't exist)
    if (error.code === 'P2001' || 
        error.code === 'P2025' ||
        error.message?.includes('does not exist') || 
        error.message?.includes('relation') || 
        error.message?.includes('table') ||
        error.message?.includes('Unknown model')) {
      throw new Error('Database migration required. Please run: npx prisma migrate dev --name add_setup_session');
    }
    throw error;
  }

}

/**
 * Check and update session status (expiration, abandonment)
 */
async function checkAndUpdateStatus(setupSession: any): Promise<SetupSessionStatus> {
  const now = new Date();
  // Graceful fallback: status field may not exist if migration hasn't run
  const status = (setupSession.status || 'draft') as SetupSessionStatus;

  // Check expiration
  if (now > setupSession.expiresAt) {
    if (status !== 'expired' && status !== 'activated') {
      try {
        await prisma.setupSession.update({
          where: { id: setupSession.id },
          data: { status: 'expired' },
        });
      } catch (error: any) {
        // Graceful fallback: status field may not exist
        if (error?.message?.includes('Unknown argument `status`')) {
          console.warn('[Session Manager] Status field not available, skipping status update');
        } else {
          throw error;
        }
      }
      return 'expired';
    }
    return 'expired';
  }

  // Check abandonment (only for in_progress)
  if (status === 'in_progress' && setupSession.lastActivityAt) {
    const daysSinceActivity = (now.getTime() - setupSession.lastActivityAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceActivity > ABANDONMENT_DAYS) {
      try {
        await prisma.setupSession.update({
          where: { id: setupSession.id },
          data: { status: 'abandoned' },
        });
      } catch (error: any) {
        // Graceful fallback: status field may not exist
        if (error?.message?.includes('Unknown argument `status`')) {
          console.warn('[Session Manager] Status field not available, skipping status update');
        } else {
          throw error;
        }
      }
      return 'abandoned';
    }
  }

  return status;
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

  // Check and update status
  const status = await checkAndUpdateStatus(setupSession);
  
  // Don't allow loading expired sessions (except for admin)
  if (status === 'expired') {
    return null;
  }

  return setupSession.progress as unknown as LaunchPadProgress;
}

/**
 * Update Lead status when SetupSession transitions
 */
async function updateLeadStatus(
  leadId: string | null,
  newStatus: 'qualified' | 'activated' | 'converted'
): Promise<void> {
  if (!leadId) return;

  try {
    const lead = await prisma.reflexEvent.findUnique({
      where: { id: leadId },
    });

    if (!lead) return;

    const payload = JSON.parse(lead.payload || '{}');
    payload.lead_status = newStatus;
    
    if (newStatus === 'qualified') {
      payload.explicit_submission = true;
      payload.submitted_at = new Date().toISOString();
    } else if (newStatus === 'activated') {
      payload.activated_at = new Date().toISOString();
    } else if (newStatus === 'converted') {
      payload.converted_at = new Date().toISOString();
    }

    await prisma.reflexEvent.update({
      where: { id: leadId },
      data: {
        payload: JSON.stringify(payload),
      },
    });
  } catch (error) {
    console.error('[Session Manager] Error updating lead status:', error);
  }
}

/**
 * Save progress for a setup session (handles state transitions)
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

  // Check expiration
  const status = await checkAndUpdateStatus(existing);
  if (status === 'expired') {
    throw new Error('Setup session has expired');
  }

  const currentProgress = existing.progress as unknown as LaunchPadProgress;
  const updatedProgress: LaunchPadProgress = {
    ...currentProgress,
    currentStep: step + 1, // Move to next step
    completedSteps: Array.from(new Set([...currentProgress.completedSteps, step])),
    data: {
      ...currentProgress.data,
      ...data,
    },
    lastUpdated: new Date().toISOString(),
  };

  // Determine new status based on progress
  // Graceful fallback: status field may not exist if migration hasn't run
  let newStatus: SetupSessionStatus = (existing.status || 'draft') as SetupSessionStatus;
  
  // Transition: draft → in_progress (when Step 1 completed)
  if (step === 1 && newStatus === 'draft') {
    newStatus = 'in_progress';
  }
  
  // Transition: in_progress → completed (when Step 6 reached)
  if (step === 6 && (newStatus === 'in_progress' || newStatus === 'completed')) {
    newStatus = 'completed';
    // Convert Soft Lead → Hard Lead (qualified)
    await updateLeadStatus(existing.leadId, 'qualified');
  }

  // Extend expiration on each save (reset to 7 days)
  const expiresAt = calculateExpiration();
  const now = new Date();
  const step1Data: any = updatedProgress?.data?.step1 || {};
  const multiLocationEnabled = Boolean(step1Data?.multiLocationEnabled);
  const locationDrafts = Array.isArray(step1Data?.locations) ? step1Data.locations : null;
  const organizationName = typeof step1Data?.organizationName === 'string' ? step1Data.organizationName.trim() : '';
  const organizationSlug = organizationName
    ? organizationName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    : null;

  // Graceful fallback: status field may not exist if migration hasn't run
  try {
    await (prisma as any).setupSession.update({
      where: { token },
      data: {
        progress: updatedProgress as any,
        status: newStatus,
        multiLocationEnabled,
        locationDrafts: locationDrafts as any,
        organizationSlug,
        expiresAt,
        lastActivityAt: now,
        updatedAt: now,
      },
    });
  } catch (error: any) {
    // If status field doesn't exist, update without it (graceful degradation)
    if (
      error?.message?.includes('Unknown argument `status`') ||
      error?.message?.includes('Unknown argument `multiLocationEnabled`') ||
      error?.message?.includes('Unknown argument `locationDrafts`') ||
      error?.message?.includes('Unknown argument `organizationSlug`') ||
      error?.code === 'P2025'
    ) {
      console.warn('[Session Manager] Status field not available, updating without status field');
      await (prisma as any).setupSession.update({
        where: { token },
        data: {
          progress: updatedProgress as any,
          expiresAt,
          lastActivityAt: now,
          updatedAt: now,
        },
      });
    } else {
      throw error;
    }
  }
}

/**
 * Link setup session to a user and lounge at Go Live (transition to activated)
 */
export async function linkSetupSessionToLounge(
  token: string,
  userId: string,
  loungeId: string,
  loungeIds?: string[],
  organizationId?: string | null
): Promise<void> {
  const setupSession = await prisma.setupSession.findUnique({
    where: { token },
  });

  if (!setupSession) {
    throw new Error('Setup session not found');
  }

  // Transition: completed → activated
  // Graceful fallback: status field may not exist if migration hasn't run
  try {
    await (prisma as any).setupSession.update({
      where: { token },
      data: {
        userId,
        loungeId,
        organizationId: organizationId || null,
        activatedLoungeIds: Array.isArray(loungeIds) && loungeIds.length ? loungeIds : [loungeId],
        status: 'activated',
        updatedAt: new Date(),
      },
    });
  } catch (error: any) {
    // If status field doesn't exist, update without it (graceful degradation)
    if (
      error?.message?.includes('Unknown argument `status`') ||
      error?.message?.includes('Unknown argument `organizationId`') ||
      error?.message?.includes('Unknown argument `activatedLoungeIds`') ||
      error?.code === 'P2025'
    ) {
      console.warn('[Session Manager] Status field not available, updating without status field');
      await (prisma as any).setupSession.update({
        where: { token },
        data: {
          userId,
          loungeId,
          updatedAt: new Date(),
        },
      });
    } else {
      throw error;
    }
  }

  // Update Lead status to activated
  await updateLeadStatus(setupSession.leadId, 'activated');
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

  return setupSession.progress as unknown as LaunchPadProgress;
}

