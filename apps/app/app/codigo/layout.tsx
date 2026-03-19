"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * CODIGO pilot layout — minimal chrome for handheld/POS alignment.
 * Slim nav: Floor | Join | Privacy. No GlobalNavigation to reduce cognitive load.
 */
export default function CodigoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAccessExpired = pathname === '/codigo/access-expired';
  const isOnboard = pathname === '/codigo/onboard';
  const hideSlimNav =
    isAccessExpired ||
    isOnboard ||
    pathname === '/codigo/resolve' ||
    pathname === '/codigo/party-joined' ||
    pathname === '/codigo/join' ||
    pathname === '/codigo/privacy';

  const navItems = [
    { href: "/codigo/operator", label: "Floor" },
    { href: "/codigo/onboard", label: "Get started" },
    { href: "/codigo/privacy", label: "Privacy" },
  ];

  return (
    <div className="flex h-screen min-h-screen flex-col overflow-hidden bg-zinc-950">
      {/* Slim nav bar — hidden on access-expired and onboard for standalone flow */}
      {!hideSlimNav && (
      <nav className="flex-shrink-0 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-sm">
        <div className="flex items-center justify-center gap-1 px-2 py-2 sm:gap-4 sm:px-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
      )}

      <main className="min-h-0 flex-1">{children}</main>
    </div>
  );
}
