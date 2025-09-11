import { test } from '@playwright/test';
import { Agent, PlanSchema } from '../src/agent';
import depositPlan from '../testplans/deposit.json' assert { type: 'json' };
import packagePlan from '../testplans/package.json' assert { type: 'json' };
import terminalPlan from '../testplans/terminal.json' assert { type: 'json' };

const BASE = process.env.BASE_URL || 'http://localhost:3000';

// --- Test 1: Deposit checkout flow (Stripe hosted Checkout redirect) ---

test.describe('Hookah+ — Deposit Flow', () => {
  test('Per-guest reservation deposit creates session and redirects to Stripe', async ({ page }) => {
    const plan = PlanSchema.parse(depositPlan);

    // hydrate dynamic URLs from env
    plan.steps = plan.steps.map((s) =>
      s.action === 'navigate' ? { ...s, url: s.url.replace('{BASE}', BASE) } : s
    );

    const agent = new Agent(page, plan);
    await agent.run();
  });
});

// --- Test 2: Package checkout (+ optional add-on) ---

test.describe('Hookah+ — Package Flow', () => {
  test('Bronze package checkout redirects to Stripe', async ({ page }) => {
    const plan = PlanSchema.parse(packagePlan);
    plan.steps = plan.steps.map((s) =>
      s.action === 'navigate' ? { ...s, url: s.url.replace('{BASE}', BASE) } : s
    );

    const agent = new Agent(page, plan);
    await agent.run();
  });
});

// --- Test 3: Terminal closeout flow ---

test.describe('Hookah+ — Terminal Flow', () => {
  test('Terminal closeout creates payment intent and shows success', async ({ page }) => {
    const plan = PlanSchema.parse(terminalPlan);
    plan.steps = plan.steps.map((s) =>
      s.action === 'navigate' ? { ...s, url: s.url.replace('{BASE}', BASE) } : s
    );

    const agent = new Agent(page, plan);
    await agent.run();
  });
});
