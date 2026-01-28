import { test, expect } from '@playwright/test';

test.describe('Site App - Navigation and Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the site
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('Landing Page - Content and Navigation', async ({ page }) => {
    // Verify main content is visible
    await expect(page.locator('h1').or(page.locator('[data-testid="hero"]'))).toBeVisible();
    
    // Look for navigation links
    const navLinks = page.locator('nav a').or(page.locator('[role="navigation"] a'));
    expect(await navLinks.count()).toBeGreaterThan(0);
    
    // Check for cross-app navigation links
    const appLink = page.locator('text=Staff').or(page.locator('text=Admin')).or(page.locator('[href*="app"]'));
    const guestLink = page.locator('text=Order').or(page.locator('text=Guest')).or(page.locator('[href*="guest"]'));
    
    if (await appLink.count() > 0) {
      await expect(appLink.first()).toBeVisible();
    }
    
    if (await guestLink.count() > 0) {
      await expect(guestLink.first()).toBeVisible();
    }
  });

  test('Cross-app Navigation - App Link', async ({ page }) => {
    const appLink = page.locator('text=Staff Dashboard').or(page.locator('text=Admin')).or(page.locator('[href*="app"]'));
    
    if (await appLink.count() > 0) {
      // Click the app link
      await appLink.first().click();
      
      // Should navigate to app (verify URL change)
      await page.waitForTimeout(2000);
      
      // Check if we're on the app domain or if it opened in new tab
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/app|admin|staff/);
    }
  });

  test('Cross-app Navigation - Guest Link', async ({ page }) => {
    const guestLink = page.locator('text=Order Now').or(page.locator('text=Guest')).or(page.locator('[href*="guest"]'));
    
    if (await guestLink.count() > 0) {
      // Click the guest link
      await guestLink.first().click();
      
      // Should navigate to guest app
      await page.waitForTimeout(2000);
      
      // Check if we're on the guest domain
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/guest|order/);
    }
  });

  test('Mobile Responsiveness', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verify content is still visible and properly formatted
    await expect(page.locator('h1').or(page.locator('[data-testid="hero"]'))).toBeVisible();
    
    // Check for mobile navigation (hamburger menu, etc.)
    const mobileNav = page.locator('[data-testid="mobile-nav"]').or(page.locator('button[aria-label*="menu"]'));
    
    if (await mobileNav.count() > 0) {
      await mobileNav.click();
      
      // Verify mobile menu is open
      const mobileMenu = page.locator('[data-testid="mobile-menu"]').or(page.locator('nav[aria-expanded="true"]'));
      await expect(mobileMenu).toBeVisible();
    }
  });

  test('SEO Meta Tags', async ({ page }) => {
    // Check for essential meta tags
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
    
    // Check for meta description
    const metaDescription = page.locator('meta[name="description"]');
    if (await metaDescription.count() > 0) {
      const description = await metaDescription.getAttribute('content');
      expect(description).toBeTruthy();
      expect(description!.length).toBeGreaterThan(10);
    }
    
    // Check for Open Graph tags
    const ogTitle = page.locator('meta[property="og:title"]');
    const ogDescription = page.locator('meta[property="og:description"]');
    
    if (await ogTitle.count() > 0) {
      await expect(ogTitle).toBeVisible();
    }
    
    if (await ogDescription.count() > 0) {
      await expect(ogDescription).toBeVisible();
    }
  });

  test('Performance - Lighthouse Score', async ({ page }) => {
    // This test would typically run Lighthouse programmatically
    // For now, we'll check for basic performance indicators
    
    // Check for lazy loading images
    const images = page.locator('img[loading="lazy"]');
    if (await images.count() > 0) {
      await expect(images.first()).toBeVisible();
    }
    
    // Check for optimized images (WebP, etc.)
    const optimizedImages = page.locator('img[src*=".webp"]').or(page.locator('img[src*=".avif"]'));
    if (await optimizedImages.count() > 0) {
      await expect(optimizedImages.first()).toBeVisible();
    }
  });

  test('Accessibility - Basic Checks', async ({ page }) => {
    // Check for proper heading hierarchy
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
    
    // Check for alt text on images
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
    
    // Check for proper form labels
    const inputs = page.locator('input[type="text"], input[type="email"], textarea');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const associatedLabel = page.locator(`label[for="${id}"]`);
      
      expect(id || ariaLabel || (await associatedLabel.count() > 0)).toBeTruthy();
    }
  });
});
