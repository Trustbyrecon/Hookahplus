// hookahplus-v2-/lib/upsell-bundles.ts
import { EventEmitter } from 'events';

export interface UpsellBundle {
  id: string;
  name: string;
  description: string;
  category: 'hookah' | 'drinks' | 'food' | 'desserts' | 'premium' | 'combo';
  basePrice: number; // in cents
  items: BundleItem[];
  targetItems: string[]; // items this bundle can be applied to
  conditions: BundleConditions;
  discount: BundleDiscount;
  availability: BundleAvailability;
  analytics: BundleAnalytics;
}

export interface BundleItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category: string;
  required: boolean; // if true, item must be included
  substitutable: boolean; // if true, can be substituted
  substitutions?: string[]; // allowed substitutions
}

export interface BundleConditions {
  minPartySize?: number;
  maxPartySize?: number;
  timeRestrictions?: {
    startHour: number;
    endHour: number;
    days: number[]; // 0-6 (Sunday-Saturday)
  };
  customerTier?: 'bronze' | 'silver' | 'gold' | 'platinum';
  loyaltyPoints?: number;
  previousPurchases?: number;
  seasonalOnly?: boolean;
  limitedTime?: {
    startDate: number;
    endDate: number;
  };
}

export interface BundleDiscount {
  type: 'percentage' | 'fixed' | 'bogo' | 'tiered';
  value: number; // percentage, fixed amount, or tier threshold
  maxDiscount?: number; // maximum discount amount
  minOrderAmount?: number; // minimum order to qualify
  applicableItems?: string[]; // specific items discount applies to
}

export interface BundleAvailability {
  isActive: boolean;
  maxUses?: number; // maximum times bundle can be used
  currentUses: number;
  maxUsesPerCustomer?: number;
  customerUses: Map<string, number>; // customerId -> usage count
  inventoryRequired?: Map<string, number>; // itemId -> required quantity
}

export interface BundleAnalytics {
  totalUses: number;
  totalRevenue: number;
  conversionRate: number; // percentage of offers that convert
  averageOrderValue: number;
  popularTimes: { hour: number; uses: number }[];
  customerSegments: { segment: string; uses: number }[];
}

export interface DynamicDiscount {
  id: string;
  name: string;
  type: 'quiet_hours' | 'slow_period' | 'inventory_clearance' | 'loyalty_reward' | 'first_time';
  conditions: DiscountConditions;
  discount: BundleDiscount;
  isActive: boolean;
  priority: number; // higher number = higher priority
  createdAt: number;
  expiresAt?: number;
}

export interface DiscountConditions {
  timeRange?: {
    startHour: number;
    endHour: number;
    days: number[];
  };
  dayOfWeek?: number[];
  customerTier?: string[];
  orderValue?: {
    min: number;
    max?: number;
  };
  itemCategories?: string[];
  inventoryLevels?: Map<string, number>; // itemId -> max level to trigger
  weather?: 'sunny' | 'rainy' | 'cold' | 'hot';
  occupancy?: {
    min: number; // minimum occupancy percentage
    max?: number; // maximum occupancy percentage
  };
}

export class UpsellBundles extends EventEmitter {
  private bundles: Map<string, UpsellBundle> = new Map();
  private dynamicDiscounts: Map<string, DynamicDiscount> = new Map();
  private isRunning = false;

  constructor() {
    super();
    this.initializeBundles();
    this.initializeDynamicDiscounts();
  }

