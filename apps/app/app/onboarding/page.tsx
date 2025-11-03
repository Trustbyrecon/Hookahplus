import PartnerWaitlistForm from "../../components/PartnerWaitlistForm";
import {
  WhisperTrigger,
  TrustArcDisplay,
  ReflexPromptModal,
  MemoryPulseTracker,
} from "../../components/ReflexOverlay";
import { loadScreencoderConfig } from "../../lib/screencoder";

export default function Onboarding() {
  const config = loadScreencoderConfig() as any;
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-charcoal text-goldLumen font-sans">
      <h1 className="text-3xl font-display font-bold mb-4 text-ember">
        {config.lounge_name ?? 'Lounge'} Onboarding
      </h1>
      <p className="font-sans mb-4">Ready to light up your lounge?</p>
      <PartnerWaitlistForm />
      <div className="mt-8 space-y-4">
        <WhisperTrigger />
        <ReflexPromptModal />
      </div>
      <TrustArcDisplay score={9.0} />
      <MemoryPulseTracker />
    </main>
  );
}
