# ManyChat Hot IG Lead Engine Setup Guide

## Overview

This guide walks you through setting up the Hot IG Lead Engine that automatically captures Instagram engagement, qualifies leads, and delivers demo links via ManyChat.

## Architecture Flow

1. **Trigger** → User comments/DMs/story replies with keywords (DEMO, HOOKAH, etc.)
2. **ManyChat** → Detects trigger, sends webhook to our endpoint
3. **Webhook Handler** → Creates lead in operator-onboarding system
4. **ManyChat Flow** → Qualifies lead (asks questions, tags user)
5. **Demo Link API** → ManyChat calls our API to get demo link when qualified
6. **Delivery** → ManyChat sends demo link/Calendly to user

## Prerequisites

- ManyChat account with Instagram connected
- Instagram Business Account
- Webhook endpoint deployed and accessible
- Environment variables configured

## Quick Start: Automated Setup

**Want to automate the setup?** Run our setup script to generate secrets and configure environment variables:

```bash
# On Linux/Mac:
bash scripts/setup-manychat.sh

# On Windows (PowerShell):
.\scripts\setup-manychat.ps1
```

This script will:
- ✅ Generate secure webhook secrets
- ✅ Create/update `.env.local` with required variables
- ✅ Verify API endpoints exist
- ❌ Cannot configure ManyChat dashboard (manual step required)

**What still needs to be done manually:**
- Set up External Request actions in ManyChat automations (Step 2)
- Set up Instagram triggers (Step 3)
- Create qualification flow (Step 4)
- Configure API calls in flow (Step 5)

---

## Step 1: Configure Environment Variables

**Important:** The webhook secret and verify token are values that YOU generate/choose yourself - they are NOT found in ManyChat's Public API settings page. These are used by your webhook endpoint to verify requests (optional but recommended for security).

### Generate Required Values

1. **Generate Webhook Secret:**
   ```bash
   # On Linux/Mac:
   openssl rand -hex 32
   
   # On Windows (PowerShell):
   -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
   
   # Or use an online generator: https://randomkeygen.com/
   ```
   This should be a secure random string, minimum 32 characters.

2. **Choose Verify Token:**
   - You can use the default: `hookahplus_manychat_verify`
   - Or choose your own custom token (e.g., `your_company_verify_token_2024`)
   - This token will be used during webhook verification

### Add to Environment Variables

Add these to your `.env.local` (local) and Vercel environment variables (production):

```bash
# ManyChat Integration
MANYCHAT_WEBHOOK_SECRET=your_generated_secret_here_minimum_32_chars
MANYCHAT_VERIFY_TOKEN=hookahplus_manychat_verify

# Webhook API Key (for internal webhook calls to bypass auth in production)
WEBHOOK_API_KEY=your_secure_webhook_api_key_here_minimum_32_chars

# Calendly Integration
NEXT_PUBLIC_CALENDLY_URL=https://calendly.com/your-username/your-event-type
```

**Note:** 
- `MANYCHAT_WEBHOOK_SECRET`: Use the secret you generated above (minimum 32 characters)
- `MANYCHAT_VERIFY_TOKEN`: Use the token you chose (default: `hookahplus_manychat_verify`)
- `WEBHOOK_API_KEY`: Generate another secure random string (minimum 32 characters) - this allows webhook calls to bypass authentication in production

## Step 2: Set Up External Request Actions in ManyChat

**⚠️ Important:** ManyChat uses External Request actions within automations, not a global webhook configuration. This feature is available on paid plans (Pro starts at $15/month).

### Approach: External Request in Each Automation

For each Instagram trigger type (Comments, DMs, Story Replies), you'll create an automation that:
1. Triggers on keywords/interactions
2. Sends an External Request (POST) to your webhook endpoint
3. Then continues to the qualification flow

### Your Webhook Endpoint

- **Production**: `https://app.hookahplus.net/api/webhooks/manychat`
- **Development**: `http://localhost:3002/api/webhooks/manychat` (use ngrok for testing)

### Configuration for Each Automation

**External Request Settings:**
- **Method**: POST
- **URL**: `https://app.hookahplus.net/api/webhooks/manychat`
- **Headers**: `Content-Type: application/json`
- **Body**: JSON with contact data (see examples in Step 3)

**Note:** The webhook endpoint will handle signature verification if `MANYCHAT_WEBHOOK_SECRET` is configured, but External Request actions may not include signatures. The endpoint is designed to work with or without signature verification for flexibility.

## Step 3: Set Up Instagram Triggers with External Request

### A. Comment Trigger

1. Go to **Automation** → **Instagram** → **Comments**
2. Create new automation
3. **Trigger Settings:**
   - **Post/Reel**: Select specific post or "Any post"
   - **Keywords**: `DEMO`, `HOOKAH`, `HOOKAHPLUS`, `LOUNGE`
