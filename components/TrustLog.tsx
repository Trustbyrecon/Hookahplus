import React from 'react';
import { Session } from './SessionCard';

interface Props {
  sessions: Session[];
}

// Renders session notes for audit purposes; hidden from regular view
export default function TrustLog({ sessions }: Props) {
  return (
    <div className="hidden" aria-hidden>
      {sessions.map((s) => (
        <pre key={s.id} data-table={s.table}>
          {JSON.stringify(s.notes)}
        </pre>
      ))}
    </div>
  );
}
