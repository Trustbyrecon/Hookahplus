import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/lounges/[loungeId]/config
 * Returns current pricing + YAML-derived config with version
 * 
 * Response:
 * {
 *   config: {
 *     version: number,
 *     effectiveAt: string,
 *     configData: object (parsed JSON),
 *     pricingRules: PricingRule[],
 *     baseSessionPrice: number (from pricing rules)
 *   }
 * }
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ loungeId: string }> }
) {
  try {
    const { loungeId } = await params;

    // Get current lounge config
    const loungeConfig = await prisma.loungeConfig.findFirst({
      where: { loungeId },
      orderBy: { version: 'desc' }
    });

    // Get active pricing rules
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

    // Find base session price from pricing rules
    const baseSessionRule = pricingRules.find(
      rule => rule.ruleType === 'BASE_SESSION'
    );
    const baseSessionPrice = baseSessionRule
      ? JSON.parse(baseSessionRule.ruleConfig).priceCents || 2500
      : 2500; // Default fallback

    // Parse config data if exists
    let configData = null;
    if (loungeConfig?.configData) {
      try {
        configData = JSON.parse(loungeConfig.configData);
      } catch (e) {
        console.warn('Failed to parse configData JSON:', e);
      }
    }

    return NextResponse.json({
      success: true,
      config: {
        version: loungeConfig?.version || 1,
        effectiveAt: loungeConfig?.effectiveAt.toISOString() || new Date().toISOString(),
        configData: configData || {},
        venueIdentity: (configData as any)?.venue_identity || null,
        pricingRules: pricingRules.map(rule => ({
          id: rule.id,
          ruleType: rule.ruleType,
          ruleConfig: JSON.parse(rule.ruleConfig),
          version: rule.version,
          effectiveAt: rule.effectiveAt.toISOString(),
          expiresAt: rule.expiresAt?.toISOString() || null
        })),
        baseSessionPrice
      }
    });

  } catch (error) {
    console.error('Error fetching lounge config:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch lounge config',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/lounges/[loungeId]/config
 * Create or update lounge config with versioning
 * 
 * Body:
 * {
 *   configData: object (full YAML-derived config),
 *   version?: number (optional, auto-increments if not provided)
 * }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ loungeId: string }> }
) {
  try {
    const { loungeId } = await params;
    const body = await req.json();
    const { configData } = body;

    if (!configData) {
      return NextResponse.json(
        { error: 'configData is required' },
        { status: 400 }
      );
    }

    // Get current version
    const currentConfig = await prisma.loungeConfig.findFirst({
      where: { loungeId },
      orderBy: { version: 'desc' }
    });

    const nextVersion = currentConfig
      ? currentConfig.version + 1
      : 1;

    // Create or update config
    const newConfig = await prisma.loungeConfig.upsert({
      where: { 
        loungeId 
      },
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

    // Log audit
    await prisma.auditLog.create({
      data: {
        loungeId,
        action: 'CONFIG_CHANGED',
        entityType: 'LoungeConfig',
        entityId: newConfig.id,
        changes: JSON.stringify({
          version: currentConfig?.version || 0,
          newVersion: nextVersion
        })
      }
    });

    return NextResponse.json({
      success: true,
      config: {
        id: newConfig.id,
        version: newConfig.version,
        effectiveAt: newConfig.effectiveAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Error saving lounge config:', error);
    return NextResponse.json(
      {
        error: 'Failed to save lounge config',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

