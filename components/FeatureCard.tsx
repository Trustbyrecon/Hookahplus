import React from "react";

type FeatureCardProps = {
  title: string;
  desc: string;
  icon?: React.ReactNode;
  className?: string;
};

export default function FeatureCard({ title, desc, icon, className }: FeatureCardProps) {
  return (
    <div
      role="region"
      aria-label={title}
      className={[
        "bg-surface text-text rounded-2xl border border-text/10 p-6",
        "transition shadow hover:shadow-xl",
        "flex flex-col justify-between",
        "w-full min-h-[160px] md:w-[344px] md:h-[180px] shrink-0",
        className ?? ""
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        {icon ? <div className="text-primary mt-1">{icon}</div> : null}
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      </div>
      <p className="text-sm text-text-light">{desc}</p>
    </div>
  );
}
