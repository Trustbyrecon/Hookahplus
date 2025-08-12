export function Page({title, kicker, children}:{title:string; kicker?:string; children:React.ReactNode}){
  return (
    <section className="container py-12">
      {kicker && <div className="mb-2 text-accent text-sm">{kicker}</div>}
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{title}</h1>
      <div className="mt-6 prose prose-invert">{children}</div>
    </section>
  )
}
