/**
 * ZoneRoutingService
 * 
 * Service for automatically routing staff to zones based on table assignments,
 * workload balancing, and zone-specific requirements.
 */

import { TableLayoutService, LayoutTable } from './TableLayoutService';

export interface ZoneStaffAssignment {
  zone: string;
  staffId: string;
  staffName: string;
  role: 'FOH' | 'BOH' | 'MANAGER';
  capacity: number; // Max concurrent sessions
  currentLoad: number; // Current active sessions
  availability: 'available' | 'busy' | 'unavailable';
}

export interface ZoneWorkload {
  zone: string;
  totalTables: number;
  activeSessions: number;
  availableStaff: number;
  averageLoadPerStaff: number;
  needsMoreStaff: boolean;
}

export interface RoutingDecision {
  tableId: string;
  tableZone: string;
  recommendedStaffId?: string;
  recommendedStaffName?: string;
  reason: string;
  alternatives?: Array<{ staffId: string; staffName: string; reason: string }>;
}

export interface ZoneMetrics {
  zone: string;
  totalSessions: number;
  activeSessions: number;
  totalRevenue: number;
  averageSessionValue: number;
  averageResponseTime: number; // in seconds
  staffEfficiency: number; // sessions per staff hour
  customerSatisfaction: number; // 0-100
}

export class ZoneRoutingService {
  /**
   * Get zone for a table
   */
  static async getTableZone(tableId: string): Promise<string | null> {
    const tables = await TableLayoutService.loadTables();
    const table = tables.find(t => 
      t.id === tableId ||
      t.name === tableId ||
      t.name.toLowerCase() === tableId.toLowerCase()
    );
    
    return table?.zone || null;
  }

  /**
   * Assign staff to zone based on zone type and staff capabilities
   */
  static assignStaffToZone(
    zone: string,
    availableStaff: Array<{ id: string; name: string; role: string; currentLoad?: number; maxCapacity?: number }>
  ): ZoneStaffAssignment[] {
    const assignments: ZoneStaffAssignment[] = [];
    
    // Determine zone requirements
    const zoneType = zone.toUpperCase();
    const isVIP = zoneType.includes('VIP') || zoneType.includes('PRIVATE');
    const isOutdoor = zoneType.includes('OUTDOOR') || zoneType.includes('PATIO');
    const isBar = zoneType.includes('BAR');
    
    // Filter staff by zone compatibility
    const compatibleStaff = availableStaff.filter(staff => {
      const role = staff.role.toUpperCase();
      
      // VIP zones need experienced FOH or managers
      if (isVIP) {
        return role === 'FOH' || role === 'MANAGER';
      }
      
      // Outdoor zones can use any FOH
      if (isOutdoor) {
        return role === 'FOH' || role === 'MANAGER';
      }
      
      // Bar zones need FOH
      if (isBar) {
        return role === 'FOH' || role === 'MANAGER';
      }
      
      // Default: any FOH or manager
      return role === 'FOH' || role === 'MANAGER';
    });
    
    // Assign staff to zone
    compatibleStaff.forEach(staff => {
      const maxCapacity = staff.maxCapacity || 5; // Default 5 concurrent sessions
      const currentLoad = staff.currentLoad || 0;
      const availability = currentLoad >= maxCapacity ? 'unavailable' :
                          currentLoad >= maxCapacity * 0.8 ? 'busy' : 'available';
      
      assignments.push({
        zone,
        staffId: staff.id,
        staffName: staff.name,
        role: (staff.role.toUpperCase() === 'MANAGER' ? 'MANAGER' : 'FOH') as 'FOH' | 'BOH' | 'MANAGER',
        capacity: maxCapacity,
        currentLoad,
        availability
      });
    });
    
    return assignments.sort((a, b) => {
      // Sort by availability first, then by current load
      if (a.availability !== b.availability) {
        const order = { available: 0, busy: 1, unavailable: 2 };
        return order[a.availability] - order[b.availability];
      }
      return a.currentLoad - b.currentLoad; // Lower load first
    });
  }

