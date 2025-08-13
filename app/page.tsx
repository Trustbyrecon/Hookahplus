export default function Home() {
  const features = [
    { title: "QR Preorders", desc: "Guests order from their phones; orders flow to POS with Stripe sync." },
    { title: "Stripe Checkout", desc: "Take session deposits, promos, and full checkouts with Stripe." },
    { title: "Flavor Mix History", desc: "Save mixes, auto-reorder ingredients, and recommend best-sellers." },
    { title: "Session Assistant", desc: "Track shisha, coal, and prevent early tab changes." },
    { title: "Live Metrics", desc: "Track ROI, Sell Rate, MTTR and more." },
    { title: "Refire Reliability", desc: "Instant fault tracking and recovery for every session." },
  ];

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <header className="mb-10">
          <h1 className="text-5xl font-bold leading-tight">
            The lounge operator stack <br />
            <span className="text-emerald-400">built for revenue & reliability.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-400">
            HookahPlus powers QR preorders, flavor mix tracking, session-based POS, loyalty, and Recon Refire reliability so your team serves faster—with fewer mistakes.
          </p>
          <div className="mt-6 flex gap-4">
            <a href="#start" className="bg-emerald-500 px-5 py-3 rounded-lg font-semibold hover:bg-emerald-400">Start preorders</a>
            <a href="#waitlist" className="border border-white px-5 py-3 rounded-lg font-semibold hover:bg-white hover:text-black">Join POS waitlist</a>
          </div>
        </header>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-6">
        {features.map((f, idx) => (
          <div key={idx} className="bg-gray-900 p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-2">{f.title}</h3>
            <p className="text-gray-400">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Video Placeholder */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-gray-800 rounded-xl p-10 flex flex-col items-center justify-center">
          <p className="text-gray-400 mb-4">Teaser video placeholder (15–30s)</p>
          <button className="bg-emerald-500 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-400">
            Try preorder demo
          </button>
        </div>
      </section>
    </main>
  );
}
