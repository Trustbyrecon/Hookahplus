'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  const features = [
    {
      icon: '🚀',
      title: 'Smart Session Management',
      description: 'AI-powered session tracking with real-time analytics and automated workflows'
    },
    {
      icon: '💰',
      title: 'Revenue Optimization',
      description: 'Increase profits by 30%+ with intelligent pricing and inventory management'
    },
    {
      icon: '📱',
      title: 'Mobile-First Experience',
      description: 'Seamless mobile app for staff and customers with offline capabilities'
    },
    {
      icon: '🔒',
      title: 'Enterprise Security',
      description: 'Bank-level encryption and compliance with SOC 2 Type II certification'
    }
  ];

  const testimonials = [
    {
      name: 'Ahmed Hassan',
      role: 'Owner, Cloud 9 Lounge',
      content: 'Hookah+ transformed our operations. We saw a 40% increase in revenue within 3 months.',
      avatar: '👨‍💼'
    },
    {
      name: 'Sarah Chen',
      role: 'Manager, Oasis Hookah',
      content: 'The mobile app is incredible. Our staff can manage everything from their phones.',
      avatar: '👩‍💼'
    },
    {
      name: 'Marcus Rodriguez',
      role: 'CEO, Urban Vibe',
      content: 'Best investment we ever made. The ROI calculator was spot on with our projections.',
      avatar: '👨‍💻'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-teal-400 to-blue-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🫖</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
                Hookah+
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-white/80 hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="text-white/80 hover:text-white transition-colors">Pricing</a>
              <a href="#testimonials" className="text-white/80 hover:text-white transition-colors">Success Stories</a>
              <Link href="/demo" className="text-white/80 hover:text-white transition-colors">Demo</Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/signup" className="px-6 py-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-full font-semibold hover:from-teal-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10">
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 leading-tight">
              <span className="bg-gradient-to-r from-teal-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Revolutionize
              </span>
              <br />
              Your Hookah Business
            </h1>
            
            <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-4xl mx-auto leading-relaxed">
              The world's first AI-powered hookah lounge management system. 
              Streamline operations, boost revenue, and deliver exceptional customer experiences.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
              <Link href="/demo" className="px-8 py-4 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-full font-semibold text-lg hover:from-teal-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-2xl">
                🎬 Watch Demo
              </Link>
              <Link href="/signup" className="px-8 py-4 border-2 border-white/30 text-white rounded-full font-semibold text-lg hover:bg-white/10 transition-all duration-200">
                🚀 Start Free Trial
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-teal-400 mb-2">500+</div>
                <div className="text-white/70">Lounges Worldwide</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-400 mb-2">30%</div>
                <div className="text-white/70">Average Revenue Increase</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-400 mb-2">99.9%</div>
                <div className="text-white/70">Uptime Guarantee</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Why Choose <span className="bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">Hookah+</span>?
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Built by industry experts, powered by cutting-edge technology, designed for your success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`relative p-8 rounded-2xl transition-all duration-500 ${
                  currentFeature === index 
                    ? 'bg-gradient-to-br from-teal-500/20 to-blue-500/20 border border-teal-500/50' 
                    : 'bg-white/5 border border-white/10 hover:border-white/20'
                }`}
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-white/70 leading-relaxed">{feature.description}</p>
                
                {currentFeature === index && (
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-teal-400 rounded-full animate-pulse"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-black/40 to-purple-900/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                See It In <span className="bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">Action</span>
              </h2>
              <p className="text-xl text-white/70 mb-8 leading-relaxed">
                Experience the future of hookah lounge management with our interactive demo. 
                See how easy it is to manage sessions, track revenue, and delight customers.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-white/90">Real-time session monitoring</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-white/90">Mobile app for staff and customers</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-white/90">Advanced analytics and reporting</span>
                </div>
              </div>

              <Link href="/demo" className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-full font-semibold text-lg hover:from-teal-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105">
                🎬 Launch Interactive Demo
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-teal-500/20 to-blue-500/20 rounded-2xl p-8 border border-teal-500/30">
                <div className="bg-black/40 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-white/70 text-sm">Hookah+ Dashboard</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                      <span className="text-white">Table T-7</span>
                      <span className="text-teal-400">Active - 45m</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                      <span className="text-white">Table T-3</span>
                      <span className="text-yellow-400">Needs Refill</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                      <span className="text-white">Revenue Today</span>
                      <span className="text-green-400">$2,847</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Trusted by <span className="bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">Industry Leaders</span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Join hundreds of successful hookah lounges that have transformed their business with Hookah+.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all duration-300">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="text-4xl">{testimonial.avatar}</div>
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-white/70 text-sm">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-white/80 leading-relaxed italic">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-teal-900/20 to-blue-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to <span className="bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">Transform</span> Your Business?
          </h2>
          <p className="text-xl text-white/70 mb-8">
            Join the revolution in hookah lounge management. Start your free trial today and see the difference Hookah+ can make.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/signup" className="px-10 py-4 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-full font-semibold text-xl hover:from-teal-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-2xl">
              🚀 Start Free Trial
            </Link>
            <Link href="/demo" className="px-10 py-4 border-2 border-white/30 text-white rounded-full font-semibold text-xl hover:bg-white/10 transition-all duration-200">
              🎬 Watch Demo
            </Link>
          </div>
          
          <p className="text-white/50 text-sm mt-6">
            No credit card required • 14-day free trial • Full access to all features
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-teal-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🫖</span>
                </div>
                <span className="text-xl font-bold text-white">Hookah+</span>
              </div>
              <p className="text-white/70">
                The future of hookah lounge management is here.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-white/70">
                <li><Link href="/demo" className="hover:text-white transition-colors">Demo</Link></li>
                <li><Link href="/signup" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Features</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-white/70">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-white/70">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><a href="mailto:support@hookahplus.net" className="hover:text-white transition-colors">Contact Support</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-white/50">
            <p>&copy; 2024 Hookah+. All rights reserved. Built with ❤️ for the hookah community.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
