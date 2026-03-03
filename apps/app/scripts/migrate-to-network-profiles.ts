/**
 * Migration script to migrate existing LoyaltyProfile data to NetworkProfile
 * 
 * Run with: npx tsx scripts/migrate-to-network-profiles.ts
 */

import { PrismaClient } from '@prisma/client';
import { resolveHID } from '../lib/hid/resolver';
import { syncSessionToNetwork, syncNoteToNetwork } from '../lib/profiles/network';

const prisma = new PrismaClient();

/**
 * Migrate existing LoyaltyProfile data to NetworkProfile
 */
async function migrateLoyaltyProfiles() {
  console.log('🔄 Migrating loyalty profiles to network profiles...\n');

  const loyaltyProfiles = await prisma.loyaltyProfile.findMany({
    include: {
      noteBindings: {
        include: {
          sessionNote: {
            include: {
              session: true,
            },
          },
        },
      },
    },
  });

  let migrated = 0;
  let skipped = 0;
  let errors: string[] = [];

  for (const lp of loyaltyProfiles) {
    try {
      // Try to resolve HID from guestKey (might be phone/email)
      const isEmail = lp.guestKey.includes('@');
      const hidResult = await resolveHID({
        phone: isEmail ? undefined : lp.guestKey,
        email: isEmail ? lp.guestKey : undefined,
      });

      // Create network session for each session linked to notes
      for (const binding of lp.noteBindings) {
        const session = binding.sessionNote.session;
        if (session) {
          try {
            await syncSessionToNetwork(
              session.id,
              hidResult.hid,
              lp.loungeId,
              undefined, // items
              lp.cumulativeSpend,
              undefined // posRef
            );
          } catch (error) {
            console.error(`Failed to sync session ${session.id}:`, error);
          }
        }
      }

      migrated++;
      if (migrated % 10 === 0) {
        console.log(`  Migrated ${migrated} profiles...`);
      }
    } catch (error) {
      console.error(`Failed to migrate profile ${lp.id}:`, error);
      skipped++;
      errors.push(`Profile ${lp.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  console.log(`\n✅ Migration complete:`);
  console.log(`   - Migrated: ${migrated} profiles`);
  console.log(`   - Skipped: ${skipped} profiles`);
  if (errors.length > 0) {
    console.log(`   - Errors: ${errors.length}`);
    console.log(`   First 5 errors:`);
    errors.slice(0, 5).forEach((err) => console.log(`     - ${err}`));
  }
}

/**
 * Migrate existing SessionNotes to network if they have customer info
 */
async function migrateSessionNotes() {
  console.log('\n🔄 Migrating session notes to network...\n');

  const sessions = await prisma.session.findMany({
    where: {
      OR: [
        { customerPhone: { not: null } },
        { customerRef: { not: null } },
      ],
    },
    include: {
      notes: true,
    },
  });

  let migrated = 0;
  let skipped = 0;

  for (const session of sessions) {
    try {
      // Resolve HID
      const hidResult = await resolveHID({
        phone: session.customerPhone || undefined,
        email: session.customerRef?.includes('@') ? session.customerRef : undefined,
      });

      if (!hidResult.hid) {
        skipped++;
        continue;
      }

      // Update session with HID
      await prisma.session.update({
        where: { id: session.id },
        data: { hid: hidResult.hid },
      });

      // Sync network notes for network-scoped notes
      for (const note of session.notes) {
        if (note.shareScope === 'network') {
          try {
            await syncNoteToNetwork(
              note.id,
              hidResult.hid,
              session.loungeId,
              note.createdBy,
              note.text,
              'network'
            );
            migrated++;
          } catch (error) {
            console.error(`Failed to sync note ${note.id}:`, error);
          }
        }
      }
    } catch (error) {
      console.error(`Failed to migrate session ${session.id}:`, error);
      skipped++;
    }
  }

  console.log(`✅ Notes migration complete:`);
  console.log(`   - Migrated: ${migrated} notes`);
  console.log(`   - Skipped: ${skipped} sessions`);
}

// Run migrations
async function main() {
  try {
    await migrateLoyaltyProfiles();
    await migrateSessionNotes();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

