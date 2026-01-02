# H+ LaunchPad Implementation Guide

**Quick reference for implementing LaunchPad based on PRD**

---

## File Structure

```
apps/app/
├── app/
│   ├── launchpad/
│   │   ├── page.tsx                    # Main LaunchPad container
│   │   ├── components/
│   │   │   ├── ProgressIndicator.tsx  # Step progress bar
│   │   │   ├── VenueSnapshotStep.tsx   # Step 1
│   │   │   ├── FlavorsMixesStep.tsx    # Step 2
│   │   │   ├── SessionRulesStep.tsx    # Step 3
│   │   │   ├── StaffRolesStep.tsx      # Step 4
│   │   │   ├── POSBridgeStep.tsx       # Step 5
│   │   │   └── GoLiveStep.tsx          # Step 6
│   │   └── api/
│   │       ├── session/route.ts        # SetupSession CRUD
│   │       ├── progress/route.ts       # Save/load progress
│   │       ├── create-lounge/route.ts  # Create lounge at Go Live
│   │       └── generate-assets/route.ts # QR codes, playbook
│   ├── dashboard/
│   │   └── components/
│   │       └── WeekOneWinsCard.tsx     # Week-1 Wins dashboard card
│   └── api/
│       ├── lounges/
│       │   └── [loungeId]/
│       │       └── week-one-wins/route.ts # Week-1 Wins metrics
│       └── week-one-wins/
│           └── [loungeId]/route.ts      # Alternative endpoint
├── lib/
│   ├── launchpad/
│   │   ├── session-manager.ts          # Anonymous session logic
│   │   ├── progress-persistence.ts     # Save/load progress
│   │   ├── config-generator.ts         # Generate LoungeOps config
│   │   ├── qr-generator.ts             # QR code generation
│   │   └── playbook-generator.ts       # Staff playbook PDF
│   └── week-one-wins/
│       ├── metrics.ts                  # Calculate metrics
│       └── tracker.ts                  # Track events
└── types/
    └── launchpad.ts                    # TypeScript types
```

---

## Database Schema Extensions

### SetupSession Table

```prisma
model SetupSession {
  id        String   @id @default(uuid())
  token     String   @unique
  progress  Json     // LaunchPadProgress type
  loungeId  String?  @unique
  createdAt DateTime @default(now())
  expiresAt DateTime
  userId    String?  // Set at Go Live
  
  lounge    Lounge?  @relation(fields: [loungeId], references: [id])
  user      User?    @relation(fields: [userId], references: [id])
  
  @@index([token])
  @@index([expiresAt])
}
```

### Lounge Model Extensions

```prisma
model Lounge {
  // ... existing fields ...
  
  setupSessionId String?  @unique
  launchpadMode  String   @default("preview") // "preview" | "live"
  activatedAt    DateTime?
  weekOneWinsStartedAt DateTime?
  
  setupSession SetupSession? @relation(fields: [setupSessionId], references: [id])
}
```

---

## Key Implementation Patterns

### 1. Anonymous Session Management

**File:** `lib/launchpad/session-manager.ts`

```typescript
export async function createSetupSession(): Promise<string> {
  // Generate token
  // Create SetupSession record
  // Return token
}

export async function loadSetupSession(token: string): Promise<LaunchPadProgress | null> {
  // Load from database
  // Check expiration
  // Return progress
}

export async function saveProgress(
  token: string,
  step: number,
  data: Partial<LaunchPadProgress['data']>
): Promise<void> {
  // Update SetupSession.progress
  // Update expiresAt
}
```

### 2. Progress Persistence

**File:** `lib/launchpad/progress-persistence.ts`

```typescript
// Client-side (localStorage)
export function saveProgressLocal(progress: LaunchPadProgress): void {
  localStorage.setItem('launchpad_progress', JSON.stringify(progress));
}

export function loadProgressLocal(): LaunchPadProgress | null {
  const stored = localStorage.getItem('launchpad_progress');
  return stored ? JSON.parse(stored) : null;
}

// Server-side sync
export async function syncProgressToServer(
  token: string,
  progress: LaunchPadProgress
): Promise<void> {
  await fetch('/api/launchpad/progress', {
    method: 'POST',
    body: JSON.stringify({ token, progress })
  });
}
```

