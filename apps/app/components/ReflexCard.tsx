import React from 'react';
import Link from 'next/link';

type ReflexCardProps = {
  title: string;
  description: string;
  href?: string;
  badge?: string;
  className?: string;
};

export default function ReflexCard({
  title,
  description,
  href,
  badge,
  className,
}: ReflexCardProps) {
  const Shell = href ? (props: any) => <Link href={href!} {...props} /> : (props: any) => <div {...props} />;

  return (
    <Shell
      className={[
        'bg-gray-900/50 text-white rounded-xl border border-gray-800 p-6',
        'transition shadow hover:shadow-xl',
        'flex flex-col justify-between',
        'w-full min-h-[220px]',
        href ? 'focus:outline-none focus:ring-2 focus:ring-green-500' : '',
        className ?? '',
      ].join(' ')}
      aria-label={title}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
          {badge ? (
            <span className="text-xs px-2 py-1 rounded-full border border-green-500/30 text-green-400">
              {badge}
            </span>
          ) : null}
        </div>
        <p className="text-sm text-gray-300">{description}</p>
      </div>

      <div className="pt-4">
        {href ? (
          <span className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg">
            Open
          </span>
        ) : (
          <button className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg">
            Inspect
          </button>
        )}
      </div>
    </Shell>
  );
}
