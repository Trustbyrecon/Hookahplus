import React from 'react';
import { Session } from './SessionCard';

interface Props {
  sessions: Session[];
}

// Renders session notes for audit purposes; hidden from regular view
export default function TrustLog({ sessions }: Props) {
  return (
    <div className="hidden font-sans" aria-hidden>
      {sessions.map((s) => (
        <pre key={s.id} data-table={s.table} className="font-mono">
          {JSON.stringify(s.notes)}
        </pre>
      ))}
    </div>
  );
}
