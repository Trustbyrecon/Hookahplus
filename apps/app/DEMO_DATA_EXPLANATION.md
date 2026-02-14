# Demo Data Explanation

## Key Points

### 1. Demo Data is NOT in the Database
- **Demo data is generated in-memory** in `useLiveSessionData.ts` when the database connection fails
- It's a **read-only fallback** for the UI to show sample sessions
- Demo data does NOT persist to the database
- Demo data does NOT conflict with database writes

### 2. Session Creation Goes Through the API
- When you click "Create Session", it calls `/api/sessions` (POST)
- This API route **always tries to write to the database**
- If the database connection fails or schema is mismatched, session creation fails
- **Demo data cannot be written to** - it's only for display

### 3. The Current Issue
The error `The column sessions.externalRef does not exist` indicates:
- Prisma schema was mapping to `sessions` (lowercase)
- Database table is `Session` (uppercase)
- **Fixed**: Updated schema to `@@map("Session")`
- **Next**: Need to regenerate Prisma client (requires stopping servers first)

### 4. Daily Pulse Demo Data
- Added `generateDemoPulse()` function to provide demo data when database is unavailable
- Pulse API now falls back to demo data in development mode
- Demo pulse shows realistic metrics (8-23 sessions, $25-45 per session, etc.)

## How to Fix Session Creation

1. **Stop all running servers** (they lock Prisma client files)
2. **Regenerate Prisma client**: `npx prisma generate`
3. **Restart servers**: `npm run dev:all`
4. **Test session creation** - should now work with the correct table mapping

## Demo Data Flow

```
┌─────────────────────────────────────────────────────────┐
│ UI (Fire Session Dashboard)                             │
│                                                          │
│  ┌──────────────────┐      ┌──────────────────┐        │
│  │ Read Sessions    │      │ Create Session   │        │
│  │ (useLiveSession) │      │ (API POST)       │        │
│  └────────┬─────────┘      └────────┬─────────┘        │
│           │                         │                   │
│           │                         │                   │
└───────────┼─────────────────────────┼───────────────────┘
            │                         │
            │                         │
    ┌───────▼────────┐      ┌────────▼────────┐
    │ Database OK?   │      │ Database OK?    │
    └───────┬────────┘      └────────┬────────┘
            │                         │
    ┌───────▼────────┐      ┌────────▼────────┐
    │ YES: Load real │      │ YES: Write to   │
    │     sessions   │      │     database    │
    │                │      │                 │
    │ NO: Show demo  │      │ NO: Return      │
    │     data       │      │     error       │
    └────────────────┘      └─────────────────┘
```

## Summary

- ✅ **Demo data is read-only** - doesn't conflict with writes
- ✅ **Session creation requires database** - cannot write to demo data
- ✅ **Daily Pulse now has demo fallback** - will show demo data in dev mode
- ⚠️ **Schema mismatch fixed** - need to regenerate Prisma client
- 🔄 **Next step**: Stop servers, regenerate Prisma client, restart

