# Task Brief: Database Migration Execution - externalRef Column

**What:** Execute Supabase database migration to add `externalRef` column to `Session` table and create index. This unblocks Noor (session_agent) from validating Guest → App sync functionality.

**Why:** The `externalRef` column is required for session management and guest synchronization. Without this migration, Noor cannot complete session lifecycle validation, blocking critical path work.

**Who needs what:**
- **Inputs:** Migration SQL script, Supabase database access, Prisma schema
- **Dependencies:** Supabase database connection, migration files exist
- **Integrations:** Supabase SQL Editor, Prisma ORM, Session model

**How it will be verified:**
- ✅ Migration SQL executes successfully in Supabase SQL Editor
- ✅ `externalRef` column exists in `public."Session"` table
- ✅ Index `idx_session_external_ref` exists on `externalRef` column
- ✅ Prisma client can query `externalRef` column without errors
- ✅ App build server restarts and picks up new column
- ✅ Guest → App sync test passes after migration
- ✅ No data loss or corruption during migration

**When:** P0 - Critical Blocker (Must execute today to unblock Noor)

---

## Signals to Instrument

### Telemetry

**Sentry Events:**
- `migration.execute` - When migration starts (tags: `migrationName`, `table`, `column`, `component: database`)
- `migration.execute_success` - When migration completes successfully (tags: `migrationName`, `duration`, `component: database`)
- `migration.execute_failed` - When migration fails (tags: `migrationName`, `errorType`, `component: database`, `action: execute`)
- `migration.verify_column` - When column verification runs (tags: `table`, `column`, `exists: boolean`, `component: database`)

**Pino Log Keys:**
- `{ component: "database", action: "migration_execute", migrationName, table, column, duration }`
- `{ component: "database", action: "migration_execute_error", migrationName, error, errorType }`
- `{ component: "database", action: "migration_verify_column", table, column, exists }`

**Reflex Scoring:**
- `reflexScoreAudit.recordScore("database", "migration_execute", score, 100, { duration, migrationName }, { table, column })`

### Metrics

- **Migration execution time:** <5s (target: <2s)
- **Migration success rate:** 100% (target: 100%)
- **Column verification latency:** <100ms P95
- **Reflex score:** ≥0.92 for `database.migration_execute`

### Failure Modes

**Primary Failure:**
- **What breaks first:** Migration SQL syntax error or constraint violation
- **Alert fires:** Sentry alert `MIGRATION_EXECUTION_FAILED` + Pino error log with `component: "database"`, `action: "migration_execute_error"`
- **Recovery:**
  1. Review migration SQL for syntax errors
  2. Check for existing column (use `IF NOT EXISTS`)
  3. Verify table permissions
  4. Rollback if needed (migration is additive, safe to retry)
  5. Fix SQL and re-execute

**Secondary Failure:**
- **What breaks first:** Database connection timeout or connection pool exhausted
- **Alert fires:** Sentry alert `DATABASE_CONNECTION_FAILED` + Pino error log
- **Recovery:**
  1. Check Supabase connection status
  2. Verify connection pool settings
  3. Retry migration after connection restored
  4. Check for long-running queries blocking migration

**Tertiary Failure:**
- **What breaks first:** Column exists but index creation fails
- **Alert fires:** Pino warn log with `component: "database"`, `action: "migration_verify_column"`, `warning: "index_creation_failed"`
- **Recovery:**
  1. Verify column exists
  2. Manually create index if needed
  3. Verify index creation doesn't block table operations
  4. Log warning for follow-up

### Evidence Location

- **Sentry dashboard:** Filter by tag `component:database` or search `migration.*`
- **Pino logs:** `grep "component.*database" logs.json | jq '.component == "database"'`
- **Database:** Query `SELECT column_name FROM information_schema.columns WHERE table_name = 'Session' AND column_name = 'externalRef'` to verify column
- **Database:** Query `SELECT indexname FROM pg_indexes WHERE tablename = 'Session' AND indexname = 'idx_session_external_ref'` to verify index
- **Supabase Dashboard:** Check migration history, table schema, index list

