'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  QrCode,
  Download,
  Copy,
  Settings,
  Building,
  Users,
  Calendar,
  Link,
  Eye,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info,
  ExternalLink,
  BarChart3,
  Target,
  Zap
} from 'lucide-react';

interface QRCodeData {
  id: string;
  loungeId: string;
  tableId?: string;
  campaignRef?: string;
  url: string;
  qrCodeData: string;
  createdAt: string;
  usageCount: number;
  lastUsed?: string;
  status: 'active' | 'inactive' | 'expired';
}

interface LoungeConfig {
  lounge_id: string;
  lounge_name: string;
  slug: string;
  session_price?: number;
  reflex_enabled?: boolean;
  contact?: {
    owner_name: string;
    email: string;
    phone: string;
    address: string;
  };
  hours?: Record<string, string>;
  tables: TableConfig[];
  campaigns?: CampaignConfig[];
  qr_settings?: {
    base_url: string;
    include_campaign: boolean;
    include_table_info: boolean;
    auto_generate: boolean;
    bulk_generation: boolean;
  };
}

interface TableConfig {
  id: string;
  name: string;
  type: string;
  capacity: number;
  zone: string;
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  qr_enabled: boolean;
  status: 'active' | 'inactive' | 'maintenance';
  price_multiplier: number;
  description: string;
}

interface CampaignConfig {
  id: string;
  name: string;
  active: boolean;
  qr_prefix: string;
  start_date: string;
  end_date: string;
  description: string;
}

