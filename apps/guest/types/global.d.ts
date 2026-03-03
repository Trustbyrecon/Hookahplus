/**
 * Global type declarations for Google Analytics and other browser APIs
 */

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export {};
