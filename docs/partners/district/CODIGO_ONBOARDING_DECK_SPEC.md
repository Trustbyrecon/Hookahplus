# CODIGO Onboarding Deck Spec — District Hookah

**Figma Make file:** [Onboarding Deck for District Hookah](https://www.figma.com/make/MtDs6EJ64HdvK2qL51HUa5/Onboarding-Deck-for-District-Hookah)

**Code as source of truth.** This spec aligns the Figma deck with the Hookah+ codebase.

---

## Corrections for Figma Alignment

### ScalePathSlide (Scale Path)

**Current (Figma):** Generic "Next Steps" — Add loyalty layer, Enable referrals, Expand to multiple locations, Become flagship partner.

**Corrected (code-aligned):**

| Step | Label | Icon |
|------|-------|------|
| 1 | 3 pilot anchors (Diablo's, Bullpen, Opera) | 📍 |
| 2 | 5 revenue centers | 📍 |
| 3 | 10 revenue centers | 📍 |
| 4 | 20 revenue centers (full rollout) | ⭐ |

**Copy:** "From Pilot → Expansion" — 3 anchors → 5 → 10 → **20 revenue centers** (full rollout)

**Source:** District Hookah operates 20 revenue centers (not 13 locations). See `DISTRICT_HOOKAH_FLAGSHIP_PILOT_OFFER.md` and rollout gate docs.

---

### FirstCustomerSlide

**Already correct:** April 1, 2026, District Hookah as model lounge. No change needed.

---

### 3-Step CODIGO Guest Flow (Code Reference)

Align any guest-flow slides with `apps/app/app/codigo/onboard/page.tsx`:

| Step | Title | Description |
|------|-------|-------------|
| 1 | Join | "Create your CODIGO identity. One-time setup." — First name + nickname |
| 2 | Privacy | "Control how your data is used across venues." — Cross-lounge opt-in |
| 3 | Ready | "You're all set. Enter the CODIGO experience." — Fire Session Dashboard |

---

### URLs (Code Reference)

| Resource | URL |
|---------|-----|
| App login | https://app.hookahplus.net/login |
| Fire Session Dashboard (CODIGO) | https://app.hookahplus.net/fire-session-dashboard?loungeIds=CODIGO |
| Guest app (CODIGO lounge) | https://guest.hookahplus.net/guest/CODIGO |
| CODIGO onboard | https://app.hookahplus.net/codigo/onboard |
| Admin QR (demo) | https://app.hookahplus.net/admin/qr?mode=demo |
| KPI view | https://app.hookahplus.net/admin/codigo-kpis |

---

## Design Tokens

| Token | Value | Use |
|-------|-------|-----|
| District Hookah primary | `#7C2D32` | Headers, accents |
| Hookah+ teal | `#14b8a6` | CTAs, H+ branding |
| Gold accent (deck) | `#D4AF37` | Existing Figma Make styling |
| Background dark | `#09090b` | Slide backgrounds |

---

## Figma Make File Structure

The deck at the link above uses these slide components. Update `ScalePathSlide.tsx` (or equivalent) with the 20 revenue centers path.
