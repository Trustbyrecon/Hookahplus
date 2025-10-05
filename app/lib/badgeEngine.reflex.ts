// app/lib/badgeEngine.reflex.ts
// Badge Engine with Reflex Integration - Self-aware badge operations

import { prisma } from "./db";
import { listEvents, listEventsAtVenue, alreadyAwarded, putAward } from "./badgeStores.switch";
import type { Award, BadgeConfig } from "./badgeTypes";
import { reflexEngine } from "../../lib/reflex/reflexEngine";
import type { BadgeReflexContext, BadgeReflexResult } from "../../types/reflex";

export class ReflexBadgeEngine {
  private badgeConfigs: Map<string, BadgeConfig> = new Map();
  private agentId = "badge_engine_001";

  async loadBadgeConfigs(): Promise<BadgeReflexResult<Map<string, BadgeConfig>>> {
    const context: BadgeReflexContext = {
      agentId: this.agentId,
      operationId: `load_configs_${Date.now()}`,
      route: "/badge-engine/load-configs",
      startTime: Date.now(),
      criticalPath: true,
      profileId: "system",
      operationType: "evaluate"
    };

    return await reflexEngine.executeBadgeOperation(context, async () => {
      if (process.env.BADGES_V1_USE_DB === "true") {
        const badges = await prisma.badge.findMany({ where: { active: true } });
        for (const badge of badges) {
          this.badgeConfigs.set(badge.id, {
            id: badge.id,
            label: badge.label,
            scope: badge.scope,
            rule: badge.rule as any,
            active: badge.active
          });
        }
      } else {
        // Load from config file for in-memory mode
        const fs = await import('fs');
        const path = await import('path');
        const configPath = path.join(process.cwd(), 'config', 'badges.json');
        const raw = fs.readFileSync(configPath, 'utf-8');
        const data = JSON.parse(raw) as BadgeConfig[];
        for (const badge of data) {
          this.badgeConfigs.set(badge.id, badge);
        }
      }
      return this.badgeConfigs;
    });
  }

