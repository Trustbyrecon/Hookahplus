import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/lounges/[loungeId]/menu
 * Returns flavors, add-ons, hookah types, and mix templates
 * 
 * Response:
 * {
 *   flavors: Flavor[],
 *   mixTemplates: MixTemplate[],
 *   categories: { standard: Flavor[], premium: Flavor[] }
 * }
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { loungeId: string } }
) {
  try {
    const { loungeId } = params;
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    // Get flavors for this lounge (or global if loungeId is null)
    const flavors = await prisma.flavor.findMany({
      where: {
        OR: [
          { loungeId },
          { loungeId: null } // Global flavors
        ],
        ...(includeInactive ? {} : { isActive: true })
      },
      orderBy: { name: 'asc' }
    });

    // Get mix templates
    const mixTemplates = await prisma.mixTemplate.findMany({
      where: {
        loungeId,
        ...(includeInactive ? {} : { isActive: true })
      },
      orderBy: { name: 'asc' }
    });

    // Categorize flavors
    const standard = flavors.filter(f => !f.isPremium);
    const premium = flavors.filter(f => f.isPremium);

    // Parse flavor tags
    const flavorsWithTags = flavors.map(flavor => ({
      id: flavor.id,
      name: flavor.name,
      description: flavor.description,
      tags: flavor.tags ? JSON.parse(flavor.tags) : [],
      isPremium: flavor.isPremium,
      isActive: flavor.isActive,
      createdAt: flavor.createdAt.toISOString()
    }));

    // Parse mix template flavor IDs
    const mixTemplatesWithFlavors = mixTemplates.map(template => ({
      id: template.id,
      name: template.name,
      flavorIds: template.flavorIds ? JSON.parse(template.flavorIds) : [],
      priceCents: template.priceCents,
      isActive: template.isActive,
      createdAt: template.createdAt.toISOString()
    }));

    return NextResponse.json({
      success: true,
      menu: {
        flavors: flavorsWithTags,
        mixTemplates: mixTemplatesWithFlavors,
        categories: {
          standard: standard.map(f => ({
            id: f.id,
            name: f.name,
            description: f.description,
            tags: f.tags ? JSON.parse(f.tags) : []
          })),
          premium: premium.map(f => ({
            id: f.id,
            name: f.name,
            description: f.description,
            tags: f.tags ? JSON.parse(f.tags) : []
          }))
        },
        totalFlavors: flavors.length,
        totalMixTemplates: mixTemplates.length
      }
    });

  } catch (error) {
    console.error('Error fetching lounge menu:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch lounge menu',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/lounges/[loungeId]/menu/flavors
 * Create or update a flavor
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { loungeId: string } }
) {
  try {
    const { loungeId } = params;
    const body = await req.json();
    const { id, name, description, tags, isPremium, isActive } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'name is required' },
        { status: 400 }
      );
    }

    const flavor = await prisma.flavor.upsert({
      where: { id: id || 'new' },
      update: {
        name,
        description,
        tags: tags ? JSON.stringify(tags) : null,
        isPremium: isPremium || false,
        isActive: isActive !== undefined ? isActive : true,
        loungeId: loungeId || null
      },
      create: {
        name,
        description,
        tags: tags ? JSON.stringify(tags) : null,
        isPremium: isPremium || false,
        isActive: isActive !== undefined ? isActive : true,
        loungeId: loungeId || null
      }
    });

    return NextResponse.json({
      success: true,
      flavor: {
        id: flavor.id,
        name: flavor.name,
        description: flavor.description,
        tags: flavor.tags ? JSON.parse(flavor.tags) : [],
        isPremium: flavor.isPremium,
        isActive: flavor.isActive
      }
    });

  } catch (error) {
    console.error('Error saving flavor:', error);
    return NextResponse.json(
      {
        error: 'Failed to save flavor',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

