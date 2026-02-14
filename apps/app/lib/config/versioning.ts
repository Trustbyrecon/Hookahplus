/**
 * Config Versioning System
 * Phase 4: Night After Night Engine - Reliability & Config Versioning
 * 
 * Manages versioned lounge configurations for consistent pricing and rules
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ConfigVersion {
  version: number;
  effectiveAt: Date;
  configData: Record<string, any>;
  pricingRules: Array<{
    id: string;
    ruleType: string;
    ruleConfig: Record<string, any>;
    version: number;
    effectiveAt: Date;
    expiresAt?: Date;
  }>;
}

/**
 * Get current config version for a lounge
 */
export async function getCurrentConfigVersion(loungeId: string): Promise<ConfigVersion | null> {
  const config = await prisma.loungeConfig.findFirst({
    where: { loungeId },
    orderBy: { version: 'desc' }
  });

  if (!config) {
    return null;
  }

  const pricingRules = await prisma.pricingRule.findMany({
    where: {
      loungeId,
      isActive: true,
      effectiveAt: { lte: new Date() },
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } }
      ]
    },
    orderBy: { effectiveAt: 'desc' }
  });

  return {
    version: config.version,
    effectiveAt: config.effectiveAt,
    configData: config.configData ? JSON.parse(config.configData) : {},
    pricingRules: pricingRules.map(rule => ({
      id: rule.id,
      ruleType: rule.ruleType,
      ruleConfig: JSON.parse(rule.ruleConfig),
      version: rule.version,
      effectiveAt: rule.effectiveAt,
      expiresAt: rule.expiresAt || undefined
    }))
  };
}

/**
 * Create new config version
 */
export async function createConfigVersion(
  loungeId: string,
  configData: Record<string, any>
): Promise<ConfigVersion> {
  const current = await prisma.loungeConfig.findFirst({
    where: { loungeId },
    orderBy: { version: 'desc' }
  });

  const nextVersion = current ? current.version + 1 : 1;

  const newConfig = await prisma.loungeConfig.upsert({
    where: { loungeId },
    update: {
      configData: JSON.stringify(configData),
      version: nextVersion,
      effectiveAt: new Date()
    },
    create: {
      loungeId,
      configData: JSON.stringify(configData),
      version: nextVersion,
      effectiveAt: new Date()
    }
  });

  // Get pricing rules
  const pricingRules = await prisma.pricingRule.findMany({
    where: {
      loungeId,
      isActive: true,
      effectiveAt: { lte: new Date() },
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } }
      ]
    },
    orderBy: { effectiveAt: 'desc' }
  });

  return {
    version: newConfig.version,
    effectiveAt: newConfig.effectiveAt,
    configData: JSON.parse(newConfig.configData),
    pricingRules: pricingRules.map(rule => ({
      id: rule.id,
      ruleType: rule.ruleType,
      ruleConfig: JSON.parse(rule.ruleConfig),
      version: rule.version,
      effectiveAt: rule.effectiveAt,
      expiresAt: rule.expiresAt || undefined
    }))
  };
}

/**
 * Get config version used by a session
 * Ensures pricing calculations are consistent with session's config version
 */
export async function getSessionConfigVersion(sessionId: string): Promise<ConfigVersion | null> {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: {
      loungeId: true,
      loungeConfigVersion: true
    }
  });

  if (!session) {
    return null;
  }

  // If session has a specific config version, get that version
  if (session.loungeConfigVersion) {
    const config = await prisma.loungeConfig.findFirst({
      where: {
        loungeId: session.loungeId,
        version: session.loungeConfigVersion
      }
    });

    if (config) {
      const pricingRules = await prisma.pricingRule.findMany({
        where: {
          loungeId: session.loungeId,
          version: { lte: session.loungeConfigVersion },
          isActive: true,
          effectiveAt: { lte: config.effectiveAt },
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: config.effectiveAt } }
          ]
        },
        orderBy: { effectiveAt: 'desc' }
      });

      return {
        version: config.version,
        effectiveAt: config.effectiveAt,
        configData: JSON.parse(config.configData),
        pricingRules: pricingRules.map(rule => ({
          id: rule.id,
          ruleType: rule.ruleType,
          ruleConfig: JSON.parse(rule.ruleConfig),
          version: rule.version,
          effectiveAt: rule.effectiveAt,
          expiresAt: rule.expiresAt || undefined
        }))
      };
    }
  }

  // Fallback to current config
  return getCurrentConfigVersion(session.loungeId);
}

/**
 * Store config version on session creation
 * Ensures session uses the config version that was active when it was created
 */
export async function storeSessionConfigVersion(sessionId: string): Promise<void> {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { loungeId: true }
  });

  if (!session) {
    return;
  }

  const currentConfig = await prisma.loungeConfig.findFirst({
    where: { loungeId: session.loungeId },
    orderBy: { version: 'desc' }
  });

  if (currentConfig) {
    await prisma.session.update({
      where: { id: sessionId },
      data: {
        loungeConfigVersion: currentConfig.version
      }
    });
  }
}

/**
 * Compare config versions
 * Returns changes between two versions
 */
export async function compareConfigVersions(
  loungeId: string,
  version1: number,
  version2: number
): Promise<{
  added: Record<string, any>;
  removed: Record<string, any>;
  changed: Record<string, { old: any; new: any }>;
}> {
  const config1 = await prisma.loungeConfig.findFirst({
    where: { loungeId, version: version1 }
  });

  const config2 = await prisma.loungeConfig.findFirst({
    where: { loungeId, version: version2 }
  });

  if (!config1 || !config2) {
    throw new Error('Config version not found');
  }

  const data1 = config1.configData ? JSON.parse(config1.configData) : {};
  const data2 = config2.configData ? JSON.parse(config2.configData) : {};

  const added: Record<string, any> = {};
  const removed: Record<string, any> = {};
  const changed: Record<string, { old: any; new: any }> = {};

  // Find added and changed keys
  for (const key in data2) {
    if (!(key in data1)) {
      added[key] = data2[key];
    } else if (JSON.stringify(data1[key]) !== JSON.stringify(data2[key])) {
      changed[key] = { old: data1[key], new: data2[key] };
    }
  }

  // Find removed keys
  for (const key in data1) {
    if (!(key in data2)) {
      removed[key] = data1[key];
    }
  }

  return { added, removed, changed };
}

