"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    // Simulate video loading
    setTimeout(() => setIsVideoLoaded(true), 1000);
    // Trigger animations on mount
    setTimeout(() => setIsVisible(true), 100);

    // Add scroll listener for parallax effects
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white selection:bg-teal-400/30 overflow-hidden">
      {/* Animated background elements with parallax */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-float"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        ></div>
        <div 
          className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-float-delay-1"
          style={{ transform: `translateY(${scrollY * -0.05}px)` }}
        ></div>
        <div 
          className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-float-delay-2"
          style={{ transform: `translateY(${scrollY * 0.15}px)` }}
        ></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl supports-[backdrop-filter]:bg-zinc-950/80 border-b border-zinc-800/50">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 group">
            <div className="h-8 w-8 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 animate-pulse-glow group-hover:animate-glow transition-all duration-300"></div>
            <span className="font-bold tracking-tight text-xl gradient-text">HookahPlus</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-zinc-300">
            <a href="#features" className="hover:text-teal-400 transition-all duration-300 hover:scale-105">Features</a>
            <a href="#pricing" className="hover:text-teal-400 transition-all duration-300 hover:scale-105">Pricing</a>
            <a href="#demo" className="hover:text-teal-400 transition-all duration-300 hover:scale-105">Demo</a>
            <Link
              href="/owner-cta?form=preorder"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-700/50 px-4 py-2 hover:border-teal-500/70 hover:text-teal-400 hover:bg-teal-500/10 transition-all duration-300 backdrop-blur-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063A2 2 0 0 0 14.063 15.5l-1.582 6.135a.5.5 0 0 1-.963 0z"></path><path d="M20 3v4"></path><path d="M22 5h-4"></path><path d="M4 17v2"></path><path d="M5 18H3"></path></svg>
              Join Waitlist
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center relative z-10">
            {/* Main heading with enhanced styling */}
            <div className={`mb-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h1 className="text-6xl md:text-8xl font-black mb-6 leading-tight">
                <span className="gradient-text">HOOKAH</span>
                <span className="text-white">+</span>
              </h1>
            </div>
            
            {/* Subtitle with staggered animation */}
            <div className={`mb-8 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h2 className="text-3xl md:text-4xl text-zinc-200 mb-6 font-light">
                Future of Lounge Sessions with{' '}
                <span className="gradient-text-blue">AI-Powered</span> Personalization
              </h2>
            </div>
            
            {/* Description with staggered animation */}
            <div className={`mb-16 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <p className="text-xl text-zinc-400 max-w-4xl mx-auto leading-relaxed">
                Transform your hookah lounge with intelligent session management, 
                personalized customer experiences, and seamless payment processing.
                <span className="block mt-2 text-teal-400 font-medium">Powered by cutting-edge AI technology.</span>
              </p>
            </div>
            
            {/* Primary CTA with enhanced styling */}
            <div className={`flex flex-col sm:flex-row gap-6 justify-center mb-24 transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <Link
                href="/owner-cta?form=preorder"
                className="btn-primary group"
              >
                <span className="flex items-center gap-3">
                  🚀 Start Preorders
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
              <Link
                href="/demo-video"
                className="btn-secondary group"
              >
                <span className="flex items-center gap-3">
                  🎯 See Demo
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
              </Link>
            </div>

            {/* Trust Indicators with enhanced cards */}
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12 transition-all duration-1000 delay-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="glass rounded-3xl p-8 text-center card-hover group">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🤖</div>
                <h3 className="text-xl font-bold text-teal-300 mb-3 group-hover:text-teal-200 transition-colors">AI-Powered</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">Intelligent flavor recommendations and customer insights powered by machine learning</p>
              </div>
              <div className="glass rounded-3xl p-8 text-center card-hover group">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">💳</div>
                <h3 className="text-xl font-bold text-teal-300 mb-3 group-hover:text-teal-200 transition-colors">Secure Payments</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">Stripe integration with real-time transaction processing and fraud protection</p>
              </div>
              <div className="glass rounded-3xl p-8 text-center card-hover group">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">📱</div>
                <h3 className="text-xl font-bold text-teal-300 mb-3 group-hover:text-teal-200 transition-colors">QR Experience</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">Seamless customer journey from scan to session with mobile-optimized interface</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-900/50 via-zinc-800/30 to-zinc-900/50"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "500+", label: "Active Sessions", icon: "🔥" },
              { number: "98%", label: "Customer Satisfaction", icon: "⭐" },
              { number: "3x", label: "Revenue Increase", icon: "📈" },
              { number: "24/7", label: "AI Support", icon: "🤖" }
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="glass rounded-2xl p-6 card-hover">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                    {stat.icon}
                  </div>
                  <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                    {stat.number}
                  </div>
                  <div className="text-zinc-400 text-sm font-medium">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Preview with enhanced styling */}
      <section id="features" className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-900/30 to-zinc-900/80"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-24">
            Why Lounge Owners Choose{' '}
            <span className="gradient-text">Hookah+</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "🎯",
                title: "Customer Personalization",
                description: "AI learns preferences and suggests perfect flavor combinations for returning customers.",
                color: "from-pink-500 to-rose-500"
              },
              {
                icon: "📊",
                title: "Real-Time Analytics",
                description: "Monitor session performance, popular flavors, and customer behavior in real-time.",
                color: "from-blue-500 to-indigo-500"
              },
              {
                icon: "💰",
                title: "Revenue Optimization",
                description: "Increase average order value with intelligent upselling and flavor recommendations.",
                color: "from-green-500 to-emerald-500"
              },
              {
                icon: "🔒",
                title: "Secure Transactions",
                description: "Enterprise-grade security with Stripe integration and fraud protection.",
                color: "from-purple-500 to-violet-500"
              },
              {
                icon: "📱",
                title: "Mobile-First Design",
                description: "Optimized for mobile devices with intuitive touch interfaces and responsive design.",
                color: "from-orange-500 to-red-500"
              },
              {
                icon: "🚀",
                title: "Quick Setup",
                description: "Get started in minutes with our plug-and-play QR system and intuitive dashboard.",
                color: "from-teal-500 to-cyan-500"
              }
            ].map((feature, index) => (
              <div key={index} className="group">
                <div className={`bg-gradient-to-br ${feature.color} p-0.5 rounded-3xl`}>
                  <div className="bg-zinc-900/90 backdrop-blur-sm rounded-3xl p-8 h-full card-hover">
                    <div className={`text-4xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-zinc-300 transition-all duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors duration-300">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/80 to-zinc-800/50"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-24">
            What Our{' '}
            <span className="gradient-text">Customers</span> Say
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Ahmed Hassan",
                role: "Owner, Oasis Lounge",
                content: "Hookah+ transformed our business. The AI recommendations increased our average order value by 40% in just 3 months.",
                avatar: "👨‍💼",
                rating: 5
              },
              {
                name: "Sarah Chen",
                role: "Manager, Cloud Nine",
                content: "The QR system is incredibly intuitive. Our customers love the seamless experience and we love the real-time analytics.",
                avatar: "👩‍💼",
                rating: 5
              },
              {
                name: "Marcus Rodriguez",
                role: "Founder, Velvet Room",
                content: "Setup was incredibly easy. We were processing orders within an hour of installation. Game changer for our lounge.",
                avatar: "👨‍💻",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="group">
                <div className="glass rounded-3xl p-8 h-full card-hover">
                  <div className="flex items-center mb-6">
                    <div className="text-4xl mr-4 group-hover:scale-110 transition-transform duration-300">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">{testimonial.name}</h4>
                      <p className="text-zinc-400 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                  
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  
                  <p className="text-zinc-300 leading-relaxed italic">
                    "{testimonial.content}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section with enhanced design */}
      <section id="demo" className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-900/20 via-blue-900/20 to-purple-900/20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.1),transparent_50%)]"></div>
        <div className="max-w-5xl mx-auto text-center px-4 relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Ready to Transform Your{' '}
            <span className="gradient-text">Lounge?</span>
          </h2>
          <p className="text-xl text-zinc-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join the future of hookah lounge management with AI-powered personalization and cutting-edge technology
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/demo-video"
              className="btn-secondary group"
            >
              <span className="flex items-center gap-3">
                🎯 Experience the Demo
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </Link>
            <Link
              href="/owner-cta?form=preorder"
              className="btn-primary group"
            >
              <span className="flex items-center gap-3">
                🚀 Start Preorders
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="border-t border-zinc-800/50 py-12 text-sm text-zinc-400 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent"></div>
        <div className="mx-auto max-w-7xl px-4 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-3 group">
            <div className="h-7 w-7 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 group-hover:animate-glow transition-all duration-300"></div>
            <span className="font-bold text-lg gradient-text">HookahPlus</span>
          </div>
          <div className="flex gap-8">
            <a href="#features" className="hover:text-teal-400 transition-colors duration-300 hover:scale-105">Features</a>
            <a href="#demo" className="hover:text-teal-400 transition-colors duration-300 hover:scale-105">Demo</a>
            <Link href="/owner-cta?form=preorder" className="hover:text-teal-400 transition-colors duration-300 hover:scale-105">Join Waitlist</Link>
          </div>
          <div className="text-zinc-500">© {new Date().getFullYear()} Trust by Recon</div>
        </div>
      </footer>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <Link
          href="/owner-cta?form=preorder"
          className="group bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white p-4 rounded-full shadow-2xl hover:shadow-teal-500/25 transition-all duration-300 transform hover:scale-110 animate-bounce-slow"
        >
          <svg className="w-6 h-6 group-hover:animate-wiggle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </Link>
      </div>

      {/* Scroll to top button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-8 left-8 z-50 bg-zinc-800/80 hover:bg-zinc-700/80 text-white p-3 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 transform hover:scale-110 ${
          scrollY > 500 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </main>
  );
}
