import { NextRequest, NextResponse } from 'next/server';
import {
  appendGhostLogEntry,
  getGhostLogEntriesFromMemory,
  isGhostLogPersistenceEnabled,
  readGhostLogEntriesFromDisk,
} from '../../../lib/ghost-log';

export async function POST(req: NextRequest) {
  try {
    const logEntry = await req.json();
    
    const stored = await appendGhostLogEntry(logEntry);
    console.log(`[GhostLog] 📝 Logged: ${stored.kind} at ${stored.timestamp}`);
    
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
    const since = searchParams.get('since');
    const until = searchParams.get('until');

    // Merge disk + memory (memory helps if disk is disabled or write failed)
    const [disk, mem] = await Promise.all([
      readGhostLogEntriesFromDisk({ kind, limit: Math.max(0, limit), since, until }),
      Promise.resolve(getGhostLogEntriesFromMemory({ kind })),
    ]);

    const merged = [...disk, ...mem];

    // De-dupe by exact tuple (timestamp+kind+data JSON)
    const seen = new Set<string>();
    const deduped = merged.filter(e => {
      const key = `${e.timestamp}|${e.kind}|${JSON.stringify(e.data)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    deduped.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const recentLogs = deduped.slice(0, Math.max(0, limit));

    return NextResponse.json({
      success: true,
      entries: recentLogs,
      total: deduped.length,
      filtered: recentLogs.length,
      persisted: isGhostLogPersistenceEnabled(),
    });
  } catch (error) {
    console.error('[GhostLog] ❌ Failed to retrieve logs:', error);
    return NextResponse.json({ ok: false, error: 'Failed to retrieve logs' }, { status: 500 });
  }
}