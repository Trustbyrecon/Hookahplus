// Campaign Pre-Orders Mock Data for Hookah+ Site Build
export const campaignPreOrdersData = {
  // Active Campaigns
  activeCampaigns: [
    {
      id: 'campaign_001',
      name: 'Winter Wonderland Collection',
      description: 'Exclusive winter flavors with premium accessories',
      status: 'ACTIVE',
      startDate: '2025-10-15',
      endDate: '2025-12-31',
      discount: 20, // percentage
      minOrder: 50, // minimum order amount in cents
      maxOrders: 100,
      currentOrders: 47,
      revenue: 23500, // in cents
      flavors: [
        {
          id: 'winter_mint',
          name: 'Winter Mint Delight',
          description: 'Cool mint with winter spices',
          price: 2500, // in cents
          preOrderPrice: 2000, // discounted price
          image: '/images/winter-mint.jpg',
          popularity: 85
        },
        {
          id: 'cinnamon_apple',
          name: 'Cinnamon Apple Cider',
          description: 'Warm apple with cinnamon spice',
          price: 2800,
          preOrderPrice: 2240,
          image: '/images/cinnamon-apple.jpg',
          popularity: 92
        },
        {
          id: 'vanilla_snow',
          name: 'Vanilla Snow',
          description: 'Creamy vanilla with winter notes',
          price: 2200,
          preOrderPrice: 1760,
          image: '/images/vanilla-snow.jpg',
          popularity: 78
        }
      ],
      accessories: [
        {
          id: 'winter_coal',
          name: 'Winter Coal Set',
          description: 'Premium coal for winter sessions',
          price: 1500,
          preOrderPrice: 1200,
          image: '/images/winter-coal.jpg'
        },
        {
          id: 'snow_globe',
          name: 'Snow Globe Hookah',
          description: 'Limited edition winter hookah',
          price: 15000,
          preOrderPrice: 12000,
          image: '/images/snow-globe-hookah.jpg'
        }
      ]
    },
    {
      id: 'campaign_002',
      name: 'New Year Celebration Pack',
      description: 'Ring in the new year with exclusive flavors',
      status: 'ACTIVE',
      startDate: '2025-12-01',
      endDate: '2026-01-15',
      discount: 15,
      minOrder: 75,
      maxOrders: 50,
      currentOrders: 23,
      revenue: 17250,
      flavors: [
        {
          id: 'champagne_rose',
          name: 'Champagne Rose',
          description: 'Elegant rose with champagne notes',
          price: 3200,
          preOrderPrice: 2720,
          image: '/images/champagne-rose.jpg',
          popularity: 88
        },
        {
          id: 'golden_hour',
          name: 'Golden Hour',
          description: 'Citrus blend with golden undertones',
          price: 2900,
          preOrderPrice: 2465,
          image: '/images/golden-hour.jpg',
          popularity: 91
        }
      ],
      accessories: [
        {
          id: 'gold_coal',
          name: 'Golden Coal Premium',
          description: 'Luxury coal for special occasions',
          price: 2000,
          preOrderPrice: 1700,
          image: '/images/gold-coal.jpg'
        }
      ]
    }
  ],

  // Completed Campaigns
  completedCampaigns: [
    {
      id: 'campaign_003',
      name: 'Summer Breeze Collection',
      description: 'Refreshing summer flavors',
      status: 'COMPLETED',
      startDate: '2025-06-01',
      endDate: '2025-08-31',
      discount: 25,
      totalOrders: 89,
      totalRevenue: 44500,
      flavors: ['Tropical Paradise', 'Ocean Breeze', 'Sunset Citrus']
    }
  ],

  // Upcoming Campaigns
  upcomingCampaigns: [
    {
      id: 'campaign_004',
      name: 'Valentine\'s Day Special',
      description: 'Romantic flavors for couples',
      status: 'UPCOMING',
      startDate: '2026-01-20',
      endDate: '2026-02-14',
      discount: 30,
      flavors: ['Rose Petals', 'Chocolate Mint', 'Strawberry Kiss']
    }
  ],

  // Customer Pre-Orders
  customerPreOrders: [
    {
      id: 'preorder_001',
      customerId: 'cust_001',
      customerName: 'Sarah Johnson',
      customerEmail: 'sarah.j@email.com',
      campaignId: 'campaign_001',
      items: [
        { flavorId: 'winter_mint', quantity: 2 },
        { flavorId: 'cinnamon_apple', quantity: 1 },
        { accessoryId: 'winter_coal', quantity: 1 }
      ],
      totalAmount: 7200, // in cents
      status: 'CONFIRMED',
      orderDate: '2025-10-16T10:30:00Z',
      estimatedDelivery: '2025-12-01',
      paymentStatus: 'PAID'
    },
    {
      id: 'preorder_002',
      customerId: 'cust_002',
      customerName: 'Mike Chen',
      customerEmail: 'mike.chen@email.com',
      campaignId: 'campaign_001',
      items: [
        { flavorId: 'vanilla_snow', quantity: 3 },
        { accessoryId: 'snow_globe', quantity: 1 }
      ],
      totalAmount: 17280, // in cents
      status: 'PENDING',
      orderDate: '2025-10-16T14:15:00Z',
      estimatedDelivery: '2025-12-01',
      paymentStatus: 'PENDING'
    }
  ],

  // Analytics
  analytics: {
    totalCampaigns: 4,
    activeCampaigns: 2,
    totalPreOrders: 70,
    totalRevenue: 40750, // in cents
    averageOrderValue: 582, // in cents
    conversionRate: 23.5, // percentage
    topFlavor: 'Cinnamon Apple Cider',
    topAccessory: 'Winter Coal Set'
  }
};

// Helper functions
export const getActiveCampaigns = () => campaignPreOrdersData.activeCampaigns;
export const getCompletedCampaigns = () => campaignPreOrdersData.completedCampaigns;
export const getUpcomingCampaigns = () => campaignPreOrdersData.upcomingCampaigns;
export const getCustomerPreOrders = () => campaignPreOrdersData.customerPreOrders;
export const getCampaignById = (id: string) => {
  return campaignPreOrdersData.activeCampaigns.find(c => c.id === id) ||
         campaignPreOrdersData.completedCampaigns.find(c => c.id === id) ||
         campaignPreOrdersData.upcomingCampaigns.find(c => c.id === id);
};

export const formatCurrency = (cents: number): string => {
  return `$${(cents / 100).toFixed(2)}`;
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const getCampaignStatusColor = (status: string): string => {
  switch (status) {
    case 'ACTIVE': return 'text-green-400';
    case 'COMPLETED': return 'text-blue-400';
    case 'UPCOMING': return 'text-orange-400';
    case 'CANCELLED': return 'text-red-400';
    default: return 'text-gray-400';
  }
};

export const getOrderStatusColor = (status: string): string => {
  switch (status) {
    case 'CONFIRMED': return 'text-green-400';
    case 'PENDING': return 'text-yellow-400';
    case 'CANCELLED': return 'text-red-400';
    case 'SHIPPED': return 'text-blue-400';
    default: return 'text-gray-400';
  }
};
