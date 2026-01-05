import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateStaffPlaybook } from '@/lib/launchpad/staff-playbook-generator';
import { generateLoungeOpsConfig } from '@/lib/launchpad/config-generator';
import { loadSetupSession } from '@/lib/launchpad/session-manager';
import { generatePDFFromHTML } from '@/lib/launchpad/pdf-generator';

/**
 * GET /api/launchpad/download/playbook/[loungeId]
 * Download Staff Playbook as HTML or PDF
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { loungeId: string } }
) {
  try {
    const { loungeId } = params;
    const searchParams = req.nextUrl.searchParams;
    const format = searchParams.get('format') || 'html'; // 'html' | 'pdf'

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

    // Get lounge name
    const lounge = await prisma.tenant.findUnique({
      where: { id: loungeId },
      select: { name: true },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://hookahplus.net';
    const dashboardUrl = `${baseUrl}/dashboard/${loungeId}`;

    // Generate playbook
    const playbook = generateStaffPlaybook(config, dashboardUrl);

    if (format === 'pdf') {
      // Generate PDF from HTML
      const pdfBuffer = await generatePDFFromHTML(playbook.html);
      
      if (pdfBuffer) {
        return new NextResponse(pdfBuffer as unknown as BodyInit, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${lounge?.name || 'lounge'}_staff_playbook.pdf"`,
            'Cache-Control': 'public, max-age=3600',
          },
        });
      } else {
        // Fallback to HTML if PDF generation fails
        return new NextResponse(playbook.html, {
          headers: {
            'Content-Type': 'text/html',
            'Content-Disposition': `attachment; filename="${lounge?.name || 'lounge'}_staff_playbook.html"`,
            'X-PDF-Generation': 'unavailable',
          },
        });
      }
    }

    // Return HTML
    return new NextResponse(playbook.html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="${lounge?.name || 'lounge'}_staff_playbook.html"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error: any) {
    console.error('[Download Playbook] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate playbook' },
      { status: 500 }
    );
  }
}

