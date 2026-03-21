#!/usr/bin/env tsx
/**
 * Downgrade a user's tenant membership role to `viewer` (lowest role: owner > admin > staff > viewer).
 *
 * Default: only updates rows where role is `owner` or `admin`.
 * Use --all to set every membership for that user to `viewer` (including `staff`).
 *
 * Usage:
 *   npx tsx scripts/downgrade-membership-role.ts moe@districthookah.com
 *   EMAIL=moe@districthookah.com npx tsx scripts/downgrade-membership-role.ts
 *   npx tsx scripts/downgrade-membership-role.ts --all moe@districthookah.com
 *   DRY_RUN=1 npx tsx scripts/downgrade-membership-role.ts moe@districthookah.com
 *
 * Run from apps/app. Requires DATABASE_URL; for email lookup: Supabase admin (same as grant-codigo script).
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { adminClient } from '../lib/supabase';
import { prisma } from '../lib/db';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function parseArgs(argv: string[]) {
  const all = argv.includes('--all');
  const rest = argv.filter((a) => a !== '--all');
  const input = process.env.EMAIL || process.env.USER_ID || rest.find((a) => !a.startsWith('-'));
  return { all, input };
}

async function main() {
  const { all, input } = parseArgs(process.argv.slice(2));
  const dryRun = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true';

  if (!input) {
    console.error('Usage: npx tsx scripts/downgrade-membership-role.ts [--all] <email|userId>');
    console.error('   or: EMAIL=moe@districthookah.com npx tsx scripts/downgrade-membership-role.ts');
    console.error('');
    console.error('  Default: only owner/admin → viewer');
    console.error('  --all:   every membership for user → viewer');
    console.error('  DRY_RUN=1: print rows only, no update');
    process.exit(1);
  }

  let userId: string;

  if (UUID_REGEX.test(input)) {
    userId = input;
    console.log(`Target userId: ${userId}`);
  } else {
    const email = input;
    const supabase = adminClient();
    const { data: { users }, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    if (error) {
      console.error('Failed to list users:', error.message);
      process.exit(1);
    }
    const user = users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (!user) {
      console.error(`No Supabase auth user found for email: ${email}`);
      process.exit(1);
    }
    userId = user.id;
    console.log(`Found user: ${email} (${userId})`);
  }

  const existing = await prisma.membership.findMany({
    where: { userId },
    include: { tenant: { select: { id: true, name: true } } },
  });

  if (existing.length === 0) {
    console.error('No memberships found for this user.');
    process.exit(1);
  }

  const toViewer: typeof existing = [];

  for (const m of existing) {
    if (all) {
      if (m.role !== 'viewer') toViewer.push(m);
    } else if (m.role === 'owner' || m.role === 'admin') {
      toViewer.push(m);
    }
  }

  if (!all) {
    for (const m of existing) {
      if (m.role === 'staff' || m.role === 'viewer') {
        console.log(`  skip (not owner/admin): tenant ${m.tenant.name} (${m.tenantId}) role=${m.role}`);
      }
    }
  }

  if (toViewer.length === 0) {
    console.log(all ? 'Nothing to change (already viewer everywhere).' : 'No owner/admin memberships to downgrade.');
    process.exit(0);
  }

  console.log(dryRun ? 'DRY RUN — would update:' : 'Updating:');
  for (const m of toViewer) {
    console.log(`  tenant "${m.tenant.name}" (${m.tenantId}): ${m.role} → viewer`);
  }

  if (dryRun) {
    console.log('Set DRY_RUN=0 or omit DRY_RUN to apply.');
    process.exit(0);
  }

  const targetRoles = all ? (['owner', 'admin', 'staff'] as const) : (['owner', 'admin'] as const);

  const result = await prisma.membership.updateMany({
    where: {
      userId,
      role: { in: [...targetRoles] },
    },
    data: { role: 'viewer' },
  });

  console.log(`Done. Rows updated: ${result.count}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
