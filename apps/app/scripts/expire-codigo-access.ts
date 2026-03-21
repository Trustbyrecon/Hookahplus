#!/usr/bin/env tsx
/**
 * Expire CODIGO pilot access immediately (Option A): set expiresAt to ~1 minute ago.
 * Status stays `active`; checks use `now < expiresAt`, so access ends right away.
 *
 * Usage:
 *   npx tsx scripts/expire-codigo-access.ts moe@districthookah.com
 *   EMAIL=moe@districthookah.com npx tsx scripts/expire-codigo-access.ts
 *
 * Run from apps/app. Requires DATABASE_URL, and for email lookup:
 *   NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (same as grant script).
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { adminClient } from '../lib/supabase';
import { expireCodigoAccessNow } from '../lib/codigo-access';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function main() {
  const input = process.env.EMAIL || process.env.USER_ID || process.argv[2];
  if (!input) {
    console.error('Usage: npx tsx scripts/expire-codigo-access.ts <email|userId>');
    console.error('   or: EMAIL=moe@districthookah.com npx tsx scripts/expire-codigo-access.ts');
    process.exit(1);
  }

  let userId: string;

  if (UUID_REGEX.test(input)) {
    userId = input;
    console.log(`Expiring CODIGO access for userId: ${userId}`);
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

  try {
    const { expiresAt } = await expireCodigoAccessNow(userId);
    console.log('CODIGO access expired (expiresAt set in the past; status unchanged).');
    console.log(`  userId: ${userId}`);
    console.log(`  expiresAt: ${expiresAt.toISOString()}`);
  } catch (err: unknown) {
    const code = err && typeof err === 'object' && 'code' in err ? (err as { code: string }).code : '';
    if (code === 'P2025') {
      console.error('No codigo_access row for this user. Nothing to expire (grant access first).');
      process.exit(1);
    }
    throw err;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
