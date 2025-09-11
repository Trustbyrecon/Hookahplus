import { prisma } from "./db";
import { listEvents, listEventsAtVenue, alreadyAwarded, putAward } from "./badgeStores.switch";
import type { Award, BadgeConfig } from "./badgeTypes";

export class BadgeEngine {
  private badgeConfigs: Map<string, BadgeConfig> = new Map();

  async loadBadgeConfigs() {
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
  }

  async evaluateBadges(profileId: string, venueId?: string) {
    await this.loadBadgeConfigs();
    
    const events = venueId 
      ? await listEventsAtVenue(profileId, venueId)
      : await listEvents(profileId);

    const newAwards: Award[] = [];

    for (const [badgeId, config] of this.badgeConfigs) {
      if (!config.active) continue;

      // Check if already awarded
      const alreadyAwardedBadge = await alreadyAwarded(profileId, badgeId, venueId);
      if (alreadyAwardedBadge) continue;

      // Evaluate badge rule
      const shouldAward = await this.evaluateRule(config.rule, events, profileId, venueId);
      
      if (shouldAward) {
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

        await putAward(award);
        newAwards.push(award);
        
        console.log(`🏆 Badge awarded: ${config.label} to ${profileId}${venueId ? ` at ${venueId}` : ''}`);
      }
    }

    return newAwards;
  }

  private async evaluateRule(rule: any, events: any[], profileId: string, venueId?: string): Promise<boolean> {
    switch (rule.type) {
      case 'venue_count':
        const uniqueVenues = new Set(events.map(e => e.venueId).filter(Boolean));
        return uniqueVenues.size >= rule.threshold;

      case 'unique_combos':
        const uniqueCombos = new Set(events
          .filter(e => e.type === 'mix_ordered' && e.comboHash)
          .map(e => e.comboHash)
        );
        return uniqueCombos.size >= rule.threshold;

      case 'venue_visits':
        const venueVisits = events.filter(e => e.venueId === venueId).length;
        return venueVisits >= rule.threshold;

      case 'check_ins':
        const checkIns = events.filter(e => e.type === 'check_in').length;
        return checkIns >= rule.threshold;

      default:
        console.warn(`Unknown badge rule type: ${rule.type}`);
        return false;
    }
  }

  async getBadgeProgress(profileId: string, badgeId: string, venueId?: string) {
    await this.loadBadgeConfigs();
    const config = this.badgeConfigs.get(badgeId);
    if (!config) return { progress: 0, total: 0, description: 'Unknown badge' };

    const events = venueId 
      ? await listEventsAtVenue(profileId, venueId)
      : await listEvents(profileId);

    let current = 0;
    let total = config.rule.threshold;

    switch (config.rule.type) {
      case 'venue_count':
        const uniqueVenues = new Set(events.map(e => e.venueId).filter(Boolean));
        current = uniqueVenues.size;
        break;

      case 'unique_combos':
        const uniqueCombos = new Set(events
          .filter(e => e.type === 'mix_ordered' && e.comboHash)
          .map(e => e.comboHash)
        );
        current = uniqueCombos.size;
        break;

      case 'venue_visits':
        current = events.filter(e => e.venueId === venueId).length;
        break;

      case 'check_ins':
        current = events.filter(e => e.type === 'check_in').length;
        break;
    }

    return {
      progress: Math.min(current, total),
      total,
      description: config.rule.description || `Complete ${total} ${config.rule.type.replace('_', ' ')}`,
      percentage: Math.round((current / total) * 100)
    };
  }
}

export const badgeEngine = new BadgeEngine();
