import { describe, it, expect } from 'vitest';
import { generateExternalRef, resolveQRToSessionKey, validateQRSessionBinding } from '@/lib/qr-session-binding';

/**
 * QR Session Binding Test
 * 
 * QR resolves to the correct session ID, no cross-session leakage.
 * 
 * This is one of the 10 conformance tests to validate Phase 3 Hardening Mini-Pack.
 */
describe('QR Session Binding Test', () => {
  it('should resolve QR token to correct session key', () => {
    const qrToken = {
      loungeId: 'lounge-123',
      tableId: 'T-5',
      ref: 'qr_token_abc123',
    };

    const sessionKey = resolveQRToSessionKey(qrToken);

    expect(sessionKey.loungeId).toBe('lounge-123');
    expect(sessionKey.externalRef).toBe('qr_token_abc123');
  });

  it('should prevent cross-session leakage with same QR token in same lounge', () => {
    const qrToken = {
      loungeId: 'lounge-123',
      tableId: 'T-5',
      ref: 'qr_token_xyz789',
    };

    const sessionKey1 = resolveQRToSessionKey(qrToken);
    const sessionKey2 = resolveQRToSessionKey(qrToken);

    // Same QR token in same lounge should resolve to same session key
    expect(sessionKey1.loungeId).toBe(sessionKey2.loungeId);
    expect(sessionKey1.externalRef).toBe(sessionKey2.externalRef);
    
    // This ensures idempotency - same QR scan won't create duplicate sessions
    expect(sessionKey1).toEqual(sessionKey2);
  });

  it('should allow same QR token in different lounges (different sessions)', () => {
    const qrToken1 = {
      loungeId: 'lounge-123',
      tableId: 'T-5',
      ref: 'qr_token_shared',
    };

    const qrToken2 = {
      loungeId: 'lounge-456', // Different lounge
      tableId: 'T-5',
      ref: 'qr_token_shared', // Same QR token
    };

    const sessionKey1 = resolveQRToSessionKey(qrToken1);
    const sessionKey2 = resolveQRToSessionKey(qrToken2);

    // Different lounges should create different session keys
    expect(sessionKey1.loungeId).not.toBe(sessionKey2.loungeId);
    expect(sessionKey1.externalRef).toBe(sessionKey2.externalRef); // Same ref, but different lounge
    
    // The unique constraint is on (loungeId, externalRef), so these are different sessions
    expect(sessionKey1).not.toEqual(sessionKey2);
  });

  it('should validate QR token resolves to correct session', () => {
    const qrToken = {
      loungeId: 'lounge-123',
      tableId: 'T-5',
      ref: 'qr_token_valid',
    };

    const session = {
      id: 'session-abc',
      loungeId: 'lounge-123',
      externalRef: 'qr_token_valid',
    };

    const isValid = validateQRSessionBinding(qrToken, session);
    expect(isValid).toBe(true);
  });

  it('should reject QR token that resolves to wrong session', () => {
    const qrToken = {
      loungeId: 'lounge-123',
      tableId: 'T-5',
      ref: 'qr_token_valid',
    };

    const wrongSession1 = {
      id: 'session-xyz',
      loungeId: 'lounge-456', // Wrong lounge
      externalRef: 'qr_token_valid',
    };

    const wrongSession2 = {
      id: 'session-xyz',
      loungeId: 'lounge-123',
      externalRef: 'qr_token_different', // Wrong ref
    };

    expect(validateQRSessionBinding(qrToken, wrongSession1)).toBe(false);
    expect(validateQRSessionBinding(qrToken, wrongSession2)).toBe(false);
  });

  it('should handle QR tokens without tableId', () => {
    const qrToken = {
      loungeId: 'lounge-123',
      ref: 'qr_token_no_table',
    };

    const sessionKey = resolveQRToSessionKey(qrToken);

    expect(sessionKey.loungeId).toBe('lounge-123');
    expect(sessionKey.externalRef).toBe('qr_token_no_table');
  });

  it('should ensure unique session binding per lounge+externalRef combination', () => {
    const qrTokens = [
      { loungeId: 'lounge-1', ref: 'qr-1' },
      { loungeId: 'lounge-1', ref: 'qr-2' },
      { loungeId: 'lounge-2', ref: 'qr-1' }, // Same ref, different lounge
      { loungeId: 'lounge-2', ref: 'qr-2' },
    ];

    const sessionKeys = qrTokens.map(resolveQRToSessionKey);

    // All should be unique (loungeId + externalRef combinations)
    const uniqueKeys = new Set(sessionKeys.map(k => `${k.loungeId}:${k.externalRef}`));
    expect(uniqueKeys.size).toBe(4); // All 4 combinations are unique
  });

  it('should prevent session leakage when QR token is reused', () => {
    const qrToken = {
      loungeId: 'lounge-123',
      ref: 'qr_token_reused',
    };

    // First resolution
    const sessionKey1 = resolveQRToSessionKey(qrToken);
    
    // Simulate QR scan happening again (maybe user scans twice)
    const sessionKey2 = resolveQRToSessionKey(qrToken);

    // Should resolve to same session key (idempotent)
    expect(sessionKey1).toEqual(sessionKey2);
    
    // This ensures the same QR scan doesn't create a new session
    // The unique constraint (loungeId, externalRef) prevents duplicates
  });

  it('should handle different QR tokens for same table in same lounge', () => {
    const qrToken1 = {
      loungeId: 'lounge-123',
      tableId: 'T-5',
      ref: 'qr_token_1',
    };

    const qrToken2 = {
      loungeId: 'lounge-123',
      tableId: 'T-5', // Same table
      ref: 'qr_token_2', // Different QR token
    };

    const sessionKey1 = resolveQRToSessionKey(qrToken1);
    const sessionKey2 = resolveQRToSessionKey(qrToken2);

    // Same lounge, same table, but different QR tokens = different sessions
    expect(sessionKey1.loungeId).toBe(sessionKey2.loungeId);
    expect(sessionKey1.externalRef).not.toBe(sessionKey2.externalRef);
    expect(sessionKey1).not.toEqual(sessionKey2);
  });

  it('should validate session binding with null externalRef', () => {
    const qrToken = {
      loungeId: 'lounge-123',
      ref: 'qr_token_test',
    };

    const sessionWithNull = {
      id: 'session-xyz',
      loungeId: 'lounge-123',
      externalRef: null,
    };

    // Session with null externalRef should not validate
    expect(validateQRSessionBinding(qrToken, sessionWithNull as any)).toBe(false);
  });

  it('should ensure QR resolution is deterministic', () => {
    const qrToken = {
      loungeId: 'lounge-123',
      tableId: 'T-5',
      ref: 'qr_token_deterministic',
    };

    const resolutions = Array.from({ length: 10 }, () => resolveQRToSessionKey(qrToken));

    // All resolutions should be identical
    const first = resolutions[0];
    resolutions.forEach((resolution) => {
      expect(resolution).toEqual(first);
    });
  });

  it('should prevent cross-lounge session binding', () => {
    const qrToken = {
      loungeId: 'lounge-123',
      ref: 'qr_token_cross_lounge',
    };

    const sessionFromWrongLounge = {
      id: 'session-wrong',
      loungeId: 'lounge-999', // Different lounge
      externalRef: 'qr_token_cross_lounge',
    };

    // Should not validate - QR token is for lounge-123, but session is for lounge-999
    expect(validateQRSessionBinding(qrToken, sessionFromWrongLounge)).toBe(false);
  });
});

