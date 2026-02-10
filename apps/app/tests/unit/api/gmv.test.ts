import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const prismaMock = vi.hoisted(() => ({
  payment: {
    aggregate: vi.fn(),
  },
  session: {
    aggregate: vi.fn(),
  },
}));

vi.mock('../../../lib/db', () => ({ prisma: prismaMock }));

import { GET } from '../../../app/api/analytics/gmv/route';

function nextRequest(url = 'http://localhost/api/analytics/gmv?windowDays=30') {
  return new NextRequest(url);
}

describe('GET /api/analytics/gmv', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.payment.aggregate.mockResolvedValue({
      _sum: { amountCents: 50000 },
      _count: { id: 2 },
    });
    prismaMock.session.aggregate.mockResolvedValue({
      _sum: { priceCents: 30000 },
      _count: { id: 1 },
    });
  });

  it('returns success with GMV shape and period', async () => {
    const res = await GET(nextRequest());
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.gmv_hookah_stripe_cents).toBe(50000);
    expect(data.gmv_hookah_square_cents).toBe(30000);
    expect(data.gmv_hookah_total_cents).toBe(80000);
    expect(data.gmv_hookah_stripe).toBe(500);
    expect(data.gmv_hookah_square).toBe(300);
    expect(data.gmv_hookah_total).toBe(800);
    expect(data.count_stripe).toBe(2);
    expect(data.count_square).toBe(1);
    expect(data.period).toBeDefined();
    expect(data.period.windowDays).toBe(30);
    expect(data.period.from).toBeDefined();
    expect(data.period.to).toBeDefined();
    expect(data.filter).toEqual({ loungeId: null, tenantId: null });
  });

  it('clamps windowDays to 1–366', async () => {
    await GET(nextRequest('http://localhost/api/analytics/gmv?windowDays=0'));
    const cutoff = (prismaMock.payment.aggregate.mock.calls[0][0] as any).where.paidAt.gte;
    expect(cutoff).toBeInstanceOf(Date);

    await GET(nextRequest('http://localhost/api/analytics/gmv?windowDays=400'));
    const cutoff2 = (prismaMock.payment.aggregate.mock.calls[1][0] as any).where.paidAt.gte;
    expect(cutoff2).toBeInstanceOf(Date);
    const daysDiff = Math.round((Date.now() - cutoff2.getTime()) / (24 * 60 * 60 * 1000));
    expect(daysDiff).toBe(366);
  });

  it('passes loungeId and tenantId to aggregates', async () => {
    await GET(nextRequest('http://localhost/api/analytics/gmv?windowDays=7&loungeId=L1&tenantId=T1'));

    expect(prismaMock.payment.aggregate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tenantId: 'T1',
          session: { loungeId: 'L1' },
        }),
      })
    );
    expect(prismaMock.session.aggregate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          loungeId: 'L1',
          tenantId: 'T1',
        }),
      })
    );
  });

  it('returns 500 and error shape when aggregate throws', async () => {
    prismaMock.payment.aggregate.mockRejectedValueOnce(new Error('DB error'));

    const res = await GET(nextRequest());
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Failed to get GMV analytics');
    expect(data.details).toContain('DB error');
  });
});
