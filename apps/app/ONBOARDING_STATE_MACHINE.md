# Onboarding State Machine

**Purpose:** Define exact states and transitions for SetupSession and Lead to prevent edge cases and ensure tight engineering.

---

## SetupSession State Machine

### States

```typescript
type SetupSessionStatus = 
  | 'draft'           // Auto-created, no progress yet
  | 'in_progress'     // User has started filling steps
  | 'completed'       // All 6 steps done, ready for Go Live
  | 'activated'       // Account created, lounge live
  | 'expired'         // Past expiresAt date
  | 'abandoned'       // No activity for 7+ days
```

### Transitions

```
┌─────────┐
│  draft  │ ← Auto-created when user enters LaunchPad
└────┬────┘
     │ User completes Step 1
     ↓
┌──────────────┐
│ in_progress  │ ← User actively filling steps
└────┬─────────┘
     │ User completes all 6 steps
     ↓
┌─────────────┐
│ completed   │ ← Ready for Go Live
└────┬────────┘
     │ User clicks "Go Live" + creates account
     ↓
┌─────────────┐
│  activated  │ ← Final state (lounge is live)
└─────────────┘

Alternative paths:
- draft → expired (if expiresAt passes)
- in_progress → expired (if expiresAt passes)
- in_progress → abandoned (if no activity for 7+ days)
- completed → expired (if expiresAt passes)
```

### State Rules

1. **Auto-creation (draft)**
   - Trigger: User visits `/launchpad` (web, ManyChat, or direct link)
   - Auto-generate: `token`, `setup_link`, `expires_at` (7 days)
   - Status: `draft`
   - Auto-create Soft Lead (see Lead State Machine)

2. **Progress tracking (in_progress)**
   - Trigger: User completes Step 1
   - Update: `status = 'in_progress'`
   - Extend: `expires_at` resets to 7 days from last activity

3. **Completion (completed)**
   - Trigger: User completes Step 6 (Go Live step)
   - Update: `status = 'completed'`
   - Require: All steps 1-5 must be complete

4. **Activation (activated)**
   - Trigger: User creates account at Go Live
   - Update: `status = 'activated'`, `userId` set, `loungeId` set
   - Convert: Soft Lead → Hard Lead (status = 'qualified' or 'activated')

5. **Expiration**
   - Check: On any read operation, if `expiresAt < now()`, set `status = 'expired'`
   - Action: Prevent further edits, show "Session expired" message

6. **Abandonment**
   - Check: If `status = 'in_progress'` and `lastUpdated > 7 days ago`, set `status = 'abandoned'`
   - Action: Still allow resume, but mark for follow-up

---

## Lead State Machine

### States

```typescript
type LeadStatus = 
  | 'warm_draft'     // Auto-created soft lead (not in sales pipeline)
  | 'qualified'      // Explicit submission (in sales pipeline)
  | 'activated'      // Paid subscription or Go Live completed
  | 'converted'      // Converted to customer (lounge live)
  | 'lost'           // Explicitly marked as lost
```

### Transitions

```
┌─────────────┐
│ warm_draft  │ ← Auto-created when SetupSession created
└────┬────────┘
     │ User explicitly submits (Go Live, Finish LaunchPad, Generate Kit)
     ↓
┌─────────────┐
│ qualified   │ ← In sales pipeline
└────┬────────┘
     │ User completes Go Live + pays OR admin marks as activated
     ↓
┌─────────────┐
│  activated  │ ← Subscription active
└────┬────────┘
     │ Lounge goes live (first session created)
     ↓
┌─────────────┐
│ converted   │ ← Final state (customer)
└─────────────┘

Alternative paths:
- warm_draft → lost (if explicitly marked)
- qualified → lost (if explicitly marked)
- Any state → lost (admin override)
```

### State Rules

1. **Auto-creation (warm_draft)**
   - Trigger: SetupSession created (status = 'draft')
   - Data: Minimal identity (ManyChat user_id, IG handle, device token, or session token)
   - Status: `warm_draft`
   - NOT routed to sales
   - NOT counted in pipeline metrics
   - Purpose: Attribution + analytics only

2. **Explicit submission (qualified)**
   - Triggers:
     - User clicks "Go Live" (Step 6)
     - User clicks "Finish LaunchPad"
     - User clicks "Generate Go-Live Kit"
     - User completes onboarding form submission
   - Update: `status = 'qualified'`
   - Route: To sales pipeline
   - Count: In pipeline metrics

3. **Activation (activated)**
   - Trigger: User pays subscription OR admin marks as activated
   - Update: `status = 'activated'`
   - Link: To SetupSession (if exists)

