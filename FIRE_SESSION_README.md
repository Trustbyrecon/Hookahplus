# Fire Session State Machine

A complete state machine implementation for managing hookah lounge sessions from payment to completion, with real-time updates and role-based access control.

## 🚀 Quick Start

1. **Navigate to the dashboard**: `/fire-session-dashboard`
2. **Test the state machine**: `/test-fire-session`
3. **Admin control center**: `/admin-control`
4. **Use the API directly**: `/api/sessions/[id]/command`

## 🏗️ Architecture

### Core Components

- **`lib/sessionState.ts`** - State machine logic, types, and transitions
- **`lib/eventBus.ts`** - In-memory pub/sub (replace with Pusher/Supabase later)
- **`lib/cmd.ts`** - Client helper functions for sending commands
- **`app/api/sessions/[id]/command/route.ts`** - Command dispatch endpoint
- **`components/BOHPrepRoom.tsx`** - Back of House prep room interface
- **`components/FOHFloorDashboard.tsx`** - Front of House floor management
- **`app/fire-session-dashboard/page.tsx`** - Main dashboard with FOH/BOH toggle
- **`app/admin-control/page.tsx`** - Admin control center with live reports

### Session States

```
NEW → PAID_CONFIRMED → PREP_IN_PROGRESS → HEAT_UP → READY_FOR_DELIVERY → OUT_FOR_DELIVERY → DELIVERED → ACTIVE → CLOSE_PENDING → CLOSED
```

### Available Commands

| Command | Actor | From State | To State | Description |
|---------|-------|------------|----------|-------------|
| `PAYMENT_CONFIRMED` | system | NEW | PAID_CONFIRMED | Payment received |
| `CLAIM_PREP` | boh | PAID_CONFIRMED | PREP_IN_PROGRESS | BOH claims prep work |
| `HEAT_UP` | boh | PREP_IN_PROGRESS | HEAT_UP | Start heating hookah |
| `READY_FOR_DELIVERY` | boh | HEAT_UP | READY_FOR_DELIVERY | Hookah ready for delivery |
| `DELIVER_NOW` | foh | READY_FOR_DELIVERY | OUT_FOR_DELIVERY | FOH starts delivery |
| `MARK_DELIVERED` | foh | OUT_FOR_DELIVERY | DELIVERED | Hookah delivered to table |
| `START_ACTIVE` | foh | DELIVERED | ACTIVE | Customer session begins |
| `CLOSE_SESSION` | foh | ACTIVE | CLOSE_PENDING | Session ending |
| `REMAKE` | foh/boh | Multiple | PREP_IN_PROGRESS | Remake hookah |
| `STAFF_HOLD` | foh/boh | Multiple | STAFF_HOLD | Pause for staff action |

## 🎯 Usage Examples

### 1. Basic Session Flow

```typescript
import { sessionCommands } from "@/lib/cmd";

// Complete BOH workflow
await sessionCommands.claimPrep("sess_123");
await sessionCommands.heatUp("sess_123");
await sessionCommands.readyForDelivery("sess_123");

// Complete FOH workflow
await sessionCommands.deliverNow("sess_123");
await sessionCommands.markDelivered("sess_123");
await sessionCommands.startActive("sess_123");
```

### 2. API Commands

```bash
# Seed a demo session
curl -X POST /api/sessions/sess_demo/command \
  -H "Content-Type: application/json" \
  -d '{"cmd":"PAYMENT_CONFIRMED"}'

# BOH workflow
curl -X POST /api/sessions/sess_demo/command \
  -H "Content-Type: application/json" \
  -d '{"cmd":"CLAIM_PREP","actor":"boh"}'

curl -X POST /api/sessions/sess_demo/command \
  -H "Content-Type: application/json" \
  -d '{"cmd":"HEAT_UP","actor":"boh"}'

# FOH workflow
curl -X POST /api/sessions/sess_demo/command \
  -H "Content-Type: application/json" \
  -d '{"cmd":"DELIVER_NOW","actor":"foh"}'
```

### 3. React Component Integration

```tsx
import { sessionCommands } from "@/lib/cmd";

function SessionControls({ sessionId }: { sessionId: string }) {
  const handleReadyForDelivery = async () => {
    try {
      const result = await sessionCommands.readyForDelivery(sessionId);
      if (result.ok) {
        console.log("Session ready for delivery");
      }
    } catch (error) {
      console.error("Command failed:", error);
    }
  };

  return (
    <button onClick={handleReadyForDelivery}>
      Ready for Delivery
    </button>
  );
}
```

## 🔧 Customization

### Adding New States

1. Add to `SessionState` type in `lib/sessionState.ts`
2. Update transition map in `allowed` object
3. Add state-specific logic in the reducer

### Adding New Commands

