// app/support/page.tsx
import { Section } from "@/components/Section";
import { FAQ } from "@/components/FAQ";

export default function Support(){
  return (
    <Section title="Support" kicker="We’re here to help">
      <FAQ items={[
        { q: "How does QR preorder work?", a: "Guests scan a table QR, choose flavors, and pay. Orders route to staff tablets." },
        { q: "What is Reflex Δ?", a: "A quick recovery metric after repair/refill—higher is better, fewer mistakes." },
        { q: "Can I migrate data?", a: "Yes. We provide templates and concierge import for early customers." },
      ]}/>
      <p className="mt-6 text-white/70 text-sm">
        Still stuck? Email <a href="mailto:support@hookahplus.net" className="underline">support@hookahplus.net</a>.
      </p>
    </Section>
  );
}
