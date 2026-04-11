import GlobalNavigation from "../../components/GlobalNavigation";
import { OnboardingFlow } from "../../components/onboarding/lite/OnboardingFlow";

export default function HPlusLiteOnboardingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation />
      <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
        <OnboardingFlow />
      </div>
    </div>
  );
}
