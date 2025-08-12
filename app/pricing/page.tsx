 feat/moodbook-all-in-one
// app/pricing/page.tsx
import { Section } from "@/components/Section";

const tiers = [
  { name: "Starter", price: "$29/mo", bullets: ["1 venue · unlimited sessions", "Basic analytics", "Email support"] },
  { name: "Growth", price: "$79/mo", bullets: ["Up to 3 venues", "Flavor flow & Reflex", "Priority support"] },
  { name: "Pro", price: "$149/mo", bullets: ["Unlimited venues", "Advanced analytics", "On-call concierge"] },
];

export default function Pricing(){
  return (
    <>
      <Section title="Simple, transparent pricing" kicker="Pricing">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tiers.map(t => (
            <div key={t.name} className="card p-5">
              <div className="text-lg font-semibold">{t.name}</div>
              <div className="mt-2 text-3xl font-bold">{t.price}</div>
              <ul className="mt-3 space-y-1 text-sm text-white/80">
                {t.bullets.map((b,i)=>(<li key={i}>• {b}</li>))}
              </ul>
              <a href="/preorder" className="mt-4 inline-block btn bg-accent text-black font-semibold">Get started</a>
            </div>
          ))}
        </div>
        <p className="mt-6 text-white/70 text-sm">Prices are launch promos. POS bundle and add‑ons available.</p>
      </Section>
    </>

export default function Page() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl mb-4">Hookah+ Pricing</h1>
      <p className="opacity-80 mb-6">Placeholder for /pricing (L+4 scaffolding). Replace with real content.</p>

    </main>
 main
  );
}
