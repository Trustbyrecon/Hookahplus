/**
 * LaunchPad QR Code Generator
 * 
 * Generates QR codes for tables and kiosk from LaunchPad config
 */

import QRCode from 'qrcode';
import { LoungeOpsConfig } from '../../types/launchpad';

export interface QRCodePack {
  tableQRCodes: Array<{
    tableId: string;
    qrCodeDataUrl: string;
    url: string;
  }>;
  kioskQRCode: {
    qrCodeDataUrl: string;
    url: string;
  };
}

/**
 * Generate QR code pack for a lounge
 */
export async function generateQRCodePack(
  config: LoungeOpsConfig,
  loungeId: string,
  baseUrl: string = process.env.NEXT_PUBLIC_APP_URL || 'https://hookahplus.net'
): Promise<QRCodePack> {
  const tableQRCodes = [];
  
  // Generate QR codes for each table
  for (let i = 1; i <= config.tables_count; i++) {
    const tableId = `T-${String(i).padStart(3, '0')}`;
    const url = `${baseUrl}/guest/${loungeId}/table/${tableId}`;
    
    const qrCodeDataUrl = await QRCode.toDataURL(url, {
      width: 512,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
    
    tableQRCodes.push({
      tableId,
      qrCodeDataUrl,
      url,
    });
  }
  
  // Generate kiosk QR code
  const kioskUrl = `${baseUrl}/guest/${loungeId}/kiosk`;
  const kioskQRCode = await QRCode.toDataURL(kioskUrl, {
    width: 512,
    margin: 2,
    errorCorrectionLevel: 'M',
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  });
  
  return {
    tableQRCodes,
    kioskQRCode: {
      qrCodeDataUrl: kioskQRCode,
      url: kioskUrl,
    },
  };
}

/**
 * Generate QR code as PNG buffer (for download)
 */
export async function generateQRCodePNG(
  url: string
): Promise<Buffer> {
  return await QRCode.toBuffer(url, {
    width: 512,
    margin: 2,
    errorCorrectionLevel: 'M',
    type: 'png',
  });
}

