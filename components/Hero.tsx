// components/Hero.tsx
"use client";
import React from "react";
import Link from "next/link";

type CTA = { href: string; label: string };

export function Hero({
  title,
  subtitle,
  primary,
  secondary,
  children,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  primary?: CTA;
  secondary?: CTA;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
        style={{
          background: `radial-gradient(600px 300px at 20% 0%, rgba(34,227,163,.12), transparent 60%),
                       radial-gradient(600px 300px at 80% 0%, rgba(106,168,255,.10), transparent 60%)`,
        }}
      />
      <div className="container py-16 grid gap-10 lg:grid-cols-2 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">{title}</h1>
          {subtitle && (
            <p className="mt-4 text-white/80 max-w-2xl text-[15px] leading-7">{subtitle}</p>
          )}
          {(primary || secondary) && (
            <div className="mt-8 flex flex-wrap gap-3">
              {primary && (
                <Link href={primary.href} className="btn bg-accent text-black font-semibold">
                  {primary.label}
                </Link>
              )}
              {secondary && (
                <Link href={secondary.href} className="btn border border-white/20">
                  {secondary.label}
                </Link>
              )}
            </div>
          )}
        </div>
        <div className="max-lg:order-first lg:order-none">{children}</div>
      </div>
    </section>
  );
}
