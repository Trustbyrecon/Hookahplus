"use client";

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <section className="container py-20">
      <div className="text-center">
        <h1 className="text-4xl md:text-6xl font-semibold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
          The lounge operator stack built for revenue & reliability
        </h1>
        <p className="mt-6 text-white/70 max-w-2xl mx-auto">
          Modern tools that keep sessions flowing, payments cleared and guests coming
          back.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/preorder"
            className="btn bg-accent text-black font-semibold hover:brightness-90"
          >
            Preorder
          </Link>
          <Link
            href="/waitlist"
            className="btn border border-white/20 hover:border-accent"
          >
            Join POS Waitlist
          </Link>
        </div>
      </div>

      <div className="mt-16 grid gap-6 md:grid-cols-3">
        <Feature
          title="QR Preorders"
          desc="Guests scan a table code and pay before coals drop."
        />
        <Feature
          title="Session Assistant"
          desc="Timed prompts keep service tight and coals fresh."
        />
        <Feature
          title="Live Metrics"
          desc="Dashboards track heat, pulls and revenue in real time."
        />
      </div>

      <div className="mt-20 grid items-center gap-10 md:grid-cols-2">
        <div className="rounded-xl overflow-hidden border border-white/10 shadow-lg">
          <Image
            src="/assets/qr.png"
            alt="Product preview"
            width={800}
            height={600}
            priority
          />
        </div>
        <div className="aspect-video rounded-xl bg-white/5 flex items-center justify-center text-white/60">
          Teaser video coming soon
        </div>
      </div>
    </section>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="card p-6">
      <h3 className="mb-2 text-lg font-semibold text-accent">{title}</h3>
      <p className="text-sm text-white/70">{desc}</p>
    </div>
  );
}

