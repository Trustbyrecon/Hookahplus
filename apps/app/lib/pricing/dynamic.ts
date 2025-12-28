import { prisma } from '../db';
import { encodeCyclicalTime, getTimePeriodLabels, type CyclicalTimeFeatures } from '../utils/cyclical-time';

export interface DynamicPricingRule {
  id: string;
  name: string;
  type: 'time_based' | 'demand_based' | 'loyalty_based' | 'seasonal' | 'weekend';
  isActive: boolean;
  conditions: {
    dayOfWeek?: number[]; // 0-6 (Sunday-Saturday)
    hourOfDay?: number[]; // 0-23
    demandLevel?: 'low' | 'medium' | 'high';
    loyaltyTier?: string[];
    season?: string[];
  };
  adjustments: {
    basePriceMultiplier?: number; // e.g., 1.2 = 20% increase
    basePriceAdjustment?: number; // Fixed amount in cents
    flavorPriceMultiplier?: number;
    maxAdjustment?: number; // Maximum adjustment in cents
  };
  priority: number; // Higher priority rules apply first
}

export interface PricingContext {
  loungeId: string;
  tenantId?: string | null;
  customerPhone?: string;
  customerId?: string;
  sessionTime?: Date;
  currentDemand?: number; // Active sessions count
  basePrice: number; // In cents
  flavorPrices?: Record<string, number>; // In cents
}

/**
 * Dynamic Pricing Engine
 * Applies time-based, demand-based, and loyalty-based pricing adjustments
 */
export class DynamicPricingEngine {
  /**
   * Calculate dynamic price adjustments
   */
  async calculateDynamicPrice(context: PricingContext): Promise<{
    adjustedBasePrice: number;
    adjustedFlavorPrices: Record<string, number>;
    adjustments: Array<{ rule: string; adjustment: number; reason: string }>;
    totalAdjustment: number;
  }> {
    const adjustments: Array<{ rule: string; adjustment: number; reason: string }> = [];
    let adjustedBasePrice = context.basePrice;
    let adjustedFlavorPrices = context.flavorPrices ? { ...context.flavorPrices } : {};

    try {
      // Get active pricing rules for this lounge
      const rules = await this.getPricingRules(context.loungeId, context.tenantId);

      // Get customer loyalty tier if available
      const loyaltyTier = await this.getCustomerLoyaltyTier(context);

      // Get current demand level
      const demandLevel = await this.getDemandLevel(context);

      // Apply rules in priority order
      for (const rule of rules.sort((a, b) => b.priority - a.priority)) {
        if (!rule.isActive) continue;

        const applies = this.ruleApplies(rule, context, loyaltyTier, demandLevel);
        if (applies) {
          const adjustment = this.applyRule(rule, adjustedBasePrice, adjustedFlavorPrices);
          
          if (adjustment.adjustment !== 0) {
            adjustedBasePrice = adjustment.newBasePrice;
            adjustedFlavorPrices = adjustment.newFlavorPrices;
            adjustments.push({
              rule: rule.name,
              adjustment: adjustment.adjustment,
              reason: this.getAdjustmentReason(rule, context, loyaltyTier, demandLevel)
            });
          }
        }
      }

      // Calculate total adjustment
      const totalAdjustment = adjustedBasePrice - context.basePrice;

      return {
        adjustedBasePrice,
        adjustedFlavorPrices,
        adjustments,
        totalAdjustment
      };
    } catch (error) {
      console.error('[Dynamic Pricing] Error calculating dynamic price:', error);
      // Return original prices on error
      return {
        adjustedBasePrice: context.basePrice,
        adjustedFlavorPrices: context.flavorPrices || {},
        adjustments: [],
        totalAdjustment: 0
      };
    }
  }

