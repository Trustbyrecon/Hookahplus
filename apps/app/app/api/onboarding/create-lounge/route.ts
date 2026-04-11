import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { buildLiteLoungeOpsConfig } from '../../../../lib/onboarding/buildLiteLoungeConfig';
import { seedDefaultTables } from '../../../../lib/lounges/seedDefaultTables';

export const runtime = 'nodejs';

type Body = {
  name?: string;
  city?: string;
  tableCount?: number;
  basePrice?: number;
  flavors?: string[];
  premiumFlavors?: string[];
  premiumAddonDollars?: number;
};

export async function POST(req: NextRequest) {
  let body: Body = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const name = typeof body.name === 'string' ? body.name : '';
  const city = typeof body.city === 'string' ? body.city : undefined;
  const tableCountRaw = Number(body.tableCount);
  const tableCount = Number.isFinite(tableCountRaw) ? Math.floor(tableCountRaw) : 10;
  const baseRaw = Number(body.basePrice);
  const basePrice = Number.isFinite(baseRaw) ? baseRaw : 30;

  const flavors = Array.isArray(body.flavors)
    ? body.flavors.filter((f): f is string => typeof f === 'string')
    : [];

  const premiumFlavors = Array.isArray(body.premiumFlavors)
    ? body.premiumFlavors.filter((f): f is string => typeof f === 'string')
    : [];

  const premAddonRaw = body.premiumAddonDollars;
  const premiumAddonDollars =
    premAddonRaw !== undefined && Number.isFinite(Number(premAddonRaw))
      ? Number(premAddonRaw)
      : undefined;

  if (!name.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }

  const safeTables = Math.min(200, Math.max(1, tableCount));
  const safeBase = Math.min(500, Math.max(0, basePrice));

  const config = buildLiteLoungeOpsConfig({
    name: name.trim(),
    city,
    tableCount: safeTables,
    basePriceDollars: safeBase,
    flavors,
    premiumFlavorNames: premiumFlavors.length > 0 ? premiumFlavors : undefined,
    premiumAddonDollars,
  });

  try {
    const tenant = await prisma.tenant.create({
      data: { name: config.lounge_name },
    });
    const loungeId = tenant.id;

    await prisma.loungeConfig.create({
      data: {
        loungeId,
        configData: JSON.stringify(config),
        version: 1,
      },
    });

    const baseSessionPriceCents = Math.round(config.base_session_price * 100);
    try {
      await prisma.pricingRule.create({
        data: {
          loungeId,
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
    } catch (e) {
      console.warn('[H+ Lite onboarding] pricing rule skipped:', e);
    }

    try {
      await seedDefaultTables(loungeId, safeTables);
    } catch (e) {
      console.error('[H+ Lite onboarding] seedDefaultTables:', e);
    }

    const flavorRows = [
      ...config.flavors.standard.map((f) => ({
        loungeId,
        name: f.name,
        isPremium: false,
        isActive: true,
      })),
      ...config.flavors.premium.map((f) => ({
        loungeId,
        name: f.name,
        isPremium: true,
        isActive: true,
      })),
    ];
    if (flavorRows.length > 0) {
      try {
        await prisma.flavor.createMany({ data: flavorRows });
      } catch (e) {
        console.warn('[H+ Lite onboarding] flavor createMany:', e);
      }
    }

    const seats = await prisma.seat.findMany({
      where: { loungeId },
      orderBy: { tableId: 'asc' },
      select: { tableId: true, name: true },
    });

    const tables = seats.length
      ? seats.map((s) => s.name || s.tableId)
      : Array.from({ length: safeTables }, (_, i) => `T-${String(i + 1).padStart(3, '0')}`);

    return NextResponse.json({
      loungeId,
      tables,
      context: {
        loungeId,
        name: config.lounge_name,
        city: config.city ?? null,
        tables,
        basePrice: config.base_session_price,
        flavors: config.flavors.standard.map((f) => f.name),
        premiumFlavors: config.flavors.premium.map((f) => f.name),
      },
    });
  } catch (err) {
    console.error('[H+ Lite onboarding] create-lounge:', err);
    return NextResponse.json(
      {
        error: 'Failed to create lounge',
        details: err instanceof Error ? err.message : 'Unknown',
      },
      { status: 500 }
    );
  }
}
