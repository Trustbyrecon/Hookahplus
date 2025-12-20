/**
 * Multi-Location Service
 * 
 * Manages multiple lounges/locations with cross-location analytics and configurations
 */

import { PrismaClient } from '@prisma/client';

export interface Location {
  id: string;
  name: string;
  slug: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  timezone?: string;
  tenantId?: string;
  isActive: boolean;
  configuration?: LocationConfiguration;
  createdAt: Date;
  updatedAt: Date;
}

export interface LocationConfiguration {
  sessionPrice: number;
  tableLayout?: any;
  zones?: string[];
  operatingHours?: {
    [key: string]: { open: string; close: string }; // day -> { open, close }
  };
  features?: {
    qrEnabled: boolean;
    reservationsEnabled: boolean;
    loyaltyEnabled: boolean;
    posIntegration?: string;
  };
  branding?: {
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
}

export interface CrossLocationAnalytics {
  totalRevenue: number;
  totalSessions: number;
  totalCustomers: number;
  averageSessionValue: number;
  locations: Array<{
    locationId: string;
    locationName: string;
    revenue: number;
    sessions: number;
    customers: number;
    utilization: number;
  }>;
  trends: {
    revenue: number; // % change
    sessions: number;
    customers: number;
  };
}

export class MultiLocationService {
  /**
   * Get all locations for a tenant
   */
  static async getLocations(
    tenantId?: string,
    prisma?: PrismaClient
  ): Promise<{ success: boolean; locations?: Location[]; error?: string }> {
    try {
      if (!prisma) {
        return {
          success: false,
          error: 'Prisma client required'
        };
      }

      // Get unique lounge IDs from sessions
      const sessions = await prisma.session.findMany({
        where: tenantId ? { tenantId } : undefined,
        select: { loungeId: true },
        distinct: ['loungeId'],
      });

      // Build location list from unique lounge IDs
      const locations: Location[] = sessions.map(s => ({
        id: s.loungeId,
        name: s.loungeId, // TODO: Get from config or database
        slug: s.loungeId.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      return {
        success: true,
        locations,
      };
    } catch (error) {
      console.error('[MultiLocationService] Error getting locations:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get locations'
      };
    }
  }

  /**
   * Get location configuration
   */
  static async getLocationConfig(
    locationId: string,
    prisma?: PrismaClient
  ): Promise<{ success: boolean; config?: LocationConfiguration; error?: string }> {
    try {
      // TODO: Load from database or config file
      const config: LocationConfiguration = {
        sessionPrice: 25.00,
        features: {
          qrEnabled: true,
          reservationsEnabled: true,
          loyaltyEnabled: true,
        },
      };

      return {
        success: true,
        config,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get location config'
      };
    }
  }

  /**
   * Update location configuration
   */
  static async updateLocationConfig(
    locationId: string,
    config: Partial<LocationConfiguration>,
    prisma?: PrismaClient
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // TODO: Save to database or config file
      console.log(`[MultiLocationService] Updated config for location: ${locationId}`, config);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update location config'
      };
    }
  }

  /**
   * Get cross-location analytics
   */
  static async getCrossLocationAnalytics(
    tenantId?: string,
    dateRange?: { start: Date; end: Date },
    prisma?: PrismaClient
  ): Promise<{ success: boolean; analytics?: CrossLocationAnalytics; error?: string }> {
    try {
      if (!prisma) {
        return {
          success: false,
          error: 'Prisma client required'
        };
      }

      const where: any = {};
      if (tenantId) where.tenantId = tenantId;
      if (dateRange) {
        where.createdAt = {
          gte: dateRange.start,
          lte: dateRange.end,
        };
      }

      // Get all sessions
      const sessions = await prisma.session.findMany({
        where,
        select: {
          loungeId: true,
          priceCents: true,
          customerRef: true,
          createdAt: true,
        },
      });

      // Group by location
      const locationMap = new Map<string, {
        revenue: number;
        sessions: number;
        customers: Set<string>;
      }>();

      for (const session of sessions) {
        const existing = locationMap.get(session.loungeId) || {
          revenue: 0,
          sessions: 0,
          customers: new Set<string>(),
        };

        existing.revenue += session.priceCents ? session.priceCents / 100 : 0;
        existing.sessions += 1;
        if (session.customerRef) {
          existing.customers.add(session.customerRef);
        }

        locationMap.set(session.loungeId, existing);
      }

      // Build analytics
      const locations: CrossLocationAnalytics['locations'] = [];
      let totalRevenue = 0;
      let totalSessions = 0;
      const allCustomers = new Set<string>();

      for (const [locationId, data] of locationMap.entries()) {
        locations.push({
          locationId,
          locationName: locationId, // TODO: Get actual name
          revenue: data.revenue,
          sessions: data.sessions,
          customers: data.customers.size,
          utilization: 0, // TODO: Calculate from table capacity
        });

        totalRevenue += data.revenue;
        totalSessions += data.sessions;
        data.customers.forEach(c => allCustomers.add(c));
      }

      const analytics: CrossLocationAnalytics = {
        totalRevenue,
        totalSessions,
        totalCustomers: allCustomers.size,
        averageSessionValue: totalSessions > 0 ? totalRevenue / totalSessions : 0,
        locations,
        trends: {
          revenue: 0, // TODO: Calculate from previous period
          sessions: 0,
          customers: 0,
        },
      };

      return {
        success: true,
        analytics,
      };
    } catch (error) {
      console.error('[MultiLocationService] Error getting cross-location analytics:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get cross-location analytics'
      };
    }
  }

  /**
   * Share template between locations
   */
  static async shareTemplate(
    sourceLocationId: string,
    targetLocationId: string,
    templateType: 'layout' | 'config' | 'menu',
    prisma?: PrismaClient
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // TODO: Copy template from source to target
      console.log(`[MultiLocationService] Sharing ${templateType} from ${sourceLocationId} to ${targetLocationId}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to share template'
      };
    }
  }
}

