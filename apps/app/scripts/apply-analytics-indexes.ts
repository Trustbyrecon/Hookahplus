/**
 * Apply Analytics Indexes Migration
 * 
 * This script applies the composite indexes migration to optimize analytics queries.
 * 
 * Usage: npx tsx scripts/apply-analytics-indexes.ts
 */

import { prisma } from '../lib/db';
import * as fs from 'fs';
import * as path from 'path';

async function applyIndexes() {
  console.log('🔧 Applying Analytics Indexes Migration');
  console.log('='.repeat(70));
  
  try {
    // Read the migration file (from root supabase/migrations directory)
    const migrationPath = path.join(__dirname, '../../../supabase/migrations/20251115000003_add_analytics_indexes.sql');
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found at: ${migrationPath}`);
    }
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
    
    // Extract CREATE INDEX statements (handle multi-line and comments)
    const createIndexRegex = /CREATE\s+INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)[\s\S]*?;/gi;
    const statements: string[] = [];
    let match;
    
    while ((match = createIndexRegex.exec(migrationSQL)) !== null) {
      let statement = match[0].trim();
      // Remove trailing semicolon if present (we'll add it back)
      if (statement.endsWith(';')) {
        statement = statement.slice(0, -1);
      }
      statements.push(statement);
    }
    
    // If regex didn't work, fall back to manual extraction
    if (statements.length === 0) {
      // Extract lines between BEGIN and COMMIT, filter out comments
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
            statements.push(stmt.replace(/;+$/, ''));
          }
          currentStatement = '';
        }
      }
    }
    
    console.log(`\n📋 Found ${statements.length} index creation statements\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Execute each CREATE INDEX statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement || statement.length < 10) continue; // Skip empty or very short statements
      
      // Extract index name for logging
      const indexMatch = statement.match(/CREATE INDEX (?:IF NOT EXISTS )?(\w+)/i);
      const indexName = indexMatch ? indexMatch[1] : `index_${i + 1}`;
      
      try {
        console.log(`Creating index: ${indexName}...`);
        await prisma.$executeRawUnsafe(statement + ';');
        console.log(`  ✅ ${indexName} created successfully\n`);
        successCount++;
      } catch (error: any) {
        // Check if index already exists (not a real error)
        if (error?.message?.includes('already exists') || 
            error?.code === '42P07' || 
            error?.message?.includes('duplicate')) {
          console.log(`  ⚠️  ${indexName} already exists (skipping)\n`);
          successCount++;
        } else {
          console.error(`  ❌ Failed to create ${indexName}:`, error.message);
          console.error(`  SQL: ${statement.substring(0, 100)}...\n`);
          errorCount++;
        }
      }
    }
    
    // Verification query
    console.log('\n📊 Verifying Indexes');
    console.log('-'.repeat(70));
    
    try {
      const indexes = await prisma.$queryRawUnsafe(`
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
      `) as Array<{ indexname: string; tablename: string; indexdef: string }>;
      
      if (indexes.length > 0) {
        console.log(`\n✅ Found ${indexes.length} analytics indexes:\n`);
        indexes.forEach(idx => {
          console.log(`  ${idx.indexname} (${idx.tablename})`);
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
    await prisma.$disconnect();
  }
}

// Run the migration
applyIndexes().catch(console.error);

