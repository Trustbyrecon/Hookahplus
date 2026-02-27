'use client'

import React, { useMemo, useState, useEffect } from 'react'
import GlobalNavigation from '../../../components/GlobalNavigation'
import Card from '../../../components/Card'
import Button from '../../../components/Button'
import { QrCode, Download, Printer, Copy, CheckCircle, RefreshCw, Trash2, List } from 'lucide-react'

interface StoredQR {
  id: string
  loungeId: string
  tableId?: string
  url: string
  qrCodeData?: string
  status: string
  retiredAt?: string | null
  createdAt: string
  updatedAt: string
}

export default function AdminQRPage() {
  const [loungeId, setLoungeId] = useState('CODIGO')
  const [tableId, setTableId] = useState('T-001')
  const [campaign, setCampaign] = useState('')
  const [size, setSize] = useState(512)
  const [format, setFormat] = useState<'png' | 'svg'>('png')
  const [baseUrl, setBaseUrl] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [svg, setSvg] = useState<string>('')
  const [targetUrl, setTargetUrl] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [storedQRs, setStoredQRs] = useState<StoredQR[]>([])
  const [storedLoading, setStoredLoading] = useState(false)

  // Table options
  const tables = [
    { id: 'T-001', name: 'Table 1', zone: 'Zone A', capacity: 4 },
    { id: 'T-002', name: 'Table 2', zone: 'Zone A', capacity: 4 },
    { id: 'T-003', name: 'Table 3', zone: 'Zone B', capacity: 4 },
    { id: 'T-004', name: 'Table 4', zone: 'Zone B', capacity: 4 },
    { id: 'T-005', name: 'Table 5', zone: 'Zone C', capacity: 4 },
  ]

  const generateQRCode = async () => {
    setLoading(true)
    setError('')
    setQrDataUrl('')
    setSvg('')
    
    try {
      const params = new URLSearchParams()
      params.set('loungeId', loungeId)
      params.set('tableId', tableId)
      params.set('size', String(size))
      params.set('format', format)
      if (campaign) params.set('ref', campaign)
      if (baseUrl) params.set('baseUrl', baseUrl)

      const response = await fetch(`/api/admin/qr?${params.toString()}`)
      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || 'Failed to generate QR')
      }

      setTargetUrl(data.url || '')
      if (format === 'png') setQrDataUrl(data.qrDataUrl || '')
      if (format === 'svg') setSvg(data.svg || '')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(targetUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const printQRCode = () => {
    if (qrDataUrl) {
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        const selectedTable = tables.find(t => t.id === tableId)
        printWindow.document.write(`
          <html>
            <head>
              <title>QR Code - ${tableId}</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  text-align: center; 
                  padding: 20px;
                  background: white;
                }
                .qr-container { 
                  display: inline-block; 
                  padding: 20px; 
                  border: 2px solid #333;
                  border-radius: 10px;
                }
                .qr-info {
                  margin-top: 15px;
                  font-size: 14px;
                  color: #333;
                }
                .qr-title {
                  font-size: 18px;
                  font-weight: bold;
                  margin-bottom: 10px;
                }
                @media print {
                  body { margin: 0; padding: 10px; }
                  .qr-container { border: 2px solid #000; }
                }
              </style>
            </head>
            <body>
              <div class="qr-container">
                <div class="qr-title">Hookah+ Pre-Order QR Code</div>
                <img src="${qrDataUrl}" alt="QR Code" style="width: ${size}px; height: ${size}px;" />
                <div class="qr-info">
                  <div><strong>Table:</strong> ${tableId} - ${selectedTable?.name || ''}</div>
                  <div><strong>Zone:</strong> ${selectedTable?.zone || ''}</div>
                  ${campaign ? `<div><strong>Campaign:</strong> ${campaign}</div>` : ''}
                  <div style="margin-top: 10px; font-size: 12px; color: #666;">
                    Scan this QR code to place your pre-order
                  </div>
                </div>
              </div>
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
      }
    }
  }

  // Auto-generate on mount or when table changes
  useEffect(() => {
    if (tableId) {
      generateQRCode()
    }
  }, [tableId, campaign])

  const fetchStoredQRs = async () => {
    if (!loungeId) return
    setStoredLoading(true)
    try {
      const res = await fetch(`/api/qr-generator?loungeId=${encodeURIComponent(loungeId)}`)
      const data = await res.json().catch(() => ({}))
      setStoredQRs(data?.qrCodes ?? [])
    } finally {
      setStoredLoading(false)
    }
  }

  useEffect(() => {
    fetchStoredQRs()
  }, [loungeId])

  const handleRetire = async (tId: string) => {
    try {
      const res = await fetch('/api/qr-generator', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loungeId, tableId: tId, action: 'retire' }),
      })
      const data = await res.json().catch(() => ({}))
      if (data?.success) fetchStoredQRs()
    } catch (e) {
      console.error('Retire failed:', e)
    }
  }

  const handleReprint = (qr: StoredQR) => {
    if (qr.qrCodeData) {
      const w = window.open('', '_blank')
      if (w) {
        w.document.write(`
          <html><head><title>QR - ${qr.tableId || 'kiosk'}</title>
          <style>body{font-family:Arial;text-align:center;padding:20px;background:white}</style></head>
          <body><div><h3>Table: ${qr.tableId || 'Kiosk'}</h3>
          <img src="${qr.qrCodeData}" alt="QR" style="width:256px;height:256px" />
          <p style="font-size:12px;color:#666">Scan to start session</p></div></body></html>`)
        w.document.close()
        w.print()
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation />
      
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <QrCode className="w-10 h-10 text-teal-400" />
            QR Code Management
          </h1>
          <p className="text-xl text-zinc-400">
            Generate QR codes for table pre-ordering
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Configuration</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Lounge ID
                </label>
                <input
                  type="text"
                  value={loungeId}
                  onChange={(e) => setLoungeId(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Select Table
                </label>
                <select
                  value={tableId}
                  onChange={(e) => setTableId(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {tables.map(table => (
                    <option key={table.id} value={table.id}>
                      {table.name} ({table.zone} - {table.capacity} people)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Campaign (Optional)
                </label>
                <input
                  type="text"
                  value={campaign}
                  onChange={(e) => setCampaign(e.target.value)}
                  placeholder="e.g., vip-experience"
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Size (px)
                  </label>
                  <input
                    type="number"
                    min={128}
                    max={1024}
                    value={size}
                    onChange={(e) => setSize(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Format
                  </label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as any)}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="png">PNG</option>
                    <option value="svg">SVG</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Override Base URL (Optional)
                </label>
                <input
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://hookahplus.net"
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <Button
                onClick={generateQRCode}
                disabled={loading || !tableId || !loungeId}
                className="w-full bg-teal-600 hover:bg-teal-500"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Generating...' : 'Generate QR Code'}
              </Button>
            </div>
          </Card>

          {/* Preview */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Preview</h2>
            
            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg mb-4">
                <div className="text-red-400 text-sm">{error}</div>
              </div>
            )}

            {targetUrl && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Target URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={targetUrl}
                    readOnly
                    className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
                  />
                  <Button
                    onClick={copyToClipboard}
                    className="bg-zinc-700 hover:bg-zinc-600"
                    size="sm"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                {copied && (
                  <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Copied to clipboard!
                  </p>
                )}
              </div>
            )}

            {qrDataUrl && (
              <div className="mb-4">
                <div className="text-center mb-4">
                  <div className="inline-block p-4 bg-white rounded-lg">
                    <img 
                      src={qrDataUrl} 
                      alt="QR Code" 
                      className="w-full max-w-xs"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = qrDataUrl
                      link.download = `qr-${tableId}.png`
                      link.click()
                    }}
                    className="bg-green-600 hover:bg-green-500"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PNG
                  </Button>
                  <Button
                    onClick={printQRCode}
                    className="bg-purple-600 hover:bg-purple-500"
                    size="sm"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </Button>
                </div>
              </div>
            )}

            {svg && (
              <div className="mb-4">
                <div className="text-center mb-4">
                  <div className="inline-block p-4 bg-white rounded-lg">
                    <div dangerouslySetInnerHTML={{ __html: svg }} />
                  </div>
                </div>
                <Button
                  onClick={() => {
                    const link = document.createElement('a')
                    link.href = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
                    link.download = `qr-${tableId}.svg`
                    link.click()
                  }}
                  className="w-full bg-green-600 hover:bg-green-500"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download SVG
                </Button>
              </div>
            )}

            {!qrDataUrl && !svg && !loading && (
              <div className="text-center py-12 text-zinc-400">
                <QrCode className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
                <p>Configure settings and generate QR code</p>
              </div>
            )}
          </Card>
        </div>

        {/* Stored QRs - List, Reprint, Retire */}
        <Card className="p-6 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <List className="w-5 h-5 text-teal-400" />
              Stored QR Codes (Audit)
            </h2>
            <Button onClick={fetchStoredQRs} disabled={storedLoading} size="sm" className="bg-zinc-700 hover:bg-zinc-600">
              <RefreshCw className={`w-4 h-4 mr-1 ${storedLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          {storedLoading ? (
            <div className="py-8 text-center text-zinc-400">Loading...</div>
          ) : storedQRs.length === 0 ? (
            <p className="text-zinc-400 text-sm">No stored QR codes for this lounge. Generate some above.</p>
          ) : (
            <div className="space-y-3">
              {storedQRs.map((qr) => (
                <div
                  key={qr.id}
                  className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg border border-zinc-700"
                >
                  <div>
                    <span className="font-medium text-white">Table: {qr.tableId || 'Kiosk'}</span>
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded ${qr.status === 'inactive' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                      {qr.status}
                    </span>
                    <p className="text-xs text-zinc-500 mt-1">
                      Created: {new Date(qr.createdAt).toLocaleString()}
                      {qr.retiredAt && ` • Retired: ${new Date(qr.retiredAt).toLocaleString()}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleReprint(qr)} size="sm" className="bg-teal-600 hover:bg-teal-500" disabled={!qr.qrCodeData || qr.status === 'inactive'}>
                      <Printer className="w-4 h-4 mr-1" />
                      Reprint
                    </Button>
                    {qr.status === 'active' && (
                      <Button onClick={() => handleRetire(qr.tableId ?? 'kiosk')} size="sm" className="bg-red-600/80 hover:bg-red-600">
                        <Trash2 className="w-4 h-4 mr-1" />
                        Retire
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
