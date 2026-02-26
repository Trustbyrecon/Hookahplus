# CODIGO Pilot KPI Definitions (30 days)

This pilot uses conservative, measurable KPIs. When a metric depends on data that may not exist in all sessions, the KPI must report **coverage** (how many sessions/records qualify).

## Premium Attachment Rate
- **Definition**: Share of sessions that include at least one premium signal (premium flavor, premium tier, or premium price uplift — per agreed definition for CODIGO).
- **Formula**: \(\#\text{premium sessions} \div \#\text{eligible sessions}\)
- **Data source**: Session record (items/flavor mix/tier/price fields) + optional premium taxonomy if available.
- **“Good” (30-day pilot)**: +5–10pp vs Week 1 baseline, with no guardrail violations.

## Idle Time Between Sessions
- **Definition**: Estimated “gap time” between consecutive sessions for the same table/seat (proxy for throughput loss).
- **Formula**: For each table: \(\text{nextSessionStart} - \text{prevSessionEnd}\). Aggregate p50/p90 and average over pilot window.
- **Data source**: Session `startedAt`/`endedAt` (or best available timestamps) + table/seat identifier.
- **“Good” (30-day pilot)**: Measurable reduction in p50 gap time vs baseline (target 5–15% depending on baseline volatility).

## Session Duration Distribution
- **Definition**: Distribution of session durations to validate timing assumptions and detect outliers.
- **Formula**: Duration in minutes per session; report p25/p50/p75/p90 and outlier counts.
- **Data source**: Session `durationSecs` or `endedAt - startedAt`.
- **“Good” (30-day pilot)**: Stable distribution with fewer “stalled” sessions and improved data completeness (duration coverage increasing week-over-week).

## Staff/Server Performance (optional)
- **Definition**: Session operational metrics segmented by staff identifiers (only if staff IDs exist and are reliable).
- **Formula**: KPI slice by `assignedFOHId` / `assignedBOHId` (or equivalent).
- **Data source**: Session staff assignment fields.
- **“Good” (30-day pilot)**: Variance becomes explainable and actionable; no regression in service speed.

## Member Capture Rate (light enrollment)
- **Definition**: Share of sessions linked to a member identity (**HID via H+ Passport**) during the window.
- **Formula**: \(\#\text{sessions with memberId} \div \#\text{sessions}\)
- **Data source**: Session identity link field (pilot member identity / HID).
- **“Good” (30-day pilot)**: 20–40% for a low-friction join flow without staff enforcement; higher if join is embedded in QR pathway.

## Profile Completion Rate
- **Definition**: Share of captured members who add at least one verified contact method (phone or email) after light enrollment.
- **Formula**: \(\#\text{members with phone OR email} \div \#\text{captured members}\)
- **Data source**: Identity profile store (hashed phone/email links).
- **“Good” (30-day pilot)**: 10–25% without incentives; higher if paired with Wallet or benefit messaging.

## Repeat Visit Within 30 Days
- **Definition**: Share of identified members who have 2+ distinct sessions in the 30-day window.
- **Formula**: \(\#\text{members with ≥2 sessions} \div \#\text{members with ≥1 session}\)
- **Data source**: Session identity link + session history.
- **“Good” (30-day pilot)**: Directional signal only; success is demonstrating measurable repeat behavior (even if small N).

