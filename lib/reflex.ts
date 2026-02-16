export type Reflex = {
  logEvent?: (event: string, payload?: Record<string, unknown>) => void;
  doSomething?: () => void;
};

// Attempt to use existing global reflex if present
const existing: Reflex | undefined =
  typeof globalThis !== 'undefined' ? (globalThis as any).reflex : undefined;

export const reflex: Reflex =
  existing || {
    logEvent: (...args: any[]) => {
      console.log('Stub reflex.logEvent triggered.', ...args);
    },
    doSomething: () => {
      console.log('Stub reflex function triggered.');
    },
  };

// Bind to global object for legacy usage
if (typeof globalThis !== 'undefined' && !existing) {
  (globalThis as any).reflex = reflex;
}

export default reflex;
