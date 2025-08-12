"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/pricing", label: "Pricing" },
  { href: "/preorder", label: "Pre-order" },
  { href: "/waitlist", label: "Waitlist" },
  { href: "/integrations", label: "Integrations" },
  { href: "/press", label: "Press" },
  { href: "/support", label: "Support" },
];
export function NavBar() {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-bg/70 backdrop-blur">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight">Hookah+</Link>
        <nav className="hidden md:flex gap-6 text-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`hover:text-accent ${path === l.href ? "text-accent" : "text-white/80"}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <Link href="/preorder" className="btn bg-accent text-black font-semibold hover:brightness-90">
          Get early access
        </Link>
      </div>
    </header>
  );
}
