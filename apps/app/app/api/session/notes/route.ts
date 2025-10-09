import { NextRequest, NextResponse } from 'next/server';
import { createGhostLogEntry } from '../../ghost-log/route';

// In-memory storage for session notes (in production, this would be a database)
let sessionNotes: Array<{
  id: string;
  session_id: string;
  note: string;
  visibility: 'private' | 'public';
  created_at: string;
  created_by?: string;
}> = [];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { session_id, note, visibility = 'private', created_by } = body;

    // Validate required fields
    if (!session_id) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    if (!note) {
      return NextResponse.json({ error: 'Note is required' }, { status: 400 });
    }

    // Create session note
    const sessionNote = {
      id: `note_${Date.now()}`,
      session_id,
      note,
      visibility,
      created_at: new Date().toISOString(),
      created_by
    };

    sessionNotes.push(sessionNote);

    // Log session note creation
    await createGhostLogEntry({
      kind: 'session.note.created',
      note_id: sessionNote.id,
      session_id,
      note,
      visibility,
      created_by,
      timestamp: sessionNote.created_at
    });

    return NextResponse.json({ 
      success: true, 
      note: sessionNote,
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

    if (!session_id) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const notes = sessionNotes.filter(note => note.session_id === session_id);

    return NextResponse.json({ notes });

  } catch (error) {
    console.error('Error retrieving session notes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}