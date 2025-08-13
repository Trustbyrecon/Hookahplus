import Image from 'next/image';

export default function Home() {
  return (
    <main className="bg-charcoal text-goldLumen min-h-screen font-sans">
      <section className="max-w-screen-xl mx-auto py-20 px-6 space-y-16">
        <header className="text-center space-y-4">
          <h1 className="text-5xl font-display tracking-tight">The lounge operator stack</h1>
          <p className="text-xl text-muted">Built for revenue & reliability</p>
          <div className="flex justify-center gap-4">
            <button className="bg-ember px-6 py-2 rounded-xl text-white">Start Preorders</button>
            <button className="border border-ember px-6 py-2 rounded-xl text-ember">Join POS Waitlist</button>
          </div>
          <Image
            src="/og-default.png"
            alt="HookahPlus dashboard preview"
            width={1200}
            height={630}
            className="mx-auto rounded-2xl shadow-lg"
          />
        </header>

        <section>
          <h2 className="text-3xl font-semibold mb-8">Everything you need to run modern lounges</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard title="QR Preorders" desc="Guests scan table code and pay before coals drop." />
            <FeatureCard title="Session Assistant" desc="Smart timers & prompts to keep coals tight." />
            <FeatureCard title="Live Metrics" desc="Track heat, pulls & revenue live." />
            {/* add more cards */}
          </div>
        </section>

        <section className="pt-16">
          <h2 className="text-3xl font-semibold mb-6">Simple, transparent pricing</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <PricingTier title="Starter" price="$29/mo" features={['1 venue', 'Unlimited sessions', 'Email support']} />
            <PricingTier title="Growth" price="$79/mo" features={['3 venues', 'Flavor flow & Reflex', 'Priority support']} />
            <PricingTier title="Pro" price="$149/mo" features={['Unlimited venues', 'On-call concierge']} />
          </div>
        </section>

        <footer className="pt-10 text-sm text-muted text-center">
          &copy; 2025 HookahPlus. Built with ❤️
        </footer>
      </section>
    </main>
  );
}

function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="bg-panel rounded-2xl p-6 shadow-soft hover:shadow-xl transition">
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-muted">{desc}</p>
    </div>
  );
}

function PricingTier({ title, price, features }: { title: string; price: string; features: string[] }) {
  return (
    <div className="bg-deepMoss rounded-2xl p-6 text-white space-y-2">
      <h3 className="text-2xl font-bold">{title}</h3>
      <p className="text-lg">{price}</p>
      <ul className="list-disc pl-5">
        {features.map(f => <li key={f}>{f}</li>)}
      </ul>
    </div>
  );
}
