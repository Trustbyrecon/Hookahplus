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
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create lounge',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

