import { NextRequest, NextResponse } from 'next/server';
import { ghostLog } from '../../../lib/ghost-log';

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
      ghostLog.splice(0, ghostLog.length - 1000);
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
      success: true,
      entries: recentLogs,
      total: ghostLog.length,
      filtered: filteredLogs.length
    });
  } catch (error) {
    console.error('[GhostLog] ❌ Failed to retrieve logs:', error);
    return NextResponse.json({ ok: false, error: 'Failed to retrieve logs' }, { status: 500 });
  }
}