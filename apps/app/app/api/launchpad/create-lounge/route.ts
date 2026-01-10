import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { loadSetupSession, linkSetupSessionToLounge } from '../../../../lib/launchpad/session-manager';
import { generateLoungeOpsConfig } from '../../../../lib/launchpad/config-generator';
import { generateQRCodePack } from '../../../../lib/launchpad/qr-generator';
import { generateStaffPlaybook } from '../../../../lib/launchpad/staff-playbook-generator';
import { storeQRCodes } from '../../../../lib/launchpad/qr-storage';
import { LaunchPadProgress } from '../../../../types/launchpad';
import { randomBytes } from 'crypto';

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

    // Generate lounge slug from name
    const loungeName = progress.data.step1?.loungeName || 'My Lounge';
    const slug = loungeName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Create lounge (using Tenant model as the lounge representation)
    const lounge = await prisma.tenant.create({
      data: {
        name: loungeName,
      },
    });

    // Generate LoungeOps config
    const config = generateLoungeOpsConfig(progress);

    // Create lounge config
    // Note: loungeId is stored as string, so we use the tenant ID
    await prisma.loungeConfig.create({
      data: {
        loungeId: lounge.id,
        configData: JSON.stringify(config),
        version: 1,
      },
    });

    // Create base session pricing rule so it can be retrieved by /api/lounges/[loungeId]/config
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
      console.log(`[LaunchPad Create Lounge] Created base session pricing rule: $${config.base_session_price} (${baseSessionPriceCents} cents)`);
    } catch (pricingRuleError) {
      console.warn('[LaunchPad Create Lounge] Could not create pricing rule (non-critical):', pricingRuleError);
      // Don't fail the entire creation if pricing rule creation fails
    }

    // Link setup session to lounge
    await linkSetupSessionToLounge(token, userId, lounge.id);

    // Generate assets
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://hookahplus.net';
    const dashboardUrl = `${baseUrl}/dashboard/${lounge.id}`;
    
    // Generate QR codes
    const qrCodePack = await generateQRCodePack(config, lounge.id, baseUrl);
    
    // Store QR codes in database
    const qrCodesToStore = [
      ...qrCodePack.tableQRCodes.map(qr => ({
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
    
    // Generate Staff Playbook
    const staffPlaybook = generateStaffPlaybook(config, dashboardUrl);
    
    // Auto-create basic table layout from LaunchPad config
    // This prevents "lounge layout needs to be config first" error
    try {
      // Create default zone if it doesn't exist
      let defaultZone = await prisma.zone.findFirst({
        where: {
          loungeId: lounge.id,
          name: 'Main Floor'
        }
      });

      if (!defaultZone) {
        defaultZone = await prisma.zone.create({
          data: {
            loungeId: lounge.id,
            name: 'Main Floor',
            zoneType: 'MAIN',
            displayOrder: 0
          }
        });
      }

      // Create tables based on tables_count from LaunchPad config
      const tablesCount = config.tables_count || 12; // Default to 12 if not specified
      const existingSeats = await prisma.seat.findMany({
        where: { loungeId: lounge.id }
      });

      // Only create tables if none exist
      if (existingSeats.length === 0 && tablesCount > 0) {
        const seatsToCreate = [];
        for (let i = 1; i <= tablesCount; i++) {
          const tableNum = i.toString().padStart(3, '0');
          // Store seatingType in coordinates JSON as metadata
          const coordinates = JSON.stringify({
            x: 0,
            y: 0,
            seatingType: 'Booth' // Default seating type for LaunchPad tables
          });
          seatsToCreate.push({
            loungeId: lounge.id,
            zoneId: defaultZone.id,
            tableId: `table-${tableNum}`,
            name: `Table-${tableNum}`,
            capacity: 4, // Default capacity
            coordinates: coordinates,
            qrEnabled: true,
            status: 'ACTIVE',
            priceMultiplier: 1.0
          });
        }

        await prisma.seat.createMany({
          data: seatsToCreate
        });

        // Also save to orgSetting for backward compatibility with table validation
        const layoutData = {
          tables: seatsToCreate.map((seat, idx) => ({
            id: seat.tableId,
            name: seat.name,
            seatingType: 'Booth',
            capacity: seat.capacity,
            coordinates: { x: 0, y: 0 },
            zone: 'Main Floor'
          })),
          updatedAt: new Date().toISOString()
        };

        try {
          await prisma.orgSetting.upsert({
            where: { key: 'lounge_layout' },
            update: {
              value: JSON.stringify(layoutData),
              updatedAt: new Date()
            },
            create: {
              key: 'lounge_layout',
              value: JSON.stringify(layoutData),
              description: 'Lounge floor plan layout with table configurations',
              category: 'ui',
              isActive: true
            }
          });
        } catch (orgSettingError) {
          console.warn('[LaunchPad Create Lounge] Could not save to orgSetting (non-critical):', orgSettingError);
        }

        console.log(`[LaunchPad Create Lounge] Created ${tablesCount} default tables for lounge ${lounge.id}`);
      }
    } catch (tableError) {
      console.error('[LaunchPad Create Lounge] Error creating default tables:', tableError);
      // Don't fail the entire creation if table creation fails
    }
    
    // TODO: Create pricing rules from config
    // This would create PricingRule records based on the config

    // TODO: Create staff users
    // This would create User records for each staff member in step4

    return NextResponse.json({
      success: true,
      loungeId: lounge.id,
      userId,
      mode: 'preview', // Will be 'live' once subscription is active
      message: 'Lounge created successfully',
      assets: {
        qrCodes: {
          tables: qrCodePack.tableQRCodes.map(qr => ({
            tableId: qr.tableId,
            url: qr.url,
            downloadUrl: `${baseUrl}/api/launchpad/download/qr/${lounge.id}/${qr.tableId}`,
          })),
          kiosk: {
            url: qrCodePack.kioskQRCode.url,
            downloadUrl: `${baseUrl}/api/launchpad/download/qr/${lounge.id}/kiosk`,
          },
        },
        staffPlaybook: {
          html: staffPlaybook.html,
          markdown: staffPlaybook.markdown,
          downloadUrl: `${baseUrl}/api/launchpad/download/playbook/${lounge.id}`,
        },
        config: {
          yaml: `${baseUrl}/api/launchpad/download/config/${lounge.id}?format=yaml`,
          json: `${baseUrl}/api/launchpad/download/config/${lounge.id}?format=json`,
        },
      },
      dashboardUrl,
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

