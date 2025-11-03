'use client';

import { Page } from "../../components/Page";
import SessionList from "../../components/SessionList";
import RevenueMetrics from "../../components/RevenueMetrics";
import FlavorPerformance from "../../components/FlavorPerformance";
import TrustScoreDisplay from "../../components/TrustScoreDisplay";

export default function Dashboard() {
  return (
    <Page title="Dashboard">
      <div className="space-y-8">
        {/* Trust Score - Prominent Display */}
        <TrustScoreDisplay />

        {/* Revenue Metrics */}
        <RevenueMetrics />

        {/* Active Sessions */}
        <SessionList />

        {/* Flavor Performance */}
        <FlavorPerformance />
      </div>
    </Page>
  );
}
