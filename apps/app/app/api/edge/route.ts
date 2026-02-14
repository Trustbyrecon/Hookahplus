import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, SessionState } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    console.log(`[Edge API] 🚨 Edge case reported: ${type}`);

    switch (type) {
      case 'report':
        const { 
          sessionId, 
          edgeCase, 
          description, 
          severity, 
          reportedBy, 
          tableId 
        } = data;

        // Update session with edge case
        const updatedSession = await prisma.session.update({
          where: { id: sessionId },
          data: {
            edgeCase: edgeCase as any,
            edgeNote: description,
            updatedAt: new Date()
          }
        });

        // Log the edge case to SessionEvent
        try {
          await prisma.sessionEvent.create({
            data: {
              id: `edge_${sessionId}_${Date.now()}`,
              sessionId,
              type: 'EDGE_CASE_REPORTED',
              payloadSeal: crypto.createHash('sha256').update(JSON.stringify({ edgeCase, description })).digest('hex'),
              data: {
                edgeCase,
                description,
                severity,
                reportedBy: reportedBy || 'system',
                tableId
              }
            }
          });
        } catch (eventError) {
          // Non-critical - log but don't fail
          console.warn('[Edge API] Failed to log to SessionEvent:', eventError);
        }

        // Log to GhostLog for Reflex tracking
        console.log(`[GhostLog] 🚨 Edge Case: ${edgeCase} | Session: ${sessionId} | Table: ${tableId} | Severity: ${severity} | Reporter: ${reportedBy}`);

        return NextResponse.json({ 
          success: true, 
          data: {
            sessionId,
            edgeCase,
            description,
            severity,
            reportedAt: new Date().toISOString(),
            status: 'reported'
          }
        });

      case 'resolve':
        const { sessionId: resolveSessionId, resolution, resolvedBy } = data;

        // Update session to clear edge case
        const resolvedSession = await prisma.session.update({
          where: { id: resolveSessionId },
          data: {
            edgeCase: null,
            edgeNote: null,
            updatedAt: new Date()
          }
        });

        // Log the resolution to SessionEvent
        try {
          await prisma.sessionEvent.create({
            data: {
              id: `edge_resolve_${resolveSessionId}_${Date.now()}`,
              sessionId: resolveSessionId,
              type: 'EDGE_CASE_RESOLVED',
              payloadSeal: crypto.createHash('sha256').update(JSON.stringify({ resolution })).digest('hex'),
              data: {
                resolution,
                resolvedBy: resolvedBy || 'system'
              }
            }
          });
        } catch (eventError) {
          // Non-critical - log but don't fail
          console.warn('[Edge API] Failed to log resolution to SessionEvent:', eventError);
        }

        console.log(`[GhostLog] ✅ Edge Case Resolved | Session: ${resolveSessionId} | Resolution: ${resolution} | Resolved By: ${resolvedBy}`);

        return NextResponse.json({ 
          success: true, 
          data: {
            sessionId: resolveSessionId,
            resolution,
            resolvedAt: new Date().toISOString(),
            status: 'resolved'
          }
        });

      case 'escalate':
        const { 
          sessionId: escalateSessionId, 
          escalationReason, 
          escalatedBy, 
          priority 
        } = data;

        // Log escalation to SessionEvent
        try {
          await prisma.sessionEvent.create({
            data: {
              id: `edge_escalate_${escalateSessionId}_${Date.now()}`,
              sessionId: escalateSessionId,
              type: 'EDGE_CASE_ESCALATED',
              payloadSeal: crypto.createHash('sha256').update(JSON.stringify({ escalationReason, priority })).digest('hex'),
              data: {
                escalationReason,
                priority,
                escalatedBy: escalatedBy || 'system'
              }
            }
          });
        } catch (eventError) {
          // Non-critical - log but don't fail
          console.warn('[Edge API] Failed to log escalation to SessionEvent:', eventError);
        }

        console.log(`[GhostLog] ⚠️ Edge Case Escalated | Session: ${escalateSessionId} | Reason: ${escalationReason} | Priority: ${priority} | Escalated By: ${escalatedBy}`);

        return NextResponse.json({ 
          success: true, 
          data: {
            sessionId: escalateSessionId,
            escalationReason,
            priority,
            escalatedAt: new Date().toISOString(),
            status: 'escalated'
          }
        });

      case 'getActive':
        const activeEdgeCases = await prisma.session.findMany({
          where: {
            edgeCase: { not: null },
            state: { in: [SessionState.PENDING, SessionState.ACTIVE] }
          },
          select: {
            id: true,
            tableId: true,
            edgeCase: true,
            edgeNote: true,
            state: true,
            createdAt: true,
            updatedAt: true
          },
          orderBy: { updatedAt: 'desc' }
        });

        return NextResponse.json({ 
          success: true, 
          data: activeEdgeCases
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown edge case type' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('[Edge API] ❌ Error processing edge case:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process edge case',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const severity = searchParams.get('severity');
    const tableId = searchParams.get('tableId');

    console.log('[Edge API] 📊 Fetching edge cases...');

    const whereClause: any = {
      edgeCase: { not: null }
    };

    if (severity) {
      // This would need to be implemented based on how severity is stored
      // For now, we'll just filter by edge case type
    }

    if (tableId) {
      whereClause.tableId = tableId;
    }

    const edgeCases = await prisma.session.findMany({
      where: whereClause,
      select: {
        id: true,
        tableId: true,
        edgeCase: true,
        edgeNote: true,
        state: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { updatedAt: 'desc' },
      take: 50
    });

    return NextResponse.json({ 
      success: true, 
      data: edgeCases,
      count: edgeCases.length
    });

  } catch (error) {
    console.error('[Edge API] ❌ Error fetching edge cases:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch edge cases',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
