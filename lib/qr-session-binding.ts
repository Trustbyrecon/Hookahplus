/**
 * QR Session Binding Utilities
 * 
 * Ensures QR codes resolve to correct session IDs with no cross-session leakage.
 */

export type QRToken = {
  loungeId: string;
  tableId?: string;
  ref: string; // QR token/externalRef
};

/**
 * Generate a unique externalRef from QR token data
 */
export function generateExternalRef(qrToken: QRToken): string {
  // In production, this might be the actual QR token from the QR code
  // For now, we'll use a deterministic format
  return qrToken.ref || `${qrToken.loungeId}_${qrToken.tableId || 'unknown'}_${Date.now()}`;
}

/**
 * Resolve QR token to session lookup key
 * Uses loungeId + externalRef as the unique binding
 */
export function resolveQRToSessionKey(qrToken: QRToken): { loungeId: string; externalRef: string } {
  return {
    loungeId: qrToken.loungeId,
    externalRef: generateExternalRef(qrToken),
  };
}

/**
 * Validate that QR token resolves to expected session
 */
export function validateQRSessionBinding(
  qrToken: QRToken,
  session: { id: string; loungeId: string; externalRef: string | null }
): boolean {
  const expectedRef = generateExternalRef(qrToken);
  return (
    session.loungeId === qrToken.loungeId &&
    session.externalRef === expectedRef
  );
}

