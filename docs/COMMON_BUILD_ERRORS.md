# Common Build Errors & Solutions

This document catalogs common build errors encountered in the Hookah+ monorepo and their solutions.

## TypeScript Errors

### Error: Parameter implicitly has an 'any' type

**Error Message:**
```
Type error: Parameter 'word' implicitly has an 'any' type.
```

**Solution:**
Add explicit type annotation to the parameter:
```typescript
// ❌ Before
.map(word => word.charAt(0).toUpperCase() + word.slice(1))

// ✅ After
.map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
```

**Prevention:**
- Enable TypeScript strict mode in `tsconfig.json`
- Use type annotations for all function parameters
- Consider using ESLint rule `@typescript-eslint/no-explicit-any`

---

### Error: Property does not exist on type

**Error Message:**
```
Type error: Property 'state' does not exist on type 'FireSession'.
```

**Solution:**
Add the missing property to the interface:
```typescript
// In apps/app/types/enhancedSession.ts
export interface FireSession {
  // ... existing properties
  state?: string | null; // Raw database state value
}
```

**Prevention:**
- Keep TypeScript interfaces in sync with actual data structures
- Use type guards when accessing optional properties
- Document optional vs required properties

---

### Error: Cannot find name

**Error Message:**
```
Type error: Cannot find name 'GlobalNavigation'.
```

**Solution:**
- Check if component is imported correctly
- Verify component is exported from the source file
- If component was moved to layout, remove duplicate instances from pages

**Prevention:**
- Use consistent import paths
- Remove unused component instances when refactoring
- Use TypeScript path aliases for cleaner imports

---

### Error: Type comparison appears unintentional

**Error Message:**
```
Type error: This comparison appears to be unintentional because the types 'SessionStatus' and '"PENDING"' have no overlap.
```

**Solution:**
Don't compare application types to database state values. Use type guards:
```typescript
// ❌ Before
if (mappedStatus !== 'PENDING') { ... }

// ✅ After
import { isDatabaseSessionState, mapDatabaseStateToStatus } from '@/lib/type-guards';
const dbState = session.state;
if (isDatabaseSessionState(dbState)) {
  const appStatus = mapDatabaseStateToStatus(dbState, { ... });
  // Now compare appStatus to SessionStatus values
}
```

**Prevention:**
- Use `lib/type-guards.ts` utilities for state conversions
- Never directly compare `SessionStatus` to database state strings
- Document the difference between database states and application statuses

---

### Error: Possibly 'undefined'

**Error Message:**
```
Type error: 'appUrl' is possibly 'undefined'.
```

**Solution:**
Add null check before accessing:
```typescript
// ❌ Before
if (appUrl.includes('localhost')) { ... }

// ✅ After
if (!appUrl) {
  appUrl = 'https://app.hookahplus.net';
  console.warn('[function] No URL found, using fallback');
}
if (appUrl.includes('localhost')) { ... }
```

**Prevention:**
- Use optional chaining (`?.`) for optional properties
- Add null checks before property access
- Use default values with nullish coalescing (`??`)

---

## Build Configuration Errors

### Error: Prisma Client not generated

**Error Message:**
```
Module not found: Can't resolve '@prisma/client'
```

**Solution:**
Add Prisma Client generation to build script:
```json
// In package.json
{
  "scripts": {
    "build": "prisma generate && next build"
  }
}
```

**Prevention:**
- Include `prisma generate` in all build scripts that use Prisma
- Use `prisma generate` in CI/CD pipelines
- Document Prisma setup in README

---

### Error: Memory setting ignored in Vercel

**Error Message:**
```
⚠ Warning: The `memory` setting in vercel.json is ignored on Active CPU billing.
```

**Solution:**
Remove the `functions` section with `memory` setting from `vercel.json`:
```json
// ❌ Remove this
{
  "functions": {
    "app/api/**/*.ts": {
      "memory": 1024
    }
  }
}
```

**Prevention:**
- Check Vercel documentation for current billing model
- Remove obsolete configuration settings
- Test builds after configuration changes

---

## Dependency Errors

### Error: Heavy dependencies slowing builds

**Error Message:**
```
Build time: 11+ minutes
```

**Solution:**
Move heavy dev dependencies to `optionalDependencies`:
```json
// In package.json
{
  "optionalDependencies": {
    "@playwright/test": "^1.56.0",
    "puppeteer": "21.11.0"
  }
}
```

Add `.npmrc` to skip browser downloads:
```
playwright_skip_browser_download=1
puppeteer_skip_chromium_download=1
```

Update `vercel.json` install command:
```json
{
  "installCommand": "npm install --omit=optional"
}
```

**Prevention:**
- Separate production and development dependencies
- Use `optionalDependencies` for heavy tools
- Configure `.npmrc` to skip unnecessary downloads

---

## Database Connection Errors

### Error: Database connection failed

**Error Message:**
```
Error: Can't reach database server at `localhost:5432`
```

**Solution:**
1. Check `DATABASE_URL` environment variable is set
2. Verify database is running
3. For development, use graceful fallback:
```typescript
if (!DATABASE_URL && process.env.NODE_ENV === 'development') {
  return { sessions: [], fallbackMode: true };
}
```

**Prevention:**
- Document database setup requirements
- Provide fallback modes for development
- Add clear error messages with troubleshooting steps

---

## Mobile Responsiveness Errors

### Error: Viewport not configured

**Symptom:**
- Mobile devices show desktop layout
- Text too small on mobile
- Horizontal scrolling required

**Solution:**
Add viewport meta tag to layout:
```typescript
// In app/layout.tsx
export const metadata = {
  // ... other metadata
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  }
}
```

**Prevention:**
- Always include viewport meta tags
- Test on mobile devices during development
- Use responsive design patterns (mobile-first)

---

## Quick Reference

| Error Type | Common Cause | Quick Fix |
|------------|--------------|-----------|
| Implicit 'any' | Missing type annotation | Add `: type` to parameter |
| Property missing | Interface out of sync | Add property to interface |
| Cannot find name | Missing import | Check import statement |
| Type comparison | Wrong type comparison | Use type guards |
| Possibly undefined | Missing null check | Add `if (!value)` check |
| Prisma not found | Client not generated | Add `prisma generate` |
| Build slow | Heavy dependencies | Move to optionalDependencies |
| Database error | Connection issue | Check DATABASE_URL |

---

## Getting Help

If you encounter an error not listed here:

1. Check the error message for specific file and line numbers
2. Search this document for similar errors
3. Check TypeScript/Next.js documentation
4. Review recent changes in git history
5. Ask in team chat with error details

---

**Last Updated:** 2025-01-10
**Maintained By:** Development Team

