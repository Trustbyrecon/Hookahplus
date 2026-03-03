import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { requireRole, getCurrentTenant } from '../../../../lib/auth';

const ONBOARDING_TYPES = [
  'onboarding.signup',
  'pos.waitlist.signup',
  'cta.onboarding_signup',
  'cta.demo_request',
  'sync.optimize.onboarding',
];

function parseLeadFromEvent(event: {
  id: string;
  type: string;
  source: string;
  ctaSource: string | null;
  ctaType: string | null;
  payload: string | null;
  createdAt: Date;
  tenantId: string | null;
}) {
  let payload: Record<string, unknown> = {};
  try {
    payload = event.payload ? JSON.parse(event.payload) : {};
  } catch {
    // ignore parse errors
  }

  let data: Record<string, unknown> = {};
  const pb = payload.behavior as { payload?: Record<string, unknown> } | undefined;
  const pl = payload.lead as Record<string, unknown> | undefined;
  if (pb?.payload) {
    data = { ...payload, ...pb.payload };
  } else if (pl) {
    data = { ...payload, ...pl };
  } else {
    data = (payload.data as Record<string, unknown>) || payload;
  }

  const stage = (data.stage as string) || 'new-leads';
  const notes = (data.notes as Array<{ id: string; content: string; author: string; createdAt: string; type: string }>) || [];

  return {
    id: event.id,
    createdAt: event.createdAt.toISOString(),
    source: event.source || 'ui',
    type: event.type,
    businessName: (data.businessName as string) || (data.loungeName as string) || 'Unknown',
    ownerName: (data.ownerName as string) || (data.name as string) || '',
    email: (data.email as string) || '',
    phone: (data.phone as string) || '',
    location: (data.location as string) || (data.city as string) || '',
    operatorGroupName: (data.operatorGroupName as string) || null,
    locationCount: (data.locationCount as number) ?? null,
    locationNames: (data.locationNames as string[]) || [],
    seatingTypes: (data.seatingTypes as string[]) || [],
    totalCapacity: String(data.totalCapacity ?? ''),
    numberOfTables: String(data.numberOfTables ?? ''),
    currentPOS: (data.currentPOS as string) || '',
    pricingModel: (data.pricingModel as string) || '',
    preferredFeatures: (data.preferredFeatures as string[]) || [],
    stage: stage as 'new-leads' | 'intake' | 'follow-up' | 'scheduled' | 'onboarding' | 'complete',
    notes,
    scheduledFollowUp: (data.scheduledFollowUp as string) || null,
    lastContacted: (data.lastContacted as string) || null,
    assignedTo: (data.assignedTo as string) || null,
    selectedTier: (data.selectedTier as string) || null,
    conversionProbability: (data.conversionProbability as number) ?? null,
    menuLink: (data.menuLink as string) || null,
    baseHookahPrice: (data.baseHookahPrice as string) || null,
    refillPrice: (data.refillPrice as string) || null,
    instagramUrl: (data.instagramUrl as string) || (data.instagram as string) || null,
    facebookUrl: (data.facebookUrl as string) || (data.facebook as string) || null,
    websiteUrl: (data.websiteUrl as string) || (data.website as string) || null,
    demoLink: (data.demoLink as string) || null,
    instagramScrapedData: (data.instagramScrapedData as object) || null,
    menuFiles: (data.menuFiles as unknown[]) || null,
    extractedMenuData: (data.extractedMenuData as object) || null,
  };
}

function computeStats(leads: ReturnType<typeof parseLeadFromEvent>[]) {
  const stats = {
    total: leads.length,
    newLeads: 0,
    intake: 0,
    followUp: 0,
    scheduled: 0,
    onboarding: 0,
    complete: 0,
  };
  for (const lead of leads) {
    const s = lead.stage;
    if (s === 'new-leads') stats.newLeads++;
    else if (s === 'intake') stats.intake++;
    else if (s === 'follow-up') stats.followUp++;
    else if (s === 'scheduled') stats.scheduled++;
    else if (s === 'onboarding') stats.onboarding++;
    else if (s === 'complete') stats.complete++;
  }
  return stats;
}

