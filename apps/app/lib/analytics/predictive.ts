import { prisma } from '../db';
import { encodeCyclicalTime, calculateTimeSimilarity, type CyclicalTimeFeatures } from '../utils/cyclical-time';

export interface StaffingRecommendation {
  timeframe: string; // 'next_hour' | 'next_shift' | 'next_day'
  recommendedStaff: number;
  currentStaff: number;
  confidence: number; // 0-100
  factors: string[];
  reasoning: string;
}

export interface InventoryForecast {
  flavorId: string;
  flavorName: string;
  currentStock?: number;
  predictedDemand: number;
  daysUntilOutOfStock?: number;
  recommendation: 'restock' | 'monitor' | 'reduce';
  confidence: number;
}

export interface CustomerBehaviorPrediction {
  customerId: string;
  customerPhone?: string;
  predictedNextVisit: Date | null;
  visitProbability: number; // 0-100
  predictedSpend: number;
  recommendedCampaign?: string;
  churnRisk: 'low' | 'medium' | 'high';
  factors: string[];
}

/**
 * Predictive Analytics Engine
 * Provides AI-powered predictions for staffing, inventory, and customer behavior
 */
export class PredictiveAnalyticsEngine {
  /**
   * Get staffing recommendations
   */
  async getStaffingRecommendations(
    loungeId: string,
    tenantId?: string | null
  ): Promise<StaffingRecommendation[]> {
    const recommendations: StaffingRecommendation[] = [];

    try {
      // Get historical session data
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const sessions = await prisma.session.findMany({
        where: {
          loungeId,
          ...(tenantId ? { tenantId } : {}),
          paymentStatus: 'succeeded',
          createdAt: { gte: thirtyDaysAgo }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Analyze patterns by hour (now using cyclical encoding)
      const hourlyDemand = this.calculateHourlyDemand(sessions);
      const now = new Date();
      const currentTimeFeatures = encodeCyclicalTime(now);
      const currentHour = now.getHours();
      const currentDay = now.getDay();

      // Predict next hour demand (using cyclical encoding for continuity)
      const nextHour = (currentHour + 1) % 24;
      const predictedNextHour = this.predictHourlyDemand(hourlyDemand, nextHour, currentDay, currentTimeFeatures);
      
      recommendations.push({
        timeframe: 'next_hour',
        recommendedStaff: Math.ceil(predictedNextHour / 3), // 1 staff per 3 sessions
        currentStaff: 0, // Would need to get from staff system
        confidence: 75,
        factors: [
          `Historical average for ${nextHour}:00`,
          `Day of week pattern (${this.getDayName(currentDay)})`,
          'Recent session trend'
        ],
        reasoning: `Based on historical data, we expect ${predictedNextHour} sessions in the next hour. Recommended ${Math.ceil(predictedNextHour / 3)} staff members.`
      });

      // Predict next shift (4 hours) - using cyclical encoding
      const nextShiftDemand = this.predictShiftDemand(hourlyDemand, currentHour, currentDay, currentTimeFeatures);
      recommendations.push({
        timeframe: 'next_shift',
        recommendedStaff: Math.ceil(nextShiftDemand / 2.5),
        currentStaff: 0,
        confidence: 70,
        factors: [
          '4-hour demand forecast',
          'Day of week patterns',
          'Seasonal trends'
        ],
        reasoning: `Expected ${nextShiftDemand} sessions in the next 4 hours. Recommended ${Math.ceil(nextShiftDemand / 2.5)} staff members.`
      });

      // Predict next day
      const nextDayDemand = this.predictDailyDemand(sessions, currentDay);
      recommendations.push({
        timeframe: 'next_day',
        recommendedStaff: Math.ceil(nextDayDemand / 8), // 1 staff per 8 sessions per day
        currentStaff: 0,
        confidence: 65,
        factors: [
          'Historical daily patterns',
          'Day of week trends',
          'Recent growth patterns'
        ],
        reasoning: `Expected ${nextDayDemand} sessions tomorrow. Recommended ${Math.ceil(nextDayDemand / 8)} staff members.`
      });

    } catch (error) {
      console.error('[Predictive Analytics] Error getting staffing recommendations:', error);
    }

    return recommendations;
  }

  /**
   * Get inventory demand forecasts
   */
  async getInventoryForecasts(
    loungeId: string,
    tenantId?: string | null
  ): Promise<InventoryForecast[]> {
    const forecasts: InventoryForecast[] = [];

    try {
      // Get recent sessions with flavor data
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const sessions = await prisma.session.findMany({
        where: {
          loungeId,
          ...(tenantId ? { tenantId } : {}),
          paymentStatus: 'succeeded',
          flavorMix: { not: null },
          createdAt: { gte: thirtyDaysAgo }
        },
        take: 500
      });

      // Count flavor usage
      const flavorUsage = new Map<string, number>();
      for (const session of sessions) {
        if (session.flavorMix && typeof session.flavorMix === 'object') {
          const mix = session.flavorMix as any;
          const flavors = Array.isArray(mix.flavors) ? mix.flavors : [];
          for (const flavor of flavors) {
            flavorUsage.set(flavor, (flavorUsage.get(flavor) || 0) + 1);
          }
        }
      }

      // Calculate average daily usage
      const daysOfData = 30;
      for (const [flavorId, totalUsage] of flavorUsage.entries()) {
        const avgDailyUsage = totalUsage / daysOfData;
        const predictedDemand = Math.ceil(avgDailyUsage * 7); // Next 7 days

        // Determine recommendation
        let recommendation: 'restock' | 'monitor' | 'reduce' = 'monitor';
        if (predictedDemand > 20) {
          recommendation = 'restock';
        } else if (predictedDemand < 5) {
          recommendation = 'reduce';
        }

        forecasts.push({
          flavorId,
          flavorName: flavorId, // Would resolve from flavor catalog
          predictedDemand,
          recommendation,
          confidence: 70,
          daysUntilOutOfStock: undefined // Would need current stock data
        });
      }

      // Sort by predicted demand (highest first)
      forecasts.sort((a, b) => b.predictedDemand - a.predictedDemand);

    } catch (error) {
      console.error('[Predictive Analytics] Error getting inventory forecasts:', error);
    }

    return forecasts.slice(0, 20); // Top 20 flavors
  }

  /**
   * Get customer behavior predictions
   */
  async getCustomerBehaviorPredictions(
    loungeId: string,
    tenantId?: string | null
  ): Promise<CustomerBehaviorPrediction[]> {
    const predictions: CustomerBehaviorPrediction[] = [];

    try {
      // Get customers with visit history
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const sessions = await prisma.session.findMany({
        where: {
          loungeId,
          ...(tenantId ? { tenantId } : {}),
          customerPhone: { not: null },
          paymentStatus: 'succeeded',
          createdAt: { gte: ninetyDaysAgo }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Group by customer
      const customerSessions = new Map<string, any[]>();
      for (const session of sessions) {
        if (session.customerPhone) {
          const existing = customerSessions.get(session.customerPhone) || [];
          existing.push(session);
          customerSessions.set(session.customerPhone, existing);
        }
      }

      // Predict for each customer
      for (const [phone, customerSessionsList] of customerSessions.entries()) {
        if (customerSessionsList.length < 2) continue; // Need at least 2 visits for prediction

        const sortedSessions = customerSessionsList.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        const lastVisit = sortedSessions[0];
        const daysSinceLastVisit = Math.floor(
          (Date.now() - new Date(lastVisit.createdAt).getTime()) / (24 * 60 * 60 * 1000)
        );

        // Calculate average visit interval
        const intervals: number[] = [];
        for (let i = 1; i < sortedSessions.length; i++) {
          const interval = Math.floor(
            (new Date(sortedSessions[i - 1].createdAt).getTime() - 
             new Date(sortedSessions[i].createdAt).getTime()) / (24 * 60 * 60 * 1000)
          );
          intervals.push(interval);
        }
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

        // Predict next visit
        const predictedNextVisit = new Date(
          new Date(lastVisit.createdAt).getTime() + avgInterval * 24 * 60 * 60 * 1000
        );

        // Calculate visit probability (decreases as days since last visit increases)
        let visitProbability = 100;
        if (daysSinceLastVisit > avgInterval) {
          visitProbability = Math.max(10, 100 - (daysSinceLastVisit - avgInterval) * 5);
        }

        // Calculate predicted spend (average of last 3 visits)
        const recentSpends = sortedSessions.slice(0, 3).map(s => s.priceCents || 0);
        const predictedSpend = recentSpends.reduce((a, b) => a + b, 0) / recentSpends.length;

        // Determine churn risk
        let churnRisk: 'low' | 'medium' | 'high' = 'low';
        if (daysSinceLastVisit > avgInterval * 2) {
          churnRisk = 'high';
        } else if (daysSinceLastVisit > avgInterval * 1.5) {
          churnRisk = 'medium';
        }

        // Recommend campaign
        let recommendedCampaign: string | undefined;
        if (churnRisk === 'high') {
          recommendedCampaign = 'win_back';
        } else if (churnRisk === 'medium') {
          recommendedCampaign = 're_engagement';
        } else if (visitProbability > 70) {
          recommendedCampaign = 'loyalty_milestone';
        }

        predictions.push({
          customerId: phone,
          customerPhone: phone,
          predictedNextVisit: visitProbability > 20 ? predictedNextVisit : null,
          visitProbability: Math.round(visitProbability),
          predictedSpend: predictedSpend / 100, // Convert to dollars
          recommendedCampaign,
          churnRisk,
          factors: [
            `Average visit interval: ${Math.round(avgInterval)} days`,
            `Days since last visit: ${daysSinceLastVisit}`,
            `Visit frequency: ${customerSessionsList.length} visits in 90 days`
          ]
        });
      }

      // Sort by churn risk (high first) or visit probability
      predictions.sort((a, b) => {
        const riskOrder = { high: 3, medium: 2, low: 1 };
        if (riskOrder[a.churnRisk] !== riskOrder[b.churnRisk]) {
          return riskOrder[b.churnRisk] - riskOrder[a.churnRisk];
        }
        return b.visitProbability - a.visitProbability;
      });

    } catch (error) {
      console.error('[Predictive Analytics] Error getting customer predictions:', error);
    }

    return predictions.slice(0, 50); // Top 50 customers
  }

  /**
   * Calculate hourly demand patterns
   * Enhanced with cyclical time features for better continuity
   */
  private calculateHourlyDemand(sessions: any[]): Map<number, { days: number[]; timeFeatures: CyclicalTimeFeatures[] }> {
    const hourlyDemand = new Map<number, { days: number[]; timeFeatures: CyclicalTimeFeatures[] }>();

    for (const session of sessions) {
      const createdAt = new Date(session.createdAt);
      const hour = createdAt.getHours();
      const day = createdAt.getDay();
      const timeFeatures = encodeCyclicalTime(createdAt);

      if (!hourlyDemand.has(hour)) {
        hourlyDemand.set(hour, { days: [], timeFeatures: [] });
      }
      const hourData = hourlyDemand.get(hour)!;
      hourData.days.push(day);
      hourData.timeFeatures.push(timeFeatures);
    }

    return hourlyDemand;
  }

  /**
   * Predict demand for a specific hour
   * Enhanced with cyclical time features for better continuity across day boundaries
   */
  private predictHourlyDemand(
    hourlyDemand: Map<number, { days: number[]; timeFeatures: CyclicalTimeFeatures[] }>,
    hour: number,
    dayOfWeek: number,
    currentTimeFeatures?: CyclicalTimeFeatures
  ): number {
    const hourData = hourlyDemand.get(hour);
    if (!hourData) return 0;
    
    const sameDayData = hourData.days.filter(d => d === dayOfWeek);
    
    // Average of same day of week for this hour
    const avgForHour = hourData.days.length > 0 ? hourData.days.length / 7 : 0;
    const avgForDay = sameDayData.length > 0 ? sameDayData.length : 0;

    // If we have current time features, use cyclical similarity for adjacent hours
    let cyclicalBoost = 0;
    if (currentTimeFeatures && hourData.timeFeatures.length > 0) {
      // Calculate average similarity to current time
      const similarities = hourData.timeFeatures.map(tf => 
        calculateTimeSimilarity(currentTimeFeatures, tf)
      );
      const avgSimilarity = similarities.reduce((a, b) => a + b, 0) / similarities.length;
      cyclicalBoost = avgSimilarity * 0.2; // 20% boost for time similarity
    }

    // Weighted average (favor same day of week, with cyclical boost)
    return Math.ceil((avgForDay * 0.7 + avgForHour * 0.3) * (1 + cyclicalBoost));
  }

  /**
   * Predict demand for next shift (4 hours)
   * Enhanced with cyclical encoding for smooth transitions across day boundaries
   */
  private predictShiftDemand(
    hourlyDemand: Map<number, { days: number[]; timeFeatures: CyclicalTimeFeatures[] }>,
    currentHour: number,
    dayOfWeek: number,
    currentTimeFeatures?: CyclicalTimeFeatures
  ): number {
    let total = 0;
    for (let i = 1; i <= 4; i++) {
      const hour = (currentHour + i) % 24;
      // Create time features for the future hour to maintain cyclical continuity
      const futureDate = new Date();
      futureDate.setHours(hour, 0, 0, 0);
      const futureTimeFeatures = encodeCyclicalTime(futureDate);
      
      total += this.predictHourlyDemand(hourlyDemand, hour, dayOfWeek, futureTimeFeatures);
    }
    return total;
  }

  /**
   * Predict daily demand
   */
  private predictDailyDemand(sessions: any[], currentDay: number): number {
    // Get sessions for same day of week in last 4 weeks
    const sameDaySessions = sessions.filter(s => {
      const sessionDay = new Date(s.createdAt).getDay();
      return sessionDay === currentDay;
    });

    // Average daily sessions for this day of week
    return Math.ceil(sameDaySessions.length / 4); // 4 weeks of data
  }

  /**
   * Get day name
   */
  private getDayName(day: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day];
  }
}

// Singleton instance
export const predictiveEngine = new PredictiveAnalyticsEngine();

