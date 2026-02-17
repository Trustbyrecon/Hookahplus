import { prisma } from '../db';
import { loadSetupSession } from './session-manager';

export type ReadinessChecklistItem = {
  id: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type ReadinessResult = {
  success: true;
  loungeId: string;
  score: { ok: number; total: number };
  checklist: ReadinessChecklistItem[];
};

export async function computeReadiness(params: {
  loungeId: string;
  token?: string;
}): Promise<ReadinessResult> {
  const loungeId = (params.loungeId || '').trim();
  const token = (params.token || '').trim();
  if (!loungeId) {
    return {
      success: true,
      loungeId: '',
      score: { ok: 0, total: 0 },
      checklist: [],
    };
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

  const staffCountFromProgress = Array.isArray((progress as any)?.data?.step4?.staff) ? (progress as any).data.step4.staff.length : 0;
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

  const checklist: ReadinessChecklistItem[] = [
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

  return {
    success: true,
    loungeId,
    score: { ok: okCount, total },
    checklist,
  };
}

