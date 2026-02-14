# 🔒 Fix Prisma Client Lock Error

**Error:** `EPERM: operation not permitted, rename 'query_engine-windows.dll.node'`

**Cause:** The Prisma query engine file is locked by a running process (usually the dev server).

## Quick Fix Steps

### Option 1: Stop All Node Processes (Recommended)

1. **Find and stop the dev server:**
   ```bash
   # In Windows PowerShell or CMD:
   taskkill /F /IM node.exe
   ```
   
   **Or in Git Bash:**
   ```bash
   # Find the process ID:
   ps aux | grep node
   # Then kill it (replace PID with actual process ID):
   kill -9 PID
   ```

2. **Or manually:**
   - Find the terminal where `npm run dev` is running
   - Press `Ctrl+C` to stop it
   - Wait 2-3 seconds for it to fully stop

3. **Then regenerate:**
   ```bash
   npx prisma generate
   ```

### Option 2: Close All Related Applications

1. **Close:**
   - All terminals running Node.js
   - VS Code/Cursor (if Prisma extensions are running)
   - Prisma Studio (if open)
   - Any other IDE with Prisma extensions

2. **Then regenerate:**
   ```bash
   npx prisma generate
   ```

### Option 3: Use Task Manager (Windows)

1. **Open Task Manager** (Ctrl+Shift+Esc)
2. **Find and end:**
   - All `node.exe` processes
   - Any `prisma` processes
3. **Then regenerate:**
   ```bash
   npx prisma generate
   ```

### Option 4: Restart Terminal/Computer (Last Resort)

If nothing else works:
1. Close all terminals
2. Restart your terminal/IDE
3. Or restart your computer
4. Then regenerate:
   ```bash
   npx prisma generate
   ```

## Verify It Worked

After running `npx prisma generate`, you should see:
```
✔ Generated Prisma Client (v5.22.0) to ./../../node_modules/@prisma/client
```

## After Regeneration

1. **Restart the dev server:**
   ```bash
   npm run dev
   ```

2. **Re-run the backfill script:**
   ```bash
   npx tsx scripts/backfill-taxonomy-v1.ts
   ```

## Why This Happens

On Windows, the Prisma query engine (`query_engine-windows.dll.node`) is a native DLL file that gets loaded into memory when:
- The dev server starts
- Prisma Studio is running
- Any script uses Prisma Client

Windows locks DLL files while they're in use, preventing Prisma from replacing them during `prisma generate`.

## Prevention

- Always stop the dev server before running `prisma generate`
- Close Prisma Studio before regenerating
- Use a single terminal for Prisma operations

