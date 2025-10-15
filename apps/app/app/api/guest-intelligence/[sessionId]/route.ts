import { NextRequest, NextResponse } from 'next/server';
import { FireSession } from '../../../types/enhancedSession';
import { calculateTrustScore, calculateSingleSessionTrustScore } from '../../../lib/trustScoring';
import { maskSessionData, detectPiiLevel, createPiiSafeSummary } from '../../../lib/piiMasking';

// In-memory storage for sessions (in production, this would be a database)
let sessions: FireSession[] = [
  // Sample sessions for testing
  {
    id: 'session_001',
    tableId: 'T-001',
    customerName: 'Alex Johnson',
    customerPhone: '+1 (555) 123-4567',
    flavor: 'Blue Mist + Mint',
    amount: 3500, // in cents
    status: 'ACTIVE',
    currentStage: 'CUSTOMER',
    assignedStaff: {
      boh: 'Mike Rodriguez',
      foh: 'Sarah Chen'
    },
    createdAt: Date.now() - 3600000, // 1 hour ago
    updatedAt: Date.now(),
    sessionStartTime: Date.now() - 3600000,
    sessionDuration: 45 * 60, // 45 minutes in seconds
    coalStatus: 'active',
    refillStatus: 'none',
    notes: 'Customer prefers mild flavors',
    edgeCase: null,
    sessionTimer: {
      remaining: 15 * 60, // 15 minutes remaining
      total: 45 * 60,
      isActive: true,
      startedAt: Date.now() - 3600000
    },
    bohState: 'PICKED_UP',
    guestTimerDisplay: true
  },
  {
    id: 'session_002',
    tableId: 'T-002',
    customerName: 'Maria Garcia',
    customerPhone: '+1 (555) 234-5678',
    flavor: 'Strawberry Mojito',
    amount: 2800,
    status: 'PREP_IN_PROGRESS',
    currentStage: 'BOH',
    assignedStaff: {
      boh: 'David Wilson',
      foh: 'Emily Davis'
    },
    createdAt: Date.now() - 1800000, // 30 minutes ago
    updatedAt: Date.now(),
    sessionStartTime: undefined,
    sessionDuration: 60 * 60, // 60 minutes
    coalStatus: 'needs_refill',
    refillStatus: 'none',
    notes: 'First-time customer, prefers mild flavors',
    edgeCase: null,
    sessionTimer: undefined,
    bohState: 'PREPARING',
    guestTimerDisplay: false
  }
];

// GET /api/guest-intelligence/[sessionId] - Get customer intelligence
export async function GET(req: NextRequest, { params }: { params: { sessionId: string } }) {
  try {
    const sessionId = params.sessionId;
    const url = new URL(req.url);
    const piiMasking = url.searchParams.get('piiMasking') !== 'false'; // Default to true
    const piiLevel = url.searchParams.get('piiLevel') as 'none' | 'low' | 'medium' | 'high' || 'medium';

    // Find the session
    const session = sessions.find(s => s.id === sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Get all sessions for this customer (by phone number for demo purposes)
    const customerSessions = sessions.filter(s => s.customerPhone === session.customerPhone);
    
    // Calculate trust score
    const trustScoreResult = customerSessions.length > 1 
      ? calculateTrustScore(customerSessions)
      : { 
          score: calculateSingleSessionTrustScore(session), 
          tier: 'bronze' as const,
          recommendations: ['Complete more sessions to build trust']
        };

    // Create PII-safe session data
    const maskedSession = piiMasking ? maskSessionData(session, piiLevel) : session;

    // Generate behavioral memory data
    const behavioralMemory = {
      guestId: session.id,
      preferences: {
        favoriteFlavors: customerSessions.map(s => s.flavor).slice(0, 3),
        preferredZone: 'VIP', // This would come from actual data
        averageSessionDuration: Math.floor(
          customerSessions.reduce((sum, s) => sum + s.sessionDuration, 0) / 
          customerSessions.length / 60
        ),
        spendingPattern: session.amount > 4000 ? 'premium' as const : 'budget' as const,
        visitFrequency: customerSessions.length > 5 ? 'regular' as const : 'occasional' as const,
        preferredTimeSlots: ['7:00 PM', '8:00 PM', '9:00 PM'], // This would come from actual data
        typicalOrderPattern: customerSessions.map(s => s.flavor).slice(0, 3)
      },
      trustScore: trustScoreResult.score,
      loyaltyTier: trustScoreResult.tier,
      sessionHistory: customerSessions.map(s => ({
        id: s.id,
        date: new Date(s.createdAt).toISOString().split('T')[0],
        duration: Math.floor(s.sessionDuration / 60),
        totalSpent: s.amount / 100,
        satisfaction: 4.5, // This would come from actual ratings
        notes: s.notes || 'Good service experience',
        piiMasked: piiMasking
      })),
      predictiveInsights: {
        nextVisitPrediction: 'Likely to visit within 1-2 weeks',
        likelyOrder: [session.flavor],
        optimalServiceTiming: `Start cleanup at ${Math.floor(session.sessionDuration / 60) - 5} minutes`,
        upsellProbability: trustScoreResult.score > 80 ? 85 : 65
      }
    };

    // Generate operational notes
    const operationalNotes = [
      {
        id: 'note_001',
        content: session.notes || 'Customer prefers mild flavors',
        author: 'Staff Member',
        createdAt: new Date(session.createdAt).toISOString(),
        piiLevel: detectPiiLevel(session.notes || ''),
        category: 'customer' as const
      },
      {
        id: 'note_002',
        content: `VIP zone table ${session.tableId} - premium service requested`,
        author: 'Manager',
        createdAt: new Date(session.createdAt - 300000).toISOString(),
        piiLevel: 'none' as const,
        category: 'service' as const
      }
    ];

    return NextResponse.json({
      success: true,
      session: maskedSession,
      behavioralMemory,
      operationalNotes,
      trustScore: trustScoreResult.score,
      loyaltyTier: trustScoreResult.tier,
      recommendations: trustScoreResult.recommendations,
      piiMasking: {
        enabled: piiMasking,
        level: piiLevel
      }
    });

  } catch (error) {
    console.error('Error fetching guest intelligence:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST /api/guest-intelligence/[sessionId]/notes - Add operational notes
export async function POST(req: NextRequest, { params }: { params: { sessionId: string } }) {
  try {
    const sessionId = params.sessionId;
    const body = await req.json();
    const { content, author, category } = body;

    if (!content || !author) {
      return NextResponse.json({ 
        error: 'Missing required fields: content and author are required' 
      }, { status: 400 });
    }

    // Find the session
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);
    if (sessionIndex === -1) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Create new note
    const newNote = {
      id: `note_${Date.now()}`,
      content,
      author,
      createdAt: new Date().toISOString(),
      piiLevel: detectPiiLevel(content),
      category: category || 'operational'
    };

    // In a real implementation, this would be stored in a database
    // For now, we'll just return the note
    return NextResponse.json({
      success: true,
      note: newNote,
      message: 'Note added successfully'
    });

  } catch (error) {
    console.error('Error adding operational note:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
