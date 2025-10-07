import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log('[POS Mirror] 🔄 Fetching POS mirror data...');

    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') || 'shadow';
    const tableId = searchParams.get('tableId');

    // Get organization settings for POS mode
    const posSettings = await prisma.orgSetting.findMany({
      where: { 
        category: 'pos',
        isActive: true 
      }
    });

    const settings = posSettings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    // Get active sessions based on mode
    let sessions: any[] = [];
    if (mode === 'shadow' || mode === 'mirror') {
      sessions = await prisma.session.findMany({
        where: {
          state: { in: ['NEW', 'PREP_IN_PROGRESS', 'READY_FOR_DELIVERY', 'ACTIVE'] },
          ...(tableId && { tableId })
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      });
    }

    // Get current POS mode setting
    const currentPosMode = settings.posMode || 'shadow';

    const mirrorData = {
      mode: currentPosMode,
      sessions,
      settings,
      timestamp: new Date().toISOString(),
      tableId: tableId || null
    };

    console.log(`[POS Mirror] ✅ Retrieved ${sessions.length} sessions in ${currentPosMode} mode`);

    return NextResponse.json({
      success: true,
      data: mirrorData
    });

  } catch (error) {
    console.error('[POS Mirror] ❌ Error fetching mirror data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch POS mirror data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    console.log(`[POS Mirror] 📝 ${action} request received`);

    switch (action) {
      case 'syncSession':
        const { sessionId, posData } = data;
        
        // Update session with POS data
        const updatedSession = await prisma.session.update({
          where: { id: sessionId },
          data: {
            ...posData,
            updatedAt: new Date()
          }
        });

        // Log the sync action
        await prisma.sessionTransition.create({
          data: {
            sessionId,
            fromState: 'SYNC',
            toState: 'SYNCED',
            transition: 'pos_sync',
            userId: 'pos_system',
            note: `Synced with POS: ${JSON.stringify(posData)}`
          }
        });

        return NextResponse.json({ success: true, data: updatedSession });

      case 'updatePosMode':
        const { mode } = data;
        const updatedSetting = await prisma.orgSetting.upsert({
          where: { key: 'posMode' },
          update: { value: mode },
          create: { 
            key: 'posMode', 
            value: mode, 
            description: 'POS integration mode',
            category: 'pos'
          }
        });
        return NextResponse.json({ success: true, data: updatedSetting });

      case 'createTicket':
        const { tableId: ticketTableId, items, totalCents } = data;
        
        // Create a new session for the ticket
        const newSession = await prisma.session.create({
          data: {
            tableId: ticketTableId,
            priceCents: totalCents,
            state: 'NEW',
            orderItems: items,
            posMode: 'ticket',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });

        return NextResponse.json({ success: true, data: newSession });

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('[POS Mirror] ❌ Error processing request:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process POS mirror request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
