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

// Export the ghostLog array for the API route
export { ghostLog };
