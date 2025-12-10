import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { buildReceiptPreview } from "@/lib/pricing";

/**
 * Premium Add-on Detection Test
 *
 * Premium flavors trigger correct add-on pricing.
 */
describe("Premium Add-on Detection Test", () => {
  const originalEnv = {
    base: process.env.BASE_PRICE_CENTS,
    margin: process.env.LOUNGE_MARGIN_CENTS,
    floor: process.env.PREMIUM_ADDON_FLOOR_CENTS,
  };

  beforeEach(() => {
    delete process.env.BASE_PRICE_CENTS;
    delete process.env.LOUNGE_MARGIN_CENTS;
    delete process.env.PREMIUM_ADDON_FLOOR_CENTS;
  });

  afterEach(() => {
    if (originalEnv.base) process.env.BASE_PRICE_CENTS = originalEnv.base;
    if (originalEnv.margin) process.env.LOUNGE_MARGIN_CENTS = originalEnv.margin;
    if (originalEnv.floor) process.env.PREMIUM_ADDON_FLOOR_CENTS = originalEnv.floor;
  });

  it("applies premium floor to underpriced add-ons", () => {
    // premium floor defaults to 500 cents
    const preview = buildReceiptPreview({
      premiumAddOns: [{ name: "Mint Diamond", priceCents: 400 }],
    });

    const addon = preview.premiumAddOns[0];
    expect(addon.priceCents).toBe(500); // floored
    expect(preview.totalCents).toBe(2500 /* base */ + 500 /* margin */ + 500 /* addon */);

    const stripeAddon = preview.stripeLineItems.find(
      (item) => item.price_data.product_data.name === "Mint Diamond"
    );
    expect(stripeAddon?.price_data.unit_amount).toBe(500);
  });

  it("sums multiple premium add-ons with quantities", () => {
    const preview = buildReceiptPreview({
      premiumAddOns: [
        { name: "Saffron Gold", priceCents: 900, quantity: 1 },
        { name: "Rose Royale", priceCents: 1200, quantity: 2 },
      ],
    });

    // Add-ons total = 900*1 + 1200*2 = 3300
    const expectedAddons = 900 + 1200 * 2;
    const expectedTotal = 2500 /* base */ + 500 /* margin */ + expectedAddons;

    expect(preview.totalCents).toBe(expectedTotal);
    expect(preview.premiumAddOns[0].priceCents).toBe(900);
    expect(preview.premiumAddOns[1].priceCents).toBe(1200);

    const stripeAddons = preview.stripeLineItems.filter(
      (item) => item.price_data.product_data.name !== "Hookah Session" && item.price_data.product_data.name !== "Lounge margin"
    );
    expect(stripeAddons).toHaveLength(2);
    expect(stripeAddons.map((i) => i.price_data.unit_amount)).toContain(900);
    expect(stripeAddons.map((i) => i.price_data.unit_amount)).toContain(1200);
  });

  it("honors an increased premium floor from environment (set before import)", async () => {
    // Need fresh module load to pick up env var
    vi.resetModules();
    process.env.PREMIUM_ADDON_FLOOR_CENTS = "800";
    const pricing = await import("@/lib/pricing");
    const preview = pricing.buildReceiptPreview({
      premiumAddOns: [{ name: "Velvet Cherry", priceCents: 500 }],
    });

    const addon = preview.premiumAddOns[0];
    expect(addon.priceCents).toBe(800); // raised floor
    expect(preview.totalCents).toBe(2500 + 500 + 800);
  });
});

