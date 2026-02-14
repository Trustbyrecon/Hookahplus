/**
 * Keyboard Navigation Hook
 * 
 * Provides keyboard shortcuts and navigation for accessibility
 */

import { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description?: string;
}

export function useKeyboardNavigation(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    shortcuts.forEach(shortcut => {
      const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatch = shortcut.ctrlKey === undefined ? true : (e.ctrlKey === shortcut.ctrlKey);
      const shiftMatch = shortcut.shiftKey === undefined ? true : (e.shiftKey === shortcut.shiftKey);
      const altMatch = shortcut.altKey === undefined ? true : (e.altKey === shortcut.altKey);
      const metaMatch = shortcut.metaKey === undefined ? true : (e.metaKey === shortcut.metaKey);

      if (keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch) {
        e.preventDefault();
        shortcut.action();
      }
    });
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}

/**
 * Common keyboard shortcuts for lounge layout
 */
export const LAYOUT_KEYBOARD_SHORTCUTS = {
  SAVE: { key: 's', ctrlKey: true, description: 'Save layout' },
  ADD_TABLE: { key: 'a', ctrlKey: true, description: 'Add table' },
  DELETE_TABLE: { key: 'Delete', description: 'Delete selected table' },
  ESCAPE: { key: 'Escape', description: 'Deselect table' },
  LAYOUT_MODE: { key: '1', description: 'Switch to layout mode' },
  LIVE_MODE: { key: '2', description: 'Switch to live mode' },
  ANALYTICS_MODE: { key: '3', description: 'Switch to analytics mode' },
  HELP: { key: '?', description: 'Show help' },
};

