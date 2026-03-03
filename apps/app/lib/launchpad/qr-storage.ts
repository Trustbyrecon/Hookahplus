/**
 * QR Code Storage Service
 *
 * Stores and retrieves QR codes via durable org settings persistence.
 */

import { prisma } from '../db';

export interface StoredQRCode {
  id: string;
  loungeId: string;
  tableId: string | null; // null for kiosk
  type: 'table' | 'kiosk';
  url: string;
  qrCodeDataUrl: string;
  status: 'active' | 'inactive';
  retiredAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Store QR codes in database
 */
export async function storeQRCodes(
  loungeId: string,
  qrCodes: Array<{
    tableId: string | null;
    type: 'table' | 'kiosk';
    url: string;
    qrCodeDataUrl: string;
  }>
): Promise<boolean> {
  try {
    const key = `qr_codes:${loungeId}`;
    const existing = await prisma.orgSetting.findUnique({ where: { key } });
    const parsed: StoredQRCode[] = existing?.value ? JSON.parse(existing.value) : [];
    const now = new Date();

    for (const qr of qrCodes) {
      const id = `${loungeId}:${qr.tableId || 'kiosk'}:${qr.type}`;
      const currentIdx = parsed.findIndex((p) => p.id === id);
      const existingItem = currentIdx >= 0 ? parsed[currentIdx] : null;
      const next: StoredQRCode = {
        id,
        loungeId,
        tableId: qr.tableId,
        type: qr.type,
        url: qr.url,
        qrCodeDataUrl: qr.qrCodeDataUrl,
        status: (existingItem as StoredQRCode)?.status === 'inactive' ? 'inactive' : 'active',
        retiredAt: (existingItem as StoredQRCode)?.retiredAt ?? null,
        createdAt: currentIdx >= 0 ? new Date(parsed[currentIdx].createdAt) : now,
        updatedAt: now,
      };
      if (currentIdx >= 0) parsed[currentIdx] = next;
      else parsed.push(next);
    }

    await prisma.orgSetting.upsert({
      where: { key },
      create: {
        key,
        value: JSON.stringify(parsed),
        description: `Durable QR storage for lounge ${loungeId}`,
        category: 'qr',
        isActive: true,
      },
      update: {
        value: JSON.stringify(parsed),
        isActive: true,
      },
    });

    console.log(`[QR Storage] Stored ${qrCodes.length} QR codes for lounge ${loungeId}`);
    return true;
  } catch (error) {
    console.error('[QR Storage] Error:', error);
    return false;
  }
}

/**
 * Retrieve QR codes for a lounge
 */
export async function getQRCodesForLounge(
  loungeId: string
): Promise<StoredQRCode[]> {
  try {
    const key = `qr_codes:${loungeId}`;
    const row = await prisma.orgSetting.findUnique({ where: { key } });
    if (!row?.value) return [];
    const parsed = JSON.parse(row.value) as StoredQRCode[];
    return parsed.map((p) => ({
      ...p,
      status: (p as StoredQRCode).status ?? 'active',
      retiredAt: (p as StoredQRCode).retiredAt ? new Date((p as StoredQRCode).retiredAt!) : null,
      createdAt: new Date(p.createdAt),
      updatedAt: new Date(p.updatedAt),
    }));
  } catch (error) {
    console.error('[QR Storage] Error:', error);
    return [];
  }
}

/**
 * Get QR code by table ID
 */
export async function getQRCodeByTableId(
  loungeId: string,
  tableId: string
): Promise<StoredQRCode | null> {
  try {
    const qrCodes = await getQRCodesForLounge(loungeId);
    return qrCodes.find(qr => qr.tableId === tableId) || null;
  } catch (error) {
    console.error('[QR Storage] Error:', error);
    return null;
  }
}

/**
 * Retire (deactivate) a QR code by table ID
 */
export async function retireQRCode(
  loungeId: string,
  tableId: string
): Promise<boolean> {
  try {
    const qrCodes = await getQRCodesForLounge(loungeId);
    const idx = qrCodes.findIndex((q) => q.tableId === tableId);
    if (idx < 0) return false;
    const key = `qr_codes:${loungeId}`;
    const existing = await prisma.orgSetting.findUnique({ where: { key } });
    const parsed: StoredQRCode[] = existing?.value ? JSON.parse(existing.value) : [];
    const target = parsed.find((p) => (tableId === 'kiosk' ? p.tableId === null : p.tableId === tableId));
    if (!target) return false;
    const now = new Date();
    const updated = parsed.map((p) =>
      (tableId === 'kiosk' ? p.tableId === null : p.tableId === tableId)
        ? { ...p, status: 'inactive' as const, retiredAt: now, updatedAt: now }
        : p
    );
    await prisma.orgSetting.upsert({
      where: { key },
      create: { key, value: JSON.stringify(updated), description: `QR storage ${loungeId}`, category: 'qr', isActive: true },
      update: { value: JSON.stringify(updated) },
    });
    return true;
  } catch (error) {
    console.error('[QR Storage] Retire error:', error);
    return false;
  }
}

