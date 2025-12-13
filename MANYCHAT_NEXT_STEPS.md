# ManyChat Setup - Next Steps Checklist

## ✅ Completed
- [x] Generated webhook secrets and verify token
- [x] Created Pomelli campaigns (3 pillars with animations)

---

## 🔧 Step 1: Add Environment Variables to Vercel (Production)

**Go to:** https://vercel.com/dashboard → Your Project → Settings → Environment Variables

**Add these 3 variables for Production environment:**

```bash
MANYCHAT_WEBHOOK_SECRET=<paste the secret from your terminal>
MANYCHAT_VERIFY_TOKEN=hookahplus_manychat_verify
WEBHOOK_API_KEY=<paste the API key from your terminal>
```

**Also add (if not already set):**
```bash
NEXT_PUBLIC_CALENDLY_URL=https://calendly.com/your-username/your-event-type
```

**After adding:**
- ✅ Redeploy the project to apply new environment variables
- ✅ Verify deployment succeeded

---

## 📱 Step 2: Configure ManyChat Webhook

**Go to:** https://manychat.com → Dashboard → Settings → Integrations → Webhooks

**⚠️ Important:** This is NOT the "Public API" section. Webhooks are configured separately.

**Click "Add Webhook" or "Create Webhook" and enter:**

- **Webhook URL:** `https://app.hookahplus.net/api/webhooks/manychat`
- **Verify Token:** `hookahplus_manychat_verify` (or the token you generated)
- **Secret:** `<paste the MANYCHAT_WEBHOOK_SECRET from your terminal>`
- **Events to Subscribe:** Select all of these:
  - ✅ `message` (DMs)
  - ✅ `comment` (Post/Reel comments)
  - ✅ `story_reply` (Story replies)
  - ✅ `flow_started` (User enters automation)

**Test:** ManyChat will automatically send a GET request to verify the webhook. Check your Vercel logs to confirm it succeeded.

---

## 🎯 Step 3: Connect Instagram to ManyChat

**Prerequisites:**
- Instagram Business Account (not personal)
- Facebook Page connected to your Instagram account

**Steps:**
1. Go to ManyChat → Settings → Instagram
2. Click "Connect Instagram"
3. Follow Facebook OAuth flow
4. Grant necessary permissions
5. Verify connection shows as "Connected"

---

## 🔔 Step 4: Set Up Instagram Triggers

### A. Comment Trigger (Keywords in Comments)

**Go to:** Automation → Instagram → Comments

