import { Page, expect } from '@playwright/test';

// Advanced skills for more complex test scenarios
export async function waitForApiResponse(page: Page, urlPattern: string, timeout = 10000) {
  return page.waitForResponse(response => 
    response.url().includes(urlPattern) && response.status() === 200,
    { timeout }
  );
}

export async function mockApiResponse(page: Page, url: string, response: any) {
  await page.route(url, route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response)
    });
  });
}

export async function interceptStripeRequest(page: Page) {
  await page.route('**/api/checkout/**', route => {
    const url = route.request().url();
    console.log(`Intercepted API call: ${url}`);
    route.continue();
  });
}

export async function waitForStripeRedirect(page: Page) {
  await page.waitForURL('**/checkout.stripe.com/**', { timeout: 15000 });
}

export async function simulateStripeSuccess(page: Page) {
  // Mock Stripe success response
  await page.route('**/checkout.stripe.com/**', route => {
    if (route.request().method() === 'GET') {
      route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `
          <html>
            <body>
              <div data-testid="stripe-success">Payment successful!</div>
              <script>
                setTimeout(() => {
                  window.location.href = '${process.env.BASE_URL || 'http://localhost:3000'}/success?session_id=cs_test_123';
                }, 1000);
              </script>
            </body>
          </html>
        `
      });
    } else {
      route.continue();
    }
  });
}

export async function simulateStripeCancel(page: Page) {
  await page.route('**/checkout.stripe.com/**', route => {
    if (route.request().method() === 'GET') {
      route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `
          <html>
            <body>
              <div data-testid="stripe-cancel">Payment cancelled</div>
              <script>
                setTimeout(() => {
                  window.location.href = '${process.env.BASE_URL || 'http://localhost:3000'}/cancel';
                }, 1000);
              </script>
            </body>
          </html>
        `
      });
    } else {
      route.continue();
    }
  });
}

export async function clearAllMocks(page: Page) {
  await page.unrouteAll();
}
