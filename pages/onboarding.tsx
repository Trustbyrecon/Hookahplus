import MoodbookReflexPanel from '../components/MoodbookReflexPanel';

export default function Onboarding() {
  const handleScoreUpdate = (score: number) => {
    console.log('Onboarding reflex score updated:', score);
  };

  const handleOnboardingComplete = () => {
    console.log('Onboarding flow completed successfully');
    // Here you could redirect to dashboard or show success message
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-black text-white">
      <h1 className="text-3xl font-bold mb-4">Lounge Onboarding</h1>
      <p className="mb-6">Start configuring your lounge with Hookah+.</p>
      
      {/* Moodbook Reflex Panel for Onboarding */}
      <div className="w-full max-w-2xl">
        <MoodbookReflexPanel
          initialScore={45}
          showLogPreview={true}
          enableOnboarding={true}
          threshold={92}
          onScoreUpdate={handleScoreUpdate}
          onOnboardingComplete={handleOnboardingComplete}
          className="mb-6"
        />
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-400">
          Complete the onboarding process to unlock full Hookah+ features
        </p>
      </div>
    </main>
  );
}
