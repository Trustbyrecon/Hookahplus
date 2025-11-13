# Enum Serialization: Reflection & Solution

**Date:** 2025-01-14  
**Status:** 🔍 **Root Cause Analysis** → 🎯 **Direct Solution**

---

## What We're Learning

### 1. **The Problem Pattern**
- **Error:** `Error("expected value", line: 1, column: 1)` - JSON parsing error in Prisma's query builder
- **Root Cause:** Prisma is trying to serialize TypeScript enum objects (`SessionSource.QR`) but PostgreSQL expects string values or properly formatted enum values
- **Context:** Migration has been run (columns ARE enum types), but Prisma client may not be in sync

### 2. **What Others Have Done**

**Common Solutions:**
1. ✅ **Regenerate Prisma Client** - Most common fix
2. ✅ **Use String Literals** - Bypass enum serialization entirely  
3. ✅ **Raw SQL Fallback** - Direct PostgreSQL queries with explicit casting
4. ✅ **Restart Server** - Clear cached Prisma client instances

**Industry Pattern:**
- Many teams avoid Prisma enums for PostgreSQL and use string literals with validation
- Some use raw SQL for enum-heavy operations
- Prisma's enum serialization is known to be finicky with PostgreSQL

---

## The Hurdle Assessment

**Difficulty:** 🟡 **Medium** (not high, but requires specific steps)

**Why it's not "High":**
- ✅ We have a working fallback mechanism
- ✅ The database schema is correct
- ✅ The code structure is sound
- ✅ We know exactly what's wrong

**Why it's not "Low":**
- ⚠️ Requires server restart (manual step)
- ⚠️ Prisma client regeneration needed
- ⚠️ Need to verify server logs to see if fallback triggers

---

## How to Get Unblocked: Direct Solution

### **Option 1: Use String Literals (Immediate Fix)**

The most reliable approach - bypass Prisma's enum serialization entirely:

```typescript
// Instead of:
sessionData.source = SessionSource.QR;  // ❌ Prisma tries to serialize enum object

// Use:
sessionData.source = 'QR' as any;  // ✅ String literal, PostgreSQL casts to enum
sessionData.state = 'PENDING' as any;
```

**Why This Works:**
- PostgreSQL automatically casts strings to enum types
- No Prisma serialization involved
- Works immediately, no server restart needed (if code is already updated)

### **Option 2: Regenerate Prisma Client + Restart**

If you want to use Prisma enums properly:

```bash
# 1. Regenerate Prisma client
cd apps/app
npx prisma generate

# 2. Restart server
# Stop current server (Ctrl+C)
npm run dev
```

### **Option 3: Use Raw SQL (Already Implemented)**

The fallback I added should work, but we need to:
1. **Check server logs** - See if fallback is triggered
2. **Verify error detection** - Make sure the catch block recognizes the error

---

## Immediate Action Plan

### Step 1: Check Server Logs
Look at the app build server terminal output when you try to create a session. You should see:
- `[Sessions API] Creating session with data:` - Shows enum values
- `[Sessions API] Prisma create error:` - Shows the actual error
- `[Sessions API] Attempting fallback:` - If fallback triggers

### Step 2: Quick Fix - Use String Literals
If the fallback isn't working, switch to string literals:

```typescript
sessionData.source = sourceValue; // Already a string ('QR', 'WALK_IN', etc.)
sessionData.state = 'PENDING';    // String literal
```

### Step 3: Verify Prisma Client
```bash
cd apps/app
npx prisma generate
# Restart server
```

---

## Why This Keeps Happening

1. **Prisma Client Cache** - Next.js dev server caches Prisma client
2. **Enum Serialization** - Prisma's internal serialization of enum objects can fail
3. **Type Mismatch** - TypeScript enum objects ≠ PostgreSQL enum strings

---

## The Real Solution

**Use string literals for enum fields when creating records:**

```typescript
const sessionData: any = {
  // ... other fields
  source: sourceValue,  // String: 'QR', 'WALK_IN', etc.
  state: 'PENDING',     // String literal
};

await prisma.session.create({
  data: sessionData as any,
});
```

**PostgreSQL will:**
- Accept the string
- Cast it to the enum type automatically
- Validate it against enum values

**This is the most reliable approach** and what many production teams do.

---

## Next Steps

1. ✅ **Check server logs** - See what's actually happening
2. ✅ **Switch to string literals** - Most reliable fix
3. ✅ **Test Guest → App sync** - Should work immediately
4. ✅ **Keep fallback** - As safety net for edge cases

---

**Status:** 🎯 **Ready to implement - Low risk, high confidence**

