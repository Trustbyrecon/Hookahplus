# ✅ Sentry Alerts Script Ready

**Date:** 2025-01-28  
**Status:** ✅ Script created and tested (dry-run successful)

---

## 🎯 What Was Created

A Node.js/TypeScript script that provisions Sentry alerts via REST API:

- ✅ **scripts/sentry-alerts.ts** - Main provisioning script
- ✅ **scripts/sentry-alerts-config.json** - Alert configuration (reference)
- ✅ **scripts/README_SENTRY_ALERTS.md** - Complete documentation

---

## 🚀 Quick Start

### 1. Test (Dry Run)

```bash
npx tsx scripts/sentry-alerts.ts --dry-run
```

This shows what will be created without making changes.

### 2. Create Alerts

```bash
npx tsx scripts/sentry-alerts.ts
```

This creates all 7 alert rules across both projects.

---

## 📊 Alerts That Will Be Created

### hookahplus-app (5 alerts):
1. ✅ **Critical Production Errors** (P0) - Every occurrence
2. ✅ **New Issue Detected** (P2) - Once per hour
3. ✅ **Payment-Related Errors** (P0) - Every occurrence
4. ✅ **Database Connection Errors** (P1) - Once per 5 minutes
5. ✅ **Authentication Failures** (P2) - Once per hour

### hookahplus-guests (2 alerts):
1. ✅ **Critical Production Errors** (P0) - Every occurrence
2. ✅ **New Issue Detected** (P2) - Once per hour

---

## ✨ Features

- ✅ **Idempotent** - Safe to run multiple times
- ✅ **Checks existing alerts** - Won't create duplicates
- ✅ **Dry-run mode** - Preview before applying
- ✅ **Version controlled** - All configs in code
- ✅ **CI/CD ready** - Can be automated

---

## 🔍 Verify After Running

After running the script, check:
- https://sentry.io/organizations/hookahplusnet/alerts/rules/

All 7 alerts should appear there!

---

## 📝 Next Steps

1. **Review the script:** `scripts/sentry-alerts.ts`
2. **Test with dry-run:** `npx tsx scripts/sentry-alerts.ts --dry-run`
3. **Create alerts:** `npx tsx scripts/sentry-alerts.ts`
4. **Verify in Sentry dashboard**

---

## 🔧 Customization

To modify alerts, edit `scripts/sentry-alerts.ts`:
- Change conditions
- Modify frequency
- Add/remove actions
- Add Slack integration

See `scripts/README_SENTRY_ALERTS.md` for details.

---

**Ready to create alerts! Run the script when you're ready.** 🎯

