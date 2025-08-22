# 🔥 Enhanced Fire Session Workflow System

## Overview

The Enhanced Fire Session Workflow System is a comprehensive real-time workflow management solution for Hookah+ operations. It includes automatic demo cycles, refill management, coal burnout handling, and specialized dashboards for different staff roles.

## 🚀 New Features

### Refill Workflow
- **Automatic Refill Requests**: Demo mode automatically triggers refill requests every 30 seconds
- **Refill Types**: Support for flavor, water, or both refill types
- **Refill Delivery Tracking**: Front staff can mark refills as delivered
- **Refill Statistics**: Track refill frequency and patterns

### Coal Management
- **Coal Burnout Detection**: Demo mode automatically triggers coal replacement requests
- **Coal Type Support**: Quick light, natural, and coconut coal types
- **Coal Delivery Workflow**: Hookah room staff can respond to coal requests
- **Coal Burnout Statistics**: Monitor coal replacement frequency

### Demo Logic
- **30-Second Service Cycles**: Each service cycle runs for 30 seconds
- **15-Second Refill Periods**: Refill requests are active for 15 seconds
- **10-Second Coal Replacement**: Coal requests are active for 10 seconds
- **Automatic Cycling**: Seamlessly transitions between service → refill → coals → service

### Enhanced Dashboard Visibility
- **Ready for Delivery**: Shows in session cards for prep room visibility
- **Refill Requests**: Real-time refill request tracking
- **Coal Requests**: Live coal replacement status
- **Service Statistics**: Comprehensive service metrics

## 🏗️ Architecture

### Core Components

1. **FireSessionWorkflow** (`lib/fire-session-workflow.ts`)
   - Main workflow engine with state management
   - Event emission and subscription system
   - Demo timing logic and automatic cycles
   - Refill and coal stage management

2. **FireSessionWorkflow Component** (`components/FireSessionWorkflow.tsx`)
   - Interactive workflow interface
   - Role-based button visibility
   - Real-time status updates
   - Demo mode indicators

3. **FireSessionDashboard** (`components/FireSessionDashboard.tsx`)
   - Main dashboard for all staff
   - Session filtering and status overview
   - Service statistics and metrics
   - Recent events and issue tracking

4. **HookahRoomDashboard** (`components/HookahRoomDashboard.tsx`)
   - Specialized dashboard for hookah room staff
   - Refill request management
   - Coal delivery tracking
   - Ready for delivery visibility

5. **Demo Page** (`app/fire-session-demo/page.tsx`)
   - Interactive demonstration interface
   - Role switching and session creation
   - Real-time workflow testing
   - Dashboard visibility controls

## 🔄 Workflow States

### Core Statuses
- **`prep`**: Hookah preparation and assembly
- **`delivery`**: Front staff pickup and delivery
- **`service`**: Active customer session
- **`refill`**: Customer refill request active
- **`coals_needed`**: Coal replacement required
- **`recovery`**: Issue resolution in progress
- **`completed`**: Session finished
- **`cancelled`**: Session terminated

### New Button Types
- **`refill_requested`**: Customer requests refill
- **`refill_delivered`**: Front staff delivers refill
- **`coals_burned_out`**: Customer reports coal burnout
- **`coals_delivered`**: Hookah room staff delivers coals
- **`session_complete`**: End session

## 🎯 Demo Mode

### Automatic Cycle
1. **Service Phase** (30 seconds)
   - Session runs normally
   - Customer can request refills or report coal issues
   - Timer counts down automatically

2. **Refill Phase** (15 seconds)
   - Refill request automatically triggered
   - Front staff notified via dashboard
   - Customer can confirm refill delivery

3. **Coal Phase** (10 seconds)
   - Coal burnout automatically triggered
   - Hookah room staff notified
   - Coal delivery can be confirmed

4. **Return to Service** (30 seconds)
   - Cycle repeats automatically
   - Statistics updated in real-time

### Demo Controls
- **`startDemoCycle()`**: Initiates automatic cycling
- **`stopDemoTimers()`**: Stops all demo timers
- **`resumeDemoCycle()`**: Continues after interruption
- **`triggerRefillRequest()`**: Manual refill trigger
- **`triggerCoalBurnout()`**: Manual coal trigger

## 📊 Dashboard Features

### Main Dashboard
- **Status Filtering**: Filter by any session status
- **Quick Stats**: Total sessions, active sessions, refill rate, coal burnout rate
- **Session Cards**: Comprehensive session information
- **Service Statistics**: Refill counts, coal swaps, coal burnouts
- **Demo Mode Status**: Current cycle and phase information
- **Recent Events**: Live event stream
- **Frequent Issues**: Recovery sessions and overdue deliveries

