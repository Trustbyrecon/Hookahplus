# Aliethia Task Brief: LaunchPad ManyChat Integration

**Agent:** Aliethia (reflex_agent)  
**Priority:** High  
**Estimated Effort:** 2-3 days  
**Dependencies:** LaunchPad core flow (Phase 1)

---

## 🎯 Objective

Implement ManyChat + Instagram integration as "LaunchPad Concierge" that handles 60-80% of onboarding via DM, then hands off to web app for final activation (20%).

**Architecture:**
- **ManyChat + IG:** Entry, qualification, config capture, deliverables
- **Web App:** Account creation, billing, activation, operations

---

## 📋 Requirements

### 1. ManyChat External Request Endpoint

**Endpoint:** `POST /api/launchpad/manychat-setup`

**Purpose:** Receive ManyChat data, create SetupSession, return completion link

**Input (from ManyChat External Request):**
```json
{
  "subscriber_id": "{{subscriber_id}}",
  "instagram_username": "{{instagram_username}}",
  "custom_fields": {
    "lounge_name": "{{custom_field.lounge_name}}",
    "city": "{{custom_field.city}}",
    "seats_tables": "{{custom_field.seats_tables}}",
    "pos_used": "{{custom_field.pos_used}}",
    "session_type": "{{custom_field.session_type}}",
    "price_range": "{{custom_field.price_range}}",
    "top_5_flavors": "{{custom_field.top_5_flavors}}"
  }
}
```

**Processing:**
1. Validate required fields (lounge_name, city minimum)
2. Create SetupSession with ManyChat data
3. Generate preliminary LoungeOps config
4. Create completion link: `/launchpad?token={token}&source=manychat`
5. Generate asset preview links (QR codes, guide)

**Response:**
```json
{
  "success": true,
  "setupSessionToken": "uuid-token",
  "completionLink": "https://app.hookahplus.net/launchpad?token=xxx&source=manychat",
  "previewAssets": {
    "qrCodesLink": "https://app.hookahplus.net/launchpad/preview/qr?token=xxx",
    "posGuideLink": "https://app.hookahplus.net/launchpad/preview/pos-guide?token=xxx",
    "checklistLink": "https://app.hookahplus.net/launchpad/preview/checklist?token=xxx"
  },
  "nextSteps": "Complete setup in 10 minutes to activate your lounge"
}
```

**Acceptance Criteria:**
- [ ] Endpoint validates ManyChat payload
- [ ] Creates SetupSession with ManyChat data
- [ ] Generates completion link with token
- [ ] Returns preview asset links
- [ ] Handles missing optional fields gracefully
- [ ] Logs all ManyChat interactions for debugging

---

### 2. LaunchPad Pre-Fill from ManyChat

**Route:** `/launchpad?token={token}&source=manychat`

**Behavior:**
- Load SetupSession by token
- Pre-fill Steps 1-2 with ManyChat data:
  - Step 1: Lounge name, city → location, seats/tables
  - Step 2: Top 5 flavors → flavor list
- Show indicator: "Setup started via Instagram DM"
- Allow user to complete remaining steps

**Acceptance Criteria:**
- [ ] Token validation works
- [ ] ManyChat data pre-fills correctly
- [ ] User can edit pre-filled data
- [ ] Progress saves normally
- [ ] Source tracking preserved

---

### 3. ManyChat Response Builder

**Purpose:** Generate ManyChat DM responses with links

**Function:** `buildManyChatResponse(setupSession, assets)`

**Output Format:**
```
Your Go-Live Kit is ready! 🎉

Complete setup (10 min): {completionLink}

Preview your assets:
• QR Codes: {qrCodesLink}
• POS Guide: {posGuideLink}
• First Week Checklist: {checklistLink}

Your lounge will be live tonight once you complete setup.
```

**Acceptance Criteria:**
- [ ] Response includes all required links
- [ ] Links are properly formatted for ManyChat
- [ ] Message is concise (<500 chars)
- [ ] Includes clear CTA

---

### 4. ManyChat Webhook Enhancement

**File:** `apps/app/app/api/webhooks/manychat/route.ts`

**Enhancement:** Add LaunchPad flow detection

**Logic:**
```typescript
// Detect if this is a LaunchPad trigger
if (payload.custom_fields?.lounge_name || payload.message?.text?.includes('LAUNCHPAD')) {
  // Route to LaunchPad setup endpoint
  const setupResponse = await createSetupSessionFromManyChat(payload);
  // Return response for ManyChat External Request
  return NextResponse.json(setupResponse);
}
```

**Acceptance Criteria:**
- [ ] Detects LaunchPad triggers
- [ ] Routes to setup endpoint
- [ ] Returns proper response format
- [ ] Doesn't break existing webhook flows

---

### 5. Preview Asset Endpoints

**Endpoints:**
- `GET /api/launchpad/preview/qr?token={token}`
- `GET /api/launchpad/preview/pos-guide?token={token}`
- `GET /api/launchpad/preview/checklist?token={token}`

**Purpose:** Generate preview assets before full activation

