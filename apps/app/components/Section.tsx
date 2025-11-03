// components/Section.tsx
import React from "react";

export function Section({
  title,
  kicker,
  children,
  className = "",
}: {
  title?: React.ReactNode;
  kicker?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={"container py-12 " + className}>
      {kicker && <div className="mb-2 text-accent text-sm">{kicker}</div>}
      {title && <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">{title}</h2>}
      <div className={title ? "mt-6" : ""}>{children}</div>
    </section>
  );
}
