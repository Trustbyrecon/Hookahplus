/**
 * Pricing Snapshots Service
 * Manages immutable pricing snapshots tied to config versions
 */

import { prisma } from './db';
import { getSessionConfigVersion } from './config/versioning';

export interface PricingBreakdown {
  basePrice: number;
  addOns: Array<{
    name: string;
    priceCents: number;
  }>;
  premiumFlavors: string[];
  adjustments: Array<{
    type: string;
    amountCents: number;
    reason?: string;
  }>;
  subtotal: number;
  finalPrice: number;
}

export interface PricingSnapshotData {
  sessionId: string;
  configVersion: number;
  basePriceCents: number;
  addOnsPriceCents: number;
  adjustmentsCents: number;
  finalPriceCents: number;
  breakdown: PricingBreakdown;
  mixItems?: Array<{
    name: string;
    quantity: number;
  }>;
  premiumDetected: boolean;
}

/**
 * Create a pricing snapshot for a session
 * Should be called when pricing is locked or before checkout
 */
export async function createPricingSnapshot(
  sessionId: string,
  breakdown: PricingBreakdown,
  mixItems?: Array<{ name: string; quantity: number }>
): Promise<void> {
  // Get session to find config version
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: {
      loungeId: true,
      loungeConfigVersion: true,
      priceCents: true,
    },
  });

  if (!session) {
    throw new Error(`Session ${sessionId} not found`);
  }

  // Get config version (use session's version or current)
  let configVersion = session.loungeConfigVersion;
  if (!configVersion) {
    const config = await getSessionConfigVersion(sessionId);
    configVersion = config?.version || 1;
  }

  // Calculate totals
  const addOnsPriceCents = breakdown.addOns.reduce(
    (sum, addon) => sum + addon.priceCents,
    0
  );
  const adjustmentsCents = breakdown.adjustments.reduce(
    (sum, adj) => sum + adj.amountCents,
    0
  );
  const finalPriceCents = breakdown.finalPrice * 100; // Convert to cents

  // Check for premium flavors
  const premiumDetected = breakdown.premiumFlavors.length > 0;

  // Create or update snapshot (should be unique per session)
  await prisma.pricingSnapshot.upsert({
    where: { sessionId },
    create: {
      sessionId,
      configVersion,
      basePriceCents: breakdown.basePrice * 100,
      addOnsPriceCents,
      adjustmentsCents,
      finalPriceCents,
      breakdown: breakdown as any,
      mixItems: mixItems as any,
      premiumDetected,
    },
    update: {
      configVersion,
      basePriceCents: breakdown.basePrice * 100,
      addOnsPriceCents,
      adjustmentsCents,
      finalPriceCents,
      breakdown: breakdown as any,
      mixItems: mixItems as any,
      premiumDetected,
    },
  });
}

/**
 * Get pricing snapshot for a session
 */
export async function getPricingSnapshot(
  sessionId: string
): Promise<PricingSnapshotData | null> {
  const snapshot = await prisma.pricingSnapshot.findUnique({
    where: { sessionId },
  });

  if (!snapshot) {
    return null;
  }

  return {
    sessionId: snapshot.sessionId,
    configVersion: snapshot.configVersion,
    basePriceCents: snapshot.basePriceCents,
    addOnsPriceCents: snapshot.addOnsPriceCents,
    adjustmentsCents: snapshot.adjustmentsCents,
    finalPriceCents: snapshot.finalPriceCents,
    breakdown: snapshot.breakdown as PricingBreakdown,
    mixItems: snapshot.mixItems as Array<{ name: string; quantity: number }> | undefined,
    premiumDetected: snapshot.premiumDetected,
  };
}

/**
 * Compare two pricing snapshots
 * Useful for dispute resolution
 */
export async function compareSnapshots(
  sessionId1: string,
  sessionId2: string
): Promise<{
  differences: Array<{
    field: string;
    value1: any;
    value2: any;
  }>;
  identical: boolean;
}> {
  const snapshot1 = await getPricingSnapshot(sessionId1);
  const snapshot2 = await getPricingSnapshot(sessionId2);

  if (!snapshot1 || !snapshot2) {
    throw new Error('One or both snapshots not found');
  }

  const differences: Array<{
    field: string;
    value1: any;
    value2: any;
  }> = [];

  // Compare key fields
  const fieldsToCompare: Array<keyof PricingSnapshotData> = [
    'basePriceCents',
    'addOnsPriceCents',
    'adjustmentsCents',
    'finalPriceCents',
    'configVersion',
    'premiumDetected',
  ];

  for (const field of fieldsToCompare) {
    if (snapshot1[field] !== snapshot2[field]) {
      differences.push({
        field,
        value1: snapshot1[field],
        value2: snapshot2[field],
      });
    }
  }

  // Compare breakdown JSON (deep comparison)
  if (JSON.stringify(snapshot1.breakdown) !== JSON.stringify(snapshot2.breakdown)) {
    differences.push({
      field: 'breakdown',
      value1: snapshot1.breakdown,
      value2: snapshot2.breakdown,
    });
  }

  return {
    differences,
    identical: differences.length === 0,
  };
}

