# Authentication Pathways

## Two Distinct Authentication Flows

### 1. **Onboarding Pathway** (For New Operators)
**Purpose:** New lounge operators signing up through the website

**Entry Points:**
- Website onboarding form: `https://hookahplus.com/onboarding`
- Regular login: `/login` (for existing operators)

**Flow:**
1. User submits onboarding form → Creates lead in system
2. User can login via `/login` → Routes to `/admin/operator-onboarding` (if they have access)
3. Magic link from onboarding → Routes to `/admin/operator-onboarding`

**Redirect Behavior:**
- Magic links from onboarding form include `onboarding_flow=true`
- Auth callback routes to `/admin/operator-onboarding` for onboarding flow
- Default redirect for regular login is `/sessions`

**Access:**
- Operators can access `/admin/operator-onboarding` to manage their leads
- May have limited admin access based on their role

---

### 2. **Founder/CEO Pathway** (For Admin Access)
**Purpose:** Full admin access for Founder, CEO, and system administrators

**Entry Points:**
- Admin login page: `/admin/login`
- Direct admin routes (redirects to `/admin/login` if not authenticated)

**Flow:**
1. User goes to `/admin/login` → Enters email/password or requests magic link
2. Magic link includes `admin_login=true` flag
3. Auth callback verifies admin/owner role → Routes to `/admin`
4. Sets `admin_verified=true` in user metadata

**Redirect Behavior:**
- Magic links from admin login include `admin_login=true`
- Auth callback routes to `/admin` for admin users
- Non-admin users get error: "insufficient_permissions"

**Access:**
- Full access to `/admin` (Admin Control Center)
- Access to all admin routes and APIs
- "Administrator" link appears in Quick Access menu

---

## Key Differences

| Feature | Onboarding Pathway | Admin Pathway |
|---------|-------------------|---------------|
| **Login Page** | `/login` | `/admin/login` |
| **Default Redirect** | `/sessions` or `/admin/operator-onboarding` | `/admin` |
| **Magic Link Flag** | `onboarding_flow=true` | `admin_login=true` |
| **Role Check** | Any authenticated user | Must have `admin` or `owner` role |
| **Access Level** | Limited (operator onboarding) | Full admin access |
| **Visual Indicator** | Standard login UI | Red shield icon, "Admin Access" branding |

---

## Middleware Protection

- `/admin/*` routes require authentication
- `/admin/login` is public (allows login)
- Authenticated users can access `/admin` without re-authentication
- Non-authenticated users are redirected to `/admin/login` (not `/login`)

---

## Magic Link Configuration

### For Admin Login:
```
emailRedirectTo: `${appUrl}/auth/callback?redirect=/admin&admin_login=true`
```

### For Onboarding:
```
emailRedirectTo: `${appUrl}/auth/callback?redirect=/admin/operator-onboarding&onboarding_flow=true`
```

---

## Testing

1. **Test Admin Login:**
   - Go to `http://localhost:3002/admin/login`
   - Enter admin email
   - Request magic link or use password
   - Should route to `/admin` after authentication

2. **Test Onboarding:**
   - Go to `http://localhost:3002/login`
   - Enter operator email
   - Request magic link
   - Should route to `/admin/operator-onboarding` or `/sessions`

3. **Test Breadcrumb Navigation:**
   - While on `/admin/operator-onboarding`
   - Click "Admin" in breadcrumbs
   - Should route to `/admin` (if authenticated as admin)
   - Click Home icon
   - Should route to `/` (dashboard)

