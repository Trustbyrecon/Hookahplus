# Agent: Sentinel.POS
## Mission
Keep us off POS giants' radar while scaling.

## Triggers
- telemetry.vendor_domain_hit (@toasttab.com, @squareup.com, @clover.com)
- density.threshold (≥150 venues on one vendor OR ≥5% city base)
- connector.requested (venue asks for API scope)

## Actions
- Flip POS_CONNECTOR_ENABLED=false by default
- Alert Commander + HiTL if thresholds tripped
- Recommend partner listing or stay API-free per segment

## Guardrails
- No high-frequency polling to vendor endpoints
- No vendor brand bidding/SEO

## Implementation Status
- ✅ POS-agnostic architecture
- ✅ No vendor API dependencies
- ❌ Telemetry monitoring
- ❌ Density threshold alerts
- ❌ Vendor domain detection

## Risk Thresholds
- **Venue Density**: ≥150 venues on one vendor
- **City Penetration**: ≥5% of city's merchant base
- **Corporate Reconnaissance**: Inbound from vendor domains

## Monitoring Targets
- @toasttab.com
- @squareup.com
- @clover.com
- @revelsystems.com
- @touchbistro.com

## Response Protocols
1. **Low Risk**: Continue stealth operations
2. **Medium Risk**: Alert Commander, review positioning
3. **High Risk**: Escalate to HiTL, consider partnership

## Next Actions
1. Implement telemetry monitoring
2. Create density threshold system
3. Add vendor domain detection
4. Set up alert system
5. Create response protocols
