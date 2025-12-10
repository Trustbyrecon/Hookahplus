import { describe, it, expect } from 'vitest';
import { buildReceiptPreview } from '@/lib/pricing';

/**
 * Receipt Preview Match Test
 * 
 * Preview total equals Stripe checkout total.
 * 
 * This is one of the 10 conformance tests to validate Phase 3 Hardening Mini-Pack.
 */
describe('Receipt Preview Match Test', () => {
  /**
   * Calculate Stripe checkout total from line items
   * Stripe total = sum of (unit_amount * quantity) for all line items
   */
  function calculateStripeTotal(lineItems: Array<{
    price_data: {
      currency: string;
      product_data: { name: string };
      unit_amount: number;
    };
    quantity: number;
  }>): number {
    return lineItems.reduce((total, item) => {
      return total + (item.price_data.unit_amount * item.quantity);
    }, 0);
  }

  it('should match preview total with Stripe checkout total for base session', () => {
    const preview = buildReceiptPreview({
      basePriceCents: 3000,
      marginCents: 500,
    });

    const stripeTotal = calculateStripeTotal(preview.stripeLineItems);
    
    expect(preview.totalCents).toBe(stripeTotal);
    expect(preview.totalCents).toBe(3500); // 3000 + 500
  });

  it('should match preview total with Stripe checkout total with premium add-ons', () => {
    const preview = buildReceiptPreview({
      basePriceCents: 3000,
      marginCents: 500,
      premiumAddOns: [
        { name: 'Premium Flavor', priceCents: 1000, quantity: 1 },
        { name: 'Extra Coal', priceCents: 500, quantity: 2 },
      ],
    });

    const stripeTotal = calculateStripeTotal(preview.stripeLineItems);
    
    expect(preview.totalCents).toBe(stripeTotal);
    // Base (3000) + Margin (500) + Flavor (1000) + Coal (500 * 2) = 5500
    expect(preview.totalCents).toBe(5500);
  });

  it('should match preview total with Stripe checkout total using defaults', () => {
    const preview = buildReceiptPreview({});

    const stripeTotal = calculateStripeTotal(preview.stripeLineItems);
    
    expect(preview.totalCents).toBe(stripeTotal);
    // Default base (2500) + default margin (500) = 3000
    expect(preview.totalCents).toBe(3000);
  });

  it('should match preview total with Stripe checkout total with multiple add-ons', () => {
    const preview = buildReceiptPreview({
      basePriceCents: 4000,
      marginCents: 600,
      premiumAddOns: [
        { name: 'Add-on 1', priceCents: 750, quantity: 1 },
        { name: 'Add-on 2', priceCents: 1000, quantity: 1 },
        { name: 'Add-on 3', priceCents: 500, quantity: 3 },
      ],
    });

    const stripeTotal = calculateStripeTotal(preview.stripeLineItems);
    
    expect(preview.totalCents).toBe(stripeTotal);
    // Base (4000) + Margin (600) + Add-on 1 (750) + Add-on 2 (1000) + Add-on 3 (500 * 3) = 7850
    expect(preview.totalCents).toBe(7850);
  });

  it('should match preview total with Stripe checkout total with zero margin', () => {
    const preview = buildReceiptPreview({
      basePriceCents: 3000,
      marginCents: 0,
      premiumAddOns: [{ name: 'Premium', priceCents: 1000 }],
    });

    const stripeTotal = calculateStripeTotal(preview.stripeLineItems);
    
    expect(preview.totalCents).toBe(stripeTotal);
    // Base (3000) + Margin (0) + Premium (1000) = 4000
    expect(preview.totalCents).toBe(4000);
  });

  it('should match preview total with Stripe checkout total with premium floor applied', () => {
    // Add-on below premium floor should be raised to floor
    const preview = buildReceiptPreview({
      basePriceCents: 3000,
      marginCents: 500,
      premiumAddOns: [
        { name: 'Underpriced Add-on', priceCents: 200 }, // Below 500 floor
      ],
    });

    const stripeTotal = calculateStripeTotal(preview.stripeLineItems);
    
    expect(preview.totalCents).toBe(stripeTotal);
    // Base (3000) + Margin (500) + Add-on (500, raised from 200) = 4000
    expect(preview.totalCents).toBe(4000);
    expect(preview.premiumAddOns[0].priceCents).toBe(500); // Floor applied
  });

  it('should match preview total with Stripe checkout total with quantity > 1', () => {
    const preview = buildReceiptPreview({
      basePriceCents: 3000,
      marginCents: 500,
      premiumAddOns: [
        { name: 'Multi-item', priceCents: 1000, quantity: 5 },
      ],
    });

    const stripeTotal = calculateStripeTotal(preview.stripeLineItems);
    
    expect(preview.totalCents).toBe(stripeTotal);
    // Base (3000) + Margin (500) + Multi-item (1000 * 5) = 8500
    expect(preview.totalCents).toBe(8500);
  });

  it('should match preview total with Stripe checkout total for complex scenario', () => {
    const preview = buildReceiptPreview({
      basePriceCents: 5000,
      marginCents: 750,
      premiumAddOns: [
        { name: 'Flavor 1', priceCents: 1000, quantity: 1 },
        { name: 'Flavor 2', priceCents: 1500, quantity: 2 },
        { name: 'Extra Service', priceCents: 800, quantity: 1 },
      ],
    });

    const stripeTotal = calculateStripeTotal(preview.stripeLineItems);
    
    expect(preview.totalCents).toBe(stripeTotal);
    // Base (5000) + Margin (750) + Flavor 1 (1000) + Flavor 2 (1500 * 2) + Extra (800) = 10550
    expect(preview.totalCents).toBe(10550);
  });

  it('should verify all line items are included in Stripe total calculation', () => {
    const preview = buildReceiptPreview({
      basePriceCents: 3000,
      marginCents: 500,
      premiumAddOns: [
        { name: 'Add-on 1', priceCents: 1000 },
        { name: 'Add-on 2', priceCents: 2000 },
      ],
    });

    const stripeTotal = calculateStripeTotal(preview.stripeLineItems);
    
    // Verify we have the expected line items
    expect(preview.stripeLineItems.length).toBe(4); // Base + 2 Add-ons + Margin
    
    // Verify each line item contributes correctly
    const baseItem = preview.stripeLineItems.find(
      (item) => item.price_data.product_data.name === 'Hookah Session'
    );
    const marginItem = preview.stripeLineItems.find(
      (item) => item.price_data.product_data.name === 'Lounge margin'
    );
    
    expect(baseItem?.price_data.unit_amount).toBe(3000);
    expect(marginItem?.price_data.unit_amount).toBe(500);
    
    // Total should match
    expect(preview.totalCents).toBe(stripeTotal);
    expect(preview.totalCents).toBe(6500); // 3000 + 500 + 1000 + 2000
  });

  it('should maintain match when recalculating with same inputs', () => {
    const input = {
      basePriceCents: 3000,
      marginCents: 500,
      premiumAddOns: [{ name: 'Premium', priceCents: 1000 }],
    };

    const preview1 = buildReceiptPreview(input);
    const preview2 = buildReceiptPreview(input);

    const stripeTotal1 = calculateStripeTotal(preview1.stripeLineItems);
    const stripeTotal2 = calculateStripeTotal(preview2.stripeLineItems);

    // Both should match their respective totals
    expect(preview1.totalCents).toBe(stripeTotal1);
    expect(preview2.totalCents).toBe(stripeTotal2);
    
    // Both should produce same results
    expect(preview1.totalCents).toBe(preview2.totalCents);
    expect(stripeTotal1).toBe(stripeTotal2);
  });
});

