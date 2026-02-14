# Demo Request Integration with Operator Onboarding

## Changes Made

### 1. Contact Form Updates
- ✅ **Removed phone number field** from contact form
- ✅ **Updated email** from `demo@hookahplus.net` to `hookahplusconnector@gmail.com`
- ✅ **Removed phone display** from contact information section

### 2. Demo Requests API Integration
- ✅ **Connected to Operator Onboarding**: Demo requests now create leads in Operator Onboarding Management
- ✅ **Lead Creation**: All demo requests flow to `/api/admin/operator-onboarding` with `action: 'create_lead'`
- ✅ **Source Tracking**: Demo requests are marked with `source: 'website'` and `stage: 'new-leads'`

### 3. Onboarding Submission Integration
- ✅ **Connected to Operator Onboarding**: Onboarding submissions also create leads
- ✅ **Stage**: Onboarding submissions start at `stage: 'intake'` (further along than demo requests)

### 4. POS Waitlist Integration
- ✅ **Already Integrated**: POS waitlist creates ReflexEvents with type `pos.waitlist.signup`
- ✅ **Enhanced**: Now includes full lead data (name, email, business name, location) in payload
- ✅ **CTA Tracking**: Added `ctaSource` and `ctaType` for better tracking

## Touchpoints That Feed Operator Onboarding

### ✅ Active Touchpoints:
1. **Contact Form Demo Requests** (`/api/demo-requests` → `action: 'request_demo'`)
   - Creates lead with `source: 'website'`, `stage: 'new-leads'`
   - Source: Contact page

2. **Onboarding Submissions** (`/api/demo-requests` → `action: 'onboarding_submission'`)
   - Creates lead with `source: 'website'`, `stage: 'intake'`
   - Source: Onboarding page

3. **POS Waitlist Signups** (`/api/admin/pos-waitlist`)
   - Creates ReflexEvent with type `pos.waitlist.signup`
   - Already appears in Operator Onboarding (included in OR clause)
   - Source: POS waitlist page

4. **Manual Lead Creation** (`/api/admin/operator-onboarding` → `action: 'create_lead'`)
   - Admin-created leads
   - Source: Operator Onboarding Management UI

### 🔍 Other Potential Touchpoints to Check:
- **Preorder Signups**: Check if these should create leads
- **Newsletter Signups**: May want to create leads if they include business info
- **CTA Tracking**: Various CTAs across the site may need integration

## How It Works

### Flow Diagram:
```
Site Form Submission
    ↓
/api/demo-requests (site)
    ↓
POST /api/admin/operator-onboarding (app)
    ↓
Creates ReflexEvent with:
  - type: 'onboarding.signup'
  - source: 'website' or 'manual'
  - ctaSource: 'website'
  - ctaType: 'onboarding_signup'
  - payload: { businessName, ownerName, email, phone, location, stage }
    ↓
Appears in Operator Onboarding Management
```

## Testing

1. **Test Demo Request**:
   - Go to `/contact`
   - Fill out form (no phone field)
   - Submit
   - Check Operator Onboarding Management - should see new lead

2. **Test Onboarding Submission**:
   - Go to `/onboarding`
   - Complete onboarding form
   - Submit
   - Check Operator Onboarding Management - should see new lead at 'intake' stage

3. **Test POS Waitlist**:
   - Go to `/pos-waitlist`
   - Submit form
   - Check Operator Onboarding Management - should see new lead

## Email Configuration

- **Contact Email**: `hookahplusconnector@gmail.com`
- **Display Location**: Contact page sidebar
- **Removed**: Phone number field and display

