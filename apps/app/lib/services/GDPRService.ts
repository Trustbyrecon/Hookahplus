/**
 * GDPR Compliance Service
 * 
 * Handles GDPR compliance features including data export and deletion
 */

import { PrismaClient } from '@prisma/client';

export interface UserDataExport {
  userId: string;
  email?: string;
  phone?: string;
  sessions: any[];
  reservations: any[];
  loyaltyData?: any;
  preferences?: any;
  createdAt: Date;
}

export interface DataDeletionRequest {
  id: string;
  userId: string;
  email?: string;
  phone?: string;
  reason?: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requestedAt: Date;
  completedAt?: Date;
}

export class GDPRService {
  /**
   * Export all user data (GDPR Article 15 - Right of Access)
   */
  static async exportUserData(
    userId: string,
    prisma: PrismaClient
  ): Promise<{ success: boolean; data?: UserDataExport; error?: string }> {
    try {
      // Get user sessions
      const sessions = await prisma.session.findMany({
        where: {
          OR: [
            { customerRef: userId },
            { customerPhone: userId },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });

      // Get user reservations
      // Note: Reservations table may need customerId field
      const reservations: any[] = []; // Placeholder

      // Get loyalty data
      const loyaltyAccount = await prisma.loyaltyAccount.findFirst({
        where: {
          OR: [
            { customerId: userId },
            { customerPhone: userId },
          ],
        },
        include: {
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 100,
          },
        },
      });

      const userData: UserDataExport = {
        userId,
        sessions: sessions.map(s => ({
          id: s.id,
          loungeId: s.loungeId,
          tableId: s.tableId,
          createdAt: s.createdAt,
          startedAt: s.startedAt,
          endedAt: s.endedAt,
          amount: s.priceCents ? s.priceCents / 100 : 0,
          status: s.state,
        })),
        reservations,
        loyaltyData: loyaltyAccount ? {
          balance: loyaltyAccount.balanceCents / 100,
          totalEarned: loyaltyAccount.totalEarnedCents / 100,
          totalRedeemed: loyaltyAccount.totalRedeemedCents / 100,
          transactions: loyaltyAccount.transactions.map(t => ({
            type: t.type,
            amount: t.amountCents / 100,
            createdAt: t.createdAt,
          })),
        } : null,
        createdAt: new Date(),
      };

      return {
        success: true,
        data: userData,
      };
    } catch (error) {
      console.error('[GDPRService] Error exporting user data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to export user data'
      };
    }
  }

  /**
   * Request data deletion (GDPR Article 17 - Right to Erasure)
   */
  static async requestDataDeletion(
    userId: string,
    email?: string,
    phone?: string,
    reason?: string,
    prisma?: PrismaClient
  ): Promise<{ success: boolean; requestId?: string; error?: string }> {
    try {
      const requestId = `deletion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // TODO: Store deletion request in database
      console.log(`[GDPRService] Data deletion requested: ${requestId}`, {
        userId,
        email,
        phone,
        reason,
      });

      return {
        success: true,
        requestId,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to request data deletion'
      };
    }
  }

  /**
   * Process data deletion request
   */
  static async processDataDeletion(
    requestId: string,
    prisma: PrismaClient
  ): Promise<{ success: boolean; deleted?: number; error?: string }> {
    try {
      // TODO: Get deletion request from database
      // TODO: Anonymize or delete user data
      // - Anonymize sessions (remove PII, keep aggregate data)
      // - Delete reservations
      // - Anonymize loyalty account
      // - Delete preferences

      console.log(`[GDPRService] Processing data deletion: ${requestId}`);

      return {
        success: true,
        deleted: 0, // Placeholder
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process data deletion'
      };
    }
  }

  /**
   * Anonymize user data (GDPR - keep data but remove PII)
   */
  static async anonymizeUserData(
    userId: string,
    prisma: PrismaClient
  ): Promise<{ success: boolean; anonymized?: number; error?: string }> {
    try {
      // Anonymize sessions
      const sessionsUpdated = await prisma.session.updateMany({
        where: {
          OR: [
            { customerRef: userId },
            { customerPhone: userId },
          ],
        },
        data: {
          customerRef: null,
          customerPhone: null,
        },
      });

      // Anonymize loyalty account
      const loyaltyUpdated = await prisma.loyaltyAccount.updateMany({
        where: {
          OR: [
            { customerId: userId },
            { customerPhone: userId },
          ],
        },
        data: {
          customerId: null,
          customerPhone: null,
        },
      });

      return {
        success: true,
        anonymized: sessionsUpdated.count + loyaltyUpdated.count,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to anonymize user data'
      };
    }
  }

  /**
   * Get data retention policy
   */
  static getDataRetentionPolicy(): {
    sessions: number; // days
    reservations: number;
    auditLogs: number;
    analytics: number;
  } {
    return {
      sessions: 365, // 1 year
      reservations: 90, // 3 months
      auditLogs: 2555, // 7 years (compliance)
      analytics: 730, // 2 years
    };
  }
}

