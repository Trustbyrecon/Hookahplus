# Network Profiles & HID Resolver Setup

This document describes the Hookah+ Network Identity Layer implementation.

## Environment Variables

Add the following to your `.env.local` file:

```env
# HID Resolver Configuration
# Salt for hashing PII (phone/email) - CHANGE IN PRODUCTION!
HID_SALT=your-secret-salt-here-change-in-production
```

**Important:** 
- Use a strong, random salt in production
- Never commit the actual salt value to version control
- Rotate the salt periodically for security

## Database Migration

After adding the network profile models to the Prisma schema, run:

```bash
cd apps/app
npx prisma migrate dev --name add_network_profiles_and_hid
```

This will create:
- `network_profiles` - Network-wide customer profiles
- `network_preferences` - Customer flavor and device preferences
- `network_badges` - Network and lounge-scoped badges
- `network_sessions` - Network session history
- `network_session_notes` - Network-shareable session notes
- `network_pii_links` - PII hash mappings for HID resolution

## Migration Script

To migrate existing data:

```bash
npx tsx scripts/migrate-to-network-profiles.ts
```

This will:
1. Migrate existing `LoyaltyProfile` data to `NetworkProfile`
2. Sync existing sessions to network profiles
3. Migrate network-scoped session notes

## API Endpoints

### HID Resolver

**POST** `/api/hid/resolve`
```json
{
  "phone": "+1234567890",
  "email": "customer@example.com",
  "qrToken": "optional-qr-token",
  "deviceId": "optional-device-id"
}
```

Response:
```json
{
  "hid": "HID-ABC123...",
  "status": "new" | "existing" | "merged",
  "profile": { ... }
}
```

**GET** `/api/hid/resolve?hid=HID-ABC123&scope=network`

### Network Profiles

**GET** `/api/profiles/{hid}?loungeId=LOUNGE-001&scope=network`

Returns network profile with preferences, badges, and notes.

## Usage Examples

### Resolving HID from Phone

```typescript
import { resolveHID } from '@/lib/hid/resolver';

const result = await resolveHID({ phone: '+1234567890' });
console.log(result.hid); // "HID-ABC123..."
```

### Syncing Session to Network

```typescript
import { syncSessionToNetwork } from '@/lib/profiles/network';

await syncSessionToNetwork(
  sessionId,
  hid,
  loungeId,
  items,
  spendCents,
  posRef
);
```

### Creating Network-Scoped Note

```typescript
// POST /api/session/notes
{
  "session_id": "session-id",
  "note": "Customer prefers double apple",
  "share_scope": "network",
  "customer_phone": "+1234567890",
  "created_by": "staff-001"
}
```

## Architecture

```
Customer (Phone/Email/QR)
    ↓
HID Resolver (lib/hid/resolver.ts)
    ↓
NetworkProfile (hid: "HID-ABC123...")
    ↓
Network Services:
  - NetworkSession (cross-lounge history)
  - NetworkSessionNote (shareable notes)
  - NetworkBadge (network-wide badges)
  - NetworkPreference (flavor preferences)
```

## Privacy & Security

- **PII Hashing**: Phone/email are hashed with SHA256 + salt before storage
- **Consent Levels**: 
  - `shadow` - Unclaimed profile (default)
  - `claimed` - Customer verified identity
  - `network_shared` - Explicit network sharing consent
- **Share Scope**: Notes can be `lounge` (private) or `network` (portable)

## Next Steps

1. Run database migration
2. Set `HID_SALT` environment variable
3. Run migration script for existing data
4. Test HID resolution API
5. Integrate into POS sync flows
6. Update UI to show network profiles

