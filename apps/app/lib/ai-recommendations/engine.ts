import { prisma } from '../../db';

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

    // 1. Based on customer's past orders (content-based)
    if (context.customerPhone || context.customerId) {
      const pastRecommendations = await this.getRecommendationsFromHistory(context);
      recommendations.push(...pastRecommendations);
    }

    // 2. Based on similar customers (collaborative filtering)
    const collaborativeRecommendations = await this.getCollaborativeRecommendations(context);
    recommendations.push(...collaborativeRecommendations);

    // 3. Based on popular combinations
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

    // Merge and deduplicate recommendations
    const merged = this.mergeRecommendations(recommendations);
    
    // Sort by confidence and return top recommendations
    return merged
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10);
  }

  /**
   * Get recommendations based on customer's order history
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

      // Extract flavors from past orders
      const flavorFrequency = new Map<string, number>();
      for (const session of pastSessions) {
        if (session.flavorMix && typeof session.flavorMix === 'object') {
          const mix = session.flavorMix as any;
          const flavors = Array.isArray(mix.flavors) ? mix.flavors : [];
          for (const flavor of flavors) {
            flavorFrequency.set(flavor, (flavorFrequency.get(flavor) || 0) + 1);
          }
        }
      }

      // Convert to recommendations
      const totalSessions = pastSessions.length;
      for (const [flavorId, count] of flavorFrequency.entries()) {
        const confidence = Math.min(0.9, count / totalSessions);
        if (confidence > 0.1) {
          recommendations.push({
            flavorId,
            flavorName: flavorId, // Will be resolved later
            confidence,
            reason: `You've ordered this ${count} time${count > 1 ? 's' : ''} before`,
            category: 'history'
          });
        }
      }
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
          flavorMix: { not: null },
          paymentStatus: 'succeeded',
          customerPhone: { not: context.customerPhone || null }
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
      for (const [flavorId, score] of flavorScores.entries()) {
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
      }
    } catch (error) {
      console.error('[AI Recommendations] Error getting collaborative recommendations:', error);
    }

    return recommendations;
  }

  /**
   * Get recommendations based on popular flavors
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
          flavorMix: { not: null },
          paymentStatus: 'succeeded',
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        },
        take: 200
      });

      const flavorFrequency = new Map<string, number>();
      for (const session of recentSessions) {
        if (session.flavorMix && typeof session.flavorMix === 'object') {
          const mix = session.flavorMix as any;
          const flavors = Array.isArray(mix.flavors) ? mix.flavors : [];
          for (const flavor of flavors) {
            flavorFrequency.set(flavor, (flavorFrequency.get(flavor) || 0) + 1);
          }
        }
      }

      // Convert to recommendations
      const maxFrequency = Math.max(...Array.from(flavorFrequency.values()), 1);
      for (const [flavorId, frequency] of flavorFrequency.entries()) {
        const confidence = Math.min(0.7, frequency / maxFrequency);
        if (confidence > 0.15) {
          recommendations.push({
            flavorId,
            flavorName: flavorId,
            confidence,
            reason: `Trending - ordered ${frequency} times recently`,
            category: 'popular'
          });
        }
      }
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
          flavorMix: { not: null },
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
      for (const [flavorId, score] of pairingScores.entries()) {
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
      }
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
            name: savedMix.name || 'Your Saved Mix',
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
          flavorMix: { not: null },
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
      for (const [mixKey, mixData] of mixFrequency.entries()) {
        if (mixData.count >= 3) { // Only recommend if ordered at least 3 times
          const confidence = Math.min(0.7, mixData.count / maxCount);
          recommendations.push({
            flavors: mixData.flavors,
            name: `Popular Mix (${mixData.count} orders)`,
            confidence,
            reason: `Ordered ${mixData.count} times by other customers`
          });
        }
      }
    } catch (error) {
      console.error('[AI Recommendations] Error getting popular mixes:', error);
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