export async function GET(req: NextRequest) {
  let tenantId: string | null = null;
  if (process.env.NODE_ENV === 'production') {
    try {
      await requireRole(req, ['owner', 'admin']);
      tenantId = await getCurrentTenant(req);
    } catch (authError) {
      return NextResponse.json(
        { error: 'Authentication required', details: authError instanceof Error ? authError.message : 'Unknown' },
        { status: 401 }
      );
    }
  }

  try {
    const whereClause: Record<string, unknown> = {
      NOT: { type: 'admin.operator_onboarding.update' },
    };

    const { searchParams } = new URL(req.url);
    const stage = searchParams.get('stage');
    const demo = searchParams.get('demo') === 'true';

    if (demo) {
      whereClause.type = { in: ['cta.demo_request', 'onboarding.signup', ...ONBOARDING_TYPES] };
    } else {
      whereClause.OR = [
        { type: { in: ONBOARDING_TYPES } },
        { type: { startsWith: 'cta.' } },
        { type: 'pos.waitlist.signup' },
      ];
    }

    if (tenantId && process.env.NODE_ENV === 'production') {
      (whereClause as { tenantId?: string }).tenantId = tenantId;
    }

    const events = await prisma.reflexEvent.findMany({
      where: whereClause as object,
      orderBy: { createdAt: 'desc' },
      take: 2000,
      select: {
        id: true,
        type: true,
        source: true,
        ctaSource: true,
        ctaType: true,
        payload: true,
        createdAt: true,
        tenantId: true,
      },
    });

    let leads = events.map(parseLeadFromEvent);

    if (stage && stage !== 'all') {
      leads = leads.filter((l) => l.stage === stage);
    }

    const stats = computeStats(leads);

    return NextResponse.json({
      leads,
      stats,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    const code = (err as { code?: string })?.code;
    const isTableMissing =
      typeof msg === 'string' &&
      (msg.includes('does not exist') || msg.includes('reflex_events') || code === '42P01');

    if (isTableMissing) {
      return NextResponse.json(
        {
          error: 'ReflexEvent table not found',
          details: msg,
          hint: 'Run: npm run db:migrate:app',
        },
        { status: 503 }
      );
    }

    console.error('[Operator Onboarding GET] Error:', err);
    return NextResponse.json(
      { error: 'Failed to load onboarding data', details: msg },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  let tenantId: string | null = null;
  if (process.env.NODE_ENV === 'production') {
    try {
      await requireRole(req, ['owner', 'admin']);
      tenantId = await getCurrentTenant(req);
    } catch (authError) {
      return NextResponse.json(
        { error: 'Authentication required', details: authError instanceof Error ? authError.message : 'Unknown' },
        { status: 401 }
      );
    }
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const action = body.action as string;
  if (!action) {
    return NextResponse.json({ error: 'Missing action' }, { status: 400 });
  }

  try {
    if (action === 'create_lead') {
      const leadData = body.leadData as Record<string, unknown>;
      if (!leadData || typeof leadData !== 'object') {
        return NextResponse.json({ error: 'Missing leadData' }, { status: 400 });
      }

      const payload = {
        ...leadData,
        stage: leadData.stage || 'new-leads',
        notes: leadData.notes || [],
        createdAt: leadData.createdAt || new Date().toISOString(),
      };

      const event = await prisma.reflexEvent.create({
        data: {
          type: 'onboarding.signup',
          source: (leadData.source as string) || 'manual',
          ctaSource: (leadData.ctaSource as string) || 'manual',
          ctaType: 'onboarding_signup',
          payload: JSON.stringify(payload),
          tenantId: tenantId || undefined,
        },
      });

      return NextResponse.json({
        success: true,
        leadId: event.id,
        message: 'Lead created',
      });
    }

    if (action === 'update_stage') {
      const leadId = body.leadId as string;
      const updates = (body.updates as Record<string, unknown>) || {};
      if (!leadId) {
        return NextResponse.json({ error: 'Missing leadId' }, { status: 400 });
      }

      const existing = await prisma.reflexEvent.findUnique({
        where: { id: leadId },
        select: { payload: true, type: true },
      });

      if (!existing) {
        return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
      }

      let payload: Record<string, unknown> = {};
      try {
        payload = existing.payload ? JSON.parse(existing.payload) : {};
      } catch {
        payload = {};
      }

      const merged = { ...payload, ...updates, stage: updates.stage ?? payload.stage };

      await prisma.reflexEvent.update({
        where: { id: leadId },
        data: { payload: JSON.stringify(merged) },
      });

      return NextResponse.json({ success: true, message: 'Stage updated' });
    }

    if (action === 'add_note') {
      const leadId = body.leadId as string;
      const updates = (body.updates as { notes?: unknown[] }) || {};
      if (!leadId) {
        return NextResponse.json({ error: 'Missing leadId' }, { status: 400 });
      }

      const existing = await prisma.reflexEvent.findUnique({
        where: { id: leadId },
        select: { payload: true },
      });

      if (!existing) {
        return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
      }

      let payload: Record<string, unknown> = {};
      try {
        payload = existing.payload ? JSON.parse(existing.payload) : {};
      } catch {
        payload = {};
      }

      const existingNotes = (payload.notes as Array<Record<string, unknown>>) || [];
      const newNotes = updates.notes || [];
      const notes = [...existingNotes, ...newNotes];

      const merged = { ...payload, notes };

      await prisma.reflexEvent.update({
        where: { id: leadId },
        data: { payload: JSON.stringify(merged) },
      });

      return NextResponse.json({ success: true, message: 'Note added' });
    }

    if (action === 'schedule_followup' || action === 'mark_contacted') {
      const leadId = body.leadId as string;
      const updates = (body.updates as Record<string, unknown>) || {};
      if (!leadId) {
        return NextResponse.json({ error: 'Missing leadId' }, { status: 400 });
      }

      const existing = await prisma.reflexEvent.findUnique({
        where: { id: leadId },
        select: { payload: true },
      });

      if (!existing) {
        return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
      }

      let payload: Record<string, unknown> = {};
      try {
        payload = existing.payload ? JSON.parse(existing.payload) : {};
      } catch {
        payload = {};
      }

      const merged = { ...payload, ...updates };

      await prisma.reflexEvent.update({
        where: { id: leadId },
        data: { payload: JSON.stringify(merged) },
      });

      return NextResponse.json({ success: true, message: 'Updated' });
    }

    if (action === 'delete_lead' || action === 'bulk_delete') {
      const ids = action === 'bulk_delete'
        ? (body.leadIds as string[])
        : [(body.leadId as string)];
      if (!ids?.length || ids.some((id: unknown) => typeof id !== 'string')) {
        return NextResponse.json({ error: 'Missing leadId or leadIds' }, { status: 400 });
      }

      await prisma.reflexEvent.deleteMany({
        where: { id: { in: ids } },
      });

      return NextResponse.json({ success: true, message: 'Deleted' });
    }

    if (action === 'create_demo_session' || action === 'send_test_link') {
      const leadId = body.leadId as string;
      if (!leadId) {
        return NextResponse.json({ error: 'Missing leadId' }, { status: 400 });
      }

      const existing = await prisma.reflexEvent.findUnique({
        where: { id: leadId },
        select: { payload: true },
      });

      if (!existing) {
        return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
      }

      let payload: Record<string, unknown> = {};
      try {
        payload = existing.payload ? JSON.parse(existing.payload) : {};
      } catch {
        payload = {};
      }

      const demoLink = (body.testLink as string) || `https://app.hookahplus.net/demo/fire-session?lead=${leadId}`;
      const merged = { ...payload, demoLink };

      await prisma.reflexEvent.update({
        where: { id: leadId },
        data: { payload: JSON.stringify(merged) },
      });

      return NextResponse.json({
        success: true,
        demoLink,
        message: action === 'create_demo_session' ? 'Demo session created' : 'Test link sent',
      });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    const code = (err as { code?: string })?.code;
    const isTableMissing =
      typeof msg === 'string' &&
      (msg.includes('does not exist') || msg.includes('reflex_events') || code === '42P01');

    if (isTableMissing) {
      return NextResponse.json(
        {
          error: 'ReflexEvent table not found',
          details: msg,
          hint: 'Run: npm run db:migrate:app',
        },
        { status: 503 }
      );
    }

    console.error('[Operator Onboarding POST] Error:', err);
    return NextResponse.json(
      { error: 'Failed to process request', details: msg },
      { status: 500 }
    );
  }
}
