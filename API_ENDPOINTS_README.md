# Hookah+ Admin Control Center API Documentation

## Overview
This document describes the API endpoints for the Hookah+ Admin Control Center, including the new MVP Agent Consensus System.

**Base URL**: `/api`
**Authentication**: Currently mock/development - implement proper auth for production

## Agent Consensus System

### GET `/api/agent-consensus`
**Purpose**: Get current agent consensus state and Reflex Score

**Query Parameters**:
- `action` (optional): Specific action to perform
  - `trigger-order`: Simulate an order to test agent system
  - `manual-pulse`: Send manual pulse to specific agent
- `customerId` (optional): Customer ID for order simulation
- `flavor` (optional): Flavor for order simulation  
- `amount` (optional): Amount for order simulation
- `agent` (optional): Agent ID for manual pulse
- `status` (optional): Status for manual pulse (green/amber/red)
- `message` (optional): Message for manual pulse

**Example Response**:
```json
{
  "success": true,
  "data": {
    "agents": {
      "aliethia": {
        "agentId": "aliethia",
        "status": "green",
        "message": "Flavor memory logs active",
        "timestamp": 1703123456789,
        "metadata": {
          "stabilityThreshold": "met",
          "qrCycles": 5
        }
      },
      "ep": {
        "agentId": "ep", 
        "status": "green",
        "message": "Order processed",
        "timestamp": 1703123456789,
        "metadata": {
          "orderConfirmed": true,
          "customerId": "test_customer"
        }
      },
      "navigator": {
        "agentId": "navigator",
        "status": "green", 
        "message": "Dashboard updated",
        "timestamp": 1703123456789,
        "metadata": {
          "seamlessAction": true,
          "orderId": "order_1703123456789"
        }
      },
      "sentinel": {
        "agentId": "sentinel",
        "status": "green",
        "message": "Order trust-locked",
        "timestamp": 1703123456789,
        "metadata": {
          "trustLockUptime": 95.5,
          "sessionKey": "order_1703123456789"
        }
      }
    },
    "consensus": true,
    "reflexScore": {
      "score": 78,
      "confirmedOrders": 5,
      "returningCustomers": 2,
      "anomalyFlags": 0,
      "trustLockUptime": 95.5,
      "lastUpdate": 1703123456789
    },
    "lastCycle": 1703123456789,
    "cycleCount": 12
  },
  "timestamp": "2023-12-21T10:30:56.789Z"
}
```

### POST `/api/agent-consensus`
**Purpose**: Trigger agent actions and send manual pulses

**Request Body**:
```json
{
  "action": "trigger-order|manual-pulse",
  "agent": "aliethia|ep|navigator|sentinel",
  "status": "green|amber|red",
  "message": "Custom message",
  "metadata": {
    "customerId": "customer_123",
    "flavor": "Mint Storm",
    "amount": 32
  }
}
```

**Example Responses**:

**Order Trigger**:
```json
{
  "success": true,
  "message": "Order triggered via POST",
  "data": {
    "customerId": "customer_123",
    "flavor": "Mint Storm", 
    "amount": 32
  },
  "timestamp": "2023-12-21T10:30:56.789Z"
}
```

**Manual Pulse**:
```json
{
  "success": true,
  "message": "Manual pulse sent to sentinel",
  "data": {
    "agent": "sentinel",
    "status": "green",
    "message": "Test validation",
    "metadata": { "test": true }
  },
  "timestamp": "2023-12-21T10:30:56.789Z"
}
```

## Existing API Endpoints

### GET `/api/admin/kpis`
**Purpose**: Get Key Performance Indicators for lounge operations

**Query Parameters**:
- `lounge`: Lounge identifier (e.g., "Pilot #001")
- `range`: Time range (e.g., "Last 7 days")

**Example Response**:
```json
{
  "success": true,
  "data": {
    "sessions": 182,
    "revenue": 5430,
    "avgMarginPct": 41.7,
    "trustScore": 83
  },
  "lounge": "Pilot #001",
  "range": "Last 7 days",
  "timestamp": "2023-12-21T10:30:56.789Z"
}
```

### GET `/api/orders`
**Purpose**: Get order data for profit margin analysis

**Query Parameters**:
- `lounge`: Lounge identifier
- `range`: Time range

