'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface BackupConfig {
  id: string;
  name: string;
  type: 'database' | 'files' | 'config' | 'full';
  schedule: string;
  retention: number;
  enabled: boolean;
  trustLockRequired: boolean;
}

interface BackupJob {
  id: string;
  configId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: number;
  completedAt?: number;
  size?: number;
  location?: string;
  trustLockVerified: boolean;
  error?: string;
}

interface RestoreJob {
  id: string;
  backupId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: number;
  completedAt?: number;
  trustLockVerified: boolean;
  error?: string;
}

interface BackupStatus {
  totalBackups: number;
  successfulBackups: number;
  failedBackups: number;
  lastBackup?: number;
  nextScheduledBackup?: number;
}

export default function BackupPage() {
  const [configs, setConfigs] = useState<BackupConfig[]>([]);
  const [jobs, setJobs] = useState<BackupJob[]>([]);
  const [restoreJobs, setRestoreJobs] = useState<RestoreJob[]>([]);
  const [status, setStatus] = useState<BackupStatus | null>(null);
  const [trustLockVerified, setTrustLockVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Trust-Lock verification for backup access
    const verifyTrustLock = async () => {
      try {
        const response = await fetch('/api/trust-lock/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'backup_access',
            context: 'backup_management'
          })
        });
        
        if (response.ok) {
          setTrustLockVerified(true);
        }
      } catch (error) {
        console.error('Trust-Lock verification failed:', error);
      }
    };

    verifyTrustLock();
  }, []);

  useEffect(() => {
    if (!trustLockVerified) return;

    const fetchData = async () => {
      try {
        const [configsRes, jobsRes, restoreJobsRes, statusRes] = await Promise.all([
          fetch('/api/backup?type=configs'),
          fetch('/api/backup?type=jobs&limit=20'),
          fetch('/api/backup?type=restore-jobs&limit=10'),
          fetch('/api/backup?type=status')
        ]);

        const [configsData, jobsData, restoreJobsData, statusData] = await Promise.all([
          configsRes.json(),
          jobsRes.json(),
          restoreJobsRes.json(),
          statusRes.json()
        ]);

        if (configsData.success) setConfigs(configsData.data.configs);
        if (jobsData.success) setJobs(jobsData.data.jobs);
        if (restoreJobsData.success) setRestoreJobs(restoreJobsData.data.restoreJobs);
        if (statusData.success) setStatus(statusData.data.status);

      } catch (error) {
        console.error('Failed to fetch backup data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [trustLockVerified]);

  const handleCreateBackup = async (configId: string) => {
    try {
      const response = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_backup',
          configId
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Backup job created successfully!');
        window.location.reload();
      } else {
        alert(`Failed to create backup: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to create backup:', error);
      alert('Failed to create backup');
    }
  };

  const handleRestoreBackup = async (backupId: string) => {
    if (!confirm('Are you sure you want to restore this backup? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'restore_backup',
          backupId
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Restore job created successfully!');
        window.location.reload();
      } else {
        alert(`Failed to create restore job: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to create restore job:', error);
      alert('Failed to create restore job');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'running': return 'text-blue-400';
      case 'failed': return 'text-red-400';
      case 'pending': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'running': return '🔄';
      case 'failed': return '❌';
      case 'pending': return '⏳';
      default: return '❓';
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  if (!trustLockVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Trust-Lock Verification Required</h2>
          <p className="text-gray-300 mb-6">
            Please complete Trust-Lock verification to access backup management.
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading backup data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Backup Management</h1>
            <p className="text-gray-300">Manage system backups and recovery operations</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-green-400 text-sm">Trust-Lock Verified</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'configs', label: 'Configurations', icon: '⚙️' },
            { id: 'jobs', label: 'Backup Jobs', icon: '💾' },
            { id: 'restore', label: 'Restore Jobs', icon: '🔄' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 m-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/20 text-gray-300 hover:bg-white/30'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && status && (
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Total Backups</h3>
                  <span className="text-2xl">💾</span>
                </div>
                <p className="text-3xl font-bold text-white">{status.totalBackups}</p>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Successful</h3>
                  <span className="text-2xl">✅</span>
                </div>
                <p className="text-3xl font-bold text-green-400">{status.successfulBackups}</p>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Failed</h3>
                  <span className="text-2xl">❌</span>
                </div>
                <p className="text-3xl font-bold text-red-400">{status.failedBackups}</p>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Success Rate</h3>
                  <span className="text-2xl">📈</span>
                </div>
                <p className="text-3xl font-bold text-white">
                  {status.totalBackups > 0 
                    ? Math.round((status.successfulBackups / status.totalBackups) * 100)
                    : 0}%
                </p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Backup Schedule</h3>
              <div className="space-y-4">
                {configs.map((config) => (
                  <div key={config.id} className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-white">{config.name}</h4>
                        <p className="text-gray-300">
                          {config.type} • {config.schedule} • {config.retention} days retention
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {config.trustLockRequired && (
                          <span className="text-yellow-400 text-sm">🔒 Trust-Lock Required</span>
                        )}
                        <span className={`px-3 py-1 rounded text-sm ${
                          config.enabled ? 'bg-green-600' : 'bg-gray-600'
                        }`}>
                          {config.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Configurations Tab */}
        {activeTab === 'configs' && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Backup Configurations</h3>
              <div className="space-y-4">
                {configs.map((config) => (
                  <div key={config.id} className="bg-white/5 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xl font-semibold text-white">{config.name}</h4>
                      <button
                        onClick={() => handleCreateBackup(config.id)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        Create Backup
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-gray-400 text-sm">Type</span>
                        <p className="text-white">{config.type}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">Schedule</span>
                        <p className="text-white">{config.schedule}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">Retention</span>
                        <p className="text-white">{config.retention} days</p>
                      </div>
                    </div>
                    {config.trustLockRequired && (
                      <div className="mt-4 p-3 bg-yellow-500/20 rounded-lg">
                        <span className="text-yellow-400 text-sm">🔒 This backup requires Trust-Lock verification</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Backup Jobs Tab */}
        {activeTab === 'jobs' && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Recent Backup Jobs</h3>
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div key={job.id} className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getStatusIcon(job.status)}</span>
                        <span className={`font-semibold ${getStatusColor(job.status)}`}>
                          {job.status.toUpperCase()}
                        </span>
                        {job.trustLockVerified && (
                          <span className="text-green-400 text-sm">🔒 Verified</span>
                        )}
                      </div>
                      <span className="text-gray-400 text-sm">
                        {new Date(job.startedAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Job ID</span>
                        <p className="text-white font-mono">{job.id}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Size</span>
                        <p className="text-white">{formatFileSize(job.size)}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Location</span>
                        <p className="text-white text-xs truncate">{job.location || 'N/A'}</p>
                      </div>
                    </div>
                    {job.error && (
                      <div className="mt-2 p-2 bg-red-500/20 rounded text-red-400 text-sm">
                        Error: {job.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Restore Jobs Tab */}
        {activeTab === 'restore' && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Restore Jobs</h3>
              <div className="space-y-4">
                {restoreJobs.map((job) => (
                  <div key={job.id} className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getStatusIcon(job.status)}</span>
                        <span className={`font-semibold ${getStatusColor(job.status)}`}>
                          {job.status.toUpperCase()}
                        </span>
                        {job.trustLockVerified && (
                          <span className="text-green-400 text-sm">🔒 Verified</span>
                        )}
                      </div>
                      <span className="text-gray-400 text-sm">
                        {new Date(job.startedAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Job ID</span>
                        <p className="text-white font-mono">{job.id}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Backup ID</span>
                        <p className="text-white font-mono">{job.backupId}</p>
                      </div>
                    </div>
                    {job.error && (
                      <div className="mt-2 p-2 bg-red-500/20 rounded text-red-400 text-sm">
                        Error: {job.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Back to Dashboard */}
        <div className="text-center mt-12">
          <Link
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-medium rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
