# ManyChat Response Sanity Check ✅

**Purpose:** Verify API response structure matches ManyChat JSONPath expectations

**Last Verified:** 2025-01-03

---

## ✅ Response Structure Verification

### Required Fields for ManyChat JSONPath

ManyChat expects these fields to be **strings (URLs)**:

| JSONPath | Field | Type | Status |
|----------|-------|------|--------|
| `$.completionLink` | `completionLink` | String (URL) | ✅ Verified |
| `$.previewAssets.qrCodes` | `previewAssets.qrCodes` | String (URL) | ✅ Verified |
| `$.previewAssets.posGuide` | `previewAssets.posGuide` | String (URL) | ✅ Verified |
| `$.previewAssets.checklist` | `previewAssets.checklist` | String (URL) | ✅ Verified |

---

## 📋 Actual API Response Structure

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
  "message": "...",
  "preliminaryConfig": { ... }
}
```

---

## ✅ Verification Checklist

- [x] `completionLink` is a **string** (URL)
- [x] `previewAssets.qrCodes` is a **string** (URL), not an array/object
- [x] `previewAssets.posGuide` is a **string** (URL)
- [x] `previewAssets.checklist` is a **string** (URL)
- [x] All values are explicitly cast to strings (sanity check in code)
- [x] Top-level aliases provided for easier mapping
- [x] Nested structure matches ManyChat expectations

---

## 🔍 Code Verification

### In `manychat-setup/route.ts`:

```typescript
// ✅ All values are strings (URLs)
const previewAssets = {
  qrCodes: `${baseUrl}/api/launchpad/preview/qr?token=${session.token}`, // String
  posGuide: `${baseUrl}/api/launchpad/preview/pos-guide?token=${session.token}`, // String
  checklist: `${baseUrl}/api/launchpad/preview/checklist?token=${session.token}`, // String
};

// ✅ Explicit string conversion (sanity check)
const completionLinkStr = String(completionLink);
const qrCodesStr = String(previewAssets.qrCodes);
const posGuideStr = String(previewAssets.posGuide);
const checklistStr = String(previewAssets.checklist);

// ✅ Response includes both nested and top-level fields
return NextResponse.json({
  completionLink: completionLinkStr, // $.completionLink
  previewAssets: {
    qrCodes: qrCodesStr, // $.previewAssets.qrCodes
    posGuide: posGuideStr, // $.previewAssets.posGuide
    checklist: checklistStr, // $.previewAssets.checklist
  },
  // ... top-level aliases for alternative mapping
});
```

---

## ⚠️ Important Notes

### 1. QR Codes Endpoint Returns JSON (Not a Problem)

The `/api/launchpad/preview/qr` endpoint returns JSON with nested structure:
```json
{
  "qrCodes": {
    "tables": [...],
    "kiosk": {...}
  }
}
```

**This is OK** because:
- The `manychat-setup` endpoint returns the **URL** to that endpoint (a string)
- ManyChat stores the URL string, not the JSON response
- When ManyChat displays the link, users can click it to see the preview

### 2. String Conversion Safety

All values are explicitly converted to strings using `String()` to ensure:
- No type coercion issues
- No arrays/objects accidentally passed
- ManyChat receives clean string URLs

### 3. Dual Mapping Support

The response includes both:
- **Nested structure**: `$.previewAssets.qrCodes` (ManyChat standard)
- **Top-level aliases**: `$.launchpad_qr_codes` (easier mapping)

This provides flexibility for ManyChat's Response Mapping feature.

---

## 🧪 Test Response

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
      "session_type": "Flat fee",
      "price_range": "25",
      "top_5_flavors": "Strawberry, Blueberry"
    }
  }'
```

### Expected Response (Key Fields):

```json
{
  "completionLink": "https://hookahplus.net/launchpad?token=...",
  "previewAssets": {
    "qrCodes": "https://hookahplus.net/api/launchpad/preview/qr?token=...",
    "posGuide": "https://hookahplus.net/api/launchpad/preview/pos-guide?token=...",
    "checklist": "https://hookahplus.net/api/launchpad/preview/checklist?token=..."
  }
}
```

### Verification:

- ✅ `typeof completionLink === 'string'`
- ✅ `typeof previewAssets.qrCodes === 'string'`
- ✅ `typeof previewAssets.posGuide === 'string'`
- ✅ `typeof previewAssets.checklist === 'string'`
- ✅ All values are valid URLs (start with `http://` or `https://`)

---

## ✅ Conclusion

**All values are strings (URLs) as required by ManyChat.**

The API response structure is:
- ✅ Correctly formatted for JSONPath parsing
- ✅ All values are strings (no arrays/objects)
- ✅ Nested structure matches ManyChat expectations
- ✅ Top-level aliases provided for flexibility
- ✅ Explicit string conversion ensures type safety

**Status: READY FOR MANYCHAT INTEGRATION** ✅

---

**Related Files:**
- `apps/app/app/api/launchpad/manychat-setup/route.ts` - API implementation
- `MANYCHAT_API_RESPONSE_REFERENCE.md` - Full API documentation

