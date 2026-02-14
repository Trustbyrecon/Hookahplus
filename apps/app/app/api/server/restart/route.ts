/**
 * Server Restart API Endpoint
 * 
 * WARNING: This endpoint should be secured in production!
 * Only allow from localhost or with proper authentication.
 */

import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Security: Only allow from localhost
function isLocalhost(req: NextRequest): boolean {
  const hostname = req.headers.get('host') || '';
  const forwarded = req.headers.get('x-forwarded-for') || '';
  
  return (
    hostname.includes('localhost') ||
    hostname.includes('127.0.0.1') ||
    forwarded.includes('127.0.0.1') ||
    forwarded.includes('localhost')
  );
}

async function findProcessOnPort(port: number): Promise<string | null> {
  try {
    const isWindows = process.platform === 'win32';
    const command = isWindows
      ? `netstat -ano | findstr :${port} | findstr LISTENING`
      : `lsof -ti :${port}`;
    
    const { stdout } = await execAsync(command);
    if (isWindows) {
      const match = stdout.match(/\s+(\d+)\s*$/);
      return match ? match[1] : null;
    }
    return stdout.trim() || null;
  } catch {
    return null;
  }
}

async function killProcess(pid: string): Promise<void> {
  const isWindows = process.platform === 'win32';
  const command = isWindows
    ? `taskkill /PID ${pid} /F`
    : `kill -9 ${pid}`;
  
  await execAsync(command);
}

export async function POST(req: NextRequest) {
  // Security check
  if (!isLocalhost(req)) {
    return NextResponse.json(
      { error: 'Forbidden: Only localhost allowed' },
      { status: 403 }
    );
  }

  // Check for admin token (optional, for extra security)
  const authHeader = req.headers.get('authorization');
  const expectedToken = process.env.SERVER_RESTART_TOKEN;
  
  if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid token' },
      { status: 401 }
    );
  }

  try {
    const PORT = 3002;
    
    // Find and stop existing process
    const pid = await findProcessOnPort(PORT);
    
    if (pid) {
      await killProcess(pid);
      // Wait for port to be released
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Note: We can't actually start the server from here in a reliable way
    // The server is already running this code, so we'd need a separate process manager
    // For now, we just stop it and return instructions
    
    return NextResponse.json({
      success: true,
      message: 'Server stopped. Please restart manually with: npm run dev',
      stopped: !!pid,
      pid: pid || null,
      instructions: [
        '1. Open a new terminal',
        '2. cd apps/app',
        '3. npm run dev'
      ]
    });
  } catch (error: any) {
    console.error('[Server Restart API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to restart server',
        note: 'Server may need to be restarted manually'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check if restart is available
export async function GET(req: NextRequest) {
  if (!isLocalhost(req)) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }

  try {
    const PORT = 3002;
    const pid = await findProcessOnPort(PORT);
    
    return NextResponse.json({
      available: true,
      port: PORT,
      running: !!pid,
      pid: pid || null,
      platform: process.platform,
      note: 'POST to this endpoint to restart the server'
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

