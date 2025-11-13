/**
 * Backfill Taxonomy v1 Migration Script
 * 
 * Idempotent script to migrate existing data from legacy enums to v1 taxonomy.
 * Can be run multiple times safely.
 * 
 * Usage: npx tsx scripts/backfill-taxonomy-v1.ts
 */

import 'dotenv/config';
import { resolve } from 'path';
import { config } from 'dotenv';
import { prisma } from '../lib/db';
import {
  mapSessionState,
  mapTrustEvent,
  mapDriftReason
} from '../lib/taxonomy/enums-v1';
import { trackUnknown } from '../lib/taxonomy/unknown-tracker';

// Load .env.local explicitly
config({ path: resolve(__dirname, '../.env.local') });

interface MigrationStats {
  sessions: {
    total: number;
    migrated: number;
    skipped: number;
    errors: number;
    unknowns: number;
  };
  reflexEvents: {
    total: number;
    migrated: number;
    skipped: number;
    errors: number;
    unknowns: number;
  };
}

async function backfillSessions(): Promise<MigrationStats['sessions']> {
  console.log('\n📦 Backfilling Session.session_state_v1...');
  
  const stats = {
    total: 0,
    migrated: 0,
    skipped: 0,
    errors: 0,
    unknowns: 0
  };

  try {
    // Get all sessions that don't have session_state_v1 set
    const sessions = await prisma.session.findMany({
      where: {
        sessionStateV1: null
      },
      select: {
        id: true,
        state: true,
        startedAt: true,
        endedAt: true,
        // Check for prep/handoff indicators (these might be in other fields)
        // For now, we'll use startedAt as a proxy for prep_started_at
      }
    });

    stats.total = sessions.length;
    console.log(`Found ${stats.total} sessions to migrate`);

    for (const session of sessions) {
      try {
        // Map legacy state to v1
        const legacyState = session.state as string;
        const mapped = mapSessionState(legacyState, {
          prep_started_at: session.startedAt,
          handoff_started_at: null, // We don't have this field yet, will default to prep
        });

        // Update session with v1 state and paused flag
        await prisma.session.update({
          where: { id: session.id },
          data: {
            sessionStateV1: mapped.state,
            paused: mapped.paused
          }
        });

        stats.migrated++;
        
        if (stats.migrated % 100 === 0) {
          console.log(`  Migrated ${stats.migrated}/${stats.total} sessions...`);
        }
      } catch (error) {
        console.error(`  Error migrating session ${session.id}:`, error);
        stats.errors++;
        
        // Track unknown if mapping failed
        if (error instanceof Error && error.message.includes('Unknown')) {
          await trackUnknown('SessionState', session.state as string, session.id, {
            sessionId: session.id,
            legacyState: session.state
          });
          stats.unknowns++;
        }
      }
    }

    console.log(`✅ Sessions: ${stats.migrated} migrated, ${stats.skipped} skipped, ${stats.errors} errors, ${stats.unknowns} unknowns`);
  } catch (error) {
    console.error('❌ Error backfilling sessions:', error);
    stats.errors = stats.total;
  }

  return stats;
}

async function backfillReflexEvents(): Promise<MigrationStats['reflexEvents']> {
  console.log('\n📦 Backfilling ReflexEvent.trust_event_type_v1...');
  
  const stats = {
    total: 0,
    migrated: 0,
    skipped: 0,
    errors: 0,
    unknowns: 0
  };

  try {
    // Get all reflex events that don't have trust_event_type_v1 set
    const events = await prisma.reflexEvent.findMany({
      where: {
        trustEventTypeV1: null
      },
      select: {
        id: true,
        type: true,
      }
    });

    stats.total = events.length;
    console.log(`Found ${stats.total} reflex events to migrate`);

    for (const event of events) {
      try {
        // Map legacy type to v1
        const mapped = mapTrustEvent(event.type);

        if (mapped.v1) {
          // Update event with v1 type
          await prisma.reflexEvent.update({
            where: { id: event.id },
            data: {
              trustEventTypeV1: mapped.v1
            }
          });

          stats.migrated++;
        } else if (mapped.unknown) {
          // Track unknown type
          await trackUnknown('TrustEventType', mapped.unknown, event.id, {
            eventId: event.id,
            legacyType: event.type
          });
          stats.unknowns++;
        }

        if (stats.migrated % 100 === 0) {
          console.log(`  Migrated ${stats.migrated}/${stats.total} events...`);
        }
      } catch (error) {
        console.error(`  Error migrating event ${event.id}:`, error);
        stats.errors++;
      }
    }

    console.log(`✅ ReflexEvents: ${stats.migrated} migrated, ${stats.skipped} skipped, ${stats.errors} errors, ${stats.unknowns} unknowns`);
  } catch (error) {
    console.error('❌ Error backfilling reflex events:', error);
    stats.errors = stats.total;
  }

  return stats;
}

async function main() {
  console.log('🚀 Starting Taxonomy v1 Backfill Migration');
  console.log('═'.repeat(60));

  const stats: MigrationStats = {
    sessions: {
      total: 0,
      migrated: 0,
      skipped: 0,
      errors: 0,
      unknowns: 0
    },
    reflexEvents: {
      total: 0,
      migrated: 0,
      skipped: 0,
      errors: 0,
      unknowns: 0
    }
  };

  try {
    // Backfill sessions
    stats.sessions = await backfillSessions();

    // Backfill reflex events
    stats.reflexEvents = await backfillReflexEvents();

    // Print summary
    console.log('\n' + '═'.repeat(60));
    console.log('📊 Migration Summary');
    console.log('═'.repeat(60));
    console.log('\nSessions:');
    console.log(`  Total: ${stats.sessions.total}`);
    console.log(`  Migrated: ${stats.sessions.migrated}`);
    console.log(`  Errors: ${stats.sessions.errors}`);
    console.log(`  Unknowns: ${stats.sessions.unknowns}`);
    console.log('\nReflexEvents:');
    console.log(`  Total: ${stats.reflexEvents.total}`);
    console.log(`  Migrated: ${stats.reflexEvents.migrated}`);
    console.log(`  Errors: ${stats.reflexEvents.errors}`);
    console.log(`  Unknowns: ${stats.reflexEvents.unknowns}`);
    console.log('\n' + '═'.repeat(60));

    const totalMigrated = stats.sessions.migrated + stats.reflexEvents.migrated;
    const totalErrors = stats.sessions.errors + stats.reflexEvents.errors;
    const totalUnknowns = stats.sessions.unknowns + stats.reflexEvents.unknowns;

    if (totalErrors === 0 && totalUnknowns === 0) {
      console.log('✅ Migration completed successfully!');
    } else {
      console.log(`⚠️  Migration completed with ${totalErrors} errors and ${totalUnknowns} unknowns`);
      console.log('   Check the Taxonomy dashboard for unknown values to review.');
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
main().catch(console.error);

