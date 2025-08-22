// components/Header.jsx

import React from "react";

export default function Header() {
  return (
    <header className="w-full py-4 px-6 bg-[#1a1a1a] border-b border-[#D4AF37]">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold text-[#D4AF37]">Hookah+</h1>
        <nav className="space-x-4">
          <a href="/" className="hover:underline text-[#f5f5f5]">Home</a>
          <a href="/flavor-mix" className="hover:underline text-[#f5f5f5]">Flavor Mix</a>
          <a href="/pricing" className="hover:underline text-[#f5f5f5]">Pricing</a>
        </nav>
      </div>
    </header>
  );
}
