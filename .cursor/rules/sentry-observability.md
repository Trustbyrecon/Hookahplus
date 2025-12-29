# Sentry Observability Rules (Moat Spark Doctrine)

**When implementing features or fixing bugs, follow these Sentry instrumentation patterns:**

---

## 🎯 Core Principle

Every meaningful operation should be **visible, measurable, and traceable** through Sentry spans and events. This aligns with the Moat Spark Doctrine: **instrumentation → diagnosis → feedback → repair → confidence**.

---

## 📊 Custom Span Instrumentation

### For UI Actions (Button Clicks, Form Submissions)

**Pattern:**
```typescript
import * as Sentry from '@sentry/nextjs';

function handleButtonClick() {
  Sentry.startSpan(
    {
      op: 'ui.click',
      name: 'Button Click: [Component Name]',
    },
    (span) => {
      // Add meaningful attributes
      span.setAttribute('component', '[component]');
      span.setAttribute('action', '[action]');
      span.setAttribute('userId', userId);
      span.setAttribute('sessionId', sessionId);
      
      // ... perform action
    }
  );
}
```

**Example:**
```typescript
function handleRefillRequest() {
  Sentry.startSpan(
    {
      op: 'ui.click',
      name: 'Refill Request Button',
    },
    (span) => {
      span.setAttribute('component', 'refill');
      span.setAttribute('action', 'request');
      span.setAttribute('sessionId', currentSession.id);
      span.setAttribute('userId', currentUser.id);
      
      // Make API call
      return requestRefill(currentSession.id);
    }
  );
}
```

### For API Calls

**Pattern:**
```typescript
async function fetchData(userId: string) {
  return Sentry.startSpan(
    {
      op: 'http.client',
      name: `GET /api/users/${userId}`,
    },
    async (span) => {
      const startTime = Date.now();
      
      // Add context attributes
      span.setAttribute('user.id', userId);
      span.setAttribute('http.method', 'GET');
      span.setAttribute('http.url', `/api/users/${userId}`);
      
      try {
        const response = await fetch(`/api/users/${userId}`);
        const responseTime = Date.now() - startTime;
        
        span.setAttribute('http.status_code', response.status);
        span.setAttribute('http.response_time', responseTime);
        
        return response.json();
      } catch (error) {
        span.setAttribute('error', true);
        span.setAttribute('error.message', error instanceof Error ? error.message : 'Unknown error');
        throw error;
      }
    }
  );
}
```

---

## 🚨 Error Handling

### Always Use TelemetryService for Errors

**Pattern:**
```typescript
import { telemetryService } from '@/lib/telemetryService';

try {
  // ... code that might fail
  await someOperation();
} catch (error) {
  // Track error with full context
  telemetryService.trackError(
    'component',      // e.g., 'session', 'payment', 'refill'
    'action',         // e.g., 'create', 'process', 'request'
    error,            // Error object
    {                 // Additional data
      additionalContext: 'value',
    },
    {                 // Metadata
      sessionId: sessionId,
      userId: userId,
      requestId: requestId,
    }
  );
  
  // Re-throw if needed, or handle gracefully
  throw error;
}
```

**Why:** TelemetryService automatically:
- Sends to Sentry with proper tags
- Records Reflex score (0 for errors)
- Logs to Pino with structured format
- Includes full context (sessionId, userId, requestId)

---

## 🏷️ Context Enrichment

### Required Attributes for All Sentry Events

**Standard Tags:**
- `component`: Component/service name (e.g., 'session', 'payment', 'refill')
- `action`: Specific action (e.g., 'create', 'update', 'delete')
- `environment`: 'development', 'staging', 'production'

**Context Attributes (when available):**
- `sessionId`: Current session ID
- `userId`: Current user ID
- `tableId`: Table ID (if applicable)
- `requestId`: Request ID for tracing
- `userRole`: User role (BOH, FOH, MANAGER, ADMIN, CUSTOMER)

**Example:**
```typescript
Sentry.captureException(error, {
  tags: {
    component: 'session',
    action: 'create',
    environment: process.env.NODE_ENV || 'development',
  },
  extra: {
    sessionId: 'sess_123',
    userId: 'user_456',
    tableId: 'table_789',
    requestId: 'req_abc',
    userRole: 'BOH',
  },
});
```

---

## 🔗 Integration with TelemetryService

### Use TelemetryService for Unified Observability

