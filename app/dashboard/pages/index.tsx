import MoodbookReflexPanel from '../../../components/MoodbookReflexPanel';

export default function Home() {
  const handleScoreUpdate = (score: number) => {
    console.log('Dashboard reflex score updated:', score);
  };

  const handleOnboardingComplete = () => {
    console.log('Dashboard onboarding completed successfully');
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Hookah+ Dashboard</h1>
        
        {/* Dashboard Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-900 rounded-2xl p-6">
            <h2 className="text-2xl font-semibold mb-4">Dashboard Status</h2>
            <p className="text-gray-400">Your Hookah+ dashboard is live and operational.</p>
          </div>
          
          {/* Moodbook Reflex Panel for Dashboard */}
          <div>
            <MoodbookReflexPanel
              initialScore={88}
              showLogPreview={true}
              enableOnboarding={false}
              threshold={92}
              onScoreUpdate={handleScoreUpdate}
              onOnboardingComplete={handleOnboardingComplete}
              className="h-full"
            />
          </div>
        </div>
        
        {/* Additional Dashboard Content */}
        <div className="bg-gray-900 rounded-2xl p-6">
          <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
              View Analytics
            </button>
            <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors">
              Manage Lounge
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors">
              Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
