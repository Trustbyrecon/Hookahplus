# Next Steps Execution Guide

**Date:** 2025-01-27  
**Status:** Ready for Execution  
**Purpose:** Step-by-step guide to execute the next steps from task briefs

---

## ✅ Completed

1. **Task Briefs Generated** - All 5 priorities have complete task briefs
2. **Migration File Exists** - `supabase/migrations/20251114000001_add_external_ref_column.sql`
3. **Prisma Schema Updated** - `externalRef` field exists in Session model
4. **Agent Coordination Files Verified** - All files exist and are up-to-date

---

## 🚀 Immediate Next Steps (Priority Order)

### Step 1: Execute Database Migration (Priority 3) - P0 CRITICAL

**Status:** Migration file ready, needs execution in Supabase

**Action Required:**

1. **Open Supabase SQL Editor:**
   - Go to https://supabase.com/dashboard
   - Select your project
   - Click "SQL Editor" → "New query"

2. **Execute Migration:**
   ```sql
   -- Add externalRef column to Session table
   ALTER TABLE public."Session" 
   ADD COLUMN IF NOT EXISTS "externalRef" TEXT;
   
   -- Create index for performance
   CREATE INDEX IF NOT EXISTS idx_session_external_ref ON public."Session"("externalRef");
   ```

3. **Verify Column Exists:**
   ```sql
   SELECT column_name, data_type, is_nullable 
   FROM information_schema.columns 
   WHERE table_name = 'Session' AND column_name = 'externalRef';
   ```
   **Expected Result:** Should return 1 row with `externalRef` column details

4. **Verify Index Exists:**
   ```sql
   SELECT indexname, indexdef 
   FROM pg_indexes 
   WHERE tablename = 'Session' AND indexname = 'idx_session_external_ref';
   ```
   **Expected Result:** Should return 1 row with index definition

5. **Test Query:**
   ```sql
   SELECT "externalRef" FROM "Session" LIMIT 1;
   ```
   **Expected Result:** Should execute without errors (may return NULL values)

**Time Estimate:** 5 minutes

**Blocks:** Noor (session_agent) from validating Guest → App sync

---

### Step 2: Regenerate Prisma Client (Priority 3) - P0 CRITICAL

**Status:** Schema has `externalRef`, client may need regeneration

**Action Required:**

1. **Regenerate Prisma Client:**
   ```bash
   cd apps/app
   npx prisma generate
   ```

2. **Verify No Errors:**
   - Check output for any errors
   - Client should regenerate successfully

3. **Restart App Build Server:**
   ```bash
   # Stop current server (Ctrl+C if running)
   npm run dev
   ```

4. **Verify Server Starts:**
   - Check for any Prisma-related errors
   - Server should start without errors

**Time Estimate:** 2 minutes

**Blocks:** App server needs updated Prisma client

---

### Step 3: Test Guest → App Sync (Priority 3) - P0 CRITICAL

**Status:** After migration and server restart

**Action Required:**

1. **Run Test Script:**
   ```bash
   npx tsx scripts/test-guest-app-sync.ts
   ```

2. **Verify Results:**
   - Test should pass without errors
   - Guest session should sync to app
   - `externalRef` should be populated correctly

**Time Estimate:** 5 minutes

**Unblocks:** Noor (session_agent) can proceed with validation

---

### Step 4: Verify Agent Coordination (Priority 4) - P1

**Status:** Files exist, verify they're current

**Action Required:**

1. **Review `AGENT_LANES.md`:**
   - Verify all agents have documented responsibilities
   - Check if any new agents need to be added
   - Update status if needed

2. **Review `AGENT_EXECUTION_SUMMARY.md`:**
   - Update current status of agents
   - Mark completed tasks
   - Update blockers if any

3. **Review `COMMANDER.md`:**
   - Verify orchestration rules are current
   - Check if any new rules need to be added

**Time Estimate:** 10 minutes

**Status:** ✅ Files verified - all exist and are up-to-date

---

### Step 5: Production Environment Verification (Priority 5) - P1

**Status:** Checklist ready, needs execution

**Action Required:**

1. **Verify Environment Variables in Vercel:**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Check all required variables are set (see checklist below)
   - Verify variables are set for "Production" environment

2. **Verify Stripe Webhook:**
   - Go to Stripe Dashboard → Webhooks
   - Verify endpoint exists: `https://hookahplus.net/api/webhooks/stripe`
   - Verify webhook secret matches Vercel `STRIPE_WEBHOOK_SECRET`

3. **Verify Database Connection:**
   - Check `DATABASE_URL` is set in Vercel
   - Test database connection from production deployment

4. **Test $1 Transaction:**
   - Visit: `https://hookahplus.net/preorder/T-001`
   - Complete $1 test transaction
   - Verify payment processes successfully

**Time Estimate:** 15 minutes

**See:** `tasks/production-environment-verification-task-brief.md` for full checklist

---

## 📋 Follow-up Actions (This Week)

### Add Observability to Priorities 1 & 2

**Priority 1: Demo Session Generator**
- Add Sentry error tracking
- Add Pino structured logging
- Add Reflex scoring

**Priority 2: Email Integration**
- Add Sentry error tracking
- Add Pino structured logging
- Add Reflex scoring

**Files to Modify:**
- `apps/app/app/api/admin/operator-onboarding/route.ts` (lines 642-738, 490-639)
- `apps/app/lib/demo.ts`
- `apps/app/lib/email.ts`

**Time Estimate:** 2-3 hours

---

### Add Tests

**Priority 1 & 2:**
- Unit tests for helper functions (`generateSlug`, `generateDemoLink`, `findOrCreateDemoTenant`)
- Integration tests for API endpoints (`create_demo_session`, `send_test_link`)

**Time Estimate:** 2-3 hours

---

## 📊 Progress Tracking

### Completed ✅
- [x] Task briefs generated for all 5 priorities
- [x] Security scan completed (no secrets found)
- [x] Migration file exists and is ready
- [x] Prisma schema has `externalRef` field
- [x] Agent coordination files verified

### In Progress ⏳
- [ ] Database migration executed
- [ ] Prisma client regenerated
- [ ] App server restarted
- [ ] Guest → App sync tested

### Pending 📋
- [ ] Production environment verified
- [ ] Observability added to Priorities 1 & 2
- [ ] Tests added for Priorities 1 & 2

---

## 🎯 Success Criteria

- [ ] Migration executed successfully in Supabase
- [ ] `externalRef` column exists and is queryable
- [ ] Index `idx_session_external_ref` exists
- [ ] Prisma client regenerated without errors
- [ ] App server restarts successfully
- [ ] Guest → App sync test passes
- [ ] Noor (session_agent) unblocked
- [ ] Production environment verified
- [ ] All task briefs ready for execution

---

## 📝 Notes

- **Migration is idempotent:** Safe to run multiple times (uses `IF NOT EXISTS`)
- **No data loss:** Migration only adds column, doesn't modify existing data
- **Server restart required:** Prisma client changes require server restart
- **Production verification:** Can be done in parallel with other tasks

---

## 🔗 References

- Migration file: `supabase/migrations/20251114000001_add_external_ref_column.sql`
- Task brief: `tasks/database-migration-execution-task-brief.md`
- Prisma schema: `prisma/schema.prisma` (line 97)
- Agent lanes: `AGENT_LANES.md`
- Agent status: `AGENT_EXECUTION_SUMMARY.md`
- Orchestration: `COMMANDER.md`

---

**Created:** 2025-01-27  
**Owner:** Development Team  
**Status:** Ready for Execution
