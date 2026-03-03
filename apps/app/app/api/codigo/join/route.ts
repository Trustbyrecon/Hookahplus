import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '../../../../lib/db';
import { resolveHID } from '../../../../lib/hid/resolver';

const JoinBodySchema = z.object({
  firstName: z.string().trim().min(1).max(60),
  nickname: z.string().trim().max(60).optional().nullable(),
  deviceId: z.string().trim().min(4).max(200),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json().catch(() => null);
    const parsed = JoinBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { firstName, nickname, deviceId } = parsed.data;

    const { hid } = await resolveHID({ deviceId });

    const existingPrefs = await prisma.networkPreference.findUnique({
      where: { hid },
      select: { devicePrefs: true },
    });

    const prevDevicePrefs = (existingPrefs?.devicePrefs as any) || {};
    const nextDevicePrefs = {
      ...prevDevicePrefs,
      codigo: {
        loungeId: 'CODIGO',
        firstName,
        nickname: nickname || null,
        updatedAt: new Date().toISOString(),
      },
    };

    await prisma.networkPreference.upsert({
      where: { hid },
      create: {
        hid,
        devicePrefs: nextDevicePrefs,
      },
      update: {
        devicePrefs: nextDevicePrefs,
      },
    });

    return NextResponse.json({ memberId: hid }, { status: 200 });
  } catch (error: any) {
    console.error('[CODIGO Join] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to join' },
      { status: 500 }
    );
  }
}

