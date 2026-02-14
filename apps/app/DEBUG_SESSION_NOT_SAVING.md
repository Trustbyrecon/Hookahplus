# Debug: Session Not Saving to Database

## Issue
- Dashboard shows "1 Active Sessions" in metrics
- Prisma Studio (localhost:5555) shows `Session: 0`
- Session list shows "No Active Sessions"
- **Conclusion**: Session creation API is being called, but data is not persisting to database

## Root Cause Analysis

### Possible Issues:

1. **Database Connection Issue**
   - Prisma client connects successfully (`$connect()` works)
   - But `prisma.session.create()` might be failing silently
   - Check server terminal logs for errors

2. **Transaction Rollback**
   - Session creation might be in a transaction that's rolling back
   - Check if there are any transaction wrappers

3. **Schema Mismatch**
   - `trustSignature` is required in schema but might be null/undefined
   - Check if `seal()` function is working correctly

4. **RLS (Row Level Security) Blocking Writes**
   - Supabase RLS policies might be blocking INSERT operations
   - Check RLS policies on `Session` table

5. **Demo Data Confusion**
   - Metrics might be showing demo data (1 session)
   - But actual database has 0 sessions
   - Check if `NEXT_PUBLIC_USE_DEMO_MODE` is enabled

## Debugging Steps

### Step 1: Check Server Logs
Look in the terminal where `npm run dev` is running for:
- `[Sessions API] POST request received`
- `[Sessions API] Database connection successful`
- `[Sessions API] Creating session with data:`
- `[Sessions API] Session created successfully:`
- OR any error messages

### Step 2: Check Database Connection
```bash
cd apps/app
npx prisma studio
```
- Open http://localhost:5555
- Check if Session table exists
- Check if there are any sessions

### Step 3: Test Direct Database Write
```bash
cd apps/app
npx prisma db execute --stdin
```
Then run:
```sql
INSERT INTO "Session" (
  "id", "trustSignature", "tableId", "source", "priceCents", "state", "createdAt", "updatedAt"
) VALUES (
  'test-123', 'test-signature', 'T-TEST', 'WALK_IN', 3000, 'NEW', NOW(), NOW()
);
```

### Step 4: Check RLS Policies
In Supabase Dashboard:
1. Go to Authentication → Policies
2. Check `Session` table policies
3. Ensure INSERT is allowed for service_role or authenticated users

### Step 5: Verify trustSignature Generation
The `seal()` function should generate a valid hash. Check if it's working:
```javascript
const seal = (o: unknown) =>
  crypto.createHash("sha256").update(JSON.stringify(o)).digest("hex");
```

## Quick Fix: Check Server Terminal

The most important step is to check the server terminal logs when you create a session. Look for:
- Success: `[Sessions API] Session created successfully: [session-id]`
- Error: Any error messages after "Creating session with data"

## Expected Behavior

When session creation succeeds:
1. Server logs: `[Sessions API] Session created successfully: [id]`
2. Prisma Studio: Should show 1 session
3. Dashboard: Should refresh and show the session

If any of these don't happen, there's a problem with that step.