  // Initialize default bundles
  private initializeBundles() {
    const defaultBundles: UpsellBundle[] = [
      {
        id: 'premium_hookah_combo',
        name: 'Premium Hookah Experience',
        description: 'Premium hookah with premium coal and flavor boost',
        category: 'premium',
        basePrice: 4500, // $45.00
        items: [
          { id: 'premium_hookah', name: 'Premium Hookah', quantity: 1, unitPrice: 3500, totalPrice: 3500, category: 'hookah', required: true, substitutable: false },
          { id: 'premium_coal', name: 'Premium Coal', quantity: 1, unitPrice: 500, totalPrice: 500, category: 'accessories', required: true, substitutable: false },
          { id: 'flavor_boost', name: 'Flavor Boost', quantity: 1, unitPrice: 500, totalPrice: 500, category: 'accessories', required: true, substitutable: false }
        ],
        targetItems: ['premium_hookah', 'standard_hookah'],
        conditions: {
          minPartySize: 2,
          customerTier: 'silver'
        },
        discount: {
          type: 'percentage',
          value: 15, // 15% off
          maxDiscount: 1000 // Max $10 discount
        },
        availability: {
          isActive: true,
          maxUses: 1000,
          currentUses: 0,
          maxUsesPerCustomer: 3,
          customerUses: new Map()
        },
        analytics: {
          totalUses: 0,
          totalRevenue: 0,
          conversionRate: 0,
          averageOrderValue: 0,
          popularTimes: [],
          customerSegments: []
        }
      },
      {
        id: 'drinks_and_desserts',
        name: 'Drinks & Desserts Combo',
        description: 'Any drink + any dessert for a special price',
        category: 'combo',
        basePrice: 1200, // $12.00
        items: [
          { id: 'any_drink', name: 'Any Drink', quantity: 1, unitPrice: 800, totalPrice: 800, category: 'drinks', required: true, substitutable: true, substitutions: ['cocktail', 'mocktail', 'soda', 'juice'] },
          { id: 'any_dessert', name: 'Any Dessert', quantity: 1, unitPrice: 600, totalPrice: 600, category: 'desserts', required: true, substitutable: true, substitutions: ['cake', 'ice_cream', 'pastry'] }
        ],
        targetItems: ['cocktail', 'mocktail', 'soda', 'juice', 'cake', 'ice_cream', 'pastry'],
        conditions: {
          timeRestrictions: {
            startHour: 14, // 2 PM
            endHour: 18, // 6 PM
            days: [1, 2, 3, 4, 5] // Monday-Friday
          }
        },
        discount: {
          type: 'fixed',
          value: 200, // $2.00 off
          minOrderAmount: 1500 // $15.00 minimum
        },
        availability: {
          isActive: true,
          maxUses: 500,
          currentUses: 0,
          maxUsesPerCustomer: 2,
          customerUses: new Map()
        },
        analytics: {
          totalUses: 0,
          totalRevenue: 0,
          conversionRate: 0,
          averageOrderValue: 0,
          popularTimes: [],
          customerSegments: []
        }
      }
    ];

    defaultBundles.forEach(bundle => {
      this.bundles.set(bundle.id, bundle);
    });
  }

  // Initialize dynamic discounts
  private initializeDynamicDiscounts() {
    const defaultDiscounts: DynamicDiscount[] = [
      {
        id: 'quiet_hours_discount',
        name: 'Quiet Hours Special',
        type: 'quiet_hours',
        conditions: {
          timeRange: {
            startHour: 14, // 2 PM
            endHour: 17, // 5 PM
            days: [1, 2, 3, 4, 5] // Monday-Friday
          },
          occupancy: {
            max: 30 // Less than 30% occupancy
          }
        },
        discount: {
          type: 'percentage',
          value: 20, // 20% off
          maxDiscount: 1500 // Max $15 discount
        },
        isActive: true,
        priority: 1,
        createdAt: Date.now()
      },
      {
        id: 'slow_period_bundle',
        name: 'Slow Period Bundle',
        type: 'slow_period',
        conditions: {
          timeRange: {
            startHour: 10, // 10 AM
            endHour: 14, // 2 PM
            days: [0, 1, 2, 3, 4, 5, 6] // All days
          },
          occupancy: {
            max: 20 // Less than 20% occupancy
          }
        },
        discount: {
          type: 'fixed',
          value: 500, // $5.00 off
          minOrderAmount: 2000 // $20.00 minimum
        },
        isActive: true,
        priority: 2,
        createdAt: Date.now()
      },
      {
        id: 'loyalty_reward',
        name: 'Loyalty Reward',
        type: 'loyalty_reward',
        conditions: {
          customerTier: ['gold', 'platinum'],
          orderValue: {
            min: 3000 // $30.00 minimum
          }
        },
        discount: {
          type: 'percentage',
          value: 10, // 10% off
          maxDiscount: 2000 // Max $20 discount
        },
        isActive: true,
        priority: 3,
        createdAt: Date.now()
      }
    ];

    defaultDiscounts.forEach(discount => {
      this.dynamicDiscounts.set(discount.id, discount);
    });
  }

  // Start upsell bundles system
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('💰 Upsell Bundles System Started');
    
