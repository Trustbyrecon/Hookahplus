import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-12">
          <div className="flex-1">
            <h1 className="text-5xl font-bold leading-tight">
              The lounge operator stack <br />
              built for <span className="text-green-400">revenue & reliability.</span>
            </h1>
            <p className="mt-6 text-lg text-gray-300 max-w-xl">
              HookahPlus powers QR preorders, flavor mix tracking, session-based POS, 
              loyalty, and Reflex-driven reliability so your team serves faster — 
              with fewer mistakes.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="#preorder"
                className="px-6 py-3 bg-green-500 text-black font-semibold rounded-lg hover:bg-green-400"
              >
                Start preorders
              </Link>
              <Link
                href="#pos"
                className="px-6 py-3 border border-gray-500 rounded-lg hover:border-white"
              >
                Join POS waitlist
              </Link>
              <Link
                href="#features"
                className="px-6 py-3 text-sm text-gray-400 hover:text-white"
              >
                See features →
              </Link>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              <span>Reflex reliability layer</span> • <span>Fast QR flow</span> • <span>Stripe-ready</span>
            </div>
          </div>

          {/* Preview Card */}
          <div className="flex-1 bg-gray-900 rounded-xl p-6 shadow-lg">
            <div className="text-gray-400 text-sm mb-2">Session POS — VIP Booth</div>
            <div className="bg-black rounded-lg p-4 space-y-3 border border-gray-800">
              <div className="flex justify-between">
                <span>Flavor Mix</span>
                <span className="text-gray-500">Track & log</span>
              </div>
              <div className="flex justify-between">
                <span>QR Preorder</span>
                <span className="text-gray-500">POS linked</span>
              </div>
              <div className="flex justify-between">
                <span>Stripe</span>
                <span className="text-gray-500">Payment ready</span>
              </div>
            </div>
            <div className="mt-3 text-green-400 text-sm">Reflex: <strong>+0.1s after repair</strong></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-semibold">Everything you need to run modern lounges</h2>
        <p className="text-gray-400 mt-2">
          From QR preorders to POS adapters, HookahPlus streamlines front-of-house while Reflex 
          protects reliability behind the scenes.
        </p>

        <div className="mt-8 grid md:grid-cols-3 gap-6">
          {[
            ['QR Preorders', 'Guests order from their phone; orders flow to POS with Stripe payment.'],
            ['Stripe Checkout', 'Basic session + add-ons, deposits, promos, and retries.'],
            ['Flavor Mix History', 'Save favorite mixes & re-order in one tap, recommend best sales.'],
            ['Session Assistant', 'Smart upsells and reminders prevent tab stalls and coal delays.'],
            ['Live Metrics', 'Track EOL, Sell Rate Ratio, and MTTR AI for every table.'],
            ['Reflex Reliability', 'Watchdog tracks silent failures; GhostLog traces every action.'],
          ].map(([title, desc]) => (
            <div key={title} className="bg-gray-900 p-6 rounded-xl border border-gray-800">
              <h3 className="font-medium text-lg mb-2">{title}</h3>
              <p className="text-gray-400 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Demo Section */}
      <section className="max-w-6xl mx-auto px-6 py-16 flex flex-col md:flex-row gap-12 items-center">
        <div className="flex-1">
          <h2 className="text-3xl font-semibold mb-4">See it in action</h2>
          <p className="text-gray-400 mb-6">
            This short walkthrough shows QR preorder → Stripe payment → POS sync → Reflex repair in under a minute.
          </p>
          <div className="flex gap-4">
            <Link
              href="#preorder"
              className="px-6 py-3 bg-green-500 text-black font-semibold rounded-lg hover:bg-green-400"
            >
              Try preorder
            </Link>
            <Link
              href="#pos"
              className="px-6 py-3 border border-gray-500 rounded-lg hover:border-white"
            >
              Join POS waitlist
            </Link>
          </div>
        </div>
        <div className="flex-1 bg-gray-900 rounded-xl border border-gray-800 h-60 flex items-center justify-center text-gray-600">
          Teaser video placeholder (15–30s)
        </div>
      </section>
    </main>
  );
}