1. Add to `Command` type
2. Update transition map
3. Add side effects in reducer if needed
4. Update UI components to show new buttons

### Custom Validation

Modify the `verifyTrustLock` function to add business rules:

```typescript
function verifyTrustLock(session: Session, cmd: Command, data?: any) {
  // Example: Require manager approval for refunds
  if (cmd === "REFUND_REQUEST" && session.meta.amount > 100) {
    return { ok: false, reason: "Manager approval required for refunds over $100" };
  }
  
  return { ok: true };
}
```

## 📊 Monitoring & Analytics

### Event Subscription

```typescript
import { subscribe } from "@/lib/eventBus";

// Subscribe to all session events
subscribe("sessions.floor", (payload) => {
  console.log("Floor event:", payload);
  // Update analytics, send notifications, etc.
});

// Subscribe to specific session
subscribe("sessions.sess_123", (payload) => {
  console.log("Session event:", payload);
});
```

### Session Queries

```typescript
import { getAllSessions, getSessionsByState, getSessionsByTable } from "@/lib/sessionState";

// Get all active sessions
const activeSessions = getSessionsByState("ACTIVE");

// Get sessions by table
const tableSessions = getSessionsByTable("T-12");

// Get all sessions
const allSessions = getAllSessions();
```

## 🚀 Next Steps

### Live Data Management

The system now operates with live data and no time restrictions:

- **Real-time sessions**: All sessions are live and accessible
- **No historical windows**: Data is persistent and available
- **Admin control center**: Comprehensive live reporting and analytics
- **Demo data seeding**: Easy generation of test data for development

### Database Integration

Replace the in-memory store with a real database:

```typescript
// lib/sessionState.ts
import { db } from "@/lib/db";

export async function getSession(id: string) {
  return await db.sessions.findUnique({ where: { id } });
}

export async function putSession(s: Session) {
  return await db.sessions.upsert({
    where: { id: s.id },
    update: s,
    create: s
  });
}
```

### Real-time Updates

Replace the event bus with Pusher or Supabase Realtime:

```typescript
// lib/eventBus.ts
import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!
});

export function publishSessionEvent(sessionId: string, payload: any) {
  pusher.trigger(`sessions.${sessionId}`, "session.updated", payload);
  pusher.trigger("sessions.floor", "session.updated", payload);
}
```

### SLA Monitoring

Add automatic timers and alerts:

```typescript
// lib/sessionState.ts
function startSLATimers(session: Session) {
  if (session.state === "HEAT_UP") {
    // Alert if heating takes too long
    setTimeout(() => {
      if (session.state === "HEAT_UP") {
        publish("sessions.alerts", { 
          type: "HEAT_UP_TIMEOUT", 
          sessionId: session.id 
        });
      }
    }, 5 * 60 * 1000); // 5 minutes
  }
}
```

## 🧪 Testing

### Manual Testing

1. Navigate to `/test-fire-session`
2. Use the interactive buttons to test all transitions
3. Verify state changes and audit trail

### API Testing

```bash
# Test complete workflow
./scripts/test-fire-session.sh
```

### Unit Testing

```bash
npm test lib/sessionState.test.ts
npm test lib/cmd.test.ts
```

## 📱 Mobile Support

The dashboard components are responsive and work on mobile devices. Key features:

- Touch-friendly buttons
- Responsive grid layouts
- Mobile-optimized navigation
- Swipe gestures for session selection

## 🔒 Security

- **TrustLock validation** for sensitive operations
- **Actor role verification** for command execution
- **Idempotency keys** to prevent duplicate commands
- **Audit trail** for all state changes

## 📈 Performance

- **In-memory store** for fast access (replace with DB)
- **Efficient state transitions** with O(1) lookup
- **Minimal re-renders** with React state management
- **Debounced updates** to prevent excessive API calls

## 🆘 Troubleshooting

### Common Issues

1. **Invalid transition error**: Check if command is allowed in current state
2. **Missing session**: Use seed function or check session ID
3. **Command not working**: Verify actor role and current state
4. **UI not updating**: Check event bus subscription and refresh logic

### Debug Mode

Enable debug logging:

```typescript
// lib/sessionState.ts
const DEBUG = process.env.NODE_ENV === "development";

export function reduce(session: Session, cmd: Command, actor: ActorRole, data: any = {}) {
  if (DEBUG) {
    console.log(`[DEBUG] ${actor} executing ${cmd} on ${session.id}`);
    console.log(`[DEBUG] State: ${session.state} → ?`);
  }
  // ... rest of function
}
```

## 🤝 Contributing

1. Follow the existing code structure
2. Add tests for new features
3. Update documentation
4. Test on both desktop and mobile

## 📄 License

This implementation is part of the HookahPlus project.
