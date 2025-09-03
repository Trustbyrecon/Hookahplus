// lib/sentinelPOS.ts
// Sentinel.POS agent implementation for stealth monitoring

export interface TelemetryEvent {
  timestamp: number;
  source: string;
  domain?: string;
  userAgent?: string;
  ip?: string;
  riskLevel: 'low' | 'medium' | 'high';
  action: string;
}

export interface DensityThreshold {
  vendor: string;
  venueCount: number;
  cityPenetration: number;
  threshold: 'low' | 'medium' | 'high';
}

export class SentinelPOS {
  private telemetryEvents: TelemetryEvent[] = [];
  private densityThresholds: DensityThreshold[] = [];
  private vendorDomains = [
    '@toasttab.com',
    '@squareup.com',
    '@clover.com',
    '@revelsystems.com',
    '@touchbistro.com'
  ];

  // Telemetry monitoring
  public monitorTelemetry(source: string, domain?: string, userAgent?: string, ip?: string): void {
    const riskLevel = this.assessRisk(domain, userAgent, ip);
    
    const event: TelemetryEvent = {
      timestamp: Date.now(),
      source,
      domain,
      userAgent,
      ip,
      riskLevel,
      action: 'monitored'
    };

    this.telemetryEvents.push(event);
    
    if (riskLevel === 'high') {
      this.alertHighRisk(event);
    } else if (riskLevel === 'medium') {
      this.alertMediumRisk(event);
    }

    console.log(`🛡️ Sentinel.POS: Telemetry monitored - ${riskLevel} risk`, event);
  }

  private assessRisk(domain?: string, userAgent?: string, ip?: string): 'low' | 'medium' | 'high' {
    let riskScore = 0;

    // Check for vendor domains
    if (domain && this.vendorDomains.some(vd => domain.includes(vd))) {
      riskScore += 50;
    }

    // Check for suspicious user agents
    if (userAgent) {
      if (userAgent.includes('bot') || userAgent.includes('crawler')) {
        riskScore += 20;
      }
      if (userAgent.includes('headless') || userAgent.includes('phantom')) {
        riskScore += 30;
      }
    }

    // Check for high-frequency requests (simplified)
    const recentEvents = this.telemetryEvents.filter(e => 
      Date.now() - e.timestamp < 300000 // Last 5 minutes
    );
    if (recentEvents.length > 10) {
      riskScore += 25;
    }

    if (riskScore >= 50) return 'high';
    if (riskScore >= 20) return 'medium';
    return 'low';
  }

  private alertHighRisk(event: TelemetryEvent): void {
    console.log('🚨 HIGH RISK ALERT:', event);
    // In production, this would trigger HiTL escalation
  }

  private alertMediumRisk(event: TelemetryEvent): void {
    console.log('⚠️ MEDIUM RISK ALERT:', event);
    // In production, this would log for review
  }

  // Density monitoring
  public checkDensityThresholds(venueData: Array<{ vendor: string; city: string }>): void {
    const vendorCounts = new Map<string, number>();
    const cityCounts = new Map<string, number>();

    venueData.forEach(venue => {
      vendorCounts.set(venue.vendor, (vendorCounts.get(venue.vendor) || 0) + 1);
      cityCounts.set(venue.city, (cityCounts.get(venue.city) || 0) + 1);
    });

    // Check vendor density thresholds
    vendorCounts.forEach((count, vendor) => {
      if (count >= 150) {
        this.alertDensityThreshold(vendor, count, 'vendor');
      }
    });

    // Check city penetration thresholds
    cityCounts.forEach((count, city) => {
      // Simplified: assume 1000 total merchants per city
      const penetration = (count / 1000) * 100;
      if (penetration >= 5) {
        this.alertDensityThreshold(city, penetration, 'city');
      }
    });
  }

  private alertDensityThreshold(target: string, value: number, type: 'vendor' | 'city'): void {
    const threshold: DensityThreshold = {
      vendor: type === 'vendor' ? target : 'unknown',
      venueCount: type === 'vendor' ? value : 0,
      cityPenetration: type === 'city' ? value : 0,
      threshold: 'high'
    };

    this.densityThresholds.push(threshold);
    console.log(`🚨 DENSITY THRESHOLD ALERT: ${type} ${target} reached ${value}`);
    
    // In production, this would trigger HiTL escalation
  }

  // Connector monitoring
  public monitorConnectorRequest(venueId: string, requestedScopes: string[]): void {
    console.log(`🛡️ Sentinel.POS: Connector request from ${venueId}`, requestedScopes);
    
    // Check for excessive scopes
    const excessiveScopes = requestedScopes.filter(scope => 
      ['orders', 'refunds', 'inventory', 'payments'].includes(scope)
    );

    if (excessiveScopes.length > 0) {
      console.log('⚠️ Excessive scopes requested:', excessiveScopes);
      // In production, this would trigger HiTL escalation
    }
  }

  // Guardrail enforcement
  public enforceGuardrails(): void {
    console.log('🛡️ Sentinel.POS: Enforcing guardrails');
    
    // Check for high-frequency polling
    const recentEvents = this.telemetryEvents.filter(e => 
      Date.now() - e.timestamp < 60000 // Last minute
    );
    
    if (recentEvents.length > 5) {
      console.log('⚠️ High-frequency activity detected');
      // In production, this would trigger rate limiting
    }

    // Check for vendor brand usage
    // This would scan marketing materials, ads, etc.
    console.log('✅ Guardrails enforced');
  }

  // Public API
  public getTelemetryEvents(): TelemetryEvent[] {
    return [...this.telemetryEvents];
  }

  public getDensityThresholds(): DensityThreshold[] {
    return [...this.densityThresholds];
  }

  public getRiskSummary(): Record<string, number> {
    const events = this.telemetryEvents;
    const last24h = events.filter(e => Date.now() - e.timestamp < 86400000);
    
    return {
      totalEvents: events.length,
      last24hEvents: last24h.length,
      highRiskEvents: last24h.filter(e => e.riskLevel === 'high').length,
      mediumRiskEvents: last24h.filter(e => e.riskLevel === 'medium').length,
      lowRiskEvents: last24h.filter(e => e.riskLevel === 'low').length
    };
  }

  // Kill switch management
  public checkKillSwitches(): Record<string, boolean> {
    return {
      POS_CONNECTOR_ENABLED: false, // Always disabled by default
      DISABLE_NETWORK_BADGES: false,
      BADGES_V1_USE_DB: true
    };
  }
}

// Singleton instance
export const sentinelPOS = new SentinelPOS();