  /**
   * Calculate workload for each zone
   */
  static calculateZoneWorkload(
    tables: LayoutTable[],
    activeSessions: Array<{ tableId: string; status: string }>,
    zoneStaff: Map<string, ZoneStaffAssignment[]>
  ): ZoneWorkload[] {
    const zoneMap = new Map<string, ZoneWorkload>();
    
    // Initialize zones
    tables.forEach(table => {
      const zone = table.zone || 'Main';
      if (!zoneMap.has(zone)) {
        zoneMap.set(zone, {
          zone,
          totalTables: 0,
          activeSessions: 0,
          availableStaff: 0,
          averageLoadPerStaff: 0,
          needsMoreStaff: false
        });
      }
      
      const workload = zoneMap.get(zone)!;
      workload.totalTables++;
      
      // Count active sessions in this zone
      const hasActiveSession = activeSessions.some(s => 
        s.tableId === table.id ||
        s.tableId === table.name ||
        s.tableId?.toLowerCase() === table.name.toLowerCase()
      );
      
      if (hasActiveSession) {
        workload.activeSessions++;
      }
    });
    
    // Calculate staff metrics
    zoneMap.forEach((workload, zone) => {
      const staff = zoneStaff.get(zone) || [];
      const availableStaffCount = staff.filter(s => s.availability === 'available' || s.availability === 'busy').length;
      
      workload.availableStaff = availableStaffCount;
      
      if (availableStaffCount > 0) {
        const totalCapacity = staff.reduce((sum, s) => sum + s.capacity, 0);
        const totalLoad = staff.reduce((sum, s) => sum + s.currentLoad, 0);
        workload.averageLoadPerStaff = totalLoad / availableStaffCount;
        
        // Needs more staff if average load > 80% of capacity
        workload.needsMoreStaff = workload.averageLoadPerStaff > (totalCapacity / availableStaffCount * 0.8);
      } else {
        workload.needsMoreStaff = workload.activeSessions > 0;
      }
    });
    
    return Array.from(zoneMap.values());
  }

  /**
   * Route a new session to appropriate staff based on zone
   */
  static routeSessionToStaff(
    tableId: string,
    tableZone: string,
    availableStaff: Array<{ id: string; name: string; role: string; currentLoad?: number; maxCapacity?: number }>,
    activeSessions: Array<{ tableId: string; assignedStaff?: { foh?: string; boh?: string } }>
  ): RoutingDecision {
    // Get zone staff assignments
    const zoneStaff = this.assignStaffToZone(tableZone, availableStaff);
    
    if (zoneStaff.length === 0) {
      // No zone-specific staff, find any available FOH
      const anyFOH = availableStaff
        .filter(s => s.role.toUpperCase() === 'FOH' || s.role.toUpperCase() === 'MANAGER')
        .sort((a, b) => (a.currentLoad || 0) - (b.currentLoad || 0));
      
      if (anyFOH.length > 0) {
        return {
          tableId,
          tableZone,
          recommendedStaffId: anyFOH[0].id,
          recommendedStaffName: anyFOH[0].name,
          reason: `No zone-specific staff available. Assigned to general FOH staff.`,
          alternatives: anyFOH.slice(1, 4).map(s => ({
            staffId: s.id,
            staffName: s.name,
            reason: 'Alternative general FOH staff'
          }))
        };
      }
      
      return {
        tableId,
        tableZone,
        reason: 'No available staff found for this zone.'
      };
    }
    
    // Find best available staff in zone
    const availableZoneStaff = zoneStaff.filter(s => s.availability === 'available');
    
    if (availableZoneStaff.length > 0) {
      const bestStaff = availableZoneStaff[0];
      return {
        tableId,
        tableZone,
        recommendedStaffId: bestStaff.staffId,
        recommendedStaffName: bestStaff.staffName,
        reason: `Assigned to ${bestStaff.staffName} (${tableZone} zone specialist, ${bestStaff.currentLoad}/${bestStaff.capacity} load)`,
        alternatives: availableZoneStaff.slice(1, 4).map(s => ({
          staffId: s.staffId,
          staffName: s.staffName,
          reason: `Alternative ${tableZone} zone staff (${s.currentLoad}/${s.capacity} load)`
        }))
      };
    }
    
    // If no available staff, use busy staff (better than nothing)
    const busyZoneStaff = zoneStaff.filter(s => s.availability === 'busy');
    
    if (busyZoneStaff.length > 0) {
      const bestBusyStaff = busyZoneStaff[0];
      return {
        tableId,
        tableZone,
        recommendedStaffId: bestBusyStaff.staffId,
        recommendedStaffName: bestBusyStaff.staffName,
        reason: `Assigned to ${bestBusyStaff.staffName} (${tableZone} zone, currently busy but available)`,
        alternatives: busyZoneStaff.slice(1, 3).map(s => ({
          staffId: s.staffId,
          staffName: s.staffName,
          reason: `Alternative ${tableZone} zone staff (busy)`
        }))
      };
    }
    
    // Fallback: cross-zone support
    const crossZoneStaff = availableStaff
      .filter(s => {
        const role = s.role.toUpperCase();
        return role === 'FOH' || role === 'MANAGER';
      })
      .sort((a, b) => (a.currentLoad || 0) - (b.currentLoad || 0));
    
    if (crossZoneStaff.length > 0) {
      return {
        tableId,
        tableZone,
        recommendedStaffId: crossZoneStaff[0].id,
        recommendedStaffName: crossZoneStaff[0].name,
        reason: `No ${tableZone} zone staff available. Assigned to cross-zone support.`,
        alternatives: crossZoneStaff.slice(1, 3).map(s => ({
          staffId: s.id,
          staffName: s.name,
          reason: 'Cross-zone support alternative'
        }))
      };
    }
    
    return {
      tableId,
      tableZone,
      reason: 'No staff available. Manual assignment required.'
    };
  }