**Create new automation:**
- **Post/Reel:** Select "Any post" (or specific posts)
- **Keywords:** `DEMO`, `HOOKAH`, `HOOKAHPLUS`, `LOUNGE`
- **Action:** Send to Flow → **"Hot IG Lead – Operator Demo"** (you'll create this in Step 5)

### B. DM Keyword Trigger

**Go to:** Automation → Instagram → Keywords

**Create new automation:**
- **Keywords:** `DEMO`, `HOOKAHPLUS`, `DASHBOARD`
- **Action:** Send to Flow → **"Hot IG Lead – Operator Demo"**

### C. Story Reply Trigger

**Go to:** Automation → Instagram → Story Reply

**Create new automation:**
- **Story:** "Any Story" (or specific stories)
- **Action:** Send to Flow → **"Hot IG Lead – Operator Demo"**

---

## 💬 Step 5: Create Qualification Flow in ManyChat

**Create a new flow named:** `Hot IG Lead – Operator Demo`

### Message #1 – Hook & Qualification

**Text:**
```
Hey {{first_name}} 👋 thanks for checking us out!

Are you running a hookah lounge or bar right now?
```

**Quick Reply Buttons:**
- **Yes** → Action: Add Tag `Lead: Operator` + `IG Hot Lead`
- **Not yet** → Action: Add Tag `Lead: Future Owner`
- **Just curious** → Action: Add Tag `Lead: Curious`

### Conditional: If "Yes" → Message #2

**Text:**
```
Love it. How are you taking hookah orders right now?
```

**Quick Reply Buttons:**
- **Paper** → Action: Add Tag `Ops: Paper` + Set Custom Field `order_method` = "Paper"
- **POS only** → Action: Add Tag `Ops: POS` + Set Custom Field `order_method` = "POS only"
- **DMs / WhatsApp** → Action: Add Tag `Ops: DMs` + Set Custom Field `order_method` = "DMs"
- **Other** → Action: Add Tag `Ops: Other` + Set Custom Field `order_method` = "Other"

### Message #3 – Deliver Demo Link

**Condition:** Only if user has tag `Lead: Operator`

**Text:**
```
Got it. I can show you in 2 minutes how lounges turn IG into tracked sessions + upsells with Hookah+.

What's better for you right now?
```

**Buttons:**
- **Watch quick demo** → Action: Make API Request (configure in Step 6)
- **Book setup call** → Action: Open URL → `{{calendly_url}}`

---

## 🔌 Step 6: Configure API Request in Flow

**When user clicks "Watch quick demo" button:**

1. **Add "Make API Request" action** to your flow
2. **Request Type:** POST
3. **URL:** `https://app.hookahplus.net/api/manychat/generate-demo-link`
4. **Headers:**
   ```
   Content-Type: application/json
   ```
5. **Body (JSON):**
   ```json
   {
     "instagramUsername": "{{instagram_username}}",
     "businessName": "{{custom_field.business_name}}"
   }
   ```
6. **Response Handling:**
   - Store `{{api_response.demoLink}}` in custom field `demo_link`
   - Store `{{api_response.calendlyUrl}}` in custom field `calendly_url`
   - Add tag `Clicked: Demo`

### Send Demo Link to User

**After API call succeeds, send message:**

**Text:**
```
Here's your 2-minute demo link:

{{custom_field.demo_link}}

Click to see how Hookah+ works for lounges like yours.
```

**Button:**
- **Open Demo** → Open URL → `{{custom_field.demo_link}}`

---

## 🧪 Step 7: Test End-to-End

### Test Webhook Verification

```bash
curl "https://app.hookahplus.net/api/webhooks/manychat?hub.mode=subscribe&hub.verify_token=hookahplus_manychat_verify&hub.challenge=test123"
```

**Expected:** Should return `test123`

### Test Instagram Trigger

1. Comment on your Instagram post with keyword "DEMO"
2. Check ManyChat logs to see if flow started
3. Answer qualification questions
4. Verify lead appears in Operator Onboarding dashboard: `/admin/operator-onboarding`
5. Verify demo link is generated and sent

---

## 📊 Step 8: Monitor & Verify

### Check Operator Onboarding Dashboard

1. Go to: `https://app.hookahplus.net/admin/operator-onboarding`
2. Look for leads with source `instagram-manychat`
3. Verify lead data includes:
   - Instagram username
   - Tags from ManyChat
   - Order method
   - Demo link (if generated)

### ManyChat Analytics

- Track flow completion rates
- Monitor which triggers convert best
- A/B test qualification questions
- Optimize follow-up timing

---

## 🎉 Success Criteria

You're all set when:
- ✅ Webhook verified in ManyChat
- ✅ Instagram connected and triggers active
- ✅ Flow created and linked to triggers
- ✅ API request configured and tested
- ✅ Test lead created successfully
- ✅ Demo link generated and delivered via Instagram DM

---

## 🆘 Troubleshooting

### Webhook Not Receiving Events
- Check webhook URL is correct in ManyChat
- Verify webhook secret matches
- Check Vercel server logs for errors
- Ensure Instagram is connected to ManyChat

### Leads Not Creating
- Check webhook logs for errors
- Verify operator-onboarding API is accessible
- Check database connection
- Verify lead data format matches expected schema

### Demo Links Not Generating
- Verify `NEXT_PUBLIC_APP_URL` is set correctly in Vercel
- Check demo link API logs
- Verify lead exists in database
- Check tenant creation permissions

---

## 📚 Reference

- Full setup guide: `docs/MANYCHAT_SETUP_GUIDE.md`
- Automation status: `docs/MANYCHAT_AUTOMATION_STATUS.md`
- Webhook endpoint: `apps/app/app/api/webhooks/manychat/route.ts`
- Demo link API: `apps/app/app/api/manychat/generate-demo-link/route.ts`

