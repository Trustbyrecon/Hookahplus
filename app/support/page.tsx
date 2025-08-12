 codex/apply-moodbook-to-all-pages-on-hookahplus
import { Page } from "../../components/Page";

export default function Support() {
  return (
    <Page title="Support">
      <p>Find answers or contact us for help.</p>
    </Page>
  );
}

 feat/moodbook-all-in-one
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

export default function Page() {
      return (
        <main className="max-w-3xl mx-auto px-6 py-12">
          <h1 className="text-3xl mb-4">Hookah+ Support</h1>
          <p className="opacity-80 mb-6">Placeholder for /support (L+4 scaffolding). Replace with real content.</p>
          <form name="support" method="POST" data-netlify="true" className="grid gap-3 max-w-md">
  <input type="hidden" name="form-name" value="support" />
  <input name="email" type="email" placeholder="Email" className="px-3 py-2 rounded" required />
  <textarea name="message" placeholder="How can we help?" className="px-3 py-2 rounded min-h-[140px]" required></textarea>
  <button type="submit" className="px-4 py-2 rounded-xl shadow">Send</button>
</form>
        </main>
      );
    }
 main
 main
