import { NextRequest, NextResponse } from 'next/server';
import { createGhostLogEntry } from '../../../../lib/ghost-log';
import { prisma } from '../../../../lib/prisma';
import { resolveHID } from '../../../../lib/hid/resolver';
import { syncNoteToNetwork } from '../../../../lib/profiles/network';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      session_id, 
      note, 
      visibility = 'private',
      share_scope = 'lounge', // NEW: lounge | network
      created_by,
      customer_phone, // NEW: for HID resolution
      customer_email  // NEW: for HID resolution
    } = body;

    // Validate required fields
    if (!session_id) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    if (!note) {
      return NextResponse.json({ error: 'Note is required' }, { status: 400 });
    }

    // Validate share_scope
    if (share_scope !== 'lounge' && share_scope !== 'network') {
      return NextResponse.json({ error: 'share_scope must be "lounge" or "network"' }, { status: 400 });
    }

    // Create session note in database
    const sessionNote = await prisma.sessionNote.create({
      data: {
        sessionId: session_id,
        noteType: 'STAFF_OBSERVATION',
        text: note,
        createdBy: created_by || 'system',
        shareScope: share_scope,
      },
    });

    // Log session note creation
    await createGhostLogEntry({
      kind: 'session.note.created',
      note_id: sessionNote.id,
      session_id,
      note,
      visibility,
      share_scope,
      created_by,
      timestamp: sessionNote.createdAt.toISOString()
    });

    // NEW: Sync to network if network-scoped and customer identified
    if (share_scope === 'network' && (customer_phone || customer_email)) {
      try {
        const hidResult = await resolveHID({
          phone: customer_phone,
          email: customer_email,
        });

        if (hidResult.hid) {
          // Get session to find loungeId
          const session = await prisma.session.findUnique({
            where: { id: session_id },
            select: { loungeId: true },
          });

          if (session) {
            await syncNoteToNetwork(
              sessionNote.id,
              hidResult.hid,
              session.loungeId,
              created_by || 'system',
              note,
              share_scope
            );
          }
        }
      } catch (error) {
        console.error('[Session Notes] Failed to sync to network:', error);
        // Don't fail the request, just log
      }
    }

    return NextResponse.json({ 
      success: true, 
      note: {
        id: sessionNote.id,
        session_id: sessionNote.sessionId,
        note: sessionNote.text,
        share_scope: sessionNote.shareScope,
        created_by: sessionNote.createdBy,
        created_at: sessionNote.createdAt.toISOString(),
      },
      message: 'Session note created successfully'
    });

  } catch (error) {
    console.error('Error creating session note:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const session_id = searchParams.get('session_id');
    const scope = searchParams.get('scope') as 'lounge' | 'network' | null;

    if (!session_id) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Get notes from database
    const notes = await prisma.sessionNote.findMany({
      where: {
        sessionId: session_id,
        ...(scope === 'network' ? { shareScope: 'network' } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ 
      notes: notes.map(note => ({
        id: note.id,
        session_id: note.sessionId,
        note: note.text,
        share_scope: note.shareScope,
        created_by: note.createdBy,
        created_at: note.createdAt.toISOString(),
      }))
    });
  } catch (error) {
    console.error('Error retrieving session notes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}