  /**
   * Get pricing rules for a lounge
   */
  private async getPricingRules(loungeId: string, tenantId?: string | null): Promise<DynamicPricingRule[]> {
    // Default rules (can be stored in database later)
    const defaultRules: DynamicPricingRule[] = [
      {
        id: 'weekend_surge',
        name: 'Weekend Surge Pricing',
        type: 'weekend',
        isActive: true,
        conditions: {
          dayOfWeek: [0, 6] // Saturday, Sunday
        },
        adjustments: {
          basePriceMultiplier: 1.1, // 10% increase
          maxAdjustment: 500 // Max $5 increase
        },
        priority: 5
      },
      {
        id: 'peak_hours',
        name: 'Peak Hours Pricing',
        type: 'time_based',
        isActive: true,
        conditions: {
          hourOfDay: [19, 20, 21, 22, 23] // 7 PM - 11 PM
        },
        adjustments: {
          basePriceMultiplier: 1.15, // 15% increase
          maxAdjustment: 750 // Max $7.50 increase
        },
        priority: 4
      },
      {
        id: 'high_demand',
        name: 'High Demand Surge',
        type: 'demand_based',
        isActive: true,
        conditions: {
          demandLevel: 'high'
        },
        adjustments: {
          basePriceMultiplier: 1.2, // 20% increase
          maxAdjustment: 1000 // Max $10 increase
        },
        priority: 6
      },
      {
        id: 'loyalty_discount_bronze',
        name: 'Bronze Tier Discount',
        type: 'loyalty_based',
        isActive: true,
        conditions: {
          loyaltyTier: ['bronze']
        },
        adjustments: {
          basePriceMultiplier: 0.95 // 5% discount
        },
        priority: 1
      },
      {
        id: 'loyalty_discount_silver',
        name: 'Silver Tier Discount',
        type: 'loyalty_based',
        isActive: true,
        conditions: {
          loyaltyTier: ['silver']
        },
        adjustments: {
          basePriceMultiplier: 0.90 // 10% discount
        },
        priority: 2
      },
      {
        id: 'loyalty_discount_gold',
        name: 'Gold Tier Discount',
        type: 'loyalty_based',
        isActive: true,
        conditions: {
          loyaltyTier: ['gold']
        },
        adjustments: {
          basePriceMultiplier: 0.85 // 15% discount
        },
        priority: 3
      },
      {
        id: 'loyalty_discount_platinum',
        name: 'Platinum Tier Discount',
        type: 'loyalty_based',
        isActive: true,
        conditions: {
          loyaltyTier: ['platinum']
        },
        adjustments: {
          basePriceMultiplier: 0.80 // 20% discount
        },
        priority: 4
      },
      {
        id: 'off_peak_discount',
        name: 'Off-Peak Discount',
        type: 'time_based',
        isActive: true,
        conditions: {
          hourOfDay: [10, 11, 12, 13, 14, 15, 16] // 10 AM - 4 PM
        },
        adjustments: {
          basePriceMultiplier: 0.90 // 10% discount
        },
        priority: 1
      }
    ];

    return defaultRules;
  }

  /**
   * Check if a rule applies to the current context
   * Now uses cyclical time encoding for better time continuity
   */
  private ruleApplies(
    rule: DynamicPricingRule,
    context: PricingContext,
    loyaltyTier: string | null,
    demandLevel: 'low' | 'medium' | 'high'
  ): boolean {
    const { conditions } = rule;
    const sessionTime = context.sessionTime || new Date();
    
    // Use cyclical encoding for time checks
    const timeFeatures = encodeCyclicalTime(sessionTime);
    const dayOfWeek = sessionTime.getDay();
    const hourOfDay = sessionTime.getHours();

    // Check day of week (can use cyclical features for fuzzy matching in future)
    if (conditions.dayOfWeek && !conditions.dayOfWeek.includes(dayOfWeek)) {
      return false;
    }

    // Check hour of day (can use cyclical features for fuzzy matching in future)
    if (conditions.hourOfDay && !conditions.hourOfDay.includes(hourOfDay)) {
      return false;
    }

    // Check demand level
    if (conditions.demandLevel && conditions.demandLevel !== demandLevel) {
      return false;
    }

    // Check loyalty tier
    if (conditions.loyaltyTier && (!loyaltyTier || !conditions.loyaltyTier.includes(loyaltyTier))) {
      return false;
    }

    return true;
  }

