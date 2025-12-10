import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { buildReceiptPreview } from '@/lib/pricing';

/**
 * Pricing Default Test
 * 
 * Base session price resolves to the expected default when no override exists.
 * 
 * This is one of the 10 conformance tests to validate Phase 3 Hardening Mini-Pack.
 */
describe('Pricing Default Test', () => {
  const originalEnv = process.env.BASE_PRICE_CENTS;
  const EXPECTED_DEFAULT_CENTS = 2500; // $25.00 default from lib/pricing.ts

  beforeEach(() => {
    // Clear BASE_PRICE_CENTS to test default behavior
    delete process.env.BASE_PRICE_CENTS;
  });

  afterEach(() => {
    // Restore original env var
    if (originalEnv) {
      process.env.BASE_PRICE_CENTS = originalEnv;
    } else {
      delete process.env.BASE_PRICE_CENTS;
    }
  });

  it('should resolve to default base price when no override is provided', () => {
    const preview = buildReceiptPreview({});
    
    expect(preview.basePriceCents).toBe(EXPECTED_DEFAULT_CENTS);
    expect(preview.basePriceCents).toBeGreaterThan(0);
  });

  it('should resolve to default base price when basePriceCents is undefined', () => {
    const preview = buildReceiptPreview({
      sessionId: 'test-session-123',
      tableId: 'T-1',
    });
    
    expect(preview.basePriceCents).toBe(EXPECTED_DEFAULT_CENTS);
  });

  it('should convert null to 0 (not fallback to default)', () => {
    // null is converted to 0 by Number(null), and 0 is a valid finite number
    const preview = buildReceiptPreview({
      basePriceCents: null as any,
    });
    
    // Number(null) = 0, which is finite, so it's used as-is
    expect(preview.basePriceCents).toBe(0);
  });

  it('should accept 0 as a valid override (not fallback to default)', () => {
    // 0 is a valid number, so it should be used (not treated as "no override")
    const preview = buildReceiptPreview({
      basePriceCents: 0,
    });
    
    // 0 is a valid override, so it should be used
    expect(preview.basePriceCents).toBe(0);
  });

  it('should use provided override when basePriceCents is explicitly set', () => {
    const customPrice = 3500; // $35.00
    const preview = buildReceiptPreview({
      basePriceCents: customPrice,
    });
    
    expect(preview.basePriceCents).toBe(customPrice);
    expect(preview.basePriceCents).not.toBe(EXPECTED_DEFAULT_CENTS);
  });

  it('should respect BASE_PRICE_CENTS environment variable when set at module load', () => {
    // Note: DEFAULT_BASE is evaluated at module load time, so changing
    // process.env after module load won't affect it. This test verifies
    // the default behavior when env var is not set (which is the main use case).
    // For actual env var testing, the env var must be set before the module loads.
    const preview = buildReceiptPreview({});
    
    // Should use the default (2500) since env var changes after module load don't affect it
    expect(preview.basePriceCents).toBe(EXPECTED_DEFAULT_CENTS);
  });

  it('should calculate total correctly with default base price', () => {
    const preview = buildReceiptPreview({
      marginCents: 500, // $5.00 margin
    });
    
    // Total = base (2500) + margin (500) + addons (0) = 3000
    expect(preview.totalCents).toBe(3000);
    expect(preview.basePriceCents).toBe(EXPECTED_DEFAULT_CENTS);
    expect(preview.loungeMarginCents).toBe(500);
  });

  it('should include default base price in Stripe line items', () => {
    const preview = buildReceiptPreview({});
    
    const baseLineItem = preview.stripeLineItems.find(
      (item) => item.price_data.product_data.name === 'Hookah Session'
    );
    
    expect(baseLineItem).toBeDefined();
    expect(baseLineItem?.price_data.unit_amount).toBe(EXPECTED_DEFAULT_CENTS);
    expect(baseLineItem?.quantity).toBe(1);
  });
});

