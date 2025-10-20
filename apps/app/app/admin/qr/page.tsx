'use client'

import React, { useMemo, useState } from 'react'

export default function AdminQRPage() {
  const [loungeId, setLoungeId] = useState('lounge_001')
  const [ref, setRef] = useState('')
  const [u, setU] = useState('')
  const [size, setSize] = useState(512)
  const [format, setFormat] = useState<'png' | 'svg'>('png')
  const [baseUrl, setBaseUrl] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [svg, setSvg] = useState<string>('')
  const [targetUrl, setTargetUrl] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const queryParams = useMemo(() => {
    const params = new URLSearchParams()
    if (loungeId) params.set('loungeId', loungeId)
    if (ref) params.set('ref', ref)
    if (u) params.set('u', u)
    if (size) params.set('size', String(size))
    if (format) params.set('format', format)
    if (baseUrl) params.set('baseUrl', baseUrl)
    return params.toString()
  }, [loungeId, ref, u, size, format, baseUrl])

  const apiPreview = `/api/admin/qr?${queryParams}`

  const generate = async () => {
    setLoading(true)
    setError('')
    setQrDataUrl('')
    setSvg('')
    try {
      const res = await fetch('/api/admin/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loungeId, ref, u, size, format, baseUrl: baseUrl || undefined }),
      })
      const data = await res.json()
      if (!data.ok) throw new Error(data.error || 'Failed to generate')
      setTargetUrl(data.url)
      if (data.qrDataUrl) setQrDataUrl(data.qrDataUrl)
      if (data.svg) setSvg(data.svg)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Lounge QR Generator</h1>
      <div className="grid grid-cols-1 gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-sm text-zinc-400">Lounge ID</span>
          <input value={loungeId} onChange={e => setLoungeId(e.target.value)} className="px-3 py-2 rounded bg-zinc-900 border border-zinc-800" />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm text-zinc-400">Campaign Ref (optional)</span>
          <input value={ref} onChange={e => setRef(e.target.value)} className="px-3 py-2 rounded bg-zinc-900 border border-zinc-800" />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm text-zinc-400">Guest Token u (optional)</span>
          <input value={u} onChange={e => setU(e.target.value)} className="px-3 py-2 rounded bg-zinc-900 border border-zinc-800" />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-sm text-zinc-400">Size (px)</span>
            <input type="number" min={128} max={1024} value={size} onChange={e => setSize(Number(e.target.value))} className="px-3 py-2 rounded bg-zinc-900 border border-zinc-800" />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm text-zinc-400">Format</span>
            <select value={format} onChange={e => setFormat(e.target.value as any)} className="px-3 py-2 rounded bg-zinc-900 border border-zinc-800">
              <option value="png">PNG</option>
              <option value="svg">SVG</option>
            </select>
          </label>
        </div>
        <label className="flex flex-col gap-2">
          <span className="text-sm text-zinc-400">Override Base URL (optional)</span>
          <input placeholder="https://guest.hookahplus.net" value={baseUrl} onChange={e => setBaseUrl(e.target.value)} className="px-3 py-2 rounded bg-zinc-900 border border-zinc-800" />
        </label>

        <div className="flex items-center gap-3">
          <button onClick={generate} disabled={loading || !loungeId} className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700">
            {loading ? 'Generating…' : 'Generate QR'}
          </button>
          <a href={apiPreview} target="_blank" className="text-sm text-zinc-400 underline">Preview API (GET)</a>
        </div>

        {error && <div className="text-red-400 text-sm">{error}</div>}

        {targetUrl && (
          <div className="mt-4">
            <div className="text-sm text-zinc-400 mb-2">Target URL</div>
            <div className="text-sm break-all bg-zinc-900 border border-zinc-800 rounded p-3">{targetUrl}</div>
          </div>
        )}

        {qrDataUrl && (
          <div className="mt-4">
            <div className="text-sm text-zinc-400 mb-2">QR (PNG)</div>
            <img src={qrDataUrl} alt="QR" className="w-full max-w-xs border border-zinc-800 rounded" />
            <a href={qrDataUrl} download={`qr_${loungeId}.png`} className="text-sm text-zinc-400 underline mt-2 inline-block">Download PNG</a>
          </div>
        )}

        {svg && (
          <div className="mt-4">
            <div className="text-sm text-zinc-400 mb-2">QR (SVG)</div>
            <div className="w-full max-w-xs border border-zinc-800 rounded bg-white" dangerouslySetInnerHTML={{ __html: svg }} />
            <a href={`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`} download={`qr_${loungeId}.svg`} className="text-sm text-zinc-400 underline mt-2 inline-block">Download SVG</a>
          </div>
        )}
      </div>
    </div>
  )
}


