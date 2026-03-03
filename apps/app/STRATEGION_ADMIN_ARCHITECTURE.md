# Strategion - Admin Command Center Architecture

**Question:** Should there be a separate "Strategion" command center (separate repo/URL) for admin/dev work independent of the live site?

---

## Current Architecture

### **Three Apps in Monorepo:**
1. **`apps/site`** - Public marketing site (customer-facing)
2. **`apps/app`** - Main application (operators/staff)
3. **`apps/guest`** - Guest-facing interface

### **Current Admin Access:**
- Admin pages are in `apps/app` (e.g., `/admin/operator-onboarding`)
- Accessible via same domain as main app
- No separate authentication/authorization layer

---

## Strategion Concept

### **What is Strategion?**
A separate admin command center for:
- Operator onboarding management
- System administration
- Development tools
- Analytics dashboards
- Configuration management
- All admin/dev work

### **Benefits:**
1. **Security Isolation** - Admin tools separate from customer-facing apps
2. **Independent Deployment** - Update admin tools without affecting live site
3. **Access Control** - Separate authentication/authorization
4. **Clean Separation** - Customer-facing vs internal tools
5. **Development Safety** - Test admin features without risk to production

---

## Recommended Architecture Options

### **Option 1: Separate Subdomain (Recommended)**
```
Production:
- hookahplus.net (site/app/guest)
- admin.hookahplus.net (Strategion)

Development:
- localhost:3000 (site)
- localhost:3002 (app)
- localhost:3001 (guest)
- localhost:3003 (Strategion/admin)
```

**Pros:**
- Clear separation
- Independent deployment
- Easy to restrict access
- Can use different auth providers

**Cons:**
- Additional infrastructure
- CORS configuration needed
- More complex routing

---

### **Option 2: Path-Based with Auth (Current + Enhanced)**
```
Production:
- hookahplus.net (public)
- hookahplus.net/admin/* (protected admin routes)

Enhancements:
- Add authentication middleware
- Add role-based access control (RBAC)
- Separate admin UI components
```

**Pros:**
- Simpler infrastructure
- Same domain (no CORS)
- Easier to share resources

**Cons:**
- Less isolation
- Risk of exposing admin routes
- Harder to restrict access

---

### **Option 3: Separate Repo (Full Isolation)**
```
Repos:
- hookahplus (customer-facing apps)
- hookahplus-strategion (admin command center)

Deployments:
- Vercel: hookahplus.net
- Vercel: strategion.hookahplus.net
```

**Pros:**
- Complete isolation
- Independent versioning
- Team separation possible

**Cons:**
- More complex to maintain
- Code duplication risk
- Harder to share types/utilities

---

## Recommendation: Option 1 (Separate Subdomain)

### **Implementation Plan:**

1. **Create `apps/strategion` in monorepo**
   ```
   apps/
     site/     (customer-facing)
     app/      (operators/staff)
     guest/    (guest interface)
     strategion/ (admin command center) ← NEW
   ```

2. **Move Admin Pages to Strategion**
   - `/admin/operator-onboarding` → `apps/strategion/app/operator-onboarding`
   - All admin routes → `apps/strategion`
   - Keep customer-facing routes in `apps/app`

3. **Deploy Strategion Separately**
   - Vercel: `admin.hookahplus.net` or `strategion.hookahplus.net`
   - Separate environment variables
   - Separate authentication

4. **Update Site Build Redirects**
   - Remove redirects to admin pages
   - Keep users on site build
   - Show success/thank you pages

---

## Immediate Fix (Current Session)

### **What We're Doing Now:**
1. ✅ Fix redirect - keep users on site build (no admin page access)
2. ✅ Fix lead extraction - handle REM TrustEvent format
3. ✅ Ensure leads show up in admin dashboard

### **Future Enhancement:**
- Move admin pages to separate Strategion app
- Deploy to `admin.hookahplus.net`
- Add proper authentication/authorization

---

## Quick Answer

**Do we have Strategion now?** 
- **No** - Admin pages are currently in `apps/app` alongside customer-facing features
- **Should we?** 
  - **Yes** - For production, a separate admin command center is recommended
  - **Short-term:** Current architecture works but needs auth protection
  - **Long-term:** Separate `apps/strategion` subdomain is ideal

**Current Status:**
- Admin pages accessible but not properly protected
- Users can accidentally access admin pages (the bug we're fixing)
- Need to add authentication before production launch

---

## Next Steps

1. **Immediate (This Session):**
   - ✅ Fix redirect to keep users on site
   - ✅ Fix lead extraction from REM format
   - ✅ Ensure leads appear in dashboard

2. **Short-term (Before Production):**
   - Add authentication to admin routes
   - Add role-based access control
   - Protect `/admin/*` routes

3. **Long-term (Post-Launch):**
   - Create `apps/strategion` app
   - Move all admin pages there
   - Deploy to separate subdomain
   - Full isolation and security

