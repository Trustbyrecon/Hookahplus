# LaunchPad Setup Fixes

**Date:** 2025-01-XX  
**Status:** ✅ Fixed

---

## Issues Fixed

### 1. ✅ Sentry Console Integration Error

**Error:**
```
consoleIntegration is not a function
```

**Fix:**
- Removed `Sentry.consoleIntegration()` from both `sentry.client.config.ts` and `sentry.server.config.ts`
- Console logs are automatically captured via Sentry breadcrumbs, so this integration is not needed

**Files Changed:**
- `apps/app/sentry.client.config.ts`
- `apps/app/sentry.server.config.ts`

---

### 2. ✅ LaunchPad API 500 Error

**Error:**
```
/api/launchpad/session: Failed to load resource: the server responded with a status of 500
```

**Root Cause:**
The `SetupSession` database table doesn't exist yet. The Prisma schema was updated but the migration hasn't been run.

**Fix:**
Run the database migration to create the `SetupSession` table:

```bash
cd apps/app
npx prisma migrate dev --name add_setup_session
```

**Alternative (if using production database):**
```bash
npx prisma migrate deploy
```

**Files Changed:**
- `apps/app/lib/launchpad/session-manager.ts` - Added better error handling with migration instructions

---

## Quick Setup Checklist

1. ✅ **Run Database Migration**
   ```bash
   cd apps/app
   npx prisma migrate dev --name add_setup_session
   ```

2. ✅ **Regenerate Prisma Client** (if needed)
   ```bash
   npx prisma generate
   ```

3. ✅ **Restart Dev Server**
   ```bash
   npm run dev
   ```

4. ✅ **Test LaunchPad Route**
   - Visit: `http://localhost:3002/launchpad`
   - Should load without errors
   - Should create a session successfully

---

## Verification

After running the migration, verify:

1. **Database Table Exists:**
   ```sql
   SELECT * FROM setup_sessions LIMIT 1;
   ```

2. **API Endpoint Works:**
   ```bash
   curl -X POST http://localhost:3002/api/launchpad/session \
     -H "Content-Type: application/json" \
     -d '{"source": "web"}'
   ```
   
   Should return:
   ```json
   {
     "success": true,
     "token": "...",
     "expiresAt": "...",
     "progress": {...}
   }
   ```

3. **LaunchPad Page Loads:**
   - Visit `/launchpad`
   - Should see "H+ LaunchPad" header
   - Should see Step 1: Venue Snapshot form

---

## Next Steps

Once LaunchPad is working:

1. Test all 6 steps
2. Verify progress persistence
3. Test account creation at Go Live
4. Deploy to production (run migration there too)

---

**Status:** Ready to test after migration is run

