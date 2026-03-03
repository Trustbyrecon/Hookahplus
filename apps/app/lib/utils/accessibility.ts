/**
 * Accessibility Utilities
 * 
 * Helper functions for accessibility features
 */

/**
 * Generate ARIA label for table
 */
export function getTableAriaLabel(table: {
  name: string;
  capacity: number;
  seatingType: string;
  status?: string;
}): string {
  const parts = [
    `Table ${table.name}`,
    `Capacity: ${table.capacity} seats`,
    `Type: ${table.seatingType}`,
  ];
  
  if (table.status) {
    parts.push(`Status: ${table.status}`);
  }
  
  return parts.join('. ');
}

/**
 * Generate ARIA label for button with context
 */
export function getButtonAriaLabel(
  action: string,
  context?: string
): string {
  if (context) {
    return `${action} ${context}`;
  }
  return action;
}

/**
 * Announce to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Check if device is mobile
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  ) || window.innerWidth < 768;
}

/**
 * Check if device is tablet
 */
export function isTabletDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /iPad|Android/i.test(navigator.userAgent) && window.innerWidth >= 768 && window.innerWidth < 1024;
}

/**
 * Get minimum touch target size (44x44px recommended)
 */
export function getTouchTargetSize(): number {
  return 44;
}