### 3. Config Generation

**File:** `lib/launchpad/config-generator.ts`

```typescript
export function generateLoungeOpsConfig(
  progress: LaunchPadProgress
): LoungeOpsConfig {
  return {
    lounge_name: progress.data.step1.loungeName,
    slug: slugify(progress.data.step1.loungeName),
    session_type: progress.data.step3.sessionType,
    base_session_price: progress.data.step1.basePrice,
    grace_period_minutes: progress.data.step3.gracePeriod,
    extension_policy: progress.data.step3.extensions,
    comp_policy_enabled: progress.data.step3.compPolicy,
    flavors: {
      standard: progress.data.step2.topFlavors.filter(f => !f.premium),
      premium: progress.data.step2.topFlavors.filter(f => f.premium)
    },
    staff: progress.data.step4.staff.map(s => ({
      email: s.email,
      role: s.role
    })),
    pos_bridge: {
      pos_type: progress.data.step5.posType,
      integration_guide_url: generateGuideUrl(progress.data.step5.posType)
    }
  };
}
```

### 4. Week-1 Wins Metrics

**File:** `lib/week-one-wins/metrics.ts`

```typescript
export async function calculateWeekOneWins(loungeId: string): Promise<WeekOneWins> {
  const startDate = await getWeekOneStartDate(loungeId);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 7);
  
  const sessions = await prisma.session.findMany({
    where: {
      loungeId,
      createdAt: { gte: startDate, lte: endDate }
    }
  });
  
  return {
    compedSessionsAvoided: calculateCompedAvoided(sessions),
    addOnsCaptured: calculateAddOns(sessions),
    repeatGuestsRecognized: calculateRepeatGuests(sessions),
    timeSavedPerShift: calculateTimeSaved(sessions)
  };
}

function calculateCompedAvoided(sessions: Session[]): number {
  return sessions.filter(s => 
    s.compRequested === true && 
    s.compApproved === false
  ).length;
}

function calculateAddOns(sessions: Session[]): number {
  return sessions.reduce((count, s) => {
    const premiumFlavors = s.selectedFlavors?.filter(f => f.premium) || [];
    return count + premiumFlavors.length;
  }, 0);
}

function calculateRepeatGuests(sessions: Session[]): number {
  return sessions.filter(s => s.guestMemoryHit === true).length;
}
```

---

## API Endpoints

### POST /api/launchpad/session

**Purpose:** Create new anonymous setup session

**Request:**
```json
{}
```

**Response:**
```json
{
  "token": "uuid-token",
  "expiresAt": "2025-01-XX..."
}
```

### GET /api/launchpad/session?token=xxx

**Purpose:** Load existing session

**Response:**
```json
{
  "progress": { ... },
  "expiresAt": "..."
}
```

### POST /api/launchpad/progress

**Purpose:** Save progress

**Request:**
```json
{
  "token": "uuid-token",
  "step": 3,
  "data": { ... }
}
```

### POST /api/launchpad/create-lounge

**Purpose:** Create lounge at Go Live

**Request:**
```json
{
  "token": "uuid-token",
  "email": "owner@example.com",
  "phone": "+1234567890",
  "password": "..." // or magic link
}
```

**Response:**
```json
{
  "loungeId": "uuid",
  "userId": "uuid",
  "mode": "preview" | "live",
  "assets": {
    "qrCodes": [...],
    "playbookUrl": "...",
    "configUrl": "..."
  }
}
```

### GET /api/lounges/[loungeId]/week-one-wins

**Purpose:** Get Week-1 Wins metrics

**Response:**
```json
{
  "daysActive": 3,
  "compedSessionsAvoided": 5,
  "addOnsCaptured": 12,
  "repeatGuestsRecognized": 8,
  "timeSavedPerShift": 15, // minutes
  "totalWins": 25
}
```

---

## Component Structure

### Main LaunchPad Page

