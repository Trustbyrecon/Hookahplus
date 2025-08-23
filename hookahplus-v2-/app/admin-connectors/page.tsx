"use client";

import { useState } from "react";
import ConnectorPartnershipManager from "../../components/ConnectorPartnershipManager";
import GlobalNavigation from "../../components/GlobalNavigation";

export default function AdminConnectorsPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <GlobalNavigation />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-teal-400 mb-2">Connector Partnership Management</h1>
          <p className="text-zinc-400">Manage partnerships and integrations with external services</p>
        </div>
        
        <ConnectorPartnershipManager />
      </div>
    </div>
  );
}
