/**
 * Apply Analytics Indexes Migration (Direct PostgreSQL)
 * 
 * This script applies the composite indexes migration using a direct PostgreSQL connection.
 * 
 * Usage: npx tsx scripts/apply-analytics-indexes-direct.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { Client } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
const envPath = path.join(__dirname, '../.env.local');
dotenv.config({ path: envPath });

async function applyIndexes() {
  console.log('🔧 Applying Analytics Indexes Migration');
  console.log('='.repeat(70));
  
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL not found in environment variables');
  }
  
  // Parse PostgreSQL connection string
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
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '../../../supabase/migrations/20251115000003_add_analytics_indexes.sql');
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found at: ${migrationPath}`);
    }
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
    
    // Extract CREATE INDEX statements
    const createIndexRegex = /CREATE\s+INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)[\s\S]*?;/gi;
    const statements: Array<{ name: string; sql: string }> = [];
    let match;
    
    while ((match = createIndexRegex.exec(migrationSQL)) !== null) {
      const indexName = match[1];
      const sql = match[0].trim();
      statements.push({ name: indexName, sql });
    }
    
    // Fallback: manual extraction if regex fails
    if (statements.length === 0) {
      const lines = migrationSQL.split('\n');
      let inTransaction = false;
      let currentStatement = '';
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed === 'BEGIN') {
          inTransaction = true;
          continue;
        }
        if (trimmed === 'COMMIT') {
          inTransaction = false;
          continue;
        }
        if (!inTransaction) continue;
        if (trimmed.startsWith('--')) continue;
        if (!trimmed) continue;
        
        currentStatement += line + '\n';
        if (trimmed.endsWith(';')) {
          const stmt = currentStatement.trim();
          if (stmt.includes('CREATE INDEX')) {
            const nameMatch = stmt.match(/CREATE\s+INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/i);
            const name = nameMatch ? nameMatch[1] : 'unknown';
            statements.push({ name, sql: stmt });
          }
          currentStatement = '';
        }
      }
    }
    
    console.log(`📋 Found ${statements.length} index creation statements\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Execute each CREATE INDEX statement
    for (const { name, sql } of statements) {
      try {
        console.log(`Creating index: ${name}...`);
        await client.query(sql);
        console.log(`  ✅ ${name} created successfully\n`);
        successCount++;
      } catch (error: any) {
        // Check if index already exists (not a real error)
        if (error?.message?.includes('already exists') || 
            error?.code === '42P07' || 
            error?.message?.includes('duplicate')) {
          console.log(`  ⚠️  ${name} already exists (skipping)\n`);
          successCount++;
        } else {
          console.error(`  ❌ Failed to create ${name}:`, error.message);
          console.error(`  SQL: ${sql.substring(0, 100)}...\n`);
          errorCount++;
        }
      }
    }
    
    // Verification query
    console.log('\n📊 Verifying Indexes');
    console.log('-'.repeat(70));
    
    try {
      const result = await client.query(`
        SELECT 
          indexname,
          tablename,
          indexdef
        FROM pg_indexes 
        WHERE schemaname = 'public' 
          AND (
            indexname LIKE 'idx_session_created_at%' OR
            indexname LIKE 'idx_reflex_event_created_at%'
          )
          AND tablename IN ('Session', 'ReflexEvent')
        ORDER BY tablename, indexname;
      `);
      
      if (result.rows.length > 0) {
        console.log(`\n✅ Found ${result.rows.length} analytics indexes:\n`);
        result.rows.forEach((row: any) => {
          console.log(`  ${row.indexname} (${row.tablename})`);
        });
      } else {
        console.log('\n⚠️  No analytics indexes found. They may not have been created.');
      }
    } catch (verifyError: any) {
      console.error('⚠️  Could not verify indexes:', verifyError.message);
    }
    
    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 Migration Summary');
    console.log('='.repeat(70));
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    console.log(`📋 Total: ${statements.length}`);
    
    if (errorCount === 0) {
      console.log('\n🎉 All indexes applied successfully!');
      console.log('\n💡 Next Steps:');
      console.log('   1. Re-run performance tests to verify improvements');
      console.log('   2. Monitor analytics endpoint response times');
      console.log('   3. Check Supabase Performance Advisor for index usage');
    } else {
      console.log('\n⚠️  Some indexes failed to create. Check errors above.');
    }
    
  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the migration
applyIndexes().catch(console.error);

