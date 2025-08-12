// components/LogoWall.tsx
import React from "react";

export type Logo = { src: string; alt: string; href?: string };
export function LogoWall({ logos }: { logos: Logo[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 items-center">
      {logos.map((l, i) => {
        const img = (
          <img
            src={l.src}
            alt={l.alt}
            className="max-h-8 w-auto opacity-80 saturate-0 contrast-150 hover:opacity-100 transition"
            loading="lazy"
          />
        );
        return (
          <div key={i} className="flex items-center justify-center">
            {l.href ? (
              <a href={l.href} target="_blank" rel="noreferrer noopener" aria-label={l.alt}>
                {img}
              </a>
            ) : (
              img
            )}
          </div>
        );
      })}
    </div>
  );
}
