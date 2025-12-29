# Sentry Observability Enhancements Summary

**Date:** 2025-01-27  
**Status:** ✅ Complete  
**Alignment:** Moat Spark Doctrine v1

---

## 🎯 What Was Created

### 1. AI Rules for Cursor (`.cursor/rules/sentry-observability.md`)

**Purpose:** Guides AI assistants (like Cursor) to use Sentry correctly when generating code.

**Includes:**
- Custom span instrumentation patterns for UI actions and API calls
- Error handling best practices using TelemetryService
- Context enrichment guidelines (component, action, sessionId, userId, etc.)
- Moat alignment checklist
- Complete examples

**Impact:** AI will automatically generate code with proper Sentry instrumentation.

---

### 2. Enhanced Sentry Configurations

**Updated Files:**
- `apps/app/sentry.client.config.ts` - Added `consoleIntegration` for automatic console.log/warn/error capture
- `apps/app/sentry.server.config.ts` - Added `consoleIntegration` for automatic console.warn/error capture

**What This Does:**
- Automatically captures console errors and sends them to Sentry
- No need to manually wrap every console.error call
- Better visibility into errors that might not be caught by try-catch blocks

---

### 3. Sentry Instrumentation Helpers (`apps/app/lib/sentry-instrumentation.ts`)

**New Functions:**
- `instrumentUIAction()` - For button clicks, form submissions, etc.
- `instrumentAPICall()` - For fetch calls, API routes, etc.
- `instrumentDatabaseOperation()` - For database queries, transactions, etc.
- `createCustomSpan()` - For any custom operation

**Benefits:**
- Reusable patterns for common operations
- Automatic span creation with proper attributes
- Consistent observability across the codebase
- Easy to use in React components and API routes

---

### 4. Enhanced TelemetryService (`apps/app/lib/telemetryService.ts`)

**New Methods:**
- `trackUserActionWithSpan()` - Track UI actions with Sentry spans
- `trackApiCallWithSpan()` - Track API calls with Sentry spans
- `trackDatabaseOperationWithSpan()` - Track database operations with Sentry spans

**Benefits:**
- Unified interface: TelemetryService + Sentry spans + Reflex scoring
- Automatic error tracking and performance monitoring
- Consistent context across all observability tools

---

## 📊 How to Use

### For UI Actions (Button Clicks, Form Submissions)

**Before:**
```typescript
function handleRefillRequest() {
  requestRefill(sessionId);
}
```

**After (Option 1 - Using TelemetryService):**
```typescript
import { telemetryService } from '@/lib/telemetryService';

function handleRefillRequest() {
  telemetryService.trackUserActionWithSpan(
    'refill',
    'request',
    async (span) => {
      span.setAttribute('sessionId', sessionId);
      return await requestRefill(sessionId);
    },
    { sessionId, userId }
  );
}
```

**After (Option 2 - Using Helper Directly):**
```typescript
import { instrumentUIAction } from '@/lib/sentry-instrumentation';

function handleRefillRequest() {
  instrumentUIAction(
    'refill',
    'request',
    (span) => {
      span.setAttribute('sessionId', sessionId);
      return requestRefill(sessionId);
    },
    { sessionId, userId }
  );
}
```

### For API Calls

**Before:**
```typescript
async function fetchSessionData(sessionId: string) {
  const response = await fetch(`/api/sessions/${sessionId}`);
  return response.json();
}
```

**After (Option 1 - Using TelemetryService):**
```typescript
import { telemetryService } from '@/lib/telemetryService';

async function fetchSessionData(sessionId: string) {
  const response = await telemetryService.trackApiCallWithSpan(
    `/api/sessions/${sessionId}`,
    'GET',
    () => fetch(`/api/sessions/${sessionId}`),
    { sessionId, userId }
  );
  return response.json();
}
```

**After (Option 2 - Using Helper Directly):**
```typescript
import { instrumentAPICall } from '@/lib/sentry-instrumentation';

async function fetchSessionData(sessionId: string) {
  const response = await instrumentAPICall(
    `/api/sessions/${sessionId}`,
    'GET',
    () => fetch(`/api/sessions/${sessionId}`),
    { sessionId }
  );
  return response.json();
}
```

### For Database Operations

**Before:**
```typescript
async function getSession(sessionId: string) {
  return db.session.findUnique({ where: { id: sessionId } });
}
```

**After:**
```typescript
import { telemetryService } from '@/lib/telemetryService';

async function getSession(sessionId: string) {
  return telemetryService.trackDatabaseOperationWithSpan(
    'query',
    'getSession',
    async (span) => {
      span.setAttribute('db.table', 'Session');
      return db.session.findUnique({ where: { id: sessionId } });
    },
    { sessionId }
  );
}
```

---

## 🎯 Moat Alignment

These enhancements align with the **Moat Spark Doctrine**:

✅ **Instrumentation** - Custom spans make operations visible  
✅ **Diagnosis** - Rich context (component, action, sessionId, userId) enables faster debugging  
✅ **Feedback** - Automatic error tracking and performance monitoring  
✅ **Repair** - Clear error messages with full context  
✅ **Confidence** - Unified observability (Sentry + Pino + Reflex scoring)

---

## 📚 References

- **AI Rules:** `.cursor/rules/sentry-observability.md`
- **Helper Functions:** `apps/app/lib/sentry-instrumentation.ts`
- **TelemetryService:** `apps/app/lib/telemetryService.ts`
- **Moat Spark Doctrine:** `MOAT_SPARK_DOCTRINE.md`
- **Quick Reference:** `MOAT_SPARK_CHEATSHEET.md`

---

## 🚀 Next Steps

1. **Start using in new code** - Use the new methods when writing new features
2. **Gradually migrate existing code** - Update existing code to use the new patterns
3. **Monitor Sentry dashboard** - Watch for improved visibility and context
4. **Train team** - Share the AI rules file and examples with the team

---

**Status:** ✅ Ready to Use  
**Last Updated:** 2025-01-27

