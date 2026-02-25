# CODIGO pilot execution rules

- Scope: CODIGO pilot features only (loungeId = "CODIGO").
- Keep changes minimal and reversible; do not refactor unrelated code.
- Avoid scanning the entire repo; only open/reference files explicitly named in the prompt.
- Default approach: reuse existing identity (`Session.hid` + `NetworkProfile`) rather than adding new identity tables.
- Priorities (in order):
  - Lightweight member enrollment (firstName only; nickname optional)
  - Session ↔ member linking (memberId = hid; optional; never blocking)
  - Wallet artifact generation (MVP: downloadable QR card PNG; structure for future `.pkpass`)
  - Pilot KPI reporting endpoint + minimal admin KPI view
- Constraints:
  - Toast stays payment authority; Hookah+ runs above POS
  - Must work in Toast handheld browser (small viewport; performance-sensitive)
  - No added friction for staff; join/profile never block session creation
  - No raw PII in logs; store hashed identifiers only
- Deliverables:
  - Endpoints: `/api/codigo/join`, `/api/codigo/profile`, `/api/codigo/wallet-card`, `/api/codigo/kpis/summary`
  - UI: `/codigo/join`, `/codigo/profile`, `/admin/codigo-kpis`
  - Minimal admin KPI view (cards; no charts required)

