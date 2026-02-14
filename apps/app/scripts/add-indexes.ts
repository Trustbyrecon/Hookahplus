/**
 * Database Index Migration Script
 * 
 * Adds performance indexes based on load testing results.
 * Run with: npx tsx apps/app/scripts/add-indexes.ts
 * 
 * Note: This script uses Prisma's $executeRaw to add indexes.
 * For production, consider using Prisma migrations instead.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const indexes = [
  {
    name: 'idx_session_state_tableid',
    sql: `
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_session_state_tableid 
      ON "Session"(state, "tableId") 
      WHERE state NOT IN ('CLOSED', 'CANCELED') AND "tableId" IS NOT NULL;
    `,
    description: 'Index for active sessions query (used in availability checks)'
  },
  {
    name: 'idx_session_created_at',
    sql: `
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_session_created_at 
      ON "Session"("createdAt") 
      WHERE "tableId" IS NOT NULL;
    `,
    description: 'Index for date range queries (used in analytics)'
  },
  {
    name: 'idx_session_table_id',
    sql: `
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_session_table_id 
      ON "Session"("tableId") 
      WHERE "tableId" IS NOT NULL;
    `,
    description: 'Index for table-specific queries'
  },
  {
    name: 'idx_session_analytics',
    sql: `
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_session_analytics 
      ON "Session"("createdAt", "tableId", "priceCents", "durationSecs", state)
      WHERE "tableId" IS NOT NULL;
    `,
    description: 'Composite index for analytics queries'
  },
  {
    name: 'idx_session_active',
    sql: `
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_session_active 
      ON "Session"(state, "tableId", "createdAt")
      WHERE state NOT IN ('CLOSED', 'CANCELED') AND "tableId" IS NOT NULL;
    `,
    description: 'Index for active sessions with state filtering'
  },
  {
    name: 'idx_reservations_active',
    sql: `
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reservations_active 
      ON reservations(venue_id, table_id, status, created_at)
      WHERE status != 'CANCELLED';
    `,
    description: 'Index for active reservations lookup'
  },
  {
    name: 'idx_reservations_time',
    sql: `
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reservations_time 
      ON reservations(table_id, created_at, window_minutes);
    `,
    description: 'Index for time-based reservation checks'
  },
  {
    name: 'idx_org_settings_key',
    sql: `
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_org_settings_key 
      ON org_settings(key);
    `,
    description: 'Index for layout lookups (may already exist)'
  }
];

async function addIndexes() {
  console.log('🔧 Adding Performance Indexes\n');
  console.log('='.repeat(60) + '\n');

  let successCount = 0;
  let failCount = 0;

  for (const index of indexes) {
    try {
      console.log(`Creating index: ${index.name}`);
      console.log(`  ${index.description}`);
      
      // Note: CONCURRENTLY requires separate connection in some databases
      // For PostgreSQL, we'll try without CONCURRENTLY first if it fails
      try {
        await prisma.$executeRawUnsafe(index.sql);
        console.log(`  ✅ Success\n`);
        successCount++;
      } catch (error: any) {
        // If CONCURRENTLY fails, try without it (for transactions)
        if (error.message?.includes('CONCURRENTLY') || error.message?.includes('concurrent')) {
          console.log(`  ⚠️  CONCURRENTLY not supported, trying without...`);
          const sqlWithoutConcurrently = index.sql.replace(/CONCURRENTLY/gi, '');
          await prisma.$executeRawUnsafe(sqlWithoutConcurrently);
          console.log(`  ✅ Success (without CONCURRENTLY)\n`);
          successCount++;
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error(`  ❌ Failed: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
      failCount++;
    }
  }

  // Update statistics
  try {
    console.log('Updating table statistics...');
    await prisma.$executeRawUnsafe('ANALYZE "Session";');
    await prisma.$executeRawUnsafe('ANALYZE reservations;');
    try {
      await prisma.$executeRawUnsafe('ANALYZE org_settings;');
    } catch (error) {
      // org_settings might not exist, that's okay
      console.log('  ⚠️  org_settings table not found (may not exist yet)');
    }
    console.log('  ✅ Statistics updated\n');
  } catch (error) {
    console.error(`  ⚠️  Could not update statistics: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
  }

  console.log('='.repeat(60));
  console.log('\n📊 Summary\n');
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`Total: ${indexes.length}`);

  if (failCount === 0) {
    console.log('\n✅ All indexes created successfully!');
    console.log('   Performance improvements should be visible immediately.');
  } else {
    console.log('\n⚠️  Some indexes failed to create.');
    console.log('   Check database permissions and connection settings.');
  }
}

addIndexes()
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

