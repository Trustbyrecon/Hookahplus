"use client";
import { useState } from "react";
import Link from "next/link";

type OnboardingStep = {
  id: number;
  title: string;
  description: string;
  icon: string;
  completed: boolean;
  action: string;
  actionLink: string;
};

export default function WelcomePage() {
  const [onboardingSteps, setOnboardingSteps] = useState<OnboardingStep[]>([
    {
      id: 1,
      title: "Complete Your Profile",
      description: "Set up your business information and preferences",
      icon: "👤",
      completed: false,
      action: "Set Up Profile",
      actionLink: "/admin"
    },
    {
      id: 2,
      title: "Configure Your Menu",
      description: "Add your hookah flavors and pricing",
      icon: "🍃",
      completed: false,
      action: "Configure Menu",
      actionLink: "/admin"
    },
    {
      id: 3,
      title: "Set Up Tables",
      description: "Configure your lounge layout and table assignments",
      icon: "🪑",
      completed: false,
      action: "Set Up Tables",
      actionLink: "/sessions"
    },
    {
      id: 4,
      title: "Invite Your Staff",
      description: "Add team members and set permissions",
      icon: "👥",
      completed: false,
      action: "Invite Staff",
      actionLink: "/admin"
    },
    {
      id: 5,
      title: "Test Your Setup",
      description: "Run a test session to ensure everything works",
      icon: "🧪",
      completed: false,
      action: "Test Session",
      actionLink: "/demo"
    }
  ]);

  const markStepComplete = (stepId: number) => {
    setOnboardingSteps(prev => 
      prev.map(step => 
        step.id === stepId ? { ...step, completed: true } : step
      )
    );
  };

  const completedSteps = onboardingSteps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / onboardingSteps.length) * 100;

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Header */}
      <div className="px-4 py-6 border-b border-teal-500/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-teal-300">Welcome to Hookah+!</h1>
              <p className="text-zinc-400">Let's get your business up and running</p>
            </div>
            <div className="flex gap-4">
              <Link href="/dashboard" className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg transition-colors">
                📊 Dashboard
              </Link>
              <Link href="/" className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg transition-colors">
                🏠 Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Message */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-4xl font-bold text-white mb-4">
            Congratulations on joining Hookah+!
          </h2>
          <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
            You're now part of a community of forward-thinking businesses using intelligent technology 
            to revolutionize their operations. Let's get you set up in just a few simple steps.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-teal-300">Setup Progress</h3>
            <span className="text-zinc-400">
              {completedSteps} of {onboardingSteps.length} completed
            </span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-3">
            <div 
              className="bg-teal-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-sm text-zinc-500 mt-2">
            {progressPercentage === 100 
              ? "🎉 All set! You're ready to go live!" 
              : `${Math.round(progressPercentage)}% complete - Keep going!`
            }
          </p>
        </div>

        {/* Onboarding Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {onboardingSteps.map((step) => (
            <div 
              key={step.id} 
              className={`bg-zinc-900 rounded-xl border-2 p-6 transition-all ${
                step.completed 
                  ? 'border-green-500 bg-green-500/10' 
                  : 'border-zinc-800 hover:border-teal-500/50'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`text-3xl ${step.completed ? 'opacity-100' : 'opacity-80'}`}>
                  {step.completed ? '✅' : step.icon}
                </div>
                <div className="flex-1">
                  <h4 className={`font-semibold mb-2 ${
                    step.completed ? 'text-green-400' : 'text-white'
                  }`}>
                    {step.title}
                  </h4>
                  <p className="text-sm text-zinc-400 mb-4">
                    {step.description}
                  </p>
                  {step.completed ? (
                    <span className="inline-block bg-green-600 text-white text-xs px-3 py-1 rounded-full">
                      Completed
                    </span>
                  ) : (
                    <Link
                      href={step.actionLink}
                      onClick={() => markStepComplete(step.id)}
                      className="inline-block bg-teal-600 hover:bg-teal-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                    >
                      {step.action}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 mb-8">
          <h3 className="text-2xl font-semibold text-teal-300 mb-6 text-center">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link 
              href="/dashboard"
              className="bg-zinc-800 hover:bg-zinc-700 rounded-lg p-4 text-center transition-colors group"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📊</div>
              <div className="font-medium text-white">Dashboard</div>
              <div className="text-sm text-zinc-400">View your business metrics</div>
            </Link>
            
            <Link 
              href="/sessions"
              className="bg-zinc-800 hover:bg-zinc-700 rounded-lg p-4 text-center transition-colors group"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🫖</div>
              <div className="font-medium text-white">Sessions</div>
              <div className="text-sm text-zinc-400">Manage active sessions</div>
            </Link>
            
            <Link 
              href="/admin"
              className="bg-zinc-800 hover:bg-zinc-700 rounded-lg p-4 text-center transition-colors group"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">⚙️</div>
              <div className="font-medium text-white">Admin</div>
              <div className="text-sm text-zinc-400">System configuration</div>
            </Link>
            
            <Link 
              href="/demo"
              className="bg-zinc-800 hover:bg-zinc-700 rounded-lg p-4 text-center transition-colors group"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🎬</div>
              <div className="font-medium text-white">Demo</div>
              <div className="text-sm text-zinc-400">See the system in action</div>
            </Link>
          </div>
        </div>

        {/* Getting Started Guide */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8">
          <h3 className="text-2xl font-semibold text-teal-300 mb-6">Getting Started Guide</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-medium text-white mb-4">🚀 First Day Checklist</h4>
              <ul className="space-y-3 text-sm text-zinc-400">
                <li className="flex items-start gap-2">
                  <span className="text-teal-400 mt-1">•</span>
                  <span>Complete your business profile setup</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-400 mt-1">•</span>
                  <span>Add your first hookah flavors to the menu</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-400 mt-1">•</span>
                  <span>Configure your table layout</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-400 mt-1">•</span>
                  <span>Invite your first staff member</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-400 mt-1">•</span>
                  <span>Run a test session</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-medium text-white mb-4">💡 Pro Tips</h4>
              <ul className="space-y-3 text-sm text-zinc-400">
                <li className="flex items-start gap-2">
                  <span className="text-teal-400 mt-1">•</span>
                  <span>Use the demo mode to practice before going live</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-400 mt-1">•</span>
                  <span>Set up notifications for important events</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-400 mt-1">•</span>
                  <span>Customize your dashboard for quick access</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-400 mt-1">•</span>
                  <span>Review analytics daily to optimize operations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-400 mt-1">•</span>
                  <span>Keep your menu updated with seasonal flavors</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="text-center mt-12">
          <h3 className="text-2xl font-semibold text-teal-300 mb-4">Need Help?</h3>
          <p className="text-zinc-400 mb-6">
            Our support team is here to help you succeed. Don't hesitate to reach out!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/demo"
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              🎬 Watch Demo
            </Link>
            <a
              href="mailto:support@hookahplus.net"
              className="bg-zinc-700 hover:bg-zinc-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              📧 Contact Support
            </a>
            <Link
              href="/admin"
              className="bg-zinc-700 hover:bg-zinc-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              ⚙️ System Settings
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
