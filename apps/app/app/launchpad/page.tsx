'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { VenueSnapshotStep } from '../../components/launchpad/VenueSnapshotStep';
import { FlavorsMixesStep } from '../../components/launchpad/FlavorsMixesStep';
import { SessionRulesStep } from '../../components/launchpad/SessionRulesStep';
import { StaffRolesStep } from '../../components/launchpad/StaffRolesStep';
import { POSBridgeStep } from '../../components/launchpad/POSBridgeStep';
import { GoLiveStep } from '../../components/launchpad/GoLiveStep';
import { ProgressIndicator } from '../../components/launchpad/ProgressIndicator';
import { saveProgressLocal, loadProgressLocal, syncProgressToServer } from '../../lib/launchpad/progress-persistence';
import { LaunchPadProgress } from '../../types/launchpad';

const TOTAL_STEPS = 6;

function LaunchPadPageContent() {
  const searchParams = useSearchParams();
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState<LaunchPadProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize session
  useEffect(() => {
    async function initializeSession() {
      try {
        setIsLoading(true);
        
        // Check for token in URL (from ManyChat or direct link)
        const tokenFromUrl = searchParams.get('token');
        const source = searchParams.get('source') || 'web';

        if (tokenFromUrl) {
          // Load existing session
          const response = await fetch(`/api/launchpad/session?token=${tokenFromUrl}`);
          const result = await response.json();
          
          if (result.success && result.progress) {
            setSessionToken(tokenFromUrl);
            setProgress(result.progress);
            setCurrentStep(result.progress.currentStep);
            saveProgressLocal(result.progress);
            setIsLoading(false);
            return;
          }
        }

        // Try loading from localStorage
        const localProgress = loadProgressLocal();
        if (localProgress && localProgress.sessionToken) {
          // Verify session still exists on server
          const response = await fetch(`/api/launchpad/session?token=${localProgress.sessionToken}`);
          const result = await response.json();
          
          if (result.success && result.progress) {
            setSessionToken(localProgress.sessionToken);
            setProgress(result.progress);
            setCurrentStep(result.progress.currentStep);
            setIsLoading(false);
            return;
          }
        }

        // Create new session
        const prefillData = source === 'manychat' ? {
          subscriber_id: searchParams.get('subscriber_id'),
          instagram_username: searchParams.get('instagram_username'),
          custom_fields: {
            lounge_name: searchParams.get('lounge_name'),
            city: searchParams.get('city'),
            seats_tables: searchParams.get('seats_tables'),
            pos_used: searchParams.get('pos_used'),
            session_type: searchParams.get('session_type'),
            price_range: searchParams.get('price_range'),
            top_5_flavors: searchParams.get('top_5_flavors'),
          },
        } : undefined;

        const response = await fetch('/api/launchpad/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ source, prefillData }),
        });

        const result = await response.json();
        
        if (result.success) {
          setSessionToken(result.token);
          setProgress(result.progress);
          saveProgressLocal(result.progress);
        } else {
          // Show migration message if needed
          if (result.migrationRequired) {
            setError(
              `Database setup required: ${result.details}\n\n` +
              `Please run this command in your terminal:\n` +
              `cd apps/app && npx prisma migrate dev --name add_setup_session`
            );
          } else {
            setError(result.error || 'Failed to initialize session');
          }
        }
      } catch (err: any) {
        console.error('[LaunchPad] Initialization error:', err);
        setError(err.message || 'Failed to initialize LaunchPad');
      } finally {
        setIsLoading(false);
      }
    }

    initializeSession();
  }, [searchParams]);

  const handleStepComplete = async (step: number, data: any) => {
    if (!sessionToken || !progress) return;

    try {
      // Update local progress
      const updatedProgress: LaunchPadProgress = {
        ...progress,
        currentStep: step + 1,
        completedSteps: [...new Set([...progress.completedSteps, step])],
        data: {
          ...progress.data,
          [`step${step}`]: data,
        },
        lastUpdated: new Date().toISOString(),
      };

      setProgress(updatedProgress);
      saveProgressLocal(updatedProgress);

      // Sync to server
      await syncProgressToServer(sessionToken, step, {
        [`step${step}`]: data,
      } as any);

      // Move to next step
      if (step < TOTAL_STEPS) {
        setCurrentStep(step + 1);
      }
    } catch (error: any) {
      console.error('[LaunchPad] Error completing step:', error);
      setError(error.message || 'Failed to save progress');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-white text-lg">Loading LaunchPad...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-red-400 text-lg">Error: {error}</div>
      </div>
    );
  }

  if (!sessionToken || !progress) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-white text-lg">Failed to initialize session</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">H+ LaunchPad</h1>
          <p className="text-zinc-400">From zero to live sessions in under an hour.</p>
          {searchParams.get('source') === 'manychat' && (
            <p className="text-sm text-teal-400 mt-2">
              Setup started via Instagram DM
            </p>
          )}
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />

        {/* Step Content */}
        <div className="mt-8">
          {currentStep === 1 && (
            <VenueSnapshotStep
              initialData={progress.data.step1}
              onComplete={(data) => handleStepComplete(1, data)}
              onBack={currentStep > 1 ? handleBack : undefined}
            />
          )}
          {currentStep === 2 && (
            <FlavorsMixesStep
              initialData={progress.data.step2}
              onComplete={(data) => handleStepComplete(2, data)}
              onBack={handleBack}
            />
          )}
          {currentStep === 3 && (
            <SessionRulesStep
              initialData={progress.data.step3}
              onComplete={(data) => handleStepComplete(3, data)}
              onBack={handleBack}
            />
          )}
          {currentStep === 4 && (
            <StaffRolesStep
              initialData={progress.data.step4}
              onComplete={(data) => handleStepComplete(4, data)}
              onBack={handleBack}
            />
          )}
          {currentStep === 5 && (
            <POSBridgeStep
              initialData={progress.data.step5}
              onComplete={(data) => handleStepComplete(5, data)}
              onBack={handleBack}
            />
          )}
          {currentStep === 6 && sessionToken && (
            <GoLiveStep
              sessionToken={sessionToken}
              onBack={handleBack}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function LaunchPadPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-lg font-semibold mb-2">Loading LaunchPad...</h2>
            <p className="text-zinc-400 text-sm">Initializing setup</p>
          </div>
        </div>
      }
    >
      <LaunchPadPageContent />
    </Suspense>
  );
}

