#!/usr/bin/env tsx
/**
 * Enable Soft Launch for CODIGO lounge.
 *
 * Sets softLaunchEnabled=true for loungeId CODIGO in LoungeConfig.
 *
 * Usage:
 *   npx tsx scripts/enable-codigo-soft-launch.ts
 *
 * Run from apps/app directory (or ensure DATABASE_URL is set).
 */

import { prisma } from '../lib/db';

const LOUNGE_ID_CODIGO = 'CODIGO';

async function main() {
  const config = await prisma.loungeConfig.upsert({
    where: { loungeId: LOUNGE_ID_CODIGO },
    update: { softLaunchEnabled: true },
    create: {
      loungeId: LOUNGE_ID_CODIGO,
      configData: '{}',
      version: 1,
      softLaunchEnabled: true,
    },
  });

  console.log('✅ Soft Launch enabled for CODIGO');
  console.log(`   loungeId: ${config.loungeId}`);
  console.log(`   softLaunchEnabled: ${config.softLaunchEnabled}`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
