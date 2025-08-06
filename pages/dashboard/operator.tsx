import React from 'react';
import OperatorDashboard from '../../components/OperatorDashboard';
import SessionTracker from '../../components/SessionTracker';
import SeatMapEditor from '../../components/SeatMapEditor';
import SessionNotesPanel from '../../components/SessionNotesPanel';
import WhisperMemoryLog from '../../components/WhisperMemoryLog';

export default function OperatorRoute() {
  return (
    <main className="p-4">
      <OperatorDashboard />
      <SessionTracker />
      <SeatMapEditor />
      <SessionNotesPanel />
      <WhisperMemoryLog />
    </main>
  );
}
