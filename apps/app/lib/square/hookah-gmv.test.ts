import { describe, it, expect } from 'vitest';
import { getHookahAmountCentsFromLineItems } from './processor';

describe('getHookahAmountCentsFromLineItems (Hookah-only Contract v1)', () => {

  it('returns 0 for empty or non-array input', () => {
    expect(getHookahAmountCentsFromLineItems([])).toBe(0);
    expect(getHookahAmountCentsFromLineItems(null)).toBe(0);
    expect(getHookahAmountCentsFromLineItems(undefined)).toBe(0);
    expect(getHookahAmountCentsFromLineItems('not array')).toBe(0);
  });

  it('sums total_money.amount for line items whose name starts with prefix', () => {
    const lineItems = [
      { name: 'H+ Single Bowl', variation_name: null, total_money: { amount: 1500 } },
      { name: 'H+ Double', variation_name: null, total_money: { amount: 2500 } },
    ];
    expect(getHookahAmountCentsFromLineItems(lineItems)).toBe(4000);
  });

  it('uses variation_name when name is missing', () => {
    const lineItems = [
      { name: null, variation_name: 'H+ 45min', total_money: { amount: 1200 } },
    ];
    expect(getHookahAmountCentsFromLineItems(lineItems)).toBe(1200);
  });

  it('ignores line items that do not start with prefix', () => {
    const lineItems = [
      { name: 'H+ Hookah', variation_name: null, total_money: { amount: 2000 } },
      { name: 'Soda', variation_name: null, total_money: { amount: 300 } },
      { name: 'Food', variation_name: null, total_money: { amount: 1000 } },
    ];
    expect(getHookahAmountCentsFromLineItems(lineItems)).toBe(2000);
  });

  it('rounds amount and treats missing total_money as 0', () => {
    const lineItems = [
      { name: 'H+ Item', variation_name: null, total_money: { amount: 19.99 } },
      { name: 'H+ No Money', variation_name: null },
    ];
    expect(getHookahAmountCentsFromLineItems(lineItems)).toBe(20);
  });
});
