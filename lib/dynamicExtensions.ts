/**
 * Dynamic Session Extensions for Hookah+ Moat
 * Auto-offers extensions at T-5 minutes with seamless payment
 */

export interface ExtensionOffer {
  id: string;
  sessionId: string;
  tableId: string;
  currentDuration: number; // minutes
  remainingTime: number; // minutes
  extensionMinutes: number;
  extensionPrice: number; // cents
  offeredAt: Date;
  expiresAt: Date;
  status: 'offered' | 'accepted' | 'declined' | 'expired';
  checkoutUrl?: string;
  paymentIntentId?: string;
}

export interface UpsellBundle {
  id: string;
  name: string;
  description: string;
  items: Array<{
    sku: string;
    name: string;
    quantity: number;
    price: number; // cents
  }>;
  totalPrice: number; // cents
  discount: number; // percentage
  category: 'premium' | 'combo' | 'seasonal';
  usageCount: number;
  revenue: number; // cents
}

export class DynamicExtensions {
  private extensionOffers: Map<string, ExtensionOffer> = new Map();
  private upsellBundles: Map<string, UpsellBundle> = new Map();
  private activeTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.initializeUpsellBundles();
  }

  /**
   * Initialize pre-configured upsell bundles
   */
  private initializeUpsellBundles(): void {
    const bundles: UpsellBundle[] = [
      {
        id: 'bundle_premium_session',
        name: 'Premium Session Experience',
        description: 'Session + 2 premium flavors + premium coals + welcome drink',
        items: [
          { sku: 'hookah.session', name: 'Hookah Session', quantity: 1, price: 3000 },
          { sku: 'flavor.premium.rose', name: 'Rose Water', quantity: 1, price: 500 },
          { sku: 'flavor.premium.mint', name: 'Premium Mint', quantity: 1, price: 500 },
          { sku: 'coals.premium', name: 'Premium Coals', quantity: 1, price: 300 },
          { sku: 'drink.welcome', name: 'Welcome Drink', quantity: 1, price: 200 }
        ],
        totalPrice: 4500,
        discount: 10,
        category: 'premium',
        usageCount: 0,
        revenue: 0
      },
      {
        id: 'bundle_friday_night',
        name: 'Friday Night Special',
        description: 'Extended session + 3 flavors + 2 drinks + late night snacks',
        items: [
          { sku: 'hookah.session', name: 'Hookah Session', quantity: 1, price: 3000 },
          { sku: 'flavor.mixed', name: 'Mixed Flavors', quantity: 3, price: 400 },
          { sku: 'drink.special', name: 'Special Drinks', quantity: 2, price: 300 },
          { sku: 'snack.late_night', name: 'Late Night Snacks', quantity: 1, price: 400 }
        ],
        totalPrice: 5000,
        discount: 15,
        category: 'combo',
        usageCount: 0,
        revenue: 0
      },
      {
        id: 'bundle_vip_experience',
        name: 'VIP Experience',
        description: 'Private table + premium session + personal attendant + exclusive flavors',
        items: [
          { sku: 'table.vip', name: 'VIP Table', quantity: 1, price: 2000 },
          { sku: 'hookah.premium', name: 'Premium Hookah', quantity: 1, price: 4000 },
          { sku: 'flavor.exclusive', name: 'Exclusive Flavors', quantity: 2, price: 800 },
          { sku: 'service.personal', name: 'Personal Attendant', quantity: 1, price: 1000 }
        ],
        totalPrice: 7800,
        discount: 20,
        category: 'premium',
        usageCount: 0,
        revenue: 0
      }
    ];

    bundles.forEach(bundle => {
      this.upsellBundles.set(bundle.id, bundle);
    });
  }

  /**
   * Check if session is eligible for extension offer
   */
  isEligibleForExtension(sessionId: string, currentDuration: number): boolean {
    // Offer extension when 5 minutes remaining
    const timeRemaining = 30 - currentDuration; // Assuming 30-minute base session
    return timeRemaining <= 5 && timeRemaining > 0;
  }

  /**
   * Create extension offer for session
   */
  createExtensionOffer(
    sessionId: string,
    tableId: string,
    currentDuration: number,
    extensionMinutes: number = 20,
    extensionPrice: number = 1000 // $10.00
  ): ExtensionOffer {
    const offer: ExtensionOffer = {
      id: `ext_${sessionId}_${Date.now()}`,
      sessionId,
      tableId,
      currentDuration,
      remainingTime: 30 - currentDuration,
      extensionMinutes,
      extensionPrice,
      offeredAt: new Date(),
      expiresAt: new Date(Date.now() + 2 * 60 * 1000), // 2 minutes to decide
      status: 'offered'
    };

    this.extensionOffers.set(offer.id, offer);

    // Set timer to expire offer
    const timer = setTimeout(() => {
      this.expireOffer(offer.id);
    }, 2 * 60 * 1000);

    this.activeTimers.set(offer.id, timer);

    console.log(`🎯 Extension offer created for session ${sessionId}: +${extensionMinutes}min for $${extensionPrice/100}`);
    
    return offer;
  }

  /**
   * Accept extension offer
   */
  acceptExtensionOffer(offerId: string, checkoutUrl: string, paymentIntentId: string): boolean {
    const offer = this.extensionOffers.get(offerId);
    if (!offer || offer.status !== 'offered') return false;

    offer.status = 'accepted';
    offer.checkoutUrl = checkoutUrl;
    offer.paymentIntentId = paymentIntentId;

    // Clear timer
    const timer = this.activeTimers.get(offerId);
    if (timer) {
      clearTimeout(timer);
      this.activeTimers.delete(offerId);
    }

    console.log(`✅ Extension offer ${offerId} accepted`);
    return true;
  }

  /**
   * Decline extension offer
   */
  declineExtensionOffer(offerId: string): boolean {
    const offer = this.extensionOffers.get(offerId);
    if (!offer || offer.status !== 'offered') return false;

    offer.status = 'declined';

    // Clear timer
    const timer = this.activeTimers.get(offerId);
    if (timer) {
      clearTimeout(timer);
      this.activeTimers.delete(offerId);
    }

    console.log(`❌ Extension offer ${offerId} declined`);
    return true;
  }

  /**
   * Expire extension offer
   */
  private expireOffer(offerId: string): void {
    const offer = this.extensionOffers.get(offerId);
    if (!offer) return;

    offer.status = 'expired';
    this.activeTimers.delete(offerId);

    console.log(`⏰ Extension offer ${offerId} expired`);
  }

  /**
   * Get active extension offers for table
   */
  getActiveOffersForTable(tableId: string): ExtensionOffer[] {
    return Array.from(this.extensionOffers.values())
      .filter(offer => offer.tableId === tableId && offer.status === 'offered');
  }

  /**
   * Get upsell bundles by category
   */
  getUpsellBundles(category?: string): UpsellBundle[] {
    const bundles = Array.from(this.upsellBundles.values());
    return category ? bundles.filter(bundle => bundle.category === category) : bundles;
  }

  /**
   * Record bundle usage
   */
  recordBundleUsage(bundleId: string, revenue: number): void {
    const bundle = this.upsellBundles.get(bundleId);
    if (!bundle) return;

    bundle.usageCount++;
    bundle.revenue += revenue;

    console.log(`📊 Bundle ${bundleId} used: ${bundle.usageCount} times, $${bundle.revenue/100} revenue`);
  }

  /**
   * Get bundle analytics
   */
  getBundleAnalytics(): {
    totalBundles: number;
    totalUsage: number;
    totalRevenue: number;
    topBundles: Array<{ bundleId: string; usage: number; revenue: number }>;
    categoryBreakdown: Record<string, { count: number; revenue: number }>;
  } {
    const bundles = Array.from(this.upsellBundles.values());
    
    const totalBundles = bundles.length;
    const totalUsage = bundles.reduce((sum, bundle) => sum + bundle.usageCount, 0);
    const totalRevenue = bundles.reduce((sum, bundle) => sum + bundle.revenue, 0);

    const topBundles = bundles
      .map(bundle => ({
        bundleId: bundle.id,
        usage: bundle.usageCount,
        revenue: bundle.revenue
      }))
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 5);

    const categoryBreakdown: Record<string, { count: number; revenue: number }> = {};
    bundles.forEach(bundle => {
      if (!categoryBreakdown[bundle.category]) {
        categoryBreakdown[bundle.category] = { count: 0, revenue: 0 };
      }
      categoryBreakdown[bundle.category].count++;
      categoryBreakdown[bundle.category].revenue += bundle.revenue;
    });

    return {
      totalBundles,
      totalUsage,
      totalRevenue,
      topBundles,
      categoryBreakdown
    };
  }

  /**
   * Auto-offer extensions for eligible sessions
   */
  checkAndOfferExtensions(sessions: Array<{ id: string; tableId: string; duration: number }>): void {
    sessions.forEach(session => {
      if (this.isEligibleForExtension(session.id, session.duration)) {
        // Check if offer already exists
        const existingOffer = Array.from(this.extensionOffers.values())
          .find(offer => offer.sessionId === session.id && offer.status === 'offered');

        if (!existingOffer) {
          this.createExtensionOffer(session.id, session.tableId, session.duration);
        }
      }
    });
  }

  /**
   * Get extension offer by ID
   */
  getExtensionOffer(offerId: string): ExtensionOffer | undefined {
    return this.extensionOffers.get(offerId);
  }

  /**
   * Get all extension offers
   */
  getAllExtensionOffers(): ExtensionOffer[] {
    return Array.from(this.extensionOffers.values());
  }
}

// Export singleton instance
export const dynamicExtensions = new DynamicExtensions();