    // Update dynamic discounts every hour
    setInterval(() => {
      this.updateDynamicDiscounts();
    }, 3600000);
  }

  // Stop upsell bundles system
  stop() {
    this.isRunning = false;
    console.log('⏹️ Upsell Bundles System Stopped');
  }

  // Get available bundles for customer
  getAvailableBundles(customerData: {
    customerId: string;
    partySize: number;
    currentOrder: any[];
    customerTier?: string;
    loyaltyPoints?: number;
    timeOfDay?: number;
    dayOfWeek?: number;
  }): UpsellBundle[] {
    const availableBundles: UpsellBundle[] = [];

    this.bundles.forEach(bundle => {
      if (this.isBundleAvailable(bundle, customerData)) {
        availableBundles.push(bundle);
      }
    });

    // Sort by priority (higher conversion rate first)
    return availableBundles.sort((a, b) => 
      b.analytics.conversionRate - a.analytics.conversionRate
    );
  }

  // Get applicable dynamic discounts
  getDynamicDiscounts(customerData: {
    customerId: string;
    orderValue: number;
    itemCategories: string[];
    customerTier?: string;
    timeOfDay?: number;
    dayOfWeek?: number;
    occupancy?: number;
  }): DynamicDiscount[] {
    const applicableDiscounts: DynamicDiscount[] = [];

    this.dynamicDiscounts.forEach(discount => {
      if (this.isDiscountApplicable(discount, customerData)) {
        applicableDiscounts.push(discount);
      }
    });

    // Sort by priority
    return applicableDiscounts.sort((a, b) => b.priority - a.priority);
  }

  // Apply bundle to order
  applyBundle(bundleId: string, customerId: string, orderItems: any[]): {
    success: boolean;
    bundle?: UpsellBundle;
    discountAmount?: number;
    newItems?: any[];
    error?: string;
  } {
    const bundle = this.bundles.get(bundleId);
    if (!bundle) {
      return { success: false, error: 'Bundle not found' };
    }

    // Check availability
    if (!bundle.availability.isActive) {
      return { success: false, error: 'Bundle not available' };
    }

    if (bundle.availability.maxUses && bundle.availability.currentUses >= bundle.availability.maxUses) {
      return { success: false, error: 'Bundle usage limit reached' };
    }

    if (bundle.availability.maxUsesPerCustomer) {
      const customerUses = bundle.availability.customerUses.get(customerId) || 0;
      if (customerUses >= bundle.availability.maxUsesPerCustomer) {
        return { success: false, error: 'Customer usage limit reached' };
      }
    }

    // Calculate discount
    const discountAmount = this.calculateDiscount(bundle, orderItems);
    if (discountAmount <= 0) {
      return { success: false, error: 'No discount applicable' };
    }

    // Apply bundle
    bundle.availability.currentUses++;
    bundle.analytics.totalUses++;
    bundle.analytics.totalRevenue += bundle.basePrice - discountAmount;

    const customerUses = bundle.availability.customerUses.get(customerId) || 0;
    bundle.availability.customerUses.set(customerId, customerUses + 1);

    this.emit('bundle_applied', {
      type: 'bundle_applied',
      bundleId,
      customerId,
      discountAmount,
      timestamp: Date.now(),
      data: bundle
    });

    console.log(`💰 Bundle applied: ${bundle.name} (${discountAmount/100} off)`);
    return {
      success: true,
      bundle,
      discountAmount,
      newItems: bundle.items
    };
  }

  // Apply dynamic discount
  applyDynamicDiscount(discountId: string, orderValue: number): {
    success: boolean;
    discount?: DynamicDiscount;
    discountAmount?: number;
    error?: string;
  } {
    const discount = this.dynamicDiscounts.get(discountId);
    if (!discount) {
      return { success: false, error: 'Discount not found' };
    }

    if (!discount.isActive) {
      return { success: false, error: 'Discount not active' };
    }

    if (discount.expiresAt && Date.now() > discount.expiresAt) {
      return { success: false, error: 'Discount expired' };
    }

    const discountAmount = this.calculateDynamicDiscount(discount, orderValue);
    if (discountAmount <= 0) {
      return { success: false, error: 'No discount applicable' };
    }

    this.emit('dynamic_discount_applied', {
      type: 'dynamic_discount_applied',
      discountId,
      orderValue,
      discountAmount,
      timestamp: Date.now(),
      data: discount
    });

    console.log(`💰 Dynamic discount applied: ${discount.name} (${discountAmount/100} off)`);
    return {
      success: true,
      discount,
      discountAmount
    };
  }

  // Check if bundle is available
  private isBundleAvailable(bundle: UpsellBundle, customerData: any): boolean {
    if (!bundle.availability.isActive) return false;

    // Check party size
    if (bundle.conditions.minPartySize && customerData.partySize < bundle.conditions.minPartySize) {
      return false;
    }
    if (bundle.conditions.maxPartySize && customerData.partySize > bundle.conditions.maxPartySize) {
      return false;
    }

    // Check customer tier
    if (bundle.conditions.customerTier && customerData.customerTier !== bundle.conditions.customerTier) {
      return false;
    }

    // Check time restrictions
    if (bundle.conditions.timeRestrictions) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentDay = now.getDay();
      
      if (customerData.timeOfDay && (currentHour < bundle.conditions.timeRestrictions.startHour || 
          currentHour >= bundle.conditions.timeRestrictions.endHour)) {
        return false;
      }
      
      if (customerData.dayOfWeek && !bundle.conditions.timeRestrictions.days.includes(currentDay)) {
        return false;
      }
    }

    // Check if target items are in current order
    const hasTargetItems = bundle.targetItems.some(targetItem => 
      customerData.currentOrder.some((item: any) => item.id === targetItem)
    );

    return hasTargetItems;
  }

  // Check if dynamic discount is applicable
  private isDiscountApplicable(discount: DynamicDiscount, customerData: any): boolean {
    if (!discount.isActive) return false;

    // Check time range
    if (discount.conditions.timeRange) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentDay = now.getDay();
      
      if (customerData.timeOfDay && (currentHour < discount.conditions.timeRange.startHour || 
          currentHour >= discount.conditions.timeRange.endHour)) {
        return false;
      }
      
      if (customerData.dayOfWeek && !discount.conditions.timeRange.days.includes(currentDay)) {
        return false;
      }
    }

    // Check customer tier
    if (discount.conditions.customerTier && 
        !discount.conditions.customerTier.includes(customerData.customerTier || 'bronze')) {
      return false;
    }

    // Check order value
    if (discount.conditions.orderValue) {
      if (customerData.orderValue < discount.conditions.orderValue.min) {
        return false;
      }
      if (discount.conditions.orderValue.max && customerData.orderValue > discount.conditions.orderValue.max) {
        return false;
      }
    }

    // Check occupancy
    if (discount.conditions.occupancy) {
      if (customerData.occupancy < discount.conditions.occupancy.min) {
        return false;
      }
      if (discount.conditions.occupancy.max && customerData.occupancy > discount.conditions.occupancy.max) {
        return false;
      }
    }

    return true;
  }

  // Calculate bundle discount
  private calculateDiscount(bundle: UpsellBundle, orderItems: any[]): number {
    const applicableItems = orderItems.filter(item => 
      bundle.targetItems.includes(item.id)
    );

    if (applicableItems.length === 0) return 0;

    const totalValue = applicableItems.reduce((sum, item) => sum + item.price, 0);
    
    if (bundle.discount.type === 'percentage') {
      const discount = Math.round(totalValue * (bundle.discount.value / 100));
      return Math.min(discount, bundle.discount.maxDiscount || discount);
    } else if (bundle.discount.type === 'fixed') {
      return bundle.discount.value;
    }

    return 0;
  }

  // Calculate dynamic discount
  private calculateDynamicDiscount(discount: DynamicDiscount, orderValue: number): number {
    if (discount.discount.type === 'percentage') {
      const discountAmount = Math.round(orderValue * (discount.discount.value / 100));
      return Math.min(discountAmount, discount.discount.maxDiscount || discountAmount);
    } else if (discount.discount.type === 'fixed') {
      return discount.discount.value;
    }

    return 0;
  }

  // Update dynamic discounts based on current conditions
  private updateDynamicDiscounts() {
    // This would typically check real-time conditions like occupancy, weather, etc.
    // For now, we'll just log that the update happened
    console.log('🔄 Dynamic discounts updated based on current conditions');
  }

  // Get analytics
  getAnalytics(): {
    totalBundles: number;
    totalUses: number;
    totalRevenue: number;
    averageConversionRate: number;
    popularBundles: { bundleId: string; uses: number; revenue: number }[];
    dynamicDiscounts: { discountId: string; isActive: boolean; priority: number }[];
  } {
    const bundles = Array.from(this.bundles.values());
    const totalBundles = bundles.length;
    const totalUses = bundles.reduce((sum, b) => sum + b.analytics.totalUses, 0);
    const totalRevenue = bundles.reduce((sum, b) => sum + b.analytics.totalRevenue, 0);
    const averageConversionRate = bundles.length > 0 ? 
      bundles.reduce((sum, b) => sum + b.analytics.conversionRate, 0) / bundles.length : 0;

    const popularBundles = bundles
      .map(b => ({
        bundleId: b.id,
        uses: b.analytics.totalUses,
        revenue: b.analytics.totalRevenue
      }))
      .sort((a, b) => b.uses - a.uses);

    const dynamicDiscounts = Array.from(this.dynamicDiscounts.values())
      .map(d => ({
        discountId: d.id,
        isActive: d.isActive,
        priority: d.priority
      }));

    return {
      totalBundles,
      totalUses,
      totalRevenue,
      averageConversionRate,
      popularBundles,
      dynamicDiscounts
    };
  }
}

// Export singleton instance
export const upsellBundles = new UpsellBundles();
