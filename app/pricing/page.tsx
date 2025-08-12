import { Page } from "../../components/Page";

export default function PageView(){
  return (
    <Page title="Pricing" kicker="Simple, transparent">
      <p>Launch with Hookah+ Core. Add automation as you grow.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card p-5">
          <div className="text-lg font-semibold">Starter</div>
          <div className="mt-2 text-3xl font-bold">$29<span className="text-white/60 text-base">/mo</span></div>
          <ul className="mt-3 space-y-1 text-sm text-white/80">
            <li>• 1 venue · unlimited sessions</li>
            <li>• Basic analytics</li>
          </ul>
          <a href="/preorder" className="mt-4 inline-block btn bg-accent text-black font-semibold">Get started</a>
        </div>
      </div>
    </Page>
  )
}
