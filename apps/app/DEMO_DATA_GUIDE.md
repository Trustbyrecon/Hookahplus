# Demo Data Configuration Guide

## Overview

The app now uses a **hybrid demo data approach** that provides different behavior based on environment:

- **Development Mode**: Silent fallback to demo data (no error messages)
- **Production/Load Testing**: Requires real database connection (shows errors if DB fails)

## Environment Variables

### `NEXT_PUBLIC_USE_DEMO_MODE`

Controls whether demo data fallback is enabled.

**Values:**
- `true` - Enable demo data fallback (development only)
- `false` or unset - Require real database (production/load testing)

### `NODE_ENV`

Automatically set by Next.js:
- `development` - Development mode
- `production` - Production mode

## Configuration Examples

### Development (with demo data fallback)

```env
NODE_ENV=development
NEXT_PUBLIC_USE_DEMO_MODE=true
DATABASE_URL=postgresql://... # Optional for dev
```

**Behavior:**
- If database connection fails → silently loads demo data
- No error messages shown to user
- Perfect for UI development without database

### Production / Load Testing (require real data)

```env
NODE_ENV=production
NEXT_PUBLIC_USE_DEMO_MODE=false
DATABASE_URL=postgresql://... # Required
```

**Behavior:**
- If database connection fails → shows error message
- Empty state displayed (no demo data)
- Forces proper database setup

### Development (test real database)

```env
NODE_ENV=development
NEXT_PUBLIC_USE_DEMO_MODE=false
DATABASE_URL=postgresql://... # Required
```

**Behavior:**
- Same as production - requires real database
- Useful for testing database connections in dev

## Quick Access Dropdown Z-Index Fix

The Quick Access dropdown now has proper z-index (`z-[9999]`) to appear above all page content, including the Fire Session Dashboard hero section.

## Implementation Details

The hybrid approach is implemented in `apps/app/hooks/useLiveSessionData.ts`:

1. **Checks environment variables** on module load
2. **On API failure:**
   - Dev + Demo Mode: Silent fallback to demo data
   - Production/No Demo Mode: Shows error, empty state
3. **On empty results:**
   - Dev + Demo Mode: Loads demo data
   - Production/No Demo Mode: Shows empty state

## Testing

### Test Development Mode with Demo Data

```bash
cd apps/app
NEXT_PUBLIC_USE_DEMO_MODE=true npm run dev
```

### Test Production Mode (Require Real DB)

```bash
cd apps/app
NEXT_PUBLIC_USE_DEMO_MODE=false NODE_ENV=production npm run build
npm start
```

### Test Load Testing Setup

1. Set `NEXT_PUBLIC_USE_DEMO_MODE=false`
2. Ensure `DATABASE_URL` is correctly configured
3. Run load tests - any DB failures will show errors (not demo data)

## Migration Notes

- **Existing Development**: Add `NEXT_PUBLIC_USE_DEMO_MODE=true` to `.env.local` for silent demo data
- **Production Deployments**: Ensure `NEXT_PUBLIC_USE_DEMO_MODE=false` or unset
- **Load Testing**: Must have `NEXT_PUBLIC_USE_DEMO_MODE=false` to test real database performance

