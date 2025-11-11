# 🔧 Production Lead Creation Fix

## Issue
Lead creation works locally but fails in production on Vercel with "Failed to create lead" error.

## Root Causes

### 1. **Database Connection**
- Production may have different database connection settings
- Connection pooler endpoint might be different
- Environment variables may not be set correctly

### 2. **Error Handling**
- Previous error handling was swallowing specific error messages
- No detailed logging for production debugging

### 3. **Table/Column Issues**
- `reflex_events` table might not exist in production database
- Column names might not match Prisma schema

## Fixes Applied

### 1. Enhanced Error Handling
Added comprehensive error handling in `apps/app/app/api/admin/operator-onboarding/route.ts`:

```typescript
try {
  const newEvent = await prisma.reflexEvent.create({...});
  // Success handling
} catch (createError) {
  // Specific error messages for:
  - Database table not found
  - Duplicate entries
  - Foreign key constraints
  - Connection failures
  - Timeouts
}
```

### 2. Better Error Messages
- Provides specific error messages based on error type
- Includes hints for troubleshooting
- Logs detailed error information for debugging

### 3. Response Improvements
- Returns created lead data on success
- Includes error details and hints on failure
- Better logging for production debugging

## Verification Steps

### 1. Check Environment Variables
Ensure these are set in Vercel:
- `DATABASE_URL` - PostgreSQL connection string
- `SUPABASE_URL` - Supabase project URL (if using)

### 2. Verify Database Schema
Run this in Supabase SQL Editor:
```sql
-- Check if reflex_events table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'reflex_events'
);

-- Check table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'reflex_events';
```

### 3. Test Lead Creation
1. Navigate to `/admin/operator-onboarding` in production
2. Click "+ Add Lead"
3. Fill in required fields (businessName, email)
4. Submit
5. Check browser console and network tab for error details

### 4. Check Vercel Logs
```bash
# View function logs
vercel logs --follow

# Or check in Vercel dashboard:
# Project → Deployments → [Latest] → Functions → /api/admin/operator-onboarding
```

## Common Production Issues

### Issue 1: Database Table Missing
**Error**: "Database table not found"
**Solution**: Run database migrations in Supabase

### Issue 2: Connection Timeout
**Error**: "Database connection failed"
**Solution**: 
- Check `DATABASE_URL` is correct
- Verify connection pooler endpoint
- Check Supabase project status

### Issue 3: Column Mismatch
**Error**: "Column does not exist"
**Solution**: 
- Regenerate Prisma client: `npx prisma generate`
- Run migrations: `npx prisma migrate deploy`

### Issue 4: Environment Variables
**Error**: "DATABASE_URL not set"
**Solution**: 
- Add `DATABASE_URL` to Vercel environment variables
- Redeploy after adding variables

## Debugging Production Issues

### 1. Enable Detailed Logging
The API now logs:
- Lead creation attempts
- Error details with stack traces (in development)
- Database connection status
- Payload data (sanitized)

### 2. Check Vercel Function Logs
```bash
# Real-time logs
vercel logs --follow app

# Filter for operator onboarding
vercel logs --follow app | grep "Operator Onboarding"
```

### 3. Test Database Connection
Create a test endpoint to verify database connectivity:
```typescript
// apps/app/app/api/test-db/route.ts
export async function GET() {
  try {
    await prisma.$connect();
    const count = await prisma.reflexEvent.count();
    return NextResponse.json({ 
      connected: true, 
      tableExists: true,
      recordCount: count 
    });
  } catch (error) {
    return NextResponse.json({ 
      connected: false, 
      error: error instanceof Error ? error.message : 'Unknown' 
    }, { status: 500 });
  }
}
```

## Next Steps

1. ✅ Enhanced error handling added
2. ⏳ Verify `DATABASE_URL` is set in Vercel
3. ⏳ Test lead creation in production
4. ⏳ Check Vercel logs for specific errors
5. ⏳ Run database migrations if needed

## Expected Behavior

### Success Response
```json
{
  "success": true,
  "leadId": "clx...",
  "message": "Lead created successfully",
  "lead": {
    "id": "clx...",
    "businessName": "Test Business",
    "email": "test@example.com",
    "stage": "new-leads",
    "source": "manual"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Database connection failed",
  "details": "Unable to connect to database...",
  "hint": "Check database connection and ensure reflex_events table exists"
}
```

