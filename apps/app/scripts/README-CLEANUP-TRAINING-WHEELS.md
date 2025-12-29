# Cleanup Training Wheels Script

This script helps manage training wheels visibility in the Fire Session Dashboard by controlling feature flags.

## Usage

```bash
# Check current status
npx tsx apps/app/scripts/cleanup-training-wheels.ts status

# Mark First Light as completed (hides First Light components)
npx tsx apps/app/scripts/cleanup-training-wheels.ts mark-first-light

# Enable metrics
npx tsx apps/app/scripts/cleanup-training-wheels.ts enable-metrics

# Activate Alpha Stability mode (removes all training wheels)
npx tsx apps/app/scripts/cleanup-training-wheels.ts activate-alpha

# Reset all flags (for testing/development)
npx tsx apps/app/scripts/cleanup-training-wheels.ts reset
```

## What Gets Hidden

### After First Light Completion
- ✅ First Light Banner
- ✅ First Light Health Card
- ✅ First Light Checklist
- ✅ "First Light Focus" toggle
- ✅ "Clear Old Sessions" button

### After Alpha Stability Activation
- ✅ All First Light components
- ✅ Alpha Stability celebration banners
- ✅ "Spark the Flywheel" card
- ✅ Test session button (dev only)

## Feature Flags

The script manages flags stored in `apps/app/.feature-flags.json`:

```json
{
  "firstLightCompleted": false,
  "firstLightFocus": false,
  "metricsEnabled": false,
  "alphaStabilityActive": false
}
```

## Integration

The dashboard automatically reads these flags via `apps/app/lib/feature-flags.ts`:

- Flags are stored in localStorage (client-side)
- Flags are synced across browser tabs
- Flags persist across page refreshes

## Manual Override

You can also manually set flags in the browser console:

```javascript
// Mark First Light complete
localStorage.setItem('firstLightCompleted', 'true');

// Enable metrics
localStorage.setItem('metricsEnabled', 'true');

// Activate Alpha Stability
localStorage.setItem('alphaStabilityMode', 'true');
localStorage.setItem('metricsEnabled', 'true');
localStorage.setItem('firstLightCompleted', 'true');

// Reset all
localStorage.removeItem('firstLightCompleted');
localStorage.removeItem('firstLightFocus');
localStorage.removeItem('metricsEnabled');
localStorage.removeItem('alphaStabilityMode');
```

## Notes

- Flags are client-side only (stored in localStorage)
- Flags persist across browser sessions
- Flags sync across tabs via `storage` event
- Production builds will respect these flags
- Demo mode (`?mode=demo`) overrides all flags

