// components/Footer.jsx

import React from "react";

export default function Footer() {
  return (
    <footer className="w-full py-6 px-6 bg-[#1a1a1a] border-t border-[#D4AF37]">
      <div className="max-w-7xl mx-auto text-center text-sm text-[#f5f5f5]">
        <p>&copy; {new Date().getFullYear()} Hookah+. All rights reserved.</p>
      </div>
    </footer>
  );
}
