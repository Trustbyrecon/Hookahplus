# ManyChat Flow Builder Guide - LaunchPad Concierge

**Purpose:** Set up Instagram DM automation to capture 60-80% of LaunchPad setup via ManyChat, then hand off to web app for activation.

**Estimated Setup Time:** 30-45 minutes  
**Prerequisites:** ManyChat account connected to Instagram

---

## 🎯 Overview

**Flow Architecture:**
```
Instagram DM Trigger
    ↓
ManyChat Conversation (5-8 questions)
    ↓
External Request → Your API
    ↓
DM Response with Completion Link
    ↓
User completes on web app
```

---

## 📋 Step-by-Step Setup

### Step 1: Create New Flow

1. **Go to ManyChat Dashboard**
   - Navigate to: https://manychat.com/dashboard
   - Click **"Flows"** in left sidebar
   - Click **"Create Flow"**
   - Name it: **"H+ LaunchPad Concierge"**

2. **Set Flow Trigger**
   - Click **"Add Trigger"**
   - Choose one of these triggers:
     - **Keyword:** User comments "LAUNCHPAD" on your post
     - **Story Reply:** User replies to your Instagram story
     - **DM:** User sends "start" or "launchpad" in DM
     - **Button Click:** User clicks "Get Started" button

---

### Step 2: Build Conversation Flow

Add these steps in order:

#### **Step 2.1: Welcome Message**

**Action:** Send Message

**Message:**
```
🚀 Welcome to H+ LaunchPad!

I'll help you get your lounge live in under an hour. Let's start with a few quick questions.

This takes about 5 minutes. Ready?
```

**Buttons:**
- ✅ Yes, let's go
- ❌ Not right now

**Button Actions Configuration:**

1. **"Yes, let's go" Button:**
   - Click the button in the message editor
   - Click **"Add Action"** or the **"Then"** arrow
   - Connect to **Step 2.2: Lounge Name** (Ask Question action)

