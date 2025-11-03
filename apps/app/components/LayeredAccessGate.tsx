'use client';

import React from 'react';
import PreorderEntry from './PreorderEntry';
import FlavorSelector from './FlavorSelector';
import SessionConfirmation from './SessionConfirmation';
import LoyaltyBadge from './LoyaltyBadge';
import OperatorDashboard from './OperatorDashboard';
import SessionTracker from './SessionTracker';
import SeatMapEditor from './SeatMapEditor';
import SessionNotesPanel from './SessionNotesPanel';
import WhisperMemoryLog from './WhisperMemoryLog';
import ReflexTrustGraph from './ReflexTrustGraph';
import CodexRenderer from './CodexRenderer';
import SimulationReplay from './SimulationReplay';
import GhostLogPreview from './GhostLogPreview';
import ReflexScoreAudit from './ReflexScoreAudit';

interface User {
  role?: string;
  trustTier?: number;
}

function LayerI() {
  return (
    <>
      <PreorderEntry />
      <FlavorSelector value="Mint" onChange={() => {}} />
      <SessionConfirmation flavor="Mint" />
      <LoyaltyBadge />
    </>
  );
}

function LayerII() {
  return (
    <>
      <OperatorDashboard />
      <SessionTracker />
      <SeatMapEditor />
      <SessionNotesPanel />
      <WhisperMemoryLog />
    </>
  );
}

function LayerIII() {
  return (
    <>
      <ReflexTrustGraph />
      <CodexRenderer />
      <SimulationReplay />
      <GhostLogPreview />
      <ReflexScoreAudit />
    </>
  );
}

export default function LayeredAccessGate({ user }: { user: User }) {
  if (user.role === 'customer') return <LayerI />;
  else if (user.role === 'operator') return <LayerII />;
  else if (user.role === 'partner' || (user.trustTier ?? 0) >= 7) return <LayerIII />;
  return <LayerI />;
}
