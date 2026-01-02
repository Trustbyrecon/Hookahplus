/**
 * Preview Mode System
 * 
 * Handles preview vs live mode for lounges:
 * - Preview: Lounge created but not activated (no subscription)
 * - Live: Lounge activated with active subscription
 */

import { prisma } from '../db';

export type LaunchPadMode = 'preview' | 'live';

export interface LoungeModeStatus {
  mode: LaunchPadMode;
  activatedAt: Date | null;
  canActivate: boolean;
  message: string;
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

    // Check if lounge has active subscription
    // TODO: Integrate with subscription system (Stripe, etc.)
    // For now, we'll use a simple check based on activation date
    const hasActiveSubscription = await checkActiveSubscription(loungeId);

    if (hasActiveSubscription) {
      return {
        mode: 'live',
        activatedAt: lounge.createdAt || new Date(),
        canActivate: false,
        message: 'Lounge is live and active',
      };
    }

    return {
      mode: 'preview',
      activatedAt: null,
      canActivate: true,
      message: 'Lounge is in preview mode. Activate to go live.',
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
 * TODO: Integrate with subscription activation
 */
export async function activateLounge(
  loungeId: string,
  subscriptionId?: string
): Promise<boolean> {
  try {
    // TODO: Verify subscription is active before activating
    // TODO: Update Tenant model with activatedAt timestamp
    // TODO: Send activation notification

    // For now, this is a placeholder
    // In production, you would:
    // 1. Verify subscription status
    // 2. Update Tenant.activatedAt
    // 3. Update Tenant.launchpadMode to 'live'
    // 4. Enable all live features (QR codes, sessions, etc.)

    console.log(`[Activate Lounge] Placeholder: Would activate lounge ${loungeId}`);
    return true;
  } catch (error) {
    console.error('[Activate Lounge] Error:', error);
    return false;
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

