import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getSessionTimeline } from "@/lib/session-events";
import { deserializeEventPayload } from "@/lib/session-events";

/**
 * Generate a unique wallet QR token
 */
export function generateWalletToken(): string {
  // Generate a secure random token
  return `wallet_${crypto.randomBytes(16).toString("hex")}`;
}

/**
 * Get customer by wallet QR token
 */
export async function getCustomerByWalletToken(
  walletQrToken: string
): Promise<{ customer: any; wallet: any } | null> {
  const wallet = await prisma.customerWallet.findUnique({
    where: { walletQrToken },
    include: { customer: true },
  });

  if (!wallet || wallet.status !== "active") {
    return null;
  }

  return {
    customer: wallet.customer,
    wallet,
  };
}

/**
 * Get customer profile with stats, last mix, and rewards
 */
export async function getCustomerProfile(customerId: string) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      wallet: true,
      stats: true,
      rewards: {
        where: {
          redeemedAt: null,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } },
          ],
        },
        orderBy: { createdAt: "desc" },
      },
      sessions: {
        where: { state: "CLOSED" },
        orderBy: { endedAt: "desc" },
        take: 1,
      },
    },
  });

  if (!customer) {
    return null;
  }

  // Get last mix from most recent completed session
  const lastSession = customer.sessions[0];
  let lastMix = null;
  if (lastSession?.flavorMix) {
    try {
      lastMix = JSON.parse(lastSession.flavorMix);
    } catch {
      lastMix = null;
    }
  }

  // Calculate streak (simplified - will be enhanced in visit-streaks.ts)
  const streakStatus = {
    currentStreak: 0,
    longestStreak: 0,
    nextUnlock: null as string | null,
  };

  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    walletQrToken: customer.wallet?.walletQrToken || null,
    visitCount: customer.stats?.visitCount || 0,
    lastVisitAt: customer.stats?.lastVisitAt || null,
    lastMix,
    streakStatus,
    availableRewards: customer.rewards.map((r) => ({
      id: r.id,
      type: r.type,
      value: r.value,
      expiresAt: r.expiresAt,
    })),
    createdAt: customer.createdAt,
  };
}

/**
 * Update customer stats (visit count, last visit)
 */
export async function updateCustomerStats(
  customerId: string,
  sessionId: string
): Promise<void> {
  // Get session to check if it's completed
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session || session.state !== "CLOSED") {
    return; // Only update stats for completed sessions
  }

  // Check if this session was already counted
  const events = await getSessionTimeline(sessionId);
  const alreadyCounted = events.some(
    (e) => e.type === "visit_counted" && deserializeEventPayload(e.payload)?.customerId === customerId
  );

  if (alreadyCounted) {
    return; // Prevent double-counting
  }

  // Update or create stats
  await prisma.customerStats.upsert({
    where: { customerId },
    update: {
      visitCount: { increment: 1 },
      lastVisitAt: session.endedAt || new Date(),
    },
    create: {
      customerId,
      visitCount: 1,
      lastVisitAt: session.endedAt || new Date(),
    },
  });

  // Record event to prevent double-counting
  const { recordSessionEvent } = await import("@/lib/session-events");
  await recordSessionEvent({
    sessionId,
    type: "visit_counted",
    payload: { customerId, sessionId },
  });
}

/**
 * Create or get customer by phone
 */
export async function getOrCreateCustomerByPhone(
  phone: string,
  name?: string
): Promise<{ customer: any; isNew: boolean }> {
  // Try to find existing customer
  let customer = await prisma.customer.findUnique({
    where: { phone },
    include: { wallet: true },
  });

  if (customer) {
    return { customer, isNew: false };
  }

  // Create new customer
  const walletToken = generateWalletToken();
  customer = await prisma.customer.create({
    data: {
      phone,
      name: name || null,
      wallet: {
        create: {
          walletQrToken: walletToken,
          status: "active",
        },
      },
      stats: {
        create: {
          visitCount: 0,
        },
      },
    },
    include: {
      wallet: true,
      stats: true,
    },
  });

  return { customer, isNew: true };
}

/**
 * Rate limiting for wallet scans (simple in-memory cache)
 */
const scanRateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_SCANS_PER_MINUTE = 10;

export function checkRateLimit(walletQrToken: string): boolean {
  const now = Date.now();
  const record = scanRateLimit.get(walletQrToken);

  if (!record || now > record.resetAt) {
    // Reset or create new record
    scanRateLimit.set(walletQrToken, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (record.count >= MAX_SCANS_PER_MINUTE) {
    return false; // Rate limit exceeded
  }

  record.count++;
  return true;
}

