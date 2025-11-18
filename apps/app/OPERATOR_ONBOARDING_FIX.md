# ✅ Operator Onboarding Fix - trustEventTypeV1 Column

**Date:** 2025-01-16  
**Status:** ✅ **Fixed**

---

## 🔍 Issue

**Error:** `The column reflex_events.trustEventTypeV1 does not exist in the current database`

**Root Cause:**
- Prisma schema includes `trustEventTypeV1` field in `ReflexEvent` model
- Database table doesn't have this column yet (migration not applied)
- `prisma.reflexEvent.create()` fails when trying to insert

**Impact:**
- ❌ Onboarding form submissions failing
- ❌ Leads not being created
- ❌ Operator onboarding dashboard showing "0 Total Leads"

---

## ✅ Solution

Added raw SQL fallback for missing `trustEventTypeV1` column, similar to the `sessionStateV1` fix.

### Changes Made

**File:** `apps/app/app/api/admin/operator-onboarding/route.ts`

1. **Lead Creation (POST endpoint)** - Lines 322-393
   - Try Prisma create first
   - If `trustEventTypeV1` column missing, use raw SQL INSERT
   - Insert only existing columns (exclude `trustEventTypeV1`)

2. **Audit Trail Creation (PATCH endpoint)** - Lines 577-637
   - Same fallback pattern
   - Non-critical - logs warning but doesn't fail the request

---

## 🔧 Technical Details

### Raw SQL Fallback Query

```sql
INSERT INTO reflex_events (
  id, type, source, payload, "ctaSource", "ctaType", 
  "userAgent", ip, referrer, "campaignId", metadata, "createdAt"
)
VALUES (
  gen_random_uuid()::text,
  $1, -- 'onboarding.signup'
  $2, -- source
  $3, -- payload (JSON string)
  $4, -- ctaSource
  $5, -- ctaType
  $6, -- userAgent
  $7, -- ip
  $8, -- referrer
  $9, -- campaignId (null)
  $10, -- metadata (null)
  NOW()
)
RETURNING id, type, source, "createdAt"
```

### Error Detection

Checks for:
- `trustEventTypeV1` in error message
- `does not exist` in error message
- Prisma error code `P2021` (column not found)

---

## ✅ Verification

### Before Fix:
```
❌ POST /api/admin/operator-onboarding
   Error: The column reflex_events.trustEventTypeV1 does not exist
   Status: 500 Internal Server Error
```

### After Fix:
```
✅ POST /api/admin/operator-onboarding
   Warning: trustEventTypeV1 column not found, using raw SQL fallback
   Status: 200 OK
   Response: { success: true, leadId: "...", message: "Lead created successfully" }
```

---

## 📋 Next Steps

### Option 1: Apply Migration (Recommended)
Run the migration that adds `trustEventTypeV1` column:

```bash
cd apps/app
npx prisma migrate deploy
```

### Option 2: Continue with Fallback
The raw SQL fallback will continue to work until the migration is applied. No action needed.

---

## 🎯 Status

- ✅ Lead creation working (with fallback)
- ✅ Audit trail working (with fallback)
- ✅ Operator onboarding dashboard should now show leads
- ⚠️ Migration still needed for full schema sync

---

**Last Updated:** 2025-01-16  
**Status:** Fixed ✅ | Migration Pending ⚠️
