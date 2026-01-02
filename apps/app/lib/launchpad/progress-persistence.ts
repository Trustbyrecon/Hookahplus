/**
 * LaunchPad Progress Persistence
 * 
 * Client-side localStorage + server sync for progress persistence
 */

import { LaunchPadProgress } from '../../types/launchpad';

const STORAGE_KEY = 'launchpad_progress';

/**
 * Save progress to localStorage
 */
export function saveProgressLocal(progress: LaunchPadProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.warn('[LaunchPad] Failed to save to localStorage:', error);
  }
}

/**
 * Load progress from localStorage
 */
export function loadProgressLocal(): LaunchPadProgress | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as LaunchPadProgress;
  } catch (error) {
    console.warn('[LaunchPad] Failed to load from localStorage:', error);
    return null;
  }
}

/**
 * Clear progress from localStorage
 */
export function clearProgressLocal(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('[LaunchPad] Failed to clear localStorage:', error);
  }
}

/**
 * Sync progress to server
 */
export async function syncProgressToServer(
  token: string,
  step: number,
  data: Partial<LaunchPadProgress['data']>
): Promise<void> {
  try {
    const response = await fetch('/api/launchpad/progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, step, data }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || 'Failed to sync progress');
    }
  } catch (error) {
    console.error('[LaunchPad] Failed to sync progress to server:', error);
    // Don't throw - allow offline progress saving
  }
}

