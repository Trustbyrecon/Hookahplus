# 🎯 CRITICAL FIX PLAN - Root App API Issues

## 📊 **CURRENT STATUS**

### ✅ **What's Working (64% Success Rate)**
- Root App accessible on port 3000
- Health endpoint functional
- Fire Session API functional
- Session Commands API functional
- Customer Journey API functional
- Orders API functional
- All Dashboard Pages accessible
- Prisma Client works in isolation
- Database created and accessible

### ❌ **Critical Issues (36% Failure Rate)**
1. **Sessions API** - 500 Internal Server Error
2. **Test Prisma API** - 500 Internal Server Error  
3. **Events API** - 405 Method Not Allowed
4. **Badges API** - 400 Bad Request
5. **Reflex Scan API** - 405 Method Not Allowed
6. **Webhooks Stripe API** - 405 Method Not Allowed

## 🔍 **ROOT CAUSE ANALYSIS**

### Issue #1: Prisma Database Connection
**Problem**: Sessions API returning 500 errors despite:
- ✅ Database file created at `C:\Users\Dwayne Clark\Projects\Hookahplus\dev.db`
- ✅ Prisma Client works when tested directly via Node
- ✅ `.env` file contains: `DATABASE_URL="file:C:\Users\Dwayne Clark\Projects\Hookahplus\dev.db"`
- ✅ `.env.development.local` file created with same variable
- ✅ Hardcoded fallback added to `lib/prisma.ts`

**Likely Cause**: 
- Next.js hot module reloading not picking up environment changes
- Prisma Client generation issue during server runtime
- Path resolution issue in compiled Next.js code

### Issue #2: Method Not Allowed Errors
**Problem**: Several APIs returning 405
- Events API
- Reflex Scan API  
- Webhooks Stripe API

**Likely Cause**: These APIs may not have GET handlers implemented, only POST/other methods

## 🔧 **IMMEDIATE ACTION PLAN**

### Step 1: Complete Server Restart (REQUIRED)
```powershell
# Stop ALL Node processes
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force

# Clear Next.js cache
Remove-Item -Recurse -Force .next

# Regenerate Prisma Client
$env:DATABASE_URL="file:C:\Users\Dwayne Clark\Projects\Hookahplus\dev.db"
npx prisma generate

# Start fresh
npm run dev
```

### Step 2: Test Sessions API
```powershell
# Test GET
Invoke-RestMethod -Uri "http://localhost:3000/api/sessions" -Method GET

# Test POST with correct format
$body = @{
    loungeId = "lounge-001"
    source = "WALK_IN"
    externalRef = "test-ref-001"
    customerPhone = "+1234567890"
    flavorMix = "Mint"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/sessions" -Method POST -ContentType "application/json" -Body $body
```

### Step 3: Fix Method Not Allowed Errors
Review each API file and ensure appropriate HTTP methods are implemented:
- `app/api/events/route.ts` - Add GET handler if needed
- `app/api/reflex/scan/route.ts` - Add GET handler if needed
- `app/api/webhooks/stripe/route.ts` - This should only accept POST (405 is correct for GET)

### Step 4: Run Comprehensive Validation
```powershell
node scripts/test-root-app-validation.js
```

## 📝 **ENVIRONMENT FILES STATUS**

### Created/Updated:
1. ✅ `.env` - Contains DATABASE_URL
2. ✅ `.env.local` - Contains DATABASE_URL and other variables
3. ✅ `.env.development.local` - Contains DATABASE_URL (Next.js priority)
4. ✅ `lib/prisma.ts` - Hardcoded fallback added

### Database:
- ✅ Location: `C:\Users\Dwayne Clark\Projects\Hookahplus\dev.db`
- ✅ Schema: Synced via `npx prisma db push`
- ✅ Prisma Client: Generated successfully

## 🎯 **EXPECTED OUTCOME**

After Step 1 (complete restart), the Sessions API should work because:
1. Fresh Next.js build will pick up environment variables
2. Prisma Client will be freshly generated
3. No stale cache interfering with imports
4. Hardcoded fallback in lib/prisma.ts ensures DATABASE_URL is set

## 🚨 **IF STILL FAILING**

Alternative approach:
1. Use in-memory sessions (like apps/app/api/sessions/route.ts)
2. Deploy to Vercel with proper environment variables
3. Check Vercel deployment logs for actual errors
4. Consider using PostgreSQL instead of SQLite for production

## 📊 **VALIDATION CHECKLIST**

- [ ] Stop all Node processes
- [ ] Clear .next cache
- [ ] Regenerate Prisma Client
- [ ] Start dev server
- [ ] Test /api/health (should return 200)
- [ ] Test /api/sessions GET (should return 200 with empty array)
- [ ] Test /api/sessions POST (should return 201 with created session)
- [ ] Test /api/test-prisma (should return 200 with success message)
- [ ] Run full validation script
- [ ] Document results

## 🎯 **NEXT STEPS AFTER FIX**

1. ✅ Complete Sessions API validation
2. Fix 405 errors (or confirm they're correct)
3. Set up individual apps (guest, site)
4. Run cross-app validation
5. Validate Enhanced State Machine business logic
6. Deploy to Vercel for production testing

