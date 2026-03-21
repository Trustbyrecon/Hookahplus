#!/usr/bin/env tsx
/**
 * Revoke all access to Hookah+ (app.hookahplus.net) for a Supabase Auth user.
 *
 * Default — **ban** (recommended): user cannot sign in; reversible in Supabase Dashboard
 * or by unbanning. Memberships / CODIGO rows are left intact for audit & easy restore.
 *
 * `--delete` — **permanent**: removes the Auth user and (with confirmation) deletes
 * `memberships` + `codigo_access` rows for that user id in Hookah+ DB.
 *
 * Usage:
 *   npx tsx scripts/revoke-hookahplus-access.ts moe@districthookah.com
 *   EMAIL=moe@districthookah.com npx tsx scripts/revoke-hookahplus-access.ts
 *   npx tsx scripts/revoke-hookahplus-access.ts --delete moe@districthookah.com
 *
 * Delete requires: CONFIRM_DELETE=yes
 *
 * Run from apps/app. Needs NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
 * `--delete` also needs DATABASE_URL for Prisma cleanup.
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { adminClient } from '../lib/supabase';
import { prisma } from '../lib/db';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** ~100 years — effectively permanent ban (Supabase uses duration string, not years unit). */
const BAN_DURATION_PERMANENT = '876000h';

function parseArgs(argv: string[]) {
  const del = argv.includes('--delete');
  const rest = argv.filter((a) => a !== '--delete');
  const input = process.env.EMAIL || process.env.USER_ID || rest.find((a) => !a.startsWith('-'));
  return { del, input };
}

async function main() {
  const { del, input } = parseArgs(process.argv.slice(2));

  if (!input) {
    console.error('Usage: npx tsx scripts/revoke-hookahplus-access.ts <email|userId>');
    console.error('       npx tsx scripts/revoke-hookahplus-access.ts --delete <email|userId>');
    console.error('');
    console.error('  (default)  Ban user — cannot log in; reversible.');
    console.error('  --delete   Remove Auth user + DB memberships & codigo_access (requires CONFIRM_DELETE=yes)');
    process.exit(1);
  }

  let userId: string;
  let emailLabel = input;

  if (UUID_REGEX.test(input)) {
    userId = input;
    console.log(`Target userId: ${userId}`);
  } else {
    const email = input;
    emailLabel = email;
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

  const supabase = adminClient();

  if (del) {
    if (process.env.CONFIRM_DELETE !== 'yes') {
      console.error('Refusing --delete without CONFIRM_DELETE=yes (irreversible Auth deletion + DB cleanup).');
      process.exit(1);
    }

    const { error: delErr } = await supabase.auth.admin.deleteUser(userId);
    if (delErr) {
      console.error('deleteUser failed:', delErr.message);
      process.exit(1);
    }
    console.log('Supabase Auth user deleted.');

    const mem = await prisma.membership.deleteMany({ where: { userId } });
    const codigo = await prisma.codigoAccess.deleteMany({ where: { userId } });
    console.log(`DB cleanup: removed ${mem.count} membership(s), ${codigo.count} codigo_access row(s).`);
    console.log(`Done. ${emailLabel} can no longer sign in; Auth identity is removed.`);
    return;
  }

  // Ban: blocks token refresh & new sign-ins (GoTrue checks ban_until).
  const { error: banErr } = await supabase.auth.admin.updateUserById(userId, {
    ban_duration: BAN_DURATION_PERMANENT,
  } as { ban_duration: string });

  if (banErr) {
    console.error('Ban failed:', banErr.message);
    console.error('If your project Auth version has no ban_duration, use --delete with CONFIRM_DELETE=yes or ban manually in Supabase Dashboard → Users.');
    process.exit(1);
  }

  console.log(`Done. User banned (${BAN_DURATION_PERMANENT}). They cannot access Hookah+ until unbanned in Supabase.`);
  console.log(`  userId: ${userId}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
