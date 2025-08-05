import {
  WhisperTrigger,
  TrustArcDisplay,
  ReflexPromptModal,
  MemoryPulseTracker,
} from '../../components/ReflexOverlay';

export default function LivePage() {
  return (
    <main className="p-8 font-sans">
      <h1 className="text-2xl font-display font-bold">Live Session</h1>
      <p className="mt-2 font-sans">Live session interface coming soon.</p>
      <div className="mt-8 space-y-4">
        <WhisperTrigger />
        <ReflexPromptModal />
      </div>
      <TrustArcDisplay score={7.9} />
      <MemoryPulseTracker />
    </main>
  );
}
