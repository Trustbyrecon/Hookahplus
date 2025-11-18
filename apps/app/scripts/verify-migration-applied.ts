/**
 * Quick script to verify sessionStateV1 migration was applied
 * Run: npx tsx scripts/verify-migration-applied.ts
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env.local
const envPath = resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const prisma = new PrismaClient();

async function verifyMigration() {
  try {
    console.log('🔍 Checking if sessionStateV1 migration was applied...\n');
    
    // Try to query the column - if it exists, this will work
    const result = await prisma.$queryRaw<Array<{ session_state_v1: string | null }>>`
      SELECT session_state_v1 
      FROM "Session" 
      LIMIT 1
    `;
    
    console.log('✅ Migration applied! Column session_state_v1 exists in database.');
    console.log('   Sample value:', result[0]?.session_state_v1 || 'NULL');
    
    // Also check paused column
    const pausedResult = await prisma.$queryRaw<Array<{ paused: boolean }>>`
      SELECT paused 
      FROM "Session" 
      LIMIT 1
    `;
    
    console.log('✅ Column paused also exists.');
    console.log('   Sample value:', pausedResult[0]?.paused);
    
    console.log('\n✅ All migration columns verified!');
    console.log('   Next steps:');
    console.log('   1. Stop the dev server (Ctrl+C)');
    console.log('   2. Run: npx prisma generate');
    console.log('   3. Restart the dev server');
    console.log('   4. Test session creation');
    
    process.exit(0);
  } catch (error: any) {
    if (error.message?.includes('does not exist') || error.message?.includes('column') || error.code === '42703') {
      console.error('❌ Migration NOT applied yet!');
      console.error('   Error:', error.message);
      console.error('\n📋 To apply the migration:');
      console.error('   1. Go to https://supabase.com/dashboard');
      console.error('   2. Open SQL Editor → New query');
      console.error('   3. Copy contents of: supabase/migrations/20251115000001_add_taxonomy_v1_columns.sql');
      console.error('   4. Paste and click "Run"');
      console.error('   5. Then run this script again to verify');
    } else {
      console.error('❌ Error checking migration:', error.message);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyMigration();

