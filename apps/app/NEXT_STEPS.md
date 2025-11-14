# 🎯 Next Steps: Taxonomy v1 Rollout

**Status:** Phase 2 - Deployment & Verification  
**Last Updated:** 2025-11-15

## ✅ What's Done

1. ✅ **Session Creation Working** - Sessions are being created successfully
2. ✅ **Migrations Created** - Both taxonomy v1 and RLS migrations ready
3. ✅ **Backfill Script Run** - 4 sessions migrated, 12 reflex events identified as unknown
4. ✅ **Unknown Tracker Fixed** - Now uses raw SQL (works before Prisma regeneration)

## 🎯 Immediate Next Steps

### Step 1: Regenerate Prisma Client (5 min)

**Problem:** Prisma client is locked because dev server is running.

**Solution:**
1. **Stop the dev server** (Ctrl+C in the terminal where `npm run dev` is running)
2. **Regenerate Prisma client:**
   ```bash
   cd apps/app
   npx prisma generate
   ```
3. **Restart the dev server:**
   ```bash
   npm run dev
   ```

**Why:** The Prisma client needs to include the new `sessionStateV1`, `paused`, `trustEventTypeV1`, and `driftReasonV1` columns so TypeScript and Prisma queries work correctly.

---

### Step 2: Re-run Backfill Script (2 min)

**Why:** The first run couldn't track unknown reflex events because Prisma client didn't know about `TaxonomyUnknown` table. Now that `trackUnknown` uses raw SQL, it should work.

**Command:**
```bash
cd apps/app
npx tsx scripts/backfill-taxonomy-v1.ts
```

**Expected:** Should now properly track the 12 unknown reflex events in the `TaxonomyUnknown` table.

---

### Step 3: Verify Taxonomy Coverage (5 min)

**Navigate to:** `http://localhost:3002/admin` → Click "Taxonomy" tab

**What to Check:**
1. **KPI Metrics:**
   - Overall Coverage should be ≥95%
   - SessionState Coverage should be ≥95%
   - TrustEventType Coverage should show current status
   - Unknown Rate should be <5%

2. **Top Unknowns Table:**
   - Should show the 12 unknown reflex events
   - Review each one and decide if they should be:
     - **Promoted** to a known mapping (click "Promote" button)
     - **Left as unknown** (if they're edge cases)

3. **Example Unknowns to Review:**
   - `onboarding.signup` → Could map to `fast_checkout` or leave as unknown
   - `ui.roi.render` → Likely UI event, can leave as unknown
   - `admin.operator_onboarding.update` → Admin event, can leave as unknown
   - `ui.pricing.render` → UI event, can leave as unknown

---

### Step 4: Test Session Creation (2 min)

**Navigate to:** `http://localhost:3002/fire-session-dashboard`

**Test:**
1. Click "+ New Session"
2. Fill in:
   - Table ID: `test-table-002`
   - Customer Name: `Taxonomy Test`
   - Flavor: `Mint + Lemon`
   - Amount: `$35.00`
3. Click "Create Session"
4. **Verify:**
   - ✅ Session created successfully
   - ✅ No errors in console
   - ✅ Session appears in dashboard

---

### Step 5: Monitor & Review (Ongoing)

**Weekly Tasks:**
1. Check `/admin` → Taxonomy tab
2. Review Top Unknowns table
3. Promote high-frequency unknowns to mappings
4. Update `LEGACY_TRUST_EVENT_MAP` in `apps/app/lib/taxonomy/enums-v1.ts` if needed

---

## 🚨 If You Encounter Issues

### Prisma Client Still Locked
- Close all terminals running `npm run dev`
- Close Prisma Studio if open
- Close VS Code/Cursor if it has Prisma extensions running
- Try `npx prisma generate` again

### Backfill Script Fails
- Check that migrations have been run in Supabase
- Verify `DATABASE_URL` is set in `.env.local`
- Check console for specific error messages

### Taxonomy Dashboard Shows Errors
- Check browser console for API errors
- Verify `/api/taxonomy/kpi` endpoint is accessible
- Check that migrations have been run

---

## 📊 Success Criteria

- ✅ Prisma client regenerated successfully
- ✅ Backfill script completes without errors
- ✅ Taxonomy dashboard shows coverage metrics
- ✅ Session creation works end-to-end
- ✅ Unknown values are being tracked

---

## 🎉 Once Complete

You'll have:
- ✅ Full taxonomy v1 implementation
- ✅ Unknown value tracking and review
- ✅ Coverage monitoring dashboard
- ✅ Dual-write pattern (legacy + v1)
- ✅ Ready for production rollout

**Estimated Time:** ~15 minutes to complete all steps

