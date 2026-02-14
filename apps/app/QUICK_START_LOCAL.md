# Quick Start - Local Testing

**Agent:** Noor (session_agent)

---

## Current Status

- ✅ **Guest server:** Running on port 3001
- ⏳ **App server:** Starting on port 3002
- ✅ **DATABASE_URL:** Confirmed in `.env.local`

---

## Manual Start (If Needed)

### Start App Build Server:
```bash
cd apps/app
npm run dev
```

Wait for: `✓ Ready in X.Xs`

### Start Guest Build Server (if not running):
```bash
cd apps/guest
npm run dev
```

---

## Test Guest → App Sync

1. **Open guest build:** http://localhost:3001
2. **Add items to cart**
3. **Click "Fire Session"**
4. **Check console:**
   - Should see: `✅ Session synced to Fire Session Dashboard`
   - Should NOT see: `⚠️ Session created but NOT synced`

---

## Troubleshooting

**If DATABASE_URL not loading:**
- Verify `.env.local` exists in `apps/app/`
- Restart server after creating/updating `.env.local`
- Check server logs for `[db.ts]` messages

**If enum serialization error:**
- Code is already fixed to use string literals
- Should work once server is running

---

**Status:** ⏳ **App server starting - wait for compilation to complete**

