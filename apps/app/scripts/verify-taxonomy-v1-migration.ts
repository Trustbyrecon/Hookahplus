/**
 * Verify Taxonomy v1 Migration Status
 * 
 * Checks if the sessionStateV1 column exists in the database
 * 
 * Usage: npx tsx scripts/verify-taxonomy-v1-migration.ts
 */

import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local
const envPath = path.join(__dirname, '../.env.local');
dotenv.config({ path: envPath });

const prisma = new PrismaClient();

async function verifyMigration() {
  console.log('🔍 Verifying Taxonomy v1 Migration Status');
  console.log('='.repeat(60));
  
  try {
    // Check if sessionStateV1 column exists by trying to query it
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'Session'
        AND column_name IN ('session_state_v1', 'sessionStateV1', 'paused')
      ORDER BY column_name;
    ` as any[];
    
    console.log('\n📋 Found columns:');
    if (result.length === 0) {
      console.log('   ❌ No v1 columns found!');
      console.log('\n💡 Migration needs to be applied:');
      console.log('   1. Open Supabase SQL Editor');
      console.log('   2. Run: supabase/migrations/20251115000001_add_taxonomy_v1_columns.sql');
    } else {
      result.forEach(col => {
        console.log(`   ✅ ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
      });
      
      const hasSessionStateV1 = result.some(c => c.column_name === 'session_state_v1');
      const hasPaused = result.some(c => c.column_name === 'paused');
      
      if (hasSessionStateV1 && hasPaused) {
        console.log('\n✅ Migration is applied!');
        console.log('💡 If Prisma still errors, regenerate client: npx prisma generate');
      } else {
        console.log('\n⚠️  Migration partially applied:');
        if (!hasSessionStateV1) console.log('   ❌ Missing: session_state_v1');
        if (!hasPaused) console.log('   ❌ Missing: paused');
      }
    }
    
    // Also check TaxonomyUnknown table
    const taxonomyUnknown = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = 'TaxonomyUnknown';
    ` as any[];
    
    if (taxonomyUnknown[0]?.count > 0) {
      console.log('\n✅ TaxonomyUnknown table exists');
    } else {
      console.log('\n⚠️  TaxonomyUnknown table missing');
    }
    
  } catch (error: any) {
    console.error('❌ Error checking migration status:', error.message);
    if (error.message.includes('does not exist')) {
      console.log('\n💡 This likely means the migration hasn\'t been applied yet.');
      console.log('   Run the migration in Supabase SQL Editor.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

verifyMigration();

