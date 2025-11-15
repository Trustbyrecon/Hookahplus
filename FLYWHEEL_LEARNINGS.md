# Flywheel Learnings: Monorepo Build Optimization

## What We're Learning

### 1. **Incremental Build Optimization**
**Pattern:** Every build should only process what changed, not the entire monorepo.

**Key Insight:**
- Vercel builds all 3 apps (app, guest, site) on every commit
- Most commits only change 1 app
- **Waste:** Building unchanged apps = wasted build minutes = wasted money

**Solution Implemented:**
- Created `vercel-build-*.sh` scripts that check git diff
- Only build if files in that app's directory changed
- Exit codes: `0` = skip build, `1` = build

**Impact:**
- **Before:** 3 builds × 2 minutes = 6 build minutes per commit
- **After:** 1 build × 2 minutes = 2 build minutes per commit
- **Savings:** ~67% reduction in build time and costs

---

### 2. **Import Path Consistency**
**Pattern:** When refactoring shared utilities, update ALL import paths.

**Key Insight:**
- Moved `convertPrismaSessionToFireSession` from `route.ts` to `lib/session-utils-prisma.ts`
- **Missed:** Webhook route still importing from old location
- **Result:** Build fails in production but works locally (different module resolution)

**Solution:**
- Systematic grep for all imports
- Update all references in one pass
- Test build before committing

**Impact:**
- Prevents production build failures
- Reduces debugging time
- Improves code maintainability

---

### 3. **TypeScript Type Narrowing**
**Pattern:** TypeScript narrows types in conditional blocks, making some comparisons impossible.

**Key Insight:**
```typescript
// ❌ Wrong - inside conditional, TypeScript narrows type
{pricingModel === 'time-based' && (
  <div>{pricingModel === 'flat' ? '$30' : '$50'}</div> 
  // Error: can't be 'flat' here (type narrowed to 'time-based')
)}

// ✅ Right - don't check narrowed type
{pricingModel === 'time-based' && (
  <div>{`$${(duration * 0.50).toFixed(2)}`}</div> // Just show time-based price
)}
```

**Also:**
```typescript
// ❌ Wrong - expression result
source: (existingSession.source || 'QR') as const

// ✅ Right - use enum type
source: (existingSession.source || SessionSource.QR) as SessionSource
```

**Solution:**
- Use proper enum types instead of string literals
- Type assertions should match the actual type
- Leverage Prisma enums for type safety
- Don't check against narrowed types inside conditional blocks
- Understand TypeScript's control flow analysis

**Impact:**
- Better type safety
- Fewer runtime errors
- Clearer intent in code
- Prevents impossible comparisons

---

### 4. **Build Script Optimization**
**Pattern:** Vercel's "Ignored Build Step" uses exit codes, not return values.

**Key Insight:**
- Exit `0` = Skip build (ignore)
- Exit `1` = Build (don't ignore)
- Script runs BEFORE install/build, saving time

**Solution:**
```bash
# Check if app-related files changed
if changed_files_include "apps/app/"; then
  exit 1  # Build
else
  exit 0  # Skip
fi
```

**Impact:**
- Faster feedback loop
- Lower costs
- Better developer experience

---

### 5. **Monorepo Build Strategy**
**Pattern:** Each app should be independently deployable.

**Key Insight:**
- Shared code changes should trigger all dependent apps
- App-specific changes should only trigger that app
- Documentation changes should trigger nothing

**Solution:**
- Pattern matching in build scripts
- Shared packages trigger all apps
- App-specific triggers only that app
- Docs/README changes skip builds

**Impact:**
- Efficient resource usage
- Faster deployments
- Clear build triggers

---

## Metrics to Track

### Build Efficiency
- **Build Time:** Target < 2 minutes per app
- **Build Frequency:** Only when needed
- **Cache Hit Rate:** > 80% for unchanged apps

### Cost Optimization
- **Build Minutes/Day:** Track reduction
- **Concurrent Builds:** Minimize overlap
- **Wasted Builds:** Zero (all builds should be necessary)

### Developer Experience
- **Feedback Time:** < 5 minutes from commit to deploy
- **Build Failures:** < 5% of builds
- **False Positives:** Zero (builds should never skip when needed)

---

## Next Steps

1. **Monitor Build Patterns**
   - Track which files trigger which builds
   - Identify false positives (skipped when should build)
   - Identify false negatives (built when should skip)

2. **Optimize Shared Dependencies**
   - When `packages/` changes, all apps rebuild (correct)
   - Consider splitting shared packages if one app changes frequently

3. **Turbo Remote Caching**
   - Enable Vercel Remote Caching
   - Share build artifacts across deployments
   - Further reduce build times

4. **Build Notifications**
   - Alert on build failures
   - Track build efficiency metrics
   - Report on cost savings

---

## Key Takeaways

1. **Every build should have a purpose** - Don't build what didn't change
2. **Systematic refactoring** - Update all references when moving code
3. **Type safety matters** - Use proper types, not workarounds
4. **Exit codes are powerful** - Simple scripts can save significant time/money
5. **Monitor and iterate** - Track metrics to validate optimizations

---

## Flywheel Effect

**Input:** Optimize build scripts
**Output:** Faster builds, lower costs
**Feedback:** More frequent deployments, better DX
**Reinforcement:** Continue optimizing, measure impact

This creates a positive feedback loop where optimizations compound over time.

