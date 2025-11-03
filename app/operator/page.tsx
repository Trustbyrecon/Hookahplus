'use client';

import { Page } from '../../components/Page';
import OperatorSessionList from '../../components/OperatorSessionList';
import TableStatusView from '../../components/TableStatusView';

export default function OperatorDashboard() {
  return (
    <Page title="Operator Dashboard">
      <div className="space-y-8">
        {/* Table Status View */}
        <TableStatusView />

        {/* Active Sessions */}
        <OperatorSessionList />
      </div>
    </Page>
  );
}
