# H+ LaunchPad Quick Start

**TL;DR for implementing LaunchPad**

---

## What is LaunchPad?

Self-serve onboarding that takes a lounge from zero to live in 25-35 minutes.

**Key Decisions (Locked):**
- ✅ Anonymous start → account at Go Live
- ✅ Free to complete → subscription to activate
- ✅ Static POS guide → real-time integration later
- ✅ Week-1 Wins embedded in dashboard

---

## File Structure (Create These)

```
apps/app/app/launchpad/
├── page.tsx                    # Main container
├── components/
│   ├── ProgressIndicator.tsx
│   ├── VenueSnapshotStep.tsx   # Step 1 (3 min)
│   ├── FlavorsMixesStep.tsx    # Step 2 (7 min)
│   ├── SessionRulesStep.tsx   # Step 3 (5 min)
│   ├── StaffRolesStep.tsx     # Step 4 (5 min)
│   ├── POSBridgeStep.tsx       # Step 5 (5 min)
│   └── GoLiveStep.tsx          # Step 6 (instant)
└── api/
    ├── session/route.ts        # SetupSession CRUD
    ├── progress/route.ts      # Save/load progress
    └── create-lounge/route.ts  # Go Live endpoint
```

---

## Database Changes (Add These)

```prisma
model SetupSession {
  id        String   @id @default(uuid())
  token     String   @unique
  progress  Json
  loungeId  String?  @unique
  createdAt DateTime @default(now())
  expiresAt DateTime
  userId    String?
  
  lounge    Lounge?  @relation(fields: [loungeId], references: [id])
  user      User?    @relation(fields: [userId], references: [id])
}

// Add to Lounge model:
model Lounge {
  // ... existing fields ...
  setupSessionId String?  @unique
  launchpadMode  String   @default("preview") // "preview" | "live"
  activatedAt    DateTime?
  weekOneWinsStartedAt DateTime?
}
```

---

## Implementation Order

### Phase 1: Core Flow (Week 1)
1. Create `/launchpad` route
2. Build anonymous session management
3. Implement Step 1 (Venue Snapshot)
4. Add progress persistence (localStorage + server)
5. Build Steps 2-6 incrementally

### Phase 2: Asset Generation (Week 2)
1. Generate LoungeOps Config (YAML/JSON)
2. Generate QR codes
3. Generate Staff Playbook
4. Implement preview mode

### Phase 3: Week-1 Wins (Week 3)
1. Build metrics calculation
2. Create dashboard card
3. Create detail view
4. Add real-time updates

### Phase 4: Activation (Week 4)
1. Integrate subscription check
2. Implement preview → live transition
3. Test end-to-end flow

---

## Key Code Patterns

### Anonymous Session

```typescript
// On first visit
const token = await createSetupSession();
localStorage.setItem('launchpad_token', token);

// Save progress
await saveProgress(token, step, data);
```

### Account Creation at Go Live

```typescript
// Step 6: Go Live
const { email, password } = formData;
const result = await createAccountAndLounge(token, { email, password });
// Returns: { loungeId, userId, mode: 'preview' | 'live' }
```

### Week-1 Wins Metrics

```typescript
// Calculate metrics
const wins = await calculateWeekOneWins(loungeId);
// Returns: { compedSessionsAvoided, addOnsCaptured, ... }

// Display on dashboard
<WeekOneWinsCard wins={wins} />
```

---

## Acceptance Criteria Checklist

### Step 1: Venue Snapshot
- [ ] All fields required
- [ ] Progress saved after completion
- [ ] Can go back and edit

### Step 2: Flavors & Mixes
- [ ] Autocomplete works
- [ ] Premium flavors marked
- [ ] Minimum 3 flavors required

### Step 3: Session Rules
- [ ] All rules saved to config
- [ ] Preview shows impact

### Step 4: Staff & Roles
- [ ] Email validation
- [ ] At least one Owner
- [ ] Shift handoff enabled by default

### Step 5: POS Bridge
- [ ] Guide generated
- [ ] Mapping checklist downloadable

### Step 6: Go Live
- [ ] Account created
- [ ] QR codes generated
- [ ] Playbook generated
- [ ] Redirect to dashboard

### Week-1 Wins
- [ ] Card visible on dashboard
- [ ] Metrics calculated correctly
- [ ] Updates in real-time

---

## Testing Priorities

1. **E2E Flow:** Complete all 6 steps → account creation → activation
2. **Progress Persistence:** Save → close browser → resume
3. **Preview Mode:** Complete LaunchPad → view assets → subscribe → activate
4. **Week-1 Wins:** Create sessions → verify metrics

---

## Success Metrics

- **Completion Rate:** >60%
- **Time to Complete:** <35 minutes (median)
- **Preview → Live Conversion:** >40%
- **Week-1 Wins Engagement:** >70%

---

## Documentation

- **Full PRD:** `H_PLUS_LAUNCHPAD_PRD.md`
- **Implementation Guide:** `H_PLUS_LAUNCHPAD_IMPLEMENTATION.md`
- **This Quick Start:** `H_PLUS_LAUNCHPAD_QUICK_START.md`

---

**Ready to build? Start with Phase 1, Step 1.**

