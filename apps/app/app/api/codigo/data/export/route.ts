import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { prisma } from '../../../../../lib/db';
import { getHIDSalt } from '../../../../../lib/env';

function hashWithSalt(value: string): string {
  const salt = getHIDSalt();
  return createHash('sha256').update(value + salt).digest('hex');
}

async function assertDeviceOwnsMember(memberId: string, deviceId: string): Promise<void> {
  const deviceHash = hashWithSalt(String(deviceId).trim());
  const link = await prisma.networkPIILink.findUnique({
    where: { piiType_piiHash: { piiType: 'device_id', piiHash: deviceHash } },
    select: { hid: true },
  });
  if (!link || link.hid !== memberId) {
    throw new Error('DEVICE_NOT_AUTHORIZED');
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const memberId = (searchParams.get('memberId') || '').trim();
    const deviceId = (searchParams.get('deviceId') || '').trim();
    if (!memberId || !deviceId) {
      return NextResponse.json(
        { error: 'memberId and deviceId are required' },
        { status: 400 }
      );
    }

    await assertDeviceOwnsMember(memberId, deviceId);

    const profile = await prisma.networkProfile.findUnique({
      where: { hid: memberId },
      include: {
        preferences: true,
        badges: { orderBy: { awardedAt: 'desc' } },
        notes: { orderBy: { createdAt: 'desc' } },
        piiLinks: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    const payload = {
      exportedAt: new Date().toISOString(),
      profile: {
        hid: profile.hid,
        consentLevel: profile.consentLevel,
        tier: profile.tier,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
        preferences: profile.preferences
          ? {
              topFlavors: profile.preferences.topFlavors,
              devicePrefs: profile.preferences.devicePrefs,
              updatedAt: profile.preferences.updatedAt,
            }
          : null,
        badges: profile.badges.map((b) => ({
          badgeCode: b.badgeCode,
          awardedAt: b.awardedAt,
          meta: b.meta,
        })),
        notes: profile.notes.map((n) => ({
          noteId: n.noteId,
          loungeId: n.loungeId,
          shareScope: n.shareScope,
          staffId: n.staffId,
          noteText: n.noteText,
          tags: n.tags,
          createdAt: n.createdAt,
        })),
        piiLinks: profile.piiLinks.map((l) => ({
          piiType: l.piiType,
          verified: l.verified,
          verifiedAt: l.verifiedAt,
          createdAt: l.createdAt,
          // We intentionally do not export raw PII. Hashes are still sensitive;
          // include them only if the guest explicitly asked (future).
        })),
      },
    };

    const safeMember = memberId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 24) || 'member';
    return NextResponse.json(payload, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="hookahplus-export-${safeMember}.json"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    const code = String(error?.message || '');
    if (code === 'DEVICE_NOT_AUTHORIZED') {
      return NextResponse.json(
        { error: 'This device is not authorized for that memberId' },
        { status: 403 }
      );
    }
    console.error('[CODIGO Export] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to export data' },
      { status: 500 }
    );
  }
}

