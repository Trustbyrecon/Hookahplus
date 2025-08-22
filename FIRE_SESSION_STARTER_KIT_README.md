# Fire Session State Machine Starter Kit

A complete, working state machine for managing hookah sessions in a Next.js App Router application. This starter kit provides a solid foundation that you can immediately use and later enhance with database persistence, real-time updates, and advanced features.

## 🚀 What You Get

- **Complete State Machine**: 20 session states with validated transitions
- **Type-Safe API**: Full TypeScript support with strict typing
- **In-Memory Store**: Ready to swap with your preferred database
- **Event Bus**: Simple pub/sub that can be replaced with Pusher/Supabase
- **TrustLock Guards**: Framework for implementing business rule validation
- **FOH/BOH UI**: Ready-to-use dashboard with role-based controls
- **API Endpoints**: RESTful commands for all session operations

## 📁 File Structure

```
lib/
├── sessionState.ts      # Core state machine, types, reducer
├── eventBus.ts          # Minimal pub/sub event system
└── cmd.ts              # Client helper functions

app/api/sessions/
├── route.ts            # List/create sessions
└── [id]/command/
    └── route.ts        # Execute session commands

components/
└── FireSessionDashboard.tsx  # Complete UI dashboard

app/fire-session-demo/
└── page.tsx            # Demo page
```

## 🔥 Session States

The system manages sessions through these states:

```
NEW → PAID_CONFIRMED → PREP_IN_PROGRESS → HEAT_UP → READY_FOR_DELIVERY → OUT_FOR_DELIVERY → DELIVERED → ACTIVE → CLOSE_PENDING → CLOSED
```

**Special States:**
- `STAFF_HOLD` - Pause for any reason
- `STOCK_BLOCKED` - Wait for inventory
- `REMAKE` - Return to prep
- `REFUND_REQUESTED` → `REFUNDED`
- `FAILED_PAYMENT` → `VOIDED`

## 🎮 Commands

### BOH (Back of House)
- `CLAIM_PREP` - Staff claims preparation
- `HEAT_UP` - Start heating process
- `READY_FOR_DELIVERY` - Prep complete, ready for FOH

### FOH (Front of House)
- `DELIVER_NOW` - Start delivery
- `MARK_DELIVERED` - Confirm delivery
- `START_ACTIVE` - Begin active service
- `MOVE_TABLE` - Relocate customer
- `CLOSE_SESSION` - End session

### System
- `PAYMENT_CONFIRMED` - Payment successful
- `PAYMENT_FAILED` - Payment failed
- `VOID` - Cancel session
- `REFUND_REQUEST` / `REFUND_COMPLETE`

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
# or
yarn install
```

### 2. Start Development Server

```bash
npm run dev
# or
yarn dev
```

### 3. Visit Demo Dashboard

Navigate to `/fire-session-demo` to see the complete system in action.

### 4. Test with API

```bash
# Create a new session
curl -X POST http://localhost:3000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"table": "T-15"}'

# Execute commands
curl -X POST http://localhost:3000/api/sessions/sess_demo/command \
  -H "Content-Type: application/json" \
  -d '{"cmd": "PAYMENT_CONFIRMED", "actor": "system"}'

curl -X POST http://localhost:3000/api/sessions/sess_demo/command \
  -H "Content-Type: application/json" \
  -d '{"cmd": "CLAIM_PREP", "actor": "boh"}'
```

## 🎯 Usage Examples

### In React Components

```tsx
import { sessionCommands } from '@/lib/cmd';

// BOH staff claims prep
<button onClick={() => sessionCommands.claimPrep(sessionId, "boh")}>
  Claim Prep
</button>

// FOH staff delivers
<button onClick={() => sessionCommands.deliverNow(sessionId, "foh")}>
  Deliver Now
</button>

// System confirms payment
<button onClick={() => sessionCommands.confirmPayment(sessionId, "pi_123")}>
  Confirm Payment
</button>
```

### Programmatic Usage

```tsx
import { sendCmd } from '@/lib/cmd';

// Custom command with data
await sendCmd(sessionId, "MOVE_TABLE", { table: "T-20" }, "foh");

// Get session details
const session = await getSession(sessionId);

// List all sessions
const allSessions = await getAllSessions();
const prepSessions = await getAllSessions({ state: "PREP_IN_PROGRESS" });
```

## 🔧 Customization

### Add New States

```tsx
// In lib/sessionState.ts
export type SessionState = 
  | "NEW"
  | "CUSTOM_STATE"  // Add your state
  | "PAID_CONFIRMED";

// Add to transition map
const allowed: Record<SessionState, Partial<Record<Command, SessionState>>> = {
  NEW: {
    CUSTOM_COMMAND: "CUSTOM_STATE",  // Add transition
    PAYMENT_CONFIRMED: "PAID_CONFIRMED",
  },
  CUSTOM_STATE: {
    // Define what commands are allowed from this state
  },
  // ... rest of states
};
```

### Add New Commands

```tsx
export type Command = 
  | "CLAIM_PREP"
  | "CUSTOM_COMMAND"  // Add your command
  | "HEAT_UP";

