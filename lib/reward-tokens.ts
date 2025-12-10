import { prisma } from "@/lib/prisma";
import { recordSessionEvent } from "@/lib/session-events";

export type RewardTokenType = "discount" | "add-on";
export type RewardTokenValue = 
  | { amountCents: number } // For discount type
  | { addOnName: string }; // For add-on type

/**
 * Create a reward token
 */
export async function createRewardToken(
  customerId: string,
  type: RewardTokenType,
  value: RewardTokenValue,
  expiresAt?: Date
): Promise<any> {
  return prisma.rewardToken.create({
    data: {
      customerId,
      type,
      value: JSON.stringify(value),
      expiresAt: expiresAt || null,
    },
  });
}

/**
 * Get available (unredeemed, not expired) tokens for a customer
 */
export async function getAvailableTokens(customerId: string): Promise<any[]> {
  const now = new Date();
  return prisma.rewardToken.findMany({
    where: {
      customerId,
      redeemedAt: null,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: now } },
      ],
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Redeem a token
 */
export async function redeemToken(
  tokenId: string,
  sessionId: string,
  idempotencyKey?: string
): Promise<{ success: boolean; token?: any; error?: string }> {
  // Check if token exists and is available
  const token = await prisma.rewardToken.findUnique({
    where: { id: tokenId },
  });

  if (!token) {
    return { success: false, error: "Token not found" };
  }

  if (token.redeemedAt) {
    return { success: false, error: "Token already redeemed" };
  }

  if (token.expiresAt && new Date(token.expiresAt) < new Date()) {
    return { success: false, error: "Token expired" };
  }

  // Mark token as redeemed
  const redeemedToken = await prisma.rewardToken.update({
    where: { id: tokenId },
    data: { redeemedAt: new Date() },
  });

  // Record redemption event
  await recordSessionEvent({
    sessionId,
    type: "reward_redeemed",
    payload: {
      tokenId,
      customerId: token.customerId,
      type: token.type,
      value: token.value,
    },
    idempotencyKey,
  });

  return { success: true, token: redeemedToken };
}

/**
 * Apply token discount to session pricing
 */
export function applyTokenToSession(
  token: any,
  basePriceCents: number,
  premiumAddOns: Array<{ name: string; priceCents: number; quantity?: number }>,
  marginCents: number
): {
  discountCents: number;
  finalPriceCents: number;
  appliedToken: any;
} {
  let discountCents = 0;
  let appliedToken = null;

  try {
    const value = JSON.parse(token.value);

    if (token.type === "discount" && value.amountCents) {
      // Apply discount (cannot exceed total)
      discountCents = Math.min(value.amountCents, basePriceCents + marginCents);
      appliedToken = token;
    } else if (token.type === "add-on" && value.addOnName) {
      // Find matching add-on and make it free
      const addOnIndex = premiumAddOns.findIndex(
        (a) => a.name === value.addOnName
      );
      if (addOnIndex >= 0) {
        discountCents = premiumAddOns[addOnIndex].priceCents * (premiumAddOns[addOnIndex].quantity || 1);
        appliedToken = token;
      }
    }
  } catch {
    // Invalid token value, skip
  }

  const addOnsTotal = premiumAddOns.reduce(
    (sum, a) => sum + a.priceCents * (a.quantity || 1),
    0
  );
  const totalCents = basePriceCents + marginCents + addOnsTotal - discountCents;

  return {
    discountCents,
    finalPriceCents: Math.max(0, totalCents), // Ensure non-negative
    appliedToken,
  };
}

