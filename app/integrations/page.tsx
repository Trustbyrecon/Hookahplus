import { Section } from "../../components/Section";
import { LogoWall } from "../../components/LogoWall";

export default function Integrations() {
  return (
    <Section title="Integrations" kicker="Connect your stack">
      <p className="text-white/80">Payments, hosting, analytics and messaging out of the box.</p>
      <div className="mt-6">
        <LogoWall
          logos={[
            { src: "/logos/stripe.svg", alt: "Stripe" },
            { src: "/logos/netlify.svg", alt: "Netlify" },
            { src: "/logos/twilio.svg", alt: "Twilio" },
            { src: "/logos/plausible.svg", alt: "Plausible" }
          ]}
        />
      </div>
    </Section>
  );
}
