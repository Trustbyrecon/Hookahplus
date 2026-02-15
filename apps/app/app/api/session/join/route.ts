import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { buildIdentityKey, resolveSessionParticipant } from '@/lib/session/participant-resolver';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      loungeId,
      tableId,
      identityToken,
      displayName,
      notMe,
    } = body as {
      loungeId?: string;
      tableId?: string;
      identityToken?: string;
      displayName?: string;
      notMe?: boolean;
    };

    if (!loungeId || !tableId) {
      return NextResponse.json({ error: 'loungeId and tableId are required' }, { status: 400 });
    }

    const identityKey = buildIdentityKey({
      loungeId,
      rawIdentity: identityToken || 'anonymous-device',
      forceNew: Boolean(notMe),
    });

    const result = await resolveSessionParticipant(prisma as any, {
      loungeId,
      tableId,
      identityKey,
      displayName: displayName || 'Guest',
      notMe: Boolean(notMe),
    });

    if (result.mode === 'blocked_multi_active') {
      return NextResponse.json({
        success: false,
        blocked: true,
        mode: result.mode,
        message: 'We need staff to confirm your table before continuing.',
        conflictSessionIds: result.conflictSessionIds || [],
        staffResolution: {
          tableId,
          loungeId,
          path: `/admin/pos-ops?loungeId=${encodeURIComponent(loungeId)}&tableId=${encodeURIComponent(tableId)}`,
        },
      }, { status: 409 });
    }

    return NextResponse.json({ 
      success: true, 
      mode: result.mode,
      session_id: result.sessionId,
      participant_id: result.participantId,
      message: result.mode === 'create' ? 'Session created successfully' : 'Session joined successfully',
    });

  } catch (error) {
    console.error('Error joining session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