  /**
   * Apply a pricing rule
   */
  private applyRule(
    rule: DynamicPricingRule,
    currentBasePrice: number,
    currentFlavorPrices: Record<string, number>
  ): {
    newBasePrice: number;
    newFlavorPrices: Record<string, number>;
    adjustment: number;
  } {
    let newBasePrice = currentBasePrice;
    let newFlavorPrices = { ...currentFlavorPrices };

    const { adjustments } = rule;

    // Apply base price multiplier
    if (adjustments.basePriceMultiplier) {
      newBasePrice = Math.round(currentBasePrice * adjustments.basePriceMultiplier);
    }

    // Apply base price adjustment
    if (adjustments.basePriceAdjustment) {
      newBasePrice += adjustments.basePriceAdjustment;
    }

    // Apply max adjustment limit
    if (adjustments.maxAdjustment) {
      const adjustment = newBasePrice - currentBasePrice;
      if (Math.abs(adjustment) > adjustments.maxAdjustment) {
        newBasePrice = currentBasePrice + (adjustment > 0 ? adjustments.maxAdjustment : -adjustments.maxAdjustment);
      }
    }

    // Apply flavor price multiplier
    if (adjustments.flavorPriceMultiplier) {
      for (const flavorId in newFlavorPrices) {
        newFlavorPrices[flavorId] = Math.round(newFlavorPrices[flavorId] * adjustments.flavorPriceMultiplier);
      }
    }

    return {
      newBasePrice,
      newFlavorPrices,
      adjustment: newBasePrice - currentBasePrice
    };
  }

  /**
   * Get customer loyalty tier
   */
  private async getCustomerLoyaltyTier(context: PricingContext): Promise<string | null> {
    if (!context.customerPhone && !context.customerId) {
      return null;
    }

    try {
      const where: any = { loungeId: context.loungeId };
      if (context.customerPhone) where.customerPhone = context.customerPhone;
      if (context.customerId) where.customerId = context.customerId;

      const account = await prisma.loyaltyAccount.findFirst({ where });
      return account?.currentTier || null;
    } catch (error) {
      console.error('[Dynamic Pricing] Error getting loyalty tier:', error);
      return null;
    }
  }

  /**
   * Get current demand level
   */
  private async getDemandLevel(context: PricingContext): Promise<'low' | 'medium' | 'high'> {
    try {
      // Count active sessions
      const activeSessions = await prisma.session.count({
        where: {
          loungeId: context.loungeId,
          ...(context.tenantId ? { tenantId: context.tenantId } : {}),
          state: {
            in: ['PENDING', 'ACTIVE']
          },
          createdAt: {
            gte: new Date(Date.now() - 2 * 60 * 60 * 1000) // Last 2 hours
          }
        }
      });

      // Determine demand level (thresholds can be configured)
      if (activeSessions >= 10) return 'high';
      if (activeSessions >= 5) return 'medium';
      return 'low';
    } catch (error) {
      console.error('[Dynamic Pricing] Error getting demand level:', error);
      return 'medium'; // Default to medium
    }
  }

  /**
   * Get human-readable adjustment reason
   * Enhanced with cyclical time awareness for better context
   */
  private getAdjustmentReason(
    rule: DynamicPricingRule,
    context: PricingContext,
    loyaltyTier: string | null,
    demandLevel: 'low' | 'medium' | 'high'
  ): string {
    if (rule.type === 'loyalty_based' && loyaltyTier) {
      return `${loyaltyTier.charAt(0).toUpperCase() + loyaltyTier.slice(1)} tier discount`;
    }
    if (rule.type === 'time_based') {
      const sessionTime = context.sessionTime || new Date();
      const timeFeatures = encodeCyclicalTime(sessionTime);
      const { timeOfDay, dayType } = getTimePeriodLabels(timeFeatures);
      
      const hour = sessionTime.getHours();
      if (hour >= 19 && hour <= 23) {
        return `Peak hours pricing (${timeOfDay} ${dayType})`;
      }
      if (hour >= 10 && hour <= 16) {
        return `Off-peak discount (${timeOfDay} ${dayType})`;
      }
      return `Time-based pricing (${timeOfDay} ${dayType})`;
    }
    if (rule.type === 'demand_based') {
      return `High demand surge (${demandLevel} demand)`;
    }
    if (rule.type === 'weekend') {
      const sessionTime = context.sessionTime || new Date();
      const timeFeatures = encodeCyclicalTime(sessionTime);
      const { timeOfDay } = getTimePeriodLabels(timeFeatures);
      return `Weekend surge pricing (${timeOfDay})`;
    }
    return rule.name;
  }
}

// Singleton instance
export const dynamicPricingEngine = new DynamicPricingEngine();

