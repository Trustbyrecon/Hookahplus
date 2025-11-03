export function NavBar() {
  const items = [
    { href: '/', label: 'Home' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/preorder', label: 'Pre-order' },
    { href: '/operator', label: 'Operator' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/waitlist', label: 'Waitlist' },
    { href: '/integrations', label: 'Integrations' },
    { href: '/press', label: 'Press' },
    { href: '/support', label: 'Support' },
  ];
  return (
    <nav className="w-full border-b border-white/10">
      <div className="max-w-5xl mx-auto px-6 py-4 flex gap-6 flex-wrap">
        {items.map(i => <a key={i.href} href={i.href} className="opacity-80 hover:opacity-100">{i.label}</a>)}
      </div>
    </nav>
  );
}

export function SiteFooter() {
  const items = [
    { href: '/terms', label: 'Terms' },
    { href: '/privacy', label: 'Privacy' },
    { href: '/security', label: 'Security' },
    { href: '/status', label: 'Status' },
    { href: '/changelog', label: 'Changelog' },
    { href: '/accessibility', label: 'Accessibility' },
    { href: '/partners', label: 'Partners' },
    { href: '/api', label: 'API' },
    { href: '/docs', label: 'Docs' },
    { href: '/contact', label: 'Contact' },
    { href: '/sitemap.xml', label: 'Sitemap' },
  ];
  return (
    <footer className="w-full border-t border-white/10 mt-16">
      <div className="max-w-5xl mx-auto px-6 py-8 grid gap-2 sm:flex sm:flex-wrap sm:gap-6">
        {items.map(i => <a key={i.href} href={i.href} className="opacity-80 hover:opacity-100">{i.label}</a>)}
      </div>
    </footer>
  );
}
