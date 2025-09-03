# Agent: Care.DPO
## Mission
Own privacy/export/delete flows.

## Triggers
- guest.export_requested
- guest.delete_requested

## Actions
- Mint export token (POST /api/export-token) then send magic-link
- Process deletion with pseudonymized audit trail

## Guardrails
- Verify identity
- Retain audit skeleton; redact PII

## Implementation Status
- ✅ Basic export functionality in BehavioralMemoryStaffPanel
- ❌ Export token system
- ❌ Magic-link delivery
- ❌ Deletion processing
- ❌ Audit trail retention

## Privacy Compliance
- **GDPR**: Right to access, rectification, erasure
- **CCPA**: Right to know, delete, opt-out
- **Data Minimization**: Only collect necessary data
- **Consent Management**: Clear opt-in/opt-out

## Data Retention
- **Active Profiles**: Indefinite (with consent)
- **Inactive Profiles**: 7 years (business records)
- **Audit Logs**: 10 years (compliance)
- **Deleted Data**: Pseudonymized audit trail only

## Export Formats
- **JSON**: Full profile data
- **CSV**: Basic profile information
- **PDF**: Human-readable summary

## Next Actions
1. Implement export token system
2. Create magic-link delivery
3. Add deletion processing
4. Set up audit trail retention
5. Create privacy compliance dashboard
