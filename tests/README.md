# HookahPlus UI Testing Suite

Agent-driven UI testing using Playwright with declarative test plans for comprehensive Stripe integration testing.

## 🚀 Quick Start

### Installation
```bash
cd tests
npm install
npx playwright install
```

### Running Tests
```bash
# Run all tests
BASE_URL=https://your-domain.vercel.app npm test

# Run with UI mode
BASE_URL=https://your-domain.vercel.app npm run test:ui

# Run specific test suite
BASE_URL=https://your-domain.vercel.app npx playwright test agent-ui.spec.ts

# Debug mode
BASE_URL=https://your-domain.vercel.app npm run test:debug
```

## 📁 Test Structure

```
tests/
├── src/
│   ├── agent.ts           # Agent executor with step schemas
│   ├── skills.ts          # Basic UI interaction skills
│   ├── assertions.ts      # Custom assertion helpers
│   └── advanced-skills.ts # Advanced testing utilities
├── tests/
│   ├── agent-ui.spec.ts      # Declarative test plans
│   └── stripe-integration.spec.ts # Advanced Stripe testing
├── testplans/
│   ├── deposit.json       # Deposit flow test plan
│   ├── package.json       # Package flow test plan
│   ├── terminal.json      # Terminal closeout test plan
│   └── webhook-test.json  # Webhook testing plan
└── playwright.config.ts   # Playwright configuration
```

## 🧪 Test Plans

### 1. Deposit Flow (`deposit.json`)
Tests the complete deposit reservation flow:
- Navigate to reservation page
- Fill party size and time slots
- Click pay deposit button
- Verify Stripe redirect
- Take screenshot of checkout

### 2. Package Flow (`package.json`)
Tests prepaid package purchase:
- Navigate to package page
- Select add-ons
- Click buy package
- Verify Stripe redirect

### 3. Terminal Flow (`terminal.json`)
Tests in-person payment processing:
- Navigate to terminal interface
- Fill reservation details
- Add items to order
- Process payment
- Verify success message

### 4. Webhook Test (`webhook-test.json`)
Tests webhook handling:
- Navigate to webhook test interface
- Trigger test events
- Verify webhook processing

## 🔧 Advanced Features

### Mocking & Interception
```typescript
// Mock API responses
await mockApiResponse(page, '**/api/checkout/deposit', {
  id: 'cs_test_123',
  url: 'https://checkout.stripe.com/test'
});

// Intercept Stripe requests
await interceptStripeRequest(page);

// Simulate Stripe success/cancel
await simulateStripeSuccess(page);
await simulateStripeCancel(page);
```

### Custom Assertions
```typescript
// Soft text matching
await softContains(page, 'selector', 'expected text');

// URL pattern matching
await expectUrlIncludes(page, 'checkout.stripe.com');
```

### API Response Waiting
```typescript
// Wait for specific API call
const response = await waitForApiResponse(page, '/api/checkout/deposit');
expect(response.status()).toBe(200);
```

## 🎯 Test Data Requirements

Your UI components need these `data-testid` attributes:

### Reservation Form
```html
<form data-testid="reservation-form">
  <input name="partySize" />
  <input name="slotStartIso" />
  <input name="slotEndIso" />
  <button data-testid="pay-deposit">Pay Deposit</button>
</form>
```

### Package Page
```html
<main data-testid="package-page">
  <input name="addon_extra_hookah" />
  <button data-testid="buy-package">Buy Package</button>
</main>
```

### Terminal Interface
```html
<div data-testid="terminal-interface">
  <input name="reservationId" />
  <input name="table" />
  <button data-testid="add-item">Add Item</button>
  <button data-testid="process-payment">Process Payment</button>
  <div data-testid="payment-success">Payment successful</div>
</div>
```

### Success/Error Messages
```html
<div data-testid="success-message">Payment successful</div>
<div data-testid="error-message">Payment failed</div>
<div data-testid="cancel-message">Payment cancelled</div>
```

## 🔄 CI/CD Integration

### GitHub Actions
```yaml
name: UI Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd tests && npm ci
      - run: cd tests && npx playwright install
      - run: cd tests && BASE_URL=${{ secrets.BASE_URL }} npm test
```

### Vercel Integration
```bash
# Add to vercel.json
{
  "buildCommand": "cd tests && npm ci && npx playwright install",
  "testCommand": "cd tests && npm test"
}
```

## 📊 Test Reports

### Screenshots
- Automatically captured on test failures
- Stored in `./test-artifacts/`
- Full page screenshots for debugging

### Videos
- Recorded for failed tests
- Useful for debugging complex interactions

### Traces
- Detailed execution traces
- Available in Playwright UI mode

## 🛠️ Customization

### Adding New Test Plans
1. Create JSON file in `testplans/`
2. Follow the step schema from `agent.ts`
3. Add test case in `agent-ui.spec.ts`

### Custom Skills
Add new interaction methods to `src/skills.ts`:
```typescript
export async function customAction(page: Page, param: string) {
  // Your custom interaction logic
}
```

### Environment Variables
```bash
BASE_URL=https://your-domain.vercel.app
STRIPE_TEST_MODE=true
DEBUG_MODE=true
```

## 🐛 Debugging

### Local Debugging
```bash
# Run with headed browser
npm run test:headed

# Debug mode with breakpoints
npm run test:debug

# Generate test code
npm run codegen
```

### Common Issues
1. **Selector not found**: Check `data-testid` attributes
2. **Timeout errors**: Increase timeout in config
3. **Stripe redirect issues**: Check URL patterns in assertions
4. **API mocking failures**: Verify route patterns

## 📈 Best Practices

1. **Use data-testid attributes** for reliable selectors
2. **Keep test plans simple** and focused
3. **Mock external services** for consistent testing
4. **Take screenshots** at key points for debugging
5. **Use soft assertions** for text matching
6. **Clean up mocks** between tests
7. **Test error scenarios** as well as happy paths

## 🔗 Integration with Stripe

This test suite is designed to work with your Stripe integration:
- Tests all three payment flows (deposit, package, terminal)
- Mocks Stripe API calls for consistent testing
- Verifies webhook handling
- Tests error scenarios and edge cases

The tests will help ensure your Stripe integration works correctly across different browsers and devices before deploying to production.
