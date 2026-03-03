'use client';

import React from 'react';

type LocationRow = {
  name: string;
  tablesCount: number | null;
  sectionsCount: number | null;
  provisioned: boolean;
  loungeId: string | null;
  readiness?: { score?: { ok: number; total: number } } | null;
};

type Props = {
  organizationName?: string | null;
  organizationSlug?: string | null;
  multiLocationEnabled?: boolean;
  locations: LocationRow[];
  showDebug?: boolean;
  sessionDebug?: {
    token?: string | null;
    source?: string | null;
    status?: string | null;
    expiresAt?: string | null;
    activatedLoungeIds?: string[] | null;
  } | null;
};

function chipClass(kind: 'draft' | 'provisioned' | 'ready' | 'warn'): string {
  switch (kind) {
    case 'ready':
      return 'bg-green-900/30 border-green-600/40 text-green-200';
    case 'provisioned':
      return 'bg-teal-900/20 border-teal-600/40 text-teal-200';
    case 'warn':
      return 'bg-amber-900/20 border-amber-600/40 text-amber-200';
    default:
      return 'bg-zinc-800/60 border-zinc-600/50 text-zinc-300';
  }
}

export function OrganizationLocationsBar(props: Props) {
  const {
    organizationName,
    organizationSlug,
    multiLocationEnabled,
    locations,
    showDebug,
    sessionDebug,
  } = props;

  const locationCount = locations.length;
  const provisionedCount = locations.filter((l) => l.provisioned).length;

  const title = multiLocationEnabled
    ? (organizationName || 'Multi-location operator')
    : (organizationName || 'Operator');

  return (
    <div className="mb-6 bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-semibold text-white truncate">{title}</div>
            {organizationSlug && (
              <span className="text-xs text-zinc-500 border border-zinc-800 bg-zinc-950/40 rounded px-2 py-0.5">
                {organizationSlug}
              </span>
            )}
            <span className="text-xs text-zinc-400">
              {locationCount} location{locationCount === 1 ? '' : 's'}
            </span>
            {provisionedCount > 0 && (
              <span className="text-xs text-zinc-400">
                • {provisionedCount} provisioned
              </span>
            )}
          </div>
          <div className="text-xs text-zinc-500 mt-1">
            Per-location: name, tables/sections, hours. Shared: flavors, session rules, staff roles, POS.
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2">
        {locations.map((loc, idx) => {
          const ok = loc.readiness?.score?.ok;
          const total = loc.readiness?.score?.total;
          const hasScore = typeof ok === 'number' && typeof total === 'number';
          const isReady = hasScore && ok === total;
          const isPartial = hasScore && ok! < total!;

          return (
            <div
              key={`${idx}-${loc.loungeId || loc.name}`}
              className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between bg-zinc-950/30 border border-zinc-800 rounded-md px-3 py-2"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-sm text-white font-medium truncate">{loc.name}</div>
                  <span className={`text-[11px] px-2 py-0.5 rounded border ${chipClass(loc.provisioned ? 'provisioned' : 'draft')}`}>
                    {loc.provisioned ? 'Provisioned' : 'Draft'}
                  </span>
                  {hasScore && (
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded border ${
                        isReady ? chipClass('ready') : (isPartial ? chipClass('warn') : chipClass('draft'))
                      }`}
                      title="Readiness checks"
                    >
                      Ready {ok}/{total}
                    </span>
                  )}
                </div>
                <div className="text-xs text-zinc-400 mt-0.5">
                  {loc.tablesCount ? `${loc.tablesCount} tables` : 'Tables: —'}
                  {typeof loc.sectionsCount === 'number' ? ` • ${loc.sectionsCount} sections` : ''}
                  {loc.loungeId ? ` • ${loc.loungeId}` : ''}
                </div>
              </div>

              {loc.loungeId && (
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`/dashboard/${encodeURIComponent(loc.loungeId)}`}
                    className="text-xs px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded hover:border-teal-500 transition-colors"
                  >
                    Dashboard
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showDebug && sessionDebug && (
        <div className="mt-4 text-xs text-zinc-400 bg-zinc-950/40 border border-zinc-800 rounded-md p-3">
          <div className="font-semibold text-zinc-200 mb-2">Debug</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div><span className="text-zinc-500">token</span> {sessionDebug.token}</div>
            <div><span className="text-zinc-500">source</span> {sessionDebug.source}</div>
            <div><span className="text-zinc-500">status</span> {sessionDebug.status}</div>
            <div><span className="text-zinc-500">expiresAt</span> {sessionDebug.expiresAt}</div>
            <div className="sm:col-span-2">
              <span className="text-zinc-500">activatedLoungeIds</span> {JSON.stringify(sessionDebug.activatedLoungeIds || [])}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

