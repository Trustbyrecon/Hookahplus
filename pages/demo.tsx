import MoodbookReflexPanel from '../components/MoodbookReflexPanel';

export default function Demo() {
  const handleScoreUpdate = (score: number) => {
    console.log('Demo reflex score updated:', score);
  };

  const handleOnboardingComplete = () => {
    console.log('Demo onboarding completed successfully');
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-black text-white">
      <h1 className="text-3xl font-bold mb-4">Hookah+ Demo</h1>
      <p className="mb-6">Experience the power of Hookah+ in action.</p>
      
      {/* Moodbook Reflex Panel for Demo */}
      <div className="w-full max-w-2xl mb-8">
        <MoodbookReflexPanel
          initialScore={95}
          showLogPreview={true}
          enableOnboarding={false}
          threshold={92}
          onScoreUpdate={handleScoreUpdate}
          onOnboardingComplete={handleOnboardingComplete}
          className="mb-6"
        />
      </div>
      
      <div className="text-center">
        <p className="text-sm text-gray-400">
          Demo mode - Reflex scoring enabled for demonstration purposes
        </p>
      </div>
    </main>
  );
}