**Example Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "m1",
      "item": "Mint Storm",
      "price": 32,
      "cost": 11,
      "sold": 58
    }
  ],
  "lounge": "Pilot #001",
  "range": "Last 7 days",
  "timestamp": "2023-12-21T10:30:56.789Z"
}
```

### GET `/api/reflex-monitoring`
**Purpose**: Get Reflex monitoring data and trust pulses

**Query Parameters**:
- `lounge`: Lounge identifier
- `range`: Time range

**Example Response**:
```json
{
  "success": true,
  "data": [
    {
      "t": "Mon",
      "score": 78
    }
  ],
  "lounge": "Pilot #001",
  "range": "Last 7 days",
  "timestamp": "2023-12-21T10:30:56.789Z"
}
```

### POST `/api/reflex/scan`
**Purpose**: Trigger Reflex agent scan

**Request Body**:
```json
{
  "lounge": "Pilot #001",
  "range": "Last 7 days"
}
```

### POST `/api/reflex/calibration/start`
**Purpose**: Start Reflex calibration process

**Request Body**:
```json
{
  "lounge": "Pilot #001"
}
```

### POST `/api/reflex/calibration/stop`
**Purpose**: Stop Reflex calibration process

**Request Body**:
```json
{
  "lounge": "Pilot #001"
}
```

### GET `/api/mvp/status`
**Purpose**: Get MVP readiness consensus score

**Query Parameters**:
- `env`: Environment (dev|staging|prod)

**Example Response**:
```json
{
  "success": true,
  "data": 78,
  "env": "staging",
  "timestamp": "2023-12-21T10:30:56.789Z"
}
```

### POST `/api/deploy`
**Purpose**: Trigger deployment to specified environment

**Request Body**:
```json
{
  "env": "staging"
}
```

### POST `/api/deploy/rollback`
**Purpose**: Trigger rollback for specified environment

**Request Body**:
```json
{
  "env": "staging"
}
```

### POST `/api/admin/dev`
**Purpose**: Start development environment

**Example Response**:
```json
{
  "success": true,
  "message": "Development environment started",
  "timestamp": "2023-12-21T10:30:56.789Z"
}
```

### POST `/api/admin/build`
**Purpose**: Build project for production

**Example Response**:
```json
{
  "success": true,
  "message": "Build completed successfully",
  "timestamp": "2023-12-21T10:30:56.789Z"
}
```

## Command Launcher Integration

The Command Launcher provides server-side automation for all API endpoints:

### Agent Consensus Commands
```bash
# Get agent status
cmd.execute("admin.agents.status")

# Trigger test order
cmd.execute("admin.agents.trigger-order", {
  customerId: "test_customer",
  flavor: "Mint Storm", 
  amount: 32
})

# Send manual pulse
cmd.execute("admin.agents.pulse", {
  agent: "sentinel",
  status: "green",
  message: "Test validation"
})

# Check consensus
cmd.execute("admin.agents.consensus")
```

### Standard Admin Commands
```bash
# Development
cmd.execute("admin.dev")
cmd.execute("admin.build")

# Reflex System
cmd.execute("admin.reflex.scan", { lounge: "Pilot #001" })
cmd.execute("admin.reflex.calibrate.start", { lounge: "Pilot #001" })

# Deployment
cmd.execute("admin.deploy", { env: "staging" })
cmd.execute("admin.rollback", { env: "staging" })

# Monitoring
cmd.execute("admin.mvp.status", { env: "staging" })
cmd.execute("admin.health")
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error description",
  "timestamp": "2023-12-21T10:30:56.789Z"
}
```

**Common HTTP Status Codes**:
- `200`: Success
- `400`: Bad Request (missing parameters)
- `500`: Internal Server Error

## Implementation Notes

### Mock Data
- All endpoints currently return mock data for development
- Mock data includes randomization for realistic testing
- Replace mock implementations with actual database queries

### Real-time Updates
- Agent Consensus system uses 5-second operational cycles
- Reflex Score updates automatically based on agent activities
- Consensus triggers when ≥3 agents issue green pulses

### Agent System Architecture
- **Aliethia**: Memory & Flavor Log Agent (dormant until stability threshold)
- **EP**: Economic Pathways Agent (payments & order processing)
- **Navigator**: Experience & Flow Agent (dashboard & UX)
- **Sentinel**: Security & Trust Agent (trust validation & anomaly detection)

## Related Files

- `lib/agentConsensus.ts` - Agent consensus system implementation
- `components/AgentConsensusDashboard.tsx` - Real-time dashboard component
- `lib/commandLauncher.ts` - Server-side command automation
- `app/admin/page.tsx` - Admin Control Center main page

## Development Status

✅ **Completed**:
- Agent Consensus System
- Real-time Reflex Score tracking
- 5-second operational cycles
- Manual agent pulse controls
- Test order simulation
- Command Launcher integration
- API endpoint stubs

🔄 **In Progress**:
- Production database integration
- Authentication & authorization
- WebSocket real-time updates

📋 **Planned**:
- Advanced anomaly detection
- Machine learning integration
- Multi-lounge scaling
- Audit logging system
