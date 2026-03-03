/**
 * Restart Server Script
 * 
 * This script stops the Next.js dev server on port 3002 and restarts it.
 * 
 * Usage: npx tsx scripts/restart-server.ts
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execAsync = promisify(exec);

const PORT = 3002;
const APP_DIR = path.join(__dirname, '..');

async function findProcessOnPort(port: number): Promise<string | null> {
  try {
    // Windows: netstat -ano | findstr :3002
    // Linux/Mac: lsof -ti :3002
    const isWindows = process.platform === 'win32';
    const command = isWindows
      ? `netstat -ano | findstr :${port} | findstr LISTENING`
      : `lsof -ti :${port}`;
    
    const { stdout } = await execAsync(command);
    if (isWindows) {
      // Extract PID from Windows netstat output
      // Format: TCP    0.0.0.0:3002    0.0.0.0:0    LISTENING    12345
      const match = stdout.match(/\s+(\d+)\s*$/);
      return match ? match[1] : null;
    }
    return stdout.trim() || null;
  } catch (error) {
    return null;
  }
}

async function killProcess(pid: string): Promise<void> {
  const isWindows = process.platform === 'win32';
  const command = isWindows
    ? `taskkill /PID ${pid} /F`
    : `kill -9 ${pid}`;
  
  try {
    await execAsync(command);
    console.log(`✅ Stopped process ${pid}`);
  } catch (error: any) {
    if (!error.message.includes('not found') && !error.message.includes('No such process')) {
      throw error;
    }
    console.log(`⚠️  Process ${pid} already stopped`);
  }
}

async function startServer(): Promise<void> {
  console.log('🚀 Starting server...');
  const isWindows = process.platform === 'win32';
  
  // Start server in background
  const command = isWindows
    ? `start cmd /k "cd ${APP_DIR} && npm run dev"`
    : `cd ${APP_DIR} && npm run dev &`;
  
  // For Windows, we'll just print instructions
  if (isWindows) {
    console.log('\n📋 Windows detected - please run this manually:');
    console.log(`   cd ${APP_DIR}`);
    console.log('   npm run dev');
    console.log('\n💡 Or use the status page restart button (if implemented)');
  } else {
    exec(command, (error) => {
      if (error) {
        console.error('❌ Failed to start server:', error);
      } else {
        console.log('✅ Server started');
      }
    });
  }
}

async function restartServer() {
  console.log('🔄 Restarting server on port', PORT);
  console.log('='.repeat(50));
  
  // Step 1: Find and stop existing process
  console.log('\n📋 Step 1: Finding process on port', PORT);
  const pid = await findProcessOnPort(PORT);
  
  if (pid) {
    console.log(`   Found process: ${pid}`);
    console.log('📋 Step 2: Stopping process...');
    await killProcess(pid);
    // Wait a moment for port to be released
    await new Promise(resolve => setTimeout(resolve, 2000));
  } else {
    console.log('   No process found on port', PORT);
  }
  
  // Step 3: Start server
  console.log('\n📋 Step 3: Starting server...');
  await startServer();
  
  console.log('\n✅ Restart complete!');
  console.log('💡 Server should be available at http://localhost:3002');
}

// Run if called directly
if (require.main === module) {
  restartServer().catch((error) => {
    console.error('❌ Failed to restart server:', error);
    process.exit(1);
  });
}

export { restartServer, findProcessOnPort, killProcess };