4. **Add Action: External Request**
   - **Method**: POST
   - **URL**: `https://app.hookahplus.net/api/webhooks/manychat`
   - **Headers**: `Content-Type: application/json`
   - **Body (JSON)**:
     ```json
     {
       "event_type": "comment",
       "user": {
         "id": "{{subscriber_id}}",
         "instagram_username": "{{instagram_username}}",
         "instagram_id": "{{instagram_id}}",
         "name": "{{first_name}} {{last_name}}",
         "email": "{{email}}",
         "phone": "{{phone}}",
         "tags": {{tags}},
         "custom_fields": {
           "business_name": "{{custom_field.business_name}}",
           "order_method": "{{custom_field.order_method}}",
           "location": "{{custom_field.location}}",
           "seating_types": "{{custom_field.seating_types}}",
           "total_capacity": "{{custom_field.total_capacity}}",
           "number_of_tables": "{{custom_field.number_of_tables}}",
           "average_session_duration": "{{custom_field.average_session_duration}}",
           "current_pos": "{{custom_field.current_pos}}",
           "pricing_model": "{{custom_field.pricing_model}}",
           "preferred_features": "{{custom_field.preferred_features}}",
           "facebook_url": "{{custom_field.facebook_url}}",
           "website_url": "{{custom_field.website_url}}",
           "base_hookah_price": "{{custom_field.base_hookah_price}}",
           "refill_price": "{{custom_field.refill_price}}",
           "menu_link": "{{custom_field.menu_link}}"
         }
       },
       "comment": {
         "text": "{{comment_text}}"
       }
     }
     ```
5. **Then add:** Send to Flow → **Hot IG Lead – Operator Demo** (create this flow in Step 4)

### B. DM Keyword Trigger

1. Go to **Automation** → **Instagram** → **Keywords**
2. Create new automation
3. **Trigger Settings:**
   - **Keywords**: `DEMO`, `HOOKAHPLUS`, `DASHBOARD`
4. **Add Action: External Request**
   - Same URL and headers as above
   - **Body (JSON)**:
     ```json
     {
       "event_type": "message",
       "user": {
         "id": "{{subscriber_id}}",
         "instagram_username": "{{instagram_username}}",
         "instagram_id": "{{instagram_id}}",
         "name": "{{first_name}} {{last_name}}",
         "email": "{{email}}",
         "phone": "{{phone}}",
         "tags": {{tags}},
         "custom_fields": {
           "business_name": "{{custom_field.business_name}}",
           "order_method": "{{custom_field.order_method}}",
           "location": "{{custom_field.location}}",
           "seating_types": "{{custom_field.seating_types}}",
           "total_capacity": "{{custom_field.total_capacity}}",
           "number_of_tables": "{{custom_field.number_of_tables}}",
           "average_session_duration": "{{custom_field.average_session_duration}}",
           "current_pos": "{{custom_field.current_pos}}",
           "pricing_model": "{{custom_field.pricing_model}}",
           "preferred_features": "{{custom_field.preferred_features}}",
           "facebook_url": "{{custom_field.facebook_url}}",
           "website_url": "{{custom_field.website_url}}",
           "base_hookah_price": "{{custom_field.base_hookah_price}}",
           "refill_price": "{{custom_field.refill_price}}",
           "menu_link": "{{custom_field.menu_link}}"
         }
       },
       "message": {
         "text": "{{message_text}}"
       }
     }
     ```
5. **Then add:** Send to Flow → **Hot IG Lead – Operator Demo**

### C. Story Reply Trigger

1. Go to **Automation** → **Instagram** → **Story Reply**
2. Create new automation
3. **Trigger Settings:**
   - **Story**: "Any Story" or specific story
4. **Add Action: External Request**
   - Same URL and headers
   - **Body (JSON)**:
     ```json
     {
       "event_type": "story_reply",
       "user": {
         "id": "{{subscriber_id}}",
         "instagram_username": "{{instagram_username}}",
         "instagram_id": "{{instagram_id}}",
         "name": "{{first_name}} {{last_name}}",
         "email": "{{email}}",
         "phone": "{{phone}}",
         "tags": {{tags}},
         "custom_fields": {
           "business_name": "{{custom_field.business_name}}",
           "order_method": "{{custom_field.order_method}}",
           "location": "{{custom_field.location}}",
           "seating_types": "{{custom_field.seating_types}}",
           "total_capacity": "{{custom_field.total_capacity}}",
           "number_of_tables": "{{custom_field.number_of_tables}}",
           "average_session_duration": "{{custom_field.average_session_duration}}",
           "current_pos": "{{custom_field.current_pos}}",
           "pricing_model": "{{custom_field.pricing_model}}",
           "preferred_features": "{{custom_field.preferred_features}}",
           "facebook_url": "{{custom_field.facebook_url}}",
           "website_url": "{{custom_field.website_url}}",
           "base_hookah_price": "{{custom_field.base_hookah_price}}",
           "refill_price": "{{custom_field.refill_price}}",
           "menu_link": "{{custom_field.menu_link}}"
         }
       },
       "story_reply": {
         "text": "{{story_reply_text}}"
       }
     }
     ```
5. **Then add:** Send to Flow → **Hot IG Lead – Operator Demo**