**Pattern:**
```typescript
import { telemetryService } from '@/lib/telemetryService';

// Track user actions
telemetryService.trackUserAction(
  'component',
  'action',
  { data: 'value' },
  { sessionId, userId, requestId }
);

// Track errors
telemetryService.trackError(
  'component',
  'action',
  error,
  { additionalData },
  { sessionId, userId, requestId }
);

// Track API calls
telemetryService.trackApiCall(
  '/api/sessions',
  'POST',
  responseTime,
  statusCode,
  success,
  { additionalData },
  { sessionId, userId, requestId }
);
```

**Why:** TelemetryService provides:
- Unified interface for Sentry + Pino + Reflex scoring
- Consistent context across all observability tools
- Automatic error handling and retry logic
- Moat-aligned trust observability

---

## 🎨 Component-Level Instrumentation

### Use Helper Functions for Common Patterns

**For UI Actions:**
```typescript
import { instrumentUIAction } from '@/lib/sentry-instrumentation';

function MyComponent() {
  const handleClick = () => {
    instrumentUIAction(
      'my-component',
      'button-click',
      (span) => {
        // Your action code here
        span.setAttribute('customAttribute', 'value');
        return performAction();
      },
      { sessionId, userId } // Optional context
    );
  };
  
  return <button onClick={handleClick}>Click Me</button>;
}
```

**For API Calls:**
```typescript
import { instrumentAPICall } from '@/lib/sentry-instrumentation';

async function fetchSessionData(sessionId: string) {
  return instrumentAPICall(
    `/api/sessions/${sessionId}`,
    'GET',
    () => fetch(`/api/sessions/${sessionId}`),
    { sessionId } // Optional context
  );
}
```

---

## 📋 Moat Alignment Checklist

Every Sentry event should:

- ✅ **Include component/action tags** (for filtering in Sentry dashboard)
- ✅ **Include session/user context** (for debugging user-specific issues)
- ✅ **Use custom spans** for meaningful operations (button clicks, API calls)
- ✅ **Integrate with TelemetryService** (unified observability)
- ✅ **Preserve Reflex scoring** (via TelemetryService integration)
- ✅ **Follow naming conventions** (`component.action` format)

---

## 🚫 What NOT to Do

**Don't:**
- ❌ Send errors without context (always include component, action, sessionId, userId)
- ❌ Create spans for trivial operations (only meaningful actions)
- ❌ Duplicate instrumentation (use TelemetryService, don't call Sentry directly)
- ❌ Ignore error handling (always wrap risky operations in try-catch)
- ❌ Skip context enrichment (always add relevant attributes)

**Do:**
- ✅ Use TelemetryService for all error tracking
- ✅ Create spans for user actions and API calls
- ✅ Add meaningful attributes to spans
- ✅ Include full context (sessionId, userId, requestId)
- ✅ Follow Moat Spark Doctrine patterns

---

## 📚 References

- **Moat Spark Doctrine:** `MOAT_SPARK_DOCTRINE.md`
- **Quick Reference:** `MOAT_SPARK_CHEATSHEET.md`
- **Examples:** `MOAT_SPARK_EXAMPLES.md`
- **TelemetryService:** `apps/app/lib/telemetryService.ts`
- **Sentry Instrumentation:** `apps/app/lib/sentry-instrumentation.ts`

---

## 🎯 Example: Complete Pattern

```typescript
import { telemetryService } from '@/lib/telemetryService';
import { instrumentUIAction } from '@/lib/sentry-instrumentation';
import * as Sentry from '@sentry/nextjs';

async function handleRefillRequest(sessionId: string, userId: string) {
  return instrumentUIAction(
    'refill',
    'request',
    async (span) => {
      span.setAttribute('sessionId', sessionId);
      span.setAttribute('userId', userId);
      
      try {
        const response = await fetch(`/api/sessions/${sessionId}/refill`, {
          method: 'POST',
        });
        
        if (!response.ok) {
          throw new Error(`Refill request failed: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Track success
        telemetryService.trackUserAction(
          'refill',
          'request',
          { sessionId, success: true },
          { sessionId, userId }
        );
        
        return data;
      } catch (error) {
        // Track error with full context
        telemetryService.trackError(
          'refill',
          'request',
          error,
          { sessionId },
          { sessionId, userId }
        );
        throw error;
      }
    },
    { sessionId, userId }
  );
}
```

---

**Status:** ✅ Active Rule  
**Last Updated:** 2025-01-27  
**Alignment:** Moat Spark Doctrine v1

