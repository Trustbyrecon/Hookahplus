# Fixes Applied - Operator Onboarding & Lead Management

## Issues Fixed

### 1. ✅ Webhook API Key Added to Site API Calls
**Problem:** Site build (`hookahplus.net`) was calling the app API (`app.hookahplus.net`) but requests were being rejected in production due to missing authentication.

**Solution:** Updated `apps/site/app/api/demo-requests/route.ts` to include the `x-webhook-api-key` header when calling the operator onboarding API. This allows the site to create leads without requiring admin authentication.

**Files Changed:**
- `apps/site/app/api/demo-requests/route.ts` - Added webhook API key header to both `onboarding_submission` and `request_demo` actions

**Required Environment Variables:**
- `WEBHOOK_API_KEY` must be set in **both**:
  - Site build environment (for making authenticated API calls)
  - App build environment (for validating the webhook key)

### 2. ⚠️ Database Migration Issue - ReflexEvent Table Missing
**Problem:** The `ReflexEvent` table doesn't exist in your database, causing the error: "ReflexEvent table not found"

**Root Cause:** Database migrations haven't been run, or the database connection is failing.

**Error Seen:**
```
Error: P1001: Can't reach database server at `db.hsypmyqtlxjwpnkkacmo.supabase.co:5432`
```

**Solutions:**

#### Option A: Database Connection Issue (Supabase)
If using Supabase:
1. **Check if database is paused** (Supabase free tier pauses after inactivity)
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project
   - If paused, click "Resume" or "Unpause"

2. **Verify DATABASE_URL** in `apps/app/.env.local`:
   ```bash
   DATABASE_URL=postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
   ```
   - Make sure password is correct
   - Make sure you're using the correct connection string (not pooler URL for migrations)

3. **Run migrations once database is accessible:**
   ```bash
   cd apps/app
   npx prisma migrate deploy
   ```

#### Option B: Use Direct Connection String for Migrations
If using Supabase connection pooling, use the direct connection string for migrations:
```bash
# In apps/app/.env.local, temporarily use direct connection:
DIRECT_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
```

Then run:
```bash
cd apps/app
npx prisma migrate deploy
```

#### Option C: Generate Prisma Client (if migrations already exist)
If migrations are already applied but Prisma client is out of date:
```bash
# Stop your dev server first (Ctrl+C)
cd apps/app
npx prisma generate
# Then restart dev server
```

### 3. 🔧 CORS Fix for Lead Magnet Downloads
**Already Fixed:** CORS headers were added to `/api/lead-magnets/download` endpoint in previous session.

## Next Steps

### Immediate Actions Required:

1. **Set Environment Variables in Production:**
   - **Site Build (Vercel/Netlify):**
     - `NEXT_PUBLIC_APP_URL` = `https://app.hookahplus.net` (or your app URL)
     - `WEBHOOK_API_KEY` = (same value as app build)
   
   - **App Build (Vercel):**
     - `WEBHOOK_API_KEY` = (generate secure random string, min 32 chars)
     - `DATABASE_URL` = (your production database connection string)
     - `NEXT_PUBLIC_APP_URL` = `https://app.hookahplus.net`

2. **Run Database Migrations:**
   - Fix database connection (see Option A/B above)
   - Run `npx prisma migrate deploy` in `apps/app` directory
   - Verify `reflex_events` table exists

3. **Test Lead Creation:**
   - Submit test form on `hookahplus.net/onboarding`
   - Check `/admin/operator-onboarding` in app build
   - Verify lead appears in the list

### Long-term Recommendations:

#### CRM Migration Consideration
You mentioned leads aren't staying and you need consistency. Here are options:

**Option 1: Fix Current System (Recommended First)**
- The current system stores leads in `ReflexEvent` table
- Leads should persist if database is properly configured
- Add monitoring/alerting for failed lead creation
- Add retry logic for failed API calls

**Option 2: Integrate External CRM**
If you need more reliability:
- **HubSpot** - Free tier, good for B2B, easy integration
- **Pipedrive** - Sales-focused, good pipeline management
- **Airtable** - Flexible, can act as lightweight CRM

**Option 3: Hybrid Approach**
- Keep current system for immediate needs
- Add webhook to sync to external CRM as backup
- Gradually migrate to external CRM if needed

## Verification Checklist

- [ ] Database connection working (`npx prisma db pull` succeeds)
- [ ] Migrations applied (`reflex_events` table exists)
- [ ] `WEBHOOK_API_KEY` set in both site and app builds
- [ ] `NEXT_PUBLIC_APP_URL` set correctly in site build
- [ ] Test form submission creates lead
- [ ] Lead appears in `/admin/operator-onboarding`
- [ ] Test link email sends successfully
- [ ] Lead data persists after page refresh

## Troubleshooting

### Leads Not Appearing
1. Check browser console for API errors
2. Check app build logs for authentication errors
3. Verify `WEBHOOK_API_KEY` matches in both environments
4. Check database for `ReflexEvent` records:
   ```sql
   SELECT * FROM reflex_events WHERE type LIKE '%onboarding%' ORDER BY created_at DESC LIMIT 10;
   ```

### Database Connection Errors
1. Verify Supabase project is active (not paused)
2. Check connection string format
3. Test connection: `npx prisma db pull`
4. Use direct connection string (not pooler) for migrations

### Email Not Sending
1. Check Resend API key is set
2. Verify email service is configured
3. Check app build logs for email errors

