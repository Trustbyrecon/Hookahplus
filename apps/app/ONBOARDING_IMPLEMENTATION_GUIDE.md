# Onboarding State Machine Implementation Guide

**Status:** ✅ Implemented

This guide documents the implementation of the automated onboarding state machine for SetupSession and Lead.

---

## Quick Start

### 1. Run Database Migration

```bash
cd apps/app
npx prisma migrate dev --name add_setup_session_state_machine
```

Or manually run the SQL migration:
```bash
psql $DATABASE_URL -f migrations/add_setup_session_state_machine.sql
```

### 2. Verify Implementation

The state machine is now active. Every time a user enters LaunchPad:
- ✅ SetupSession is auto-created with `status = 'draft'`
- ✅ `setup_link` is auto-generated
- ✅ Soft Lead is auto-created with `lead_status = 'warm_draft'`
- ✅ State transitions happen automatically as user progresses

---

## State Machine Flow

### SetupSession States

```
draft → in_progress → completed → activated
  ↓         ↓            ↓
expired  abandoned   expired
```

**Transitions:**
- `draft` → `in_progress`: When user completes Step 1
- `in_progress` → `completed`: When user completes Step 6
- `completed` → `activated`: When user creates account at Go Live
- Any state → `expired`: If `expiresAt < now()`
- `in_progress` → `abandoned`: If no activity for 7+ days

### Lead States

```
warm_draft → qualified → activated → converted
     ↓           ↓
   lost       lost
```

**Transitions:**
- Auto-created as `warm_draft` when SetupSession created
- `warm_draft` → `qualified`: When user explicitly submits (Go Live, Finish LaunchPad)
- `qualified` → `activated`: When user pays subscription
- `activated` → `converted`: When first live session created

---

## API Changes

### SetupSession Creation (Auto)

**Endpoint:** `POST /api/launchpad/session`

**Before:** Manual creation required
**After:** Auto-created on LaunchPad entry

**Response:**
```json
{
  "success": true,
  "token": "abc123...",
  "setupLink": "https://app.hookahplus.net/launchpad?token=abc123...",
  "expiresAt": "2024-01-15T12:00:00Z",
  "progress": { ... }
}
```

### Progress Saving (State Transitions)

**Endpoint:** `PUT /api/launchpad/session` (via `saveProgress`)

**Automatic transitions:**
- Step 1 completed → `status = 'in_progress'`
- Step 6 completed → `status = 'completed'`, Lead → `qualified`

### Go Live (Activation)

**Endpoint:** `POST /api/launchpad/create-lounge`

**Automatic transitions:**
- SetupSession → `status = 'activated'`
- Lead → `status = 'activated'`

---

## Manual Override (Admin)

For special cases, admins can manually create SetupSessions:

### Option 1: Via Admin Dashboard (Future)

```typescript
// In admin dashboard
const createManualSession = async (leadId: string) => {
  const response = await fetch('/api/admin/setup-sessions', {
    method: 'POST',
    body: JSON.stringify({
      action: 'create_manual',
      leadId,
      source: 'admin',
    }),
  });
};
```

### Option 2: Direct Database

```sql
INSERT INTO setup_sessions (
  token, setup_link, status, progress, expires_at, source
) VALUES (
  'manual_token_123',
  'https://app.hookahplus.net/launchpad?token=manual_token_123',
  'draft',
  '{"currentStep": 1, "completedSteps": [], "data": {}}'::jsonb,
  NOW() + INTERVAL '7 days',
  'admin'
);
```

---

## Testing

### Test Auto-Creation

1. Visit `/launchpad` (no token)
2. Verify SetupSession created with `status = 'draft'`
3. Verify Soft Lead created with `lead_status = 'warm_draft'`
4. Verify `setup_link` is generated

### Test State Transitions

1. Complete Step 1 → Verify `status = 'in_progress'`
2. Complete Step 6 → Verify `status = 'completed'`, Lead = `qualified`
3. Go Live → Verify `status = 'activated'`, Lead = `activated`

### Test Expiration

1. Create session
2. Manually set `expires_at` to past date
3. Try to load session → Should return `null` (expired)

### Test Abandonment

1. Complete Step 1 (`status = 'in_progress'`)
2. Manually set `last_activity_at` to 8 days ago
3. Load session → Should have `status = 'abandoned'`
4. Save progress → Should reset to `in_progress`

---

## Monitoring

### Key Metrics

- **Auto-creation rate:** % of LaunchPad entries that auto-create sessions
- **Completion rate:** % of `draft` → `completed` transitions
- **Activation rate:** % of `completed` → `activated` transitions
- **Abandonment rate:** % of `in_progress` → `abandoned` transitions
- **Lead conversion:** % of `warm_draft` → `qualified` → `activated`

### Queries

```sql
-- Sessions by status
SELECT status, COUNT(*) 
FROM setup_sessions 
GROUP BY status;

-- Abandoned sessions
SELECT * 
FROM setup_sessions 
WHERE status = 'abandoned' 
  AND last_activity_at < NOW() - INTERVAL '7 days';

-- Leads by status
SELECT 
  payload->>'lead_status' as lead_status,
  COUNT(*) 
FROM reflex_events 
WHERE type = 'lead'
GROUP BY payload->>'lead_status';
```

---

## Troubleshooting

### Issue: Sessions not auto-creating

**Check:**
1. Database migration ran successfully
2. `createSetupSession` is called on LaunchPad entry
3. No errors in console

**Fix:**
```typescript
// Verify in launchpad/page.tsx
useEffect(() => {
  initializeSession(); // Should call createSetupSession
}, []);
```

### Issue: State transitions not happening

**Check:**
1. `saveProgress` is called with correct step number
2. Status field exists in database
3. No errors in `updateLeadStatus`

**Fix:**
```typescript
// Verify in session-manager.ts
await saveProgress(token, step, data); // Should update status
```

### Issue: Leads not auto-creating

**Check:**
1. `createSoftLead` is called in `createSetupSession`
2. Lead is linked to SetupSession via `leadId`
3. No errors in lead creation (non-blocking)

**Fix:**
```typescript
// Verify in session-manager.ts
const leadId = await createSoftLead(setupSession.id, source, prefillData);
```

---

## Next Steps

1. ✅ State machine implemented
2. ⏳ Add admin dashboard for manual override
3. ⏳ Add monitoring dashboard
4. ⏳ Add email notifications for abandoned sessions
5. ⏳ Add analytics tracking for state transitions

---

## Files Modified

- `prisma/schema.prisma` - Added status, setupLink, leadId, lastActivityAt
- `lib/launchpad/session-manager.ts` - Implemented state machine logic
- `types/launchpad.ts` - Added setupLink to SetupSessionResponse
- `ONBOARDING_STATE_MACHINE.md` - State machine documentation
- `ONBOARDING_IMPLEMENTATION_GUIDE.md` - This file

---

**Questions?** See `ONBOARDING_STATE_MACHINE.md` for detailed state definitions.
