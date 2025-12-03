'use client';

import React, { useState } from 'react';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import { Building2, Mail, FileText, CheckCircle, Clock, Users } from 'lucide-react';

export default function ExhibitorOutreachPage() {
  const [exhibitors, setExhibitors] = useState([
    // Sample exhibitor data - in production, fetch from API
    {
      id: '1',
      name: 'Zumizo International',
      company: 'Zumizo International',
      boothNumber: 'A-101',
      category: 'flavor_brand',
      contactStatus: 'not_contacted',
      notes: '',
      lastContact: null
    }
  ]);

  const [selectedExhibitor, setSelectedExhibitor] = useState<string | null>(null);
  const [showMockDashboard, setShowMockDashboard] = useState(false);

  const handleOutreachStep = async (exhibitorId: string, step: 1 | 2 | 3) => {
    // Track outreach step
    // In production, call API to update exhibitor status
    console.log(`Outreach step ${step} for exhibitor ${exhibitorId}`);
  };

  const handleGenerateMockDashboard = async (exhibitorId: string) => {
    setShowMockDashboard(true);
    // In production, call API to generate mock dashboard
    console.log(`Generate mock dashboard for exhibitor ${exhibitorId}`);
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
                {exhibitors.filter(e => e.contactStatus !== 'not_contacted').length}
              </div>
              <p className="text-zinc-400">Contacted</p>
            </div>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-700">
            <div className="p-6 text-center">
              <CheckCircle className="w-8 h-8 text-teal-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-white mb-2">
                {exhibitors.filter(e => e.contactStatus === 'partner').length}
              </div>
              <p className="text-zinc-400">Partners</p>
            </div>
          </Card>
        </div>

        <Card className="bg-zinc-900/50 border-zinc-700">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Exhibitor List</h2>
            
            <div className="space-y-4">
              {exhibitors.map(exhibitor => (
                <div
                  key={exhibitor.id}
                  className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Building2 className="w-5 h-5 text-teal-400" />
                        <h3 className="font-semibold text-white">{exhibitor.name}</h3>
                        <span className="text-sm text-zinc-400">Booth {exhibitor.boothNumber}</span>
                      </div>
                      <p className="text-sm text-zinc-400 mb-2">{exhibitor.company}</p>
                      <div className="flex items-center gap-4 text-xs text-zinc-500">
                        <span>Category: {exhibitor.category}</span>
                        <span>Status: {exhibitor.contactStatus}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOutreachStep(exhibitor.id, 1)}
                      >
                        Step 1
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
          </div>
        </Card>
      </div>
    </div>
  );
}

