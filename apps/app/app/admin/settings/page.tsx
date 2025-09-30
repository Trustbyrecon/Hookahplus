"use client";

import React, { useState } from 'react';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Shield, 
  Database,
  Bell,
  Mail,
  Lock,
  Key,
  Globe,
  Monitor,
  Smartphone,
  Wifi,
  HardDrive,
  Cpu,
  MemoryStick,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import GlobalNavigation from '../../../components/GlobalNavigation';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    appName: 'HookahPLUS',
    appVersion: '1.2.3',
    timezone: 'America/New_York',
    language: 'en',
    theme: 'dark',
    autoBackup: true,
    emailNotifications: true,
    smsNotifications: false,
    maintenanceMode: false,
    debugMode: false,
    maxSessions: 50,
    sessionTimeout: 30,
    backupFrequency: 'daily',
    logLevel: 'info'
  });

  const tabs = [
    { id: 'general', label: 'General', icon: <Settings className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
    { id: 'system', label: 'System', icon: <Monitor className="w-4 h-4" /> },
    { id: 'backup', label: 'Backup', icon: <Database className="w-4 h-4" /> }
  ];

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="card-pretty p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Application Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Application Name</label>
            <input
              type="text"
              value={settings.appName}
              onChange={(e) => handleSettingChange('appName', e.target.value)}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Version</label>
            <input
              type="text"
              value={settings.appVersion}
              disabled
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-400 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Timezone</label>
            <select
              value={settings.timezone}
              onChange={(e) => handleSettingChange('timezone', e.target.value)}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Language</label>
            <select
              value={settings.language}
              onChange={(e) => handleSettingChange('language', e.target.value)}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card-pretty p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Session Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Max Concurrent Sessions</label>
            <input
              type="number"
              value={settings.maxSessions}
              onChange={(e) => handleSettingChange('maxSessions', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Session Timeout (minutes)</label>
            <input
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="card-pretty p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium">Email Notifications</div>
              <div className="text-sm text-zinc-400">Receive notifications via email</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium">SMS Notifications</div>
              <div className="text-sm text-zinc-400">Receive notifications via SMS</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.smsNotifications}
                onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="card-pretty p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Security Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium">Maintenance Mode</div>
              <div className="text-sm text-zinc-400">Temporarily disable public access</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium">Debug Mode</div>
              <div className="text-sm text-zinc-400">Enable debug logging and verbose output</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.debugMode}
                onChange={(e) => handleSettingChange('debugMode', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div className="card-pretty p-6">
        <h3 className="text-lg font-semibold text-white mb-4">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">CPU Usage</span>
              <span className="text-white">45%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Memory Usage</span>
              <span className="text-white">2.1 GB / 4 GB</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Disk Usage</span>
              <span className="text-white">15.2 GB / 50 GB</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Uptime</span>
              <span className="text-white">15 days, 3 hours</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Last Restart</span>
              <span className="text-white">2025-01-01 10:30 AM</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Active Sessions</span>
              <span className="text-white">12</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Database Status</span>
              <span className="text-green-400">Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">API Status</span>
              <span className="text-green-400">Healthy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBackupSettings = () => (
    <div className="space-y-6">
      <div className="card-pretty p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Backup Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Backup Frequency</label>
            <select
              value={settings.backupFrequency}
              onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Log Level</label>
            <select
              value={settings.logLevel}
              onChange={(e) => handleSettingChange('logLevel', e.target.value)}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="error">Error</option>
              <option value="warn">Warning</option>
              <option value="info">Info</option>
              <option value="debug">Debug</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card-pretty p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Backup Actions</h3>
        <div className="flex space-x-4">
          <button className="btn-pretty-primary">
            <Database className="w-4 h-4 mr-2" />
            Create Backup
          </button>
          <button className="btn-pretty-secondary">
            <RefreshCw className="w-4 h-4 mr-2" />
            Restore Backup
          </button>
          <button className="btn-pretty-outline">
            <HardDrive className="w-4 h-4 mr-2" />
            Download Backup
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'general': return renderGeneralSettings();
      case 'notifications': return renderNotificationSettings();
      case 'security': return renderSecuritySettings();
      case 'system': return renderSystemSettings();
      case 'backup': return renderBackupSettings();
      default: return renderGeneralSettings();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Settings className="w-8 h-8 text-teal-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              System Settings
            </h1>
          </div>
          <p className="text-xl text-zinc-400">
            Configure application settings and preferences
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-teal-600 text-white'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        {renderContent()}

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button className="btn-pretty-primary text-lg px-8 py-3">
            <Save className="w-5 h-5 mr-2" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
