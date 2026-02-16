// components/FAQ.tsx
"use client";
import React, { useState } from "react";

export type FAQItem = { q: string; a: React.ReactNode };
export function FAQ({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-panel">
      {items.map((it, i) => (
        <div key={i}>
          <button
            className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-white/5"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            <span className="font-medium">{it.q}</span>
            <span className="text-accent">{open === i ? "−" : "+"}</span>
          </button>
          {open === i && (
            <div className="px-5 pb-5 text-white/80 text-[15px] leading-7">{it.a}</div>
          )}
        </div>
      ))}
    </div>
  );
}
