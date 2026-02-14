/**
 * QR Code Storage Service
 * 
 * Stores and retrieves QR codes from database
 * TODO: Add QRCode model to Prisma schema
 */

import { prisma } from '../db';

export interface StoredQRCode {
  id: string;
  loungeId: string;
  tableId: string | null; // null for kiosk
  type: 'table' | 'kiosk';
  url: string;
  qrCodeDataUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Store QR codes in database
 * TODO: Implement when QRCode model is added to schema
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
    // TODO: Uncomment when QRCode model is added to Prisma schema
    /*
    await prisma.qRCode.createMany({
      data: qrCodes.map(qr => ({
        loungeId,
        tableId: qr.tableId,
        type: qr.type,
        url: qr.url,
        qrCodeDataUrl: qr.qrCodeDataUrl,
      })),
    });
    */

    // For now, just log that we would store them
    console.log(`[QR Storage] Would store ${qrCodes.length} QR codes for lounge ${loungeId}`);
    return true;
  } catch (error) {
    console.error('[QR Storage] Error:', error);
    return false;
  }
}

/**
 * Retrieve QR codes for a lounge
 * TODO: Implement when QRCode model is added to schema
 */
export async function getQRCodesForLounge(
  loungeId: string
): Promise<StoredQRCode[]> {
  try {
    // TODO: Uncomment when QRCode model is added to Prisma schema
    /*
    const qrCodes = await prisma.qRCode.findMany({
      where: { loungeId },
      orderBy: { createdAt: 'desc' },
    });

    return qrCodes.map(qr => ({
      id: qr.id,
      loungeId: qr.loungeId,
      tableId: qr.tableId,
      type: qr.type as 'table' | 'kiosk',
      url: qr.url,
      qrCodeDataUrl: qr.qrCodeDataUrl,
      createdAt: qr.createdAt,
      updatedAt: qr.updatedAt,
    }));
    */

    // For now, return empty array
    return [];
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