  async evaluateBadges(
    profileId: string, 
    venueId?: string
  ): Promise<BadgeReflexResult<Award[]>> {
    const context: BadgeReflexContext = {
      agentId: this.agentId,
      operationId: `evaluate_badges_${Date.now()}`,
      route: "/badge-engine/evaluate",
      startTime: Date.now(),
      criticalPath: true,
      profileId,
      venueId,
      operationType: "evaluate"
    };

    return await reflexEngine.executeBadgeOperation(context, async () => {
      await this.loadBadgeConfigs();
      
      const events = venueId 
        ? await listEventsAtVenue(profileId, venueId)
        : await listEvents(profileId);

      const newAwards: Award[] = [];

      for (const [badgeId, config] of Array.from(this.badgeConfigs.entries())) {
        if (!config.active) continue;

        // Check if already awarded
        const alreadyAwardedBadge = await alreadyAwarded(profileId, badgeId, venueId);
        if (alreadyAwardedBadge) continue;

        // Evaluate badge rule with reflex scoring
        const ruleResult = await this.evaluateRuleWithReflex(
          config.rule, 
          events, 
          profileId, 
          venueId, 
          badgeId
        );
        
        if (ruleResult.shouldAward) {
          const award: Award = {
            id: `award_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            profileId,
            badgeId,
            venueId: venueId || null,
            progress: 100,
            awardedAt: Date.now(),
            awardedBy: 'system',
            revoked: false
          };

          await putAward({ award });
          newAwards.push(award);
          
          console.log(`🏆 Badge awarded: ${config.label} to ${profileId}${venueId ? ` at ${venueId}` : ''}`);
        }
      }

      return newAwards;
    });
  }

  async getBadgeProgress(
    profileId: string, 
    badgeId: string, 
    venueId?: string
  ): Promise<BadgeReflexResult<{
    progress: number;
    total: number;
    description: string;
    percentage: number;
  }>> {
    const context: BadgeReflexContext = {
      agentId: this.agentId,
      operationId: `get_progress_${Date.now()}`,
      route: "/badge-engine/progress",
      startTime: Date.now(),
      criticalPath: false,
      profileId,
      venueId,
      badgeId,
      operationType: "progress"
    };

    return await reflexEngine.executeBadgeOperation(context, async () => {
      await this.loadBadgeConfigs();
      const config = this.badgeConfigs.get(badgeId);
      if (!config) {
        return { progress: 0, total: 0, description: 'Unknown badge', percentage: 0 };
      }

      const events = venueId 
        ? await listEventsAtVenue(profileId, venueId)
        : await listEvents(profileId);

      let current = 0;
      let total = config.rule.threshold;

      switch (config.rule.type) {
        case 'venue_count':
          const uniqueVenues = new Set(events.map((e: any) => e.venueId).filter(Boolean));
          current = uniqueVenues.size;
          break;

        case 'unique_combos':
          const uniqueCombos = new Set(events
            .filter((e: any) => e.type === 'mix_ordered' && e.comboHash)
            .map((e: any) => e.comboHash)
          );
          current = uniqueCombos.size;
          break;

        case 'venue_visits':
          current = events.filter((e: any) => e.venueId === venueId).length;
          break;

        case 'check_ins':
          current = events.filter((e: any) => e.type === 'check_in').length;
          break;
      }

      return {
        progress: Math.min(current, total),
        total,
        description: config.rule.description || `Complete ${total} ${config.rule.type.replace('_', ' ')}`,
        percentage: Math.round((current / total) * 100)
      };
    });
  }

  async awardBadge(
    profileId: string,
    badgeId: string,
    venueId?: string,
    awardedBy: string = 'system'
  ): Promise<BadgeReflexResult<Award>> {
    const context: BadgeReflexContext = {
      agentId: this.agentId,
      operationId: `award_badge_${Date.now()}`,
      route: "/badge-engine/award",
      startTime: Date.now(),
      criticalPath: true,
      profileId,
      venueId,
      badgeId,
      operationType: "award"
    };

    return await reflexEngine.executeBadgeOperation(context, async () => {
      // Check if already awarded
      const alreadyAwardedBadge = await alreadyAwarded(profileId, badgeId, venueId);
      if (alreadyAwardedBadge) {
        throw new Error(`Badge ${badgeId} already awarded to profile ${profileId}`);
      }

      const award: Award = {
        id: `award_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        profileId,
        badgeId,
        venueId: venueId || null,
        progress: 100,
        awardedAt: Date.now(),
        awardedBy,
        revoked: false
      };

      await putAward({ award });
      
      console.log(`🏆 Badge awarded: ${badgeId} to ${profileId}${venueId ? ` at ${venueId}` : ''}`);
      return award;
    });
  }

  /**
   * Evaluate badge rule with reflex scoring
   */
  private async evaluateRuleWithReflex(
    rule: any, 
    events: any[], 
    profileId: string, 
    venueId?: string,
    badgeId?: string
  ): Promise<{ shouldAward: boolean; confidence: number; reasoning: string }> {
    const context: BadgeReflexContext = {
      agentId: this.agentId,
      operationId: `evaluate_rule_${Date.now()}`,
      route: "/badge-engine/evaluate-rule",
      startTime: Date.now(),
      criticalPath: true,
      profileId,
      venueId,
      badgeId,
      operationType: "evaluate"
    };

    const result = await reflexEngine.executeBadgeOperation(context, async () => {
      let shouldAward = false;
      let reasoning = "";

      switch (rule.type) {
        case 'venue_count':
          const uniqueVenues = new Set(events.map(e => e.venueId).filter(Boolean));
          shouldAward = uniqueVenues.size >= rule.threshold;
          reasoning = `Found ${uniqueVenues.size} unique venues, threshold: ${rule.threshold}`;
          break;

        case 'unique_combos':
          const uniqueCombos = new Set(events
            .filter(e => e.type === 'mix_ordered' && e.comboHash)
            .map(e => e.comboHash)
          );
          shouldAward = uniqueCombos.size >= rule.threshold;
          reasoning = `Found ${uniqueCombos.size} unique combos, threshold: ${rule.threshold}`;
          break;

        case 'venue_visits':
          const venueVisits = events.filter(e => e.venueId === venueId).length;
          shouldAward = venueVisits >= rule.threshold;
          reasoning = `Found ${venueVisits} venue visits, threshold: ${rule.threshold}`;
          break;

        case 'check_ins':
          const checkIns = events.filter(e => e.type === 'check_in').length;
          shouldAward = checkIns >= rule.threshold;
          reasoning = `Found ${checkIns} check-ins, threshold: ${rule.threshold}`;
          break;

        default:
          console.warn(`Unknown badge rule type: ${rule.type}`);
          shouldAward = false;
          reasoning = `Unknown rule type: ${rule.type}`;
      }

      return { shouldAward, reasoning };
    });

    return {
      shouldAward: result.data?.shouldAward || false,
      confidence: result.score.components.accuracy,
      reasoning: result.data?.reasoning || "Rule evaluation failed"
    };
  }

  /**
   * Get system health and reflex statistics
   */
  async getSystemHealth(): Promise<{
    badgeEngineHealth: number;
    totalBadges: number;
    activeBadges: number;
    recentOperations: number;
    averageScore: number;
    criticalIssues: number;
  }> {
    const context: BadgeReflexContext = {
      agentId: this.agentId,
      operationId: `system_health_${Date.now()}`,
      route: "/badge-engine/health",
      startTime: Date.now(),
      criticalPath: false,
      profileId: "system",
      operationType: "evaluate"
    };

    const result = await reflexEngine.executeBadgeOperation(context, async () => {
      await this.loadBadgeConfigs();
      
      const totalBadges = this.badgeConfigs.size;
      const activeBadges = Array.from(this.badgeConfigs.values()).filter(b => b.active).length;
      
      return {
        totalBadges,
        activeBadges,
        recentOperations: 0, // Would be calculated from GhostLog
        averageScore: 0.85, // Would be calculated from recent scores
        criticalIssues: 0 // Would be calculated from recent failures
      };
    });

    return {
      badgeEngineHealth: result.score.value,
      totalBadges: result.data?.totalBadges || 0,
      activeBadges: result.data?.activeBadges || 0,
      recentOperations: result.data?.recentOperations || 0,
      averageScore: result.data?.averageScore || 0,
      criticalIssues: result.data?.criticalIssues || 0
    };
  }

  /**
   * Get reflex statistics for monitoring
   */
  async getReflexStats(): Promise<{
    totalOperations: number;
    successRate: number;
    averageScore: number;
    failureRate: number;
    commonFailures: { type: string; count: number }[];
    trustScore: number;
  }> {
    const { getAgentStats } = await import("../../lib/reflex/ghostLog");
    return getAgentStats(this.agentId);
  }
}

// Export singleton instance
export const reflexBadgeEngine = new ReflexBadgeEngine();
