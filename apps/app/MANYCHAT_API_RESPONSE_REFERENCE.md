# ManyChat API Response Reference

**Endpoint:** `POST /api/launchpad/manychat-setup`

This document describes the API response structure for ManyChat External Request integration.

---

## ✅ Success Response Structure

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
  "launchpad_completion_link": "https://hookahplus.net/launchpad?token=abc123&source=manychat",
  "launchpad_qr_codes": "https://hookahplus.net/api/launchpad/preview/qr?token=abc123",
  "launchpad_pos_guide": "https://hookahplus.net/api/launchpad/preview/pos-guide?token=abc123",
  "launchpad_checklist": "https://hookahplus.net/api/launchpad/preview/checklist?token=abc123",
  "message": "🎉 Your Go-Live Kit is ready!\n\nI've set up your lounge: Lounge Name\n\n📱 Complete your setup (10 minutes):\nhttps://hookahplus.net/launchpad?token=abc123&source=manychat\n\n✨ Preview your assets:\n• QR Codes: https://hookahplus.net/api/launchpad/preview/qr?token=abc123\n• POS Guide: https://hookahplus.net/api/launchpad/preview/pos-guide?token=abc123\n• Week-1 Checklist: https://hookahplus.net/api/launchpad/preview/checklist?token=abc123\n\nYour lounge will be live tonight once you complete setup! 🚀",
  "preliminaryConfig": { ... }
}
```

---

## 📋 ManyChat JSONPath Mappings

### Option A: Top-Level Fields (Recommended - Easier)

Use these JSONPath expressions in ManyChat Response Mapping:

```
launchpad_completion_link = $.launchpad_completion_link
launchpad_qr_codes = $.launchpad_qr_codes
launchpad_pos_guide = $.launchpad_pos_guide
launchpad_checklist = $.launchpad_checklist
```

### Option B: Nested Fields (Backup)

If top-level fields don't work, use nested paths:

```
launchpad_completion_link = $.completionLink
launchpad_qr_codes = $.previewAssets.qrCodes
launchpad_pos_guide = $.previewAssets.posGuide
launchpad_checklist = $.previewAssets.checklist
```

---

## ❌ Error Response Structure

```json
{
  "success": false,
  "error": "Failed to create setup session",
  "message": "Hmm, something went wrong. 😔\n\nFailed to create setup session. Please try again.\n\nPlease try again or contact support.",
  "fallbackMessage": "Quick update: I couldn't generate your kit automatically. Reply 'LAUNCHPAD' again in 2 minutes, or type 'HELP' to get support.",
  "details": "Error details here..."
}
```

---

## 🔧 Custom Field Mappings

### Input Fields (from ManyChat → API)

| ManyChat Custom Field | API Field | Type | Required |
|----------------------|-----------|------|----------|
| `lounge_name` | `custom_fields.lounge_name` | Text | Yes |
| `city` | `custom_fields.city` | Text | Yes |
| `seats_tables` | `custom_fields.seats_tables` | Number | Yes |
| `pos_used` | `custom_fields.pos_used` | Text | Yes |
| `session_type` | `custom_fields.session_type` | Text | Yes* |
| `price_range` | `custom_fields.price_range` | Number | Yes |
| `top_5_flavors` | `custom_fields.top_5_flavors` | Text | No |

*Note: `session_type` is normalized:
- "Flat fee (same price regardless of time)" → "Flat fee"
- "Timed (charge by the hour)" → "Timed"

### Output Fields (from API → ManyChat)

| API Response Field | ManyChat Custom Field | JSONPath |
|-------------------|----------------------|----------|
| `launchpad_completion_link` | `launchpad_completion_link` | `$.launchpad_completion_link` |
| `launchpad_qr_codes` | `launchpad_qr_codes` | `$.launchpad_qr_codes` |
| `launchpad_pos_guide` | `launchpad_pos_guide` | `$.launchpad_pos_guide` |
| `launchpad_checklist` | `launchpad_checklist` | `$.launchpad_checklist` |

---

## 📝 ManyChat Flow Configuration

### Step 10: Response Mapping

In ManyChat, after the External Request step, add a **Response Mapping** or **Function** action:

**Method 1: Response Mapping (if available)**
- Map `$.launchpad_completion_link` → `launchpad_completion_link`
- Map `$.launchpad_qr_codes` → `launchpad_qr_codes`
- Map `$.launchpad_pos_guide` → `launchpad_pos_guide`
- Map `$.launchpad_checklist` → `launchpad_checklist`

**Method 2: Function Action (if Response Mapping not available)**
```javascript
// Parse JSON response and extract fields
const response = JSON.parse(input.launchpad_response);
return {
  launchpad_completion_link: response.launchpad_completion_link || response.completionLink,
  launchpad_qr_codes: response.launchpad_qr_codes || response.previewAssets?.qrCodes,
  launchpad_pos_guide: response.launchpad_pos_guide || response.previewAssets?.posGuide,
  launchpad_checklist: response.launchpad_checklist || response.previewAssets?.checklist
};
```

---

## ✅ Success Message Template

Use this in ManyChat Step 11 (Success Message):

```
🎉 Your Go-Live Kit is ready!

I've set up your lounge: {{custom_field.lounge_name}}

📱 Complete your setup (10 minutes):
{{custom_field.launchpad_completion_link}}

✨ Preview your assets:
• QR Codes: {{custom_field.launchpad_qr_codes}}
• POS Guide: {{custom_field.launchpad_pos_guide}}
• Week-1 Checklist: {{custom_field.launchpad_checklist}}

Your lounge will be live tonight once you complete setup! 🚀
```

---

## ❌ Error Handling

If the External Request fails, use the `fallbackMessage` from the error response:

```
{{custom_field.launchpad_response.fallbackMessage}}
```

Or use the hardcoded fallback:
```
Quick update: I couldn't generate your kit automatically. Reply 'LAUNCHPAD' again in 2 minutes, or type 'HELP' to get support.
```

---

## 🧪 Testing

### Test Request

```bash
curl -X POST https://hookahplus.net/api/launchpad/manychat-setup \
  -H "Content-Type: application/json" \
  -d '{
    "subscriber_id": "test123",
    "instagram_username": "test_user",
    "custom_fields": {
      "lounge_name": "Test Lounge",
      "city": "Atlanta",
      "seats_tables": "10",
      "pos_used": "Square",
      "session_type": "Flat fee (same price regardless of time)",
      "price_range": "25",
      "top_5_flavors": "Strawberry, Blueberry, Mint"
    }
  }'
```

### Expected Response

- `success: true`
- `launchpad_completion_link` contains valid URL
- `launchpad_qr_codes` contains valid URL
- `launchpad_pos_guide` contains valid URL
- `launchpad_checklist` contains valid URL
- `session_type` normalized to "Flat fee" or "Timed"

---

## 📚 Related Documentation

- `MANYCHAT_FLOW_BUILDER_GUIDE.md` - Complete flow setup guide
- `MANYCHAT_QUICK_START.md` - Quick 5-minute setup
- `/api/launchpad/manychat-setup/route.ts` - API implementation

---

**Last Updated:** 2025-01-03  
**API Version:** 1.0