**Behavior:**
- Validate token
- Generate assets from SetupSession data
- Return downloadable files or viewable pages
- Mark as "Preview" (non-functional QR codes)

**Acceptance Criteria:**
- [ ] Token validation works
- [ ] QR codes generated (preview mode)
- [ ] POS guide generated (static PDF/HTML)
- [ ] Checklist generated (PDF/HTML)
- [ ] All assets marked as preview

---

## 🔧 Technical Implementation

### Database Schema

**Add to SetupSession model:**
```prisma
model SetupSession {
  // ... existing fields ...
  source          String?  // "manychat" | "web" | "direct"
  manychatUserId  String?  // ManyChat subscriber_id
  instagramHandle String?  // Instagram username
  prefillData     Json?    // ManyChat collected data
}
```

### API Endpoints to Create

1. `POST /api/launchpad/manychat-setup` - Create setup from ManyChat
2. `GET /api/launchpad/preview/qr` - Preview QR codes
3. `GET /api/launchpad/preview/pos-guide` - Preview POS guide
4. `GET /api/launchpad/preview/checklist` - Preview checklist

### ManyChat Configuration

**External Request Setup:**
- URL: `https://app.hookahplus.net/api/launchpad/manychat-setup`
- Method: POST
- Headers: `Content-Type: application/json`
- Body: Use ManyChat variables (see requirements)

**Response Handling:**
- Store `setupSessionToken` in ManyChat custom field
- Use `completionLink` in DM response
- Use `previewAssets` links in follow-up messages

---

## 🎨 User Experience Flow

### ManyChat DM Flow

```
User: Comments "LAUNCHPAD" on IG post
  ↓
ManyChat: Sends DM with qualification questions
  ↓
User: Answers 5-8 questions
  ↓
ManyChat: External Request → H+ API
  ↓
H+ API: Creates SetupSession, generates links
  ↓
ManyChat: Sends DM with completion link + preview assets
  ↓
User: Clicks completion link
  ↓
Web App: Pre-fills LaunchPad, user completes
  ↓
Web App: Account creation + activation
  ↓
ManyChat: Follow-up DM (same day) with dashboard link
```

---

## ✅ Acceptance Criteria Summary

### Core Functionality
- [ ] ManyChat External Request creates SetupSession
- [ ] Completion link generated and works
- [ ] Preview assets generated and accessible
- [ ] LaunchPad pre-fills from ManyChat data
- [ ] Webhook routes LaunchPad flows correctly

### Data Handling
- [ ] ManyChat data stored in SetupSession
- [ ] Source tracking preserved
- [ ] Missing fields handled gracefully
- [ ] Data validation on input

### User Experience
- [ ] ManyChat DM responses are clear
- [ ] Links work correctly
- [ ] Preview assets are downloadable
- [ ] Pre-fill doesn't break normal flow

### Error Handling
- [ ] Invalid tokens return proper errors
- [ ] Missing ManyChat data handled
- [ ] API failures logged
- [ ] Graceful fallback to web-only flow

---

## 🚨 Constraints & Considerations

### 24-Hour Messaging Window
- ManyChat can only send automated messages within 24 hours of user interaction
- Design for same-day completion
- Long-term engagement must happen in web app

### Platform Volatility
- IG automation can break temporarily
- Build graceful fallback to web/SMS/email
- Don't make ManyChat critical path

### Meta Compliance
- Use ManyChat's official APIs only
- Avoid "bot-like" automation patterns
- Follow Meta's automation guidelines

### Data Privacy
- Store ManyChat user IDs securely
- Don't expose tokens in URLs (use short-lived tokens)
- Comply with GDPR for EU users

---

## 📊 Success Metrics

- **ManyChat → Web Conversion:** % of ManyChat users who complete web setup
- **Time to Completion:** Average time from ManyChat trigger to web activation
- **Pre-Fill Accuracy:** % of pre-filled data that users keep vs. edit
- **Preview Asset Engagement:** % of users who view/download preview assets

**Target Benchmarks:**
- ManyChat → Web Conversion: >50%
- Time to Completion: <15 minutes (from ManyChat to web activation)
- Pre-Fill Accuracy: >70% (users keep most pre-filled data)

---

## 🔗 Related Files

- **PRD:** `H_PLUS_LAUNCHPAD_PRD.md`
- **Implementation Guide:** `H_PLUS_LAUNCHPAD_IMPLEMENTATION.md`
- **Existing ManyChat Webhook:** `apps/app/app/api/webhooks/manychat/route.ts`
- **ManyChat Docs:** `MANYCHAT_EXTERNAL_REQUEST_JSON.md`

---

## 📝 Implementation Notes

1. **Start with External Request endpoint** - This is the core integration point
2. **Test with ManyChat sandbox** - Use ManyChat's test mode before production
3. **Log everything** - ManyChat interactions are hard to debug, log extensively
4. **Handle edge cases** - ManyChat data can be incomplete or malformed
5. **Keep responses concise** - ManyChat DMs have character limits

---

**Status:** Ready for Implementation  
**Assigned to:** Aliethia (reflex_agent)  
**Due Date:** TBD

