/**
 * Aligns admin UI scope with Fire Session Dashboard lounge picker (localStorage).
 * When a single lounge (e.g. CODIGO) is selected, some internal-only admin tools are hidden.
 */
export const ADMIN_ACTIVE_LOUNGE_KEY = 'active_lounge';
export const SELECT_ALL_LOCATIONS = '__all_locations__';

/** Remembered lounge id for admin tools (e.g. venue identity) when returning to the page */
export const STORAGE_LAST_LOUNGE = 'hp_admin_last_venue_lounge_id';

/** Client-only: current admin scope lounge id, or null when "All locations". */
export function getAdminScopeLoungeId(): string | null {
  if (typeof window === 'undefined') return null;
  const v = (localStorage.getItem(ADMIN_ACTIVE_LOUNGE_KEY) || '').trim();
  if (!v || v === SELECT_ALL_LOCATIONS) return null;
  return v;
}

/** True when operator is scoped to CODIGO only (not org-wide). */
export function isCodigoOnlyAdminScope(): boolean {
  return getAdminScopeLoungeId() === 'CODIGO';
}
