'use client';

import React, { useEffect, useState } from 'react';

interface CodexEntry {
  title: string;
  triggers: string[];
  summary: string;
  reflexScore: number;
  time: string;
}

interface Props {
  limit?: number;
  offset?: number;
}

// Fetch and display Codex entries as a vertical timeline feed.
export default function CodexRenderer({ limit, offset }: Props) {
  const [entries, setEntries] = useState<CodexEntry[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/codex-entries');
        const data: CodexEntry[] = await res.json();
        let list = data;
        if (offset) list = list.slice(offset);
        if (limit) list = list.slice(0, limit);
        setEntries(list);
      } catch (e) {
        console.error('Failed to load Codex entries', e);
      }
    }
    load();
  }, [limit, offset]);

  return (
    <div className="codex-feed">
      {entries.map((entry, idx) => (
        <div key={idx} className="codex-card">
          <h3 className="codex-title">{entry.title}</h3>
          <div className="codex-triggers">{entry.triggers.join(', ')}</div>
          <p className="codex-summary">{entry.summary}</p>
          <div className="codex-meta">
            <span className="codex-score">Reflex Score: {entry.reflexScore}</span>
            <span className="codex-time">
              {new Date(entry.time).toLocaleString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
