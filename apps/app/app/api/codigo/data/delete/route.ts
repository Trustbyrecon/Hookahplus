import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createHash } from 'crypto';
import { prisma } from '../../../../../lib/db';
import { getHIDSalt } from '../../../../../lib/env';

const BodySchema = z.object({
  memberId: z.string().trim().min(1).max(120),
  deviceId: z.string().trim().min(4).max(200),
});

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

export async function POST(req: NextRequest) {
  try {
    const json = await req.json().catch(() => null);
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { memberId, deviceId } = parsed.data;

    await assertDeviceOwnsMember(memberId, deviceId);

    await prisma.$transaction(async (tx) => {
      // Detach from sessions so history stays, but identity is removed.
      await tx.session.updateMany({
        where: { hid: memberId },
        data: { hid: null },
      });

      // Cascade deletes preferences, badges, notes, PII links.
      await tx.networkProfile.delete({
        where: { hid: memberId },
      });
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    const code = String(error?.message || '');
    if (code === 'DEVICE_NOT_AUTHORIZED') {
      return NextResponse.json(
        { error: 'This device is not authorized for that memberId' },
        { status: 403 }
      );
    }
    console.error('[CODIGO Delete] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete data' },
      { status: 500 }
    );
  }
}

