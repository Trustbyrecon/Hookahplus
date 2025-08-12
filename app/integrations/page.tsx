 feat/moodbook-all-in-one
// app/integrations/page.tsx
import { Section } from "@/components/Section";
import { LogoWall } from "@/components/LogoWall";

export default function Integrations(){
  return (
    <>
      <Section title="Integrations" kicker="Connect your stack">
        <p className="text-white/80">Payments, hosting, analytics and messaging out of the box.</p>
        <div className="mt-6">
          <LogoWall logos={[
            {src:"/logos/stripe.svg", alt:"Stripe"},
            {src:"/logos/netlify.svg", alt:"Netlify"},
            {src:"/logos/twilio.svg", alt:"Twilio"},
            {src:"/logos/plausible.svg", alt:"Plausible"},
          ]}/>
        </div>
      </Section>
    </>

export default function Page() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl mb-4">Hookah+ Integrations</h1>
      <p className="opacity-80 mb-6">Placeholder for /integrations (L+4 scaffolding). Replace with real content.</p>
      <ul className="list-disc pl-5"><li><a className="underline" href="/integrations/clover">Clover</a></li><li><a className="underline" href="/integrations/toast">Toast</a></li></ul>
    </main>
 main
  );
}
