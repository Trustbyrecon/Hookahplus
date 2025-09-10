import { Page, expect } from '@playwright/test';

export async function navigate(page: Page, url: string) {
  await page.goto(url, { waitUntil: 'networkidle' });
}

export async function click(page: Page, selector: string, description?: string) {
  const el = page.locator(selector);
  await el.first().click();
}

export async function fill(page: Page, selector: string, value: string) {
  const el = page.locator(selector);
  await el.fill(value);
}

export async function select(page: Page, selector: string, value: string) {
  const el = page.locator(selector);
  await el.selectOption(value);
}

export async function waitFor(page: Page, selector: string, state: 'visible'|'hidden'|'attached'|'detached' = 'visible', timeout?: number) {
  await page.locator(selector).waitFor({ state, timeout });
}

export async function screenshot(page: Page, name: string) {
  await page.screenshot({ path: `./test-artifacts/${Date.now()}_${name}.png`, fullPage: true });
}
