import React, { useState, useEffect } from 'react';

interface ConnectorProfile {
  id: string;
  name: string;
  city: string;
  status: 'pending' | 'approved' | 'active';
  loungesIdentified: number;
  loungesSignedUp: number;
  revenueEarned: number;
  specialties: string[];
  socialMedia: string[];
  applicationDate: number;
  approvalDate?: number;
  notes: string;
}

interface LoungeOpportunity {
  id: string;
  name: string;
  city: string;
  connectorId: string;
  status: 'identified' | 'contacted' | 'interested' | 'signed_up';
  estimatedRevenue: number;
  contactInfo: string;
  notes: string;
}

interface ConnectorData {
  connectors: ConnectorProfile[];
  opportunities: LoungeOpportunity[];
  metrics: {
    totalRevenue: number;
    totalLounges: number;
    activeConnectors: number;
    totalConnectors: number;
  };
}

export default function ConnectorPartnershipManager() {
  const [connectors, setConnectors] = useState<ConnectorProfile[]>([]);
  const [opportunities, setOpportunities] = useState<LoungeOpportunity[]>([]);
  const [metrics, setMetrics] = useState<ConnectorData['metrics'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddConnector, setShowAddConnector] = useState(false);
  const [showAddOpportunity, setShowAddOpportunity] = useState(false);
  const [selectedConnector, setSelectedConnector] = useState<ConnectorProfile | null>(null);

  // Form states
  const [connectorForm, setConnectorForm] = useState({
    name: '',
    city: '',
    specialties: '',
    socialMedia: '',
    notes: ''
  });

  const [opportunityForm, setOpportunityForm] = useState({
    name: '',
    city: '',
    connectorId: '',
    contactInfo: '',
    estimatedRevenue: '',
    notes: ''
  });

  async function fetchConnectorData() {
    setIsLoading(true);
    try {
      const res = await fetch('/api/connectors');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setConnectors(data.data.connectors);
          setOpportunities(data.data.opportunities);
          setMetrics(data.data.metrics);
          setError(null);
        } else {
          setError(data.message || 'Failed to fetch data');
          console.error('API error:', data.message);
        }
      } else {
        setError(`HTTP error: ${res.status}`);
        console.error('HTTP error:', res.status);
      }
    } catch (error) {
      console.error('Error fetching connector data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function addConnector() {
    try {
      const res = await fetch('/api/connectors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_connector',
          data: {
            name: connectorForm.name,
            city: connectorForm.city,
            specialties: connectorForm.specialties.split(',').map(s => s.trim()).filter(Boolean),
            socialMedia: connectorForm.socialMedia.split(',').map(s => s.trim()).filter(Boolean),
            notes: connectorForm.notes
          }
        })
      });
      
      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          await fetchConnectorData();
          setShowAddConnector(false);
          setConnectorForm({ name: '', city: '', specialties: '', socialMedia: '', notes: '' });
        } else {
          console.error('Failed to add connector:', result.message);
        }
      } else {
        console.error('HTTP error:', res.status);
      }
    } catch (error) {
      console.error('Error adding connector:', error);
    }
  }

  async function addOpportunity() {
    try {
      const res = await fetch('/api/connectors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_opportunity',
          data: {
            name: opportunityForm.name,
            city: opportunityForm.city,
            connectorId: opportunityForm.connectorId,
            contactInfo: opportunityForm.contactInfo,
            estimatedRevenue: parseInt(opportunityForm.estimatedRevenue) || 0,
            notes: opportunityForm.notes
          }
        })
      });
      
      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          await fetchConnectorData();
          setShowAddOpportunity(false);
          setOpportunityForm({ name: '', city: '', connectorId: '', contactInfo: '', estimatedRevenue: '', notes: '' });
        } else {
          console.error('Failed to add opportunity:', result.message);
        }
      } else {
        console.error('HTTP error:', res.status);
      }
    } catch (error) {
      console.error('Error adding opportunity:', error);
    }
  }

  useEffect(() => {
    fetchConnectorData();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6">
        <div className="text-center text-zinc-400">Loading Connector Partnership Program...</div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-teal-300">Connector Partnership Program</h3>
          <p className="text-zinc-400 text-sm">Accelerating MOAT Scale Growth</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchConnectorData}
            className="bg-zinc-600 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            🔄 Refresh
          </button>
          <button
            onClick={() => setShowAddConnector(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Add Connector
          </button>
          <button
            onClick={() => setShowAddOpportunity(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Add Opportunity
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-6">
          <div className="text-red-300 font-medium">Error</div>
          <div className="text-red-200 text-sm">{error}</div>
        </div>
      )}

      {/* Program Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-zinc-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-teal-400">{metrics.activeConnectors}</div>
            <div className="text-zinc-400 text-sm">Active Connectors</div>
          </div>
          <div className="bg-zinc-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{metrics.totalLounges}</div>
            <div className="text-zinc-400 text-sm">Lounges Signed Up</div>
          </div>
          <div className="bg-zinc-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">${metrics.totalRevenue}</div>
            <div className="text-zinc-400 text-sm">Revenue Shared</div>
          </div>
          <div className="bg-zinc-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">5%</div>
            <div className="text-zinc-400 text-sm">Revenue Share</div>
          </div>
        </div>
      )}

      {/* Connectors List */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-white mb-3">Community Connectors</h4>
        <div className="space-y-3">
          {connectors.map((connector) => (
            <div
              key={connector.id}
              className="bg-zinc-800 rounded-lg p-4 cursor-pointer hover:bg-zinc-700 transition-colors"
              onClick={() => setSelectedConnector(connector)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">{connector.name}</div>
                  <div className="text-sm text-zinc-400">{connector.city}</div>
                  <div className="text-xs text-zinc-500">
                    {connector.loungesIdentified} identified, {connector.loungesSignedUp} signed up
                  </div>
                </div>
                <div className="text-right">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    connector.status === 'active' ? 'bg-green-600 text-white' :
                    connector.status === 'approved' ? 'bg-blue-600 text-white' :
                    'bg-yellow-600 text-white'
                  }`}>
                    {connector.status.toUpperCase()}
                  </div>
                  <div className="text-sm text-teal-400 mt-1">
                    ${connector.revenueEarned} earned
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Opportunities List */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-white mb-3">Lounge Opportunities</h4>
        <div className="space-y-3">
          {opportunities.map((opportunity) => {
            const connector = connectors.find(c => c.id === opportunity.connectorId);
            return (
              <div key={opportunity.id} className="bg-zinc-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">{opportunity.name}</div>
                    <div className="text-sm text-zinc-400">
                      {opportunity.city} • Connector: {connector?.name}
                    </div>
                    <div className="text-xs text-zinc-500">{opportunity.contactInfo}</div>
                  </div>
                  <div className="text-right">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      opportunity.status === 'signed_up' ? 'bg-green-600 text-white' :
                      opportunity.status === 'interested' ? 'bg-blue-600 text-white' :
                      opportunity.status === 'contacted' ? 'bg-yellow-600 text-white' :
                      'bg-gray-600 text-white'
                    }`}>
                      {opportunity.status.replace('_', ' ').toUpperCase()}
                    </div>
                    <div className="text-sm text-teal-400 mt-1">
                      Est. ${opportunity.estimatedRevenue}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Program Benefits */}
      <div className="bg-gradient-to-r from-purple-900 to-blue-900 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-white mb-3">Program Benefits</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-yellow-400">💰</span>
            <span className="text-zinc-300">5% revenue share for 1 year per lounge</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-400">🚀</span>
            <span className="text-zinc-300">Early access to AI Flavors & Loyalty features</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">⭐</span>
            <span className="text-zinc-300">Featured on platforms + VIP access</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-purple-400">🏆</span>
            <span className="text-zinc-300">Community Connector profile badge</span>
          </div>
        </div>
      </div>

      {/* Add Connector Modal */}
      {showAddConnector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-md w-full">
            <h4 className="text-lg font-semibold text-white mb-4">Add New Connector</h4>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Name"
                value={connectorForm.name}
                onChange={(e) => setConnectorForm({...connectorForm, name: e.target.value})}
                className="w-full bg-zinc-800 text-white px-3 py-2 rounded-lg border border-zinc-600 focus:border-teal-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="City"
                value={connectorForm.city}
                onChange={(e) => setConnectorForm({...connectorForm, city: e.target.value})}
                className="w-full bg-zinc-800 text-white px-3 py-2 rounded-lg border border-zinc-600 focus:border-teal-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Specialties (comma-separated)"
                value={connectorForm.specialties}
                onChange={(e) => setConnectorForm({...connectorForm, specialties: e.target.value})}
                className="w-full bg-zinc-800 text-white px-3 py-2 rounded-lg border border-zinc-600 focus:border-teal-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Social Media (comma-separated)"
                value={connectorForm.socialMedia}
                onChange={(e) => setConnectorForm({...connectorForm, socialMedia: e.target.value})}
                className="w-full bg-zinc-800 text-white px-3 py-2 rounded-lg border border-zinc-600 focus:border-teal-500 focus:outline-none"
              />
              <textarea
                placeholder="Notes"
                value={connectorForm.notes}
                onChange={(e) => setConnectorForm({...connectorForm, notes: e.target.value})}
                className="w-full bg-zinc-800 text-white px-3 py-2 rounded-lg border border-zinc-600 focus:border-teal-500 focus:outline-none"
                rows={3}
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowAddConnector(false)}
                className="flex-1 bg-zinc-600 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addConnector}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Add Connector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Opportunity Modal */}
      {showAddOpportunity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-md w-full">
            <h4 className="text-lg font-semibold text-white mb-4">Add Lounge Opportunity</h4>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Lounge Name"
                value={opportunityForm.name}
                onChange={(e) => setOpportunityForm({...opportunityForm, name: e.target.value})}
                className="w-full bg-zinc-800 text-white px-3 py-2 rounded-lg border border-zinc-600 focus:border-teal-500 focus:outline-none"
              />
              <select 
                value={opportunityForm.connectorId}
                onChange={(e) => setOpportunityForm({...opportunityForm, connectorId: e.target.value})}
                className="w-full bg-zinc-800 text-white px-3 py-2 rounded-lg border border-zinc-600 focus:border-teal-500 focus:outline-none"
              >
                <option value="">Select Connector</option>
                {connectors.map(c => (
                  <option key={c.id} value={c.id}>{c.name} - {c.city}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="City"
                value={opportunityForm.city}
                onChange={(e) => setOpportunityForm({...opportunityForm, city: e.target.value})}
                className="w-full bg-zinc-800 text-white px-3 py-2 rounded-lg border border-zinc-600 focus:border-teal-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Contact Info"
                value={opportunityForm.contactInfo}
                onChange={(e) => setOpportunityForm({...opportunityForm, contactInfo: e.target.value})}
                className="w-full bg-zinc-800 text-white px-3 py-2 rounded-lg border border-zinc-600 focus:border-teal-500 focus:outline-none"
              />
              <input
                type="number"
                placeholder="Estimated Revenue"
                value={opportunityForm.estimatedRevenue}
                onChange={(e) => setOpportunityForm({...opportunityForm, estimatedRevenue: e.target.value})}
                className="w-full bg-zinc-800 text-white px-3 py-2 rounded-lg border border-zinc-600 focus:border-teal-500 focus:outline-none"
              />
              <textarea
                placeholder="Notes"
                value={opportunityForm.notes}
                onChange={(e) => setOpportunityForm({...opportunityForm, notes: e.target.value})}
                className="w-full bg-zinc-800 text-white px-3 py-2 rounded-lg border border-zinc-600 focus:border-teal-500 focus:outline-none"
                rows={2}
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowAddOpportunity(false)}
                className="flex-1 bg-zinc-600 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addOpportunity}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Add Opportunity
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
