/**
 * Verify Analytics Indexes Migration
 * 
 * This script verifies that all analytics indexes have been created successfully.
 * 
 * Usage: npx tsx scripts/verify-indexes.ts
 */

import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
const envPath = path.join(__dirname, '../.env.local');
dotenv.config({ path: envPath });

interface IndexInfo {
  indexname: string;
  tablename: string;
  indexdef: string;
}

async function verifyIndexes() {
  console.log('🔍 Verifying Analytics Indexes');
  console.log('='.repeat(70));
  
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL not found in environment variables');
  }
  
  const client = new Client({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes('supabase') ? { 
      rejectUnauthorized: false,
      require: true 
    } : false,
  });
  
  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    
    // Expected indexes
    const expectedSessionIndexes = [
      'idx_session_created_at_payment_status',
      'idx_session_created_at_state',
      'idx_session_created_at_source',
      'idx_session_created_at_lounge_payment',
      'idx_session_created_at_state_duration',
    ];
    
    const expectedReflexIndexes = [
      'idx_reflex_event_created_at_type',
      'idx_reflex_event_created_at_refill_types',
      'idx_reflex_events_type_createdAt',
      'idx_reflex_events_ctaSource',
      'idx_reflex_events_ctaType',
      'idx_reflex_events_campaignId',
      'idx_reflex_events_payloadHash',
      'idx_reflex_events_sessionId',
    ];
    
    // Check Session table indexes
    console.log('📊 Checking Session Table Indexes');
    console.log('-'.repeat(70));
    const sessionResult = await client.query<IndexInfo>(`
      SELECT 
        indexname,
        indexdef
      FROM pg_indexes 
      WHERE schemaname = 'public' 
        AND tablename = 'Session'
        AND indexname LIKE 'idx_session_created_at%'
      ORDER BY indexname;
    `);
    
    const foundSessionIndexes = sessionResult.rows.map(r => r.indexname);
    const missingSessionIndexes = expectedSessionIndexes.filter(
      idx => !foundSessionIndexes.includes(idx)
    );
    
    console.log(`Found: ${foundSessionIndexes.length}/${expectedSessionIndexes.length} indexes\n`);
    
    if (foundSessionIndexes.length > 0) {
      foundSessionIndexes.forEach(idx => {
        console.log(`  ✅ ${idx}`);
      });
    }
    
    if (missingSessionIndexes.length > 0) {
      console.log('\n❌ Missing indexes:');
      missingSessionIndexes.forEach(idx => {
        console.log(`  ⚠️  ${idx}`);
      });
    }
    
    // Check reflex_events table indexes
    console.log('\n📊 Checking reflex_events Table Indexes');
    console.log('-'.repeat(70));
    const reflexResult = await client.query<IndexInfo>(`
      SELECT 
        indexname,
        indexdef
      FROM pg_indexes 
      WHERE schemaname = 'public' 
        AND tablename = 'reflex_events'
        AND indexname LIKE 'idx_reflex_events%'
      ORDER BY indexname;
    `);
    
    const foundReflexIndexes = reflexResult.rows.map(r => r.indexname);
    const missingReflexIndexes = expectedReflexIndexes.filter(
      idx => !foundReflexIndexes.includes(idx)
    );
    
    console.log(`Found: ${foundReflexIndexes.length}/${expectedReflexIndexes.length} indexes\n`);
    
    if (foundReflexIndexes.length > 0) {
      foundReflexIndexes.forEach(idx => {
        console.log(`  ✅ ${idx}`);
      });
    }
    
    if (missingReflexIndexes.length > 0) {
      console.log('\n❌ Missing indexes:');
      missingReflexIndexes.forEach(idx => {
        console.log(`  ⚠️  ${idx}`);
      });
    }
    
    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 Verification Summary');
    console.log('='.repeat(70));
    console.log(`Session Indexes: ${foundSessionIndexes.length}/${expectedSessionIndexes.length}`);
    console.log(`Reflex Indexes: ${foundReflexIndexes.length}/${expectedReflexIndexes.length}`);
    console.log(`Total: ${foundSessionIndexes.length + foundReflexIndexes.length}/${expectedSessionIndexes.length + expectedReflexIndexes.length}`);
    
    const allPresent = 
      missingSessionIndexes.length === 0 && 
      missingReflexIndexes.length === 0;
    
    if (allPresent) {
      console.log('\n🎉 All indexes are present! Ready for performance testing.');
    } else {
      console.log('\n⚠️  Some indexes are missing. Please run the migration:');
      console.log('   supabase/migrations/APPLY_ALL_ANALYTICS_INDEXES.sql');
    }
    
    // Check CHECK constraint
    console.log('\n📋 Checking CHECK Constraint');
    console.log('-'.repeat(70));
    const constraintResult = await client.query(`
      SELECT 
        conname,
        pg_get_constraintdef(oid) as definition
      FROM pg_constraint
      WHERE conrelid = 'public.reflex_events'::regclass
        AND conname = 'reflex_events_source_check';
    `);
    
    if (constraintResult.rows.length > 0) {
      console.log('✅ CHECK constraint exists:');
      console.log(`   ${constraintResult.rows[0].definition}`);
    } else {
      console.log('⚠️  CHECK constraint not found');
    }
    
  } catch (error: any) {
    console.error('\n❌ Verification failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run verification
verifyIndexes().catch(console.error);

