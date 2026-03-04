# Toast Reconciliation Copy — Implementation Spec

**Status:** Implemented  
**Pilot:** CODIGO / District Hookah (Toast POS)

## Design Principles

- **One true path:** Scan → Copy → Paste into Toast
- **No manual typing:** Copy/paste only
- **Single-line default:** Avoid multi-line paste issues on handhelds

## Reconciliation Formats

| Use Case | Format | Example |
|----------|--------|---------|
| **Order name** (short) | `H+ {shortId} T{table}` | `H+ cls7x2ab T6` |
| **Order note** (default) | `H+ Session: {id} \| Table: {table} \| Guest: {name} \| {HH:MM}` | `H+ Session: cls7x2abc123 \| Table: 6 \| Guest: Marcus \| 14:32` |

**Guest value rule:** If `customerName` is missing → `"Guest (unclaimed)"` (never silent `"Guest"`).

**Short ID:** First 8 chars of `session.id`.

## Implementation Locations

| Priority | Location | Status |
|----------|----------|--------|
| **P0** | `/staff/scan/[sessionId]` | ✅ Primary + secondary buttons, feedback, fallback modal |
| **P1** | CreateSessionModal (CODIGO mode) | ✅ Copy confirmation after session created |
| **P2** | FSD session cards | Nice-to-have |
| **P3** | Session detail modal | Nice-to-have |

## Training One-Liner

> "Scan → Copy → Paste into Toast."

## Component

`apps/app/components/CopyForToastButton.tsx`

- Variants: `note` (single-line order note) | `sessionId` (raw ID)
- Fallback: On clipboard failure, shows modal with pre-selected text + "Tap and hold to copy"
