/**
 * Fix Prisma Client and Restart Server
 * 
 * This script:
 * 1. Stops the server on port 3002
 * 2. Regenerates Prisma client
 * 3. Restarts the server
 * 
 * Usage: npx tsx scripts/fix-and-restart-server.ts
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execAsync = promisify(exec);

const PORT = 3002;
const APP_DIR = path.join(__dirname, '..');

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
  
  try {
    await execAsync(command);
    console.log(`✅ Stopped process ${pid}`);
    // Wait for port to be released
    await new Promise(resolve => setTimeout(resolve, 2000));
  } catch (error: any) {
    if (!error.message.includes('not found') && !error.message.includes('No such process')) {
      throw error;
    }
    console.log(`⚠️  Process ${pid} already stopped`);
  }
}

async function regeneratePrisma(): Promise<void> {
  console.log('🔄 Regenerating Prisma client...');
  try {
    await execAsync('npx prisma generate', { cwd: APP_DIR });
    console.log('✅ Prisma client regenerated');
  } catch (error: any) {
    console.error('❌ Failed to regenerate Prisma client:', error.message);
    throw error;
  }
}

async function startServer(): Promise<void> {
  console.log('🚀 Starting server...');
  const isWindows = process.platform === 'win32';
  
  if (isWindows) {
    console.log('\n📋 Windows detected - please start server manually:');
    console.log(`   cd ${APP_DIR}`);
    console.log('   npm run dev');
    console.log('\n💡 Or use the status page restart button');
  } else {
    exec(`cd ${APP_DIR} && npm run dev &`, (error) => {
      if (error) {
        console.error('❌ Failed to start server:', error);
      } else {
        console.log('✅ Server started');
      }
    });
  }
}

async function fixAndRestart() {
  console.log('🔧 Fixing Prisma Client and Restarting Server');
  console.log('='.repeat(60));
  
  // Step 1: Stop server
  console.log('\n📋 Step 1: Stopping server on port', PORT);
  const pid = await findProcessOnPort(PORT);
  
  if (pid) {
    console.log(`   Found process: ${pid}`);
    await killProcess(pid);
  } else {
    console.log('   No process found on port', PORT);
  }
  
  // Step 2: Regenerate Prisma
  console.log('\n📋 Step 2: Regenerating Prisma client...');
  await regeneratePrisma();
  
  // Step 3: Start server
  console.log('\n📋 Step 3: Starting server...');
  await startServer();
  
  console.log('\n✅ Fix complete!');
  console.log('💡 Server should be available at http://localhost:3002');
  console.log('💡 Wait 10-15 seconds, then test: curl http://localhost:3002/api/health');
}

// Run if called directly
if (require.main === module) {
  fixAndRestart().catch((error) => {
    console.error('❌ Failed:', error);
    process.exit(1);
  });
}

export { fixAndRestart };

