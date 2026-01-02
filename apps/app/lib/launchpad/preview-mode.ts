/**
 * Preview Mode System
 * 
 * Handles preview vs live mode for lounges:
 * - Preview: Lounge created but not activated (no subscription)
 * - Live: Lounge activated with active subscription
 */

import { prisma } from '../db';
import { checkSubscriptionStatus, verifySubscriptionForActivation } from './subscription-check';

export type LaunchPadMode = 'preview' | 'live';

export interface LoungeModeStatus {
  mode: LaunchPadMode;
  activatedAt: Date | null;
  canActivate: boolean;
  message: string;
  subscriptionStatus?: {
    active: boolean;
    plan?: string;
    trialDaysRemaining?: number;
  };
}

/**
 * Get lounge mode status
 */
export async function getLoungeModeStatus(
  loungeId: string
): Promise<LoungeModeStatus | null> {
  try {
    const lounge = await prisma.tenant.findUnique({
      where: { id: loungeId },
      select: {
        id: true,
        createdAt: true,
      },
    });

    if (!lounge) {
      return null;
    }

    // Check subscription status
    const subscriptionStatus = await checkSubscriptionStatus(loungeId);

    // Check if lounge has active subscription
    const hasActiveSubscription = subscriptionStatus.active;

    if (hasActiveSubscription) {
      return {
        mode: 'live',
        activatedAt: lounge.createdAt || new Date(),
        canActivate: false,
        message: 'Lounge is live and active',
        subscriptionStatus: {
          active: true,
          plan: subscriptionStatus.plan,
          trialDaysRemaining: subscriptionStatus.trialDaysRemaining,
        },
      };
    }

    return {
      mode: 'preview',
      activatedAt: null,
      canActivate: subscriptionStatus.canActivate,
      message: subscriptionStatus.trialDaysRemaining
        ? `Lounge is in preview mode. ${subscriptionStatus.trialDaysRemaining} trial days remaining. Activate to go live.`
        : 'Lounge is in preview mode. Activate to go live.',
      subscriptionStatus: {
        active: false,
        plan: subscriptionStatus.plan,
        trialDaysRemaining: subscriptionStatus.trialDaysRemaining,
      },
    };
  } catch (error) {
    console.error('[Preview Mode] Error:', error);
    return null;
  }
}

/**
 * Check if lounge has active subscription
 * TODO: Integrate with actual subscription system
 */
async function checkActiveSubscription(loungeId: string): Promise<boolean> {
  // Placeholder: In production, this would check:
  // - Stripe subscription status
  // - Subscription plan (Starter/Pro/Trust+)
  // - Payment status
  // - Trial status

  // For now, return false (all lounges start in preview mode)
  return false;
}

/**
 * Activate lounge (switch from preview to live)
 */
export async function activateLounge(
  loungeId: string,
  subscriptionId?: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Verify subscription before activation
    const verification = await verifySubscriptionForActivation(loungeId);
    if (!verification.valid) {
      return {
        success: false,
        message: verification.message,
      };
    }

    // Update Tenant with activation timestamp
    // TODO: Add activatedAt and launchpadMode fields to Tenant model
    // For now, we'll use a placeholder
    const lounge = await prisma.tenant.findUnique({
      where: { id: loungeId },
    });

    if (!lounge) {
      return {
        success: false,
        message: 'Lounge not found',
      };
    }

    // TODO: Update Tenant.activatedAt and Tenant.launchpadMode when schema is updated
    // await prisma.tenant.update({
    //   where: { id: loungeId },
    //   data: {
    //     activatedAt: new Date(),
    //     launchpadMode: 'live',
    //   },
    // });

    // TODO: Send activation notification
    // TODO: Enable all live features (QR codes, sessions, etc.)

    console.log(`[Activate Lounge] Lounge ${loungeId} activated successfully`);
    return {
      success: true,
      message: 'Lounge activated successfully! All features are now enabled.',
    };
  } catch (error) {
    console.error('[Activate Lounge] Error:', error);
    return {
      success: false,
      message: 'Failed to activate lounge. Please try again.',
    };
  }
}

/**
 * Check if feature is available in current mode
 */
export function isFeatureAvailable(
  mode: LaunchPadMode,
  feature: 'sessions' | 'qr_codes' | 'staff' | 'analytics' | 'loyalty'
): boolean {
  if (mode === 'live') {
    return true; // All features available in live mode
  }

  // Preview mode feature availability
  const previewFeatures: Record<string, boolean> = {
    sessions: false, // Sessions disabled in preview
    qr_codes: false, // QR codes disabled in preview (or show preview links)
    staff: true, // Staff can be added in preview
    analytics: false, // Analytics disabled in preview
    loyalty: false, // Loyalty disabled in preview
  };

  return previewFeatures[feature] || false;
}

/**
 * Get preview mode message for a feature
 */
export function getPreviewModeMessage(feature: string): string {
  return `This feature is only available in live mode. Activate your lounge to enable ${feature}.`;
}

