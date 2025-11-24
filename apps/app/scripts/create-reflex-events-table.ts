/**
 * Script to create reflex_events table using pooler connection
 * Run with: npx tsx scripts/create-reflex-events-table.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createReflexEventsTable() {
  console.log('🚀 Creating reflex_events table...\n');

  try {
    console.log('Creating table...');
    // Create table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS public.reflex_events (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        source TEXT NOT NULL DEFAULT 'ui',
        "sessionId" TEXT,
        "paymentIntent" TEXT,
        payload TEXT,
        "payloadHash" TEXT,
        "userAgent" TEXT,
        ip TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "ctaSource" TEXT,
        "ctaType" TEXT,
        referrer TEXT,
        "campaignId" TEXT,
        metadata TEXT,
        "trustEventTypeV1" TEXT,
        tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL
      )
    `);

    console.log('Creating indexes...');
    // Create indexes one by one
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_reflex_events_type_createdAt ON public.reflex_events(type, "createdAt")`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_reflex_events_ctaSource ON public.reflex_events("ctaSource")`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_reflex_events_ctaType ON public.reflex_events("ctaType")`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_reflex_events_campaignId ON public.reflex_events("campaignId")`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_reflex_events_trustEventTypeV1 ON public.reflex_events("trustEventTypeV1") WHERE "trustEventTypeV1" IS NOT NULL`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_reflex_events_tenant_id ON public.reflex_events(tenant_id) WHERE tenant_id IS NOT NULL`);

    console.log('Enabling RLS...');
    // Enable RLS
    await prisma.$executeRawUnsafe(`ALTER TABLE public.reflex_events ENABLE ROW LEVEL SECURITY`);

    console.log('Creating policy...');
    // Create policy (using DO block for idempotency)
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies
          WHERE schemaname = 'public' AND tablename = 'reflex_events' AND policyname = 'dev_allow_all_reflex_events'
        ) THEN
          CREATE POLICY "dev_allow_all_reflex_events"
            ON public.reflex_events
            FOR ALL
            USING (true)
            WITH CHECK (true);
        END IF;
      END $$
    `);

    console.log('Adding comment...');
    // Add comment
    await prisma.$executeRawUnsafe(`COMMENT ON TABLE public.reflex_events IS 'Tracks Reflex events including CTA clicks, onboarding signups, and other system events'`);

    console.log('✅ reflex_events table created successfully!');
    console.log('✅ Indexes created');
    console.log('✅ RLS enabled');
    console.log('✅ Policy created\n');

    // Verify table exists
    const tableExists = await prisma.$queryRawUnsafe(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'reflex_events'
      );
    `);

    console.log('Verification:', tableExists);

  } catch (error) {
    console.error('\n❌ Error creating table:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createReflexEventsTable();

