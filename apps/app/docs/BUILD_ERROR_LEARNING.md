# Build Error Learning Guide

**Purpose:** Document common build errors and their solutions to prevent recurrence

## Error 1: Uint8Array Spread Operator (ES5 Compatibility)

### Error Message
```
Type error: Type 'Uint8Array<ArrayBuffer>' can only be iterated through when using the '--downlevelIteration' flag or with a '--target' of 'es2015' or higher.
```

### Root Cause
- Spreading `Uint8Array` directly: `String.fromCharCode(...array)`
- TypeScript target is `es5` which doesn't support iterating typed arrays with spread operator
- Next.js builds use strict TypeScript checking

### Solution
**Option 1:** Convert to regular array first (preferred)
```typescript
// ❌ Bad (ES5 incompatible)
const base64 = btoa(String.fromCharCode(...array));

// ✅ Good (ES5 compatible)
const charCodes: number[] = [];
for (let i = 0; i < array.length; i++) {
  charCodes.push(array[i]);
}
const base64 = btoa(String.fromCharCode.apply(null, charCodes));
```

**Option 2:** Use Array.from() (if target allows)
```typescript
const base64 = btoa(String.fromCharCode(...Array.from(array)));
```

### Prevention Checklist
- ✅ Never spread `Uint8Array`, `Int8Array`, `Uint16Array`, etc. directly
- ✅ Convert typed arrays to regular arrays before spreading
- ✅ Use `apply()` for ES5 compatibility when calling functions with array arguments
- ✅ Test with `tsconfig.json` target set to `es5`

---

## Error 2: Partial Type Assertion to Full Type

### Error Message
```
Type error: Conversion of type '{ id: string; ... }' to type 'Charge' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
```

### Root Cause
- Creating partial mock objects and asserting them as full types
- `as Stripe.Charge` doesn't work when objects are missing required properties
- TypeScript strict mode prevents unsafe type assertions

### Solution
**Option 1:** Use double assertion via `unknown` (for mocks)
```typescript
// ❌ Bad (unsafe assertion)
const mock: Stripe.Charge = { id: '...', amount: 100 } as Stripe.Charge;

// ✅ Good (explicit unsafe cast)
const mock: Stripe.Charge = { id: '...', amount: 100 } as unknown as Stripe.Charge;
```

**Option 2:** Use `Partial<Type>` and cast only where needed
```typescript
// Better: Accept partial in function signature
function processCharge(charge: Partial<Stripe.Charge> & { id: string; amount: number }) {
  // Use charge.id, charge.amount safely
}
```

**Option 3:** Create minimal required interface for tests
```typescript
interface MockCharge {
  id: string;
  amount: number;
  created: number;
  paid: boolean;
  metadata?: Record<string, any>;
}

const mockCharges: MockCharge[] = [...];
```

### Prevention Checklist
- ✅ Don't use `as Type` for partial objects - use `as unknown as Type`
- ✅ Create minimal interfaces for mocks instead of full types
- ✅ Use `Partial<Type>` when you only need some properties
- ✅ Document why unsafe casts are needed (mocks/test data)

---

## Common Build Error Patterns

### Pattern 1: Import Path Errors
**Symptom:** `Module not found: Can't resolve '../components/X'`

**Solution:**
- Count directory levels carefully
- Use `@/` alias when configured in tsconfig
- Verify file exists and is exported correctly

### Pattern 2: Type Compatibility in Tests
**Symptom:** Type errors when creating mock objects

**Solution:**
- Use `as unknown as Type` for partial mocks
- Create minimal test interfaces
- Use `Partial<Type>` for optional properties

### Pattern 3: ES5 Compatibility Issues
**Symptom:** Iteration/spread operator errors

**Solution:**
- Convert typed arrays to regular arrays first
- Use `apply()` instead of spread for function calls
- Avoid spreading `Uint8Array`, `Int8Array`, etc.

### Pattern 4: Environment Variable Issues
**Symptom:** `Environment variable not found: DATABASE_URL`

**Solution:**
- Set defaults in scripts before importing Prisma
- Use `process.env.VAR || 'default'` patterns
- Document required environment variables

---

## Pre-Commit Checklist

Before committing code that will be built on Vercel:

1. ✅ **TypeScript Errors**
   - Run `npx tsc --noEmit` locally
   - Fix all type errors before pushing

2. ✅ **ES5 Compatibility**
   - Check `tsconfig.json` target (`es5` = more restrictions)
   - Avoid spreading typed arrays
   - Use `apply()` for function calls with arrays

3. ✅ **Mock Objects**
   - Use `as unknown as Type` for partial mocks
   - Or create minimal test interfaces
   - Document why casts are needed

4. ✅ **Import Paths**
   - Verify all imports resolve correctly
   - Use consistent path patterns
   - Test with `npm run build` locally

5. ✅ **Environment Variables**
   - Set defaults in scripts/tools
   - Document required vars
   - Test without env vars set

---

## Quick Reference: Common Fixes

### Fix Uint8Array Spread
```typescript
// Before
const str = String.fromCharCode(...uint8Array);

// After
const arr = Array.from(uint8Array);
const str = String.fromCharCode.apply(null, arr);
```

### Fix Partial Mock Assertion
```typescript
// Before
const mock = { id: '...' } as Stripe.Charge;

// After
const mock = { id: '...' } as unknown as Stripe.Charge;
```

### Fix Import Path
```typescript
// Check relative path depth
// apps/app/components/X.tsx
// apps/app/app/page.tsx
// Relative: ../../components/X
```

---

## Testing Locally Before Push

```bash
# 1. Type check
npx tsc --noEmit

# 2. Build locally
npm run build

# 3. Lint
npm run lint

# 4. Test (if applicable)
npm test
```

**Pro Tip:** If build succeeds locally but fails on Vercel:
- Check TypeScript version differences
- Verify environment variable defaults
- Check for platform-specific code (Windows vs Linux)

---

**Last Updated:** $(date)  
**Maintained By:** Development Team