2. **"Not right now" Button:**
   - Click the button in the message editor (the "Edit Button" sidebar will open)
   - In the sidebar, under **"When this button is pressed"**, click **"Perform Actions"**
   - Click **"+ Add Action"** or **"Add Action"**
   - In the **"Perform next actions..."** modal that opens:
     *   Look for **"Send Message"** in one of these categories:
     *   - **"Live Chat"** category (most likely location - click the chat bubble icon 💬)
     *   - **"Recently used"** category (if you've used it before - click the star icon ✩)
     *   - Scroll through other categories if not found
   - Click **"Send Message"** when you find it
   - In the message editor that appears, type:
     ```
     No problem! DM me anytime to get started. 👋
     ```
   - Click **"Done"** to save the button configuration
   - The flow will naturally end after this message (no need to add "End Flow" explicitly)

**Flow Logic:**
- If "Yes" → Continue to Step 2.2
- If "No" → Send exit message → End flow

---

#### **Step 2.2: Lounge Name**

**Action:** Ask Question

**Question Type:** Text Input

**Message:**
```
What's your lounge name?

(This is how staff and guests will see you)
```

**Save Answer To:** Custom Field `lounge_name`

**Validation:**
- Required: Yes
- Min Length: 2 characters

---

#### **Step 2.3: City/Location**

**Action:** Ask Question

**Question Type:** Text Input

**Message:**
```
What city is your lounge in?
```

**Save Answer To:** Custom Field `city`

**Validation:**
- Required: Yes

---

#### **Step 2.4: Tables/Seats Count**

**Action:** Ask Question

**Question Type:** Number Input

**Message:**
```
How many tables/seats do you have?

(Just a rough count is fine - you can adjust later)
```

**Save Answer To:** Custom Field `seats_tables`

**Validation:**
- Required: Yes
- Min: 1
- Max: 200

---

#### **Step 2.5: POS System**

**Action:** Ask Question

**Question Type:** Multiple Choice

**Message:**
```
Which POS system do you use?

(We run above your POS - we don't replace it)
```

**Options:**
- Square
- Clover
- Toast
- Other
- None yet

**Save Answer To:** Custom Field `pos_used`

---

#### **Step 2.6: Session Type**

**Action:** Ask Question

**Question Type:** Multiple Choice

**Message:**
```
How do you charge for sessions?

(You can change this later)
```

**Options:**
- Flat fee (same price regardless of time)
- Timed (charge by the hour)

**Save Answer To:** Custom Field `session_type`

---

#### **Step 2.7: Price Range**

**Action:** Ask Question

**Question Type:** Number Input

**Message:**
```
What's your base session price?

(Enter in dollars, e.g., 25 for $25)
```

**Save Answer To:** Custom Field `price_range`

**Validation:**
- Required: Yes
- Min: 1
- Max: 500

---

#### **Step 2.8: Top Flavors**

**Action:** Ask Question

**Question Type:** Text Input

**Message:**
```
What are your top 5 most popular flavors?

(Separate with commas, e.g., "Strawberry, Blueberry, Mint, Grape, Watermelon")
```

**Save Answer To:** Custom Field `top_5_flavors`

**Validation:**
- Required: No (optional)

---

### Step 3: Configure External Request

After collecting all data, add an **External Request** action:

#### **Step 3.1: Add External Request**

1. **Click "Add Action"** → **"External Request"**
2. **Request Type:** POST
3. **URL:** `c`
   - Replace with your production URL
   - For testing: `http://localhost:3002/api/launchpad/manychat-setup` (use ngrok)

#### **Step 3.2: Request Body**

**Format:** JSON

**Body Template:**
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

#### **Step 3.3: Save Response**

**Save Response To:** Custom Field `launchpad_response`

**Response Format:** JSON

---

### Step 4: Format Response Message

After External Request, add a **Send Message** action:

#### **Step 4.1: Success Message**

**Action:** Send Message

**Message Template:**
```
🎉 Your Go-Live Kit is ready!

I've set up your lounge: {{custom_field.lounge_name}}

📱 Complete your setup (10 minutes):
{{custom_field.launchpad_response.completionLink}}

✨ Preview your assets:
• QR Codes: {{custom_field.launchpad_response.previewAssets.qrCodes}}
• POS Guide: {{custom_field.launchpad_response.previewAssets.posGuide}}
• Week-1 Checklist: {{custom_field.launchpad_response.previewAssets.checklist}}

Your lounge will be live tonight once you complete setup! 🚀
```

**Note:** ManyChat may need the response parsed. If variables don't work, use a **Function** action to extract values.

---

#### **Step 4.2: Error Handling**

**Action:** Conditional Logic

**Condition:** If `{{custom_field.launchpad_response.success}}` equals `false`

**Message:**
```
Hmm, something went wrong. Let me try again...

Please DM me "LAUNCHPAD" to restart, or contact support.
```

---

### Step 5: Add Function for Response Parsing (Optional)

If ManyChat doesn't parse JSON responses automatically:

1. **Add Function Action**
2. **Function Name:** `parseLaunchPadResponse`
3. **Code:**
```javascript
// Parse JSON response from API
const response = JSON.parse(input.launchpad_response);
return {
  completionLink: response.completionLink,
  qrCodesLink: response.previewAssets.qrCodes,
  posGuideLink: response.previewAssets.posGuide,
  checklistLink: response.previewAssets.checklist
};
```

4. **Save Output To:** Custom Fields (individual fields for each link)

---

## 🔧 Advanced Configuration

### Custom Fields Setup

In ManyChat Dashboard → **Settings** → **Custom Fields**, create these fields:

1. **lounge_name** (Text)
2. **city** (Text)
3. **seats_tables** (Number)
4. **pos_used** (Text)
5. **session_type** (Text)
6. **price_range** (Number)
7. **top_5_flavors** (Text)
8. **launchpad_response** (Text/JSON) - For storing API response
9. **launchpad_token** (Text) - For storing setup session token

---

### Flow Logic Diagram

```
START
  ↓
Welcome Message
  ↓
Lounge Name Question
  ↓
City Question
  ↓
Tables/Seats Question
  ↓
POS System Question
  ↓
Session Type Question
  ↓
Price Range Question
  ↓
Top Flavors Question (Optional)
  ↓
External Request → Your API
  ↓
Parse Response (Function)
  ↓
Send Success Message with Links
  ↓
END
```

---

## 🧪 Testing

### Step 1: Test Locally

1. **Start your dev server:**
   ```bash
   cd apps/app
   npm run dev
   ```

2. **Expose with ngrok:**
   ```bash
   ngrok http 3002
   ```

3. **Update ManyChat External Request URL:**
   - Use ngrok URL: `https://your-ngrok-url.ngrok.io/api/launchpad/manychat-setup`

4. **Test flow:**
   - Send trigger message to your Instagram account
   - Answer all questions
   - Verify API receives data
   - Check response in ManyChat

### Step 2: Test API Response

**Expected Response:**
```json
{
  "success": true,
  "setupSessionToken": "abc123...",
  "completionLink": "https://hookahplus.net/launchpad?token=abc123&source=manychat",
  "previewAssets": {
    "qrCodes": "https://hookahplus.net/api/launchpad/preview/qr?token=abc123",
    "posGuide": "https://hookahplus.net/api/launchpad/preview/pos-guide?token=abc123",
    "checklist": "https://hookahplus.net/api/launchpad/preview/checklist?token=abc123"
  },
  "message": "Setup session created. User can complete LaunchPad via web app."
}
```

### Step 3: Test Completion Link

1. Click completion link from ManyChat DM
2. Verify LaunchPad loads with pre-filled data
3. Complete remaining steps
4. Verify redirect to dashboard works

---

## 📱 ManyChat Message Templates

### Template 1: Initial Trigger Response

```
🚀 H+ LaunchPad - Get Live Tonight!

I'll help you set up your lounge in 5 minutes. Ready to start?

Reply YES to begin.
```

### Template 2: After Data Collection

```
Perfect! I've got your info:

• Lounge: {{custom_field.lounge_name}}
• City: {{custom_field.city}}
• Tables: {{custom_field.seats_tables}}
• POS: {{custom_field.pos_used}}

Setting up your Go-Live Kit now... ⚡
```

### Template 3: Success with Links

```
🎉 Your Go-Live Kit is ready!

Complete setup (10 min):
👉 {{completion_link}}

Preview your assets:
• QR Codes: {{qr_codes_link}}
• Staff Guide: {{pos_guide_link}}
• Week-1 Checklist: {{checklist_link}}

Once you complete setup, your lounge goes live! 🚀
```

### Template 4: Follow-up (24 hours later)

```
Hey! 👋

I noticed you started setting up {{custom_field.lounge_name}} but didn't finish.

Want to complete it? Just click:
{{completion_link}}

Takes 10 minutes and you'll be live tonight! ⚡
```

---

## 🔐 Security & Best Practices

### 1. API Authentication

**Current:** No authentication (public endpoint)  
**Recommended:** Add API key validation

**Update API endpoint:**
```typescript
// In manychat-setup/route.ts
const apiKey = req.headers.get('x-manychat-api-key');
if (apiKey !== process.env.MANYCHAT_API_KEY) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

**Set in ManyChat:**
- Add header: `x-manychat-api-key: [YOUR_MANYCHAT_SECRET_KEY]`
- Store key in ManyChat Settings → Integrations
- **Note:** Replace `[YOUR_MANYCHAT_SECRET_KEY]` with your actual secret key

### 2. Rate Limiting

**Add to API endpoint:**
- Limit: 10 requests per Instagram user per hour
- Use `subscriber_id` for tracking

### 3. Error Handling

**Always handle:**
- API timeouts
- Invalid data
- Missing required fields
- Network errors

**User-friendly error messages:**
```
Something went wrong. Please try again or contact support@hookahplus.net
```

---

## 📊 Analytics & Tracking

### Track These Metrics:

1. **Flow Entry:** How many users trigger LaunchPad
2. **Completion Rate:** How many complete all questions
3. **API Success Rate:** How many successful API calls
4. **Web Completion:** How many complete on web app
5. **Time to Complete:** Average time from trigger to Go Live

### ManyChat Analytics:

- Go to **Analytics** → **Flows**
- Select "H+ LaunchPad Concierge"
- Track:
  - Users entered
  - Users completed
  - Drop-off points
  - Average completion time

---

## 🚀 Launch Checklist

Before going live:

- [ ] Flow created and tested
- [ ] All custom fields created
- [ ] External Request URL points to production
- [ ] API key configured (if using authentication)
- [ ] Response parsing tested
- [ ] Completion links work
- [ ] Preview asset links work
- [ ] Error handling tested
- [ ] Follow-up automation configured (optional)
- [ ] Analytics tracking enabled

---

## 🐛 Troubleshooting

### Issue: External Request Fails

**Symptoms:** ManyChat shows "Request failed"

**Solutions:**
1. Check API URL is correct
2. Verify API is accessible (not behind firewall)
3. Check request body format matches API expectations
4. Verify API returns 200 status code
5. Check ManyChat logs for error details

### Issue: Response Variables Don't Work

**Symptoms:** `{{custom_field.launchpad_response.completionLink}}` shows as blank

**Solutions:**
1. Use Function action to parse JSON first
2. Save individual fields instead of nested JSON
3. Check response format matches ManyChat expectations

### Issue: Completion Link Doesn't Pre-fill Data

**Symptoms:** LaunchPad loads but data is empty

**Solutions:**
1. Verify token is passed correctly in URL
2. Check SetupSession was created with prefillData
3. Verify `loadSetupSession` returns correct progress
4. Check browser console for errors

---

## 📚 Additional Resources

- **ManyChat Docs:** https://manychat.com/dynamic_block_docs
- **External Request Guide:** https://manychat.com/dynamic_block_docs/external_request
- **Custom Fields:** https://manychat.com/dynamic_block_docs/custom_fields
- **Your API Endpoint:** `/api/launchpad/manychat-setup`

---

## ✅ Success Criteria

Your ManyChat flow is ready when:

1. ✅ User can trigger via Instagram comment/DM
2. ✅ Flow collects all required data
3. ✅ API receives data and creates SetupSession
4. ✅ User receives completion link in DM
5. ✅ Completion link pre-fills LaunchPad
6. ✅ User can complete setup on web app
7. ✅ User redirects to dashboard after Go Live

---

**Next Steps After Setup:**
1. Test end-to-end flow
2. Monitor analytics
3. Optimize drop-off points
4. Add follow-up automation
5. Scale to multiple Instagram accounts

