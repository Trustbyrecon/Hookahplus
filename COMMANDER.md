# Commander — Orchestration
## Schedules
- Nightly 02:00: Identity.backfill (evaluate last 90d)
- Hourly: Sentinel.POS telemetry scan
- Weekly Mon 10:00: EP.Growth KPI check + actions

## Event bus (topics)
- events.check_in | visit_closed | mix_ordered
- venue.onboarded | city.cluster_targeted
- telemetry.vendor_domain_hit | density.threshold

## State machine
READY → OUT → DELIVERED → ACTIVE → CLOSE (enforced in server routes)

## Escalations (HiTL)
- Privacy/consent copy change → DPO approval
- Partner/marketplace listing → Founder/BD approval
- Incident → Security lead within 1h

## Kill switches
- POS_CONNECTOR_ENABLED=false (default)
- DISABLE_NETWORK_BADGES=true (emergency)
- BADGES_V1_USE_DB=false (fall back to in-memory)

## Message & data contracts (agents ↔ backend)

### Event (JSON)
```json
{
  "type": "check_in|visit_closed|mix_ordered",
  "profileId": "...",
  "venueId": "...",
  "staffId": "...",
  "comboHash": "optional"
}
```

### Badge export (admin or guest token)
```
GET /api/badges/export?profileId=...&token=...
Headers (admin): x-role: admin
```

### RBAC headers (dev/demo)
```
x-role: staff|admin|guest
x-actor-id: staff_123
x-venue-id: venue_001
```

## Who does what (at a glance)
| Work | Agent | Human |
|------|-------|-------|
| Award badges, track progress | Aliethia.Identity | — |
| City rollout, signage, leaderboards | EP.Growth | Approve venues & offers |
| Stealth/risk monitoring | Sentinel.POS | Decide partner vs stealth |
| Exports/deletions | Care.DPO | Approve edge cases |
| Consent copy, retention changes | — | DPO/legal approval |
| Partnerships/BD with POS | — | Founder/BD |

## Implementation Status
- ✅ Basic event system in place
- ✅ State machine in Fire Session Dashboard
- ❌ Automated scheduling
- ❌ Event bus implementation
- ❌ HiTL escalation system
- ❌ Kill switch system

## Next Actions
1. Implement automated scheduling
2. Create event bus system
3. Add HiTL escalation gates
4. Set up kill switches
5. Create monitoring dashboard
