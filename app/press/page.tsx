 codex/apply-moodbook-to-all-pages-on-hookahplus
import { Page } from "../../components/Page";

export default function Press() {
  return (
    <Page title="Press">
      <p>Media resources and company background.</p>
    </Page>

 feat/moodbook-all-in-one
// app/press/page.tsx
import { Section } from "@/components/Section";

export default function Press(){
  return (
    <Section title="Press kit" kicker="Press & media">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <div className="text-lg font-semibold">Brand assets</div>
          <p className="mt-2 text-white/80">Logo pack and usage guide.</p>
          <a className="mt-3 inline-block btn border border-white/20" href="/press/kit.zip">Download</a>
        </div>
        <div className="card p-5">
          <div className="text-lg font-semibold">Contact</div>
          <p className="mt-2 text-white/80">Media inquiries and speaking.</p>
          <a className="mt-3 inline-block btn bg-accent text-black font-semibold" href="mailto:press@hookahplus.net">press@hookahplus.net</a>
        </div>
      </div>
    </Section>

export default function Page() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl mb-4">Hookah+ Press</h1>
      <p className="opacity-80 mb-6">Placeholder for /press (L+4 scaffolding). Replace with real content.</p>
      <ul className="list-disc pl-5"><li>Logo pack (coming soon)</li><li>Brand guidelines (coming soon)</li><li>Media contact: <a className="underline" href="mailto:hookahplusconnector@gmail.com">hookahplusconnector@gmail.com</a></li></ul>
    </main>
 main
 main
  );
}
