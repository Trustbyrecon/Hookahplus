import MoodbookReflexPanel from '../components/MoodbookReflexPanel';

export default function LiveSession() {
  const handleScoreUpdate = (score: number) => {
    console.log('Live session reflex score updated:', score);
  };

  const handleOnboardingComplete = () => {
    console.log('Live session onboarding completed successfully');
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-black text-white">
      <h1 className="text-3xl font-bold mb-4">Live Session</h1>
      <p className="mb-6">Join an active Hookah+ session in real-time.</p>
      
      {/* Moodbook Reflex Panel for Live Session */}
      <div className="w-full max-w-2xl mb-8">
        <MoodbookReflexPanel
          initialScore={78}
          showLogPreview={true}
          enableOnboarding={true}
          threshold={92}
          onScoreUpdate={handleScoreUpdate}
          onOnboardingComplete={handleOnboardingComplete}
          className="mb-6"
        />
      </div>
      
      <div className="text-center">
        <p className="text-sm text-gray-400">
          Live session mode - Real-time reflex scoring and monitoring
        </p>
      </div>
    </main>
  );
}
