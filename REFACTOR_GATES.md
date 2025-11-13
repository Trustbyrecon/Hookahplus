# Refactor Gates - Third Pass Tracking

**Principle:** Rule of Three - Allow duplicate code twice, extract on the third use.

This document tracks intentional duplication that should be extracted when used a third time.

---

## Currently Duplicated (Allow 2 More Uses)

### 1. CORS Headers Logic
**Status:** Used in 2 places
- **Location 1:** `apps/app/app/api/sessions/route.ts` (getCorsHeaders function)
- **Location 2:** (Identify second use)
- **Next Use:** When third API endpoint needs CORS
- **Extract On:** Third API endpoint
- **Target:** `apps/app/lib/cors.ts` - Shared CORS utility

### 2. Session State Mapping
**Status:** Used in 2 places
- **Location 1:** `apps/app/app/api/sessions/route.ts` (mapPrismaStateToFireSession, mapStateToStage)
- **Location 2:** `apps/app/hooks/useLiveSessionData.ts` (mapPrismaStateToFireSession, mapStateToStage)
- **Next Use:** When third component needs state mapping
- **Extract On:** Third use case
- **Target:** `apps/app/lib/sessionStateMapping.ts` - Shared state mapping utilities

### 3. Error Response Formatting
**Status:** Used in multiple API routes
- **Pattern:** `NextResponse.json({ error, details }, { status, headers })`
- **Locations:** Multiple API routes
- **Extract On:** Third API route with same pattern
- **Target:** `apps/app/lib/apiResponse.ts` - Standardized error responses

### 4. Safe JSON Parsing
**Status:** Used in 2 places
- **Location 1:** `apps/app/app/fire-session-dashboard/page.tsx`
- **Location 2:** `apps/guest/app/page.tsx`
- **Next Use:** When third component needs safe JSON parsing
- **Extract On:** Third use case
- **Target:** `apps/app/lib/jsonParsing.ts` - Safe JSON parsing utility

---

## Intentionally Simple (Don't Over-Engineer)

### 1. Session Creation - POST Endpoint
**Status:** Simplified, keep simple
- **Location:** `apps/app/app/api/sessions/route.ts`
- **Reason:** Works correctly, follows SRP, idempotent
- **Action:** Don't extract or over-engineer

### 2. Real-time Polling
**Status:** 5-second interval, works correctly
- **Location:** `apps/app/hooks/useLiveSessionData.ts`
- **Reason:** Simple, effective, no need for WebSocket yet
- **Action:** Keep as-is for MVP

### 3. Business Logic Metadata
**Status:** Preserve but don't expand
- **Location:** `apps/app/lib/sessionStateMachine.ts` (STATE_DESCRIPTIONS, ACTION_DESCRIPTIONS)
- **Reason:** Provides contextual awareness, training value
- **Action:** Keep, don't remove in name of simplicity

---

## Extraction Candidates (Third Use Detected)

*None yet - tracking for future extraction*

---

## Notes

- **Gall's Law:** Simple systems that work, evolve complexity only when needed
- **Make it work → make it right → make it fast:** Current focus is "make it right"
- **Idempotency:** All API endpoints must be idempotent
- **Single Responsibility:** Each function does one thing

---

## GitHub Label

When third use is detected, add label: `gate:third-pass` to trigger extraction.

