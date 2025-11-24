# Supabase Client Singleton Fix

## Problem
Multiple `GoTrueClient` instances were being created in the same browser context, causing:
- Console warnings: "Multiple GoTrueClient instances detected"
- Potential authentication state issues
- Magic link redirect problems

## Root Cause
Each component was creating its own Supabase client instance:
- `apps/app/app/admin/login/page.tsx`
- `apps/app/components/GlobalNavigation.tsx`
- `apps/app/components/SecureRoleSelector.tsx`
- `apps/app/app/login/page.tsx`
- `apps/app/app/signup/page.tsx`

## Solution
Implemented a **singleton pattern** for client-side Supabase clients in `apps/app/lib/supabase.ts`:

```typescript
let clientInstance: ReturnType<typeof createClient> | null = null;

export function clientClient() {
  if (typeof window === 'undefined') {
    // Server-side: return a new instance
    return createClient(...);
  }

  // Client-side: use singleton pattern
  if (!clientInstance) {
    clientInstance = createClient(...);
  }

  return clientInstance;
}
```

## Files Updated
1. ✅ `apps/app/lib/supabase.ts` - Added singleton `clientClient()` function
2. ✅ `apps/app/app/admin/login/page.tsx` - Now uses `clientClient()`
3. ✅ `apps/app/components/GlobalNavigation.tsx` - Now uses `clientClient()`
4. ✅ `apps/app/components/SecureRoleSelector.tsx` - Now uses `clientClient()`
5. ✅ `apps/app/app/login/page.tsx` - Now uses `clientClient()`
6. ✅ `apps/app/app/signup/page.tsx` - Now uses `clientClient()`

## Benefits
- ✅ Single Supabase client instance per browser context
- ✅ No more "Multiple GoTrueClient instances" warnings
- ✅ Consistent authentication state across components
- ✅ Better performance (shared connection pool)
- ✅ Proper session persistence

## Testing
After restarting the dev server:
1. Open browser console
2. Navigate to `/admin/login`
3. Verify no "Multiple GoTrueClient instances" warnings appear
4. Test magic link authentication - should work correctly

## Note
Server-side components continue to use `createServerClient` from `@supabase/ssr`, which is correct for server-side rendering and API routes.

