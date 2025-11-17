'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Shield, 
  ArrowLeft,
  Users,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  Target,
  MessageSquare,
  Plus,
  Edit,
  Filter,
  Download,
  TrendingUp,
  Building2,
  Zap,
  FileText,
  Send,
  X,
  ChevronRight,
  AlertCircle,
  Star
} from 'lucide-react';
import GlobalNavigation from '../../../components/GlobalNavigation';
import Button from '../../../components/Button';
import Breadcrumbs from '../../../components/Breadcrumbs';
import PageHero from '../../../components/PageHero';
import { BarChart3, Flame } from 'lucide-react';

interface Lead {
  id: string;
  createdAt: string;
  source: string;
  type: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  location: string;
  seatingTypes: string[];
  totalCapacity: string;
  numberOfTables: string;
  currentPOS: string;
  pricingModel: string;
  preferredFeatures: string[];
  stage: 'new-leads' | 'intake' | 'follow-up' | 'scheduled' | 'onboarding' | 'complete';
  notes: Array<{
    id: string;
    content: string;
    author: string;
    createdAt: string;
    type: string;
  }>;
  scheduledFollowUp: string | null;
  lastContacted: string | null;
  assignedTo: string | null;
  selectedTier: string | null;
  conversionProbability: number | null;
}

interface Stats {
  total: number;
  newLeads: number;
  intake: number;
  followUp: number;
  scheduled: number;
  onboarding: number;
  complete: number;
}

