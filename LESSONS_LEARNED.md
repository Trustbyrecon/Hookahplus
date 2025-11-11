# 🎓 Lessons Learned - Build & Development Patterns

## What We're Learning

### 1. **Type Safety is Critical**
**Pattern**: TypeScript catches errors at build time, but we need to be consistent.

**Lessons**:
- ✅ **Enum Imports**: Always import enums (`SessionSource`, `SessionState`) when using them
- ✅ **Type Definitions**: Ensure all type declarations are consistent across files
- ✅ **Null Safety**: Handle `undefined` values explicitly (e.g., `email || undefined`)

**Example**: 
```typescript
// ❌ Missing import
source: SessionSource.LEGACY_POS  // Error: Cannot find name 'SessionSource'

// ✅ Correct
import { SessionSource } from '@prisma/client';
source: SessionSource.LEGACY_POS
```

### 2. **Database Schema Synchronization**
**Pattern**: Prisma schema must match database structure exactly.

**Lessons**:
- ✅ **Column Names**: Database uses camelCase (e.g., `tableId`), not snake_case
- ✅ **Enum Types**: Database enums must match Prisma enum definitions
- ✅ **Migrations**: Always run migrations before deploying schema changes
- ✅ **Table Mapping**: Use `@@map("TableName")` to match actual database table names

**Example**:
```prisma
// Prisma schema
model Session {
  source SessionSource  // Enum type
  state  SessionState   // Enum type
  @@map("Session")      // Matches database table name
}
```

### 3. **Error Handling Patterns**
**Pattern**: Consistent error handling prevents cascading failures.

**Lessons**:
- ✅ **Safe JSON Parsing**: Always parse responses safely (try/catch)
- ✅ **Error Messages**: Provide detailed, actionable error messages
- ✅ **Logging**: Log errors with context (request body, status codes, timestamps)
- ✅ **Graceful Degradation**: Handle missing data gracefully (e.g., `email || undefined`)

**Example**:
```typescript
// ✅ Safe parsing
let responseData;
const responseText = await response.text();
try {
  responseData = responseText ? JSON.parse(responseText) : {};
} catch (parseError) {
  throw new Error(`Invalid response: ${response.status}`);
}
```

### 4. **Environment Variable Management**
**Pattern**: Environment variables need proper validation and defaults.

**Lessons**:
- ✅ **Defaults**: Always provide fallback values
- ✅ **Validation**: Check for required variables early
- ✅ **Type Safety**: Use TypeScript to enforce types
- ✅ **Documentation**: Document all required env vars

**Example**:
```typescript
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
if (!appUrl) {
  throw new Error('NEXT_PUBLIC_APP_URL is required');
}
```

### 5. **Build-Time vs Runtime Errors**
**Pattern**: TypeScript catches type errors at build time, but runtime errors need different handling.

**Lessons**:
- ✅ **Build Errors**: Fix immediately - they block deployment
- ✅ **Runtime Errors**: Handle gracefully with try/catch and user-friendly messages
- ✅ **Type Guards**: Use type guards to narrow types safely
- ✅ **Optional Chaining**: Use `?.` for optional properties

**Example**:
```typescript
// ✅ Type guard
if (session.assignedStaff && session.assignedStaff.boh) {
  // Safe to access
}

// ✅ Optional chaining
const bohId = session.assignedStaff?.boh;
```

### 6. **Module System & Global Declarations**
**Pattern**: TypeScript's module system requires explicit exports for `declare global`.

**Lessons**:
- ✅ **Module Exports**: Files with `declare global` need `export {}` to be modules
- ✅ **Type Conflicts**: Avoid duplicate type declarations
- ✅ **Global Types**: Centralize global type declarations

**Example**:
```typescript
// ✅ Proper module
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}
export {}; // Makes this a module
```

### 7. **API Integration Patterns**
**Pattern**: External APIs (Stripe, database) need careful type handling.

**Lessons**:
- ✅ **API Types**: Use library types (e.g., Stripe types) correctly
- ✅ **Null Handling**: Convert `undefined` to `null` or handle explicitly
- ✅ **Error Responses**: Parse error responses safely
- ✅ **Status Codes**: Check response status before parsing

**Example**:
```typescript
// ✅ Stripe API - handle undefined
customer_email: email || undefined,  // Stripe accepts undefined

// ✅ Database API - handle errors
if (!response.ok) {
  const errorData = await response.json().catch(() => ({}));
  throw new Error(errorData.error || 'Request failed');
}
```

## 🔄 Recurring Patterns

### Pattern 1: Missing Imports
- **Symptom**: `Cannot find name 'X'`
- **Cause**: Forgot to import enum/type
- **Fix**: Add import statement
- **Prevention**: Use TypeScript strict mode, enable unused imports warning

### Pattern 2: Type Mismatches
- **Symptom**: `Type 'X' is not assignable to type 'Y'`
- **Cause**: Using string literals instead of enums, or undefined values
- **Fix**: Use enum values, handle undefined explicitly
- **Prevention**: Use enums consistently, add type guards

### Pattern 3: Database Schema Drift
- **Symptom**: `Column does not exist` or `Invalid enum value`
- **Cause**: Schema changes not applied to database
- **Fix**: Run migrations, regenerate Prisma client
- **Prevention**: Always run migrations after schema changes

### Pattern 4: Response Parsing Errors
- **Symptom**: `Unexpected end of JSON input` or `Failed to parse`
- **Cause**: Assuming response is always JSON, not handling empty responses
- **Fix**: Parse safely, check response.ok first
- **Prevention**: Always use safe parsing pattern

## 🎯 Best Practices Going Forward

1. **Always import enums** when using them
2. **Handle undefined explicitly** for API parameters
3. **Use safe JSON parsing** for all API responses
4. **Run migrations** before deploying schema changes
5. **Test locally** before pushing to production
6. **Use TypeScript strict mode** to catch errors early
7. **Centralize type declarations** to avoid conflicts
8. **Document environment variables** and their requirements

## 📊 Error Categories

### Build-Time Errors (Block Deployment)
- Type errors
- Missing imports
- Syntax errors
- Module resolution errors

### Runtime Errors (Need Handling)
- API failures
- Database connection issues
- Missing environment variables
- Invalid user input

### Configuration Errors (Need Setup)
- Missing migrations
- Incorrect environment variables
- Missing API keys
- Database schema mismatches

## 🔍 Debugging Checklist

When encountering build errors:
1. ✅ Check imports - are all types/enums imported?
2. ✅ Check types - are we using enums vs strings correctly?
3. ✅ Check undefined - are we handling optional values?
4. ✅ Check schema - does Prisma schema match database?
5. ✅ Check migrations - have they been run?
6. ✅ Check environment - are required vars set?
7. ✅ Check API types - are we using library types correctly?

