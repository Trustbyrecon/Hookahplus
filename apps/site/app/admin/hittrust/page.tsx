'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Eye,
  Edit,
  MessageSquare,
  UserPlus,
  Filter,
  Search,
  MoreVertical,
  Calendar,
  Phone,
  Mail,
  Building,
  Target,
  TrendingUp,
  Shield
} from 'lucide-react';

interface HitTrustApplication {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  phone?: string;
  businessType: string;
  currentSystem?: string;
  integrationNeeds?: string;
  timeline: string;
  message?: string;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected' | 'onboarded';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  notes?: Array<{
    text: string;
    timestamp: string;
    author: string;
  }>;
}

export default function HitTrustAdminDashboard() {
  const [applications, setApplications] = useState<HitTrustApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<HitTrustApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<HitTrustApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState<'view' | 'edit' | 'assign' | 'note'>('view');
  const [formData, setFormData] = useState({
    status: '',
    assignedTo: '',
    note: '',
    author: '',
    priority: ''
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchQuery, statusFilter, priorityFilter]);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/hittrust');
      const data = await response.json();
      
      if (data.success) {
        setApplications(data.applications);
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(app => 
        app.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(app => app.priority === priorityFilter);
    }

    setFilteredApplications(filtered);
  };

  const updateApplication = async (applicationId: string, action: string, updates: any) => {
    try {
      const response = await fetch('/api/hittrust', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId,
          action,
          updates
        })
      });

      if (response.ok) {
        await fetchApplications();
        setShowModal(false);
        setSelectedApplication(null);
      }
    } catch (error) {
      console.error('Failed to update application:', error);
    }
  };

  const handleAction = (application: HitTrustApplication, action: 'view' | 'edit' | 'assign' | 'note') => {
    setSelectedApplication(application);
    setActionType(action);
    setFormData({
      status: application.status,
      assignedTo: application.assignedTo || '',
      note: '',
      author: 'Admin',
      priority: application.priority
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!selectedApplication) return;

    switch (actionType) {
      case 'edit':
        updateApplication(selectedApplication.id, 'update_status', {
          status: formData.status,
          notes: formData.note
        });
        break;
      case 'assign':
        updateApplication(selectedApplication.id, 'assign', {
          assignedTo: formData.assignedTo
        });
        break;
      case 'note':
        updateApplication(selectedApplication.id, 'add_note', {
          note: formData.note,
          author: formData.author
        });
        break;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-500/20';
      case 'reviewed': return 'text-blue-400 bg-blue-500/20';
      case 'approved': return 'text-green-400 bg-green-500/20';
      case 'rejected': return 'text-red-400 bg-red-500/20';
      case 'onboarded': return 'text-purple-400 bg-purple-500/20';
      default: return 'text-zinc-400 bg-zinc-500/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-400 bg-red-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-zinc-400 bg-zinc-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'reviewed': return <Eye className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <AlertCircle className="w-4 h-4" />;
      case 'onboarded': return <Shield className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
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
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Loading HitTrust applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span>HitTrust Admin Dashboard</span>
            </h1>
            <p className="text-zinc-400 mt-2">Manage HitTrust integration applications</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-zinc-400">Total Applications</div>
              <div className="text-2xl font-bold text-orange-400">{applications.length}</div>
            </div>
            <button
              onClick={fetchApplications}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Search</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search applications..."
                  className="w-full pl-10 pr-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="onboarded">Onboarded</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setPriorityFilter('all');
                }}
                className="w-full bg-zinc-700 hover:bg-zinc-600 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Applications Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredApplications.map((application) => (
            <motion.div
              key={application.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6 hover:border-zinc-600 transition-colors"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Building className="w-4 h-4 text-blue-400" />
                  <span className="font-semibold text-lg">{application.businessName}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(application.priority)}`}>
                    {application.priority.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                    {application.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-zinc-400" />
                  <span className="text-sm text-zinc-300">{application.contactName}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-zinc-400" />
                  <span className="text-sm text-zinc-300">{application.email}</span>
                </div>
                {application.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-zinc-400" />
                    <span className="text-sm text-zinc-300">{application.phone}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-zinc-400" />
                  <span className="text-sm text-zinc-300">{application.businessType}</span>
                </div>
              </div>

              {/* Timeline */}
              <div className="mb-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-zinc-400" />
                  <span className="text-sm text-zinc-400">Timeline:</span>
                  <span className="text-sm text-zinc-300">{application.timeline}</span>
                </div>
                <div className="text-xs text-zinc-500 mt-1">
                  Applied: {formatDate(application.createdAt)}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleAction(application, 'view')}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1 text-sm"
                >
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </button>
                <button
                  onClick={() => handleAction(application, 'edit')}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1 text-sm"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleAction(application, 'note')}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1 text-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Note</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredApplications.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-zinc-400" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-300 mb-2">No Applications Found</h3>
            <p className="text-zinc-400">Try adjusting your filters or search criteria.</p>
          </div>
        )}

        {/* Action Modal */}
        <AnimatePresence>
          {showModal && selectedApplication && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">
                    {actionType === 'view' && 'View Application'}
                    {actionType === 'edit' && 'Edit Application'}
                    {actionType === 'assign' && 'Assign Application'}
                    {actionType === 'note' && 'Add Note'}
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-zinc-400 hover:text-white"
                  >
                    <AlertCircle className="w-6 h-6" />
                  </button>
                </div>

                {actionType === 'view' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">Business Name</label>
                        <p className="text-white">{selectedApplication.businessName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">Contact Name</label>
                        <p className="text-white">{selectedApplication.contactName}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">Email</label>
                        <p className="text-white">{selectedApplication.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">Phone</label>
                        <p className="text-white">{selectedApplication.phone || 'Not provided'}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">Business Type</label>
                        <p className="text-white">{selectedApplication.businessType}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">Timeline</label>
                        <p className="text-white">{selectedApplication.timeline}</p>
                      </div>
                    </div>
                    
                    {selectedApplication.currentSystem && (
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">Current System</label>
                        <p className="text-white">{selectedApplication.currentSystem}</p>
                      </div>
                    )}
                    
                    {selectedApplication.integrationNeeds && (
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">Integration Needs</label>
                        <p className="text-white">{selectedApplication.integrationNeeds}</p>
                      </div>
                    )}
                    
                    {selectedApplication.message && (
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">Message</label>
                        <p className="text-white">{selectedApplication.message}</p>
                      </div>
                    )}
                  </div>
                )}

                {(actionType === 'edit' || actionType === 'assign' || actionType === 'note') && (
                  <div className="space-y-4">
                    {actionType === 'edit' && (
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Status</label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                          className="w-full px-4 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                          <option value="onboarded">Onboarded</option>
                        </select>
                      </div>
                    )}
                    
                    {actionType === 'assign' && (
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Assign To</label>
                        <input
                          type="text"
                          value={formData.assignedTo}
                          onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                          placeholder="Enter assignee name"
                          className="w-full px-4 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-primary-500"
                        />
                      </div>
                    )}
                    
                    {(actionType === 'edit' || actionType === 'note') && (
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                          {actionType === 'edit' ? 'Notes' : 'Note'}
                        </label>
                        <textarea
                          value={formData.note}
                          onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                          rows={3}
                          placeholder="Enter your note..."
                          className="w-full px-4 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-primary-500"
                        />
                      </div>
                    )}
                    
                    {actionType === 'note' && (
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Author</label>
                        <input
                          type="text"
                          value={formData.author}
                          onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                          placeholder="Enter author name"
                          className="w-full px-4 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-primary-500"
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  {actionType !== 'view' && (
                    <button
                      onClick={handleSubmit}
                      className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      {actionType === 'edit' && 'Update Status'}
                      {actionType === 'assign' && 'Assign'}
                      {actionType === 'note' && 'Add Note'}
                    </button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