```typescript
// app/launchpad/page.tsx
export default function LaunchPadPage() {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState<LaunchPadProgress | null>(null);
  
  // Load or create session
  useEffect(() => {
    loadOrCreateSession();
  }, []);
  
  // Save progress after each step
  const handleStepComplete = async (step: number, data: any) => {
    // Update progress
    // Save to localStorage
    // Sync to server
  };
  
  return (
    <div>
      <ProgressIndicator currentStep={currentStep} totalSteps={6} />
      {currentStep === 1 && <VenueSnapshotStep onComplete={...} />}
      {currentStep === 2 && <FlavorsMixesStep onComplete={...} />}
      // ... etc
    </div>
  );
}
```

### Step Component Pattern

```typescript
// app/launchpad/components/VenueSnapshotStep.tsx
interface VenueSnapshotStepProps {
  initialData?: VenueSnapshotData;
  onComplete: (data: VenueSnapshotData) => void;
  onBack?: () => void;
}

export function VenueSnapshotStep({ initialData, onComplete, onBack }: Props) {
  const [formData, setFormData] = useState(initialData || {});
  
  const handleSubmit = () => {
    // Validate
    // Call onComplete
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit">Continue →</button>
    </form>
  );
}
```

---

## Integration Points

### Existing Systems to Leverage

1. **Lounge Config API**
   - `apps/app/app/api/lounges/[loungeId]/config/route.ts`
   - Use for reading/writing lounge config

2. **Pricing Engine**
   - `apps/app/lib/pricing.ts`
   - Use for pricing calculations

3. **QR Generator**
   - Existing QR generation logic
   - Extend for LaunchPad use case

4. **Session Extension**
   - `apps/app/app/api/sessions/[id]/extend/route.ts`
   - Use session rules from LaunchPad

5. **Staff Roles**
   - Existing Prisma User model
   - Use for staff role assignment

### New Systems Needed

1. **SetupSession Management**
   - New Prisma model
   - CRUD operations

2. **Progress Persistence**
   - localStorage + server sync
   - Resume capability

3. **Config Generator**
   - YAML/JSON output
   - Database record creation

4. **Week-1 Wins Tracker**
   - Metrics calculation
   - Dashboard integration

---

## Testing Checklist

### Unit Tests

- [ ] Session token generation
- [ ] Progress persistence (localStorage + server)
- [ ] Config generation (YAML/JSON)
- [ ] Week-1 Wins metrics calculation
- [ ] QR code generation

### Integration Tests

- [ ] Complete LaunchPad flow (all 6 steps)
- [ ] Account creation at Go Live
- [ ] Preview → Live transition
- [ ] Week-1 Wins tracking
- [ ] Resume from saved progress

### E2E Tests

- [ ] Anonymous user completes LaunchPad
- [ ] User creates account at Go Live
- [ ] User subscribes and activates lounge
- [ ] Week-1 Wins card appears on dashboard
- [ ] QR codes are functional

---

## Deployment Considerations

### Environment Variables

```env
# LaunchPad
LAUNCHPAD_SESSION_EXPIRY_DAYS=7
LAUNCHPAD_PREVIEW_MODE_ENABLED=true

# Week-1 Wins
WEEK_ONE_WINS_ENABLED=true
WEEK_ONE_WINS_TRACKING_START_OFFSET=0 # days
```

### Feature Flags

```typescript
// Enable/disable LaunchPad
const LAUNCHPAD_ENABLED = process.env.LAUNCHPAD_ENABLED === 'true';

// Enable/disable Week-1 Wins
const WEEK_ONE_WINS_ENABLED = process.env.WEEK_ONE_WINS_ENABLED === 'true';
```

---

## Performance Targets

- **Step completion:** <2s save time
- **Config generation:** <5s
- **QR code generation:** <3s per code
- **Week-1 Wins calculation:** <1s
- **Page load:** <2s

---

## Security Considerations

1. **Session Token Security**
   - Use cryptographically secure random tokens
   - Expire tokens after 7 days
   - Validate tokens on all requests

2. **Account Creation**
   - Email verification required
   - Password strength requirements
   - Rate limiting on account creation

3. **Data Privacy**
   - Clear progress data on expiration
   - Allow users to delete setup sessions
   - GDPR compliance for EU users

---

**Last Updated:** 2025-01-XX  
**Status:** Implementation Ready

