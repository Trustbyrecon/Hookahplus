import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../../lib/db';
import { exportConfigAsYAML, exportConfigAsJSON } from '../../../../../../../lib/launchpad/config-generator';

/**
 * GET /api/launchpad/download/config/[loungeId]
 * Download LoungeOps Config as YAML or JSON
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { loungeId: string } }
) {
  try {
    const { loungeId } = params;
    const searchParams = req.nextUrl.searchParams;
    const format = searchParams.get('format') || 'yaml'; // 'yaml' | 'json'

    // Get lounge config
    const loungeConfig = await prisma.loungeConfig.findFirst({
      where: { loungeId },
      orderBy: { version: 'desc' },
    });

    if (!loungeConfig) {
      return NextResponse.json(
        { error: 'Lounge config not found' },
        { status: 404 }
      );
    }

    // Parse config
    const config = JSON.parse(loungeConfig.configData as string);

    // Get lounge name for filename
    const lounge = await prisma.tenant.findUnique({
      where: { id: loungeId },
      select: { name: true },
    });

    const fileName = `${lounge?.name || 'lounge'}_config.${format}`;

    if (format === 'json') {
      const jsonContent = exportConfigAsJSON(config);
      return new NextResponse(jsonContent, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    // Default to YAML
    const yamlContent = exportConfigAsYAML(config);
    return new NextResponse(yamlContent, {
      headers: {
        'Content-Type': 'text/yaml',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error: any) {
    console.error('[Download Config] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate config' },
      { status: 500 }
    );
  }
}

