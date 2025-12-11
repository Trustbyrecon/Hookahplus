'use client';

import React from 'react';
import Image from 'next/image';
import { 
  Clock, 
  Sparkles, 
  Users, 
  BarChart3, 
  Zap, 
  Target,
  Heart,
  TrendingUp,
  Brain,
  Shield,
  ArrowRight
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Hero Section */}
      <div className="border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                About Hookah+
              </h1>
              <p className="text-xl md:text-2xl text-zinc-300 leading-relaxed">
                Hookah+ was born in the corner of a busy lounge, after too many nights watching staff juggle timers, paper tickets, and "who ordered what?" from memory.
              </p>
            </div>
            <div className="relative h-64 md:h-96 rounded-lg overflow-hidden border border-zinc-700">
              <Image
                src="/images/about/lounge-community.jpg"
                alt="Hookah+ community gathering at an outdoor lounge with string lights"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Opening Narrative */}
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="prose prose-invert prose-lg max-w-none">
          <p className="text-lg md:text-xl text-zinc-300 leading-relaxed mb-6">
            You know that feeling when the lounge is packed, coals are flying, and the staff is doing mental gymnastics just to keep up. Tables run over time. Flavors get misremembered. Receipts don't match what actually happened at the hookah. The vibe is great, but the system is chaos.
          </p>
          <p className="text-lg md:text-xl text-zinc-300 leading-relaxed mb-6">
            Hookah+ is the moment we decided to fix that.
          </p>
          <p className="text-lg md:text-xl text-zinc-300 leading-relaxed mb-8">
            We didn't want "just another POS." We wanted a session brain for your lounge. Something that understands:
          </p>
          <ul className="space-y-4 mb-12 text-lg text-zinc-300">
            <li className="flex items-start">
              <span className="text-teal-400 mr-3 mt-1">•</span>
              <span>A hookah session isn't a burger order</span>
            </li>
            <li className="flex items-start">
              <span className="text-teal-400 mr-3 mt-1">•</span>
              <span>Time matters</span>
            </li>
            <li className="flex items-start">
              <span className="text-teal-400 mr-3 mt-1">•</span>
              <span>Flavor memories matter</span>
            </li>
            <li className="flex items-start">
              <span className="text-teal-400 mr-3 mt-1">•</span>
              <span>Your staff's sanity matters</span>
            </li>
          </ul>
          <div className="bg-teal-500/10 border border-teal-500/30 rounded-lg p-6 mb-12">
            <p className="text-xl md:text-2xl font-semibold text-white text-center">
              So we built H+ around one simple idea:
            </p>
            <p className="text-2xl md:text-3xl font-bold text-teal-400 text-center mt-4">
              If you can see every session clearly, you can run your lounge calmly.
            </p>
          </div>
        </div>
      </div>

      {/* Where Hookah+ Started */}
      <div className="border-t border-zinc-800 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 flex items-center gap-3">
            <Target className="w-8 h-8 text-teal-400" />
            Where Hookah+ Started
          </h2>
          <div className="grid md:grid-cols-2 gap-8 items-start mb-8">
            <div className="prose prose-invert prose-lg max-w-none">
              <p className="text-lg text-zinc-300 leading-relaxed mb-6">
                Hookah+ started with a question:
              </p>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6 mb-6">
                <p className="text-xl font-semibold text-white italic">
                  "Why are hookah lounges still forcing staff to hack together systems that were never built for sessions?"
                </p>
              </div>
            </div>
            <div className="relative h-96 md:h-[32rem] rounded-lg overflow-hidden border border-zinc-700">
              <Image
                src="/images/about/trade-show-panel.png"
                alt="Hookah+ team panel discussion at trade show"
                fill
                className="object-cover object-center"
              />
            </div>
          </div>
          <div className="prose prose-invert prose-lg max-w-none">
            <p className="text-lg text-zinc-300 leading-relaxed mb-6">
              We saw owners trying to force general restaurant POS tools to handle:
            </p>
            <ul className="space-y-3 mb-8 text-lg text-zinc-300">
              <li className="flex items-start">
                <Clock className="w-5 h-5 text-teal-400 mr-3 mt-1 flex-shrink-0" />
                <span>Timed sessions that need renewals and checks</span>
              </li>
              <li className="flex items-start">
                <Sparkles className="w-5 h-5 text-teal-400 mr-3 mt-1 flex-shrink-0" />
                <span>Multi-flavor mixes with different pricing</span>
              </li>
              <li className="flex items-start">
                <Zap className="w-5 h-5 text-teal-400 mr-3 mt-1 flex-shrink-0" />
                <span>Add-ons, re-packs, and coal changes</span>
              </li>
              <li className="flex items-start">
                <Users className="w-5 h-5 text-teal-400 mr-3 mt-1 flex-shrink-0" />
                <span>VIP sections and custom deals</span>
              </li>
            </ul>
            <p className="text-lg text-zinc-300 leading-relaxed mb-6">
              So we flipped the model.
            </p>
            <p className="text-lg text-zinc-300 leading-relaxed mb-6">
              Instead of bending your lounge to fit a POS, we designed Hookah+ to fit the reality of how hookah actually works:
            </p>
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-4">
                <p className="text-zinc-300">Sessions start, pause, renew, and end</p>
              </div>
              <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-4">
                <p className="text-zinc-300">Guests mix 2, 3, sometimes 4 flavors at once</p>
              </div>
              <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-4">
                <p className="text-zinc-300">Staff needs to see everything at a glance</p>
              </div>
              <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-4">
                <p className="text-zinc-300">Owners need clean numbers, not guesswork</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What Hookah+ Actually Does */}
      <div className="border-t border-zinc-800 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 flex items-center gap-3">
            <Zap className="w-8 h-8 text-teal-400" />
            What Hookah+ Actually Does
          </h2>
          <p className="text-lg text-zinc-300 leading-relaxed mb-8">
            Under the hood, Hookah+ is a session-focused OS for hookah lounges, layered on top of the tools you already use.
          </p>
          
          {/* Technology Image */}
          <div className="relative w-full h-64 md:h-96 mb-8 rounded-lg overflow-hidden border border-zinc-700">
            <Image
              src="/images/about/dashboard-tech.jpg"
              alt="Hookah+ dashboard technology with holographic interfaces"
              fill
              className="object-cover"
            />
          </div>
          <div className="space-y-6">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <Clock className="w-6 h-6 text-teal-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Tracks active sessions, in real time</h3>
                  <p className="text-zinc-300">
                    Every table, every section, every hookah — with session timers built in, not bolted on.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <Sparkles className="w-6 h-6 text-teal-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Understands flavor mixes</h3>
                  <p className="text-zinc-300">
                    Multiple flavors, premium add-ons, custom combinations, all tracked per session so your receipts and reporting stay accurate.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <BarChart3 className="w-6 h-6 text-teal-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Plays nicely with your POS</h3>
                  <p className="text-zinc-300">
                    Built to integrate with systems like Square, Clover, and Toast, so you don't have to reinvent your entire tech stack to get started.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <TrendingUp className="w-6 h-6 text-teal-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Captures lounge-friendly data</h3>
                  <p className="text-zinc-300">
                    Most popular flavors, peak hours, staff performance trends, and session patterns — the things that actually help you grow.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <Shield className="w-6 h-6 text-teal-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Preps you for modern payments</h3>
                  <p className="text-zinc-300">
                    QR-based flows, mobile-friendly links, and digital receipts that can include flavor breakdowns and session details.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <p className="text-lg text-zinc-300 leading-relaxed mt-8 italic">
            All wrapped in a clean, dark-mode-ready dashboard made for lounge lighting, not office fluorescents.
          </p>
        </div>
      </div>

      {/* Behind the Screens */}
      <div className="border-t border-zinc-800 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 flex items-center gap-3">
                <Brain className="w-8 h-8 text-teal-400" />
                Behind the Screens: How We Think
              </h2>
            </div>
            <div className="relative h-64 md:h-80 rounded-lg overflow-hidden border border-zinc-700">
              <Image
                src="/images/about/team-member.jpg"
                alt="Hookah+ team member speaking at event"
                fill
                className="object-cover"
              />
            </div>
          </div>
          <p className="text-lg text-zinc-300 leading-relaxed mb-8">
            We care about the parts of your lounge that guests never see but always feel.
          </p>
          <p className="text-lg text-zinc-300 leading-relaxed mb-6">
            That means:
          </p>
          <ul className="space-y-4 mb-8 text-lg text-zinc-300">
            <li className="flex items-start">
              <Heart className="w-5 h-5 text-teal-400 mr-3 mt-1 flex-shrink-0" />
              <span>Reducing staff stress so the service feels relaxed, not rushed</span>
            </li>
            <li className="flex items-start">
              <Heart className="w-5 h-5 text-teal-400 mr-3 mt-1 flex-shrink-0" />
              <span>Making training easier, so new staff can learn faster</span>
            </li>
            <li className="flex items-start">
              <Heart className="w-5 h-5 text-teal-400 mr-3 mt-1 flex-shrink-0" />
              <span>Giving owners real numbers, not rough estimates</span>
            </li>
            <li className="flex items-start">
              <Heart className="w-5 h-5 text-teal-400 mr-3 mt-1 flex-shrink-0" />
              <span>Turning every session into a repeatable, trackable experience</span>
            </li>
          </ul>
          <div className="bg-teal-500/10 border border-teal-500/30 rounded-lg p-6">
            <p className="text-lg text-zinc-300 leading-relaxed mb-4">
              We design every screen with one question in mind:
            </p>
            <p className="text-xl font-semibold text-white italic text-center">
              "Would this make life easier for the person actually using it at 11:30 PM on a busy Saturday?"
            </p>
            <p className="text-lg text-zinc-300 leading-relaxed mt-4 text-center">
              If the answer is no, it doesn't ship.
            </p>
          </div>
        </div>
      </div>

      {/* For Owners, Staff, and Guests */}
      <div className="border-t border-zinc-800 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
            For Owners, Staff, and Guests
          </h2>
          
          {/* Lounge Scene Image */}
          <div className="relative w-full h-64 md:h-80 mb-8 rounded-lg overflow-hidden border border-zinc-700">
            <Image
              src="/images/about/lounge-staff.jpg"
              alt="Hookah+ staff member assisting guest in lounge setting"
              fill
              className="object-cover"
            />
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="w-6 h-6 text-teal-400" />
                <h3 className="text-xl font-semibold text-white">For owners</h3>
              </div>
              <p className="text-zinc-300">
                Hookah+ is clarity: You see what's running, what's overdue, what's earning, and what's costing you. You can finally answer, "What's actually happening in my lounge tonight?" with real data.
              </p>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-teal-400" />
                <h3 className="text-xl font-semibold text-white">For staff</h3>
              </div>
              <p className="text-zinc-300">
                Hookah+ is relief: No more sticky notes, half-remembered orders, or guessing who's past time. The system holds the details so they can hold the vibe.
              </p>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="w-6 h-6 text-teal-400" />
                <h3 className="text-xl font-semibold text-white">For guests</h3>
              </div>
              <p className="text-zinc-300">
                Hookah+ is invisible, but it changes everything: Smoother service, more consistent experiences, easier reorders, better recommendations based on what works in your lounge.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* What's Next for H+ */}
      <div className="border-t border-zinc-800 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 flex items-center gap-3">
            <ArrowRight className="w-8 h-8 text-teal-400" />
            What's Next for H+
          </h2>
          <p className="text-lg text-zinc-300 leading-relaxed mb-8">
            Hookah+ is not a one-off app. It's a growing ecosystem around the modern hookah lounge.
          </p>
          <p className="text-lg text-zinc-300 leading-relaxed mb-6">
            We're building toward:
          </p>
          <ul className="space-y-4 mb-8 text-lg text-zinc-300">
            <li className="flex items-start">
              <TrendingUp className="w-5 h-5 text-teal-400 mr-3 mt-1 flex-shrink-0" />
              <span>Deeper analytics on session flow and table performance</span>
            </li>
            <li className="flex items-start">
              <TrendingUp className="w-5 h-5 text-teal-400 mr-3 mt-1 flex-shrink-0" />
              <span>Smarter loyalty experiences based on what guests actually smoke</span>
            </li>
            <li className="flex items-start">
              <TrendingUp className="w-5 h-5 text-teal-400 mr-3 mt-1 flex-shrink-0" />
              <span>Smoother pre-order and QR experiences before guests even sit down</span>
            </li>
            <li className="flex items-start">
              <TrendingUp className="w-5 h-5 text-teal-400 mr-3 mt-1 flex-shrink-0" />
              <span>Richer insights that help you optimize layout, staffing, and pricing</span>
            </li>
          </ul>
          <div className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-500/30 rounded-lg p-8 text-center">
            <p className="text-lg text-zinc-300 leading-relaxed mb-4">
              We believe hookah lounges deserve tools built specifically for your culture, your rhythm, and your business model — not a restaurant clone with a hookah category tacked on.
            </p>
            <p className="text-2xl font-bold text-teal-400 mt-6">
              Hookah+ is us saying:
            </p>
            <p className="text-xl font-semibold text-white italic mt-4">
              "The hookah lounge is not an afterthought. It's a main stage. Let's give it tools that treat it that way."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

