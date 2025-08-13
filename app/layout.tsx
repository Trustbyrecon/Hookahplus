import React from 'react';
import MoodbookReflexPanel from '../components/MoodbookReflexPanel';
import './globals.css';

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const handleScoreUpdate = (score: number) => {
    console.log('Layout reflex score updated:', score);
  };

  const handleOnboardingComplete = () => {
    console.log('Layout onboarding completed successfully');
  };

  return (
    <html lang="en">
      <body className="bg-black text-white">
        {/* Global Moodbook Reflex Panel */}
        <div className="fixed top-4 right-4 z-40 w-80">
          <MoodbookReflexPanel
            initialScore={82}
            showLogPreview={false}
            enableOnboarding={true}
            threshold={92}
            onScoreUpdate={handleScoreUpdate}
            onOnboardingComplete={handleOnboardingComplete}
            className="shadow-2xl"
          />
        </div>
        
        {/* Main Content */}
        <main className="min-h-screen">
          {children}
        </main>
        
        {/* Footer with Reflex Status */}
        <footer className="bg-gray-900 border-t border-gray-800 py-6">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="text-gray-400">
                <p>&copy; 2024 Hookah+. All rights reserved.</p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">Reflex Score:</span>
                <span className="text-sm font-medium text-green-500">92+</span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
