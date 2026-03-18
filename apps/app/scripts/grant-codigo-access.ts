#!/usr/bin/env tsx
/**
 * Grant CODIGO access to a user by email.
 * Uses Supabase admin client to resolve email → userId, then grants via Prisma.
 *
 * Usage:
 *   npx tsx scripts/grant-codigo-access.ts your@email.com
 *   EMAIL=your@email.com npx tsx scripts/grant-codigo-access.ts
 *
 * Use this when magic-link users need CODIGO access but don't have admin/owner membership.
 * The codigo_access.user_id must match Supabase auth.users.id.
 */

import { adminClient } from '../lib/supabase';
import { grantCodigoAccess } from '../lib/codigo-access';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function main() {
  const input = process.env.EMAIL || process.env.USER_ID || process.argv[2];
  if (!input) {
    console.error('Usage: npx tsx scripts/grant-codigo-access.ts <email|userId>');
    console.error('   or: EMAIL=your@email.com npx tsx scripts/grant-codigo-access.ts');
    process.exit(1);
  }

  let userId: string;

  if (UUID_REGEX.test(input)) {
    userId = input;
    console.log(`Granting CODIGO access for userId: ${userId}`);
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
      console.error('Ensure the user has signed in at least once (e.g. via magic link).');
      console.error('Or pass the userId directly from Supabase Dashboard → Authentication → Users.');
      process.exit(1);
    }
    userId = user.id;
    console.log(`Found user: ${email} (${userId})`);
  }

  const { grantedAt, expiresAt } = await grantCodigoAccess(userId);
  console.log(`CODIGO access granted`);
  console.log(`  userId: ${userId}`);
  console.log(`  grantedAt: ${grantedAt.toISOString()}`);
  console.log(`  expiresAt: ${expiresAt.toISOString()}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
