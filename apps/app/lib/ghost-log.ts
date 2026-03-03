import fs from 'node:fs/promises';
import path from 'node:path';

export type GhostLogEntry = {
  timestamp: string;
  kind: string;
  data: any;
};

// In-memory log storage (always used as a fast cache)
let ghostLog: GhostLogEntry[] = [];

function envBool(key: string, defaultValue: boolean): boolean {
  const raw = process.env[key];
  if (raw === undefined) return defaultValue;
  const normalized = raw.trim().toLowerCase();
  if (['1', 'true', 'yes', 'y', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'n', 'off'].includes(normalized)) return false;
  return defaultValue;
}

function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function isGhostLogPersistenceEnabled(): boolean {
  // Default: enabled in non-production. In production, require explicit opt-in (file system may be read-only).
  return envBool('GHOSTLOG_PERSIST', !isProduction());
}

export function getGhostLogFilePath(): string {
  const configured = process.env.GHOSTLOG_FILE_PATH?.trim();
  if (configured) return configured;

  // Vercel/serverless: only /tmp is writable.
  if (process.env.VERCEL) return path.join('/tmp', 'ghost-log.ndjson');

  // Default (local/self-host): create ./logs/ghost-log.ndjson relative to the app root.
  return path.join(process.cwd(), 'logs', 'ghost-log.ndjson');
}

async function ensureParentDir(filePath: string) {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
}

async function maybeRotate(filePath: string) {
  // Simple size-based rotation to avoid unbounded growth
  const maxBytes = Number(process.env.GHOSTLOG_MAX_BYTES || 25 * 1024 * 1024); // 25MB default
  if (!Number.isFinite(maxBytes) || maxBytes <= 0) return;

  try {
    const st = await fs.stat(filePath);
    if (st.size < maxBytes) return;

    const rotatedName = `ghost-log.${new Date().toISOString().replace(/[:.]/g, '-')}.ndjson`;
    const rotatedPath = path.join(path.dirname(filePath), rotatedName);
    await fs.rename(filePath, rotatedPath);
  } catch (e: any) {
    if (e?.code === 'ENOENT') return; // nothing to rotate yet
    // Non-fatal: persistence is best-effort
  }
}

function normalizeEntry(entry: any): GhostLogEntry {
  const timestamp = entry?.timestamp ? String(entry.timestamp) : new Date().toISOString();
  const kind = entry?.kind ? String(entry.kind) : (entry?.eventType ? String(entry.eventType) : 'unknown');
  return {
    timestamp,
    kind,
    data: entry,
  };
}

export async function appendGhostLogEntry(entry: any): Promise<GhostLogEntry> {
  const logEntry = normalizeEntry(entry);

  // Always store in memory
  ghostLog.push(logEntry);
  if (ghostLog.length > 1000) {
    ghostLog = ghostLog.slice(-1000);
  }

  // Best-effort persistence
  if (isGhostLogPersistenceEnabled()) {
    const filePath = getGhostLogFilePath();
    try {
      await ensureParentDir(filePath);
      await maybeRotate(filePath);
      await fs.appendFile(filePath, `${JSON.stringify(logEntry)}\n`, 'utf8');
    } catch (e) {
      // Non-fatal: don't break request flows due to logging I/O
      console.warn('[GhostLog] Persistence append failed (non-blocking):', e);
    }
  }

  return logEntry;
}

export async function readGhostLogEntriesFromDisk(options?: {
  kind?: string | null;
  limit?: number;
  since?: string | null;
  until?: string | null;
}): Promise<GhostLogEntry[]> {
  const { kind, limit = 50, since, until } = options || {};
  if (!isGhostLogPersistenceEnabled()) return [];

  const filePath = getGhostLogFilePath();
  const maxTailBytes = Number(process.env.GHOSTLOG_READ_TAIL_BYTES || 2 * 1024 * 1024); // 2MB default

  let content = '';
  try {
    const st = await fs.stat(filePath);
    const readTailBytes = Number.isFinite(maxTailBytes) && maxTailBytes > 0 ? maxTailBytes : st.size;
    const start = Math.max(0, st.size - readTailBytes);

    const fh = await fs.open(filePath, 'r');
    try {
      const buffer = Buffer.alloc(st.size - start);
      await fh.read(buffer, 0, buffer.length, start);
      content = buffer.toString('utf8');
      // If we started mid-file, drop the first partial line.
      if (start > 0) {
        const firstNewline = content.indexOf('\n');
        if (firstNewline !== -1) content = content.slice(firstNewline + 1);
      }
    } finally {
      await fh.close();
    }
  } catch (e: any) {
    if (e?.code === 'ENOENT') return [];
    console.warn('[GhostLog] Persistence read failed (non-blocking):', e);
    return [];
  }

  const sinceMs = since ? Date.parse(since) : undefined;
  const untilMs = until ? Date.parse(until) : undefined;

  const parsed: GhostLogEntry[] = [];
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const obj = JSON.parse(trimmed) as GhostLogEntry;
      parsed.push(obj);
    } catch {
      // ignore malformed lines (e.g. partial write)
    }
  }

  let filtered = parsed;
  if (kind) filtered = filtered.filter(e => e.kind === kind);
  if (sinceMs !== undefined && Number.isFinite(sinceMs)) {
    filtered = filtered.filter(e => Date.parse(e.timestamp) >= sinceMs);
  }
  if (untilMs !== undefined && Number.isFinite(untilMs)) {
    filtered = filtered.filter(e => Date.parse(e.timestamp) <= untilMs);
  }

  // Newest first
  filtered.sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
  return filtered.slice(0, Math.max(0, limit));
}

export function getGhostLogEntriesFromMemory(options?: { kind?: string | null }): GhostLogEntry[] {
  const kind = options?.kind;
  return kind ? ghostLog.filter(e => e.kind === kind) : [...ghostLog];
}

// Backwards-compatible name
export async function createGhostLogEntry(entry: any) {
  try {
    const logEntry = await appendGhostLogEntry(entry);
    console.log(`[GhostLog] 📝 Logged: ${logEntry.kind} at ${logEntry.timestamp}`);
    return { ok: true, logged: true };
  } catch (error) {
    console.error('[GhostLog] ❌ Failed to log entry:', error);
    return { ok: false, error: 'Failed to log entry' };
  }
}

// Export the in-memory cache for legacy callers (prefer functions above)
export { ghostLog };
