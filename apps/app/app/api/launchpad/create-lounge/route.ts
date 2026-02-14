import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { loadSetupSession, linkSetupSessionToLounge } from '../../../../lib/launchpad/session-manager';
import { generateLoungeOpsConfig } from '../../../../lib/launchpad/config-generator';
import { generateQRCodePack } from '../../../../lib/launchpad/qr-generator';
import { generateStaffPlaybook } from '../../../../lib/launchpad/staff-playbook-generator';
import { storeQRCodes } from '../../../../lib/launchpad/qr-storage';
import { LaunchPadProgress } from '../../../../types/launchpad';
import { randomBytes } from 'crypto';

function slugify(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function ensureDefaultTables(loungeId: string, tablesCount: number) {
  try {
    let defaultZone = await prisma.zone.findFirst({
      where: {
        loungeId,
        name: 'Main Floor'
      }
    });

    if (!defaultZone) {
      defaultZone = await prisma.zone.create({
        data: {
          loungeId,
          name: 'Main Floor',
          zoneType: 'MAIN',
          displayOrder: 0
        }
      });
    }

    const existingSeats = await prisma.seat.findMany({
      where: { loungeId }
    });

    if (existingSeats.length === 0 && tablesCount > 0) {
      const seatsToCreate = [];
      for (let i = 1; i <= tablesCount; i++) {
        const tableNum = i.toString().padStart(3, '0');
        const coordinates = JSON.stringify({ x: 0, y: 0, seatingType: 'Booth' });
        seatsToCreate.push({
          loungeId,
          zoneId: defaultZone.id,
          tableId: `table-${tableNum}`,
          name: `T-${tableNum}`,
          capacity: 4,
          coordinates,
          qrEnabled: true,
          status: 'ACTIVE',
          priceMultiplier: 1.0
        });
      }

      await prisma.seat.createMany({ data: seatsToCreate });
    }
  } catch (error) {
    console.error('[LaunchPad Create Lounge] Error creating default tables:', error);
  }
}

/**
 * POST /api/launchpad/create-lounge
 * Create account and lounge at Go Live
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, email, phone, password, useMagicLink } = body;

    if (!token || !email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Token and email are required',
        },
        { status: 400 }
      );
    }

    // Load setup session
    const progress = await loadSetupSession(token);
    if (!progress) {
      return NextResponse.json(
        {
          success: false,
          error: 'Setup session not found or expired',
        },
        { status: 404 }
      );
    }

    // Validate all steps are complete
    const requiredSteps = [1, 2, 3, 4, 5];
    const missingSteps = requiredSteps.filter(
      (step) => !progress.completedSteps.includes(step)
    );

    if (missingSteps.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Please complete all steps. Missing: ${missingSteps.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // TODO: Create user account
    // This will need to integrate with your auth system (NextAuth, Supabase, etc.)
    // For now, we'll create a placeholder user ID
    const userId = `user_${randomBytes(16).toString('hex')}`;

    const step1: any = progress.data.step1 || {};
    const primaryLoungeName = step1.loungeName || 'My Lounge';
    const candidateLocations = Array.isArray(step1.locations) ? step1.locations : [];
    const multiLocationEnabled = Boolean(step1.multiLocationEnabled && candidateLocations.length > 1);
    const organizationName = multiLocationEnabled
      ? (step1.organizationName || `${primaryLoungeName} Operator`)
      : primaryLoungeName;

    let organizationId: string | null = null;
    if (multiLocationEnabled && (prisma as any).organization?.upsert) {
      try {
        const org = await (prisma as any).organization.upsert({
          where: { slug: slugify(organizationName) },
          update: { name: organizationName },
          create: { name: organizationName, slug: slugify(organizationName) },
        });
        organizationId = org.id;
      } catch (orgError: any) {
        console.warn('[LaunchPad Create Lounge] Organization model/table unavailable, proceeding without org link:', orgError?.message || orgError);
        organizationId = null;
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://hookahplus.net';
    const locationsToProvision = multiLocationEnabled
      ? candidateLocations
      : [{
          name: primaryLoungeName,
          tablesCount: step1.tablesCount,
          sectionsCount: step1.sectionsCount,
          operatingHours: step1.operatingHours,
        }];

    const provisioned: Array<{
      loungeId: string;
      loungeName: string;
      slug: string;
      dashboardUrl: string;
      config: any;
      qrCodePack: any;
      staffPlaybook: any;
    }> = [];

    for (const [idx, location] of locationsToProvision.entries()) {
      const locationName = String(location?.name || `Location ${idx + 1}`).trim();
      const locationTables = Number(location?.tablesCount || step1.tablesCount || 1);
      const locationSections = Number(location?.sectionsCount || step1.sectionsCount || 0);
      const locationHours = location?.operatingHours || step1.operatingHours || {};

      const lounge = await prisma.tenant.create({
        data: {
          name: locationName,
          ...(organizationId ? { organizationId } : {}),
        } as any,
      });

      const config = generateLoungeOpsConfig(progress, {
        loungeName: locationName,
        tablesCount: locationTables,
        sectionsCount: locationSections,
        operatingHours: locationHours,
      });

      await prisma.loungeConfig.create({
        data: {
          loungeId: lounge.id,
          configData: JSON.stringify(config),
          version: 1,
        },
      });

      const baseSessionPriceCents = Math.round(config.base_session_price * 100);
      try {
        await prisma.pricingRule.create({
          data: {
            loungeId: lounge.id,
            ruleType: 'BASE_SESSION',
            ruleConfig: JSON.stringify({
              priceCents: baseSessionPriceCents,
              pricingModel: config.session_type,
            }),
            version: 1,
            isActive: true,
            effectiveAt: new Date(),
          },
        });
      } catch (pricingRuleError) {
        console.warn('[LaunchPad Create Lounge] Could not create pricing rule (non-critical):', pricingRuleError);
      }

      const dashboardUrl = `${baseUrl}/dashboard/${lounge.id}`;
      const qrCodePack = await generateQRCodePack(config, lounge.id, baseUrl);
      const qrCodesToStore = [
        ...qrCodePack.tableQRCodes.map((qr: any) => ({
          tableId: qr.tableId,
          type: 'table' as const,
          url: qr.url,
          qrCodeDataUrl: qr.qrCodeDataUrl,
        })),
        {
          tableId: null,
          type: 'kiosk' as const,
          url: qrCodePack.kioskQRCode.url,
          qrCodeDataUrl: qrCodePack.kioskQRCode.qrCodeDataUrl,
        },
      ];
      await storeQRCodes(lounge.id, qrCodesToStore);
      await ensureDefaultTables(lounge.id, config.tables_count || 12);
      const staffPlaybook = generateStaffPlaybook(config, dashboardUrl);

      provisioned.push({
        loungeId: lounge.id,
        loungeName: locationName,
        slug: slugify(locationName),
        dashboardUrl,
        config,
        qrCodePack,
        staffPlaybook,
      });
    }

    const primaryLounge = provisioned[0];
    await linkSetupSessionToLounge(
      token,
      userId,
      primaryLounge.loungeId,
      provisioned.map((p) => p.loungeId),
      organizationId
    );
    
    // TODO: Create pricing rules from config
    // This would create PricingRule records based on the config

    // TODO: Create staff users
    // This would create User records for each staff member in step4

    return NextResponse.json({
      success: true,
      loungeId: primaryLounge.loungeId,
      loungeIds: provisioned.map((p) => p.loungeId),
      organizationId,
      userId,
      mode: 'preview', // Will be 'live' once subscription is active
      message: 'Lounge created successfully',
      assetsByLocation: provisioned.map((p) => ({
        loungeId: p.loungeId,
        loungeName: p.loungeName,
        qrCodes: {
          tables: p.qrCodePack.tableQRCodes.map((qr: any) => ({
            tableId: qr.tableId,
            url: qr.url,
            downloadUrl: `${baseUrl}/api/launchpad/download/qr/${p.loungeId}/${qr.tableId}`,
          })),
          kiosk: {
            url: p.qrCodePack.kioskQRCode.url,
            downloadUrl: `${baseUrl}/api/launchpad/download/qr/${p.loungeId}/kiosk`,
          },
        },
        staffPlaybook: {
          html: p.staffPlaybook.html,
          markdown: p.staffPlaybook.markdown,
          downloadUrl: `${baseUrl}/api/launchpad/download/playbook/${p.loungeId}`,
        },
        config: {
          yaml: `${baseUrl}/api/launchpad/download/config/${p.loungeId}?format=yaml`,
          json: `${baseUrl}/api/launchpad/download/config/${p.loungeId}?format=json`,
        },
        dashboardUrl: p.dashboardUrl,
      })),
      assets: {
        qrCodes: {
          tables: primaryLounge.qrCodePack.tableQRCodes.map((qr: any) => ({
            tableId: qr.tableId,
            url: qr.url,
            downloadUrl: `${baseUrl}/api/launchpad/download/qr/${primaryLounge.loungeId}/${qr.tableId}`,
          })),
          kiosk: {
            url: primaryLounge.qrCodePack.kioskQRCode.url,
            downloadUrl: `${baseUrl}/api/launchpad/download/qr/${primaryLounge.loungeId}/kiosk`,
          },
        },
        staffPlaybook: {
          html: primaryLounge.staffPlaybook.html,
          markdown: primaryLounge.staffPlaybook.markdown,
          downloadUrl: `${baseUrl}/api/launchpad/download/playbook/${primaryLounge.loungeId}`,
        },
        config: {
          yaml: `${baseUrl}/api/launchpad/download/config/${primaryLounge.loungeId}?format=yaml`,
          json: `${baseUrl}/api/launchpad/download/config/${primaryLounge.loungeId}?format=json`,
        },
      },
      dashboardUrl: primaryLounge.dashboardUrl,
    });
  } catch (error: any) {
    console.error('[LaunchPad Create Lounge] Error:', error);
    console.error('[LaunchPad Create Lounge] Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack,
    });
    
    // Provide more detailed error information
    let errorMessage = 'Failed to create lounge';
    let errorDetails = error.message || 'Unknown error';
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      errorMessage = 'Lounge name already exists';
      errorDetails = 'A lounge with this name already exists. Please choose a different name.';
    } else if (error.code === 'P2003') {
      errorMessage = 'Database constraint violation';
      errorDetails = 'A required relationship is missing. Please check your setup session.';
    } else if (error.message?.includes('does not exist') || error.message?.includes('relation')) {
      errorMessage = 'Database migration required';
      errorDetails = 'Please run: npx prisma migrate dev';
    }
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: errorDetails,
        code: error.code || 'UNKNOWN_ERROR',
      },
      { status: 500 }
    );
  }
}