## Step 4: Build the Qualification Flow

Create a flow named **"Hot IG Lead – Operator Demo"** in ManyChat:

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

### Conditional: If "Yes" → Qualify Further

**Message #2:**
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
- **Watch quick demo** → Action: Make API Request (see Step 5)
- **Book setup call** → Action: Open URL → `{{calendly_url}}`

### Follow-up Nudge (Smart Delay)

**Condition:** After 1-2 hours, if user hasn't clicked demo link

**Smart Delay:** 1 hour

**Condition Check:** User does NOT have tag `Clicked: Demo` OR `Clicked: Calendly`

**Message:**
```
Just checking in, {{first_name}} — still want the 2-minute Hookah+ demo or a quick setup call?

You can always type DEMO here and I'll send it again.
```

**Buttons:** Same as Message #3

## Step 5: Configure Demo Link API Call

When user clicks "Watch quick demo" button, ManyChat should call your API:

### API Request Configuration

1. In ManyChat Flow, add **"Make API Request"** action
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

After API call succeeds, send message:

**Text:**
```
Here's your 2-minute demo link:

{{custom_field.demo_link}}

Click to see how Hookah+ works for lounges like yours.
```

**Button:**
- **Open Demo** → Open URL → `{{custom_field.demo_link}}`

## Step 6: Testing

### Test Webhook Endpoint

1. **Verification Test:**
   ```bash
   curl "https://app.hookahplus.net/api/webhooks/manychat?hub.mode=subscribe&hub.verify_token=hookahplus_manychat_verify&hub.challenge=test123"
   ```
   Should return: `test123`

2. **Event Test:**
   ```bash
   curl -X POST https://app.hookahplus.net/api/webhooks/manychat \
     -H "Content-Type: application/json" \
     -H "x-manychat-signature: sha256=..." \
     -d '{
       "event_type": "message",
       "user": {
         "id": "123",
         "instagram_username": "test_lounge",
         "name": "Test Lounge",
         "tags": ["Lead: Operator"]
       }
     }'
   ```

### Test Demo Link API

```bash
curl -X POST https://app.hookahplus.net/api/manychat/generate-demo-link \
  -H "Content-Type: application/json" \
  -d '{
    "instagramUsername": "test_lounge"
  }'
```

Expected response:
```json
{
  "success": true,
  "demoLink": "https://app.hookahplus.net/demo/test-lounge",
  "calendlyUrl": "https://calendly.com/clark-dwayne/new-meeting",
  "leadId": "...",
  "businessName": "Test Lounge"
}
```

### End-to-End Test

1. Comment on your Instagram post with keyword "DEMO"
2. Check ManyChat logs to see if flow started
3. Answer qualification questions
4. Verify lead appears in Operator Onboarding dashboard
5. Verify demo link is generated and sent

## Step 7: Monitor & Optimize

### Check Operator Onboarding Dashboard

1. Go to `/admin/operator-onboarding`
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

## FAQ

### Where do I find the Webhook Secret and Verify Token?

**Answer:** You don't find them in ManyChat - you generate/choose them yourself!

- **Webhook Secret**: Generate a secure random string (see Step 1 for commands)
- **Verify Token**: Choose any token you want (default: `hookahplus_manychat_verify`)

These values are stored in your environment variables and also entered into ManyChat when configuring the webhook. They must match on both sides.

**Common Mistake:** ManyChat doesn't use a global webhook configuration. Instead, you use External Request actions within each automation. This requires a paid plan (Pro+).

### What's the difference between API Key and External Request?

- **API Key** (Public API section): Used when YOUR application makes API calls TO ManyChat
- **External Request** (Automation actions): Used when ManyChat sends data TO YOUR application via POST requests
- **Webhook Secret**: Used by your endpoint to verify requests (optional but recommended for security)

External Request actions are configured within each automation, not in a global settings page.

## Troubleshooting

### Webhook Not Receiving Events

1. Check External Request URL is correct: `https://app.hookahplus.net/api/webhooks/manychat`
2. Verify External Request is configured BEFORE "Send to Flow" action in automation
3. Check Vercel server logs for errors
4. Ensure Instagram is connected to ManyChat
5. Verify you're on a paid ManyChat plan (External Request requires Pro+)
6. Test the External Request action manually in ManyChat to see error messages

### Leads Not Creating

1. Check webhook logs for errors
2. Verify operator-onboarding API is accessible
3. Check database connection
4. Verify lead data format matches expected schema

### Demo Links Not Generating

1. Verify `NEXT_PUBLIC_APP_URL` is set correctly
2. Check demo link API logs
3. Verify lead exists in database
4. Check tenant creation permissions

## Next Steps

1. **Scale:** Clone flow for different trigger types
2. **Personalize:** Use custom fields to personalize messages
3. **Automate:** Set up automated follow-ups based on engagement
4. **Integrate:** Connect to CRM for advanced lead management

## Support

For issues or questions:
- Check server logs: `apps/app/logs/`
- Review webhook payloads in ManyChat dashboard
- Test endpoints individually using curl/Postman