### Hookah Room Dashboard
- **Ready for Delivery**: Sessions awaiting front staff pickup
- **Refill Requests**: Active refill requests with details
- **Coal Requests**: Coal replacement requests with delivery tracking
- **Staff Assignment**: Clear visibility of assigned staff
- **Action Buttons**: Direct workflow control
- **Real-time Updates**: Live status changes

## 🔌 API Endpoints

### Fire Session Management
```typescript
POST /api/fire-session
{
  "action": "create" | "press_button",
  "sessionId": "string",
  "tableId": "string",
  "flavorMix": "string",
  "prepStaffId": "string",
  "demoMode": boolean,
  "button": "WorkflowButton",
  "staffRole": "StaffRole",
  "staffId": "string",
  "metadata": {}
}
```

### Session Queries
```typescript
GET /api/fire-session?sessionId=string
GET /api/fire-session?status=SessionStatus
GET /api/fire-session?staff=StaffRole
GET /api/fire-session?metrics=true
```

## 🎨 UI Components

### Workflow Buttons
- **Role-based Visibility**: Buttons shown based on staff role
- **Status-dependent States**: Buttons enabled/disabled by session status
- **Visual Feedback**: Color-coded button variants
- **Progress Tracking**: Real-time workflow progress

### Progress Steps
- **Visual Indicators**: Clear progress visualization
- **Status Highlighting**: Active step emphasis
- **Completion Tracking**: Step-by-step progress
- **Error States**: Recovery and issue handling

### Session Cards
- **Comprehensive Information**: All relevant session data
- **Status Icons**: Visual status representation
- **Service Statistics**: Real-time metrics
- **Demo Mode Indicators**: Clear demo status

## 🔐 Security & Access Control

### Role-based Access
- **Prep Room Staff**: Prep workflow buttons only
- **Front Staff**: Delivery and service buttons
- **Customer**: Refill and coal request buttons
- **Hookah Room Staff**: Coal delivery buttons

### Session Isolation
- **Staff Assignment**: Clear responsibility tracking
- **Button Validation**: Role-based button permissions
- **Event Logging**: Complete audit trail
- **Metadata Tracking**: Rich context information

## 📈 Analytics & Metrics

### Key Metrics
- **Refill Rate**: Percentage of sessions requiring refills
- **Coal Burnout Rate**: Percentage of sessions needing coal replacement
- **Service Efficiency**: Average service cycle time
- **Recovery Rate**: Sessions requiring intervention

### Event Tracking
- **Button Presses**: Complete workflow interaction log
- **State Transitions**: Status change tracking
- **Timing Data**: Performance metrics
- **Issue Patterns**: Problem identification

## 🚀 Quick Start

### 1. Create Demo Session
```typescript
// Create a new demo session
const response = await fetch('/api/fire-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'create',
    tableId: 'T-1',
    flavorMix: 'Blue Mist + Mint',
    prepStaffId: 'staff-001',
    demoMode: true
  })
});
```

### 2. Subscribe to Events
```typescript
// Subscribe to workflow events
fireSessionWorkflow.subscribeToAgentEvents((event) => {
  console.log('Workflow event:', event);
});

// Subscribe to specific events
fireSessionWorkflow.subscribeToReadyForDelivery((data) => {
  console.log('Ready for delivery:', data);
});

fireSessionWorkflow.subscribeToRefillRequests((data) => {
  console.log('Refill requested:', data);
});

fireSessionWorkflow.subscribeToCoalRequests((data) => {
  console.log('Coals needed:', data);
});
```

### 3. Monitor Dashboard
```typescript
// Get session metrics
const metrics = fireSessionWorkflow.getSessionMetrics();

// Get sessions by status
const refillSessions = fireSessionWorkflow.getRefillRequests();
const coalSessions = fireSessionWorkflow.getCoalRequests();
const readySessions = fireSessionWorkflow.getReadyForDeliverySessions();
```

## 🔧 Configuration

### Environment Variables
```bash
# Demo mode settings
DEMO_MODE_ENABLED=true
DEMO_SERVICE_CYCLE=30000      # 30 seconds
DEMO_REFILL_CYCLE=15000      # 15 seconds
DEMO_COAL_CYCLE=10000        # 10 seconds

# Workflow settings
MAX_SESSION_DURATION=120     # 2 hours
AUTO_CLEANUP_INTERVAL=300000 # 5 minutes
```

### Customization
- **Timing Cycles**: Adjust demo cycle durations
- **Button Labels**: Customize button text and descriptions
- **Status Colors**: Modify visual status indicators
- **Dashboard Layout**: Rearrange dashboard components

