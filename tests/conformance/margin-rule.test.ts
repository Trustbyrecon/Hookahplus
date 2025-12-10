import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { buildReceiptPreview } from '@/lib/pricing';

/**
 * Margin Rule Test
 * 
 * Margin is applied as a flat dollar amount, not a percentage.
 * 
 * This is one of the 10 conformance tests to validate Phase 3 Hardening Mini-Pack.
 */
describe('Margin Rule Test', () => {
  const originalEnv = process.env.LOUNGE_MARGIN_CENTS;
  const EXPECTED_DEFAULT_MARGIN_CENTS = 500; // $5.00 default from lib/pricing.ts

  beforeEach(() => {
    // Clear LOUNGE_MARGIN_CENTS to test default behavior
    delete process.env.LOUNGE_MARGIN_CENTS;
  });

  afterEach(() => {
    // Restore original env var
    if (originalEnv) {
      process.env.LOUNGE_MARGIN_CENTS = originalEnv;
    } else {
      delete process.env.LOUNGE_MARGIN_CENTS;
    }
  });

  it('should apply margin as flat dollar amount, not percentage', () => {
    const basePrice1 = 2500; // $25.00
    const basePrice2 = 5000; // $50.00 (double)
    
    const preview1 = buildReceiptPreview({
      basePriceCents: basePrice1,
    });
    
    const preview2 = buildReceiptPreview({
      basePriceCents: basePrice2,
    });
    
    // Margin should be the same flat amount regardless of base price
    expect(preview1.loungeMarginCents).toBe(EXPECTED_DEFAULT_MARGIN_CENTS);
    expect(preview2.loungeMarginCents).toBe(EXPECTED_DEFAULT_MARGIN_CENTS);
    expect(preview1.loungeMarginCents).toBe(preview2.loungeMarginCents);
    
    // If margin were a percentage, preview2 margin would be double preview1 margin
    // But since it's flat, they're equal
    const marginRatio = preview2.loungeMarginCents / preview1.loungeMarginCents;
    expect(marginRatio).toBe(1); // Not 2 (which would indicate percentage-based)
  });

  it('should not scale margin with base price changes', () => {
    const margins: number[] = [];
    const basePrices = [1000, 2000, 3000, 4000, 5000]; // $10, $20, $30, $40, $50
    
    basePrices.forEach((basePrice) => {
      const preview = buildReceiptPreview({
        basePriceCents: basePrice,
      });
      margins.push(preview.loungeMarginCents);
    });
    
    // All margins should be identical (flat amount)
    const uniqueMargins = new Set(margins);
    expect(uniqueMargins.size).toBe(1);
    expect(margins[0]).toBe(EXPECTED_DEFAULT_MARGIN_CENTS);
  });

  it('should add margin directly to total, not calculate as percentage', () => {
    const basePrice = 3000; // $30.00
    const margin = 500; // $5.00
    
    const preview = buildReceiptPreview({
      basePriceCents: basePrice,
      marginCents: margin,
    });
    
    // Total should be base + margin (flat addition)
    const expectedTotal = basePrice + margin;
    expect(preview.totalCents).toBe(expectedTotal);
    expect(preview.loungeMarginCents).toBe(margin);
    
    // If margin were 10% of base, it would be 300 cents, not 500
    const percentageBasedMargin = Math.round(basePrice * 0.1);
    expect(preview.loungeMarginCents).not.toBe(percentageBasedMargin);
    expect(preview.loungeMarginCents).toBe(margin); // Confirms flat amount
  });

  it('should use default margin when not provided', () => {
    const preview = buildReceiptPreview({
      basePriceCents: 2500,
    });
    
    expect(preview.loungeMarginCents).toBe(EXPECTED_DEFAULT_MARGIN_CENTS);
  });

  it('should respect explicit margin override', () => {
    const customMargin = 750; // $7.50
    const preview = buildReceiptPreview({
      basePriceCents: 3000,
      marginCents: customMargin,
    });
    
    expect(preview.loungeMarginCents).toBe(customMargin);
    expect(preview.totalCents).toBe(3000 + customMargin);
  });

  it('should include margin as separate line item in Stripe payload', () => {
    const margin = 500;
    const preview = buildReceiptPreview({
      basePriceCents: 2500,
      marginCents: margin,
    });
    
    const marginLineItem = preview.stripeLineItems.find(
      (item) => item.price_data.product_data.name === 'Lounge margin'
    );
    
    expect(marginLineItem).toBeDefined();
    expect(marginLineItem?.price_data.unit_amount).toBe(margin);
    expect(marginLineItem?.quantity).toBe(1);
  });

  it('should handle zero margin correctly', () => {
    const preview = buildReceiptPreview({
      basePriceCents: 2500,
      marginCents: 0,
    });
    
    expect(preview.loungeMarginCents).toBe(0);
    expect(preview.totalCents).toBe(2500); // base + 0 margin
  });

  it('should maintain flat margin even with premium add-ons', () => {
    const basePrice = 2500;
    const margin = 500;
    const addOnPrice = 1000;
    
    const preview1 = buildReceiptPreview({
      basePriceCents: basePrice,
      marginCents: margin,
    });
    
    const preview2 = buildReceiptPreview({
      basePriceCents: basePrice,
      marginCents: margin,
      premiumAddOns: [{ name: 'Premium Flavor', priceCents: addOnPrice }],
    });
    
    // Margin should be the same in both cases
    expect(preview1.loungeMarginCents).toBe(margin);
    expect(preview2.loungeMarginCents).toBe(margin);
    expect(preview1.loungeMarginCents).toBe(preview2.loungeMarginCents);
    
    // Total difference should only be the add-on price
    const totalDifference = preview2.totalCents - preview1.totalCents;
    expect(totalDifference).toBe(addOnPrice);
  });
});

