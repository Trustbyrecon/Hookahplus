import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.item.deleteMany();
  await prisma.category.deleteMany();
  await prisma.orgSetting.deleteMany();

  // Create OrgSettings
  console.log('📋 Creating organization settings...');
  const orgSettings = [
    {
      key: 'posMode',
      value: 'shadow',
      description: 'POS integration mode: shadow, mirror, or ticket',
      category: 'pos'
    },
    {
      key: 'defaultSessionDuration',
      value: '60',
      description: 'Default session duration in minutes',
      category: 'timing'
    },
    {
      key: 'autoExtendThreshold',
      value: '10',
      description: 'Minutes before session end to show extend option',
      category: 'timing'
    },
    {
      key: 'enableTimerAlerts',
      value: 'true',
      description: 'Enable timer alerts for FOH staff',
      category: 'ui'
    },
    {
      key: 'maxConcurrentSessions',
      value: '20',
      description: 'Maximum concurrent sessions allowed',
      category: 'pos'
    }
  ];

  for (const setting of orgSettings) {
    await prisma.orgSetting.create({ data: setting });
  }

  // Create Categories
  console.log('📂 Creating menu categories...');
  const categories = [
    {
      name: 'Hookah Flavors',
      description: 'Premium hookah tobacco flavors',
      displayOrder: 1,
      icon: 'Hookah',
      color: '#8B5CF6'
    },
    {
      name: 'Beverages',
      description: 'Refreshing drinks and cocktails',
      displayOrder: 2,
      icon: 'Coffee',
      color: '#06B6D4'
    },
    {
      name: 'Snacks',
      description: 'Light bites and appetizers',
      displayOrder: 3,
      icon: 'Utensils',
      color: '#F59E0B'
    },
    {
      name: 'Desserts',
      description: 'Sweet treats and desserts',
      displayOrder: 4,
      icon: 'Cake',
      color: '#EC4899'
    },
    {
      name: 'Extras',
      description: 'Additional services and upgrades',
      displayOrder: 5,
      icon: 'Plus',
      color: '#10B981'
    }
  ];

  const createdCategories = [];
  for (const category of categories) {
    const created = await prisma.category.create({ data: category });
    createdCategories.push(created);
  }

  // Create Items
  console.log('🍽️ Creating menu items...');
  const items = [
    // Hookah Flavors
    {
      name: 'Double Apple',
      description: 'Classic apple flavor with a hint of anise',
      priceCents: 2500, // $25.00
      categoryId: createdCategories[0].id,
      displayOrder: 1,
      isPopular: true,
      prepTime: 5,
      allergens: ""
    },
    {
      name: 'Mint',
      description: 'Refreshing mint flavor',
      priceCents: 2500,
      categoryId: createdCategories[0].id,
      displayOrder: 2,
      isPopular: true,
      prepTime: 5,
      allergens: ""
    },
    {
      name: 'Grape',
      description: 'Sweet grape flavor',
      priceCents: 2500,
      categoryId: createdCategories[0].id,
      displayOrder: 3,
      isPopular: false,
      prepTime: 5,
      allergens: ""
    },
    {
      name: 'Strawberry',
      description: 'Sweet strawberry flavor',
      priceCents: 2500,
      categoryId: createdCategories[0].id,
      displayOrder: 4,
      isPopular: false,
      prepTime: 5,
      allergens: ""
    },
    {
      name: 'Mix & Match',
      description: 'Choose any 2 flavors to mix',
      priceCents: 3000, // $30.00
      categoryId: createdCategories[0].id,
      displayOrder: 5,
      isPopular: true,
      prepTime: 7,
      allergens: ""
    },

    // Beverages
    {
      name: 'Turkish Coffee',
      description: 'Traditional Turkish coffee',
      priceCents: 800, // $8.00
      categoryId: createdCategories[1].id,
      displayOrder: 1,
      isPopular: true,
      prepTime: 3,
      allergens: ""
    },
    {
      name: 'Mint Tea',
      description: 'Fresh mint tea',
      priceCents: 600, // $6.00
      categoryId: createdCategories[1].id,
      displayOrder: 2,
      isPopular: true,
      prepTime: 2,
      allergens: ""
    },
    {
      name: 'Fresh Juice',
      description: 'Orange, apple, or pomegranate',
      priceCents: 700, // $7.00
      categoryId: createdCategories[1].id,
      displayOrder: 3,
      isPopular: false,
      prepTime: 2,
      allergens: ""
    },
    {
      name: 'Soft Drinks',
      description: 'Coke, Sprite, Fanta',
      priceCents: 400, // $4.00
      categoryId: createdCategories[1].id,
      displayOrder: 4,
      isPopular: false,
      prepTime: 1,
      allergens: ""
    },

    // Snacks
    {
      name: 'Hummus & Pita',
      description: 'Fresh hummus with warm pita bread',
      priceCents: 1200, // $12.00
      categoryId: createdCategories[2].id,
      displayOrder: 1,
      isPopular: true,
      prepTime: 5,
      allergens: 'sesame,gluten'
    },
    {
      name: 'Falafel',
      description: 'Crispy falafel balls with tahini',
      priceCents: 1000, // $10.00
      categoryId: createdCategories[2].id,
      displayOrder: 2,
      isPopular: false,
      prepTime: 8,
      allergens: 'sesame,gluten'
    },
    {
      name: 'Mixed Nuts',
      description: 'Assorted nuts and dried fruits',
      priceCents: 800, // $8.00
      categoryId: createdCategories[2].id,
      displayOrder: 3,
      isPopular: false,
      prepTime: 1,
      allergens: 'nuts'
    },

    // Desserts
    {
      name: 'Baklava',
      description: 'Traditional Turkish baklava',
      priceCents: 900, // $9.00
      categoryId: createdCategories[3].id,
      displayOrder: 1,
      isPopular: true,
      prepTime: 2,
      allergens: 'nuts,gluten'
    },
    {
      name: 'Turkish Delight',
      description: 'Assorted Turkish delight',
      priceCents: 600, // $6.00
      categoryId: createdCategories[3].id,
      displayOrder: 2,
      isPopular: false,
      prepTime: 1,
      allergens: ""
    },

    // Extras
    {
      name: 'Session Extension',
      description: 'Add 30 minutes to your session',
      priceCents: 1500, // $15.00
      categoryId: createdCategories[4].id,
      displayOrder: 1,
      isPopular: false,
      prepTime: 0,
      allergens: ""
    },
    {
      name: 'Premium Coals',
      description: 'Upgrade to premium coconut coals',
      priceCents: 500, // $5.00
      categoryId: createdCategories[4].id,
      displayOrder: 2,
      isPopular: false,
      prepTime: 0,
      allergens: ""
    },
    {
      name: 'VIP Service',
      description: 'Dedicated server for your table',
      priceCents: 2000, // $20.00
      categoryId: createdCategories[4].id,
      displayOrder: 3,
      isPopular: false,
      prepTime: 0,
      allergens: ""
    }
  ];

  for (const item of items) {
    await prisma.item.create({ data: item });
  }

  console.log('✅ Database seed completed successfully!');
  console.log(`📊 Created ${orgSettings.length} org settings`);
  console.log(`📂 Created ${categories.length} categories`);
  console.log(`🍽️ Created ${items.length} items`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