export default function OperatorOnboardingPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    newLeads: 0,
    intake: 0,
    followUp: 0,
    scheduled: 0,
    onboarding: 0,
    complete: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [newLeadData, setNewLeadData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    location: '',
    source: 'manual',
    stage: 'new-leads' as Lead['stage']
  });
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    loadLeads();
  }, [selectedStage]);

  const loadLeads = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const url = `/api/admin/operator-onboarding${selectedStage !== 'all' ? `?stage=${selectedStage}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to load onboarding data');
      }

      const data = await response.json();
      setLeads(data.leads || []);
      setStats(data.stats || {
        total: 0,
        newLeads: 0,
        intake: 0,
        followUp: 0,
        scheduled: 0,
        onboarding: 0,
        complete: 0
      });

    } catch (err) {
      console.error('Load leads error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load leads');
    } finally {
      setIsLoading(false);
    }
  };

  const updateLeadStage = async (leadId: string, newStage: Lead['stage']) => {
    try {
      const response = await fetch('/api/admin/operator-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_stage',
          leadId,
          updates: {
            stage: newStage,
            updatedBy: 'admin' // TODO: Get from auth context
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.details || errorData.error || 'Failed to update stage';
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      // Reload leads
      await loadLeads();
      
      // Update selected lead if it's the one being updated
      if (selectedLead && selectedLead.id === leadId) {
        setSelectedLead({ ...selectedLead, stage: newStage });
      }

      // Show success message for stage changes
      if (newStage === 'complete') {
        console.log('✅ Lead marked as complete successfully');
      }

    } catch (err) {
      console.error('Update stage error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update stage. Please try again.';
      alert(`❌ ${errorMessage}\n\n${err instanceof Error && err.message.includes('table') ? 'Note: Database migrations may need to be run.' : ''}`);
    }
  };

  const addNote = async () => {
    if (!selectedLead || !newNote.trim()) return;

    try {
      const response = await fetch('/api/admin/operator-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_note',
          leadId: selectedLead.id,
          updates: {
            note: newNote,
            author: 'admin', // TODO: Get from auth context
            noteType: 'general'
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add note');
      }

      setNewNote('');
      setShowNoteModal(false);
      await loadLeads();
      
      // Refresh selected lead
      const updatedLead = leads.find(l => l.id === selectedLead.id);
      if (updatedLead) {
        setSelectedLead(updatedLead);
      }

    } catch (err) {
      console.error('Add note error:', err);
      alert('Failed to add note. Please try again.');
    }
  };

  const scheduleFollowUp = async () => {
    if (!selectedLead || !scheduleDate) return;

    try {
      const scheduledDateTime = `${scheduleDate}T${scheduleTime || '09:00'}:00`;
      
      const response = await fetch('/api/admin/operator-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'schedule_followup',
          leadId: selectedLead.id,
          updates: {
            scheduledDate: scheduledDateTime,
            scheduledBy: 'admin', // TODO: Get from auth context
            note: newNote || undefined
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to schedule follow-up');
      }

      setScheduleDate('');
      setScheduleTime('');
      setNewNote('');
      setShowScheduleModal(false);
      await loadLeads();

    } catch (err) {
      console.error('Schedule follow-up error:', err);
      alert('Failed to schedule follow-up. Please try again.');
    }
  };

  const createManualLead = async () => {
    if (!newLeadData.businessName || !newLeadData.email) {
      alert('Please fill in required fields (Business Name and Email)');
      return;
    }

    try {
      const response = await fetch('/api/admin/operator-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_lead',
          leadData: {
            ...newLeadData,
            createdAt: new Date().toISOString(),
            type: 'onboarding.signup',
            source: 'manual'
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create lead');
      }

      // Reset form
      setNewLeadData({
        businessName: '',
        ownerName: '',
        email: '',
        phone: '',
        location: '',
        source: 'manual',
        stage: 'new-leads'
      });
      setShowAddLeadModal(false);
      await loadLeads();
    } catch (err) {
      console.error('Create lead error:', err);
      alert('Failed to create lead. Please try again.');
    }
  };

  const markContacted = async (leadId: string, method: 'email' | 'phone' | 'meeting') => {
    try {
      const response = await fetch('/api/admin/operator-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'mark_contacted',
          leadId,
          updates: {
            contactedBy: 'admin', // TODO: Get from auth context
            contactMethod: method,
            note: newNote || undefined
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to mark as contacted');
      }

      setNewNote('');
      await loadLeads();

    } catch (err) {
      console.error('Mark contacted error:', err);
      alert('Failed to mark as contacted. Please try again.');
    }
  };

  const deleteLead = async (leadId: string) => {
    if (!confirm('Are you sure you want to delete this lead? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/operator-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_lead',
          leadId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to delete lead');
      }

      await loadLeads();
      setSelectedLeadIds(new Set());
    } catch (err) {
      console.error('Delete lead error:', err);
      alert('Failed to delete lead. Please try again.');
    }
  };

  const handleSelectLead = (leadId: string, checked: boolean) => {
    const newSelected = new Set(selectedLeadIds);
    if (checked) {
      newSelected.add(leadId);
    } else {
      newSelected.delete(leadId);
    }
    setSelectedLeadIds(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeadIds(new Set(leads.map(l => l.id)));
      setShowBulkActions(true);
    } else {
      setSelectedLeadIds(new Set());
      setShowBulkActions(false);
    }
  };

  const bulkDeleteLeads = async () => {
    if (selectedLeadIds.size === 0) return;

    if (!confirm(`Are you sure you want to delete ${selectedLeadIds.size} lead(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/operator-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulk_delete',
          leadIds: Array.from(selectedLeadIds)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to delete leads');
      }

      await loadLeads();
      setSelectedLeadIds(new Set());
      setShowBulkActions(false);
    } catch (err) {
      console.error('Bulk delete error:', err);
      alert('Failed to delete leads. Please try again.');
    }
  };

  const getStageColor = (stage: Lead['stage']) => {
    switch (stage) {
      case 'new-leads': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'intake': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'follow-up': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'scheduled': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'onboarding': return 'bg-teal-500/20 text-teal-400 border-teal-500/30';
      case 'complete': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
    }
  };

  const getStageIcon = (stage: Lead['stage']) => {
    switch (stage) {
      case 'new-leads': return <Target className="w-4 h-4" />;
      case 'intake': return <Users className="w-4 h-4" />;
      case 'follow-up': return <Mail className="w-4 h-4" />;
      case 'scheduled': return <Calendar className="w-4 h-4" />;
      case 'onboarding': return <Zap className="w-4 h-4" />;
      case 'complete': return <CheckCircle className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
        <GlobalNavigation />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-4 text-zinc-400">Loading operator onboarding data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <Breadcrumbs className="mb-6" />
        
        {/* Page Hero */}
        <PageHero
          headline="Operator Onboarding Management"
          subheadline="Track leads from intake through onboarding completion. Manage your sales pipeline and convert prospects into active operators."
          benefit={{
            value: `${stats.total} Total Leads`,
            description: `${stats.newLeads} new leads requiring attention`,
            icon: <Users className="w-5 h-5 text-teal-400" />
          }}
          primaryCTA={{
            text: 'Add New Lead',
            onClick: () => setShowAddLeadModal(true)
          }}
          secondaryCTA={{
            text: 'View Analytics',
            href: '/analytics'
          }}
          trustIndicators={[
            { icon: <BarChart3 className="w-4 h-4" />, text: `${stats.complete} Completed` },
            { icon: <TrendingUp className="w-4 h-4" />, text: `${stats.onboarding} In Progress` }
          ]}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-8">
          <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-sm text-zinc-400">Total Leads</div>
          </div>
          <div className="bg-cyan-500/20 border border-cyan-500/30 rounded-xl p-4">
            <div className="text-2xl font-bold text-cyan-400">{stats.newLeads}</div>
            <div className="text-sm text-zinc-400">New Leads</div>
          </div>
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4">
            <div className="text-2xl font-bold text-blue-400">{stats.intake}</div>
            <div className="text-sm text-zinc-400">Intake</div>
          </div>
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4">
            <div className="text-2xl font-bold text-yellow-400">{stats.followUp}</div>
            <div className="text-sm text-zinc-400">Follow-up</div>
          </div>
          <div className="bg-purple-500/20 border border-purple-500/30 rounded-xl p-4">
            <div className="text-2xl font-bold text-purple-400">{stats.scheduled}</div>
            <div className="text-sm text-zinc-400">Scheduled</div>
          </div>
          <div className="bg-teal-500/20 border border-teal-500/30 rounded-xl p-4">
            <div className="text-2xl font-bold text-teal-400">{stats.onboarding}</div>
            <div className="text-sm text-zinc-400">Onboarding</div>
          </div>
          <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4">
            <div className="text-2xl font-bold text-green-400">{stats.complete}</div>
            <div className="text-sm text-zinc-400">Complete</div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-zinc-400" />
            <span className="text-sm text-zinc-400">Filter by Stage:</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'new-leads', 'intake', 'follow-up', 'scheduled', 'onboarding', 'complete'] as const).map((stage) => (
              <button
                key={stage}
                onClick={() => setSelectedStage(stage)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedStage === stage
                    ? 'bg-teal-600 text-white'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                {stage === 'all' ? 'All' : stage === 'new-leads' ? 'New Leads' : stage.charAt(0).toUpperCase() + stage.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-xl">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400">{error}</span>
            </div>
          </div>
        )}

        {/* Bulk Actions Bar */}
        {showBulkActions && selectedLeadIds.size > 0 && (
          <div className="mb-4 p-4 bg-teal-600/20 border border-teal-500/30 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-teal-400 font-medium">
                {selectedLeadIds.size} lead(s) selected
              </span>
              <button
                onClick={bulkDeleteLeads}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
              >
                Delete Selected
              </button>
              <button
                onClick={() => {
                  setSelectedLeadIds(new Set());
                  setShowBulkActions(false);
                }}
                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors text-sm"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}

        {/* Leads Table */}
        <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-zinc-700 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Leads ({leads.length})</h2>
            <div className="flex items-center gap-3">
              {selectedLeadIds.size > 0 && (
                <button
                  onClick={bulkDeleteLeads}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                >
                  <X className="w-4 h-4" />
                  <span>Delete Selected ({selectedLeadIds.size})</span>
                </button>
              )}
              <button
                onClick={() => setShowAddLeadModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Lead</span>
              </button>
            </div>
          </div>
          
          {leads.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400">No leads found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedLeadIds.size === leads.length && leads.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="w-4 h-4 text-teal-600 bg-zinc-700 border-zinc-600 rounded focus:ring-teal-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Business</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Source</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Stage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-700">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedLeadIds.has(lead.id)}
                          onChange={(e) => handleSelectLead(lead.id, e.target.checked)}
                          className="w-4 h-4 text-teal-600 bg-zinc-700 border-zinc-600 rounded focus:ring-teal-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-white">{lead.businessName}</div>
                        <div className="text-sm text-zinc-400">{lead.ownerName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-zinc-300">
                          <Mail className="w-4 h-4" />
                          <span>{lead.email}</span>
                        </div>
                        {lead.phone !== 'No phone' && (
                          <div className="flex items-center gap-2 text-sm text-zinc-400 mt-1">
                            <Phone className="w-4 h-4" />
                            <span>{lead.phone}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-zinc-300">
                          <MapPin className="w-4 h-4" />
                          <span>{lead.location}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-zinc-700 text-zinc-300 text-xs rounded-full">
                          {lead.source}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={lead.stage}
                          onChange={(e) => updateLeadStage(lead.id, e.target.value as Lead['stage'])}
                          className={`px-3 py-1 rounded-lg text-xs font-medium border ${getStageColor(lead.stage)} bg-transparent cursor-pointer`}
                        >
                          <option value="intake">Intake</option>
                          <option value="follow-up">Follow-up</option>
                          <option value="scheduled">Scheduled</option>
                          <option value="onboarding">Onboarding</option>
                          <option value="complete">Complete</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">
                        {formatDate(lead.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedLead(lead);
                              setShowLeadModal(true);
                            }}
                            className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white text-xs rounded-lg transition-colors"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => deleteLead(lead.id)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors"
                            title="Delete lead"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Lead Detail Modal */}
      {showLeadModal && selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => {
            setShowLeadModal(false);
            setSelectedLead(null);
          }}
          onUpdateStage={updateLeadStage}
          onAddNote={() => {
            setShowNoteModal(true);
          }}
          onScheduleFollowUp={() => {
            setShowScheduleModal(true);
          }}
          onMarkContacted={markContacted}
        />
      )}

      {/* Add Note Modal */}
      {showNoteModal && selectedLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Add Note</h3>
              <button
                onClick={() => {
                  setShowNoteModal(false);
                  setNewNote('');
                }}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Enter your note..."
              className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              rows={4}
            />
            <div className="flex gap-3 mt-4">
              <Button
                onClick={addNote}
                className="flex-1"
                disabled={!newNote.trim()}
              >
                Add Note
              </Button>
              <Button
                onClick={() => {
                  setShowNoteModal(false);
                  setNewNote('');
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Follow-up Modal */}
      {showScheduleModal && selectedLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Schedule Follow-up</h3>
              <button
                onClick={() => {
                  setShowScheduleModal(false);
                  setScheduleDate('');
                  setScheduleTime('');
                  setNewNote('');
                }}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Date</label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Time</label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Note (Optional)</label>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note about this follow-up..."
                  className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                onClick={scheduleFollowUp}
                className="flex-1"
                disabled={!scheduleDate}
              >
                Schedule
              </Button>
              <Button
                onClick={() => {
                  setShowScheduleModal(false);
                  setScheduleDate('');
                  setScheduleTime('');
                  setNewNote('');
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {showAddLeadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Add New Lead</h3>
              <button
                onClick={() => {
                  setShowAddLeadModal(false);
                  setNewLeadData({
                    businessName: '',
                    ownerName: '',
                    email: '',
                    phone: '',
                    location: '',
                    source: 'manual',
                    stage: 'new-leads'
                  });
                }}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Business Name *</label>
                <input
                  type="text"
                  value={newLeadData.businessName}
                  onChange={(e) => setNewLeadData({ ...newLeadData, businessName: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter business name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Owner Name</label>
                <input
                  type="text"
                  value={newLeadData.ownerName}
                  onChange={(e) => setNewLeadData({ ...newLeadData, ownerName: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter owner name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Email *</label>
                <input
                  type="email"
                  value={newLeadData.email}
                  onChange={(e) => setNewLeadData({ ...newLeadData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Phone</label>
                <input
                  type="tel"
                  value={newLeadData.phone}
                  onChange={(e) => setNewLeadData({ ...newLeadData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Location</label>
                <input
                  type="text"
                  value={newLeadData.location}
                  onChange={(e) => setNewLeadData({ ...newLeadData, location: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter location"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Initial Stage</label>
                <select
                  value={newLeadData.stage}
                  onChange={(e) => setNewLeadData({ ...newLeadData, stage: e.target.value as Lead['stage'] })}
                  className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="new-leads">New Leads</option>
                  <option value="intake">Intake</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="onboarding">Onboarding</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                onClick={createManualLead}
                className="flex-1"
                disabled={!newLeadData.businessName || !newLeadData.email}
              >
                Create Lead
              </Button>
              <Button
                onClick={() => {
                  setShowAddLeadModal(false);
                  setNewLeadData({
                    businessName: '',
                    ownerName: '',
                    email: '',
                    phone: '',
                    location: '',
                    source: 'manual',
                    stage: 'new-leads'
                  });
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Related Features */}
      <div className="mt-16 border-t border-zinc-800 pt-8">
        <h3 className="text-lg font-semibold text-white mb-4">Related Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/analytics"
            className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700 hover:border-teal-500/50 transition-colors"
          >
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-5 h-5 text-teal-400" />
              <span className="font-medium text-white">Analytics Dashboard</span>
            </div>
            <p className="text-sm text-zinc-400">View detailed analytics and reports</p>
          </Link>
          <Link
            href="/sessions"
            className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700 hover:border-teal-500/50 transition-colors"
          >
            <div className="flex items-center gap-3 mb-2">
              <Flame className="w-5 h-5 text-orange-400" />
              <span className="font-medium text-white">Sessions</span>
            </div>
            <p className="text-sm text-zinc-400">Manage active lounge sessions</p>
          </Link>
          <Link
            href="/admin"
            className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700 hover:border-teal-500/50 transition-colors"
          >
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-red-400" />
              <span className="font-medium text-white">Admin Control Center</span>
            </div>
            <p className="text-sm text-zinc-400">System administration and management</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Lead Detail Modal Component
function LeadDetailModal({
  lead,
  onClose,
  onUpdateStage,
  onAddNote,
  onScheduleFollowUp,
  onMarkContacted
}: {
  lead: Lead;
  onClose: () => void;
  onUpdateStage: (leadId: string, stage: Lead['stage']) => void;
  onAddNote: () => void;
  onScheduleFollowUp: () => void;
  onMarkContacted: (leadId: string, method: 'email' | 'phone' | 'meeting') => void;
}) {
  const getStageColor = (stage: Lead['stage']) => {
    switch (stage) {
      case 'intake': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'follow-up': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'scheduled': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'onboarding': return 'bg-teal-500/20 text-teal-400 border-teal-500/30';
      case 'complete': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-800 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">{lead.businessName}</h2>
            <p className="text-zinc-400">{lead.ownerName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="bg-zinc-900/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-zinc-400" />
                  <span className="text-zinc-300">{lead.email}</span>
                </div>
                {lead.phone !== 'No phone' && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-zinc-400" />
                    <span className="text-zinc-300">{lead.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-zinc-400" />
                  <span className="text-zinc-300">{lead.location}</span>
                </div>
              </div>
            </div>

            {/* Business Details */}
            <div className="bg-zinc-900/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Business Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Capacity:</span>
                  <span className="text-white">{lead.totalCapacity} seats</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Tables:</span>
                  <span className="text-white">{lead.numberOfTables}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Current POS:</span>
                  <span className="text-white">{lead.currentPOS}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Pricing Model:</span>
                  <span className="text-white">{lead.pricingModel}</span>
                </div>
                {lead.seatingTypes.length > 0 && (
                  <div>
                    <span className="text-zinc-400">Seating Types:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {lead.seatingTypes.map((type, idx) => (
                        <span key={idx} className="px-2 py-1 bg-zinc-700 text-zinc-300 text-xs rounded-full">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Stage Management */}
            <div className="bg-zinc-900/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Stage Management</h3>
              <select
                value={lead.stage}
                onChange={(e) => onUpdateStage(lead.id, e.target.value as Lead['stage'])}
                className={`w-full px-4 py-2 rounded-lg border ${getStageColor(lead.stage)} bg-transparent`}
              >
                <option value="intake">Intake</option>
                <option value="follow-up">Follow-up</option>
                <option value="scheduled">Scheduled</option>
                <option value="onboarding">Onboarding</option>
                <option value="complete">Complete</option>
              </select>
              
              {lead.scheduledFollowUp && (
                <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-purple-400">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">Follow-up Scheduled</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    {new Date(lead.scheduledFollowUp).toLocaleString()}
                  </p>
                </div>
              )}

              {lead.lastContacted && (
                <div className="mt-4 p-3 bg-teal-500/10 border border-teal-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-teal-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">Last Contacted</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    {new Date(lead.lastContacted).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-zinc-900/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button
                  onClick={() => onMarkContacted(lead.id, 'email')}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Mark Contacted (Email)
                </Button>
                <Button
                  onClick={() => onMarkContacted(lead.id, 'phone')}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Mark Contacted (Phone)
                </Button>
                <Button
                  onClick={onScheduleFollowUp}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Follow-up
                </Button>
                <Button
                  onClick={onAddNote}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Add Note
                </Button>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-zinc-900/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Notes</h3>
              {lead.notes.length === 0 ? (
                <p className="text-zinc-400 text-sm">No notes yet</p>
              ) : (
                <div className="space-y-3">
                  {lead.notes.map((note) => (
                    <div key={note.id} className="p-3 bg-zinc-800 rounded-lg border border-zinc-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-zinc-400">{note.author}</span>
                        <span className="text-xs text-zinc-500">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-300">{note.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

