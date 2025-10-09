import { NextRequest, NextResponse } from 'next/server';

// In-memory log storage (in production, this would be a database)
let ghostLog: Array<{
  timestamp: string;
  kind: string;
  data: any;
}> = [];

// Helper function to create ghost log entries
export async function createGhostLogEntry(entry: any) {
  try {
    const logEntry = {
      timestamp: entry.timestamp || new Date().toISOString(),
      kind: entry.kind || entry.eventType || 'unknown',
      data: entry
    };

    // Store log entry
    ghostLog.push(logEntry);

    // Keep only last 1000 entries to prevent memory issues
    if (ghostLog.length > 1000) {
      ghostLog = ghostLog.slice(-1000);
    }

    console.log(`[GhostLog] 📝 Logged: ${logEntry.kind} at ${logEntry.timestamp}`);
    
    return { ok: true, logged: true };
  } catch (error) {
    console.error('[GhostLog] ❌ Failed to log entry:', error);
    return { ok: false, error: 'Failed to log entry' };
  }
}

export async function POST(req: NextRequest) {
  try {
    const logEntry = await req.json();
    
    // Add timestamp if not provided
    if (!logEntry.timestamp) {
      logEntry.timestamp = new Date().toISOString();
    }

    // Store log entry
    ghostLog.push({
      timestamp: logEntry.timestamp,
      kind: logEntry.kind || 'unknown',
      data: logEntry
    });

    // Keep only last 1000 entries to prevent memory issues
    if (ghostLog.length > 1000) {
      ghostLog = ghostLog.slice(-1000);
    }

    console.log(`[GhostLog] 📝 Logged: ${logEntry.kind} at ${logEntry.timestamp}`);
    
    return NextResponse.json({ ok: true, logged: true });
  } catch (error) {
    console.error('[GhostLog] ❌ Failed to log entry:', error);
    return NextResponse.json({ ok: false, error: 'Failed to log entry' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const kind = searchParams.get('kind');
    const limit = parseInt(searchParams.get('limit') || '50');

    let filteredLogs = ghostLog;

    if (kind) {
      filteredLogs = ghostLog.filter(entry => entry.kind === kind);
    }

    // Return most recent entries first
    const recentLogs = filteredLogs
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);

    return NextResponse.json({
      ok: true,
      logs: recentLogs,
      total: ghostLog.length,
      filtered: filteredLogs.length
    });
  } catch (error) {
    console.error('[GhostLog] ❌ Failed to retrieve logs:', error);
    return NextResponse.json({ ok: false, error: 'Failed to retrieve logs' }, { status: 500 });
  }
}