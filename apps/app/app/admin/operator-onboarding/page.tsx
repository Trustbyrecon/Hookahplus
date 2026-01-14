'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Star,
  Link as LinkIcon,
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';
import GlobalNavigation from '../../../components/GlobalNavigation';
import Button from '../../../components/Button';
import Breadcrumbs from '../../../components/Breadcrumbs';
import PageHero from '../../../components/PageHero';
import MenuExtractor from '../../../components/MenuExtractor';
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
  menuLink?: string | null;
  baseHookahPrice?: string | null;
  refillPrice?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  websiteUrl?: string | null;
  demoLink?: string | null;
  instagramScrapedData?: {
    menuItems?: Array<{ name: string; price?: number; description?: string }>;
    flavors?: string[];
    basePrice?: number;
    refillPrice?: number;
    extractedAt?: string;
    source?: string;
  } | null;
  menuFiles?: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
    filePath?: string;
    fileType: string;
    fileSize: number;
    uploadedAt: string;
    status?: string;
  }> | null;
  extractedMenuData?: {
    basePrice?: number;
    refillPrice?: number;
    flavors: string[];
    sections: string[];
    menuItems?: Array<{ name: string; price?: number; description?: string }>;
    notes?: string;
  } | null;
}

interface Stats {
  total: number;
  newLeads: number;
  intake: number;
  followUp: number;
  scheduled: number;
  onboarding: number;
  complete: number;
  demoActivity?: {
    total: number;
    guestDemo: number;
    controlPanel: number;
    recent: number;
  };
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
    instagramUrl: '',
    facebookUrl: '',
    websiteUrl: '',
    source: 'manual',
    stage: 'new-leads' as Lead['stage']
  });
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionStatus, setExtractionStatus] = useState<string | null>(null);
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showTestLinkModal, setShowTestLinkModal] = useState(false);
  const [testLinkUrl, setTestLinkUrl] = useState('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const actionMessageTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadLeads();
  }, [selectedStage]);

  useEffect(() => {
    return () => {
      if (actionMessageTimeout.current) {
        clearTimeout(actionMessageTimeout.current);
      }
    };
  }, []);

  const showActionMessage = (message: string) => {
    setActionMessage(message);
    if (actionMessageTimeout.current) {
      clearTimeout(actionMessageTimeout.current);
    }
    actionMessageTimeout.current = setTimeout(() => {
      setActionMessage(null);
    }, 4000);
  };

  const loadLeads = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const url = `/api/admin/operator-onboarding${selectedStage === 'demo' ? '?demo=true' : selectedStage !== 'all' ? `?stage=${selectedStage}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to load onboarding data');
      }

      const data = await response.json();
      
      // Log diagnostic info if no leads found
      if (data.leads && data.leads.length === 0) {
        console.log('[Operator Onboarding] No leads found. Check /api/admin/operator-onboarding/debug for diagnostic info.');
      }
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
      showActionMessage(`Stage updated to ${newStage.replace('-', ' ')}`);

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
      showActionMessage('Note added');

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
      showActionMessage('Follow-up scheduled');

    } catch (err) {
      console.error('Schedule follow-up error:', err);
      alert('Failed to schedule follow-up. Please try again.');
    }
  };

  const extractSocialMediaInfo = async () => {
    const hasSocialLinks = newLeadData.instagramUrl || newLeadData.facebookUrl || newLeadData.websiteUrl;
    if (!hasSocialLinks) {
      alert('Please enter at least one social media link (Instagram, Facebook, or Website)');
      return;
    }

    setIsExtracting(true);
    setExtractionStatus('Extracting information from social media...');

    try {
      const response = await fetch('/api/admin/operator-onboarding/extract-social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instagramUrl: newLeadData.instagramUrl,
          facebookUrl: newLeadData.facebookUrl,
          websiteUrl: newLeadData.websiteUrl
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to extract information');
      }

      // Auto-populate form fields with extracted data
      if (data.extracted) {
        setNewLeadData(prev => ({
          ...prev,
          businessName: prev.businessName || data.extracted.businessName || '',
          ownerName: prev.ownerName || data.extracted.ownerName || '',
          email: prev.email || data.extracted.email || '',
          phone: prev.phone || data.extracted.phone || '',
          location: prev.location || data.extracted.location || '',
          instagramUrl: prev.instagramUrl || data.extracted.instagramUrl || '',
          facebookUrl: prev.facebookUrl || data.extracted.facebookUrl || '',
          websiteUrl: prev.websiteUrl || data.extracted.websiteUrl || ''
        }));
        setExtractionStatus('✅ Information extracted successfully! Form fields updated.');
        setTimeout(() => setExtractionStatus(null), 3000);
      } else {
        setExtractionStatus('⚠️ No information could be extracted. You can still fill the form manually.');
        setTimeout(() => setExtractionStatus(null), 3000);
      }
    } catch (err) {
      console.error('Extraction error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to extract information';
      setExtractionStatus(`❌ ${errorMessage}`);
      setTimeout(() => setExtractionStatus(null), 5000);
    } finally {
      setIsExtracting(false);
    }
  };

  const createManualLead = async () => {
    if (!newLeadData.businessName) {
      alert('Please fill in required field: Business Name');
      return;
    }
    
    // Email is optional - if not provided, use placeholder for IG DM workflow
    if (!newLeadData.email) {
      const proceed = confirm('No email provided. This lead will be stored for Instagram DM workflow. Continue?');
      if (!proceed) return;
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

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.details || data.error || 'Failed to create lead';
        console.error('Create lead error:', {
          status: response.status,
          error: data.error,
          details: data.details,
          hint: data.hint,
          stack: data.stack
        });
        alert(`Failed to create lead: ${errorMsg}${data.hint ? `\n\nHint: ${data.hint}` : ''}`);
        return;
      }

      // Reset form
      const createdLeadId = data.leadId || data.lead?.id;
      setNewLeadData({
        businessName: '',
        ownerName: '',
        email: '',
        phone: '',
        location: '',
        instagramUrl: '',
        facebookUrl: '',
        websiteUrl: '',
        source: 'manual',
        stage: 'new-leads'
      });
      setShowAddLeadModal(false);
      await loadLeads();
      showActionMessage('Manual lead created');
      
      // Optionally prompt to send test link after lead is created
      if (createdLeadId) {
        setTimeout(() => {
          if (confirm('Lead created successfully! Would you like to send a test link email now?')) {
            // Find the newly created lead
            const newLead = leads.find(l => l.id === createdLeadId);
            if (newLead) {
              setSelectedLead(newLead);
              setShowTestLinkModal(true);
            } else {
              // Reload leads to get the new one
              loadLeads().then(() => {
                const updatedLeads = leads;
                const foundLead = updatedLeads.find(l => l.id === createdLeadId);
                if (foundLead) {
                  setSelectedLead(foundLead);
                  setShowTestLinkModal(true);
                }
              });
            }
          }
        }, 500);
      }
    } catch (err) {
      console.error('Create lead error:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to create lead. Please try again.';
      alert(errorMsg);
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
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.details || errorData.error || 'Failed to mark as contacted';
        throw new Error(errorMessage);
      }

      const result = await response.json();
      setNewNote('');
      await loadLeads();
      showActionMessage(`Marked contacted via ${method}`);

    } catch (err) {
      console.error('Mark contacted error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark as contacted. Please try again.';
      alert(`❌ ${errorMessage}`);
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

  const createDemoSession = async () => {
    if (!selectedLead) return;

    try {
      const response = await fetch('/api/admin/operator-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_demo_session',
          leadId: selectedLead.id
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        const message = data.error || data.details || 'Failed to create demo session';
        throw new Error(message);
      }

      // Update test link URL with generated link
      if (data.demoLink) {
        setTestLinkUrl(data.demoLink);
        showActionMessage(`Demo session created: ${data.demoLink}`);
        // Show info about the generated link
        const isLocalhost = data.demoLink.includes('localhost');
        const linkType = isLocalhost 
          ? 'This link will work on your local machine. For production, set NEXT_PUBLIC_APP_URL environment variable.'
          : 'This link will work for the recipient.';
        alert(`✅ Demo session created!\n\nGenerated Link: ${data.demoLink}\n\n${linkType}\n\nYou can now send the test link email.`);
      } else {
        showActionMessage('Demo session created but no link returned');
        alert('✅ Demo session created, but no link was returned. Please check the console for details.');
      }
    } catch (err) {
      console.error('Create demo session error:', err);
      alert(err instanceof Error ? err.message : 'Failed to create demo session. Please try again.');
    }
  };

  const sendTestLinkEmail = async () => {
    if (!selectedLead) {
      alert('Please select a lead first');
      return;
    }

    try {
      const response = await fetch('/api/admin/operator-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_test_link',
          leadId: selectedLead.id,
          testLink: testLinkUrl.trim() || undefined // Optional - backend will auto-generate if not provided
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        const message = data.error || data.details || 'Failed to send test link email';
        throw new Error(message);
      }

      alert('✅ Test link email sent successfully.');
      setShowTestLinkModal(false);
      setTestLinkUrl('');
      await loadLeads(); // Refresh to show updated lead
      showActionMessage('Test link email sent');
    } catch (err) {
      console.error('Send test link error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to send test link email. Please try again.';
      
      // Provide helpful guidance for missing API key
      if (errorMessage.includes('RESEND_API_KEY') || errorMessage.includes('not configured')) {
        alert(
          `❌ Email service not configured\n\n` +
          `To enable email sending:\n` +
          `1. Get your Resend API key from: https://resend.com/api-keys\n` +
          `2. Add it to your .env.local file:\n` +
          `   RESEND_API_KEY=re_your_key_here\n` +
          `3. Restart your development server\n\n` +
          `Note: Your .env.local file is already in .gitignore and will not be committed.`
        );
      } else {
        alert(`❌ ${errorMessage}`);
      }
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
        <div className={`grid grid-cols-2 ${stats.demoActivity ? 'md:grid-cols-8' : 'md:grid-cols-7'} gap-4 mb-8`}>
          <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-sm text-zinc-400">Total Leads</div>
          </div>
          {stats.demoActivity && (
            <div className="bg-purple-500/20 border border-purple-500/30 rounded-xl p-4">
              <div className="text-2xl font-bold text-purple-400">{stats.demoActivity.total}</div>
              <div className="text-sm text-zinc-400">Demo Activity</div>
              {stats.demoActivity.recent > 0 && (
                <div className="text-xs text-purple-300 mt-1">{stats.demoActivity.recent} in last 24h</div>
              )}
            </div>
          )}
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
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-zinc-400" />
              <span className="text-sm text-zinc-400">Filter by Stage:</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['all', 'demo', 'new-leads', 'intake', 'follow-up', 'scheduled', 'onboarding', 'complete'] as const).map((stage) => (
                <button
                  key={stage}
                  onClick={() => setSelectedStage(stage)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedStage === stage
                      ? stage === 'demo' ? 'bg-purple-600 text-white' : 'bg-teal-600 text-white'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  {stage === 'all' ? 'All' : 
                   stage === 'demo' ? `🎯 Demo Activity${stats.demoActivity?.total ? ` (${stats.demoActivity.total})` : ''}` :
                   stage === 'new-leads' ? 'New Leads' : 
                   stage.charAt(0).toUpperCase() + stage.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={async () => {
              try {
                setIsLoading(true);
                const response = await fetch('/api/admin/operator-onboarding/debug?limit=1000');
                const data = await response.json();
                if (data.success) {
                  console.log('🔍 Diagnostic Results:', data.summary);
                  console.log('📋 All Events:', data.allLeads);
                  console.log('✅ Potential Leads:', data.potentialLeads);
                  alert(`Found ${data.summary.totalEvents} total events, ${data.summary.potentialLeads} potential leads.\n\nCheck browser console (F12) for full details.\n\nBy Type: ${JSON.stringify(data.summary.byType, null, 2)}`);
                } else {
                  alert(`Error: ${data.error || 'Failed to query database'}\n\nDetails: ${data.details || 'No details available'}`);
                }
              } catch (err) {
                console.error('Diagnostic query error:', err);
                alert('Failed to run diagnostic query. Check console for details.');
              } finally {
                setIsLoading(false);
              }
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2 text-sm"
            title="Query all leads in database (bypasses filters)"
          >
            <Zap className="w-4 h-4" />
            <span>Find All Leads (Debug)</span>
          </button>
          <button
            onClick={() => {
              // Download CSV export
              window.open('/api/admin/operator-onboarding/export', '_blank');
            }}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2 text-sm"
            title="Export all leads to CSV (for Google Sheets, Notion, etc.)"
          >
            <Download className="w-4 h-4" />
            <span>Export to CSV</span>
          </button>
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

        {actionMessage && (
          <div className="mb-6 px-4 py-3 rounded-lg border border-teal-500/40 bg-teal-500/10 text-sm text-teal-200 shadow-lg">
            {actionMessage}
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
                        <div className="flex flex-col gap-1">
                          <span className="px-2 py-1 bg-zinc-700 text-zinc-300 text-xs rounded-full">
                            {lead.source}
                          </span>
                          {(lead.source === 'guest_demo' || lead.source === 'guest_control_panel') && (
                            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30">
                              🎯 Demo
                            </span>
                          )}
                        </div>
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
                          {(lead.source === 'guest_demo' || lead.source === 'guest_control_panel') && (
                            <>
                              <button
                                onClick={() => {
                                  updateLeadStage(lead.id, 'intake');
                                  showActionMessage(`Moved ${lead.businessName} to Intake`);
                                }}
                                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors"
                                title="Move to Intake"
                              >
                                Intake
                              </button>
                              <button
                                onClick={async () => {
                                  try {
                                    const response = await fetch('/api/admin/operator-onboarding', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        action: 'create_demo_session',
                                        leadId: lead.id,
                                        businessName: lead.businessName
                                      })
                                    });
                                    const data = await response.json();
                                    if (data.success && data.demoLink) {
                                      showActionMessage('Demo session created! Link copied to clipboard.');
                                      navigator.clipboard.writeText(data.demoLink);
                                    } else {
                                      showActionMessage(data.error || 'Failed to create demo session');
                                    }
                                  } catch (err) {
                                    showActionMessage('Failed to create demo session');
                                  }
                                }}
                                className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-lg transition-colors"
                                title="Create Demo Session"
                              >
                                Demo
                              </button>
                            </>
                          )}
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
                            onClick={() => {
                              setSelectedLead(lead);
                              setShowTestLinkModal(true);
                              if (!testLinkUrl && lead.businessName) {
                                const slug = lead.businessName
                                  .toLowerCase()
                                  .replace(/[^a-z0-9]+/g, '-')
                                  .replace(/^-+|-+$/g, '');
                                const base =
                                  process.env.NEXT_PUBLIC_APP_URL || 'https://app.hookahplus.net';
                                setTestLinkUrl(`${base}/demo/${slug || 'your-lounge'}`);
                              }
                            }}
                            className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 text-white text-xs rounded-lg transition-colors"
                            title="Send test link email"
                          >
                            <Send className="w-3 h-3" />
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
          showActionMessage={showActionMessage}
          loadLeads={loadLeads}
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
          <div className="bg-zinc-800 rounded-xl w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-zinc-700 flex-shrink-0">
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
                    instagramUrl: '',
                    facebookUrl: '',
                    websiteUrl: '',
                    source: 'manual',
                    stage: 'new-leads'
                  });
                  setExtractionStatus(null);
                }}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 px-6 py-4">
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
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Email <span className="text-zinc-500 text-xs">(optional - for IG DM workflow)</span>
                </label>
                <input
                  type="email"
                  value={newLeadData.email}
                  onChange={(e) => setNewLeadData({ ...newLeadData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter email address (optional)"
                />
                {!newLeadData.email && (
                  <p className="text-xs text-zinc-500 mt-1">
                    💡 No email? Demo link will be available for Instagram DM
                  </p>
                )}
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
              
              {/* Social Media Links Section */}
              <div className="border-t border-zinc-700 pt-4 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-zinc-300">Social Media Links</label>
                  <button
                    type="button"
                    onClick={extractSocialMediaInfo}
                    disabled={isExtracting || (!newLeadData.instagramUrl && !newLeadData.facebookUrl && !newLeadData.websiteUrl)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white text-xs rounded-lg transition-colors flex items-center gap-2"
                  >
                    {isExtracting ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Extracting...
                      </>
                    ) : (
                      <>
                        <Zap className="w-3 h-3" />
                        Extract Info
                      </>
                    )}
                  </button>
                </div>
                {extractionStatus && (
                  <div className={`mb-3 p-2 rounded text-xs ${
                    extractionStatus.includes('✅') ? 'bg-teal-500/20 text-teal-300' :
                    extractionStatus.includes('⚠️') ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-red-500/20 text-red-300'
                  }`}>
                    {extractionStatus}
                  </div>
                )}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Instagram URL</label>
                    <input
                      type="url"
                      value={newLeadData.instagramUrl}
                      onChange={(e) => setNewLeadData({ ...newLeadData, instagramUrl: e.target.value })}
                      className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="https://instagram.com/username or @username"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Facebook URL</label>
                    <input
                      type="url"
                      value={newLeadData.facebookUrl}
                      onChange={(e) => setNewLeadData({ ...newLeadData, facebookUrl: e.target.value })}
                      className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="https://facebook.com/username"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Website URL</label>
                    <input
                      type="url"
                      value={newLeadData.websiteUrl}
                      onChange={(e) => setNewLeadData({ ...newLeadData, websiteUrl: e.target.value })}
                      className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
                <p className="text-xs text-zinc-500 mt-2">
                  💡 Enter social media links and click "Extract Info" to auto-fill business details
                </p>
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
            </div>
            <div className="flex gap-3 p-6 pt-4 border-t border-zinc-700 flex-shrink-0">
              <Button
                onClick={createManualLead}
                className="flex-1"
                disabled={!newLeadData.businessName}
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
                    instagramUrl: '',
                    facebookUrl: '',
                    websiteUrl: '',
                    source: 'manual',
                    stage: 'new-leads'
                  });
                  setExtractionStatus(null);
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

      {/* Send Test Link Modal */}
      {showTestLinkModal && selectedLead && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Send className="w-5 h-5 text-teal-400" />
                <div>
                  <h2 className="text-lg font-semibold text-white">Send Test Link</h2>
                  <p className="text-xs text-zinc-400">
                    {selectedLead.email && selectedLead.email !== 'No email' 
                      ? `This will email a private test link to ${selectedLead.email}. The link will be auto-generated if not provided.`
                      : `No email available. Generate a demo link to share via Instagram DM or ManyChat.`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowTestLinkModal(false);
                  setTestLinkUrl('');
                }}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <Button
                onClick={createDemoSession}
                className="w-full mb-3"
                variant="outline"
              >
                <Zap className="w-4 h-4 mr-2" />
                Create Demo Session (Auto-generate Link)
              </Button>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-zinc-300">
                Test link URL (optional - will be auto-generated if empty)
              </label>
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  value={testLinkUrl}
                  onChange={(e) => setTestLinkUrl(e.target.value)}
                  className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Leave empty to auto-generate, or enter custom URL"
                />
              </div>
              {testLinkUrl && (
                <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-lg">
                  <p className="text-xs text-teal-300 font-medium mb-1">Generated Link:</p>
                  <p className="text-xs text-teal-200 font-mono break-all">{testLinkUrl}</p>
                  {testLinkUrl.includes('localhost') && (
                    <p className="text-xs text-yellow-400 mt-2">
                      ⚠️ This is a localhost link. It will only work on your machine. For production, set NEXT_PUBLIC_APP_URL environment variable.
                    </p>
                  )}
                </div>
              )}
              <p className="text-xs text-zinc-500">
                Tip: Click "Create Demo Session" to auto-generate a link based on the business name. 
                {!testLinkUrl && (
                  <span className="block mt-1 text-zinc-400">
                    If left empty when sending, a link will be auto-generated using: <span className="font-mono">NEXT_PUBLIC_APP_URL</span> or the current origin.
                  </span>
                )}
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowTestLinkModal(false);
                  setTestLinkUrl('');
                }}
              >
                Cancel
              </Button>
              {selectedLead.email && selectedLead.email !== 'No email' ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={sendTestLinkEmail}
                >
                  Send Email
                  <Send className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={async () => {
                    if (!testLinkUrl) {
                      await createDemoSession();
                    }
                    if (testLinkUrl) {
                      navigator.clipboard.writeText(testLinkUrl);
                      showActionMessage('Demo link copied! Ready to paste in IG DM or ManyChat');
                      setShowTestLinkModal(false);
                    }
                  }}
                  disabled={!testLinkUrl}
                >
                  Copy Link for DM
                  <LinkIcon className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
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
  onMarkContacted,
  showActionMessage,
  loadLeads
}: {
  lead: Lead;
  onClose: () => void;
  onUpdateStage: (leadId: string, stage: Lead['stage']) => void;
  onAddNote: () => void;
  onScheduleFollowUp: () => void;
  onMarkContacted: (leadId: string, method: 'email' | 'phone' | 'meeting') => void;
  showActionMessage: (message: string) => void;
  loadLeads: () => Promise<void>;
}) {
  const generateWarmDM = (lead: Lead): string => {
    const businessName = lead.businessName || 'your lounge';
    const ownerName = lead.ownerName || 'there';
    const demoLink = lead.demoLink || '';
    
    // Build personalized message based on Instagram data
    let message = `Hey ${ownerName}! 👋\n\n`;
    
    // Personalize based on Instagram analysis
    if (lead.instagramScrapedData) {
      const instaData = lead.instagramScrapedData;
      
      // Mention flavors if found
      if (instaData.flavors && instaData.flavors.length > 0) {
        const topFlavors = instaData.flavors.slice(0, 3).join(', ');
        message += `I noticed ${businessName} offers ${topFlavors}${instaData.flavors.length > 3 ? ' and more' : ''} - great selection! 🍃\n\n`;
      }
      
      // Mention pricing if found
      if (instaData.basePrice) {
        message += `I see your base price is around $${instaData.basePrice}. `;
      }
      
      // Mention menu items if found
      if (instaData.menuItems && instaData.menuItems.length > 0) {
        message += `Your menu looks solid!\n\n`;
      }
    }
    
    // Main value proposition
    message += `I'd love to show you how Hookah+ can help ${businessName}:\n\n`;
    message += `✨ Increase table turnover\n`;
    message += `📊 Track session times & revenue\n`;
    message += `💳 Accept payments seamlessly\n`;
    message += `📱 Give guests a modern ordering experience\n\n`;
    
    // Add demo link if available
    if (demoLink) {
      message += `I've set up a personalized demo for you:\n${demoLink}\n\n`;
      message += `Check it out when you have a moment - it's customized for ${businessName}!\n\n`;
    } else {
      message += `Would you be open to a quick 15-min demo? I can show you exactly how it works for your setup.\n\n`;
    }
    
    // Friendly close
    message += `Let me know what works best for you! 🙌`;
    
    return message;
  };

  const copyDMToClipboard = () => {
    const dmMessage = generateWarmDM(lead);
    navigator.clipboard.writeText(dmMessage);
    showActionMessage('DM message copied to clipboard! Ready to paste in Instagram.');
  };

  const saveDMAsNote = async () => {
    const dmMessage = generateWarmDM(lead);
    
    try {
      const response = await fetch('/api/admin/operator-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_note',
          leadId: lead.id,
          updates: {
            note: `📱 Instagram DM Message:\n\n${dmMessage}`,
            author: 'system',
            noteType: 'dm_template'
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save note');
      }

      showActionMessage('DM message saved as note');
      await loadLeads();
    } catch (err) {
      console.error('Save DM as note error:', err);
      alert('Failed to save note. Message copied to clipboard instead.');
      navigator.clipboard.writeText(dmMessage);
    }
  };

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
                {(lead.instagramUrl || lead.facebookUrl || lead.websiteUrl) && (
                  <div className="pt-3 border-t border-zinc-800">
                    <div className="text-xs text-zinc-500 mb-2">Social Media & Links</div>
                    {lead.instagramUrl && (
                      <div className="flex items-center gap-2 mb-2">
                        <LinkIcon className="w-4 h-4 text-pink-400" />
                        <a
                          href={lead.instagramUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-pink-400 hover:text-pink-300 text-sm underline"
                        >
                          Instagram
                        </a>
                      </div>
                    )}
                    {lead.facebookUrl && (
                      <div className="flex items-center gap-2 mb-2">
                        <LinkIcon className="w-4 h-4 text-blue-400" />
                        <a
                          href={lead.facebookUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-sm underline"
                        >
                          Facebook
                        </a>
                      </div>
                    )}
                    {lead.websiteUrl && (
                      <div className="flex items-center gap-2">
                        <LinkIcon className="w-4 h-4 text-teal-400" />
                        <a
                          href={lead.websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-teal-400 hover:text-teal-300 text-sm underline"
                        >
                          Website
                        </a>
                      </div>
                    )}
                  </div>
                )}
                {lead.demoLink && (
                  <div className="pt-3 border-t border-zinc-800">
                    <div className="text-xs text-zinc-500 mb-2">Demo Link</div>
                    <div className="flex items-center gap-2 p-2 bg-teal-500/10 border border-teal-500/30 rounded-lg">
                      <LinkIcon className="w-4 h-4 text-teal-400 flex-shrink-0" />
                      <span className="text-teal-300 text-sm font-mono break-all flex-1">{lead.demoLink}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(lead.demoLink || '');
                          showActionMessage('Demo link copied to clipboard!');
                        }}
                        className="px-2 py-1 bg-teal-600 hover:bg-teal-700 text-white text-xs rounded transition-colors"
                        title="Copy link for IG DM"
                      >
                        Copy
                      </button>
                    </div>
                    {!lead.email || lead.email === 'No email' ? (
                      <p className="text-xs text-yellow-400 mt-2">
                        💡 No email - Use this link to DM via Instagram
                      </p>
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            {/* Demo Activity Info */}
            {(lead.source === 'guest_demo' || lead.source === 'guest_control_panel') && (
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <h3 className="text-lg font-semibold text-purple-300">Demo Activity</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Source:</span>
                    <span className="text-white">{lead.source === 'guest_demo' ? 'Guest Demo Completion' : 'Control Panel View'}</span>
                  </div>
                  {lead.notes && lead.notes.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-purple-500/20">
                      <div className="text-xs text-zinc-500 mb-1">Demo Details:</div>
                      <div className="text-zinc-300 text-xs">
                        {lead.notes[lead.notes.length - 1]?.content || 'No details available'}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => {
                        onUpdateStage(lead.id, 'intake');
                        showActionMessage('Moved to Intake - ready for outreach');
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors"
                    >
                      Move to Intake
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/admin/operator-onboarding', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              action: 'create_demo_session',
                              leadId: lead.id,
                              businessName: lead.businessName
                            })
                          });
                          const data = await response.json();
                          if (data.success && data.demoLink) {
                            showActionMessage('Demo session created! Link copied to clipboard.');
                            navigator.clipboard.writeText(data.demoLink);
                          } else {
                            showActionMessage(data.error || 'Failed to create demo session');
                          }
                        } catch (err) {
                          showActionMessage('Failed to create demo session');
                        }
                      }}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-lg transition-colors"
                    >
                      Create Demo Session
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Business Details */}
            <div className="bg-zinc-900/50 rounded-lg p-4 space-y-4">
              <div>
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

              <div className="border-t border-zinc-800 pt-4">
                <h4 className="text-sm font-semibold text-zinc-300 mb-3 uppercase tracking-wide">Menu & Pricing</h4>
                <div className="text-sm space-y-2">
                  {lead.baseHookahPrice ? (
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Base price:</span>
                      <span className="text-white">${lead.baseHookahPrice}</span>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500">Base price not provided yet.</p>
                  )}
                  {lead.refillPrice && (
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Refill price:</span>
                      <span className="text-white">${lead.refillPrice}</span>
                    </div>
                  )}
                  {lead.menuLink ? (
                    <div className="flex items-center gap-2 text-teal-400 text-xs">
                      <LinkIcon className="w-4 h-4" />
                      <a
                        href={lead.menuLink}
                        target="_blank"
                        rel="noreferrer"
                        className="underline break-all"
                      >
                        Menu reference
                      </a>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500">
                      No menu link on file. Ask the owner to email or upload their latest menu.
                    </p>
                  )}

                  {/* Menu Files & Extractor */}
                  {lead.menuFiles && lead.menuFiles.length > 0 && (
                    <div className="mt-4">
                      <MenuExtractor
                        leadId={lead.id}
                        menuFiles={lead.menuFiles}
                        existingData={lead.extractedMenuData || null}
                        onExtractComplete={async (data) => {
                          // Save extracted data to lead via dedicated API
                          const response = await fetch('/api/admin/operator-onboarding/extract-menu', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              leadId: lead.id,
                              extractedData: data
                            })
                          });
                          const result = await response.json();
                          if (!response.ok) {
                            throw new Error(result.error || 'Failed to save extracted menu data');
                          }
                          showActionMessage(
                            result.warnings 
                              ? `Menu data saved. ${result.warnings}` 
                              : `Menu data extracted and saved. ${result.deletedFiles} file(s) deleted.`
                          );
                          loadLeads(); // Refresh to show updated data
                        }}
                        onFileDelete={async (fileId) => {
                          // Delete file from storage and database
                          const file = lead.menuFiles?.find(f => f.id === fileId);
                          if (file?.filePath) {
                            const response = await fetch(`/api/menu-upload?path=${encodeURIComponent(file.filePath)}`, {
                              method: 'DELETE'
                            });
                            if (!response.ok) {
                              throw new Error('Failed to delete file');
                            }
                          }
                          showActionMessage('File deleted successfully');
                          loadLeads(); // Refresh to remove deleted file
                        }}
                      />
                    </div>
                  )}

                  {/* Extracted Menu Data Display (if already extracted) */}
                  {lead.extractedMenuData && !lead.menuFiles?.length && (
                    <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-xs font-semibold text-green-400 uppercase">Menu Data Extracted</span>
                      </div>
                      {lead.extractedMenuData.basePrice && (
                        <div className="text-xs text-zinc-300 mb-1">
                          Base Price: ${lead.extractedMenuData.basePrice}
                        </div>
                      )}
                      {lead.extractedMenuData.flavors && lead.extractedMenuData.flavors.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-zinc-400 mb-1">Flavors:</p>
                          <div className="flex flex-wrap gap-1">
                            {lead.extractedMenuData.flavors.map((flavor: string, idx: number) => (
                              <span key={idx} className="px-2 py-0.5 bg-green-500/20 text-green-300 text-xs rounded">
                                {flavor}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Instagram Scraped Data */}
                  {lead.instagramScrapedData && lead.instagramUrl && (
                    <div className="mt-4 p-3 bg-pink-500/10 border border-pink-500/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <LinkIcon className="w-4 h-4 text-pink-400" />
                          <span className="text-xs font-semibold text-pink-400 uppercase">Instagram Analysis</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={copyDMToClipboard}
                            className="px-2 py-1 bg-pink-600 hover:bg-pink-700 text-white text-xs rounded transition-colors flex items-center gap-1"
                            title="Copy warm DM message"
                          >
                            <MessageSquare className="w-3 h-3" />
                            Copy DM
                          </button>
                          <button
                            onClick={saveDMAsNote}
                            className="px-2 py-1 bg-zinc-700 hover:bg-zinc-600 text-white text-xs rounded transition-colors flex items-center gap-1"
                            title="Save DM as note"
                          >
                            <FileText className="w-3 h-3" />
                            Save
                          </button>
                        </div>
                      </div>
                      {lead.instagramScrapedData.menuItems && lead.instagramScrapedData.menuItems.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-zinc-400 mb-1">Menu Items Found:</p>
                          <div className="space-y-1">
                            {lead.instagramScrapedData.menuItems.slice(0, 5).map((item, idx) => (
                              <div key={idx} className="text-xs text-zinc-300">
                                • {item.name}
                                {item.price && <span className="text-zinc-500 ml-2">${item.price}</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {lead.instagramScrapedData.flavors && lead.instagramScrapedData.flavors.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-zinc-400 mb-1">Flavors Detected:</p>
                          <div className="flex flex-wrap gap-1">
                            {lead.instagramScrapedData.flavors.map((flavor, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-pink-500/20 text-pink-300 text-xs rounded">
                                {flavor}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {lead.instagramScrapedData.basePrice && (
                        <div className="mt-2 text-xs">
                          <span className="text-zinc-400">Extracted base price:</span>
                          <span className="text-white ml-2">${lead.instagramScrapedData.basePrice}</span>
                        </div>
                      )}
                      {lead.instagramScrapedData.extractedAt && (
                        <p className="text-xs text-zinc-500 mt-2">
                          Scraped: {new Date(lead.instagramScrapedData.extractedAt).toLocaleString()}
                        </p>
                      )}
                      
                      {/* Preview DM Message */}
                      <div className="mt-3 pt-3 border-t border-pink-500/20">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-zinc-400">💬 Generated DM Message:</p>
                          <button
                            onClick={copyDMToClipboard}
                            className="text-xs text-pink-400 hover:text-pink-300 underline"
                          >
                            Copy
                          </button>
                        </div>
                        <div className="p-2 bg-zinc-900/50 rounded text-xs text-zinc-300 whitespace-pre-wrap max-h-40 overflow-y-auto font-mono border border-zinc-700">
                          {generateWarmDM(lead)}
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">
                          💡 Click "Copy DM" button above or "Save" to store as note
                        </p>
                      </div>
                    </div>
                  )}
                </div>
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

