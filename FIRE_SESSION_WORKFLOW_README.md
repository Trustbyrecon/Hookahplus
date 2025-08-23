# 🔥 Hookah+ Fire Session Workflow System

This document describes the comprehensive workflow system for managing hookah sessions from prep room to customer delivery, designed with **agent-friendly button language** and **real-time cursor event streaming**.

## 🏗️ **Architecture Overview**

The system implements a **state machine workflow** that handles the handoff between:
- **Prep Room Staff** (hookah assembly, flavor mixing, preparation)
- **Front Staff** (delivery, customer service, monitoring)
- **Customers** (order confirmation, feedback)

Each button press creates a **cursor event** that agents can subscribe to for real-time synchronization and automation.

## 🔑 **Core Workflow Button Language**

### **Prep Room → Front Staff Handoff**
```
Prep Started → Flavor Locked → Timer Armed → Ready for Delivery
```

1. **Prep Started** - signals staff that hookah is in assembly
2. **Flavor Locked** - confirms chosen flavor/mix is final and logged
3. **Session Timer Armed** - back staff sets session start (not yet delivered)
4. **Ready for Delivery** - triggers notification to front staff

### **Front Staff → Delivery/Customer Handoff**
```
Picked Up → Delivered → Customer Confirmed
```

1. **Picked Up** - floor staff acknowledges taking hookah from prep
2. **Delivered** - hookah placed at table, session officially started
3. **Customer Confirmed** - optional button if customer verifies order

### **⚠️ Edge Case Buttons (Rescue & Recovery)**
```
Hold | Redo/Remix | Swap Charcoal | Cancel | Return to Prep
```

- **Hold** - prep paused (e.g., customer changes mind or delay)
- **Redo/Remix** - flavor or equipment error requires remake
- **Swap Charcoal** - mid-session service handoff
- **Cancel** - order dropped before delivery
- **Return to Prep** - hookah sent back after delivery issue

## 🔄 **Cursor / Agent Event System**

### **Event Structure**
Each button press emits a `WorkflowEvent` with:

```typescript
interface WorkflowEvent {
  sessionId: string;           // Unique session identifier
  staffRole: StaffRole;        // 'prep' | 'front' | 'customer'
  timestamp: Date;             // When the button was pressed
  statusTag: SessionStatus;    // Current workflow status
  buttonPressed: WorkflowButton; // Which button was pressed
  metadata?: Record<string, any>; // Additional context (reason, duration, etc.)
  previousState?: SessionState;    // State before button press
  newState: SessionState;         // State after button press
}
```

### **Event Subscription**
Agents can subscribe to events for real-time updates:

```typescript
// Subscribe to cursor events
const unsubscribe = fireSessionWorkflow.subscribeToCursorEvents((event) => {
  console.log('Cursor event:', event);
  // Handle real-time updates
});

// Subscribe to agent events
const unsubscribe = fireSessionWorkflow.subscribeToAgentEvents((event) => {
  console.log('Agent event:', event);
  // Handle agent-specific logic
});
```

## 📱 **User Interface Components**

### **1. FireSessionWorkflow Component**
Main workflow interface with role-based button access:

```tsx
<FireSessionWorkflow
  sessionId="session_001"
  staffRole="prep"
  staffId="staff_001"
  onEvent={(event) => console.log('Event:', event)}
/>
```

### **2. FireSessionDashboard Component**
Real-time dashboard for staff monitoring:

```tsx
<FireSessionDashboard
  staffRole="prep"
  staffId="staff_001"
/>
```

### **3. Demo Page**
Interactive demonstration at `/fire-session-demo`

## 🚀 **Quick Start**

### **1. Create a Session**
```typescript
import { fireSessionWorkflow } from '../lib/fire-session-workflow';

const session = fireSessionWorkflow.createSession(
  'session_001',           // Unique session ID
  'T-001',                 // Table ID
  'Blue Mist + Mint',      // Flavor mix
  'staff_001'              // Prep staff ID
);
```

### **2. Press Workflow Buttons**
```typescript
// Prep staff starts assembly
const event = fireSessionWorkflow.pressButton(
  'session_001',
  'prep_started',
  'prep',
  'staff_001'
);

// Front staff picks up hookah
const event = fireSessionWorkflow.pressButton(
  'session_001',
  'picked_up',
  'front',
  'staff_002'
);
```

### **3. Subscribe to Events**
```typescript
// Real-time dashboard updates
fireSessionWorkflow.subscribeToAgentEvents((event) => {
  if (event.sessionId === 'session_001') {
    updateDashboard(event.newState);
  }
});
```

## 📊 **State Management & Queries**

### **Session States**
- `prep` - Preparation phase
- `delivery` - Ready for pickup
- `service` - Active session
- `recovery` - Issue resolution
- `completed` - Session finished
- `cancelled` - Order dropped

### **Query Methods**
```typescript
// Get specific session
const session = fireSessionWorkflow.getSession('session_001');

// Get sessions by status
const prepSessions = fireSessionWorkflow.getSessionsByStatus('prep');

// Get sessions by staff member
const staffSessions = fireSessionWorkflow.getSessionsByStaff('staff_001');

// Get event history
const events = fireSessionWorkflow.getEventHistory('session_001');
```

### **Analytics & Metrics**
```typescript
const metrics = fireSessionWorkflow.getSessionMetrics();
// Returns:
// - Total sessions count
// - Sessions by status
// - Average prep/delivery times
// - Recovery rate
// - Frequent issues analysis
```

## 🎯 **Agent Build Benefits**

