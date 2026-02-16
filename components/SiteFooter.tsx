import Link from "next/link";
const footer = [
  {href:"/terms",label:"Terms"},{href:"/privacy",label:"Privacy"},
  {href:"/security",label:"Security"},{href:"/status",label:"Status"},
  {href:"/changelog",label:"Changelog"},{href:"/accessibility",label:"Accessibility"},
  {href:"/partners",label:"Partners"},{href:"/api",label:"API Docs"},
  {href:"/contact",label:"Contact"},{href:"/sitemap",label:"Sitemap"},
];
export function SiteFooter(){
  return (
    <footer className="mt-16 border-t border-white/10">
      <div className="container py-10 text-sm text-white/70 flex flex-wrap gap-x-6 gap-y-2">
        {footer.map(f=> <Link key={f.href} href={f.href} className="hover:text-accent-2">{f.label}</Link>)}
        <div className="ml-auto opacity-70">© {new Date().getFullYear()} Hookah+</div>
      </div>
    </footer>
  )
}
