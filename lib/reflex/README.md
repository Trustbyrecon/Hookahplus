# Reflex Layer

The Reflex Layer provides self-aware, self-diagnostic capabilities for autonomous systems. It enables agents to know when they're wrong, score their own performance, and take appropriate recovery actions.

## Quick Start

```typescript
import { createReflexLayer, quickReflexCheck } from './lib/reflex';

// Quick check for simple use cases
const shouldProceed = await quickReflexCheck(
  output,
  'api/payments',
  'process_payment',
  'payment'
);

// Full reflex layer for complex operations
const reflexLayer = createReflexLayer({
  route: 'api/payments',
  action: 'process_payment',
  domain: 'payment',
  context: 'Processing $1 test payment'
});

const result = await reflexLayer.processOutput(paymentData, 'json');
if (result.shouldProceed) {
  // Continue with the operation
} else {
  // Handle the failure or recovery
}
```

## Core Components

### Reflex Scorer
Analyzes output quality across multiple dimensions:
- **Semantic Density**: How specific and detailed the output is
- **Relevance**: How well it matches the context and domain
- **Structure**: How well-formed the output is
- **Memory Consistency**: How consistent with previous outputs

### Score Gates
Enforces reliability thresholds:
- **Proceed** (≥0.92): High confidence, continue
- **Recover** (0.87-0.92): Medium confidence, attempt recovery
- **Halt** (<0.87): Low confidence, stop and escalate

### GhostLog
Records all reflex events for analysis and debugging:
- Success/failure events
- Recovery actions
- Trust graph updates
- Performance metrics

### Trust Graph
Tracks reliability across the system:
- Node reliability scores
- Dependency relationships
- System health metrics
- Nodes needing attention

## Integration Examples

### API Route Integration

```typescript
import { createReflexLayer } from './lib/reflex';

export async function POST(request: Request) {
  const reflexLayer = createReflexLayer({
    route: 'api/payments/live-test',
    action: 'process_payment',
    domain: 'payment'
  });

  try {
    const paymentData = await request.json();
    const result = await reflexLayer.processOutput(paymentData, 'json');
    
    if (!result.shouldProceed) {
      return NextResponse.json({
        ok: false,
        error: 'Payment processing failed quality check'
      }, { status: 400 });
    }

    // Process payment...
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
```

### React Component Integration

```typescript
import { useReflex } from './lib/reflex/useReflex';

function PaymentForm() {
  const { checkOutput, isHealthy, needsAttention } = useReflex({
    context: {
      route: 'guests/payment',
      action: 'form_validation',
      domain: 'payment'
    }
  });

  const handleSubmit = async (formData) => {
    const result = await checkOutput(formData, 'json');
    if (result.shouldProceed) {
      // Submit the form
    } else {
      // Show error or attempt recovery
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      {needsAttention && (
        <div className="warning">
          Form validation needs attention
        </div>
      )}
    </form>
  );
}
```

## Configuration

### GhostLog Configuration

```typescript
import { configureGhostLog } from './lib/reflex/ghostLog';

configureGhostLog({
  enabled: true,
  transport: 'console', // or 'file', 'api', 'supabase'
  logLevel: 'info',
  endpoint: 'https://your-logging-endpoint.com'
});
```

### Trust Graph Configuration

```typescript
import { trustGraph } from './lib/reflex/trustGraph';

// Add a node
trustGraph.addNode({
  id: 'api/payments:process',
  type: 'route',
  reliability: 0.8,
  lastUpdated: new Date().toISOString(),
  failureCount: 0,
  successCount: 10,
  dependencies: []
});

// Add a dependency
trustGraph.addDependency('api/payments:process', 'stripe:client');
```

## Testing

### Unit Tests

```typescript
import { scoreOutput, gate } from './lib/reflex';

test('score gate thresholds', () => {
  expect(gate(0.95)).toBe('proceed');
  expect(gate(0.89)).toBe('recover');
  expect(gate(0.80)).toBe('halt');
});

test('output scoring', () => {
  const score = scoreOutput({
    output: 'This is a detailed, relevant response',
    context: 'Test context',
    domain: 'test'
  });
  
  expect(score.value).toBeGreaterThan(0.8);
});
```

### Playwright Tests

```typescript
test('no reflective UI on payment routes', async ({ page }) => {
  await page.goto('/api/payments/live-test');
  
  const reflectiveElements = await page.locator('[data-reflex]').count();
  expect(reflectiveElements).toBe(0);
});
```

## Monitoring

### System Health

```typescript
import { getGuestsSystemHealth } from './lib/reflex-integration';

const health = getGuestsSystemHealth();
console.log('System health:', health);

if (health.payment.healthScore < 0.8) {
  console.warn('Payment system needs attention');
}
```

### Nodes Needing Attention

```typescript
import { getGuestsNodesNeedingAttention } from './lib/reflex-integration';

const nodes = getGuestsNodesNeedingAttention();
console.log('Nodes needing attention:', nodes);
```

## Best Practices

1. **Always use reflex checks for critical operations** (payments, user data, etc.)
2. **Set appropriate domains** for better relevance scoring
3. **Monitor system health regularly** and address issues promptly
4. **Use quick checks for simple operations**, full reflex layer for complex ones
5. **Never expose reflex debugging info** in production responses
6. **Test reflex layer integration** with Playwright tests
7. **Keep trust graph updated** with new nodes and dependencies

## Troubleshooting

### Common Issues

1. **Low scores on valid output**: Check domain and context configuration
2. **High downstream risk**: Review failure types and recovery actions
3. **Trust graph not updating**: Ensure proper event processing
4. **Performance issues**: Check for excessive reflex checking

### Debug Mode

```typescript
import { configureGhostLog } from './lib/reflex/ghostLog';

configureGhostLog({
  enabled: true,
  transport: 'console',
  logLevel: 'debug'
});
```

## Architecture

The Reflex Layer follows a four-step process:

1. **Detection**: Analyze output quality and identify issues
2. **Classification**: Score the output and determine severity
3. **Intervention**: Choose appropriate recovery action
4. **Feedback**: Log events and update trust graph

This creates a self-improving system that becomes more reliable over time.
