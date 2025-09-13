// components/Header.jsx

import React from "react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full py-4 px-6 bg-[#1a1a1a] border-b border-[#D4AF37]">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-[#D4AF37] hover:text-[#F4D03F] transition-colors">
          Hookah+
        </Link>
        <nav className="space-x-4">
          <Link href="/" className="hover:underline text-[#f5f5f5] transition-colors">Home</Link>
          <Link href="/flavor-mix" className="hover:underline text-[#f5f5f5] transition-colors">Flavor Mix</Link>
          <Link href="/pricing" className="hover:underline text-[#f5f5f5] transition-colors">Pricing</Link>
          <Link href="/support" className="hover:underline text-[#f5f5f5] transition-colors">Support</Link>
        </nav>
      </div>
    </header>
  );
}