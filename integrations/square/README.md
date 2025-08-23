# Square POS Integration

This module provides a Square POS adapter for Hookah+ session management.

## Setup

### 1. Obtain Square Access Token
- Go to [Square Developer Dashboard](https://developer.squareup.com/apps)
- Create a new application or use existing
- Generate an access token (sandbox for testing)
- Add to environment: `SQUARE_ACCESS_TOKEN=your_token_here`

### 2. Get Location ID
- Use Square API or Dashboard to find your location ID
- Add to environment: `SQUARE_LOCATION_ID=your_location_id`

## Usage

```typescript
import { SquareAdapter } from './squareAdapter';

const square = new SquareAdapter({
  accessToken: process.env.SQUARE_ACCESS_TOKEN!,
  locationId: process.env.SQUARE_LOCATION_ID!
});

// Start a session
const { posId } = await square.sessionStart({
  id: 'sess_123',
  table: 'T-1',
  lines: [
    { sku: 'hookah_session', name: 'Hookah Session', qty: 1, unitAmount: 3000 }
  ]
});
```

## Mapping Hookah+ to Square

### Line Items
- **Hookah Session** → Square Catalog Object (one-time)
- **Flavor Add-ons** → Square Catalog Object (one-time)
- **Coal Swaps** → Square Catalog Object (one-time)

### Tender Types
- Cash
- Credit Card
- Digital Wallet (Apple Pay, Google Pay)

## Error Handling

The adapter throws typed errors with this contract:
```typescript
{
  code: string;        // Error code (e.g., "INVALID_LOCATION")
  hint: string;        // User-friendly message
  retryable: boolean;  // Whether retry is recommended
}
```

## TODOs for Live Integration

- [ ] Implement Square SDK calls
- [ ] Add OAuth flow for merchant onboarding
- [ ] Handle webhook notifications
- [ ] Add retry logic with exponential backoff
- [ ] Implement proper error mapping
- [ ] Add logging and monitoring
- [ ] Handle Square API rate limits

## Testing

```bash
npm test
```

Tests verify the adapter interface and stub implementations.
