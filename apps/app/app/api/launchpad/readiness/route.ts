import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { loadSetupSession } from '../../../../lib/launchpad/session-manager';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/launchpad/readiness?loungeId=...&token=...
 *
 * GMV-readiness checkpoints for operators after Go Live.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const loungeId = (searchParams.get('loungeId') || '').trim();
    const token = (searchParams.get('token') || '').trim();

    if (!loungeId) {
      return NextResponse.json({ success: false, error: 'loungeId is required' }, { status: 400 });
    }

    const [seatCount, pricingRule, qrSetting, sessionPaidCount, progress] = await Promise.all([
      prisma.seat.count({ where: { loungeId, status: 'ACTIVE' as any } }).catch(() => 0),
      prisma.pricingRule
        .findFirst({ where: { loungeId, ruleType: 'BASE_SESSION' as any, isActive: true } as any, select: { id: true } })
        .catch(() => null),
      prisma.orgSetting.findUnique({ where: { key: `qr_codes:${loungeId}` }, select: { value: true, updatedAt: true } }).catch(() => null),
      prisma.session
        .count({
          where: {
            loungeId,
            OR: [
              { paymentStatus: 'succeeded' as any },
              { externalRef: { startsWith: 'cs_' } as any },
              { externalRef: { startsWith: 'test_cs_' } as any },
            ],
          } as any,
        })
        .catch(() => 0),
      token ? loadSetupSession(token).catch(() => null) : Promise.resolve(null),
    ]);

    const staffCountFromProgress = Array.isArray(progress?.data?.step4?.staff) ? progress!.data.step4!.staff.length : 0;
    let staffConfigured = staffCountFromProgress > 0;

    if (!staffConfigured) {
      // fallback: check loungeConfig payload for staff array
      try {
        const cfg = await prisma.loungeConfig.findFirst({
          where: { loungeId },
          orderBy: { version: 'desc' as any },
          select: { configData: true },
        } as any);
        const parsed = cfg?.configData ? JSON.parse(cfg.configData) : null;
        staffConfigured = Array.isArray(parsed?.staff) && parsed.staff.length > 0;
      } catch {
        // ignore
      }
    }

    const qrMinted = (() => {
      if (!qrSetting?.value) return false;
      try {
        const parsed = JSON.parse(qrSetting.value);
        const list = Array.isArray(parsed) ? parsed : [];
        // at least one active table QR + kiosk
        const hasTable = list.some((q: any) => q?.type === 'table' && q?.status !== 'inactive');
        const hasKiosk = list.some((q: any) => q?.type === 'kiosk' && q?.status !== 'inactive');
        return hasTable && hasKiosk;
      } catch {
        return false;
      }
    })();

    const checklist = [
      {
        id: 'tables_configured',
        label: 'Tables configured (layout/seat map exists)',
        ok: seatCount > 0,
        detail: seatCount > 0 ? `${seatCount} active tables` : 'No active tables found',
      },
      {
        id: 'qr_minted',
        label: 'QR codes minted and stored durably',
        ok: qrMinted,
        detail: qrMinted ? `Stored QR pack (updated ${qrSetting?.updatedAt?.toISOString?.() || 'recently'})` : 'QR pack not found in storage',
      },
      {
        id: 'pricing_ready',
        label: 'Pricing rule configured (BASE_SESSION)',
        ok: !!pricingRule,
        detail: pricingRule ? 'Active pricing rule found' : 'No active BASE_SESSION pricing rule found',
      },
      {
        id: 'staff_invited',
        label: 'Staff configured (at least one staff email/role)',
        ok: staffConfigured,
        detail: staffConfigured ? 'Staff list present' : 'No staff configured yet',
      },
      {
        id: 'test_payment',
        label: 'First paid session recorded (smoke test)',
        ok: sessionPaidCount > 0,
        detail: sessionPaidCount > 0 ? `${sessionPaidCount} paid session(s)` : 'No paid sessions yet',
      },
    ];

    const okCount = checklist.filter((c) => c.ok).length;
    const total = checklist.length;

    return NextResponse.json({
      success: true,
      loungeId,
      score: { ok: okCount, total },
      checklist,
    });
  } catch (error: any) {
    console.error('[LaunchPad Readiness] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to compute readiness', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

