# H+ Passport Brand Architecture (Hookah+ Wedge)

## Purpose

Hookah+ is the **wedge product** (lounges now, bars next). The identity layer will outgrow any single niche term, so we name and communicate it as a portable layer: **H+ Passport**.

This doc defines what we call what (internally now; externally when ready) without forcing a codebase rename.

## Naming map (what the names mean)

- **Hookah+**: Operator-facing product suite for hospitality venues (lounges, bars). Drives adoption and revenue in the wedge.
- **H+ Passport**: Identity + consent + portability layer (HID, scoped profile, export/delete, cross-venue recognition).
- **H+ Network**: *Reserved for later.* Umbrella brand once portability spans multiple verticals and governance is real (not aspirational).

## “Powered by” pattern (default phrasing)

Use Hookah+ as the headline in operator contexts; reference Passport as the infrastructure layer.

- **Operator-facing**: “Hookah+ (CODIGO pilot) — powered by H+ Passport”
- **Technical/internal**: “H+ Passport provides HID + consent-scoped portability for Hookah+ surfaces.”

## Vocabulary rules (to keep docs consistent)

- Prefer **HID** for the user identifier (neutral and future-proof).
- Prefer **member** only as a pilot UX term (“member QR”), not as the platform’s core primitive.
- Use **portability** to mean *permissioned cross-venue recognition* (not “sharing everything”).
- Use **scope** to describe visibility boundaries:
  - **lounge** scope: venue-isolated view
  - **network** scope: only what the user opted into (e.g., `network_shared`)

## External timing (when names graduate)

**Today (pilot / wedge growth):**
- Lead with **Hookah+**
- Add “powered by **H+ Passport**” in materials where identity/consent/portability is discussed
- Mention **H+ Network** only as a future direction (if at all)

**Later (multi-vertical portability):**
- “H+ Network” becomes the umbrella story once the network is measurable (coverage, governance, multi-vertical operators)

## Quick examples

### Pilot KPI language

- “Member capture rate” stays operator-friendly, but define the underlying primitive as HID:
  - “% of sessions linked to a member identity (**HID via H+ Passport**).”

### Privacy language

- “Cross-lounge recognition” (operator-friendly) maps to:
  - “H+ Passport portability consent (scoped, opt-in).”

## Non-goals

- This doc does **not** change legal structure, trademark filings, or customer contracts.
- This doc does **not** require code changes or renaming identifiers already in use (e.g., `hp_codigo_member_id_v1` / HID).

