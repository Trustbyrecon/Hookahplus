import { prisma } from "@/lib/prisma";
import { generateWalletToken } from "@/lib/wallet";
import { recordSessionEvent } from "@/lib/session-events";

/**
 * Rotate wallet QR token for security
 * Creates a new token and marks the old one as inactive
 */
export async function rotateWalletToken(
  customerId: string,
  reason?: string
): Promise<{ newToken: string; oldToken: string }> {
  const wallet = await prisma.customerWallet.findUnique({
    where: { customerId },
  });

  if (!wallet) {
    throw new Error("Customer wallet not found");
  }

  const oldToken = wallet.walletQrToken;
  const newToken = generateWalletToken();

  // Update wallet with new token
  await prisma.customerWallet.update({
    where: { customerId },
    data: {
      walletQrToken: newToken,
      updatedAt: new Date(),
    },
  });

  // Record rotation event
  await recordSessionEvent({
    sessionId: null,
    type: "wallet.token_rotated",
    payload: {
      customerId,
      oldToken,
      newToken,
      reason: reason || "Security rotation",
      timestamp: new Date().toISOString(),
    },
  });

  return { newToken, oldToken };
}

/**
 * Check if wallet token should be rotated (based on age or security policy)
 */
export async function shouldRotateToken(
  customerId: string,
  maxAgeDays: number = 90
): Promise<boolean> {
  const wallet = await prisma.customerWallet.findUnique({
    where: { customerId },
  });

  if (!wallet) {
    return false;
  }

  const ageMs = Date.now() - wallet.updatedAt.getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);

  return ageDays >= maxAgeDays;
}

/**
 * Auto-rotate tokens that are older than maxAgeDays
 */
export async function autoRotateExpiredTokens(
  maxAgeDays: number = 90
): Promise<{ rotated: number; errors: number }> {
  const wallets = await prisma.customerWallet.findMany({
    where: { status: "active" },
  });

  let rotated = 0;
  let errors = 0;

  for (const wallet of wallets) {
    try {
      const ageMs = Date.now() - wallet.updatedAt.getTime();
      const ageDays = ageMs / (1000 * 60 * 60 * 24);

      if (ageDays >= maxAgeDays) {
        await rotateWalletToken(
          wallet.customerId,
          `Auto-rotation: token age ${Math.floor(ageDays)} days`
        );
        rotated++;
      }
    } catch (error) {
      console.error(
        `Failed to rotate token for customer ${wallet.customerId}:`,
        error
      );
      errors++;
    }
  }

  return { rotated, errors };
}

