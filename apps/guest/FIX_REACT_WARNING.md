# Fix React Warning: setState During Render

**Agent:** Noor (session_agent)  
**Date:** 2025-01-14

---

## Problem

React warning: "Cannot update a component (`GuestPortal`) while rendering a different component (`FlavorMixSelector`)"

**Root Cause:** `onSelectionChange` callback was being called inside `setSelected` state updater function, causing parent component state updates during render phase.

---

## Solution

Changed `FlavorMixSelector` to use `useEffect` to call the callback after state updates complete, rather than calling it synchronously during state update.

### Before:
```typescript
setSelected((prev) => {
  // ...
  onSelectionChange(newSelection); // ❌ Called during render
  return newSelection;
});
```

### After:
```typescript
// Callback triggered after state update via useEffect
React.useEffect(() => {
  onSelectionChange(selected);
}, [selected, onSelectionChange]);

setSelected((prev) => {
  // Just update state, no callback
  return newSelection;
});
```

---

## Files Changed

- ✅ `apps/guest/components/customer/FlavorMixSelector.tsx`
  - Added `useEffect` to call `onSelectionChange` after `selected` state updates
  - Removed callback calls from `toggleFlavor` and `clearAll` functions

---

## Expected Results

- ✅ No more React warnings about setState during render
- ✅ Flavor selection still works correctly
- ✅ Cart updates still happen when flavors change
- ✅ Better React performance (no render-phase updates)

---

**Status:** ✅ **Fixed - React warning resolved**

