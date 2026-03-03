# H+ Passport — Data Roles, Consent, and Scopes (Operator Model)

## Purpose

This document describes the intended **operator model** for H+ Passport and how portability is controlled through consent and scopes. It is written for internal alignment and partner-facing clarity.

Hookah+ surfaces in venues (lounges, bars). **H+ Passport** is the identity + consent + portability layer that powers those surfaces.

## Roles (plain language)

- **Platform (Hookah+/H+ Passport)**: system of record for HID, consent state, and portability enforcement.
- **Venue (operator)**: uses Hookah+ surfaces to run the floor; does not define the identity layer’s global purposes or rules.

Practical implication: venues get **permitted views** and operational tools; they do not “own” or unilaterally expand the identity graph.

## Core identifiers

- **HID**: stable identity key used across sessions and profiles.
- **Device ID** (pilot): local device linkage used for low-friction enrollment.

## Consent model (portable recognition is opt-in)

Portability is not “share everything.” It is **permissioned recognition** governed by explicit consent state.

Example consent levels used in the pilot:
- `claimed`: identity is established (e.g., profile completed) but portability is not enabled.
- `network_shared`: portability is enabled for network scope, subject to enforcement rules.

## Scopes (visibility boundaries)

Scopes define what data can be read/used in a given context.

- **lounge scope (venue scope)**:
  - Venue sees only what is permitted for that venue context.
  - No leakage of venue-private notes/fields across operators.
- **network scope**:
  - Only data that the user has explicitly opted into sharing is returned/used.
  - Network scope must not override venue isolation for venue-private fields.

## Operator access rules (what venues can do)

- **Default**: venue can link a session to an HID when the user presents an artifact (QR / Wallet).
- **Venue view**: venue can retrieve a venue-scoped profile for service continuity (if allowed by consent/scope).
- **No silent expansion**: venue cannot broaden scope from `lounge` to `network` without the user’s opt-in consent state.
- **Export/delete**: user-initiated requests are handled by H+ Passport flows; venue tools should not bypass them.

## Implementation notes (pilot-aligned)

The CODIGO pilot already encodes these boundaries:
- Join creates/stores HID on-device (pilot enrollment).
- Privacy UI allows the user to view/update portability, export, and delete.
- Resolution endpoints use explicit `scope` parameters; enforcement happens server-side.

## Minimal governance guardrails (operational)

- **Least data**: collect only what is required for the pilot outcome.
- **No raw PII in logs**: keep logs free of raw email/phone; use hashed/opaque IDs.
- **Auditability**: all scope-expanding actions (opt-in to portability) should be attributable to a user action.
- **Reversibility**: portability can be disabled without breaking core session flows.

