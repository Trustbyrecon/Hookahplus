/**
 * Script to add trustEventTypeV1 column to reflex_events table
 * Run with: npx tsx scripts/add-trust-event-type-column.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addTrustEventTypeColumn() {
  console.log('🚀 Adding trustEventTypeV1 column to reflex_events table...\n');

  try {
    // Check if column exists
    const columnExists = await prisma.$queryRawUnsafe(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'reflex_events'
        AND column_name = 'trustEventTypeV1'
      );
    `) as Array<{ exists: boolean }>;

    if (columnExists[0]?.exists) {
      console.log('✅ Column trustEventTypeV1 already exists');
      return;
    }

    // Add the column
    await prisma.$executeRawUnsafe(`
      ALTER TABLE public.reflex_events
      ADD COLUMN "trustEventTypeV1" TEXT;
    `);

    console.log('✅ Column trustEventTypeV1 added successfully');

    // Create index if it doesn't exist
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_reflex_events_trustEventTypeV1 
      ON public.reflex_events("trustEventTypeV1")
      WHERE "trustEventTypeV1" IS NOT NULL;
    `);

    console.log('✅ Index created for trustEventTypeV1');

  } catch (error) {
    console.error('\n❌ Error adding column:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addTrustEventTypeColumn();

