# Badges V1 DB Upgrade

This implementation adds a database-backed badge system with role-based access control, audit logging, and data portability features.

## Features

- **Dual Storage**: In-memory (demo) and PostgreSQL (production) modes
- **Role-Based Access Control**: Guest, Staff, and Admin roles with proper permissions
- **Audit Logging**: Cross-venue operation tracking and comprehensive audit trails
- **Data Export**: Self-service and admin-created export tokens for data portability
- **Badge Engine**: Configurable badge rules with progress tracking

## Architecture

### Core Components

1. **Prisma Schema** (`prisma/schema.prisma`)
   - `Badge`: Badge definitions with rules and scope
   - `Award`: Individual badge awards to profiles
   - `Event`: User activity events (check-ins, visits, orders)

2. **Storage Layer**
   - `badgeStores.ts`: In-memory implementation for demo
   - `badgeStores.db.ts`: PostgreSQL implementation via Prisma
   - `badgeStores.switch.ts`: Environment-based store selection

3. **API Layer**
   - `/api/events`: Event creation (staff/admin only)
   - `/api/badges`: Badge retrieval with venue filtering
   - `/api/badges/export`: Data export with token support
   - `/api/export-token`: Admin token creation

4. **Security & Audit**
   - `auth.ts`: Role-based access control
   - `audit.ts`: Cross-venue operation logging
   - `badgeEngine.ts`: Badge evaluation and progress tracking

## Setup

### 1. Install Dependencies

```bash
pnpm add -w @prisma/client
pnpm add -Dw prisma ts-node
```

### 2. Environment Configuration

Create `.env.local` from `.env.local.example`:

```bash
# Badges V1 Configuration
BADGES_V1=true
BADGES_V1_USE_DB=false

# Postgres (enable DB mode by setting BADGES_V1_USE_DB=true)
DATABASE_URL="postgresql://user:pass@localhost:5432/hookahplus?schema=public"

# Authentication & Authorization
AUTH_MODE=demo
```

### 3. Database Setup (Optional)

For production with PostgreSQL:

```bash
# Generate Prisma client
pnpm dlx prisma generate

# Create and run migration
pnpm dlx prisma migrate dev --name badges_v1

# Seed badges from config/badges.json
pnpm dlx prisma db seed
```

### 4. Switch to DB Mode

Set `BADGES_V1_USE_DB=true` in your environment and restart the server.

## API Usage

### Authentication Headers

```bash
# Staff role
x-role: staff
x-actor-id: staff_123
x-venue-id: venue_001

# Admin role
x-role: admin
x-actor-id: admin_456

# Guest role (default)
x-role: guest
x-actor-id: guest_789
```

### Event Creation

```bash
POST /api/events
Content-Type: application/json
x-role: staff
x-actor-id: staff_123
x-venue-id: venue_001

{
  "type": "check_in",
  "profileId": "guest_789",
  "venueId": "venue_001",
  "staffId": "staff_123"
}
```

### Badge Retrieval

```bash
GET /api/badges?profileId=guest_789&venueId=venue_001
x-role: staff
x-actor-id: staff_123
x-venue-id: venue_001
```

### Data Export

#### Direct Export (Admin)
```bash
GET /api/badges/export?profileId=guest_789
x-role: admin
x-actor-id: admin_456
```

#### Token-Based Export
```bash
# Create export token (Admin only)
POST /api/export-token
Content-Type: application/json
x-role: admin
x-actor-id: admin_456

{
  "profileId": "guest_789",
  "expiresInHours": 24
}

# Use token for export
GET /api/badges/export?profileId=guest_789&token=exp_1234567890_abcdef
```

## Badge Configuration

Badges are defined in `config/badges.json`:

```json
[
  {
    "id": "EXPLORER",
    "label": "Explorer",
    "scope": "network",
    "rule": {
      "type": "venue_count",
      "threshold": 3,
      "description": "Visit 3 or more different venues"
    },
    "active": true
  }
]
```

### Supported Rule Types

- `venue_count`: Number of unique venues visited
- `unique_combos`: Number of unique flavor combinations ordered
- `venue_visits`: Number of visits to a specific venue
- `check_ins`: Number of check-ins

## Role Permissions

| Action | Guest | Staff | Admin |
|--------|-------|-------|-------|
| View own badges | ✅ | ✅ | ✅ |
| View other profiles | ❌ | ✅ | ✅ |
| Create events | ❌ | ✅ | ✅ |
| Cross-venue access | ❌ | ❌ | ✅ |
| Export own data | ✅ | ✅ | ✅ |
| Export other data | ❌ | ❌ | ✅ |
| Create export tokens | ❌ | ❌ | ✅ |

## Audit Logging

All operations are logged with:
- Actor information (role, ID, venue)
- Target profile/venue
- Operation details
- Timestamp and request metadata
- Cross-venue operation warnings

## Security Considerations

1. **PII Protection**: Only non-PII demo fields are logged
2. **Token Expiration**: Export tokens expire after 24 hours (configurable)
3. **Venue Isolation**: Staff can only access their assigned venue
4. **Audit Trail**: All cross-venue operations are logged and warned

## Migration Notes

- **Uniqueness**: Prisma can't enforce "one award per (profile,badge,venue)" with NULL semantics
- **Deduplication**: Handled in application code via `alreadyAwarded()` check
- **Fallback**: System gracefully falls back to in-memory mode if DB unavailable

## Testing

1. Start with in-memory mode (`BADGES_V1_USE_DB=false`)
2. Test badge awarding via `/api/events`
3. Verify role-based access controls
4. Test export functionality
5. Switch to DB mode and repeat tests

## Production Deployment

1. Set up PostgreSQL database
2. Configure `DATABASE_URL`
3. Run migrations and seed data
4. Set `BADGES_V1_USE_DB=true`
5. Monitor audit logs for cross-venue operations
6. Implement proper authentication (replace demo headers)
