import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, sessionId, tableId, flavorMix, prepStaffId, metadata } = body;

    switch (action) {
      case 'create':
        if (!sessionId || !tableId || !flavorMix || !prepStaffId) {
          return NextResponse.json({ 
            error: "Missing required fields: sessionId, tableId, flavorMix, prepStaffId" 
          }, { status: 400 });
        }

        // Create a new fire session
        const session = {
          id: sessionId,
          tableId: tableId,
          flavorMix: flavorMix,
          prepStaffId: prepStaffId,
          status: 'prep',
          createdAt: new Date().toISOString(),
          metadata: metadata || {}
        };

        // In a real application, you would save this to a database
        console.log('New fire session created:', session);

        return NextResponse.json({ 
          success: true, 
          session: session,
          message: 'Fire session created successfully'
        });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Fire session API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (sessionId) {
      // Get specific session (mock data for now)
      const session = {
        id: sessionId,
        tableId: 'T-001',
        flavorMix: 'Default Mix',
        status: 'active',
        createdAt: new Date().toISOString()
      };
      return NextResponse.json({ session });
    }

    // Get all sessions (mock data for now)
    const sessions = [
      {
        id: 'session_001',
        tableId: 'T-001',
        flavorMix: 'Blue Mist + Mint',
        status: 'active',
        createdAt: new Date().toISOString()
      }
    ];
    
    return NextResponse.json({ 
      sessions: sessions,
      message: 'Fire sessions retrieved successfully'
    });

  } catch (error: any) {
    console.error('Fire session query error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
