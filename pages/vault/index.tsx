import React from 'react';
import ReflexTrustGraph from '../../components/ReflexTrustGraph';
import CodexRenderer from '../../components/CodexRenderer';
import SimulationReplay from '../../components/SimulationReplay';
import GhostLogPreview from '../../components/GhostLogPreview';
import ReflexScoreAudit from '../../components/ReflexScoreAudit';

export default function VaultIndex() {
  return (
    <main className="p-4">
      <ReflexTrustGraph />
      <CodexRenderer />
      <SimulationReplay />
      <GhostLogPreview />
      <ReflexScoreAudit />
    </main>
  );
}
