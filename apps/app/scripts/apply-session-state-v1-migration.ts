/**
 * Script to apply sessionStateV1 migration
 * This adds the session_state_v1 and paused columns to the Session table
 * 
 * Run: npx tsx scripts/apply-session-state-v1-migration.ts
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { resolve } from 'path';
import { readFileSync } from 'fs';

// Load .env.local
const envPath = resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

// Use direct connection (not pooler) for migrations to avoid prepared statement issues
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

// Convert pooler URL to direct connection URL for migrations
const directUrl = databaseUrl
  .replace(/\.pooler\.supabase\.com:6543/, '.supabase.co:5432')
  .replace(/pooler\.supabase\.com:6543/, 'supabase.co:5432');

console.log('🔗 Using direct connection for migration (bypassing pooler)');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: directUrl
    }
  }
});

async function applyMigration() {
  try {
    console.log('📦 Applying sessionStateV1 migration...');
    
    // Read the migration file
    const migrationPath = resolve(process.cwd(), '../../supabase/migrations/20251115000001_add_taxonomy_v1_columns.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');
    
    // Execute the migration
    // Note: We use $executeRawUnsafe here because this is a one-time migration script
    // and we need to run DDL statements that Prisma doesn't support
    await prisma.$executeRawUnsafe(migrationSQL);
    
    console.log('✅ Migration applied successfully!');
    console.log('   - Added session_state_v1 column');
    console.log('   - Added paused column');
    console.log('   - Added indexes and constraints');
    
    // Verify the columns exist
    const columns = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'Session' 
        AND column_name IN ('session_state_v1', 'paused')
      ORDER BY column_name
    `;
    
    console.log('\n📊 Verification:');
    if (columns.length === 2) {
      console.log('   ✅ session_state_v1 column exists');
      console.log('   ✅ paused column exists');
    } else {
      console.log('   ⚠️  Some columns may be missing:', columns.map(c => c.column_name));
    }
    
  } catch (error: any) {
    console.error('❌ Migration failed:');
    console.error('   Error:', error.message);
    
    // Check if columns already exist (migration might have been partially applied)
    if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
      console.log('\n   ℹ️  Columns may already exist. Checking...');
      try {
        const columns = await prisma.$queryRaw<Array<{ column_name: string }>>`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
            AND table_name = 'Session' 
            AND column_name IN ('session_state_v1', 'paused')
        `;
        if (columns.length > 0) {
          console.log('   ✅ Found existing columns:', columns.map(c => c.column_name).join(', '));
          console.log('   ✅ Migration appears to be applied (or partially applied)');
        }
      } catch (checkError) {
        console.error('   ❌ Could not verify columns:', checkError);
      }
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

applyMigration();

