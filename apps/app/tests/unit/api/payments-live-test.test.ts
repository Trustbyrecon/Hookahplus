import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/payments/live-test/route';

// Mock Stripe
vi.mock('stripe', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      paymentIntents: {
        create: vi.fn().mockResolvedValue({
          id: 'pi_test_123',
          status: 'succeeded',
          amount: 100,
          currency: 'usd',
          metadata: {
            source: 'order-mgmt:$1-smoke',
            env: 'test'
          }
        })
      }
    }))
  };
});

// Mock fetch for GhostLog
global.fetch = vi.fn();

describe('/api/payments/live-test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key';
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
  });

  it('should create payment intent successfully', async () => {
    const request = new NextRequest('http://localhost:3000/api/payments/live-test', {
      method: 'POST',
      body: JSON.stringify({ cartTotal: 100, itemsCount: 1 })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.intentId).toBe('pi_test_123');
    expect(data.status).toBe('succeeded');
    expect(data.amount).toBe(100);
  });

  it('should handle missing Stripe key', async () => {
    delete process.env.STRIPE_SECRET_KEY;

    const request = new NextRequest('http://localhost:3000/api/payments/live-test', {
      method: 'POST',
      body: JSON.stringify({})
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.ok).toBe(false);
    expect(data.error).toContain('Stripe not configured');
  });

  it('should log to GhostLog on success', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ ok: true })
    });

    const request = new NextRequest('http://localhost:3000/api/payments/live-test', {
      method: 'POST',
      body: JSON.stringify({ cartTotal: 100 })
    });

    await POST(request);

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/ghost-log',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('stripe_smoke_test')
      })
    );
  });

  it('should handle Stripe API errors', async () => {
    const { default: Stripe } = await import('stripe');
    const mockStripe = new Stripe('sk_test_mock');
    
    vi.mocked(mockStripe.paymentIntents.create).mockRejectedValueOnce(
      new Error('Stripe API error')
    );

    const request = new NextRequest('http://localhost:3000/api/payments/live-test', {
      method: 'POST',
      body: JSON.stringify({})
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.ok).toBe(false);
    expect(data.error).toBeDefined();
  });
});