// Add to transition map
// Add side effects in reducer function
// Update TrustLock validation if needed
```

### Custom Business Rules

```tsx
// In lib/sessionState.ts, modify verifyTrustLock function
function verifyTrustLock(session: Session, cmd: Command, data?: any) {
  // Your custom validation logic
  if (session.flags.vip && cmd === "VOID") {
    return { ok: false, reason: "VIP sessions cannot be voided" };
  }
  
  // Add dual-ack requirements
  if (cmd === "MOVE_TABLE" && session.payment.status === "confirmed") {
    // Require manager approval
    return { ok: false, reason: "Manager approval required for table moves" };
  }
  
  return { ok: true };
}
```

## 🗄️ Database Integration

### Replace In-Memory Store

```tsx
// In lib/sessionState.ts, replace the Map with your database calls
import { db } from '@/lib/database';

export async function getSession(id: string) {
  return await db.sessions.findUnique({ where: { id } });
}

export async function putSession(s: Session) {
  return await db.sessions.upsert({
    where: { id: s.id },
    update: s,
    create: s,
  });
}
```

### Real-Time Updates

```tsx
// Replace eventBus with Pusher/Supabase
import { pusher } from '@/lib/pusher';

export function publish(topic: string, payload: any) {
  pusher.trigger('fire-sessions', topic, payload);
}
```

## 📊 Monitoring & Analytics

### Add Metrics Collection

```tsx
// In the API route, add analytics
import { analytics } from '@/lib/analytics';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  // ... existing code ...
  
  try {
    const s1 = reduce(structuredClone(s0), cmd, actor, data);
    putSession(s1);
    
    // Track key transitions
    if (s0.state !== s1.state) {
      analytics.track('session_state_changed', {
        sessionId: s1.id,
        from: s0.state,
        to: s1.state,
        command: cmd,
        actor,
        duration: s1.timers.heatUpStart ? Date.now() - s1.timers.heatUpStart : null,
      });
    }
    
    // ... rest of code ...
  }
}
```

### SLA Monitoring

```tsx
// Add timer-based monitoring
setInterval(async () => {
  const sessions = getAllSessions();
  
  for (const session of sessions) {
    if (session.state === "HEAT_UP" && session.timers.heatUpStart) {
      const elapsed = Date.now() - session.timers.heatUpStart;
      const maxHeatTime = 5 * 60 * 1000; // 5 minutes
      
      if (elapsed > maxHeatTime) {
        // Alert staff about overdue heat-up
        publish(`sessions.${session.id}`, {
          type: "sla_violation",
          message: "Heat-up time exceeded SLA",
          sessionId: session.id,
          elapsed,
        });
      }
    }
  }
}, 30000); // Check every 30 seconds
```

## 🧪 Testing

### Unit Tests

```tsx
// tests/sessionState.test.ts
import { reduce, seedSession } from '@/lib/sessionState';

describe('Session State Machine', () => {
  test('should transition from NEW to PAID_CONFIRMED', () => {
    const session = seedSession('test_123', 'T-1');
    const updated = reduce(session, 'PAYMENT_CONFIRMED', 'system');
    expect(updated.state).toBe('PAID_CONFIRMED');
  });
  
  test('should reject invalid transitions', () => {
    const session = seedSession('test_123', 'T-1');
    expect(() => {
      reduce(session, 'CLAIM_PREP', 'boh');
    }).toThrow('Invalid transition from NEW via CLAIM_PREP');
  });
});
```

### Integration Tests

```tsx
// tests/api.test.ts
import { createMocks } from 'node-mocks-http';
import { POST } from '@/app/api/sessions/[id]/command/route';

describe('/api/sessions/[id]/command', () => {
  test('should execute valid command', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { cmd: 'PAYMENT_CONFIRMED', actor: 'system' },
    });
    
    await POST(req, { params: { id: 'sess_demo' } });
    
    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.new_state).toBe('PAID_CONFIRMED');
  });
});
```

## 🚀 Production Deployment

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=your_database_url
PUSHER_APP_ID=your_pusher_app_id
PUSHER_KEY=your_pusher_key
PUSHER_SECRET=your_pusher_secret
```

### Performance Considerations

- **Database Indexing**: Index on `state`, `table`, `createdAt`
- **Caching**: Redis for frequently accessed sessions
- **Connection Pooling**: For database connections
- **Rate Limiting**: On command endpoints
- **Idempotency**: Already implemented with idempotency keys

### Security

- **Authentication**: Add JWT/session validation
- **Authorization**: Role-based access control
- **Input Validation**: Sanitize all inputs
- **Audit Logging**: All changes are already logged
- **Rate Limiting**: Prevent abuse

## 🔮 Future Enhancements

### Easy to Add

- **Multi-location Support**: Add `loungeId` to all operations
- **Staff Management**: Track who performed each action
- **Inventory Integration**: Link sessions to stock levels
- **Customer Profiles**: Associate sessions with customers
- **Loyalty Points**: Track and award points per session

### Advanced Features

- **AI Predictions**: Predict session duration, refill needs
- **Dynamic Pricing**: Adjust based on demand, time
- **Staff Scheduling**: Optimize based on session volume
- **Quality Metrics**: Track customer satisfaction
- **Predictive Maintenance**: Monitor equipment health

## 📞 Support

This starter kit is designed to be self-contained and well-documented. If you need help:

1. Check the code comments for implementation details
2. Review the TypeScript types for API contracts
3. Use the demo dashboard to understand the flow
4. Test with the provided API examples

## 📄 License

This starter kit is provided as-is for educational and development purposes. Feel free to modify and use in your projects.

---

**Ready to build amazing hookah session management? Start with this kit and scale up! 🚀**
