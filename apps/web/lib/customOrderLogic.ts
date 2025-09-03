// lib/customOrderLogic.ts
// Custom Order Logic for Popular Flavor Detection and AGENT.MD Integration

export interface CustomOrder {
  id: string;
  tableId: string;
  flavor: string;
  amount: number;
  isPopular: boolean;
  popularityScore: number;
  timestamp: number;
  aliethiaEvent?: any;
  sessionId?: string;
}

export interface FlavorPopularity {
  flavor: string;
  orderCount: number;
  lastOrdered: number;
  popularityScore: number;
  isTrending: boolean;
}

export class CustomOrderLogic {
  private orders: CustomOrder[] = [];
  private flavorPopularity: Map<string, FlavorPopularity> = new Map();
  private popularFlavors = [
    "Blue Mist + Mint",
    "Double Apple", 
    "Grape Mint",
    "Strawberry Kiwi",
    "Peach Iced Tea",
    "Watermelon Mint",
    "Blueberry Muffin",
    "Pink Lemonade"
  ];

  // Process a new order and determine if it's popular
  public processOrder(tableId: string, flavor: string, amount: number, sessionId?: string): CustomOrder {
    const isPopular = this.popularFlavors.includes(flavor);
    const popularityScore = this.calculatePopularityScore(flavor);
    
    const order: CustomOrder = {
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tableId,
      flavor,
      amount,
      isPopular,
      popularityScore,
      timestamp: Date.now(),
      sessionId
    };

    // Update flavor popularity
    this.updateFlavorPopularity(flavor);
    
    // Store order
    this.orders.push(order);
    
    // Trigger Aliethia.Identity event for popular flavors
    if (isPopular) {
      order.aliethiaEvent = {
        type: 'mix_ordered',
        profileId: `guest_${Date.now()}`,
        venueId: 'venue_001',
        comboHash: flavor.toLowerCase().replace(/\s+/g, '_'),
        timestamp: Date.now(),
        orderId: order.id
      };
    }

    console.log(`🍯 Custom Order Logic: Processed ${isPopular ? 'POPULAR' : 'standard'} order`, order);
    
    return order;
  }

  // Calculate popularity score based on recent orders
  private calculatePopularityScore(flavor: string): number {
    const recentOrders = this.orders.filter(o => 
      o.flavor === flavor && 
      Date.now() - o.timestamp < 86400000 // Last 24 hours
    );
    
    const baseScore = this.popularFlavors.includes(flavor) ? 50 : 0;
    const recentScore = Math.min(recentOrders.length * 10, 40);
    
    return baseScore + recentScore;
  }

  // Update flavor popularity tracking
  private updateFlavorPopularity(flavor: string): void {
    const existing = this.flavorPopularity.get(flavor);
    const now = Date.now();
    
    if (existing) {
      existing.orderCount++;
      existing.lastOrdered = now;
      existing.popularityScore = this.calculatePopularityScore(flavor);
      existing.isTrending = existing.orderCount >= 3 && (now - existing.lastOrdered) < 3600000; // 1 hour
    } else {
      this.flavorPopularity.set(flavor, {
        flavor,
        orderCount: 1,
        lastOrdered: now,
        popularityScore: this.calculatePopularityScore(flavor),
        isTrending: false
      });
    }
  }

  // Get trending flavors
  public getTrendingFlavors(): FlavorPopularity[] {
    return Array.from(this.flavorPopularity.values())
      .filter(f => f.isTrending)
      .sort((a, b) => b.popularityScore - a.popularityScore);
  }

  // Get popular flavors
  public getPopularFlavors(): FlavorPopularity[] {
    return Array.from(this.flavorPopularity.values())
      .filter(f => f.popularityScore >= 50)
      .sort((a, b) => b.popularityScore - a.popularityScore);
  }

  // Get recent orders
  public getRecentOrders(limit: number = 10): CustomOrder[] {
    return this.orders
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  // Get orders by popularity
  public getOrdersByPopularity(): CustomOrder[] {
    return this.orders
      .filter(o => o.isPopular)
      .sort((a, b) => b.popularityScore - a.popularityScore);
  }

  // Get flavor analytics
  public getFlavorAnalytics(): Record<string, any> {
    const totalOrders = this.orders.length;
    const popularOrders = this.orders.filter(o => o.isPopular).length;
    const trendingFlavors = this.getTrendingFlavors();
    const topFlavors = this.getPopularFlavors().slice(0, 5);

    return {
      totalOrders,
      popularOrders,
      popularityRate: totalOrders > 0 ? (popularOrders / totalOrders) * 100 : 0,
      trendingFlavors: trendingFlavors.length,
      topFlavors: topFlavors.map(f => ({
        flavor: f.flavor,
        score: f.popularityScore,
        orders: f.orderCount
      })),
      lastUpdated: Date.now()
    };
  }

  // Trigger Aliethia.Identity event for popular flavor
  public async triggerAliethiaEvent(order: CustomOrder): Promise<void> {
    if (!order.aliethiaEvent) return;

    try {
      const response = await fetch('/api/agents/aliethia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'mix_ordered',
          data: order.aliethiaEvent
        })
      });

      if (response.ok) {
        console.log('🧠 Aliethia.Identity: Popular flavor event triggered', order.aliethiaEvent);
      } else {
        console.error('Failed to trigger Aliethia.Identity event');
      }
    } catch (error) {
      console.error('Error triggering Aliethia.Identity event:', error);
    }
  }

  // Get dashboard data for display
  public getDashboardData(): Record<string, any> {
    return {
      recentOrders: this.getRecentOrders(5),
      trendingFlavors: this.getTrendingFlavors(),
      analytics: this.getFlavorAnalytics(),
      popularFlavors: this.popularFlavors
    };
  }
}

// Singleton instance
export const customOrderLogic = new CustomOrderLogic();
