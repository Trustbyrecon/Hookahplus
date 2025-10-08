import { NextRequest, NextResponse } from 'next/server';
import { MixSaveRequest, MixSaveResponse, MixProfile } from '@/types/guest';
import { featureFlags } from './flags';
import { createGhostLogEntry } from './hash';
import { v4 as uuidv4 } from 'uuid';

// Mock data stores
const sessions = new Map<string, any>();
const savedMixes = new Map<string, MixProfile>();
const guestProfiles = new Map<string, any>();

/**
 * POST /api/guest/mix/save
 * 
 * Saves a flavor mix for a session and provides suggestions
 */
export async function POST(req: NextRequest) {
  try {
    const body: MixSaveRequest = await req.json();
    const { sessionId, flavors, notes, name } = body;

    // Validate required fields
    if (!sessionId || !flavors || flavors.length === 0) {
      return NextResponse.json({
        ok: false,
        error: 'Missing required fields: sessionId, flavors'
      }, { status: 400 });
    }

    // Get session
    const session = sessions.get(sessionId);
    if (!session) {
      return NextResponse.json({
        ok: false,
        error: 'Session not found'
      }, { status: 404 });
    }

    // Update session mix
    session.mix = {
      flavors,
      notes: notes || '',
      mixId: name ? `mix_${uuidv4()}` : undefined
    };

    // Save mix if name provided
    let mixId: string | undefined;
    if (name) {
      mixId = `mix_${uuidv4()}`;
      const savedMix: MixProfile = {
        mixId,
        name,
        flavors,
        notes: notes || '',
        createdAt: new Date().toISOString(),
        timesUsed: 1
      };
      
      savedMixes.set(mixId, savedMix);

      // Add to guest profile
      const guestProfile = guestProfiles.get(session.guestId);
      if (guestProfile && guestProfile.preferences) {
        guestProfile.preferences.savedMixes.push(savedMix);
        guestProfiles.set(session.guestId, guestProfile);
      }
    }

    // Generate suggestions based on flavors
    const suggestions = generateMixSuggestions(flavors);

    // Log mix selection event
    const flags = featureFlags.getLoungeFlags(session.loungeId);
    if (flags.ghostlog.lite) {
      const eventPayload = {
        sessionId,
        guestId: session.guestId,
        flavors,
        notes,
        mixId,
        timestamp: new Date().toISOString()
      };

      const ghostLogEntry = createGhostLogEntry('mix.selected', eventPayload);
      console.log('Mix selection logged:', ghostLogEntry);
    }

    const response: MixSaveResponse = {
      ok: true,
      mixId,
      suggestions
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Mix save error:', error);
    
    return NextResponse.json({
      ok: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

/**
 * Generate mix suggestions based on selected flavors
 */
function generateMixSuggestions(flavors: string[]): string[] {
  const flavorSuggestions: Record<string, string[]> = {
    'Blue Mist': ['Mint Fresh', 'Double Apple', 'Grape'],
    'Mint Fresh': ['Blue Mist', 'Lemon', 'Orange'],
    'Double Apple': ['Blue Mist', 'Grape', 'Strawberry'],
    'Grape': ['Double Apple', 'Blue Mist', 'Watermelon'],
    'Strawberry': ['Double Apple', 'Mint Fresh', 'Lemon'],
    'Lemon': ['Mint Fresh', 'Orange', 'Strawberry'],
    'Orange': ['Lemon', 'Mint Fresh', 'Grape'],
    'Watermelon': ['Grape', 'Strawberry', 'Blue Mist']
  };

  const suggestions: string[] = [];
  
  // Get suggestions for each selected flavor
  flavors.forEach(flavor => {
    const flavorSuggestionsList = flavorSuggestions[flavor] || [];
    suggestions.push(...flavorSuggestionsList);
  });

  // Remove duplicates and selected flavors
  const uniqueSuggestions = [...new Set(suggestions)]
    .filter(suggestion => !flavors.includes(suggestion))
    .slice(0, 3); // Return top 3 suggestions

  return uniqueSuggestions;
}

/**
 * GET /api/guest/mix/save
 * 
 * Gets saved mixes for a guest
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const guestId = searchParams.get('guestId');

    if (!guestId) {
      return NextResponse.json({
        ok: false,
        error: 'Missing guestId parameter'
      }, { status: 400 });
    }

    const guestProfile = guestProfiles.get(guestId);
    if (!guestProfile) {
      return NextResponse.json({
        ok: false,
        error: 'Guest not found'
      }, { status: 404 });
    }

    const savedMixes = guestProfile.preferences?.savedMixes || [];

    return NextResponse.json({
      ok: true,
      mixes: savedMixes
    });

  } catch (error) {
    console.error('Get saved mixes error:', error);
    
    return NextResponse.json({
      ok: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
