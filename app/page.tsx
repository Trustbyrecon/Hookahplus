"use client";

import Image from "next/image";
import Link from "next/link";
import { Hero } from "../components/Hero";
import { Section } from "../components/Section";
import { ReflexPromptModal, TrustArcDisplay } from "../components/ReflexOverlay";
import ReflexScoreAudit from "../components/ReflexScoreAudit";

const features = [
  {
    title: "QR Preorders",
    desc: "Guests scan a table code and pay before coals drop.",
  },
  {
    title: "Session Assistant",
    desc: "Timed prompts keep service tight and coals fresh.",
  },
  {
    title: "Live Metrics",
    desc: "Dashboards track heat, pulls and revenue in real time.",
  },
];

const tiers = [
  {
    name: "Starter",
    price: "$29/mo",
    bullets: ["1 venue · unlimited sessions", "Basic analytics", "Email support"],
  },
  {
    name: "Growth",
    price: "$79/mo",
    bullets: ["Up to 3 venues", "Flavor flow & Reflex", "Priority support"],
  },
  {
    name: "Pro",
    price: "$149/mo",
    bullets: ["Unlimited venues", "Advanced analytics", "On-call concierge"],
  },
];

export default function Home() {
  return (
    <>
      <TrustArcDisplay score={9.2} />
      <Hero
        title="The lounge operator stack built for revenue & reliability"
        subtitle="Modern tools that keep sessions flowing, payments cleared and guests coming back."
        primary={{ href: "/preorder", label: "Preorder" }}
        secondary={{ href: "/waitlist", label: "Join POS Waitlist" }}
      >
        <div className="rounded-xl overflow-hidden border border-goldLumen/10 shadow-lg">
          <Image
            src="/assets/qr.png"
            alt="Product preview"
            width={800}
            height={600}
            priority
          />
        </div>
      </Hero>

      <Section title="Why lounges choose Hookah+" kicker="Features">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((f) => (
            <Feature key={f.title} title={f.title} desc={f.desc} />
          ))}
        </div>
      </Section>

      <Section title="Simple, transparent pricing" kicker="Pricing">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tiers.map((t) => (
            <div key={t.name} className="card p-5">
              <div className="text-lg font-semibold">{t.name}</div>
              <div className="mt-2 text-3xl font-bold">{t.price}</div>
              <ul className="mt-3 space-y-1 text-sm text-goldLumen/80">
                {t.bullets.map((b, i) => (
                  <li key={i}>• {b}</li>
                ))}
              </ul>
              <Link
                href="/preorder"
                className="mt-4 inline-block btn bg-accent text-charcoal font-semibold"
              >
                Get started
              </Link>
            </div>
          ))}
        </div>
        <p className="mt-6 text-goldLumen/70 text-sm">
          Prices are launch promos. POS bundle and add‑ons available.
        </p>
      </Section>

      <Section title="Onboard in minutes" kicker="Reflex Stack">
        <div className="space-y-4">
          <p className="text-goldLumen/80">
            Engage the Reflex stack from day one. Trigger loyalty prompts, monitor
            trust arcs, and track memory pulses as your lounge grows.
          </p>
          <ReflexPromptModal />
          <div className="bg-deepMoss text-goldLumen px-4 py-2 rounded">
            <ReflexScoreAudit />
          </div>
        </div>
      </Section>
    </>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="card p-6">
      <h3 className="mb-2 text-lg font-semibold text-accent">{title}</h3>
      <p className="text-sm text-goldLumen/80">{desc}</p>
    </div>
  );
}