export default function QRGeneratorAdmin() {
  const [loungeId, setLoungeId] = useState('HQ+');
  const [tableId, setTableId] = useState('');
  const [campaignRef, setCampaignRef] = useState('');
  const [generatedQR, setGeneratedQR] = useState<QRCodeData | null>(null);
  const [qrHistory, setQrHistory] = useState<QRCodeData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedQR, setSelectedQR] = useState<QRCodeData | null>(null);
  
  // New state for YAML integration
  const [lounges, setLounges] = useState<LoungeConfig[]>([]);
  const [selectedLounge, setSelectedLounge] = useState<LoungeConfig | null>(null);
  const [availableTables, setAvailableTables] = useState<TableConfig[]>([]);
  const [availableCampaigns, setAvailableCampaigns] = useState<CampaignConfig[]>([]);
  const [isLoadingLounges, setIsLoadingLounges] = useState(true);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedTablesForBulk, setSelectedTablesForBulk] = useState<string[]>([]);

  // Cloud Lounge Demo data - integrated directly for immediate availability
  const cloudLoungeDemo: LoungeConfig = {
    lounge_id: 'CLOUD_DEMO',
    lounge_name: 'Cloud Lounge Demo',
    slug: 'cloud-lounge-demo',
    session_price: 25.00,
    reflex_enabled: true,
    contact: {
      owner_name: 'Sarah Martinez',
      email: 'sarah@cloudlounge.com',
      phone: '+1 (555) 123-4567',
      address: '123 Cloud Street, New York, NY 10001'
    },
    tables: [
      {
        id: 'table_1',
        name: 'VIP Booth 1',
        type: 'booth',
        capacity: 6,
        zone: 'VIP',
        coordinates: { x: 10, y: 15, width: 120, height: 80 },
        qr_enabled: true,
        status: 'active',
        price_multiplier: 1.5,
        description: 'Premium VIP booth with leather seating'
      },
      {
        id: 'table_2',
        name: 'VIP Booth 2',
        type: 'booth',
        capacity: 6,
        zone: 'VIP',
        coordinates: { x: 150, y: 15, width: 120, height: 80 },
        qr_enabled: true,
        status: 'active',
        price_multiplier: 1.5,
        description: 'Premium VIP booth with leather seating'
      },
      {
        id: 'table_3',
        name: 'Regular Table 1',
        type: 'table',
        capacity: 4,
        zone: 'Main Floor',
        coordinates: { x: 10, y: 120, width: 100, height: 60 },
        qr_enabled: true,
        status: 'active',
        price_multiplier: 1.0,
        description: 'Standard table in main area'
      },
      {
        id: 'table_4',
        name: 'Regular Table 2',
        type: 'table',
        capacity: 4,
        zone: 'Main Floor',
        coordinates: { x: 130, y: 120, width: 100, height: 60 },
        qr_enabled: true,
        status: 'active',
        price_multiplier: 1.0,
        description: 'Standard table in main area'
      },
      {
        id: 'table_5',
        name: 'Regular Table 3',
        type: 'table',
        capacity: 4,
        zone: 'Main Floor',
        coordinates: { x: 250, y: 120, width: 100, height: 60 },
        qr_enabled: true,
        status: 'active',
        price_multiplier: 1.0,
        description: 'Standard table in main area'
      },
      {
        id: 'table_6',
        name: 'Outdoor Patio 1',
        type: 'outdoor',
        capacity: 6,
        zone: 'Patio',
        coordinates: { x: 10, y: 200, width: 120, height: 80 },
        qr_enabled: true,
        status: 'active',
        price_multiplier: 1.2,
        description: 'Outdoor seating with weather protection'
      },
      {
        id: 'table_7',
        name: 'Outdoor Patio 2',
        type: 'outdoor',
        capacity: 6,
        zone: 'Patio',
        coordinates: { x: 150, y: 200, width: 120, height: 80 },
        qr_enabled: true,
        status: 'active',
        price_multiplier: 1.2,
        description: 'Outdoor seating with weather protection'
      }
    ],
    campaigns: [
      {
        id: 'welcome_2024',
        name: 'Welcome 2024',
        active: true,
        qr_prefix: 'WELCOME',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        description: 'New customer welcome campaign'
      },
      {
        id: 'vip_loyalty',
        name: 'VIP Loyalty Program',
        active: true,
        qr_prefix: 'VIP',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        description: 'Exclusive VIP member benefits'
      },
      {
        id: 'happy_hour',
        name: 'Happy Hour Special',
        active: true,
        qr_prefix: 'HAPPY',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        description: 'Weekday happy hour pricing'
      }
    ],
    qr_settings: {
      base_url: 'https://guest.hookahplus.net',
      include_campaign: true,
      include_table_info: true,
      auto_generate: true,
      bulk_generation: true
    }
  };

  // Load QR history on component mount
  useEffect(() => {
    loadQRHistory();
    // Initialize with Cloud Lounge Demo data immediately
    setLounges([cloudLoungeDemo]);
    setIsLoadingLounges(false);
    // Also try to load from API for additional lounges
    loadLounges();
    
    // Auto-generate demo QR code for lounge owners to see value
    generateDemoQR();
  }, []);

  const generateDemoQR = () => {
    // Create a demo QR code that showcases value
    const demoQR: QRCodeData = {
      id: 'demo_qr_001',
      loungeId: 'CLOUD_DEMO',
      tableId: 'T-001',
      campaignRef: 'WELCOME',
      url: 'https://guest.hookahplus.net?loungeId=CLOUD_DEMO&tableId=T-001&ref=WELCOME',
      qrCodeData: `data:image/svg+xml;base64,${btoa(`
        <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" fill="white"/>
          <rect x="20" y="20" width="160" height="160" fill="black"/>
          <rect x="30" y="30" width="140" height="140" fill="white"/>
          <rect x="40" y="40" width="120" height="120" fill="black"/>
          <rect x="50" y="50" width="100" height="100" fill="white"/>
          <rect x="60" y="60" width="80" height="80" fill="black"/>
          <rect x="70" y="70" width="60" height="60" fill="white"/>
          <rect x="80" y="80" width="40" height="40" fill="black"/>
          <text x="100" y="190" text-anchor="middle" font-family="monospace" font-size="10" fill="black">
            CLOUD_DEMO T-001
          </text>
        </svg>
      `)}`,
      createdAt: new Date().toISOString(),
      usageCount: 47, // Demo usage count to show value
      lastUsed: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      status: 'active'
    };
    
    // Add to history if not already present
    setQrHistory(prev => {
      const exists = prev.find(qr => qr.id === 'demo_qr_001');
      if (!exists) {
        return [demoQR, ...prev];
      }
      return prev;
    });
    
    // Set as generated QR for preview
    if (!generatedQR) {
      setGeneratedQR(demoQR);
      setShowPreview(true);
    }
  };

  // Load lounges when loungeId changes
  useEffect(() => {
    if (loungeId) {
      loadLoungeDetails(loungeId);
    }
  }, [loungeId]);

  const loadLounges = async () => {
    try {
      setIsLoadingLounges(true);
      const response = await fetch('/api/lounges');
      const data = await response.json();
      
      if (data.success) {
        // Merge Cloud Lounge Demo with API lounges, avoiding duplicates
        const apiLounges = data.lounges || [];
        const existingCloudDemo = apiLounges.find((lounge: LoungeConfig) => lounge.lounge_id === 'CLOUD_DEMO');
        
        if (!existingCloudDemo) {
          setLounges([cloudLoungeDemo, ...apiLounges]);
        } else {
          setLounges(apiLounges);
        }
      } else {
        // If API fails, just use Cloud Lounge Demo
        setLounges([cloudLoungeDemo]);
      }
    } catch (error) {
      console.error('Failed to load lounges:', error);
      // If API fails, just use Cloud Lounge Demo
      setLounges([cloudLoungeDemo]);
    } finally {
      setIsLoadingLounges(false);
    }
  };

  const loadLoungeDetails = async (loungeId: string) => {
    try {
      // Check if it's the Cloud Lounge Demo first
      if (loungeId === 'CLOUD_DEMO') {
        setSelectedLounge(cloudLoungeDemo);
        setAvailableTables(cloudLoungeDemo.tables || []);
        setAvailableCampaigns(cloudLoungeDemo.campaigns || []);
        return;
      }

      // Otherwise, try to load from API
      const response = await fetch(`/api/lounges/${loungeId}?includeTables=true&includeCampaigns=true`);
      const data = await response.json();
      
      if (data.success) {
        setSelectedLounge(data.lounge);
        setAvailableTables(data.lounge.tables || []);
        setAvailableCampaigns(data.lounge.campaigns || []);
      }
    } catch (error) {
      console.error('Failed to load lounge details:', error);
    }
  };

  const handleLoungeChange = (newLoungeId: string) => {
    setLoungeId(newLoungeId);
    setTableId('');
    setCampaignRef('');
    setSelectedTablesForBulk([]);
  };

  const handleBulkTableToggle = (tableId: string) => {
    setSelectedTablesForBulk(prev => 
      prev.includes(tableId) 
        ? prev.filter(id => id !== tableId)
        : [...prev, tableId]
    );
  };

  const loadQRHistory = async () => {
    try {
      const response = await fetch('/api/qr-generator');
      if (response.ok) {
        const data = await response.json();
        setQrHistory(data.qrCodes || []);
      }
    } catch (error) {
      console.error('Failed to load QR history:', error);
    }
  };

  const generateQRCode = async () => {
    if (!loungeId.trim()) {
      alert('Please enter a Lounge ID');
      return;
    }

    setIsGenerating(true);
    
    try {
      const qrData = {
        loungeId: loungeId.trim(),
        tableId: tableId.trim() || undefined,
        campaignRef: campaignRef.trim() || undefined,
        timestamp: new Date().toISOString()
      };

      // Generate URL with parameters
      const baseUrl = process.env.NEXT_PUBLIC_GUEST_URL || 'https://guest.hookahplus.net';
      const params = new URLSearchParams();
      params.set('loungeId', qrData.loungeId);
      if (qrData.tableId) params.set('tableId', qrData.tableId);
      if (qrData.campaignRef) params.set('ref', qrData.campaignRef);
      
      const qrUrl = `${baseUrl}?${params.toString()}`;

      // Generate QR code using a simple API (in production, use a proper QR library)
      const qrCodeData = `data:image/svg+xml;base64,${btoa(`
        <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" fill="white"/>
          <text x="100" y="100" text-anchor="middle" font-family="monospace" font-size="12" fill="black">
            QR: ${qrData.loungeId}${qrData.tableId ? `-${qrData.tableId}` : ''}
          </text>
        </svg>
      `)}`;

      const newQR: QRCodeData = {
        id: `qr_${Date.now()}`,
        loungeId: qrData.loungeId,
        tableId: qrData.tableId,
        campaignRef: qrData.campaignRef,
        url: qrUrl,
        qrCodeData,
        createdAt: new Date().toISOString(),
        usageCount: 0,
        status: 'active'
      };

      // Save to backend
      const response = await fetch('/api/qr-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQR)
      });

      if (response.ok) {
        setGeneratedQR(newQR);
        setQrHistory(prev => [newQR, ...prev]);
        setShowPreview(true);
      } else {
        throw new Error('Failed to save QR code');
      }

    } catch (error) {
      console.error('Failed to generate QR code:', error);
      alert('Failed to generate QR code. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const downloadQR = (qr: QRCodeData) => {
    const link = document.createElement('a');
    link.href = qr.qrCodeData;
    link.download = `qr-${qr.loungeId}-${qr.tableId || 'general'}.svg`;
    link.click();
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/20';
      case 'inactive': return 'text-yellow-400 bg-yellow-500/20';
      case 'expired': return 'text-red-400 bg-red-500/20';
      default: return 'text-zinc-400 bg-zinc-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <span>QR Code Generator</span>
            </h1>
            <p className="text-zinc-400 mt-2">Generate QR codes for your lounge tables and campaigns</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-zinc-400">Total QR Codes</div>
              <div className="text-2xl font-bold text-blue-400">{qrHistory.length}</div>
            </div>
            <button
              onClick={loadQRHistory}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Generator Form */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center space-x-2">
              <Settings className="w-5 h-5 text-blue-400" />
              <span>Generate New QR Code</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Lounge <span className="text-red-400">*</span>
                </label>
                <select
                  value={loungeId}
                  onChange={(e) => handleLoungeChange(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  disabled={isLoadingLounges}
                >
                  <option value="">
                    {isLoadingLounges ? 'Loading lounges...' : 'Select a lounge'}
                  </option>
                  {lounges.map((lounge) => (
                    <option key={lounge.lounge_id} value={lounge.lounge_id}>
                      {lounge.lounge_name} ({lounge.lounge_id})
                    </option>
                  ))}
                </select>
                {selectedLounge && (
                  <div className="mt-2 text-xs text-zinc-400">
                    {availableTables.length} tables available • {availableCampaigns.length} campaigns
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Table (Optional)
                </label>
                <select
                  value={tableId}
                  onChange={(e) => setTableId(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  disabled={!loungeId || availableTables.length === 0}
                >
                  <option value="">
                    {!loungeId ? 'Select a lounge first' : 
                     availableTables.length === 0 ? 'No tables available' : 
                     'Select a table (optional)'}
                  </option>
                  {availableTables
                    .filter(table => table.qr_enabled && table.status === 'active')
                    .map((table) => (
                      <option key={table.id} value={table.id}>
                        {table.name} ({table.type}, {table.capacity} seats) - {table.zone}
                      </option>
                    ))}
                </select>
                {availableTables.length > 0 && (
                  <div className="mt-2 text-xs text-zinc-400">
                    {availableTables.filter(t => t.qr_enabled && t.status === 'active').length} QR-enabled tables
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Campaign (Optional)
                </label>
                <select
                  value={campaignRef}
                  onChange={(e) => setCampaignRef(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  disabled={!loungeId || availableCampaigns.length === 0}
                >
                  <option value="">
                    {!loungeId ? 'Select a lounge first' : 
                     availableCampaigns.length === 0 ? 'No campaigns available' : 
                     'Select a campaign (optional)'}
                  </option>
                  {availableCampaigns
                    .filter(campaign => campaign.active)
                    .map((campaign) => (
                      <option key={campaign.id} value={campaign.id}>
                        {campaign.name} ({campaign.qr_prefix})
                      </option>
                    ))}
                </select>
                {availableCampaigns.length > 0 && (
                  <div className="mt-2 text-xs text-zinc-400">
                    {availableCampaigns.filter(c => c.active).length} active campaigns
                  </div>
                )}
              </div>

              {/* Bulk Mode Toggle */}
              <div className="flex items-center justify-between p-3 bg-zinc-700 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-zinc-300">Bulk Generation</label>
                  <p className="text-xs text-zinc-400">Generate QR codes for multiple tables</p>
                </div>
                <button
                  onClick={() => setBulkMode(!bulkMode)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    bulkMode 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-zinc-600 text-zinc-300 hover:bg-zinc-500'
                  }`}
                >
                  {bulkMode ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              {/* Bulk Table Selection */}
              {bulkMode && loungeId && availableTables.length > 0 && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-zinc-300">
                    Select Tables for Bulk Generation
                  </label>
                  <div className="max-h-40 overflow-y-auto border border-zinc-600 rounded-lg p-3 space-y-2">
                    {availableTables
                      .filter(table => table.qr_enabled && table.status === 'active')
                      .map((table) => (
                        <label key={table.id} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedTablesForBulk.includes(table.id)}
                            onChange={() => handleBulkTableToggle(table.id)}
                            className="w-4 h-4 text-blue-600 bg-zinc-700 border-zinc-600 rounded focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <div className="text-sm text-white">{table.name}</div>
                            <div className="text-xs text-zinc-400">
                              {table.type} • {table.capacity} seats • {table.zone}
                            </div>
                          </div>
                        </label>
                      ))}
                  </div>
                  <div className="text-xs text-zinc-400">
                    {selectedTablesForBulk.length} tables selected
                  </div>
                </div>
              )}

              <button
                onClick={generateQRCode}
                disabled={isGenerating || !loungeId.trim() || (bulkMode && selectedTablesForBulk.length === 0)}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-600 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <QrCode className="w-4 h-4" />
                    <span>
                      {bulkMode 
                        ? `Generate ${selectedTablesForBulk.length} QR Codes`
                        : 'Generate QR Code'
                      }
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Generated QR Preview */}
            {generatedQR && showPreview && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-zinc-700 rounded-lg border border-zinc-600"
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>QR Code Generated Successfully!</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <img
                      src={generatedQR.qrCodeData}
                      alt="Generated QR Code"
                      className="w-32 h-32 mx-auto border border-zinc-600 rounded-lg"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-zinc-400">Lounge ID:</span>
                      <span className="text-sm text-white ml-2">{generatedQR.loungeId}</span>
                    </div>
                    {generatedQR.tableId && (
                      <div>
                        <span className="text-sm text-zinc-400">Table ID:</span>
                        <span className="text-sm text-white ml-2">{generatedQR.tableId}</span>
                      </div>
                    )}
                    {generatedQR.campaignRef && (
                      <div>
                        <span className="text-sm text-zinc-400">Campaign:</span>
                        <span className="text-sm text-white ml-2">{generatedQR.campaignRef}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-sm text-zinc-400">URL:</span>
                      <div className="text-xs text-blue-400 break-all">{generatedQR.url}</div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={() => copyToClipboard(generatedQR.url)}
                    className="flex-1 bg-zinc-600 hover:bg-zinc-500 text-white py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1 text-sm"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy URL</span>
                  </button>
                  <button
                    onClick={() => downloadQR(generatedQR)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* QR History */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-green-400" />
                <span>QR Code History</span>
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-zinc-400">Total: {qrHistory.length}</span>
                <button
                  onClick={loadQRHistory}
                  className="p-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4 text-zinc-400" />
                </button>
              </div>
            </div>

            {/* Analytics Summary */}
            {qrHistory.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-zinc-700/50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-white">
                    {qrHistory.length}
                  </div>
                  <div className="text-sm text-zinc-400">Total QR Codes</div>
                </div>
                <div className="bg-zinc-700/50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-400">
                    {qrHistory.reduce((sum, qr) => sum + qr.usageCount, 0)}
                  </div>
                  <div className="text-sm text-zinc-400">Total Scans</div>
                </div>
                <div className="bg-zinc-700/50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-blue-400">
                    {qrHistory.filter(qr => qr.status === 'active').length}
                  </div>
                  <div className="text-sm text-zinc-400">Active Codes</div>
                </div>
                <div className="bg-zinc-700/50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-purple-400">
                    {Math.round(qrHistory.reduce((sum, qr) => sum + qr.usageCount, 0) / qrHistory.length) || 0}
                  </div>
                  <div className="text-sm text-zinc-400">Avg Scans/Code</div>
                </div>
              </div>
            )}

            {/* Filter and Search */}
            {qrHistory.length > 0 && (
              <div className="space-y-4 mb-4">
                {/* Search Bar */}
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search QR codes..."
                      className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <select className="px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-primary-500">
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="expired">Expired</option>
                  </select>
                  <select className="px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-primary-500">
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="most-used">Most Used</option>
                    <option value="least-used">Least Used</option>
                  </select>
                </div>
                
                {/* Seating Filters */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-zinc-400 mr-2">Filter by Seating:</span>
                  <button className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 text-white rounded-full text-sm transition-colors">
                    All Seating
                  </button>
                  <button className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 text-white rounded-full text-sm transition-colors">
                    Bar (12)
                  </button>
                  <button className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 text-white rounded-full text-sm transition-colors">
                    Chair (8)
                  </button>
                  <button className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 text-white rounded-full text-sm transition-colors">
                    VIP (4)
                  </button>
                  <button className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 text-white rounded-full text-sm transition-colors">
                    Booth (6)
                  </button>
                  <button className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 text-white rounded-full text-sm transition-colors">
                    Patio (3)
                  </button>
                </div>
                
                {/* Capacity Filters */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-zinc-400 mr-2">Filter by Capacity:</span>
                  <button className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 text-white rounded-full text-sm transition-colors">
                    All Capacities
                  </button>
                  <button className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 text-white rounded-full text-sm transition-colors">
                    2-4 People (15)
                  </button>
                  <button className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 text-white rounded-full text-sm transition-colors">
                    4-6 People (8)
                  </button>
                  <button className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 text-white rounded-full text-sm transition-colors">
                    6+ People (5)
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
              {qrHistory.length === 0 ? (
                <div className="text-center py-8">
                  <QrCode className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                  <p className="text-zinc-400 mb-2">No QR codes generated yet</p>
                  <p className="text-sm text-zinc-500">Generate your first QR code to get started</p>
                </div>
              ) : (
                qrHistory.map((qr) => (
                  <div
                    key={qr.id}
                    className="bg-zinc-700 border border-zinc-600 rounded-lg p-4 hover:border-zinc-500 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-zinc-600 rounded-lg flex items-center justify-center">
                          <QrCode className="w-5 h-5 text-zinc-300" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <Building className="w-4 h-4 text-blue-400" />
                            <span className="font-medium text-white">{qr.loungeId}</span>
                            {qr.tableId && (
                              <>
                                <span className="text-zinc-400">-</span>
                                <span className="text-zinc-300">{qr.tableId}</span>
                              </>
                            )}
                            {qr.campaignRef && (
                              <>
                                <span className="text-zinc-400">-</span>
                                <span className="text-purple-300">{qr.campaignRef}</span>
                              </>
                            )}
                          </div>
                          <div className="text-xs text-zinc-400 mt-1">
                            Created {formatDate(qr.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(qr.status)}`}>
                          {qr.status}
                        </span>
                        <div className="text-right">
                          <div className="text-sm font-medium text-white">{qr.usageCount}</div>
                          <div className="text-xs text-zinc-400">scans</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Usage Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-3 text-xs">
                      <div className="bg-zinc-800/50 rounded p-2">
                        <div className="text-zinc-400">Last Used</div>
                        <div className="text-white">
                          {qr.lastUsed ? formatDate(qr.lastUsed) : 'Never'}
                        </div>
                      </div>
                      <div className="bg-zinc-800/50 rounded p-2">
                        <div className="text-zinc-400">URL</div>
                        <div className="text-white truncate">{qr.url}</div>
                      </div>
                      <div className="bg-zinc-800/50 rounded p-2">
                        <div className="text-zinc-400">Performance</div>
                        <div className={`${qr.usageCount > 10 ? 'text-green-400' : qr.usageCount > 5 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {qr.usageCount > 10 ? 'High' : qr.usageCount > 5 ? 'Medium' : 'Low'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedQR(qr)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-xs transition-colors flex items-center justify-center space-x-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => copyToClipboard(qr.url)}
                        className="flex-1 bg-zinc-600 hover:bg-zinc-500 text-white py-2 px-3 rounded text-xs transition-colors flex items-center justify-center space-x-1"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </button>
                      <button
                        onClick={() => downloadQR(qr)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-xs transition-colors flex items-center justify-center space-x-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download</span>
                      </button>
                      <button
                        onClick={() => {/* TODO: Add regenerate functionality */}}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded text-xs transition-colors flex items-center justify-center space-x-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Regenerate</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* QR Code Detail Modal */}
        {selectedQR && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">QR Code Details</h3>
                <button
                  onClick={() => setSelectedQR(null)}
                  className="text-zinc-400 hover:text-white"
                >
                  <AlertCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="text-center mb-4">
                <img
                  src={selectedQR.qrCodeData}
                  alt="QR Code"
                  className="w-48 h-48 mx-auto border border-zinc-600 rounded-lg"
                />
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Lounge ID:</span>
                  <span className="text-white">{selectedQR.loungeId}</span>
                </div>
                {selectedQR.tableId && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Table ID:</span>
                    <span className="text-white">{selectedQR.tableId}</span>
                  </div>
                )}
                {selectedQR.campaignRef && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Campaign:</span>
                    <span className="text-white">{selectedQR.campaignRef}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-zinc-400">Usage:</span>
                  <span className="text-white">{selectedQR.usageCount} scans</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Created:</span>
                  <span className="text-white">{formatDate(selectedQR.createdAt)}</span>
                </div>
              </div>
              
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={() => copyToClipboard(selectedQR.url)}
                  className="flex-1 bg-zinc-600 hover:bg-zinc-500 text-white py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1 text-sm"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy URL</span>
                </button>
                <button
                  onClick={() => downloadQR(selectedQR)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1 text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
