import { describe, expect, it, vi, beforeEach } from 'vitest';

// Mock env salt for deterministic hashing
process.env.HID_SALT = 'unit-test-salt';

// vitest hoists vi.mock() calls. Use vi.hoisted() so the mock object exists
// before the factory runs.
const prismaMock = vi.hoisted(() => ({
  networkPIILink: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  networkProfile: {
    findUnique: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
  networkSession: {
    updateMany: vi.fn(),
  },
  networkSessionNote: {
    updateMany: vi.fn(),
  },
  networkBadge: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
  networkPreference: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },
  $transaction: vi.fn(),
}));

vi.mock('../prisma', () => ({ prisma: prismaMock }));

import { resolveHID } from './resolver';

describe('resolveHID', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns existing profile when phone matches an existing PII link', async () => {
    prismaMock.networkPIILink.findUnique.mockResolvedValueOnce({
      profile: {
        hid: 'HID-EXISTING1234ABCD',
        consentLevel: 'claimed',
        tier: null,
        badges: [],
        preferences: null,
      },
    });

    const result = await resolveHID({ phone: '+1 (555) 123-4567' });
    expect(result.status).toBe('existing');
    expect(result.hid).toBe('HID-EXISTING1234ABCD');
    expect(prismaMock.networkProfile.create).not.toHaveBeenCalled();
  });

  it('creates a new profile and PII links when none exist', async () => {
    // phone lookup, email lookup, qr lookup, device lookup all miss
    prismaMock.networkPIILink.findUnique.mockResolvedValue(null);
    prismaMock.networkProfile.findUnique.mockResolvedValueOnce(null); // no HID collision

    prismaMock.networkProfile.create.mockResolvedValueOnce({
      hid: 'HID-NEW1234ABCD5678',
      consentLevel: 'shadow',
      tier: null,
      badges: [],
      preferences: null,
    });

    prismaMock.networkPIILink.create.mockResolvedValue({}); // link create OK

    const result = await resolveHID({ phone: '+15551234567', email: 'x@example.com' });
    expect(result.status).toBe('new');
    expect(result.hid).toBeTruthy();
    expect(prismaMock.networkProfile.create).toHaveBeenCalledTimes(1);
    // phone + email => 2 link creations
    expect(prismaMock.networkPIILink.create).toHaveBeenCalledTimes(2);
  });

  it('handles unique constraint race by returning the winning existing profile', async () => {
    // Initial phone lookup misses, then re-read after unique violation finds winner
    prismaMock.networkPIILink.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        profile: {
          hid: 'HID-WINNER9999EEEE',
          consentLevel: 'claimed',
          tier: null,
          badges: [],
          preferences: null,
        },
      });
    prismaMock.networkProfile.findUnique.mockResolvedValueOnce(null); // no HID collision
    prismaMock.networkProfile.create.mockResolvedValueOnce({
      hid: 'HID-NEW1234ABCD5678',
      consentLevel: 'shadow',
      tier: null,
      badges: [],
      preferences: null,
    });

    prismaMock.networkPIILink.create.mockRejectedValueOnce({ code: 'P2002', message: 'Unique constraint failed' });

    const result = await resolveHID({ phone: '+15551234567' });
    expect(result.status).toBe('existing');
    expect(result.hid).toBe('HID-WINNER9999EEEE');
    expect(prismaMock.networkProfile.delete).toHaveBeenCalledTimes(1);
  });
});

