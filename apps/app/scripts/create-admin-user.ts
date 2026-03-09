#!/usr/bin/env tsx
/**
 * Create or update an admin user for /admin and /admin/codigo-kpis access.
 *
 * Usage:
 *   ADMIN_EMAIL="user@example.com" ADMIN_PASSWORD="secure-password" npx tsx scripts/create-admin-user.ts
 *
 * Run from apps/app directory. Requires:
 *   - NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
 *   - DATABASE_URL (Prisma)
 */

import { createClient } from '@supabase/supabase-js';
import { prisma } from '../lib/db';

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? '').trim();
const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD ?? '').trim();

async function main() {
  if (!ADMIN_EMAIL) {
    console.error('Missing ADMIN_EMAIL. Set it via: ADMIN_EMAIL="user@example.com" ADMIN_PASSWORD="..." npx tsx scripts/create-admin-user.ts');
    process.exit(1);
  }
  if (!ADMIN_PASSWORD) {
    console.error('Missing ADMIN_PASSWORD. Set it via: ADMIN_EMAIL="..." ADMIN_PASSWORD="secure-password" npx tsx scripts/create-admin-user.ts');
    process.exit(1);
  }

  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim();
  if (!supabaseUrl || !serviceKey) {
    console.error('Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let userId: string;

  // Try createUser first; if user exists, find and update password
  const { data: createData, error: createError } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
  });

  if (createData?.user?.id) {
    userId = createData.user.id;
    console.log('Created new Supabase Auth user:', ADMIN_EMAIL);
  } else if (createError?.message?.toLowerCase().includes('already') || createError?.message?.toLowerCase().includes('registered')) {
    // User exists - find by email and update password
    const { data: listData, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    if (listError) {
      console.error('Failed to list users:', listError.message);
      process.exit(1);
    }
    const user = listData?.users?.find((u) => u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase());
    if (!user?.id) {
      console.error('User exists but could not be found. Try creating manually in Supabase Dashboard.');
      process.exit(1);
    }
    userId = user.id;
    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, { password: ADMIN_PASSWORD });
    if (updateError) {
      console.error('Failed to update password:', updateError.message);
      process.exit(1);
    }
    console.log('Updated password for existing user:', ADMIN_EMAIL);
  } else {
    console.error('Failed to create/update user:', createError?.message ?? 'Unknown error');
    process.exit(1);
  }

  // Get or create default admin tenant
  let tenant = await prisma.tenant.findFirst({ orderBy: { createdAt: 'asc' } });
  if (!tenant) {
    tenant = await prisma.tenant.create({ data: { name: 'Admin Tenant' } });
    console.log('Created tenant:', tenant.name, tenant.id);
  }

  // Create or update membership with admin role
  await prisma.membership.upsert({
    where: { userId_tenantId: { userId, tenantId: tenant.id } },
    update: { role: 'admin' },
    create: { userId, tenantId: tenant.id, role: 'admin' },
  });
  console.log('Membership created/updated: role=admin for tenant', tenant.name);

  console.log('\nDone. You can now sign in at /admin/login with:');
  console.log('  Email:', ADMIN_EMAIL);
  console.log('  Password: (the one you set via ADMIN_PASSWORD)');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
