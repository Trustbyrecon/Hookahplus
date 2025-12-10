import { describe, it, expect, beforeEach } from 'vitest';
import { buildReceiptPreview } from '@/lib/pricing';
import { lockPrice, getLockedPrice, isPriceLocked, clearPriceLock } from '@/lib/price-lock';

/**
 * Price Lock Integrity Test
 * 
 * Locked prices override suggestions and remain stable through the session.
 * 
 * This is one of the 10 conformance tests to validate Phase 3 Hardening Mini-Pack.
 */
describe('Price Lock Integrity Test', () => {
  const sessionId = 'test-session-lock-123';

  beforeEach(() => {
    // Clear any existing locks before each test
    clearPriceLock(sessionId);
  });

  it('should override suggested price when price is locked', () => {
    // First, get a suggested price
    const suggestedPreview = buildReceiptPreview({
      sessionId,
      basePriceCents: 3000,
      marginCents: 500,
    });
    
    const suggestedTotal = suggestedPreview.totalCents; // 3500
    
    // Lock a different price
    const lockedPrice = 4000; // $40.00
    lockPrice(sessionId, lockedPrice, {
      basePriceCents: 3000,
      marginCents: 500,
      premiumAddOns: 500, // Extra $5 for premium
    });
    
    // Verify lock exists
    const lock = getLockedPrice(sessionId);
    expect(lock).toBeDefined();
    expect(lock?.finalPriceCents).toBe(lockedPrice);
    
    // Locked price should override suggested price
    expect(lock?.finalPriceCents).not.toBe(suggestedTotal);
    expect(lock?.finalPriceCents).toBe(lockedPrice);
  });

  it('should remain stable when pricing components change', () => {
    // Lock initial price
    const lockedPrice = 3500;
    lockPrice(sessionId, lockedPrice, {
      basePriceCents: 3000,
      marginCents: 500,
    });
    
    const initialLock = getLockedPrice(sessionId);
    expect(initialLock?.finalPriceCents).toBe(lockedPrice);
    
    // Simulate pricing component changes (e.g., base price changes, add-ons added)
    const newSuggestedPrice1 = buildReceiptPreview({
      sessionId,
      basePriceCents: 4000, // Base increased
      marginCents: 500,
    });
    
    const newSuggestedPrice2 = buildReceiptPreview({
      sessionId,
      basePriceCents: 3000,
      marginCents: 500,
      premiumAddOns: [{ name: 'Extra Flavor', priceCents: 1000 }], // Add-on added
    });
    
    // Locked price should remain unchanged
    const lockAfterChange1 = getLockedPrice(sessionId);
    const lockAfterChange2 = getLockedPrice(sessionId);
    
    expect(lockAfterChange1?.finalPriceCents).toBe(lockedPrice);
    expect(lockAfterChange2?.finalPriceCents).toBe(lockedPrice);
    expect(lockAfterChange1?.finalPriceCents).toBe(lockAfterChange2?.finalPriceCents);
    
    // Locked price should not match new suggestions
    expect(lockAfterChange1?.finalPriceCents).not.toBe(newSuggestedPrice1.totalCents);
    expect(lockAfterChange2?.finalPriceCents).not.toBe(newSuggestedPrice2.totalCents);
  });

  it('should persist lock across multiple pricing calculations', () => {
    const lockedPrice = 3750;
    lockPrice(sessionId, lockedPrice);
    
    // Simulate multiple pricing calculations during session lifecycle
    const calculations = [
      buildReceiptPreview({ sessionId, basePriceCents: 3000 }),
      buildReceiptPreview({ sessionId, basePriceCents: 3500 }),
      buildReceiptPreview({ sessionId, basePriceCents: 3000, marginCents: 600 }),
      buildReceiptPreview({ sessionId, basePriceCents: 3000, premiumAddOns: [{ name: 'Add-on', priceCents: 500 }] }),
    ];
    
    // Lock should remain stable across all calculations
    calculations.forEach(() => {
      const lock = getLockedPrice(sessionId);
      expect(lock?.finalPriceCents).toBe(lockedPrice);
    });
  });

  it('should include price hash for integrity verification', () => {
    const lockedPrice = 3500;
    const components = {
      basePriceCents: 3000,
      marginCents: 500,
    };
    
    lockPrice(sessionId, lockedPrice, components);
    
    const lock = getLockedPrice(sessionId);
    expect(lock?.priceHash).toBeDefined();
    expect(lock?.priceHash).toMatch(/^lock_/);
    expect(typeof lock?.priceHash).toBe('string');
  });

  it('should store price components for audit trail', () => {
    const lockedPrice = 4000;
    const components = {
      basePriceCents: 3000,
      marginCents: 500,
      premiumAddOns: 500,
    };
    
    lockPrice(sessionId, lockedPrice, components, 'operator-123', 'Manual override for VIP customer');
    
    const lock = getLockedPrice(sessionId);
    expect(lock?.components).toEqual(components);
    expect(lock?.operatorId).toBe('operator-123');
    expect(lock?.auditNote).toBe('Manual override for VIP customer');
  });

  it('should detect when price is locked', () => {
    expect(isPriceLocked(sessionId)).toBe(false);
    
    lockPrice(sessionId, 3500);
    
    expect(isPriceLocked(sessionId)).toBe(true);
  });

  it('should maintain lock even when suggested price would be lower', () => {
    // Lock a higher price
    const lockedPrice = 5000;
    lockPrice(sessionId, lockedPrice);
    
    // Suggest a lower price
    const lowerSuggestion = buildReceiptPreview({
      sessionId,
      basePriceCents: 2000,
      marginCents: 300,
    });
    
    // Lock should remain at higher price
    const lock = getLockedPrice(sessionId);
    expect(lock?.finalPriceCents).toBe(lockedPrice);
    expect(lock?.finalPriceCents).toBeGreaterThan(lowerSuggestion.totalCents);
  });

  it('should maintain lock even when suggested price would be higher', () => {
    // Lock a lower price
    const lockedPrice = 3000;
    lockPrice(sessionId, lockedPrice);
    
    // Suggest a higher price
    const higherSuggestion = buildReceiptPreview({
      sessionId,
      basePriceCents: 5000,
      marginCents: 1000,
      premiumAddOns: [{ name: 'Premium', priceCents: 2000 }],
    });
    
    // Lock should remain at lower price
    const lock = getLockedPrice(sessionId);
    expect(lock?.finalPriceCents).toBe(lockedPrice);
    expect(lock?.finalPriceCents).toBeLessThan(higherSuggestion.totalCents);
  });

  it('should allow clearing lock for testing or admin override', () => {
    lockPrice(sessionId, 3500);
    expect(isPriceLocked(sessionId)).toBe(true);
    
    clearPriceLock(sessionId);
    
    expect(isPriceLocked(sessionId)).toBe(false);
    expect(getLockedPrice(sessionId)).toBeNull();
  });
});

