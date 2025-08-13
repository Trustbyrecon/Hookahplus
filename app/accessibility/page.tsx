// index.tsx
import React from 'react';

export default function Home() {
  return (
    <main className="bg-black text-white min-h-screen font-sans overflow-x-hidden">
      {/* Navbar */}
      <header className="flex justify-between items-center p-6">
        <h1 className="text-2xl font-bold text-green-400">HookahPlus</h1>
        <nav className="space-x-6 text-sm">
          <a href="#features" className="hover:underline">Features</a>
          <a href="#pricing" className="hover:underline">Pricing</a>
          <a href="#demo" className="hover:underline">Demo</a>
          <button className="bg-white text-black rounded px-4 py-1 font-semibold">
            POS Waitlist
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="text-center py-20 px-4 bg-gradient-to-b from-black to-gray-900">
        <h2 className="text-5xl font-bold leading-tight mb-6">
          The lounge operator stack <br />
          <span className="text-green-400">built for revenue & reliability.</span>
        </h2>
        <p className="max-w-2xl mx-auto text-gray-400 mb-8">
          HookahPlus powers QR preorders, flavor mix tracking, session-based POS, loyalty, and Reflex-driven reliability so your team serves faster—with fewer mistakes.
        </p>
        <div className="flex justify-center space-x-4">
          <button className="bg-green-500 px-6 py-2 rounded font-bold">Start preorders</button>
          <button className="border border-white px-6 py-2 rounded font-bold">Join POS waitlist</button>
        </div>
        <div className="mt-6 text-sm text-gray-500">
          ✅ Reflex reliability layer &nbsp;&nbsp;•&nbsp;&nbsp; 🚀 Fast go-live &nbsp;&nbsp;•&nbsp;&nbsp; 🧾 Stripe-ready
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16 px-4 max-w-5xl mx-auto">
        <h3 className="text-2xl font-bold mb-10 text-center">Everything you need to run modern lounges</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {[
            { title: "QR Preorders", desc: "Guests order from their phones; orders flow to POS with Stripe metadata." },
            { title: "Stripe Checkout", desc: "Base session + add-ons, deposits, promos, and referrals." },
            { title: "Flavor Mix History", desc: "Save custom mixes, re-order in one tap, recommend best sellers." },
            { title: "Session Assistant", desc: "Smart upsells and reminders prevent idle tables and cold coals." },
            { title: "Live Metrics", desc: "Track EOR, Self-Heal Rate, and MTTR AI for every session step." },
            { title: "Reflex Reliability", desc: "Walkthrough halts silent failures; GhostLog traces every action." },
          ].map(({ title, desc }) => (
            <div key={title} className="bg-zinc-900 p-6 rounded-xl shadow hover:shadow-lg">
              <h4 className="text-green-400 font-semibold text-lg mb-2">{title}</h4>
              <p className="text-sm text-gray-300">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Demo Teaser */}
      <section id="demo" className="text-center py-20 bg-black">
        <h3 className="text-2xl font-bold mb-4">See it in action</h3>
        <p className="text-gray-400 mb-8">
          This short walkthrough shows QR preorder → Stripe payment → POS sync → Reflex repair in under a minute.
        </p>
        <div className="mb-6">
          <button className="bg-green-500 px-6 py-2 rounded font-bold">Try preorder</button>
          <button className="ml-4 border border-white px-6 py-2 rounded font-bold">Join POS waitlist</button>
        </div>
        <div className="w-full max-w-xl mx-auto bg-zinc-800 rounded-xl h-64 flex items-center justify-center text-gray-500">
          Teaser video placeholder (15–30s)
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-500 border-t border-zinc-700">
        © 2025 HookahPlus &nbsp;|&nbsp; Terms · Privacy · Status
      </footer>
    </main>
  );
}
