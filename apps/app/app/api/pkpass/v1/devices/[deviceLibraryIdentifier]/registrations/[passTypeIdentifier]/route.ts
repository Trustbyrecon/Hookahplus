import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../../../lib/db';
import { computePassAuthToken, parseApplePassAuthorizationHeader } from '../../../../../../../../lib/passkit/auth';
import { getCodigoPassLastUpdatedAt } from '../../../../../../../../lib/passkit/last-updated';
import { getPasskitConfig, requirePassTypeIdentifierOrThrow } from '../../../../../../../../lib/passkit/webservice';

function parseUpdatedSince(value: string | null): Date | null {
  if (!value) return null;
  const n = Number(value);
  if (Number.isFinite(n) && n > 0) {
    // Apple may send seconds since epoch; detect ms vs sec.
    const ms = n < 1e12 ? n * 1000 : n;
    return new Date(ms);
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ deviceLibraryIdentifier: string; passTypeIdentifier: string }> }
) {
  try {
    const { deviceLibraryIdentifier, passTypeIdentifier } = await ctx.params;
    requirePassTypeIdentifierOrThrow(passTypeIdentifier);

    const regs = await prisma.passkitRegistration.findMany({
      where: { deviceLibraryIdentifier, passTypeIdentifier },
      select: { serialNumber: true },
    }).catch(() => []);

    // If persistence isn't available yet (or nothing is registered), fail-soft.
    // This keeps passes usable even before registrations storage is deployed.
    if (regs.length === 0) {
      return NextResponse.json(
        { serialNumbers: [], lastUpdated: new Date().toISOString() },
        { status: 200 }
      );
    }

    // Require Authorization header; validate it against at least one registered pass on this device.
    const provided = parseApplePassAuthorizationHeader(req.headers.get('authorization'));
    if (!provided) {
      return NextResponse.json(
        { serialNumbers: [], lastUpdated: new Date().toISOString() },
        { status: 200 }
      );
    }

    const { authSecret } = getPasskitConfig();
    if (!authSecret) {
      return NextResponse.json({ error: 'Missing required env: PASSKIT_AUTH_SECRET' }, { status: 501 });
    }

    const authed = regs.some((r) => computePassAuthToken({ serialNumber: r.serialNumber, secret: authSecret }) === provided);
    if (!authed) {
      return NextResponse.json(
        { serialNumbers: [], lastUpdated: new Date().toISOString() },
        { status: 200 }
      );
    }

    const since = parseUpdatedSince(new URL(req.url).searchParams.get('passesUpdatedSince'));
    const serialNumbers: string[] = [];
    for (const r of regs) {
      const lastUpdated = await getCodigoPassLastUpdatedAt(r.serialNumber);
      if (!since || lastUpdated.getTime() > since.getTime()) {
        serialNumbers.push(r.serialNumber);
      }
    }

    return NextResponse.json(
      {
        serialNumbers,
        lastUpdated: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    const status = Number(error?.status) || (String(error?.message || '').startsWith('Missing required env:') ? 501 : 500);
    return NextResponse.json({ error: error?.message || 'Failed to list registrations' }, { status });
  }
}

