// This is for Next.js — Page or App Router
import React from "react";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white font-sans px-6 py-12">
      <header className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-white">
            HookahPlus
          </h1>
          <div className="space-x-4">
            <a href="#features" className="text-sm hover:underline">Features</a>
            <a href="#pricing" className="text-sm hover:underline">Pricing</a>
            <a href="#demo" className="text-sm hover:underline">Demo</a>
            <button className="bg-white text-black px-4 py-2 rounded text-sm font-semibold">
              POS Waitlist
            </button>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-5xl font-extrabold leading-tight">
            The lounge operator stack <br />
            <span className="text-teal-400">built for revenue & reliability.</span>
          </h2>
          <p className="mt-6 text-lg text-gray-300 max-w-2xl">
            HookahPlus powers QR preorders, flavor mix tracking, session-based POS, loyalty, and Reflex-driven reliability so your team senses faster—with fewer mistakes.
          </p>
          <div className="mt-8 flex gap-4">
            <button className="bg-teal-400 text-black px-5 py-2 rounded font-bold">Start preorders</button>
            <button className="bg-white text-black px-5 py-2 rounded font-bold">Join POS waitlist</button>
          </div>
          <p className="text-xs text-gray-400 mt-3">✓ Reflex reliability layer &nbsp; ✓ Fast go-live &nbsp; ✓ Stripe-ready</p>
        </div>
      </header>

      <section id="features" className="max-w-6xl mx-auto mt-24">
        <h3 className="text-2xl font-semibold mb-6">Everything you need to run modern lounges</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: "QR Preorders", desc: "Guests order from their phones; orders flow to POS with Stripe metadata." },
            { title: "Stripe Checkout", desc: "Base session + add-ons, deposits, promos, and referrals." },
            { title: "Flavor Mix History", desc: "Save custom mixes, re-order in one tap, recommend best sellers." },
            { title: "Session Assistant", desc: "Smart upsells and reminders prevent idle tables and cold coals." },
            { title: "Live Metrics", desc: "Track EOR, Self-Heal Rate, and MTTR AI for every session step." },
            { title: "Reflex Reliability", desc: "ReflexLog halts silent failures; GhostLog traces every action." }
          ].map(({ title, desc }) => (
            <div key={title} className="bg-zinc-900 p-6 rounded-lg border border-zinc-700">
              <h4 className="font-bold text-lg text-white mb-2">{title}</h4>
              <p className="text-sm text-gray-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="demo" className="max-w-6xl mx-auto mt-24">
        <h3 className="text-2xl font-semibold mb-4">See it in action</h3>
        <p className="text-gray-300 mb-6">This short walkthrough shows QR preorder → Stripe payment → POS sync → Reflex repair in under a minute.</p>
        <div className="bg-zinc-800 h-64 rounded-lg flex items-center justify-center text-gray-500 border border-zinc-600">
          Teaser video placeholder (15–30s)
        </div>
        <div className="mt-6 flex gap-4">
          <button className="bg-teal-400 text-black px-5 py-2 rounded font-bold">Try preorder</button>
          <button className="bg-white text-black px-5 py-2 rounded font-bold">Join POS waitlist</button>
        </div>
      </section>

      <footer className="max-w-6xl mx-auto mt-24 text-xs text-gray-500 border-t border-zinc-700 pt-6">
        © {new Date().getFullYear()} HookahPlus. All rights reserved.
      </footer>
    </main>
  );
}
