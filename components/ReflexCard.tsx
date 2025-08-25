import React from "react";
import Link from "next/link";

type ReflexCardProps = {
  title: string;
  description: string;
  href?: string;
  badge?: string;
  className?: string;
  cta?: string;
  onClick?: () => void;
};

export default function ReflexCard({
  title,
  description,
  href,
  badge,
  className,
  cta = "Open",
  onClick,
}: ReflexCardProps) {
  const Shell = href ? (props: any) => <Link href={href!} {...props} /> : (props: any) => <div {...props} />;

  return (
    <Shell
      className={[
        "bg-surface text-text rounded-2xl border border-text/10 p-6",
        "transition shadow hover:shadow-xl",
        "flex flex-col justify-between",
        "w-full min-h-[220px] md:w-[520px] md:h-[280px] shrink-0",
        href ? "focus:outline-none focus:ring-2 focus:ring-primary" : "",
        className ?? ""
      ].join(" ")}
      aria-label={title}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
          {badge ? (
            <span className="text-xs px-2 py-1 rounded-full border border-primary/30 text-primary">{badge}</span>
          ) : null}
        </div>
        <p className="text-sm text-text-light">{description}</p>
      </div>

      <div className="pt-4">
        {href ? (
          <span className="inline-block bg-primary hover:bg-primary-dark text-black font-semibold px-4 py-2 rounded-lg">
            {cta}
          </span>
        ) : (
          <button 
            onClick={onClick}
            className="bg-primary hover:bg-primary-dark text-black font-semibold px-4 py-2 rounded-lg"
          >
            {cta}
          </button>
        )}
      </div>
    </Shell>
  );
}
