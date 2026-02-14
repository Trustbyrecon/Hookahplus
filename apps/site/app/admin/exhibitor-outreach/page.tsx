'use client';

import React, { useState, useEffect } from 'react';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import { Building2, Mail, FileText, CheckCircle, Clock, Users, RefreshCw, Plus, AlertCircle } from 'lucide-react';

interface Exhibitor {
  id: string;
  name: string;
  company: string;
  boothNumber?: string;
  category: string;
  contactStatus: 'new' | 'emailed_1' | 'emailed_2' | 'followed_up_linkedin' | 'mock_dashboard_sent' | 'partnered' | 'rejected';
  notes?: string;
  email?: string;
  linkedinUrl?: string;
  website?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function ExhibitorOutreachPage() {
  const [exhibitors, setExhibitors] = useState<Exhibitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExhibitor, setSelectedExhibitor] = useState<string | null>(null);
  const [showMockDashboard, setShowMockDashboard] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExhibitor, setNewExhibitor] = useState<Partial<Exhibitor>>({
    category: 'flavor',
    contactStatus: 'new',
  });

  // Fetch exhibitors from API
  const fetchExhibitors = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/exhibitor-outreach');
      if (!response.ok) {
        throw new Error('Failed to fetch exhibitors');
      }
      const data = await response.json();
      setExhibitors(data.exhibitors || []);
    } catch (err) {
      console.error('Error fetching exhibitors:', err);
      setError(err instanceof Error ? err.message : 'Failed to load exhibitors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExhibitors();
  }, []);

  const handleOutreachStep = async (exhibitorId: string, step: 1 | 2 | 3) => {
    try {
      const statusMap: Record<number, Exhibitor['contactStatus']> = {
        1: 'emailed_1',
        2: 'emailed_2',
        3: 'followed_up_linkedin',
      };

      const response = await fetch('/api/admin/exhibitor-outreach', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: exhibitorId,
          updates: { contactStatus: statusMap[step] },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update exhibitor status');
      }

      await fetchExhibitors();
    } catch (err) {
      console.error('Error updating exhibitor status:', err);
      alert('Failed to update exhibitor status. Please try again.');
    }
  };

  const handleGenerateMockDashboard = async (exhibitorId: string) => {
    try {
      const exhibitor = exhibitors.find(e => e.id === exhibitorId);
      if (!exhibitor) return;

      const response = await fetch('/api/admin/exhibitor-outreach/mock-dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exhibitorName: exhibitor.company,
          logoUrl: exhibitor.website,
          brandColor: 'teal',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate mock dashboard');
      }

      const data = await response.json();
      setShowMockDashboard(true);
      alert(`Mock dashboard generated! URL: ${data.mockDashboardUrl}`);
    } catch (err) {
      console.error('Error generating mock dashboard:', err);
      alert('Failed to generate mock dashboard. Please try again.');
    }
  };

  const handleAddExhibitor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/exhibitor-outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExhibitor),
      });

      if (!response.ok) {
        throw new Error('Failed to add exhibitor');
      }

      await fetchExhibitors();
      setShowAddModal(false);
      setNewExhibitor({ category: 'flavor', contactStatus: 'new' });
    } catch (err) {
      console.error('Error adding exhibitor:', err);
      alert('Failed to add exhibitor. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Exhibitor Outreach Management</h1>
          <p className="text-zinc-400">Manage World Shisha 2026 exhibitor outreach and partnerships</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-zinc-900/50 border-zinc-700">
            <div className="p-6 text-center">
              <Users className="w-8 h-8 text-teal-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-white mb-2">{exhibitors.length}</div>
              <p className="text-zinc-400">Total Exhibitors</p>
            </div>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-700">
            <div className="p-6 text-center">
              <Mail className="w-8 h-8 text-teal-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-white mb-2">
                {exhibitors.filter(e => e.contactStatus !== 'new').length}
              </div>
              <p className="text-zinc-400">Contacted</p>
            </div>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-700">
            <div className="p-6 text-center">
              <CheckCircle className="w-8 h-8 text-teal-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-white mb-2">
                {exhibitors.filter(e => e.contactStatus === 'partnered').length}
              </div>
              <p className="text-zinc-400">Partners</p>
            </div>
          </Card>
        </div>

        <Card className="bg-zinc-900/50 border-zinc-700">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Exhibitor List</h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={fetchExhibitors}
                  leftIcon={<RefreshCw className="w-4 h-4" />}
                >
                  Refresh
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setShowAddModal(true)}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Add Exhibitor
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12 text-zinc-400">Loading exhibitors...</div>
            ) : error ? (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <div>
                  <p className="text-red-400 font-semibold">Error loading exhibitors</p>
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              </div>
            ) : exhibitors.length === 0 ? (
              <div className="text-center py-12 text-zinc-400">
                <Users className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
                <p>No exhibitors found. Add one to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {exhibitors.map(exhibitor => (
                  <div
                    key={exhibitor.id}
                    className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700 hover:border-teal-500/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Building2 className="w-5 h-5 text-teal-400" />
                          <h3 className="font-semibold text-white">{exhibitor.name || exhibitor.company}</h3>
                          {exhibitor.boothNumber && (
                            <span className="text-sm text-zinc-400">Booth {exhibitor.boothNumber}</span>
                          )}
                        </div>
                        <p className="text-sm text-zinc-400 mb-2">{exhibitor.company}</p>
                        <div className="flex items-center gap-4 text-xs text-zinc-500">
                          <span>Category: {exhibitor.category}</span>
                          <span>Status: <span className="text-teal-400 capitalize">{exhibitor.contactStatus.replace(/_/g, ' ')}</span></span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOutreachStep(exhibitor.id, 1)}
                          disabled={exhibitor.contactStatus !== 'new'}
                        >
                          Step 1
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOutreachStep(exhibitor.id, 2)}
                          disabled={exhibitor.contactStatus !== 'emailed_1'}
                        >
                          Step 2
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGenerateMockDashboard(exhibitor.id)}
                        >
                          Mock Dashboard
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Add Exhibitor Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="bg-zinc-900 border-zinc-700 max-w-2xl w-full">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Add New Exhibitor</h2>
                <form onSubmit={handleAddExhibitor} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Company Name *</label>
                    <input
                      type="text"
                      value={newExhibitor.company || ''}
                      onChange={(e) => setNewExhibitor({ ...newExhibitor, company: e.target.value })}
                      required
                      className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Contact Person Name *</label>
                    <input
                      type="text"
                      value={newExhibitor.name || ''}
                      onChange={(e) => setNewExhibitor({ ...newExhibitor, name: e.target.value })}
                      required
                      className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Email *</label>
                    <input
                      type="email"
                      value={newExhibitor.email || ''}
                      onChange={(e) => setNewExhibitor({ ...newExhibitor, email: e.target.value })}
                      required
                      className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Booth Number</label>
                    <input
                      type="text"
                      value={newExhibitor.boothNumber || ''}
                      onChange={(e) => setNewExhibitor({ ...newExhibitor, boothNumber: e.target.value })}
                      className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Category *</label>
                    <select
                      value={newExhibitor.category || 'flavor'}
                      onChange={(e) => setNewExhibitor({ ...newExhibitor, category: e.target.value })}
                      required
                      className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                    >
                      <option value="flavor">Flavor Brand</option>
                      <option value="charcoal">Charcoal Brand</option>
                      <option value="hardware">Hardware/Accessory</option>
                      <option value="distributor">Distributor</option>
                      <option value="furniture">Lounge Furniture/Design</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary">
                      Add Exhibitor
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

