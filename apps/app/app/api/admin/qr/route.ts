import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'

/**
 * POST /api/admin/qr
 * Body: { loungeId: string; tableId?: string; ref?: string; u?: string; size?: number; format?: 'png' | 'svg'; baseUrl?: string }
 * Returns: { ok: true, url: string, qrDataUrl?: string, svg?: string }
 *
 * Generates a QR for the canonical Guest Enter URL with campaign/user params.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const {
      loungeId,
      tableId,
      ref,
      u,
      size = 512,
      format = 'png',
      baseUrl,
    }: {
      loungeId?: string
      tableId?: string
      ref?: string
      u?: string
      size?: number
      format?: 'png' | 'svg'
      baseUrl?: string
    } = body || {}

    if (!loungeId) {
      return NextResponse.json({ ok: false, error: 'Missing loungeId' }, { status: 400 })
    }

    // Default to production guest domain if provided, fallback to env or localhost
    const defaultGuestBase = process.env.NEXT_PUBLIC_GUEST_BASE_URL || 'http://localhost:3001'
    const guestBase = (baseUrl || defaultGuestBase).replace(/\/$/, '')

    const url = new URL(`${guestBase}/guest/${encodeURIComponent(loungeId)}`)
    url.searchParams.set('loungeId', loungeId)
    if (tableId) url.searchParams.set('tableId', tableId)
    if (ref) url.searchParams.set('ref', ref)
    if (u) url.searchParams.set('u', u)

    const qrOptions = {
      width: Math.max(128, Math.min(1024, Number(size) || 512)),
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
      errorCorrectionLevel: 'M' as const,
    }

    if (format === 'svg') {
      const svg = await QRCode.toString(url.toString(), { type: 'svg', ...qrOptions })
      return NextResponse.json({ ok: true, url: url.toString(), svg })
    }

    const dataUrl = await QRCode.toDataURL(url.toString(), qrOptions)
    return NextResponse.json({ ok: true, url: url.toString(), qrDataUrl: dataUrl })
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || 'Failed to generate QR' }, { status: 500 })
  }
}

/**
 * GET /api/admin/qr?loungeId=...&tableId=...&ref=...&u=...&size=...&format=png|svg&baseUrl=...
 * Quick link generation without body
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const loungeId = searchParams.get('loungeId') || undefined
    const tableId = searchParams.get('tableId') || undefined
    const ref = searchParams.get('ref') || undefined
    const u = searchParams.get('u') || undefined
    const size = Number(searchParams.get('size') || '512')
    const format = (searchParams.get('format') as 'png' | 'svg') || 'png'
    const baseUrl = searchParams.get('baseUrl') || undefined

    if (!loungeId) {
      return NextResponse.json({ ok: false, error: 'Missing loungeId' }, { status: 400 })
    }

    const defaultGuestBase = process.env.NEXT_PUBLIC_GUEST_BASE_URL || 'http://localhost:3001'
    const guestBase = (baseUrl || defaultGuestBase).replace(/\/$/, '')

    const url = new URL(`${guestBase}/guest/${encodeURIComponent(loungeId)}`)
    url.searchParams.set('loungeId', loungeId)
    if (tableId) url.searchParams.set('tableId', tableId)
    if (ref) url.searchParams.set('ref', ref)
    if (u) url.searchParams.set('u', u)

    const qrOptions = {
      width: Math.max(128, Math.min(1024, Number(size) || 512)),
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
      errorCorrectionLevel: 'M' as const,
    }

    if (format === 'svg') {
      const svg = await QRCode.toString(url.toString(), { type: 'svg', ...qrOptions })
      return NextResponse.json({ ok: true, url: url.toString(), svg })
    }

    const dataUrl = await QRCode.toDataURL(url.toString(), qrOptions)
    return NextResponse.json({ ok: true, url: url.toString(), qrDataUrl: dataUrl })
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || 'Failed to generate QR' }, { status: 500 })
  }
}


