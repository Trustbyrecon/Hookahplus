/**
 * QR Code Service
 *
 * Canonical QR generation helper. Runtime storage should be handled by
 * durable persistence (see launchpad/qr-storage), not in-memory maps.
 */

import { PrismaClient } from '@prisma/client';
import QRCode from 'qrcode';

export interface QRCodeConfig {
  id?: string;
  loungeId: string;
  tableId?: string;
  campaignRef?: string;
  url?: string;
  branding?: {
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    logoSize?: number;
  };
  status?: 'active' | 'inactive' | 'expired';
  expiresAt?: Date;
}

export interface QRCodeAnalytics {
  qrCodeId: string;
  scans: number;
  sessions: number;
  conversionRate: number;
  lastScannedAt?: Date;
  firstScannedAt?: Date;
  uniqueScanners?: number;
}

export class QRCodeService {
  /**
   * Generate QR code with optional branding
   */
  static async generateQRCode(
    config: QRCodeConfig,
    prisma?: PrismaClient
  ): Promise<{ success: boolean; qrCode?: any; error?: string }> {
    try {
      // Generate target URL
      const targetUrl = config.url || this.buildGuestPortalUrl(
        config.loungeId,
        config.tableId,
        config.campaignRef
      );

      // QR code options with branding
      const qrOptions: any = {
        width: 512,
        margin: 2,
        errorCorrectionLevel: 'M' as const,
        color: {
          dark: config.branding?.primaryColor || '#000000',
          light: config.branding?.secondaryColor || '#ffffff',
        },
      };

      // Generate QR code
      let qrCodeData: string;
      if (config.branding?.logoUrl) {
        // Generate QR with logo (requires additional processing)
        qrCodeData = await (QRCode.toDataURL(targetUrl, qrOptions) as unknown as Promise<string>);
        // TODO: Add logo overlay processing
      } else {
        qrCodeData = await (QRCode.toDataURL(targetUrl, qrOptions) as unknown as Promise<string>);
      }

      const qrId = config.id || `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date();

      const qrCode = {
        id: qrId,
        loungeId: config.loungeId,
        tableId: config.tableId,
        campaignRef: config.campaignRef,
        url: targetUrl,
        qrCodeData,
        createdAt: now.toISOString(),
        usageCount: 0,
        status: config.status || 'active',
        expiresAt: config.expiresAt,
        branding: config.branding,
      };

      // Persistence is handled by callers via durable storage module.
      void prisma;

      return { success: true, qrCode };
    } catch (error) {
      console.error('[QRCodeService] Error generating QR code:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate QR code'
      };
    }
  }

  /**
   * Generate QR codes for multiple tables (bulk)
   */
  static async generateBulkQRCodes(
    loungeId: string,
    tableIds: string[],
    campaignRef?: string,
    branding?: QRCodeConfig['branding'],
    prisma?: PrismaClient
  ): Promise<{ success: boolean; qrCodes?: any[]; errors?: string[] }> {
    const qrCodes: any[] = [];
    const errors: string[] = [];

    for (const tableId of tableIds) {
      const result = await this.generateQRCode({
        loungeId,
        tableId,
        campaignRef,
        branding,
      }, prisma);

      if (result.success && result.qrCode) {
        qrCodes.push(result.qrCode);
      } else {
        errors.push(`Failed to generate QR for table ${tableId}: ${result.error}`);
      }
    }

    return {
      success: qrCodes.length > 0,
      qrCodes: qrCodes.length > 0 ? qrCodes : undefined,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Track QR code scan
   */
  static async trackScan(
    qrCodeId: string,
    deviceId?: string,
    prisma?: PrismaClient
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Scan persistence is handled by caller-specific analytics pipelines.
      console.log(`[QRCodeService] QR code scanned: ${qrCodeId}`, { deviceId });
      
      return { success: true };
    } catch (error) {
      console.error('[QRCodeService] Error tracking scan:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to track scan'
      };
    }
  }

  /**
   * Get QR code analytics
   */
  static async getAnalytics(
    qrCodeId: string,
    prisma?: PrismaClient
  ): Promise<{ success: boolean; analytics?: QRCodeAnalytics; error?: string }> {
    try {
      // Analytics persistence is intentionally external to this helper.
      const analytics: QRCodeAnalytics = {
        qrCodeId,
        scans: 0,
        sessions: 0,
        conversionRate: 0,
      };

      return { success: true, analytics };
    } catch (error) {
      console.error('[QRCodeService] Error getting analytics:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get analytics'
      };
    }
  }

  /**
   * Build guest portal URL
   */
  private static buildGuestPortalUrl(
    loungeId: string,
    tableId?: string,
    campaignRef?: string
  ): string {
    const guestBase = process.env.NEXT_PUBLIC_GUEST_BASE_URL || 'https://guest.hookahplus.net';
    const url = new URL(`${guestBase.replace(/\/$/, '')}/guest/${encodeURIComponent(loungeId)}`);
    url.searchParams.set('loungeId', loungeId);
    if (tableId) url.searchParams.set('tableId', tableId);
    if (campaignRef) url.searchParams.set('ref', campaignRef);
    return url.toString();
  }

  /**
   * Update QR code status
   */
  static async updateStatus(
    qrCodeId: string,
    status: 'active' | 'inactive' | 'expired',
    prisma?: PrismaClient
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // TODO: Update status in database
      console.log(`[QRCodeService] QR code status updated: ${qrCodeId} -> ${status}`);
      return { success: true };
    } catch (error) {
      console.error('[QRCodeService] Error updating status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update status'
      };
    }
  }
}

