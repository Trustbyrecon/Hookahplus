import { Section } from "../../components/Section";

export default function Press() {
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
  );
}
