import { useEffect, useRef, useState } from 'react';

export function useAccessibility() {
  const [isKeyboardUser, setIsKeyboardUser] = useState(false);
  const [focusVisible, setFocusVisible] = useState(false);

  useEffect(() => {
    // Detect if user is using keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsKeyboardUser(true);
        setFocusVisible(true);
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardUser(false);
      setFocusVisible(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  const getFocusClasses = (baseClasses: string = '') => {
    if (isKeyboardUser && focusVisible) {
      return `${baseClasses} focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-zinc-900`;
    }
    return baseClasses;
  };

  const getAriaLabel = (label: string, description?: string) => {
    return description ? `${label}. ${description}` : label;
  };

  return {
    isKeyboardUser,
    focusVisible,
    getFocusClasses,
    getAriaLabel
  };
}

export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive]);

  return containerRef;
}

export function useAnnouncement() {
  const [announcement, setAnnouncement] = useState<string>('');

  const announce = (message: string) => {
    setAnnouncement(message);
    // Clear announcement after screen reader has time to read it
    setTimeout(() => setAnnouncement(''), 1000);
  };

  return { announcement, announce };
}
