import { describe, it, expect } from 'vitest';
import { buildReceiptPreview } from '@/lib/pricing';

/**
 * Stripe Metadata Completeness Test
 * 
 * Flavor add-ons appear in Stripe metadata consistently.
 * 
 * This is one of the 10 conformance tests to validate Phase 3 Hardening Mini-Pack.
 */
describe('Stripe Metadata Completeness Test', () => {
  /**
   * Simulate Stripe metadata creation (as done in checkout-session route)
   */
  function createStripeMetadata(preview: ReturnType<typeof buildReceiptPreview>, sessionId?: string, tableId?: string, qrLink?: string) {
    return {
      source: "hookahplus-web",
      session_type: "hookah_session",
      session_id: sessionId ?? "",
      table_id: tableId ?? "",
      qr_link: qrLink ?? "",
      base_price_cents: String(preview.basePriceCents),
      lounge_margin_cents: String(preview.loungeMarginCents),
      premium_addons: JSON.stringify(preview.premiumAddOns),
      total_cents: String(preview.totalCents),
    };
  }

  it('should include premium add-ons in Stripe metadata', () => {
    const preview = buildReceiptPreview({
      basePriceCents: 3000,
      marginCents: 500,
      premiumAddOns: [
        { name: 'Premium Flavor', priceCents: 1000 },
      ],
    });

    const metadata = createStripeMetadata(preview);
    
    expect(metadata.premium_addons).toBeDefined();
    expect(metadata.premium_addons).not.toBe('[]');
    
    const parsed = JSON.parse(metadata.premium_addons);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBe(1);
    expect(parsed[0].name).toBe('Premium Flavor');
    expect(parsed[0].priceCents).toBe(1000);
  });

  it('should include all premium add-ons in metadata', () => {
    const premiumAddOns = [
      { name: 'Flavor 1', priceCents: 1000 },
      { name: 'Flavor 2', priceCents: 1500 },
      { name: 'Extra Service', priceCents: 800 },
    ];

    const preview = buildReceiptPreview({
      basePriceCents: 3000,
      marginCents: 500,
      premiumAddOns,
    });

    const metadata = createStripeMetadata(preview);
    const parsed = JSON.parse(metadata.premium_addons);
    
    expect(parsed.length).toBe(3);
    expect(parsed[0].name).toBe('Flavor 1');
    expect(parsed[1].name).toBe('Flavor 2');
    expect(parsed[2].name).toBe('Extra Service');
  });

  it('should include add-on quantities in metadata', () => {
    const preview = buildReceiptPreview({
      basePriceCents: 3000,
      marginCents: 500,
      premiumAddOns: [
        { name: 'Multi-item', priceCents: 1000, quantity: 3 },
      ],
    });

    const metadata = createStripeMetadata(preview);
    const parsed = JSON.parse(metadata.premium_addons);
    
    expect(parsed[0].quantity).toBe(3);
    expect(parsed[0].priceCents).toBe(1000);
  });

  it('should use consistent JSON format for premium add-ons', () => {
    const addOns = [
      { name: 'Add-on 1', priceCents: 1000 },
      { name: 'Add-on 2', priceCents: 2000, quantity: 2 },
    ];

    const preview1 = buildReceiptPreview({
      basePriceCents: 3000,
      premiumAddOns: addOns,
    });

    const preview2 = buildReceiptPreview({
      basePriceCents: 4000,
      premiumAddOns: addOns,
    });

    const metadata1 = createStripeMetadata(preview1);
    const metadata2 = createStripeMetadata(preview2);

    const parsed1 = JSON.parse(metadata1.premium_addons);
    const parsed2 = JSON.parse(metadata2.premium_addons);

    // Format should be consistent
    expect(parsed1.length).toBe(parsed2.length);
    expect(parsed1[0].name).toBe(parsed2[0].name);
    expect(parsed1[0].priceCents).toBe(parsed2[0].priceCents);
    expect(parsed1[1].quantity).toBe(parsed2[1].quantity);
  });

  it('should include empty array when no premium add-ons', () => {
    const preview = buildReceiptPreview({
      basePriceCents: 3000,
      marginCents: 500,
    });

    const metadata = createStripeMetadata(preview);
    const parsed = JSON.parse(metadata.premium_addons);
    
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBe(0);
  });

  it('should include premium flag in metadata add-ons', () => {
    const preview = buildReceiptPreview({
      basePriceCents: 3000,
      premiumAddOns: [
        { name: 'Premium Item', priceCents: 1000 },
      ],
    });

    const metadata = createStripeMetadata(preview);
    const parsed = JSON.parse(metadata.premium_addons);
    
    // Premium flag should be set (defaults to true in buildReceiptPreview)
    expect(parsed[0].premium).toBe(true);
  });

  it('should include premium floor-adjusted prices in metadata', () => {
    // Add-on below premium floor should be raised to floor
    const preview = buildReceiptPreview({
      basePriceCents: 3000,
      premiumAddOns: [
        { name: 'Underpriced', priceCents: 200 }, // Below 500 floor
      ],
    });

    const metadata = createStripeMetadata(preview);
    const parsed = JSON.parse(metadata.premium_addons);
    
    // Price should be raised to floor (500)
    expect(parsed[0].priceCents).toBe(500);
    expect(parsed[0].priceCents).not.toBe(200);
  });

  it('should maintain add-on order in metadata', () => {
    const addOns = [
      { name: 'First', priceCents: 1000 },
      { name: 'Second', priceCents: 2000 },
      { name: 'Third', priceCents: 3000 },
    ];

    const preview = buildReceiptPreview({
      basePriceCents: 3000,
      premiumAddOns: addOns,
    });

    const metadata = createStripeMetadata(preview);
    const parsed = JSON.parse(metadata.premium_addons);
    
    expect(parsed[0].name).toBe('First');
    expect(parsed[1].name).toBe('Second');
    expect(parsed[2].name).toBe('Third');
  });

  it('should include all required add-on fields in metadata', () => {
    const preview = buildReceiptPreview({
      basePriceCents: 3000,
      premiumAddOns: [
        { name: 'Complete Add-on', priceCents: 1000, quantity: 2, premium: true },
      ],
    });

    const metadata = createStripeMetadata(preview);
    const parsed = JSON.parse(metadata.premium_addons);
    
    const addon = parsed[0];
    expect(addon.name).toBeDefined();
    expect(addon.priceCents).toBeDefined();
    expect(addon.quantity).toBeDefined();
    expect(addon.premium).toBeDefined();
    
    expect(typeof addon.name).toBe('string');
    expect(typeof addon.priceCents).toBe('number');
    expect(typeof addon.quantity).toBe('number');
    expect(typeof addon.premium).toBe('boolean');
  });

  it('should produce valid JSON that can be parsed consistently', () => {
    const preview = buildReceiptPreview({
      basePriceCents: 3000,
      premiumAddOns: [
        { name: 'Test Add-on', priceCents: 1000, quantity: 1 },
      ],
    });

    const metadata = createStripeMetadata(preview);
    
    // Should be valid JSON string
    expect(() => JSON.parse(metadata.premium_addons)).not.toThrow();
    
    // Should parse to same structure multiple times
    const parsed1 = JSON.parse(metadata.premium_addons);
    const parsed2 = JSON.parse(metadata.premium_addons);
    
    expect(JSON.stringify(parsed1)).toBe(JSON.stringify(parsed2));
  });

  it('should include premium add-ons metadata alongside other pricing metadata', () => {
    const preview = buildReceiptPreview({
      basePriceCents: 3000,
      marginCents: 500,
      premiumAddOns: [
        { name: 'Premium', priceCents: 1000 },
      ],
      sessionId: 'test-session-123',
      tableId: 'T-5',
    });

    const metadata = createStripeMetadata(preview, 'test-session-123', 'T-5', 'qr-link');
    
    // All pricing metadata should be present
    expect(metadata.base_price_cents).toBe('3000');
    expect(metadata.lounge_margin_cents).toBe('500');
    expect(metadata.total_cents).toBe('4500');
    expect(metadata.premium_addons).toBeDefined();
    
    // Premium add-ons should be parseable
    const parsed = JSON.parse(metadata.premium_addons);
    expect(parsed.length).toBe(1);
  });
});

