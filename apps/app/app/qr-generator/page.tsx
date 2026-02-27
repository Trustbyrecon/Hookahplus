"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  QrCode, 
  Download, 
  Copy, 
  RefreshCw, 
  Settings,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Eye,
  EyeOff,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import GlobalNavigation from '../../components/GlobalNavigation';
import { SessionProvider, useSessionContext } from '../../contexts/SessionContext';
import { Badge } from '../../components';

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
  tables: TableConfig[];
  campaigns?: CampaignConfig[];
}

interface TableConfig {
  id: string;
  name: string;
  type: string;
  capacity: number;
  zone: string;
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

export default function QRGeneratorApp() {
  return (
    <SessionProvider>
      <QRGeneratorAppContent />
    </SessionProvider>
  );
}

function QRGeneratorAppContent() {
  const { sessions } = useSessionContext();
  const [loungeId, setLoungeId] = useState('CODIGO');
  const [tableId, setTableId] = useState('');
  const [campaignRef, setCampaignRef] = useState('');
  const [generatedQR, setGeneratedQR] = useState<QRCodeData | null>(null);
  const [qrHistory, setQrHistory] = useState<QRCodeData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedQR, setSelectedQR] = useState<QRCodeData | null>(null);
  
  // State for YAML integration
  const [lounges, setLounges] = useState<LoungeConfig[]>([]);
  const [selectedLounge, setSelectedLounge] = useState<LoungeConfig | null>(null);
  const [availableTables, setAvailableTables] = useState<TableConfig[]>([]);
  const [availableCampaigns, setAvailableCampaigns] = useState<CampaignConfig[]>([]);
  const [isLoadingLounges, setIsLoadingLounges] = useState(true);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedTablesForBulk, setSelectedTablesForBulk] = useState<string[]>([]);
  
  // Calculate QR code performance from sessions
  const qrPerformance = useMemo(() => {
    const performanceMap = new Map<string, { scans: number; sessions: number; conversionRate: number }>();
    
    qrHistory.forEach(qr => {
      // Find sessions created from this QR (by tableId or campaignRef)
      const relatedSessions = sessions.filter(s => {
        if (qr.tableId && s.tableId === qr.tableId) return true;
        if (qr.campaignRef && s.source === qr.campaignRef) return true;
        return false;
      });
      
      performanceMap.set(qr.id, {
        scans: qr.usageCount || 0,
        sessions: relatedSessions.length,
        conversionRate: (qr.usageCount || 0) > 0 
          ? (relatedSessions.length / qr.usageCount) * 100 
          : 0
      });
    });
    
    return performanceMap;
  }, [qrHistory, sessions]);
  
  // Check if table has active session
  const getTableSessionStatus = (tableId: string) => {
    return sessions.find(s => s.tableId === tableId);
  };

  // Load QR history and lounges on component mount
  useEffect(() => {
    loadQRHistory();
    loadLounges();
  }, []);

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
      
      if (!response.ok) {
        console.error('[QR Generator] API response not OK:', response.status, response.statusText);
        return;
      }
      
      const data = await response.json();
      
      console.log('[QR Generator] Loaded lounges response:', JSON.stringify(data, null, 2));
      console.log('[QR Generator] Response has success?', 'success' in data);
      console.log('[QR Generator] Response has lounges?', 'lounges' in data);
      console.log('[QR Generator] data.success value:', data.success);
      console.log('[QR Generator] data.lounges value:', data.lounges);
      
      if (data.success && Array.isArray(data.lounges)) {
        console.log('[QR Generator] Setting lounges:', data.lounges);
        setLounges(data.lounges);
      } else {
        console.warn('[QR Generator] Unexpected response format. Full response:', data);
        // Try to extract lounges even if format is slightly different
        if (data.lounges && Array.isArray(data.lounges)) {
          console.log('[QR Generator] Found lounges array, using it anyway');
          setLounges(data.lounges);
        }
      }
    } catch (error) {
      console.error('[QR Generator] Failed to load lounges:', error);
    } finally {
      setIsLoadingLounges(false);
    }
  };

  const loadLoungeDetails = async (loungeId: string) => {
    try {
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
    if (!loungeId.trim()) return;

    setIsGenerating(true);
    try {
      // Check if bulk mode
      const isBulk = bulkMode && selectedTablesForBulk.length > 0;
      
      const response = await fetch('/api/qr-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loungeId,
          tableId: !isBulk ? (tableId || undefined) : undefined,
          campaignRef: campaignRef || undefined,
          bulkTables: isBulk ? selectedTablesForBulk : undefined,
        }),
      });

      const data = await response.json();
      if (data.success) {
        if (isBulk && data.qrCodes) {
          // Bulk generation - show success message
          alert(`Successfully generated ${data.qrCodes.length} QR code(s)!`);
          setGeneratedQR(data.qrCodes[0]); // Show first one as preview
          setShowPreview(true);
        } else {
          setGeneratedQR(data.qrCode);
          setShowPreview(true);
        }
        loadQRHistory(); // Refresh history
      } else {
        console.error('Failed to generate QR code:', data.error);
        alert(`Failed to generate QR code: ${data.error}`);
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Error generating QR code. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQR = (qrData: QRCodeData) => {
    const link = document.createElement('a');
    link.href = qrData.qrCodeData;
    link.download = `qr-${qrData.loungeId}-${qrData.tableId || 'general'}.png`;
    link.click();
  };

  const copyQRUrl = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center space-x-3">
            <QrCode className="w-10 h-10 text-purple-400" />
            <span>QR Generator</span>
          </h1>
          <p className="text-zinc-400 text-lg">
            Generate QR codes for tables, campaigns, and lounge management
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Generation Form */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center space-x-2">
              <Settings className="w-5 h-5 text-purple-400" />
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
                  className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
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

              {/* Bulk Mode Toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="bulkMode"
                  checked={bulkMode}
                  onChange={(e) => {
                    setBulkMode(e.target.checked);
                    if (e.target.checked) {
                      setTableId('');
                    } else {
                      setSelectedTablesForBulk([]);
                    }
                  }}
                  className="w-4 h-4 text-purple-600 bg-zinc-700 border-zinc-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="bulkMode" className="text-sm text-zinc-300">
                  Generate QR codes for multiple tables
                </label>
              </div>

              {!bulkMode ? (
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Table (Optional)
                  </label>
                  <select
                    value={tableId}
                    onChange={(e) => setTableId(e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
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
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Select Tables ({selectedTablesForBulk.length} selected)
                  </label>
                  <div className="max-h-48 overflow-y-auto border border-zinc-600 rounded-lg p-2 bg-zinc-700">
                    {availableTables
                      .filter(table => table.qr_enabled && table.status === 'active')
                      .map((table) => (
                        <label
                          key={table.id}
                          className="flex items-center gap-2 p-2 hover:bg-zinc-600 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedTablesForBulk.includes(table.id)}
                            onChange={() => handleBulkTableToggle(table.id)}
                            className="w-4 h-4 text-purple-600 bg-zinc-800 border-zinc-600 rounded focus:ring-purple-500"
                          />
                          <span className="text-sm text-white">
                            {table.name} ({table.type}, {table.capacity} seats) - {table.zone}
                          </span>
                        </label>
                      ))}
                    {availableTables.filter(table => table.qr_enabled && table.status === 'active').length === 0 && (
                      <p className="text-sm text-zinc-400 p-2">No tables available</p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Campaign (Optional)
                </label>
                <select
                  value={campaignRef}
                  onChange={(e) => setCampaignRef(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
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
              </div>

              <button
                onClick={generateQRCode}
                disabled={isGenerating || !loungeId.trim() || (bulkMode && selectedTablesForBulk.length === 0)}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-600 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
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
                        ? `Generate ${selectedTablesForBulk.length} QR Code(s)`
                        : 'Generate QR Code'}
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Generated QR Preview */}
            {generatedQR && showPreview && (
              <div className="mt-6 p-4 bg-zinc-900/50 border border-zinc-600 rounded-lg">
                <div className="text-center">
                  <img 
                    src={generatedQR.qrCodeData} 
                    alt="Generated QR Code" 
                    className="mx-auto mb-4 w-48 h-48"
                  />
                  <p className="text-sm text-zinc-400 mb-4 break-all">
                    {generatedQR.url}
                  </p>
                  <div className="flex space-x-2 justify-center">
                    <button
                      onClick={() => downloadQR(generatedQR)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                    <button
                      onClick={() => copyQRUrl(generatedQR.url)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy URL</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* QR History & Analytics */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center space-x-2">
                <Clock className="w-5 h-5 text-purple-400" />
                <span>Recent QR Codes</span>
              </h2>
              <button
                onClick={() => {
                  // TODO: Show analytics dashboard
                  alert('Analytics dashboard coming soon!');
                }}
                className="px-3 py-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg text-sm transition-colors flex items-center gap-1"
              >
                <BarChart3 className="w-4 h-4" />
                Analytics
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {qrHistory.length === 0 ? (
                <div className="text-center py-8 text-zinc-400">
                  <QrCode className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
                  <p>No QR codes generated yet</p>
                </div>
              ) : (
                qrHistory.map((qr) => {
                  const performance = qrPerformance.get(qr.id);
                  const tableSession = qr.tableId ? getTableSessionStatus(qr.tableId) : null;
                  
                  return (
                    <div key={qr.id} className="bg-zinc-900/50 border border-zinc-600 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-white">
                            {qr.loungeId} {qr.tableId && `- ${qr.tableId}`}
                          </h4>
                          <p className="text-sm text-zinc-400">
                            {new Date(qr.createdAt).toLocaleString()}
                          </p>
                          <p className="text-xs text-zinc-500 truncate">
                            {qr.url}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            qr.status === 'active' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {qr.status}
                          </span>
                          <button
                            onClick={() => downloadQR(qr)}
                            className="p-1 hover:bg-zinc-700 rounded transition-colors"
                          >
                            <Download className="w-4 h-4 text-zinc-400" />
                          </button>
                        </div>
                      </div>
                      
                      {/* QR Performance Metrics */}
                      {performance && (
                        <div className="mt-3 pt-3 border-t border-zinc-700 grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <div className="text-zinc-400">Scans</div>
                            <div className="text-white font-semibold">{performance.scans}</div>
                          </div>
                          <div>
                            <div className="text-zinc-400">Sessions</div>
                            <div className="text-white font-semibold">{performance.sessions}</div>
                          </div>
                          <div>
                            <div className="text-zinc-400">Conversion</div>
                            <div className="text-teal-400 font-semibold">
                              {performance.conversionRate.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Table Session Status */}
                      {tableSession && (
                        <div className="mt-2 pt-2 border-t border-zinc-700">
                          <Badge className="bg-orange-500/20 text-orange-400 text-xs">
                            Active Session: {tableSession.customerName}
                          </Badge>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
