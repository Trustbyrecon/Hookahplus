import { NextRequest, NextResponse } from 'next/server';
import { FireSession } from '../../../../types/enhancedSession';
import { calculateTrustScore, calculateSingleSessionTrustScore } from '../../../../lib/trustScoring';
import { maskSessionData, detectPiiLevel, createPiiSafeSummary } from '../../../../lib/piiMasking';

// GET /api/guest-intelligence/[sessionId] - Get customer intelligence
export async function GET(req: NextRequest, { params }: { params: { sessionId: string } }) {
  try {
    const sessionId = params.sessionId;
    const url = new URL(req.url);
    const piiMasking = url.searchParams.get('piiMasking') !== 'false'; // Default to true
    const piiLevel = url.searchParams.get('piiLevel') as 'none' | 'low' | 'medium' | 'high' || 'medium';

    // Fetch session data from the real Prisma-based API
    const sessionResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/sessions/${sessionId}`);
    if (!sessionResponse.ok) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    
    const sessionData = await sessionResponse.json();
    const session = sessionData.session;

    // Convert Prisma session to FireSession format for compatibility
    const fireSession: FireSession = {
      id: session.id,
      tableId: session.tableId,
      customerName: session.customerRef || 'Unknown Customer',
      customerPhone: session.customerPhone || '',
      flavor: session.flavor || 'Unknown Flavor',
      amount: session.priceCents || 0,
      status: mapPrismaStateToFireSession(session.state),
      currentStage: mapStateToStage(session.state),
      assignedStaff: {
        boh: session.assignedBOHId || undefined,
        foh: session.assignedFOHId || undefined
      },
      createdAt: new Date(session.createdAt).getTime(),
      updatedAt: new Date(session.updatedAt).getTime(),
      sessionStartTime: session.startedAt ? new Date(session.startedAt).getTime() : undefined,
      sessionDuration: session.durationSecs || 45 * 60,
      coalStatus: 'active', // Default value
      refillStatus: 'none', // Default value
      notes: session.tableNotes || '',
      edgeCase: session.edgeCase || null,
      sessionTimer: session.timerStartedAt ? {
        remaining: calculateRemainingTimeFromPrisma(session),
        total: session.timerDuration || 45 * 60,
        isActive: session.timerStatus === 'active',
        startedAt: new Date(session.timerStartedAt).getTime()
      } : undefined,
      bohState: 'PREPARING', // Default value
      guestTimerDisplay: true
    };

    // Get all sessions for this customer (by phone number for demo purposes)
    const customerSessionsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/sessions?customerPhone=${encodeURIComponent(session.customerPhone || '')}`);
    const customerSessionsData = customerSessionsResponse.ok ? await customerSessionsResponse.json() : { sessions: [] };
    
    // Convert all customer sessions to FireSession format
    const customerSessions: FireSession[] = customerSessionsData.sessions.map((s: any) => ({
      id: s.id,
      tableId: s.tableId,
      customerName: s.customerRef || 'Unknown Customer',
      customerPhone: s.customerPhone || '',
      flavor: s.flavor || 'Unknown Flavor',
      amount: s.priceCents || 0,
      status: mapPrismaStateToFireSession(s.state),
      currentStage: mapStateToStage(s.state),
      assignedStaff: {
        boh: s.assignedBOHId || undefined,
        foh: s.assignedFOHId || undefined
      },
      createdAt: new Date(s.createdAt).getTime(),
      updatedAt: new Date(s.updatedAt).getTime(),
      sessionStartTime: s.startedAt ? new Date(s.startedAt).getTime() : undefined,
      sessionDuration: s.durationSecs || 45 * 60,
      coalStatus: 'active',
      refillStatus: 'none',
      notes: s.tableNotes || '',
      edgeCase: s.edgeCase || null,
      sessionTimer: s.timerStartedAt ? {
        remaining: calculateRemainingTimeFromPrisma(s),
        total: s.timerDuration || 45 * 60,
        isActive: s.timerStatus === 'active',
        startedAt: new Date(s.timerStartedAt).getTime()
      } : undefined,
      bohState: 'PREPARING',
      guestTimerDisplay: true
    }));
    
    // Calculate trust score
    const trustScoreResult = customerSessions.length > 1 
      ? calculateTrustScore(customerSessions)
      : { 
          score: calculateSingleSessionTrustScore(fireSession), 
          tier: 'bronze' as const,
          recommendations: ['Complete more sessions to build trust']
        };

    // Create PII-safe session data
    const maskedSession = piiMasking ? maskSessionData(fireSession, piiLevel) : fireSession;

    // Generate behavioral memory data
    const behavioralMemory = {
      guestId: fireSession.id,
      preferences: {
        favoriteFlavors: customerSessions.map(s => s.flavor).slice(0, 3),
        preferredZone: 'VIP', // This would come from actual data
        averageSessionDuration: Math.floor(
          customerSessions.reduce((sum, s) => sum + s.sessionDuration, 0) / 
          customerSessions.length / 60
        ),
        spendingPattern: fireSession.amount > 4000 ? 'premium' as const : 'budget' as const,
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
        likelyOrder: [fireSession.flavor],
        optimalServiceTiming: `Start cleanup at ${Math.floor(fireSession.sessionDuration / 60) - 5} minutes`,
        upsellProbability: trustScoreResult.score > 80 ? 85 : 65
      }
    };

    // Generate operational notes
    const operationalNotes = [
      {
        id: 'note_001',
        content: fireSession.notes || 'Customer prefers mild flavors',
        author: 'Staff Member',
        createdAt: new Date(fireSession.createdAt).toISOString(),
        piiLevel: detectPiiLevel(fireSession.notes || ''),
        category: 'customer' as const
      },
      {
        id: 'note_002',
        content: `VIP zone table ${fireSession.tableId} - premium service requested`,
        author: 'Manager',
        createdAt: new Date(fireSession.createdAt - 300000).toISOString(),
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

// Helper function to map Prisma session state to FireSession status
function mapPrismaStateToFireSession(state: string): any {
  const stateMap: Record<string, any> = {
    'active': 'ACTIVE',
    'prep_in_progress': 'PREP_IN_PROGRESS',
    'ready_for_delivery': 'READY_FOR_DELIVERY',
    'delivered': 'DELIVERED',
    'paused': 'STAFF_HOLD',
    'completed': 'CLOSED',
    'cancelled': 'VOIDED'
  };
  return stateMap[state] || 'NEW';
}

// Helper function to map state to stage
function mapStateToStage(state: string): 'BOH' | 'FOH' | 'CUSTOMER' {
  if (['prep_in_progress', 'ready_for_delivery'].includes(state)) return 'BOH';
  if (['delivered'].includes(state)) return 'FOH';
  return 'CUSTOMER';
}

// Helper function to calculate remaining time from Prisma session
function calculateRemainingTimeFromPrisma(session: any): number {
  if (!session.timerStartedAt || !session.timerDuration) return 0;
  
  const now = Date.now();
  const startedAt = new Date(session.timerStartedAt).getTime();
  const elapsed = Math.floor((now - startedAt) / 1000);
  const pausedTime = session.timerPausedDuration || 0;
  
  return Math.max(0, session.timerDuration - elapsed + pausedTime);
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
