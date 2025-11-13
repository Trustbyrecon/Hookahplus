# Enum Serialization Fix for Production

**Agent:** Noor (session_agent)  
**Date:** 2025-01-14  
**Status:** 🔧 **Investigating**

---

## Current Error

```
Invalid `prisma.session.create()` invocation:
Error occurred during query execution:
ConnectorError(ConnectorError { user_facing_error: None, kind: QueryError(Error { kind: ToSql(8), cause: Some(Error("expected value", line: 1, column: 1)) }), transient: false })
```

**Root Cause:** Prisma is having trouble serializing enum values to PostgreSQL in production.

---

## Possible Causes

1. **Enum types not created in production database**
   - The migration `20251114000002_create_session_enums.sql` may not have been run in production

2. **Enum value mismatch**
   - Prisma enum values don't match PostgreSQL enum values

3. **Prisma client not regenerated after enum migration**
   - Production build may be using old Prisma client

---

## Solution Options

### Option 1: Verify Enum Types Exist in Production Database

Run this query in Supabase SQL Editor:

```sql
SELECT 
  t.typname as enum_name,
  e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname IN ('SessionSource', 'SessionState')
ORDER BY t.typname, e.enumsortorder;
```

**Expected Output:**
```
SessionSource: QR, RESERVE, WALK_IN, LEGACY_POS
SessionState: PENDING, ACTIVE, PAUSED, CLOSED, CANCELED
```

### Option 2: Run Enum Migration in Production

If enum types don't exist, run this in Supabase SQL Editor:

```sql
-- Create SessionSource enum
DO $$ BEGIN
    CREATE TYPE "SessionSource" AS ENUM ('QR', 'RESERVE', 'WALK_IN', 'LEGACY_POS');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create SessionState enum
DO $$ BEGIN
    CREATE TYPE "SessionState" AS ENUM ('PENDING', 'ACTIVE', 'PAUSED', 'CLOSED', 'CANCELED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
```

### Option 3: Use String Literals (Temporary Workaround)

If enum types exist but Prisma still has issues, we can use string literals:

```typescript
source: sourceEnum === SessionSource.QR ? 'QR' : 
        sourceEnum === SessionSource.RESERVE ? 'RESERVE' :
        sourceEnum === SessionSource.WALK_IN ? 'WALK_IN' : 'LEGACY_POS',
state: 'PENDING' as any,
```

---

## Verification Steps

1. **Check Supabase Dashboard:**
   - Go to SQL Editor
   - Run the enum query above
   - Verify enum types exist

2. **Check Vercel Build:**
   - Verify `npx prisma generate` ran during build
   - Check build logs for Prisma generation

3. **Test After Fix:**
   - Create session from guest build
   - Should see success instead of enum error

---

## Next Steps

1. Verify enum types exist in production database
2. If missing, run enum migration
3. If still failing, use string literal workaround
4. Test guest → app sync

---

**Status:** ⏳ **Waiting for enum verification in production database**

