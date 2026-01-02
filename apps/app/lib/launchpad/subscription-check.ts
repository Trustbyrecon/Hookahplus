/**
 * Subscription Check Service
 * 
 * Checks subscription status for lounge activation
 * TODO: Integrate with Stripe or your subscription provider
 */

import { prisma } from '../db';

export interface SubscriptionStatus {
  active: boolean;
  plan?: 'starter' | 'pro' | 'trust_plus';
  expiresAt?: Date;
  trialDaysRemaining?: number;
  canActivate: boolean;
}

/**
 * Check if lounge has active subscription
 */
export async function checkSubscriptionStatus(
  loungeId: string
): Promise<SubscriptionStatus> {
  try {
    // TODO: Replace with actual subscription check
    // This would typically:
    // 1. Query Stripe subscription by loungeId
    // 2. Check subscription status (active, trialing, past_due, etc.)
    // 3. Get plan tier (Starter/Pro/Trust+)
    // 4. Check trial period if applicable

    // Placeholder: Check if lounge exists and was created recently (within trial period)
    const lounge = await prisma.tenant.findUnique({
      where: { id: loungeId },
      select: {
        id: true,
        createdAt: true,
      },
    });

    if (!lounge) {
      return {
        active: false,
        canActivate: false,
      };
    }

    // Check if within 7-day trial period
    const daysSinceCreation = Math.floor(
      (Date.now() - (lounge.createdAt?.getTime() || Date.now())) / (1000 * 60 * 60 * 24)
    );

    const isInTrial = daysSinceCreation < 7;
    const trialDaysRemaining = Math.max(0, 7 - daysSinceCreation);

    // For now, allow activation if in trial or if we can't determine subscription
    // In production, this would check actual Stripe subscription
    return {
      active: isInTrial, // Consider trial as "active" for activation
      plan: 'starter', // Default to starter
      trialDaysRemaining: isInTrial ? trialDaysRemaining : undefined,
      canActivate: isInTrial, // Can activate during trial
    };
  } catch (error) {
    console.error('[Subscription Check] Error:', error);
    return {
      active: false,
      canActivate: false,
    };
  }
}

/**
 * Verify subscription before activation
 */
export async function verifySubscriptionForActivation(
  loungeId: string
): Promise<{ valid: boolean; message: string }> {
  const status = await checkSubscriptionStatus(loungeId);

  if (!status.canActivate) {
    if (status.trialDaysRemaining !== undefined && status.trialDaysRemaining === 0) {
      return {
        valid: false,
        message: 'Trial period has ended. Please subscribe to activate your lounge.',
      };
    }

    return {
      valid: false,
      message: 'No active subscription found. Please subscribe to activate your lounge.',
    };
  }

  return {
    valid: true,
    message: 'Subscription verified. Lounge can be activated.',
  };
}

