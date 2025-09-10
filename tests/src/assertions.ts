import { Page, expect } from '@playwright/test';

export async function softContains(page: Page, selector: string, includes: string) {
  const text = await page.locator(selector).first().innerText();
  expect(text.toLowerCase()).toContain(includes.toLowerCase());
}

export async function expectUrlIncludes(page: Page, includes: string) {
  await expect(page).toHaveURL(new RegExp(includes));
}
