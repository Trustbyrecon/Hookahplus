#!/usr/bin/env tsx

/**
 * Migration Script: Map loungeId → tenant_id
 * 
 * This script:
 * 1. Finds all unique loungeId values from Session table
 * 2. Creates Tenant records for each unique loungeId
 * 3. Updates all Session records to set tenant_id
 * 4. Updates ReflexEvent records (if they reference loungeId)
 * 
 * Run with: npx tsx scripts/migrate-loungeid-to-tenant.ts
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env.local
const envPath = resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

const prisma = new PrismaClient();

interface LoungeIdMapping {
  loungeId: string;
  tenantId: string;
  sessionCount: number;
}

async function migrateLoungeIdToTenant() {
  try {
    console.log('🔄 Starting loungeId → tenant_id migration...\n');

    // Step 1: Find all unique loungeId values
    console.log('📊 Step 1: Finding unique loungeId values...');
    const uniqueLoungeIds = await prisma.session.findMany({
      select: {
        loungeId: true,
      },
      distinct: ['loungeId'],
    });

    const loungeIds = uniqueLoungeIds.map(s => s.loungeId).filter(Boolean);
    console.log(`   Found ${loungeIds.length} unique loungeIds:`, loungeIds);

    if (loungeIds.length === 0) {
      console.log('⚠️  No loungeIds found. Creating default tenant...');
      const defaultTenant = await prisma.tenant.create({
        data: {
          name: 'Default Lounge',
        },
      });
      console.log(`✅ Created default tenant: ${defaultTenant.id}`);
      
      // Update all sessions without loungeId to use default tenant
      const updatedSessions = await prisma.session.updateMany({
        where: {
          OR: [
            { loungeId: null },
            { loungeId: '' },
            { tenantId: null },
          ],
        },
        data: {
          tenantId: defaultTenant.id,
        },
      });
      console.log(`✅ Updated ${updatedSessions.count} sessions to default tenant`);
      process.exit(0);
    }

    // Step 2: Create Tenant records and build mapping
    console.log('\n📦 Step 2: Creating Tenant records...');
    const mapping: LoungeIdMapping[] = [];

    for (const loungeId of loungeIds) {
      // Check if tenant already exists for this loungeId
      let tenant = await prisma.tenant.findFirst({
        where: {
          name: loungeId,
        },
      });

      if (!tenant) {
        tenant = await prisma.tenant.create({
          data: {
            name: loungeId,
          },
        });
        console.log(`   ✅ Created tenant: ${tenant.name} (${tenant.id})`);
      } else {
        console.log(`   ℹ️  Tenant already exists: ${tenant.name} (${tenant.id})`);
      }

      // Count sessions for this loungeId
      const sessionCount = await prisma.session.count({
        where: {
          loungeId: loungeId,
        },
      });

      mapping.push({
        loungeId,
        tenantId: tenant.id,
        sessionCount,
      });
    }

    // Step 3: Update Session records
    console.log('\n🔄 Step 3: Updating Session records...');
    let totalUpdated = 0;

    for (const { loungeId, tenantId, sessionCount } of mapping) {
      const result = await prisma.session.updateMany({
        where: {
          loungeId: loungeId,
          tenantId: null, // Only update if tenant_id is not already set
        },
        data: {
          tenantId: tenantId,
        },
      });

      totalUpdated += result.count;
      console.log(`   ✅ Updated ${result.count}/${sessionCount} sessions for ${loungeId}`);
    }

    console.log(`\n✅ Total sessions updated: ${totalUpdated}`);

    // Step 4: Update ReflexEvent records (if they have sessionId, we can infer tenant_id)
    console.log('\n🔄 Step 4: Updating ReflexEvent records...');
    
    // Get all events with sessionId
    const eventsWithSessions = await prisma.reflexEvent.findMany({
      where: {
        sessionId: { not: null },
        tenantId: null,
      },
      select: {
        id: true,
        sessionId: true,
      },
      take: 10000, // Process in batches if needed
    });

    console.log(`   Found ${eventsWithSessions.length} events with sessionId`);

    // Get tenant_id for each session
    let eventsUpdated = 0;
    for (const event of eventsWithSessions) {
      if (!event.sessionId) continue;

      const session = await prisma.session.findUnique({
        where: { id: event.sessionId },
        select: { tenantId: true },
      });

      if (session?.tenantId) {
        await prisma.reflexEvent.update({
          where: { id: event.id },
          data: { tenantId: session.tenantId },
        });
        eventsUpdated++;
      }
    }

    console.log(`   ✅ Updated ${eventsUpdated} ReflexEvent records`);

    // Step 5: Verify migration
    console.log('\n✅ Step 5: Verifying migration...');
    const sessionsWithoutTenant = await prisma.session.count({
      where: {
        tenantId: null,
      },
    });

    if (sessionsWithoutTenant > 0) {
      console.log(`   ⚠️  Warning: ${sessionsWithoutTenant} sessions still have null tenant_id`);
    } else {
      console.log('   ✅ All sessions have tenant_id');
    }

    const eventsWithoutTenant = await prisma.reflexEvent.count({
      where: {
        sessionId: { not: null },
        tenantId: null,
      },
    });

    if (eventsWithoutTenant > 0) {
      console.log(`   ⚠️  Warning: ${eventsWithoutTenant} events with sessionId still have null tenant_id`);
    } else {
      console.log('   ✅ All events with sessionId have tenant_id');
    }

    // Summary
    console.log('\n📊 Migration Summary:');
    console.log(`   Tenants created: ${mapping.length}`);
    console.log(`   Sessions updated: ${totalUpdated}`);
    console.log(`   Events updated: ${eventsUpdated}`);
    console.log(`   Sessions without tenant: ${sessionsWithoutTenant}`);
    console.log(`   Events without tenant: ${eventsWithoutTenant}`);

    console.log('\n✅ Migration completed successfully!');
    process.exit(0);

  } catch (error: any) {
    console.error('❌ Migration failed:', error);
    console.error('   Error details:', error.message);
    if (error.stack) {
      console.error('   Stack:', error.stack);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateLoungeIdToTenant();