---

## Definition of Done (DoD)

### Functionality ✅
- [ ] Migration SQL executes without errors
- [ ] Column exists and is queryable
- [ ] Index exists and is functional
- [ ] Prisma client regenerated and works

### Observability ✅
- [ ] **Telemetry evidence attached:**
  - [ ] Sentry links (or screenshots if no errors yet)
  - [ ] Pino log samples (JSON structure validated)
  - [ ] Migration execution logs
  - [ ] Supabase dashboard screenshots
- [ ] **Failure mode documented:**
  - [x] What breaks first (primary failure point) - SQL syntax/constraint errors
  - [ ] What alert fires (Sentry alert name, Pino log level) - **TODO: Add Sentry instrumentation**
  - [x] Recovery procedure (rollback steps, manual fix) - Documented above
- [ ] **Signals verified:**
  - [ ] All planned telemetry events fire correctly - **TODO: Add Sentry/Pino instrumentation**
  - [ ] Log keys match schema - **TODO: Verify**
  - [ ] Metrics within thresholds - **TODO: Measure**

### Recovery ✅
- [x] Rollback procedure documented (Migration is additive, safe to retry)
- [ ] Rollback tested (or verified safe) - **TODO: Verify migration is idempotent**
- [x] Known risks acknowledged (Connection timeouts, syntax errors)
- [x] Moat value preserved (doesn't degrade trust observability)

---

## Handoff Summary

### What Changed
- Added `externalRef` column to `Session` table (TEXT, nullable)
- Created index `idx_session_external_ref` on `externalRef` column
- Migration file location: `supabase/migrations/` (check for existing migration)

### What to Test
1. **Migration Execution:**
   - Execute migration SQL in Supabase SQL Editor
   - Verify no errors returned
   - Verify migration appears in Supabase migration history

2. **Column Verification:**
   - Query: `SELECT "externalRef" FROM "Session" LIMIT 1;`
   - Verify column exists and is queryable
   - Verify column is nullable (allows NULL values)

3. **Index Verification:**
   - Query: `SELECT indexname FROM pg_indexes WHERE tablename = 'Session' AND indexname = 'idx_session_external_ref';`
   - Verify index exists
   - Test query performance with `externalRef` filter

4. **Prisma Client:**
   - Regenerate Prisma client: `npx prisma generate`
   - Verify no errors during generation
   - Test querying `externalRef` in code

5. **App Server:**
   - Restart app build server
   - Verify server starts without errors
   - Test Guest → App sync functionality

### Known Risks
- Migration may fail if column already exists (mitigated by `IF NOT EXISTS`)
- Connection timeout if database is under heavy load
- Prisma client may need regeneration after migration
- App server restart required to pick up schema changes

### Next Actions
1. **Execute Migration:**
   ```sql
   -- Execute in Supabase SQL Editor:
   ALTER TABLE public."Session" 
   ADD COLUMN IF NOT EXISTS "externalRef" TEXT;
   
   CREATE INDEX IF NOT EXISTS idx_session_external_ref ON public."Session"("externalRef");
   ```

2. **Verify Column:**
   ```sql
   SELECT "externalRef" FROM "Session" LIMIT 1;
   ```

3. **Restart App Build Server:**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

4. **Re-test Guest → App Sync:**
   ```bash
   npx tsx scripts/test-guest-app-sync.ts
   ```

### Evidence: Proof It's Working
- **Sentry Issues:** [To be added after instrumentation]
- **Log Excerpts:** [To be added after Pino logging]
- **Dashboards:** Supabase Dashboard showing migration history and table schema
- **Trace IDs:** [To be added after distributed tracing setup]

### Expected Alerts
- **If it breaks, you'll see:**
  - `MIGRATION_EXECUTION_FAILED`: SQL syntax error or constraint violation → Check migration SQL → Fix syntax → Re-execute
  - `DATABASE_CONNECTION_FAILED`: Connection timeout → Check Supabase status → Retry migration
  - Pino error log with `component: "database"`, `action: "migration_execute_error"`: General error → Check Sentry for full stack trace

---

## Review Gate Status

### Gate 1: Draft Complete ✅
- [x] Migration SQL prepared
- [ ] Migration executed - **TODO: Execute in Supabase**
- [ ] Column verified - **TODO: Verify after execution**
- [ ] No obvious issues

**Gate Keeper:** Developer  
**Status:** [ ] Pending | [ ] Complete

---

### Gate 2: Observable ✅
- [ ] **Telemetry instrumented:**
  - [ ] Sentry events fire (or test error captured) - **TODO: Add Sentry**
  - [ ] Pino logs structured (JSON format, correct keys) - **TODO: Add Pino**
  - [ ] Migration execution logged - **TODO: Add logging**
- [ ] **Failure modes documented:**
  - [x] Primary failure point identified
  - [ ] Alert name defined - **TODO: Configure Sentry alerts**
  - [x] Recovery procedure written
- [ ] **Evidence attached:**
  - [ ] Sentry links/screenshots - **TODO: After instrumentation**
  - [ ] Pino log samples - **TODO: After logging**
  - [ ] Supabase dashboard screenshots - **TODO: After execution**

**Gate Keeper:** Tech Lead / Senior Developer  
**Status:** [ ] Pending | [ ] Complete

---

### Gate 3: Ship ✅
- [ ] **Rollback verified:**
  - [x] Rollback procedure documented (Migration is additive, safe)
  - [ ] Rollback tested (or verified safe) - **TODO: Verify idempotency**
  - [x] Previous version still works
- [ ] **Risks acknowledged:**
  - [x] Known risks documented in handoff
  - [x] Edge cases handled (IF NOT EXISTS)
  - [x] Failure modes have recovery paths
- [ ] **Moat value preserved:**
  - [ ] Doesn't degrade trust observability - **TODO: Add telemetry**
  - [ ] Database integrity maintained - **TODO: Verify**
  - [ ] No performance degradation - **TODO: Test query performance**

**Gate Keeper:** Product Owner / Engineering Manager  
**Status:** [ ] Pending | [ ] Complete | [ ] **APPROVED FOR SHIP**

---

## Implementation Notes

**Migration SQL:**
```sql
-- Add externalRef column to Session table
ALTER TABLE public."Session" 
ADD COLUMN IF NOT EXISTS "externalRef" TEXT;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_session_external_ref ON public."Session"("externalRef");
```

**Verification Queries:**
```sql
-- Verify column exists
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'Session' AND column_name = 'externalRef';

-- Verify index exists
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'Session' AND indexname = 'idx_session_external_ref';

-- Test query
SELECT "externalRef" FROM "Session" LIMIT 1;
```

**Prisma Schema Update:**
- Verify `externalRef` field exists in `Session` model in `prisma/schema.prisma`
- Regenerate Prisma client: `npx prisma generate`

**Next Steps:**
1. Execute migration in Supabase SQL Editor
2. Verify column and index creation
3. Regenerate Prisma client
4. Restart app build server
5. Test Guest → App sync functionality

---

## Related Tasks

- [Agent Coordination Infrastructure](./agent-coordination-infrastructure-task-brief.md) - May need database access
- [Production Environment Verification](./production-environment-verification-task-brief.md) - Database connection verification

---

## References

- Migration location: `supabase/migrations/` (check for existing migration files)
- Documentation: `apps/app/TERMINAL_ANALYSIS.md` (lines 76-83)
- Session model: `prisma/schema.prisma`
- Template: `TASK_BRIEF_TEMPLATE.md`

---

**Created:** 2025-01-27  
**Owner:** database_agent / Development Team  
**Status:** [x] Draft | [ ] In Progress | [ ] Complete
