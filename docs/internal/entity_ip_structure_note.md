# Entity + IP Structure Note (Hookah+ / H+ Passport)

## Purpose (internal)

This memo captures an infrastructure-grade framing for entity separation and IP ownership as Hookah+ expands from lounges into bars and beyond. It is **not legal or tax advice**—it’s a strategy outline to align counsel, accounting, and investor narrative.

## Why this matters for H+ Passport

As H+ Passport becomes portable, you are storing/processing higher-risk assets:
- identity keys (HID)
- consent state and portability rules
- PII (even if minimized/hashed)
- behavioral/session analytics
- potential wallet/loyalty balances

Those are infrastructure assets and should not sit in the same entity that signs venue contracts and carries day-to-day operating liability.

## Clean separation model (example)

### 1) IP holding entity (HoldCo)
**H+ Labs, LLC**
- Owns core IP for **H+ Passport** (architecture, portability method, identity graph primitives)
- Owns trademarks/patent filings (or holds assignments from founders/contractors)
- Licenses the technology to operating companies

### 2) Operating entity (OpCo)
**Hookah+, LLC**
- Signs contracts with venues (lounges, bars)
- Bills SaaS / revenue share
- Runs operations and support
- Pays a licensing fee to HoldCo

### 3) Future venture entity (NewCo)
**H+ Network, Inc** (name reserved; can be formed when needed)
- Raises institutional capital
- Owns (or has exclusive rights to) the platform IP at investor-grade terms
- Becomes the “platform company” once portability spans multiple verticals

## Two VC-reality notes (important)

1) **Investors prefer the investable entity to own the core IP.**
   - If HoldCo retains IP indefinitely, diligence will focus on control risk.

2) If you start with HoldCo for safety (common), design contracts for a clean “flip” later:
   - Either **assign** IP into the C-Corp at financing, or
   - Grant a C-Corp license that is **exclusive, perpetual, worldwide, sublicensable, and assignable** (still more scrutiny than assignment).

## Licensing intent (plain language)

HoldCo licenses H+ Passport to OpCo so that:
- a venue dispute does not jeopardize core IP,
- a lawsuit against the operator does not expose patents/trademarks,
- the platform layer can be acquired/invested in cleanly.

## Brand alignment (so names don’t trap you)

- **Hookah+**: wedge/operator brand used in market (lounges → bars).
- **H+ Passport**: platform identity layer name (internal now; external as portability becomes a product).
- **H+ Network**: umbrella story reserved for later once “network” is true (multi-vertical + governance + measurable portability coverage).

## IP strategy reminder (what’s defensible)

Avoid patenting UI tropes. Focus on claim surfaces like:
- consent-scoped portability enforcement across independent operators
- cross-venue memory transfer that respects venue-private vs network-shared fields
- identity-linked revenue participation toggles / entitlement rules
- privacy-scoped identity export/delete with auditable scope boundaries

## Practical next steps (for counsel/CPA sync)

- Confirm contractor/employee IP assignments funnel into HoldCo or the future C-Corp cleanly.
- Draft a simple HoldCo → OpCo license with future assignment/novation pathways.
- Decide the “trigger” for forming the C-Corp (e.g., first institutional round, first multi-vertical rollout).

