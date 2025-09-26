# HookahPlus Glossary

## Core Terms

**Session**: A timed hookah experience with start/pause/extend/end lifecycle
**Preorder**: Guest-initiated reservation with payment hold
**Grace Window**: 5-minute buffer after session end for cleanup
**Reflex Score**: AI-generated quality metric (0-1 scale, 0.92+ required)
**Smoke Flow**: Critical user journey: preorder → checkout → success
**GhostLog**: Structured logging system for audit trails

## Technical Terms

**Idempotency**: Webhook processing that handles duplicate events safely
**Environment Parity**: Identical env vars across test/staging/prod
**SLI/SLO**: Service Level Indicators/Objectives for reliability
**Canary Route**: `/__canary` for previewing new features safely
