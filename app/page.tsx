export default function Home(){
  return (
    <section className="container py-16">
      <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
        Hookah+ — the lounge operator’s edge
      </h1>
      <p className="mt-4 text-white/80 max-w-2xl">
        Manage sessions, payments, and flavor flow with live telemetry.
        Built for speed. Designed for staff.
      </p>
      <div className="mt-8 flex gap-3">
        <a href="/preorder" className="btn bg-accent text-black font-semibold">Pre-order</a>
        <a href="/pricing" className="btn border border-white/20">See pricing</a>
      </div>
    </section>
  )
}
