import { prisma } from '../db';
import { Prisma } from '@prisma/client';
import { encodeCyclicalTime, calculateTimeSimilarity, getTimePeriodLabels, type CyclicalTimeFeatures } from '../utils/cyclical-time';

export interface FlavorRecommendation {
  flavorId: string;
  flavorName: string;
  confidence: number; // 0-1
  reason: string;
  category: string;
}

export interface MixRecommendation {
  flavors: string[];
  name: string;
  confidence: number;
  reason: string;
}

export interface RecommendationContext {
  customerPhone?: string;
  customerId?: string;
  loungeId: string;
  currentSelection?: string[];
  sessionHistory?: string[];
  sessionTime?: Date; // NEW: Time of session for time-based recommendations
  preferences?: {
    favoriteFlavors?: string[];
    savedMixes?: Array<{ flavors: string[] }>;
  };
}

/**
 * AI Recommendation Engine
 * Uses collaborative filtering, content-based filtering, and popularity analysis
 */
export class AIRecommendationEngine {
  /**
   * Get personalized flavor recommendations
   */
  async getFlavorRecommendations(context: RecommendationContext): Promise<FlavorRecommendation[]> {
    const recommendations: FlavorRecommendation[] = [];

    // 1. Based on customer's past orders (content-based) - now time-aware
    if (context.customerPhone || context.customerId) {
      const pastRecommendations = await this.getRecommendationsFromHistory(context);
      recommendations.push(...pastRecommendations);
    }

    // 2. Based on similar customers (collaborative filtering)
    const collaborativeRecommendations = await this.getCollaborativeRecommendations(context);
    recommendations.push(...collaborativeRecommendations);

    // 3. Based on popular combinations - now time-aware
    const popularRecommendations = await this.getPopularRecommendations(context);
    recommendations.push(...popularRecommendations);

    // 4. Based on flavor compatibility
    if (context.currentSelection && context.currentSelection.length > 0) {
      const compatibilityRecommendations = await this.getCompatibilityRecommendations(
        context.currentSelection,
        context.loungeId
      );
      recommendations.push(...compatibilityRecommendations);
    }

    // 5. NEW: Time-based recommendations (late-night vs afternoon preferences)
    if (context.sessionTime) {
      const timeBasedRecommendations = await this.getTimeBasedRecommendations(context);
      recommendations.push(...timeBasedRecommendations);
    }

    // Merge and deduplicate recommendations
    const merged = this.mergeRecommendations(recommendations);
    
    // Sort by confidence and return top recommendations
    return merged
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10);
  }

  /**
   * Get recommendations based on customer's order history
   * Now time-aware: weights recommendations by time similarity
   */
  private async getRecommendationsFromHistory(
    context: RecommendationContext
  ): Promise<FlavorRecommendation[]> {
    const recommendations: FlavorRecommendation[] = [];

    try {
      // Get customer's past sessions
      const where: any = { loungeId: context.loungeId };
      if (context.customerPhone) where.customerPhone = context.customerPhone;
      if (context.customerId) where.customerRef = context.customerId;

      const pastSessions = await prisma.session.findMany({
        where: {
          ...where,
          flavorMix: { not: null },
          paymentStatus: 'succeeded'
        },
        orderBy: { createdAt: 'desc' },
        take: 20
      });

      // Get current time features if sessionTime is provided
      const currentTimeFeatures = context.sessionTime 
        ? encodeCyclicalTime(context.sessionTime)
        : null;

      // Extract flavors from past orders with time weighting
      const flavorScores = new Map<string, { count: number; timeWeight: number }>();
      for (const session of pastSessions) {
        if (session.flavorMix && typeof session.flavorMix === 'object') {
          const mix = session.flavorMix as any;
          const flavors = Array.isArray(mix.flavors) ? mix.flavors : [];
          
          // Calculate time similarity if we have current time
          let timeWeight = 1.0;
          if (currentTimeFeatures && session.createdAt) {
            const sessionTimeFeatures = encodeCyclicalTime(new Date(session.createdAt));
            timeWeight = calculateTimeSimilarity(currentTimeFeatures, sessionTimeFeatures);
            // Boost confidence for similar times (late-night orders at late-night, etc.)
            timeWeight = 0.5 + (timeWeight * 0.5); // Scale to 0.5-1.0 range
          }
          
          for (const flavor of flavors) {
            const existing = flavorScores.get(flavor);
            if (existing) {
              existing.count++;
              existing.timeWeight = Math.max(existing.timeWeight, timeWeight);
            } else {
              flavorScores.set(flavor, { count: 1, timeWeight });
            }
          }
        }
      }

      // Convert to recommendations with time-weighted confidence
      const totalSessions = pastSessions.length;
      Array.from(flavorScores.entries()).forEach(([flavorId, { count, timeWeight }]) => {
        const baseConfidence = Math.min(0.9, count / totalSessions);
        const timeAdjustedConfidence = baseConfidence * timeWeight;
        
        if (timeAdjustedConfidence > 0.1) {
          const timeContext = currentTimeFeatures 
            ? ` (preferred at similar times)`
            : '';
          recommendations.push({
            flavorId,
            flavorName: flavorId, // Will be resolved later
            confidence: timeAdjustedConfidence,
            reason: `You've ordered this ${count} time${count > 1 ? 's' : ''} before${timeContext}`,
            category: 'history'
          });
        }
      });
    } catch (error) {
      console.error('[AI Recommendations] Error getting history recommendations:', error);
    }

    return recommendations;
  }

  /**
   * Get recommendations based on similar customers (collaborative filtering)
   */
  private async getCollaborativeRecommendations(
    context: RecommendationContext
  ): Promise<FlavorRecommendation[]> {
    const recommendations: FlavorRecommendation[] = [];

    try {
      // Get customer's favorite flavors
      const customerFavorites = context.preferences?.favoriteFlavors || [];
      if (customerFavorites.length === 0) return recommendations;

      // Find other customers who like similar flavors
      const similarCustomers = await prisma.session.findMany({
        where: {
          loungeId: context.loungeId,
          flavorMix: { not: Prisma.JsonNull },
          paymentStatus: 'succeeded',
          customerPhone: context.customerPhone ? { not: context.customerPhone } : undefined
        },
        orderBy: { createdAt: 'desc' },
        take: 100
      });

      // Find flavors that similar customers like
      const flavorScores = new Map<string, number>();
      for (const session of similarCustomers) {
        if (session.flavorMix && typeof session.flavorMix === 'object') {
          const mix = session.flavorMix as any;
          const flavors = Array.isArray(mix.flavors) ? mix.flavors : [];
          
          // Check if this customer has similar taste
          const overlap = flavors.filter((f: string) => customerFavorites.includes(f)).length;
          if (overlap > 0) {
            const similarity = overlap / Math.max(customerFavorites.length, flavors.length);
            for (const flavor of flavors) {
              if (!customerFavorites.includes(flavor)) {
                flavorScores.set(
                  flavor,
                  (flavorScores.get(flavor) || 0) + similarity
                );
              }
            }
          }
        }
      }

      // Convert to recommendations
      const maxScore = Math.max(...Array.from(flavorScores.values()), 1);
      Array.from(flavorScores.entries()).forEach(([flavorId, score]) => {
        const confidence = Math.min(0.8, score / maxScore);
        if (confidence > 0.2) {
          recommendations.push({
            flavorId,
            flavorName: flavorId,
            confidence,
            reason: 'Popular with customers who have similar taste',
            category: 'collaborative'
          });
        }
      });
    } catch (error) {
      console.error('[AI Recommendations] Error getting collaborative recommendations:', error);
    }

    return recommendations;
  }

  /**
   * Get recommendations based on popular flavors
   * Now time-aware: weights by time similarity to current session
   */
  private async getPopularRecommendations(
    context: RecommendationContext
  ): Promise<FlavorRecommendation[]> {
    const recommendations: FlavorRecommendation[] = [];

    try {
      // Get popular flavors from recent sessions
      const recentSessions = await prisma.session.findMany({
        where: {
          loungeId: context.loungeId,
          flavorMix: { not: Prisma.JsonNull },
          paymentStatus: 'succeeded',
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        },
        take: 200
      });

      // Get current time features if sessionTime is provided
      const currentTimeFeatures = context.sessionTime 
        ? encodeCyclicalTime(context.sessionTime)
        : null;

      const flavorScores = new Map<string, { frequency: number; timeWeight: number }>();
      for (const session of recentSessions) {
        if (session.flavorMix && typeof session.flavorMix === 'object') {
          const mix = session.flavorMix as any;
          const flavors = Array.isArray(mix.flavors) ? mix.flavors : [];
          
          // Calculate time similarity if we have current time
          let timeWeight = 1.0;
          if (currentTimeFeatures && session.createdAt) {
            const sessionTimeFeatures = encodeCyclicalTime(new Date(session.createdAt));
            timeWeight = calculateTimeSimilarity(currentTimeFeatures, sessionTimeFeatures);
            timeWeight = 0.6 + (timeWeight * 0.4); // Scale to 0.6-1.0 range
          }
          
          for (const flavor of flavors) {
            const existing = flavorScores.get(flavor);
            if (existing) {
              existing.frequency++;
              existing.timeWeight = Math.max(existing.timeWeight, timeWeight);
            } else {
              flavorScores.set(flavor, { frequency: 1, timeWeight });
            }
          }
        }
      }

      // Convert to recommendations with time-weighted confidence
      const maxFrequency = Math.max(...Array.from(flavorScores.values()).map(s => s.frequency), 1);
      Array.from(flavorScores.entries()).forEach(([flavorId, { frequency, timeWeight }]) => {
        const baseConfidence = Math.min(0.7, frequency / maxFrequency);
        const timeAdjustedConfidence = baseConfidence * timeWeight;
        
        if (timeAdjustedConfidence > 0.15) {
          recommendations.push({
            flavorId,
            flavorName: flavorId,
            confidence: timeAdjustedConfidence,
            reason: `Trending - ordered ${frequency} times recently${currentTimeFeatures ? ' at similar times' : ''}`,
            category: 'popular'
          });
        }
      });
    } catch (error) {
      console.error('[AI Recommendations] Error getting popular recommendations:', error);
    }

    return recommendations;
  }

  /**
   * Get recommendations based on flavor compatibility
   */
  private async getCompatibilityRecommendations(
    selectedFlavors: string[],
    loungeId: string
  ): Promise<FlavorRecommendation[]> {
    const recommendations: FlavorRecommendation[] = [];

    try {
      // Find flavors that are commonly paired with selected flavors
      const sessions = await prisma.session.findMany({
        where: {
          loungeId,
          flavorMix: { not: Prisma.JsonNull },
          paymentStatus: 'succeeded'
        },
        take: 500
      });

      const pairingScores = new Map<string, number>();
      for (const session of sessions) {
        if (session.flavorMix && typeof session.flavorMix === 'object') {
          const mix = session.flavorMix as any;
          const flavors = Array.isArray(mix.flavors) ? mix.flavors : [];
          
          // Check if this mix contains any of the selected flavors
          const hasSelected = selectedFlavors.some(f => flavors.includes(f));
          if (hasSelected) {
            for (const flavor of flavors) {
              if (!selectedFlavors.includes(flavor)) {
                pairingScores.set(
                  flavor,
                  (pairingScores.get(flavor) || 0) + 1
                );
              }
            }
          }
        }
      }

      // Convert to recommendations
      const maxScore = Math.max(...Array.from(pairingScores.values()), 1);
      Array.from(pairingScores.entries()).forEach(([flavorId, score]) => {
        const confidence = Math.min(0.75, score / maxScore);
        if (confidence > 0.2) {
          recommendations.push({
            flavorId,
            flavorName: flavorId,
            confidence,
            reason: `Pairs well with your selection`,
            category: 'compatibility'
          });
        }
      });
    } catch (error) {
      console.error('[AI Recommendations] Error getting compatibility recommendations:', error);
    }

    return recommendations;
  }

  /**
   * Get complete mix recommendations
   */
  async getMixRecommendations(context: RecommendationContext): Promise<MixRecommendation[]> {
    const recommendations: MixRecommendation[] = [];

    try {
      // Get customer's saved mixes
      if (context.preferences?.savedMixes && context.preferences.savedMixes.length > 0) {
        for (const savedMix of context.preferences.savedMixes) {
          recommendations.push({
            flavors: savedMix.flavors,
            name: (savedMix as any).name || 'Your Saved Mix',
            confidence: 0.9,
            reason: 'Your saved mix'
          });
        }
      }

      // Get popular mixes from similar customers
      const popularMixes = await this.getPopularMixes(context);
      recommendations.push(...popularMixes);

      // Sort by confidence
      return recommendations
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5);
    } catch (error) {
      console.error('[AI Recommendations] Error getting mix recommendations:', error);
      return [];
    }
  }

  /**
   * Get popular mix combinations
   */
  private async getPopularMixes(context: RecommendationContext): Promise<MixRecommendation[]> {
    const recommendations: MixRecommendation[] = [];

    try {
      const sessions = await prisma.session.findMany({
        where: {
          loungeId: context.loungeId,
          flavorMix: { not: Prisma.JsonNull },
          paymentStatus: 'succeeded'
        },
        orderBy: { createdAt: 'desc' },
        take: 500
      });

      // Count mix frequency
      const mixFrequency = new Map<string, { flavors: string[]; count: number }>();
      for (const session of sessions) {
        if (session.flavorMix && typeof session.flavorMix === 'object') {
          const mix = session.flavorMix as any;
          const flavors = Array.isArray(mix.flavors) ? mix.flavors : [];
          if (flavors.length > 0) {
            const mixKey = flavors.sort().join(',');
            const existing = mixFrequency.get(mixKey);
            if (existing) {
              existing.count++;
            } else {
              mixFrequency.set(mixKey, { flavors, count: 1 });
            }
          }
        }
      }

      // Convert to recommendations
      const maxCount = Math.max(...Array.from(mixFrequency.values()).map(m => m.count), 1);
      Array.from(mixFrequency.entries()).forEach(([mixKey, mixData]) => {
        if (mixData.count >= 3) { // Only recommend if ordered at least 3 times
          const confidence = Math.min(0.7, mixData.count / maxCount);
          recommendations.push({
            flavors: mixData.flavors,
            name: `Popular Mix (${mixData.count} orders)`,
            confidence,
            reason: `Ordered ${mixData.count} times by other customers`
          });
        }
      });
    } catch (error) {
      console.error('[AI Recommendations] Error getting popular mixes:', error);
    }

    return recommendations;
  }

  /**
   * Get time-based recommendations
   * Captures "late-night" vs "afternoon" preference shifts
   */
  private async getTimeBasedRecommendations(
    context: RecommendationContext
  ): Promise<FlavorRecommendation[]> {
    const recommendations: FlavorRecommendation[] = [];

    if (!context.sessionTime) return recommendations;

    try {
      const timeFeatures = encodeCyclicalTime(context.sessionTime);
      const { timeOfDay, dayType } = getTimePeriodLabels(timeFeatures);

      // Get flavors popular at similar times
      const similarTimeSessions = await prisma.session.findMany({
        where: {
          loungeId: context.loungeId,
          flavorMix: { not: Prisma.JsonNull },
          paymentStatus: 'succeeded',
          createdAt: {
            gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
          }
        },
        take: 500
      });

      // Score flavors by time similarity
      const flavorTimeScores = new Map<string, { score: number; count: number }>();
      for (const session of similarTimeSessions) {
        if (session.flavorMix && session.createdAt) {
          const sessionTimeFeatures = encodeCyclicalTime(new Date(session.createdAt));
          const similarity = calculateTimeSimilarity(timeFeatures, sessionTimeFeatures);
          
          if (session.flavorMix && typeof session.flavorMix === 'object') {
            const mix = session.flavorMix as any;
            const flavors = Array.isArray(mix.flavors) ? mix.flavors : [];
            
            for (const flavor of flavors) {
              const existing = flavorTimeScores.get(flavor);
              if (existing) {
                existing.score += similarity;
                existing.count++;
              } else {
                flavorTimeScores.set(flavor, { score: similarity, count: 1 });
              }
            }
          }
        }
      }

      // Convert to recommendations
      const maxScore = Math.max(...Array.from(flavorTimeScores.values()).map(s => s.score / s.count), 1);
      Array.from(flavorTimeScores.entries()).forEach(([flavorId, { score, count }]) => {
        const avgSimilarity = score / count;
        const confidence = Math.min(0.65, avgSimilarity * 0.8);
        
        if (confidence > 0.2) {
          const timeLabel = timeOfDay === 'late_night' ? 'late-night' 
            : timeOfDay === 'afternoon' ? 'afternoon'
            : timeOfDay;
          
          recommendations.push({
            flavorId,
            flavorName: flavorId,
            confidence,
            reason: `Popular during ${timeLabel} ${dayType === 'weekend' ? 'weekends' : 'sessions'}`,
            category: 'time_based'
          });
        }
      });
    } catch (error) {
      console.error('[AI Recommendations] Error getting time-based recommendations:', error);
    }

    return recommendations;
  }

  /**
   * Merge and deduplicate recommendations
   */
  private mergeRecommendations(recommendations: FlavorRecommendation[]): FlavorRecommendation[] {
    const merged = new Map<string, FlavorRecommendation>();

    for (const rec of recommendations) {
      const existing = merged.get(rec.flavorId);
      if (existing) {
        // Merge: take highest confidence, combine reasons
        existing.confidence = Math.max(existing.confidence, rec.confidence);
        if (!existing.reason.includes(rec.reason)) {
          existing.reason += ` • ${rec.reason}`;
        }
      } else {
        merged.set(rec.flavorId, { ...rec });
      }
    }

    return Array.from(merged.values());
  }
}

// Singleton instance
export const recommendationEngine = new AIRecommendationEngine();

