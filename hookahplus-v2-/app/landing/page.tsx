"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  useEffect(() => {
    // Simulate video loading
    setTimeout(() => setIsVideoLoaded(true), 1000);
  }, []);

  return (
    <main className="min-h-screen bg-zinc-950 text-white selection:bg-teal-400/30">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/60 border-b border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500"></div>
            <span className="font-semibold tracking-tight">HookahPlus</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-zinc-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#demo" className="hover:text-white transition-colors">Demo</a>
            <Link
              href="/owner-cta?form=preorder"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-700 px-3 py-1 hover:border-teal-500/70 hover:text-white transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063A2 2 0 0 0 14.063 15.5l-1.582 6.135a.5.5 0 0 1-.963 0z"></path><path d="M20 3v4"></path><path d="M22 5h-4"></path><path d="M4 17v2"></path><path d="M5 18H3"></path></svg>
              Join Waitlist
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_-10%,rgba(20,184,166,0.25),transparent_60%)]"></div>
        <div className="mx-auto max-w-7xl px-4 py-20 md:py-28">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-teal-400 to-emerald-400">
                HOOKAH+
              </span>
            </h1>
            <h2 className="text-2xl md:text-3xl text-zinc-300 mb-8 font-light">
              Future of Lounge Sessions with AI-Powered Personalization
            </h2>
            <p className="text-xl text-zinc-400 mb-12 max-w-3xl mx-auto">
              Transform your hookah lounge with intelligent session management, 
              personalized customer experiences, and seamless payment processing.
            </p>
            
            {/* Primary CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
              <Link
                href="/owner-cta?form=preorder"
                className="bg-teal-500 hover:bg-teal-400 text-zinc-950 px-8 py-4 rounded-xl text-xl font-bold transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                🚀 Start Preorders
              </Link>
              <Link
                href="/demo-video"
                className="bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-4 rounded-xl text-xl font-medium transition-all duration-200 border border-zinc-700 hover:border-zinc-600"
              >
                🎯 See Demo
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-8">
              <div className="text-center">
                <div className="text-4xl mb-3">🤖</div>
                <h3 className="text-lg font-semibold text-teal-300 mb-2">AI-Powered</h3>
                <p className="text-zinc-400 text-sm">Intelligent flavor recommendations and customer insights</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">💳</div>
                <h3 className="text-lg font-semibold text-teal-300 mb-2">Secure Payments</h3>
                <p className="text-zinc-400 text-sm">Stripe integration with real-time transaction processing</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">📱</div>
                <h3 className="text-lg font-semibold text-teal-300 mb-2">QR Experience</h3>
                <p className="text-zinc-400 text-sm">Seamless customer journey from scan to session</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section id="features" className="py-32 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-20">
            Why Lounge Owners Choose Hookah+
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 hover:border-zinc-700 transition-all duration-200 hover:scale-105">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-white mb-3">Customer Personalization</h3>
              <p className="text-zinc-400">AI learns preferences and suggests perfect flavor combinations for returning customers.</p>
            </div>
            
            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 hover:border-zinc-700 transition-all duration-200 hover:scale-105">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-white mb-3">Real-Time Analytics</h3>
              <p className="text-zinc-400">Monitor session performance, popular flavors, and customer behavior in real-time.</p>
            </div>
            
            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 hover:border-zinc-700 transition-all duration-200 hover:scale-105">
              <div className="text-3xl mb-4">💰</div>
              <h3 className="text-xl font-semibold text-white mb-3">Revenue Optimization</h3>
              <p className="text-zinc-400">Increase average order value with intelligent upselling and flavor recommendations.</p>
            </div>
            
            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 hover:border-zinc-700 transition-all duration-200 hover:scale-105">
              <div className="text-3xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold text-white mb-3">Secure Transactions</h3>
              <p className="text-zinc-400">Enterprise-grade security with Stripe integration and fraud protection.</p>
            </div>
            
            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 hover:border-zinc-700 transition-all duration-200 hover:scale-105">
              <div className="text-3xl mb-4">📱</div>
              <h3 className="text-xl font-semibold text-white mb-3">Mobile-First Design</h3>
              <p className="text-zinc-400">Optimized for mobile devices with intuitive touch interfaces.</p>
            </div>
            
            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 hover:border-zinc-700 transition-all duration-200 hover:scale-105">
              <div className="text-3xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold text-white mb-3">Quick Setup</h3>
              <p className="text-zinc-400">Get started in minutes with our plug-and-play QR system and dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section id="demo" className="py-24 bg-gradient-to-r from-teal-900/20 to-blue-900/20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Lounge?
          </h2>
          <p className="text-xl text-zinc-300 mb-8">
            Join the future of hookah lounge management with AI-powered personalization
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/demo-video"
              className="bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-4 rounded-xl text-xl font-medium transition-all duration-200 border border-zinc-700 hover:border-zinc-600"
            >
              🎯 Experience the Demo
            </Link>
            <Link
              href="/owner-cta?form=preorder"
              className="bg-teal-500 hover:bg-teal-400 text-zinc-950 px-8 py-4 rounded-xl text-xl font-bold transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              🚀 Start Preorders
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-10 text-sm text-zinc-400">
        <div className="mx-auto max-w-7xl px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500"></div>
            <span>HookahPlus</span>
          </div>
          <div className="flex gap-6">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#demo" className="hover:text-white transition-colors">Demo</a>
            <Link href="/owner-cta?form=preorder" className="hover:text-white transition-colors">Join Waitlist</Link>
          </div>
          <div>© {new Date().getFullYear()} Trust by Recon</div>
        </div>
      </footer>
    </main>
  );
}
