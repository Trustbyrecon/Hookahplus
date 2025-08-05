import WhisperTrigger from '../../components/WhisperTrigger';
import TrustArcDisplay from '../../components/TrustArcDisplay';
import ReflexPromptModal from '../../components/ReflexPromptModal';
import MemoryPulseTracker from '../../components/MemoryPulseTracker';

export default function LiveSession() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-charcoal text-goldLumen font-sans">
      <h1 className="text-3xl font-display font-bold mb-4 text-ember">Join Live Session</h1>
      <p className="font-sans">Connect in real-time with Hookah+ support.</p>
      <div className="mt-8 space-y-4">
        <WhisperTrigger />
        <ReflexPromptModal />
      </div>
      <TrustArcDisplay score={8.3} />
      <MemoryPulseTracker />
    </main>
  );
}