  /**
   * Rebalance staff assignments across zones
   */
  static rebalanceZoneAssignments(
    zoneWorkloads: ZoneWorkload[],
    zoneStaff: Map<string, ZoneStaffAssignment[]>
  ): Array<{ fromZone: string; toZone: string; staffId: string; reason: string }> {
    const rebalancing: Array<{ fromZone: string; toZone: string; staffId: string; reason: string }> = [];
    
    // Find overloaded zones
    const overloadedZones = zoneWorkloads.filter(w => w.needsMoreStaff);
    const underloadedZones = zoneWorkloads.filter(w => !w.needsMoreStaff && w.activeSessions < w.totalTables * 0.3);
    
    // Try to move staff from underloaded to overloaded zones
    for (const overloaded of overloadedZones) {
      for (const underloaded of underloadedZones) {
        const underloadedStaff = zoneStaff.get(underloaded.zone) || [];
        const availableStaff = underloadedStaff.filter(s => 
          s.availability === 'available' && s.currentLoad < s.capacity * 0.5
        );
        
        if (availableStaff.length > 0) {
          const staffToMove = availableStaff[0];
          rebalancing.push({
            fromZone: underloaded.zone,
            toZone: overloaded.zone,
            staffId: staffToMove.staffId,
            reason: `${overloaded.zone} needs support (${overloaded.activeSessions} active sessions). ${underloaded.zone} has capacity.`
          });
          
          // Only move one staff member per overloaded zone
          break;
        }
      }
    }
    
    return rebalancing;
  }

  /**
   * Calculate zone metrics
   */
  static calculateZoneMetrics(
    zone: string,
    sessions: Array<{
      tableId: string;
      zone?: string;
      priceCents?: number;
      status: string;
      startedAt?: Date | string;
      createdAt?: Date | string;
    }>,
    staffAssignments: ZoneStaffAssignment[]
  ): ZoneMetrics {
    // Filter sessions for this zone
    const zoneSessions = sessions.filter(s => {
      // Try to match by zone if available
      if (s.zone) {
        return s.zone === zone;
      }
      // Otherwise, we'd need to look up table zone (simplified for now)
      return false;
    });
    
    const activeSessions = zoneSessions.filter(s => 
      ['ACTIVE', 'PREP_IN_PROGRESS', 'READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(s.status)
    );
    
    const totalRevenue = zoneSessions.reduce((sum, s) => sum + ((s.priceCents || 0) / 100), 0);
    const averageSessionValue = zoneSessions.length > 0 ? totalRevenue / zoneSessions.length : 0;
    
    // Calculate average response time (simplified - would need actual timestamps)
    const averageResponseTime = 0; // TODO: Calculate from actual data
    
    // Calculate staff efficiency
    const totalStaffHours = staffAssignments.length * 8; // Assume 8-hour shifts
    const staffEfficiency = totalStaffHours > 0 ? zoneSessions.length / totalStaffHours : 0;
    
    return {
      zone,
      totalSessions: zoneSessions.length,
      activeSessions: activeSessions.length,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      averageSessionValue: Math.round(averageSessionValue * 100) / 100,
      averageResponseTime,
      staffEfficiency: Math.round(staffEfficiency * 10) / 10,
      customerSatisfaction: 85 // TODO: Calculate from actual ratings
    };
  }
}

