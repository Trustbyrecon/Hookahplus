import dynamic from 'next/dynamic';

export const WhisperTrigger = dynamic(() => import('./WhisperTrigger'), {
  ssr: false,
  loading: () => null,
});

export const TrustArcDisplay = dynamic(() => import('./TrustArcDisplay'), {
  ssr: false,
  loading: () => null,
});

export const ReflexPromptModal = dynamic(() => import('./ReflexPromptModal'), {
  ssr: false,
  loading: () => null,
});

export const MemoryPulseTracker = dynamic(() => import('./MemoryPulseTracker'), {
  ssr: false,
  loading: () => null,
});
