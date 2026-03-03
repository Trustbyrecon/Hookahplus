"use client";

import React, { useState, useEffect } from 'react';
import { X, HelpCircle, BookOpen, Video, CheckCircle, ArrowRight, Clock, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface FunctionalHelpProps {
  isOpen: boolean;
  onClose: () => void;
  isDemoMode?: boolean;
}

const FunctionalHelp: React.FC<FunctionalHelpProps> = ({ isOpen, onClose, isDemoMode = false }) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [onboardingStartTime, setOnboardingStartTime] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(15 * 60); // 15 minutes in seconds

  // Check if user has seen onboarding before
  useEffect(() => {
    const seen = localStorage.getItem('hookahplus_onboarding_seen');
    if (seen === 'true') {
      setHasSeenOnboarding(true);
    }
  }, []);

  // Track onboarding start time and countdown
  useEffect(() => {
    if (isOpen && !hasSeenOnboarding) {
      const startTime = Date.now();
      setOnboardingStartTime(startTime);
      localStorage.setItem('hookahplus_onboarding_start', startTime.toString());

      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = Math.max(0, 15 * 60 - elapsed);
        setTimeRemaining(remaining);

        if (remaining === 0) {
          clearInterval(interval);
          // Mark onboarding as complete after 15 minutes
          localStorage.setItem('hookahplus_onboarding_seen', 'true');
          setHasSeenOnboarding(true);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isOpen, hasSeenOnboarding]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const quickStartSteps = [
    {
      id: 'create-session',
      title: 'Create Your First Session',
      description: 'Click "Create New Session" to start a hookah session for a customer',
      icon: Sparkles,
      action: () => {
        window.dispatchEvent(new Event('openCreateSessionModal'));
        onClose();
      },
      demoOnly: false
    },
    {
      id: 'manage-sessions',
      title: 'Manage Active Sessions',
      description: 'View and manage all active sessions from the dashboard',
      icon: BookOpen,
      action: () => {
        window.location.href = '/fire-session-dashboard';
        onClose();
      },
      demoOnly: false
    },
    {
      id: 'night-after-night',
      title: 'Night After Night Workflow',
      description: 'Use the "Claim Prep" action to start the night after night workflow',
      icon: ArrowRight,
      action: () => {
        window.location.href = '/fire-session-dashboard?mode=demo';
        onClose();
      },
      demoOnly: true
    }
  ];

  const commonQuestions = [
    {
      question: 'How do I create a session?',
      answer: 'Click the "Create New Session" button on the dashboard. Fill in customer details, select flavors, and set the timer duration.',
      category: 'Getting Started'
    },
    {
      question: 'What is the Night After Night workflow?',
      answer: 'The Night After Night workflow allows you to quickly start a new session for a returning customer. Use the "Claim Prep" action on a completed session.',
      category: 'Workflows'
    },
    {
      question: 'How do I process payments?',
      answer: 'Payments are processed automatically through Stripe when a session is created. You can also manually confirm payments from the session details.',
      category: 'Payments'
    },
    {
      question: 'Can I customize session settings?',
      answer: 'Yes! You can set custom timer durations, assign staff members, add notes, and customize flavor mixes for each session.',
      category: 'Customization'
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HelpCircle className="w-6 h-6 text-teal-400" />
            <div>
              <h2 className="text-xl font-semibold text-white">Help & Onboarding</h2>
              {!hasSeenOnboarding && onboardingStartTime && (
                <p className="text-sm text-zinc-400 flex items-center gap-2 mt-1">
                  <Clock className="w-4 h-4" />
                  <span>Onboarding window: {formatTime(timeRemaining)} remaining</span>
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors p-2 hover:bg-zinc-800 rounded-lg"
            aria-label="Close help"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Quick Start Section */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-400" />
              Quick Start
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickStartSteps
                .filter(step => !step.demoOnly || isDemoMode)
                .map((step) => {
                  const Icon = step.icon;
                  return (
                    <button
                      key={step.id}
                      onClick={step.action}
                      className="text-left p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg hover:border-teal-500/50 hover:bg-zinc-800 transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-teal-500/10 rounded-lg group-hover:bg-teal-500/20 transition-colors">
                          <Icon className="w-5 h-5 text-teal-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-white mb-1 group-hover:text-teal-400 transition-colors">
                            {step.title}
                          </h4>
                          <p className="text-sm text-zinc-400">{step.description}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-zinc-500 group-hover:text-teal-400 transition-colors" />
                      </div>
                    </button>
                  );
                })}
            </div>
          </section>

          {/* Common Questions */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-teal-400" />
              Common Questions
            </h3>
            <div className="space-y-3">
              {commonQuestions.map((faq, index) => (
                <div
                  key={index}
                  className="p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg"
                >
                  <button
                    onClick={() => setActiveSection(activeSection === `faq-${index}` ? null : `faq-${index}`)}
                    className="w-full text-left flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-semibold text-white mb-1">{faq.question}</h4>
                      <p className="text-xs text-zinc-500">{faq.category}</p>
                    </div>
                    <div className={`transform transition-transform ${activeSection === `faq-${index}` ? 'rotate-180' : ''}`}>
                      <ArrowRight className="w-5 h-5 text-zinc-500" />
                    </div>
                  </button>
                  {activeSection === `faq-${index}` && (
                    <div className="mt-3 pt-3 border-t border-zinc-700">
                      <p className="text-sm text-zinc-300">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Resources */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Video className="w-5 h-5 text-teal-400" />
              Resources
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/help"
                className="p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg hover:border-teal-500/50 hover:bg-zinc-800 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-teal-400" />
                  <div>
                    <h4 className="font-semibold text-white group-hover:text-teal-400 transition-colors">
                      Full Documentation
                    </h4>
                    <p className="text-sm text-zinc-400">Complete guide and API reference</p>
                  </div>
                </div>
              </Link>
              <div className="p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <Video className="w-5 h-5 text-teal-400" />
                  <div>
                    <h4 className="font-semibold text-white">Video Tutorials</h4>
                    <p className="text-sm text-zinc-400">Coming soon</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Onboarding Completion */}
          {!hasSeenOnboarding && timeRemaining > 0 && (
            <div className="p-4 bg-teal-500/10 border border-teal-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-teal-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white mb-1">Onboarding in Progress</h4>
                  <p className="text-sm text-zinc-300">
                    You're in the 15-minute onboarding window. Take your time to explore the features. 
                    This window will close automatically after 15 minutes.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Completion Message */}
          {hasSeenOnboarding && (
            <div className="p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-teal-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white mb-1">Onboarding Complete</h4>
                  <p className="text-sm text-zinc-300">
                    You've completed the onboarding window. You can always access this help menu from the navigation bar.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-zinc-900 border-t border-zinc-800 px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-zinc-400">
            Need more help? <Link href="/help" className="text-teal-400 hover:text-teal-300">Visit the full help center</Link>
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors font-medium"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default FunctionalHelp;

