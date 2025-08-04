import React from 'react';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const indexPath = path.join(process.cwd(), 'codex/indices/ΔHookahIndex_V1.yaml');
const raw = fs.readFileSync(indexPath, 'utf8');
const data = yaml.load(raw) as any;

export default function HookahIndexPanel() {
  return (
 codex/update-styles-in-hookah-indexpanel
    <div className="p-4 bg-charcoal rounded text-goldLumen mb-4">
      <h2 className="font-bold mb-2 text-ember">Hookah+ Index {data.index_version}</h2>

    <div className="p-4 bg-deepMoss rounded text-goldLumen mb-4">
      <h2 className="font-bold mb-2">Hookah+ Index {data.index_version}</h2>
 main
      <div className="mb-2">
        <span className="font-semibold text-mystic">Base Metrics:</span>
        <ul className="list-disc list-inside marker:text-mystic">
          {data.base_metrics.map((m: string) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      </div>
      <div className="mb-2">
        <span className="font-semibold text-ember">Personas:</span>
        <ul className="list-disc list-inside marker:text-ember">
          {Object.entries(data.personas).map(([name, info]: [string, any]) => (
            <li key={name} className="mb-1">
              <div className="font-semibold">{name} ({info.segment_pct}%)</div>
              <div className="text-sm">{info.STAR}</div>
            </li>
          ))}
        </ul>
      </div>
      <div className="mb-2">
        <span className="font-semibold text-mystic">Triggers:</span>
        <ul className="list-disc list-inside marker:text-mystic">
          {data.triggers.map((t: string) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>
      <div className="text-sm">Reflex Loop Enabled: {data.reflex_loop_enabled ? 'Yes' : 'No'}</div>
    </div>
  );
}