## 🧪 Testing

### Demo Mode Testing
1. Create a demo session with `demoMode: true`
2. Watch automatic cycling through service phases
3. Test manual button presses during different phases
4. Verify dashboard updates in real-time

### Manual Testing
1. Create a regular session with `demoMode: false`
2. Test each workflow button manually
3. Verify state transitions and event emissions
4. Check dashboard synchronization

### Integration Testing
1. Test API endpoints with various payloads
2. Verify event subscription and emission
3. Test role-based access control
4. Validate error handling and recovery

## 📚 API Reference

### FireSessionWorkflow Class

#### Core Methods
- **`createSession()`**: Create new workflow session
- **`pressButton()`**: Process workflow button press
- **`getSession()`**: Retrieve session by ID
- **`getAllSessions()`**: Get all active sessions

#### Demo Methods
- **`startDemoCycle()`**: Begin automatic demo cycling
- **`stopDemoTimers()`**: Stop all demo timers
- **`triggerRefillRequest()`**: Manually trigger refill
- **`triggerCoalBurnout()`**: Manually trigger coal burnout

#### Query Methods
- **`getSessionsByStatus()`**: Filter by session status
- **`getSessionsByStaff()`**: Filter by staff member
- **`getReadyForDeliverySessions()`**: Get delivery-ready sessions
- **`getRefillRequests()`**: Get active refill requests
- **`getCoalRequests()`**: Get active coal requests

#### Event Methods
- **`subscribeToAgentEvents()`**: Subscribe to all workflow events
- **`subscribeToReadyForDelivery()`**: Subscribe to delivery events
- **`subscribeToRefillRequests()`**: Subscribe to refill events
- **`subscribeToCoalRequests()`**: Subscribe to coal events

#### Metrics Methods
- **`getSessionMetrics()`**: Get comprehensive metrics
- **`getEventHistory()`**: Get workflow event history
- **`destroy()`**: Clean up resources

### Event Types

#### WorkflowEvent
```typescript
interface WorkflowEvent {
  sessionId: string;
  buttonPressed: WorkflowButton;
  staffRole: StaffRole;
  staffId: string;
  timestamp: Date;
  previousStatus: SessionStatus;
  newStatus: SessionStatus;
  metadata?: Record<string, any>;
}
```

#### SessionState
```typescript
interface SessionState {
  sessionId: string;
  tableId: string;
  flavorMix: string;
  currentStatus: SessionStatus;
  prepStage: PrepStage;
  deliveryStage: DeliveryStage;
  serviceStage: ServiceStage;
  refillStage: RefillStage;
  coalStage: CoalStage;
  recoveryStage?: RecoveryStage;
  staffAssigned: StaffAssignment;
  sessionTimer?: SessionTimer;
  demoMode: boolean;
  cycleTimer?: NodeJS.Timeout;
  refillTimer?: NodeJS.Timeout;
  coalTimer?: NodeJS.Timeout;
}
```

## 🚨 Troubleshooting

### Common Issues

#### Demo Mode Not Cycling
- Check if `demoMode: true` was set during session creation
- Verify timers are not being cleared prematurely
- Check console for timer-related errors

#### Dashboard Not Updating
- Ensure event subscriptions are active
- Verify API endpoints are responding
- Check for JavaScript errors in console

#### Button Presses Not Working
- Verify staff role matches button permissions
- Check session status allows button press
- Ensure API endpoint is accessible

### Debug Mode
```typescript
// Enable debug logging
fireSessionWorkflow.setDebugMode(true);

// Check session state
console.log('Session state:', fireSessionWorkflow.getSession(sessionId));

// Monitor events
fireSessionWorkflow.subscribeToAgentEvents((event) => {
  console.log('Debug event:', event);
});
```

## 🔮 Future Enhancements

### Planned Features
- **Multi-location Support**: Branch and location management
- **Advanced Analytics**: Predictive analytics and insights
- **Mobile App**: Native mobile workflow interface
- **Integration APIs**: Third-party system integration
- **AI Assistance**: Intelligent workflow suggestions

### Extension Points
- **Custom Button Types**: Add new workflow actions
- **Custom Status Types**: Define new session states
- **Custom Event Types**: Create specialized events
- **Custom Dashboard Views**: Build role-specific dashboards

## 📞 Support

For technical support or feature requests:
- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs or request features
- **Contributions**: Submit pull requests for improvements
- **Questions**: Reach out to the development team

---

**Version**: 2.0.0  
**Last Updated**: December 2024  
**Compatibility**: Next.js 13+, React 18+, TypeScript 5+
