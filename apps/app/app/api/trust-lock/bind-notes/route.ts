// Trust Lock Notes Binding API
import { NextRequest, NextResponse } from 'next/server';
import { sessionNotesLoyaltyBinding } from '../../../../lib/sessionNotesLoyaltyBinding';

export async function POST(req: NextRequest) {
  try {
    const { customerId, sessionId, notes, noteType, createdBy, venueId } = await req.json();
    
    const binding = await sessionNotesLoyaltyBinding.bindNoteToLoyalty(
      customerId,
      sessionId,
      `note_${Date.now()}`,
      notes,
      noteType,
      createdBy,
      venueId
    );
    
    const loyaltyProgression = await sessionNotesLoyaltyBinding.getLoyaltyProgression(customerId, venueId);
    const behavioralInsights = sessionNotesLoyaltyBinding.getBehavioralInsights(customerId);
    
    return NextResponse.json({
      ok: true,
      binding,
      loyaltyProgression,
      behavioralInsights
    });
  } catch (error) {
    console.error('Trust lock notes binding error:', error);
    return NextResponse.json({ ok: false, error: 'Failed to bind notes' }, { status: 500 });
  }
}
