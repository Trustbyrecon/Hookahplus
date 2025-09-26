# Service Level Indicators & Objectives

## SLIs (What We Measure)

### Checkout Flow
- **Success Rate**: % of completed checkouts / total initiated
- **Latency**: P95 checkout completion time
- **Error Rate**: % of failed checkout attempts

### Webhook Processing
- **Ack Time**: P95 time to acknowledge Stripe webhook
- **Idempotency**: % of duplicate events handled correctly
- **Processing Time**: P95 time to process webhook event

### Session Management
- **Timer Accuracy**: Drift between expected and actual session duration
- **State Consistency**: % of sessions with correct state transitions

## SLOs (What We Promise)

### Checkout Flow
- **Availability**: 99.9% success rate
- **Latency**: P95 < 3 seconds
- **Error Rate**: < 0.1%

### Webhook Processing
- **Ack Time**: P95 < 500ms
- **Idempotency**: 100% (no duplicate processing)
- **Processing Time**: P95 < 2 seconds

### Session Management
- **Timer Accuracy**: < 1 second drift
- **State Consistency**: 99.9%