4. **Conversion (converted)**
   - Trigger: First live session created in lounge
   - Update: `status = 'converted'`
   - Final state (no further transitions)

5. **Lost**
   - Trigger: Admin marks as lost OR user explicitly cancels
   - Update: `status = 'lost'`
   - Note: Can be reactivated by admin if needed

---

## SetupSession Schema Fields

```prisma
model SetupSession {
  id            String    @id @default(cuid())
  token         String    @unique
  setupLink     String?   // Auto-generated: /launchpad?token={token}
  status        String    @default("draft") // draft | in_progress | completed | activated | expired | abandoned
  progress      Json
  loungeId      String?   @unique
  source        String?   // "manychat" | "web" | "direct"
  manychatUserId String?
  instagramHandle String?
  prefillData   Json?
  userId        String?   // Set at Go Live
  leadId        String?   // Link to Soft Lead (auto-created)
  expiresAt     DateTime
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  lastActivityAt DateTime? // Track for abandonment detection
  
  @@index([status])
  @@index([expiresAt])
  @@index([lastActivityAt])
}
```

---

## Lead Schema Fields (ReflexEvent)

```prisma
// Lead is stored as ReflexEvent with type = "lead"
// Add to payload structure:
{
  "lead_status": "warm_draft" | "qualified" | "activated" | "converted" | "lost",
  "lead_type": "soft" | "hard",
  "setup_session_id": "string?",
  "source": "manychat" | "web" | "onboarding",
  "explicit_submission": boolean,
  "submitted_at": "ISO string?",
  "activated_at": "ISO string?",
  "converted_at": "ISO string?"
}
```

---

## Implementation Checklist

### SetupSession Auto-Creation
- [x] Auto-create SetupSession on LaunchPad entry
- [x] Generate `setup_link` automatically
- [x] Set `expires_at` to 7 days
- [x] Set `status = 'draft'`
- [x] Auto-create Soft Lead

### State Transitions
- [ ] Update status to `in_progress` when Step 1 completed
- [ ] Update status to `completed` when Step 6 reached
- [ ] Update status to `activated` when account created
- [ ] Check expiration on read operations
- [ ] Check abandonment (7 days no activity)

### Lead Auto-Creation
- [ ] Create Soft Lead when SetupSession created
- [ ] Link Lead to SetupSession via `setup_session_id`
- [ ] Convert Soft → Hard Lead on explicit submission
- [ ] Update Lead status on SetupSession transitions

### Manual Override
- [ ] Admin button to manually create SetupSession
- [ ] Admin button to manually create Lead
- [ ] Admin ability to change status (for edge cases)

---

## Edge Cases Handled

1. **User visits LaunchPad multiple times**
   - Check for existing draft session (by source + identifier)
   - Reuse if not expired, otherwise create new

2. **Session expires mid-flow**
   - Show "Session expired" message
   - Offer to create new session (prefill if possible)

3. **User abandons and returns**
   - Check `lastActivityAt`
   - If > 7 days, mark as `abandoned` but allow resume
   - Reset `expires_at` on resume

4. **Multiple Leads for same user**
   - Check for existing Soft Lead by identifier (ManyChat ID, IG handle, email)
   - Merge if found, otherwise create new

5. **Go Live without completing all steps**
   - Validate all steps complete before allowing Go Live
   - Show which steps are missing

---

## API Endpoints

### SetupSession
- `POST /api/launchpad/session` - Auto-create (or return existing)
- `GET /api/launchpad/session?token=xxx` - Load (check expiration)
- `PUT /api/launchpad/session?token=xxx` - Update progress (update status, extend expiration)
- `POST /api/launchpad/create-lounge` - Go Live (transition to activated)

### Lead
- Auto-created via SetupSession creation
- Updated via SetupSession transitions
- `POST /api/admin/leads/convert` - Manual conversion (admin only)

---

## Testing Scenarios

1. **Happy Path**
   - User visits LaunchPad → draft session created → Soft Lead created
   - User completes Step 1 → status = in_progress
   - User completes all steps → status = completed
   - User goes live → status = activated, Lead = qualified → activated

2. **Expiration**
   - User creates session → waits 8 days → tries to access → expired

3. **Abandonment**
   - User completes Step 1 → no activity for 8 days → status = abandoned
   - User returns → can resume, status = in_progress

4. **Multiple Sessions**
   - User visits via ManyChat → session created
   - User visits via web → new session created (different source)

5. **Manual Override**
   - Admin creates session manually → works as normal
   - Admin converts Lead manually → status updated
