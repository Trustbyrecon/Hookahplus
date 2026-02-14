# ⚡ Quick Fix: Prisma Lock Error

## The Problem
```
EPERM: operation not permitted, rename 'query_engine-windows.dll.node'
```

## The Solution (Try in Order)

### 1️⃣ **Close Everything & Wait** (30 seconds)
- Close all terminals
- Close VS Code/Cursor
- Wait 30 seconds
- Try again: `npx prisma generate`

### 2️⃣ **Kill Any Remaining Processes**
```bash
# In Git Bash:
pkill -f node
pkill -f prisma

# Wait 5 seconds, then:
npx prisma generate
```

### 3️⃣ **Delete the Locked File Manually** (if above doesn't work)
```bash
# Navigate to the Prisma client directory
cd ../../node_modules/.prisma/client

# Delete the locked file (if it exists)
rm -f query_engine-windows.dll.node

# Go back to app directory
cd ../../../../apps/app

# Regenerate
npx prisma generate
```

### 4️⃣ **Nuclear Option: Delete Entire Prisma Client**
```bash
# From apps/app directory:
rm -rf ../../node_modules/.prisma

# Regenerate
npx prisma generate
```

## After Success

Once `npx prisma generate` works:
1. ✅ Restart dev server: `npm run dev`
2. ✅ Re-run backfill: `npx tsx scripts/backfill-taxonomy-v1.ts`
3. ✅ Check dashboard: `http://localhost:3002/admin` → Taxonomy tab

## Why This Happens

Windows locks DLL files when they're loaded into memory. Even after a process stops, Windows may keep the file locked for a few seconds.

**Best Practice:** Always stop the dev server before running `prisma generate`.

