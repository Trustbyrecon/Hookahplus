import { NextResponse } from 'next/server';
import { PrismaClient, SessionSource, SessionState } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('mode');
  if (mode !== 'demo') {
    return NextResponse.json({ error: 'Demo mode required' }, { status: 403 });
  }

  const loungeId = searchParams.get('loungeId') || 'districk-hookah';
  const demoNoteFilterText = 'Demo session';

  const existingSession = await prisma.session.findFirst({
    where: {
      loungeId,
      state: {
        in: [SessionState.PENDING, SessionState.ACTIVE, SessionState.PAUSED],
      },
      notes: {
        some: {
          text: {
            contains: demoNoteFilterText,
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (existingSession) {
    await prisma.session.update({
      where: { id: existingSession.id },
      data: {
        state: SessionState.CANCELED,
        updatedAt: new Date(),
        notes: {
          create: {
            noteType: 'info',
            text: 'Demo session voided via reset endpoint',
            createdBy: 'system',
          },
        },
      },
    });
  }

  const timestamp = Date.now();
  const newSession = await prisma.session.create({
    data: {
      loungeId,
      state: SessionState.PENDING,
      source: SessionSource.WALK_IN,
      trustSignature: `demo-reset-${timestamp}`,
      priceCents: 3500,
      paymentStatus: 'pending',
      externalRef: `demo-${timestamp}`,
      notes: {
        create: {
          noteType: 'info',
          text: 'Demo session created via reset endpoint',
          createdBy: 'system',
        },
      },
    },
  });

  return NextResponse.json({ success: true, sessionId: newSession.id }, { status: 201 });
}
