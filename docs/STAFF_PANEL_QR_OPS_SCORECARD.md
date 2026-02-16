# Staff Panel QR Ops Scorecard (QR UX Ease Rubric)

Assessment target: `app.hookahplus.net/staff-panel` (staff-facing operational surface).

Rubric source: `docs/QR_UX_EASE_SCORECARD.md`.

## Scope notes

- This score reflects **staff operational continuity** for the canonical QR→Session lifecycle (resolver + participants), not guest flavor/payment UX.
- The staff panel is evaluated as the “home cockpit” staff use after a scan or when resolving anomalies.

## Scores (0–5)

| Dimension | Weight | Current staff-panel support | Score |
|---|---:|---|---:|
| Entry Simplicity | 25% | Staff panel does not influence guest entry path | N/A |
| Operational Mapping | 20% | No table/session cockpit surfaced; little QR lifecycle visibility | 2.0 |
| Recovery and Error Clarity | 15% | Health/trust shown, but no drift/incident handoff surfaced | 2.6 |
| Staff Action Continuity | 20% | No scan-to-act entry; no deep links into session cockpit | 2.0 |
| Lifecycle Operations | 20% | QR inventory/health not visible from staff panel | 2.0 |

## Highest-value / lowest-effort gaps

- **Scan-to-act CTA + recent scans**: reduce navigation and “where do I go?” time.
- **Multi-active drift visibility** (`recon.session.multi_active`): make resolver blocking path actionable for staff.
- **Live sessions list with deep links**: convert the “Live Sessions” metric into a direct action cockpit.
- **QR health card**: show resolver + QR minting readiness and last QR pack update.

## Expected impact (target after quick cockpit patch)

- **Operational Mapping**: 2.0 → ~3.0
- **Recovery and Error Clarity**: 2.6 → ~3.2
- **Staff Action Continuity**: 2.0 → ~3.2
- **Lifecycle Operations**: 2.0 → ~2.8

