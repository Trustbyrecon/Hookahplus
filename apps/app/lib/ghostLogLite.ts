// GhostLog Lite - Immutable Trust Stamping System
// This creates the verifiable trust layer that prevents competitors from copying loyalty features

import { TrustStamp } from './trustLockService';

export interface GhostLogEntry {
  id: string;
  timestamp: Date;
  eventType: string;
  customerId: string;
  venueId: string;
  sessionId?: string;
  eventData: Record<string, any>;
  hash: string;
  previousHash?: string;
  blockNumber: number;
  verified: boolean;
}

export interface TrustVerification {
  isValid: boolean;
  hashMatches: boolean;
  chainIntegrity: boolean;
  timestampValid: boolean;
  errors: string[];
}

export class GhostLogLite {
  private static instance: GhostLogLite;
  private logEntries: Map<string, GhostLogEntry> = new Map();
  private blockNumber = 0;

  static getInstance(): GhostLogLite {
    if (!GhostLogLite.instance) {
      GhostLogLite.instance = new GhostLogLite();
    }
    return GhostLogLite.instance;
  }

  /**
   * Append trust-stamped event to immutable log
   */
  async appendTrustEvent(
    customerId: string,
    eventType: string,
    eventData: Record<string, any>,
    venueId: string,
    sessionId?: string
  ): Promise<GhostLogEntry> {
    const timestamp = new Date();
    const previousEntry = this.getLastEntry(customerId);
    const previousHash = previousEntry?.hash;
    
    // Create immutable hash
    const hashData = {
      customerId,
      eventType,
      eventData,
      timestamp: timestamp.toISOString(),
      venueId,
      sessionId,
      previousHash,
      blockNumber: this.blockNumber + 1
    };
    
    const hash = await this.createImmutableHash(JSON.stringify(hashData));
    
    const logEntry: GhostLogEntry = {
      id: `ghost_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp,
      eventType,
      customerId,
      venueId,
      sessionId,
      eventData,
      hash,
      previousHash,
      blockNumber: ++this.blockNumber,
      verified: true
    };

    this.logEntries.set(logEntry.id, logEntry);
    
    // Log to console for debugging
    console.log(`[GhostLog] 🔒 Trust event logged: ${eventType} for customer ${customerId} at ${venueId}`);
    console.log(`[GhostLog] 📝 Hash: ${hash}`);
    console.log(`[GhostLog] 🔗 Previous Hash: ${previousHash || 'Genesis'}`);
    
    return logEntry;
  }

  /**
   * Verify trust chain integrity
   */
  async verifyTrustChain(customerId: string): Promise<TrustVerification> {
    const customerEntries = this.getCustomerEntries(customerId);
    const errors: string[] = [];
    let isValid = true;
    let hashMatches = true;
    let chainIntegrity = true;
    let timestampValid = true;

    for (let i = 0; i < customerEntries.length; i++) {
      const entry = customerEntries[i];
      
      // Verify hash
      const expectedHash = await this.createImmutableHash(JSON.stringify({
        customerId: entry.customerId,
        eventType: entry.eventType,
        eventData: entry.eventData,
        timestamp: entry.timestamp.toISOString(),
        venueId: entry.venueId,
        sessionId: entry.sessionId,
        previousHash: entry.previousHash,
        blockNumber: entry.blockNumber
      }));

      if (entry.hash !== expectedHash) {
        errors.push(`Hash mismatch for entry ${entry.id}`);
        hashMatches = false;
        isValid = false;
      }

      // Verify chain integrity
      if (i > 0) {
        const previousEntry = customerEntries[i - 1];
        if (entry.previousHash !== previousEntry.hash) {
          errors.push(`Chain integrity broken at entry ${entry.id}`);
          chainIntegrity = false;
          isValid = false;
        }
      }

      // Verify timestamp order
      if (i > 0) {
        const previousEntry = customerEntries[i - 1];
        if (entry.timestamp < previousEntry.timestamp) {
          errors.push(`Timestamp out of order for entry ${entry.id}`);
          timestampValid = false;
          isValid = false;
        }
      }
    }

    return {
      isValid,
      hashMatches,
      chainIntegrity,
      timestampValid,
      errors
    };
  }

  /**
   * Get customer's trust history
   */
  getCustomerTrustHistory(customerId: string, limit = 50): GhostLogEntry[] {
    return this.getCustomerEntries(customerId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Get trust statistics
   */
  async getTrustStatistics(): Promise<{
    totalEvents: number;
    uniqueCustomers: number;
    uniqueVenues: number;
    eventsByType: Record<string, number>;
    averageEventsPerCustomer: number;
    trustChainIntegrity: number;
  }> {
    const entries = Array.from(this.logEntries.values());
    const uniqueCustomers = new Set(entries.map(e => e.customerId)).size;
    const uniqueVenues = new Set(entries.map(e => e.venueId)).size;
    
    const eventsByType: Record<string, number> = {};
    entries.forEach(entry => {
      eventsByType[entry.eventType] = (eventsByType[entry.eventType] || 0) + 1;
    });

    // Calculate trust chain integrity
    let validChains = 0;
    const customers = Array.from(new Set(entries.map(e => e.customerId)));
    
    for (const customerId of customers) {
      const verification = await this.verifyTrustChain(customerId);
      if (verification.isValid) validChains++;
    }

    const trustChainIntegrity = customers.length > 0 ? (validChains / customers.length) * 100 : 100;

    return {
      totalEvents: entries.length,
      uniqueCustomers,
      uniqueVenues,
      eventsByType,
      averageEventsPerCustomer: uniqueCustomers > 0 ? entries.length / uniqueCustomers : 0,
      trustChainIntegrity
    };
  }

  /**
   * Export trust data for backup/verification
   */
  exportTrustData(): {
    entries: GhostLogEntry[];
    statistics: ReturnType<GhostLogLite['getTrustStatistics']>;
    exportTimestamp: Date;
    version: string;
  } {
    return {
      entries: Array.from(this.logEntries.values()),
      statistics: this.getTrustStatistics(),
      exportTimestamp: new Date(),
      version: '1.0.0'
    };
  }

  /**
   * Import trust data (for backup restoration)
   */
  async importTrustData(data: {
    entries: GhostLogEntry[];
    version: string;
  }): Promise<boolean> {
    try {
      // Verify imported data integrity
      for (const entry of data.entries) {
        const expectedHash = await this.createImmutableHash(JSON.stringify({
          customerId: entry.customerId,
          eventType: entry.eventType,
          eventData: entry.eventData,
          timestamp: entry.timestamp.toISOString(),
          venueId: entry.venueId,
          sessionId: entry.sessionId,
          previousHash: entry.previousHash,
          blockNumber: entry.blockNumber
        }));

        if (entry.hash !== expectedHash) {
          console.error(`[GhostLog] ❌ Import failed: Hash verification failed for entry ${entry.id}`);
          return false;
        }
      }

      // Import entries
      data.entries.forEach(entry => {
        this.logEntries.set(entry.id, entry);
      });

      // Update block number
      this.blockNumber = Math.max(...data.entries.map(e => e.blockNumber), this.blockNumber);

      console.log(`[GhostLog] ✅ Import successful: ${data.entries.length} entries imported`);
      return true;
    } catch (error) {
      console.error(`[GhostLog] ❌ Import failed:`, error);
      return false;
    }
  }

  /**
   * Get last entry for a customer
   */
  private getLastEntry(customerId: string): GhostLogEntry | undefined {
    const customerEntries = this.getCustomerEntries(customerId);
    return customerEntries.length > 0 ? customerEntries[customerEntries.length - 1] : undefined;
  }

  /**
   * Get all entries for a customer
   */
  private getCustomerEntries(customerId: string): GhostLogEntry[] {
    return Array.from(this.logEntries.values())
      .filter(entry => entry.customerId === customerId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * Create immutable hash using SHA-256
   */
  private async createImmutableHash(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}

// Export singleton instance
export const ghostLogLite = GhostLogLite.getInstance();
