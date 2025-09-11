# Agent: Aliethia.Identity
## Mission
Maintain portable behavioral memory & award badges without touching POS APIs.

## Triggers
- events.check_in
- events.visit_closed
- events.mix_ordered
- admin.backfill_requested

## Inputs
- profile_id, venue_id, staff_id
- config/badges.json
- env: BADGES_V1=true, BADGES_V1_USE_DB, AUTH_MODE

## Actions
- POST /api/events {type, profileId, venueId, comboHash?}
- GET  /api/badges?profileId=&venueId=
- POST /api/export-token (admin)
- GET  /api/badges/export?profileId=&token=

## Guardrails
- No POS APIs; no scraping.
- Network badges only for **claimed** profiles.
- Field-level security: PII encrypted/hashed; tokenized receipt refs.
- Throttle duplicate awards; idempotent writes.
- Audit every cross-lounge read/write.

## KPIs (weekly)
- ≥40% guests earned ≥1 badge
- ≥10% Explorer rate
- ≥+10% repeat vs baseline
- Export SLA ≤15 days (100%)

## Implementation Status
- ✅ Basic badge system in BehavioralMemoryStaffPanel
- ✅ Customer profile management
- ✅ Export functionality
- 🔄 Network badge portability (in progress)
- ❌ Cross-venue memory synchronization
- ❌ Automated badge awarding

## Next Actions
1. Implement network badge synchronization
2. Add automated badge awarding triggers
3. Create cross-venue memory engine
4. Add export token system
