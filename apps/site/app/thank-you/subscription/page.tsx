'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import { 
  CheckCircle, 
  ArrowRight, 
  Sparkles, 
  Mail,
  Settings,
  Zap
} from 'lucide-react';

function SubscriptionThankYouContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session_id');
  const tier = searchParams?.get('tier') || 'pro';
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading state
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const tierInfo: Record<string, { name: string; icon: React.ReactNode; color: string }> = {
    starter: {
      name: 'Starter',
      icon: <Zap className="w-6 h-6" />,
      color: 'teal'
    },
    pro: {
      name: 'Pro',
      icon: <Sparkles className="w-6 h-6" />,
      color: 'blue'
    },
    trust_plus: {
      name: 'Trust+',
      icon: <Sparkles className="w-6 h-6" />,
      color: 'purple'
    }
  };

  const currentTier = tierInfo[tier] || tierInfo.pro;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mx-auto mb-4"></div>
          <p className="text-zinc-400">Processing your subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <div className="max-w-3xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-6">
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Welcome to Hookah+!</h1>
          <p className="text-xl text-zinc-400">
            Your {currentTier.name} subscription is now active
          </p>
        </div>

        <Card className="bg-zinc-900/50 border-zinc-700 mb-8">
          <div className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className={`p-3 rounded-lg bg-${currentTier.color}-500/20`}>
                {currentTier.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{currentTier.name} Plan</h2>
                <p className="text-zinc-400">Subscription Active</p>
              </div>
            </div>

            {sessionId && (
              <div className="mb-6 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                <p className="text-sm text-zinc-400 mb-1">Session ID</p>
                <p className="text-xs font-mono text-zinc-300 break-all">{sessionId}</p>
              </div>
            )}

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-teal-400 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-white mb-1">Check Your Email</h3>
                  <p className="text-sm text-zinc-400">
                    We've sent you a confirmation email with your subscription details and next steps.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Settings className="w-5 h-5 text-teal-400 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-white mb-1">Complete Your Setup</h3>
                  <p className="text-sm text-zinc-400">
                    Set up your lounge configuration, add your menu, and configure your payment settings.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="primary"
                size="lg"
                className="flex-1"
                onClick={() => window.location.href = '/onboarding'}
              >
                Start Onboarding
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="flex-1"
                onClick={() => window.location.href = '/dashboard'}
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        </Card>

        {/* Next Steps */}
        <Card className="bg-zinc-900/50 border-zinc-700">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">What's Next?</h3>
            <ol className="space-y-3 text-sm text-zinc-300">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-xs font-semibold">1</span>
                <span>Complete your lounge setup and add your menu items</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-xs font-semibold">2</span>
                <span>Configure your payment settings and connect your Stripe account</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-xs font-semibold">3</span>
                <span>Invite your staff and start managing sessions</span>
              </li>
            </ol>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function SubscriptionThankYouPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading...</p>
        </div>
      </div>
    }>
      <SubscriptionThankYouContent />
    </Suspense>
  );
}

