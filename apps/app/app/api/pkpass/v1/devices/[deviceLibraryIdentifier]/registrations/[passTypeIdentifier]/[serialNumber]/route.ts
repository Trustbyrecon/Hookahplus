import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { assertApplePassAuthOrThrow, requirePassTypeIdentifierOrThrow } from '@/lib/passkit/webservice';

async function upsertRegistration(args: {
  deviceLibraryIdentifier: string;
  passTypeIdentifier: string;
  serialNumber: string;
  pushToken: string;
}) {
  try {
    await prisma.passkitRegistration.upsert({
      where: {
        deviceLibraryIdentifier_passTypeIdentifier_serialNumber: {
          deviceLibraryIdentifier: args.deviceLibraryIdentifier,
          passTypeIdentifier: args.passTypeIdentifier,
          serialNumber: args.serialNumber,
        },
      },
      create: {
        deviceLibraryIdentifier: args.deviceLibraryIdentifier,
        passTypeIdentifier: args.passTypeIdentifier,
        serialNumber: args.serialNumber,
        pushToken: args.pushToken,
      },
      update: {
        pushToken: args.pushToken,
      },
    });
    return { ok: true as const };
  } catch (e: any) {
    // If the table doesn't exist yet (migration not deployed), accept registration but can't persist.
    return { ok: false as const, error: e };
  }
}

async function deleteRegistration(args: {
  deviceLibraryIdentifier: string;
  passTypeIdentifier: string;
  serialNumber: string;
}) {
  try {
    await prisma.passkitRegistration.delete({
      where: {
        deviceLibraryIdentifier_passTypeIdentifier_serialNumber: {
          deviceLibraryIdentifier: args.deviceLibraryIdentifier,
          passTypeIdentifier: args.passTypeIdentifier,
          serialNumber: args.serialNumber,
        },
      },
    });
  } catch {
    // Best-effort
  }
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ deviceLibraryIdentifier: string; passTypeIdentifier: string; serialNumber: string }> }
) {
  try {
    const { deviceLibraryIdentifier, passTypeIdentifier, serialNumber } = await ctx.params;
    requirePassTypeIdentifierOrThrow(passTypeIdentifier);
    assertApplePassAuthOrThrow({ authorizationHeader: req.headers.get('authorization'), serialNumber });

    const body = await req.json().catch(() => null);
    const pushToken = String(body?.pushToken || '').trim();
    if (!pushToken) {
      return NextResponse.json({ error: 'pushToken is required' }, { status: 400 });
    }

    const res = await upsertRegistration({ deviceLibraryIdentifier, passTypeIdentifier, serialNumber, pushToken });
    // Spec: 201 Created if new, 200 if already existed. We'll just return 201 for simplicity.
    return NextResponse.json({ success: true, persisted: res.ok }, { status: 201 });
  } catch (error: any) {
    const status = Number(error?.status) || (String(error?.message || '').startsWith('Missing required env:') ? 501 : 500);
    return NextResponse.json({ error: error?.message || 'Failed to register device' }, { status });
  }
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ deviceLibraryIdentifier: string; passTypeIdentifier: string; serialNumber: string }> }
) {
  try {
    const { deviceLibraryIdentifier, passTypeIdentifier, serialNumber } = await ctx.params;
    requirePassTypeIdentifierOrThrow(passTypeIdentifier);
    assertApplePassAuthOrThrow({ authorizationHeader: req.headers.get('authorization'), serialNumber });

    await deleteRegistration({ deviceLibraryIdentifier, passTypeIdentifier, serialNumber });
    return new NextResponse(null, { status: 200 });
  } catch (error: any) {
    const status = Number(error?.status) || (String(error?.message || '').startsWith('Missing required env:') ? 501 : 500);
    return NextResponse.json({ error: error?.message || 'Failed to unregister device' }, { status });
  }
}

