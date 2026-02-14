# ManyChat Quick Start - 5 Minute Setup

**Goal:** Get LaunchPad working via Instagram DM in 5 minutes

---

## ⚡ Quick Setup (5 Steps)

### 1. Create Flow
- ManyChat Dashboard → **Flows** → **Create Flow**
- Name: "H+ LaunchPad"

### 2. Add Trigger
- **Trigger:** Keyword "LAUNCHPAD" (or DM "start")
- **Platform:** Instagram

### 3. Add Questions (In Order)

**Question 1: Lounge Name**
- Type: Text
- Save to: `lounge_name`
- Message: "What's your lounge name?"

**Question 2: City**
- Type: Text
- Save to: `city`
- Message: "What city?"

**Question 3: Tables**
- Type: Number
- Save to: `seats_tables`
- Message: "How many tables?"

**Question 4: POS**
- Type: Multiple Choice
- Options: Square, Clover, Toast, Other, None
- Save to: `pos_used`
- Message: "Which POS do you use?"

**Question 5: Session Type**
- Type: Multiple Choice
- Options: Flat fee, Timed
- Save to: `session_type`
- Message: "How do you charge?"

**Question 6: Price**
- Type: Number
- Save to: `price_range`
- Message: "Base session price? (e.g., 25 for $25)"

**Question 7: Flavors (Optional)**
- Type: Text
- Save to: `top_5_flavors`
- Message: "Top 5 flavors? (comma-separated)"

### 4. Add External Request

**Action:** External Request

**URL:** `https://hookahplus.net/api/launchpad/manychat-setup`

**Method:** POST

**Body:**
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

**Save Response To:** `launchpad_response`

### 5. Send Response Message

**Action:** Send Message

**Message:**
```
🎉 Your Go-Live Kit is ready!

Complete setup (10 min):
{{custom_field.launchpad_response.completionLink}}

Preview assets:
{{custom_field.launchpad_response.previewAssets.qrCodes}}

Your lounge goes live once you complete setup! 🚀
```

---

## 🧪 Test It

1. Comment "LAUNCHPAD" on your Instagram post
2. Answer all questions in DM
3. Check if you receive completion link
4. Click link → Should open LaunchPad with pre-filled data

---

## ✅ Done!

Your ManyChat flow is ready. Users can now start LaunchPad via Instagram DM!

**Next:** See `MANYCHAT_FLOW_BUILDER_GUIDE.md` for advanced configuration.