### **1. No Hidden Logic**
- States map directly to button language
- Each button has clear, documented behavior
- No complex branching or conditional logic

### **2. Reduced Complexity**
- Edge cases stored as same event type
- Consistent event structure across all actions
- Predictable state transitions

### **3. Extensible Design**
- Add new buttons without breaking flow
- Easy to extend with new roles or workflows
- Maintains backward compatibility

### **4. Real-time Synchronization**
- Dashboards update automatically via event subscription
- Multi-user collaboration without refresh
- Instant visibility across all staff

## 🔧 **API Endpoints**

### **POST /api/fire-session**
Create sessions and press buttons:

```typescript
// Create session
POST /api/fire-session
{
  "action": "create",
  "sessionId": "session_001",
  "tableId": "T-001",
  "flavorMix": "Blue Mist + Mint",
  "prepStaffId": "staff_001"
}

// Press button
POST /api/fire-session
{
  "action": "press_button",
  "sessionId": "session_001",
  "button": "prep_started",
  "staffRole": "prep",
  "staffId": "staff_001",
  "metadata": { "reason": "Starting assembly" }
}
```

### **GET /api/fire-session**
Query session data:

```typescript
// Get specific session
GET /api/fire-session?sessionId=session_001

// Get sessions by staff
GET /api/fire-session?staffId=staff_001

// Get sessions by status
GET /api/fire-session?status=prep

// Get all sessions and metrics
GET /api/fire-session
```

## 📱 **User Flows**

### **Complete Session Flow**
```
1. Create Session → Prep Started → Flavor Locked → Timer Armed → Ready for Delivery
2. Picked Up → Delivered → Customer Confirmed
3. Session Active (monitor, swap charcoal as needed)
4. Session Complete
```

### **Recovery Flow**
```
1. Issue Detected → Hold/Redo/Return to Prep
2. Problem Resolved → Resume Normal Flow
3. Track Recovery Metrics
```

### **Edge Case Handling**
```
1. Customer Changes Mind → Hold → Cancel
2. Equipment Failure → Redo/Remix → Resume
3. Delivery Issue → Return to Prep → Remake
```

## 🔒 **Security & Validation**

### **Role-Based Access Control**
- Prep staff can only access prep buttons
- Front staff can only access delivery buttons
- Customer can only access confirmation buttons
- Edge case buttons available to all roles

### **State Validation**
- Buttons disabled based on current session state
- Invalid button presses rejected with clear error messages
- All state changes logged with audit trail

### **Rate Limiting**
- Button press throttling to prevent spam
- Session creation limits per staff member
- Event emission rate controls

## 📈 **Analytics & Insights**

### **Performance Metrics**
- **Prep Time**: Assembly start to ready for delivery
- **Delivery Time**: Ready to delivered
- **Recovery Rate**: Sessions requiring intervention
- **Staff Efficiency**: Sessions per staff member

### **Issue Pattern Analysis**
- Frequent redo/remix → Training opportunity
- High return rate → Quality control issue
- Long prep times → Process optimization needed

### **Real-time Monitoring**
- Live session status dashboard
- Staff workload distribution
- Bottleneck identification
- Quality metrics tracking

## 🚀 **Production Deployment**

### **Environment Setup**
```bash
# Required environment variables
NEXT_PUBLIC_SITE_URL=https://your-domain.com
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### **Database Considerations**
- Event history storage for long-term analytics
- Session state persistence across server restarts
- Staff authentication and role management
- Audit log compliance

### **Scaling Considerations**
- Event streaming for high-volume operations
- Redis/pub-sub for multi-server deployment
- Database optimization for large event histories
- Load balancing for multiple staff locations

## 🤝 **Integration Points**

### **Existing Systems**
- **Stripe Integration**: Session payment processing
- **POS Systems**: Table management and billing
- **Inventory Management**: Flavor and equipment tracking
- **Staff Management**: Authentication and role assignment

### **Future Extensions**
- **AI Recommendations**: Flavor suggestions based on patterns
- **Predictive Analytics**: Session duration forecasting
- **Customer Feedback**: Rating and review integration
- **Mobile Apps**: Staff and customer mobile interfaces

## 📚 **Related Files**

- `lib/fire-session-workflow.ts` - Core workflow engine
- `components/FireSessionWorkflow.tsx` - Workflow interface
- `components/FireSessionDashboard.tsx` - Dashboard component
- `app/api/fire-session/route.ts` - API endpoints
- `app/fire-session-demo/page.tsx` - Interactive demo

## 🎯 **Agent Usage Examples**

### **Monitoring Dashboard**
```typescript
// Subscribe to all events for real-time monitoring
fireSessionWorkflow.subscribeToAgentEvents((event) => {
  if (event.statusTag === 'recovery') {
    notifyManager(event);
  }
  if (event.buttonPressed === 'redo_remix') {
    trackQualityIssue(event);
  }
});
```

### **Automated Actions**
```typescript
// Auto-start timer when delivered
fireSessionWorkflow.subscribeToAgentEvents((event) => {
  if (event.buttonPressed === 'delivered') {
    startSessionTimer(event.sessionId);
  }
});
```

### **Analytics Collection**
```typescript
// Collect metrics for reporting
setInterval(() => {
  const metrics = fireSessionWorkflow.getSessionMetrics();
  sendToAnalytics(metrics);
}, 60000); // Every minute
```

---

**Note**: This system is designed to be **agent-friendly** and **Cursor-compatible**. The button language creates a clear, unambiguous workflow that both human staff and AI agents can follow without guesswork. Each event provides complete context for automation and monitoring.
