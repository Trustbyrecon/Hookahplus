'use client';

import { useState, useEffect } from 'react';

/**
 * Platform Detection Utility
 * -------------------------
 * Detects iOS, Android, and other platforms for platform-specific optimizations
 */

export interface PlatformInfo {
  isIOS: boolean;
  isAndroid: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  platform: 'ios' | 'android' | 'desktop' | 'unknown';
  version: string;
  browser: string;
  hasTouch: boolean;
  hasHaptics: boolean;
  hasBiometrics: boolean;
  screenSize: 'small' | 'medium' | 'large' | 'xlarge';
  orientation: 'portrait' | 'landscape';
}

export function usePlatformDetection(): PlatformInfo {
  const [platformInfo, setPlatformInfo] = useState<PlatformInfo>({
    isIOS: false,
    isAndroid: false,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    platform: 'unknown',
    version: '',
    browser: '',
    hasTouch: false,
    hasHaptics: false,
    hasBiometrics: false,
    screenSize: 'medium',
    orientation: 'portrait'
  });

  useEffect(() => {
    const detectPlatform = () => {
      const userAgent = navigator.userAgent;
      const isIOS = /iPad|iPhone|iPod/.test(userAgent);
      const isAndroid = /Android/.test(userAgent);
      const isMobile = /Mobi|Android/i.test(userAgent) || isIOS;
      const isTablet = /iPad|Android(?=.*\bMobile\b)/i.test(userAgent);
      const isDesktop = !isMobile && !isTablet;
      
      // Detect platform
      let platform: 'ios' | 'android' | 'desktop' | 'unknown' = 'unknown';
      if (isIOS) platform = 'ios';
      else if (isAndroid) platform = 'android';
      else if (isDesktop) platform = 'desktop';

      // Detect browser
      let browser = 'unknown';
      if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'safari';
      else if (userAgent.includes('Chrome')) browser = 'chrome';
      else if (userAgent.includes('Firefox')) browser = 'firefox';
      else if (userAgent.includes('Edge')) browser = 'edge';

      // Detect version
      let version = '';
      if (isIOS) {
        const match = userAgent.match(/OS (\d+)_(\d+)/);
        if (match) version = `${match[1]}.${match[2]}`;
      } else if (isAndroid) {
        const match = userAgent.match(/Android (\d+\.?\d*)/);
        if (match) version = match[1];
      }

      // Detect capabilities
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const hasHaptics = 'vibrate' in navigator;
      const hasBiometrics = 'credentials' in navigator && 'create' in navigator.credentials;

      // Detect screen size
      const width = window.innerWidth;
      let screenSize: 'small' | 'medium' | 'large' | 'xlarge' = 'medium';
      if (width < 480) screenSize = 'small';
      else if (width < 768) screenSize = 'medium';
      else if (width < 1024) screenSize = 'large';
      else screenSize = 'xlarge';

      // Detect orientation
      const orientation = width > window.innerHeight ? 'landscape' : 'portrait';

      setPlatformInfo({
        isIOS,
        isAndroid,
        isMobile,
        isTablet,
        isDesktop,
        platform,
        version,
        browser,
        hasTouch,
        hasHaptics,
        hasBiometrics,
        screenSize,
        orientation
      });
    };

    detectPlatform();
    
    // Listen for orientation changes
    const handleOrientationChange = () => {
      setTimeout(detectPlatform, 100); // Small delay to ensure accurate measurements
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  return platformInfo;
}

// Platform-specific utility functions
export const PlatformUtils = {
  // iOS-specific functions
  ios: {
    // Add iOS-specific styles
    addIOSStyles: () => {
      if (typeof document !== 'undefined') {
        const style = document.createElement('style');
        style.textContent = `
          /* iOS-specific optimizations */
          .ios-scroll {
            -webkit-overflow-scrolling: touch;
            scroll-behavior: smooth;
          }
          
          .ios-input {
            -webkit-appearance: none;
            border-radius: 0;
          }
          
          .ios-button {
            -webkit-tap-highlight-color: transparent;
            -webkit-touch-callout: none;
            -webkit-user-select: none;
          }
          
          .ios-safe-area {
            padding-top: env(safe-area-inset-top);
            padding-bottom: env(safe-area-inset-bottom);
            padding-left: env(safe-area-inset-left);
            padding-right: env(safe-area-inset-right);
          }
        `;
        document.head.appendChild(style);
      }
    },

    // Request iOS haptic feedback
    requestHaptic: (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') => {
      if ('vibrate' in navigator) {
        const patterns = {
          light: [10],
          medium: [50],
          heavy: [100],
          success: [50, 50, 50],
          warning: [100, 50, 100],
          error: [200, 100, 200]
        };
        navigator.vibrate(patterns[type]);
      }
    },

    // iOS-specific touch handling
    handleIOSTouch: (element: HTMLElement) => {
      element.style.webkitTouchCallout = 'none';
      element.style.webkitUserSelect = 'none';
      element.style.webkitTapHighlightColor = 'transparent';
    }
  },

  // Android-specific functions
  android: {
    // Add Android-specific styles
    addAndroidStyles: () => {
      if (typeof document !== 'undefined') {
        const style = document.createElement('style');
        style.textContent = `
          /* Android-specific optimizations */
          .android-scroll {
            overflow-scrolling: touch;
          }
          
          .android-input {
            -webkit-appearance: none;
            border-radius: 4px;
          }
          
          .android-button {
            -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
            touch-action: manipulation;
          }
          
          .android-status-bar {
            padding-top: 24px; /* Android status bar height */
          }
        `;
        document.head.appendChild(style);
      }
    },

    // Request Android haptic feedback
    requestHaptic: (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') => {
      if ('vibrate' in navigator) {
        const patterns = {
          light: [10],
          medium: [50],
          heavy: [100],
          success: [50, 50, 50],
          warning: [100, 50, 100],
          error: [200, 100, 200]
        };
        navigator.vibrate(patterns[type]);
      }
    },

    // Android-specific touch handling
    handleAndroidTouch: (element: HTMLElement) => {
      element.style.touchAction = 'manipulation';
      element.style.webkitTapHighlightColor = 'rgba(0, 0, 0, 0.1)';
    }
  },

  // Cross-platform functions
  common: {
    // Add PWA manifest
    addPWAManifest: () => {
      if (typeof document !== 'undefined') {
        const manifest = document.createElement('link');
        manifest.rel = 'manifest';
        manifest.href = '/manifest.json';
        document.head.appendChild(manifest);
      }
    },

    // Add PWA meta tags
    addPWAMetaTags: () => {
      if (typeof document !== 'undefined') {
        const metaTags = [
          { name: 'apple-mobile-web-app-capable', content: 'yes' },
          { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
          { name: 'apple-mobile-web-app-title', content: 'Hookah+ Guest' },
          { name: 'mobile-web-app-capable', content: 'yes' },
          { name: 'theme-color', content: '#0ea5e9' }
        ];

        metaTags.forEach(tag => {
          const meta = document.createElement('meta');
          meta.name = tag.name;
          meta.content = tag.content;
          document.head.appendChild(meta);
        });
      }
    },

    // Request biometric authentication
    requestBiometricAuth: async (): Promise<boolean> => {
      try {
        if ('credentials' in navigator && 'create' in navigator.credentials) {
          const credential = await navigator.credentials.create({
            publicKey: {
              challenge: new Uint8Array(32),
              rp: { name: 'Hookah+ Guest' },
              user: {
                id: new Uint8Array(16),
                name: 'guest',
                displayName: 'Guest User'
              },
              pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
              authenticatorSelection: {
                authenticatorAttachment: 'platform'
              }
            }
          });
          return !!credential;
        }
        return false;
      } catch (error) {
        console.log('Biometric authentication not available:', error);
        return false;
      }
    }
  }
};
