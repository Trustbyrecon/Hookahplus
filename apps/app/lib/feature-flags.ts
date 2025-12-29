/**
 * Feature Flags for Training Wheels Management
 * 
 * Controls visibility of development/testing UI components based on:
 * - First Light completion status
 * - Metrics enablement
 * - Alpha Stability activation
 * - Environment (development vs production)
 */

export interface FeatureFlags {
  // First Light status
  firstLightCompleted: boolean;
  firstLightFocus: boolean;
  
  // Metrics & Stability
  metricsEnabled: boolean;
  alphaStabilityActive: boolean;
  
  // Environment
  isDevelopment: boolean;
  isProduction: boolean;
  isDemoMode: boolean;
  
  // Training wheels visibility
  showFirstLightBanner: boolean;
  showFirstLightHealthCard: boolean;
  showFirstLightChecklist: boolean;
  showTestSessionButton: boolean;
  showClearOldSessions: boolean;
  showFirstLightFocusToggle: boolean;
  showAlphaStabilityBanners: boolean;
  showFlywheelBanner: boolean;
}

/**
 * Get feature flags from localStorage and environment
 */
export function getFeatureFlags(): FeatureFlags {
  if (typeof window === 'undefined') {
    // Server-side: return defaults
    return {
      firstLightCompleted: false,
      firstLightFocus: false,
      metricsEnabled: false,
      alphaStabilityActive: false,
      isDevelopment: process.env.NODE_ENV === 'development',
      isProduction: process.env.NODE_ENV === 'production',
      isDemoMode: false,
      showFirstLightBanner: true,
      showFirstLightHealthCard: false,
      showFirstLightChecklist: false,
      showTestSessionButton: false,
      showClearOldSessions: false,
      showFirstLightFocusToggle: false,
      showAlphaStabilityBanners: false,
      showFlywheelBanner: false,
    };
  }

  // Client-side: read from localStorage
  const firstLightCompleted = localStorage.getItem('firstLightCompleted') === 'true';
  const firstLightFocus = localStorage.getItem('firstLightFocus') === 'true';
  const metricsEnabled = localStorage.getItem('metricsEnabled') === 'true';
  const alphaStabilityActive = localStorage.getItem('alphaStabilityMode') === 'true';
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Check if in demo mode from URL
  const urlParams = new URLSearchParams(window.location.search);
  const isDemoMode = urlParams.get('mode') === 'demo';

  // Determine what to show based on flags
  const showFirstLightBanner = !firstLightCompleted && !isDemoMode;
  const showFirstLightHealthCard = firstLightFocus && !firstLightCompleted && !isDemoMode;
  const showFirstLightChecklist = firstLightFocus && !firstLightCompleted && !isDemoMode;
  const showTestSessionButton = isDevelopment && !isDemoMode; // Only in dev
  const showClearOldSessions = firstLightFocus && !firstLightCompleted && !isDemoMode;
  const showFirstLightFocusToggle = !firstLightCompleted && !isDemoMode;
  const showAlphaStabilityBanners = !alphaStabilityActive && firstLightCompleted && !isDemoMode;
  const showFlywheelBanner = firstLightCompleted && !alphaStabilityActive && !isDemoMode;

  return {
    firstLightCompleted,
    firstLightFocus,
    metricsEnabled,
    alphaStabilityActive,
    isDevelopment,
    isProduction,
    isDemoMode,
    showFirstLightBanner,
    showFirstLightHealthCard,
    showFirstLightChecklist,
    showTestSessionButton,
    showClearOldSessions,
    showFirstLightFocusToggle,
    showAlphaStabilityBanners,
    showFlywheelBanner,
  };
}

/**
 * Mark First Light as completed
 */
export function markFirstLightCompleted(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('firstLightCompleted', 'true');
    // Optionally remove focus mode
    localStorage.removeItem('firstLightFocus');
  }
}

/**
 * Enable metrics
 */
export function enableMetrics(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('metricsEnabled', 'true');
  }
}

/**
 * Activate Alpha Stability mode
 */
export function activateAlphaStability(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('alphaStabilityMode', 'true');
    localStorage.setItem('metricsEnabled', 'true');
    localStorage.setItem('firstLightCompleted', 'true');
    localStorage.removeItem('firstLightFocus');
  }
}

/**
 * Reset all flags (for testing/development)
 */
export function resetFeatureFlags(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('firstLightCompleted');
    localStorage.removeItem('firstLightFocus');
    localStorage.removeItem('metricsEnabled');
    localStorage.removeItem('alphaStabilityMode');
  }
}

