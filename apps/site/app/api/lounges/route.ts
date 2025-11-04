import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

interface LoungeConfig {
  lounge_name: string;
  slug: string;
  lounge_id: string;
  session_price: number;
  reflex_enabled: boolean;
  contact?: {
    owner_name: string;
    email: string;
    phone: string;
    address: string;
  };
  hours?: Record<string, string>;
  tables: TableConfig[];
  campaigns?: CampaignConfig[];
  flavors?: {
    standard: FlavorConfig[];
    premium: FlavorConfig[];
  };
  qr_settings?: {
    base_url: string;
    include_campaign: boolean;
    include_table_info: boolean;
    auto_generate: boolean;
    bulk_generation: boolean;
  };
  integrations?: {
    pos_system: string;
    payment_processor: string;
    analytics: string;
    notifications: string;
  };
}

interface TableConfig {
  id: string;
  name: string;
  type: string;
  capacity: number;
  zone: string;
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  qr_enabled: boolean;
  status: 'active' | 'inactive' | 'maintenance';
  price_multiplier: number;
  description: string;
}

interface CampaignConfig {
  id: string;
  name: string;
  active: boolean;
  qr_prefix: string;
  start_date: string;
  end_date: string;
  description: string;
}

interface FlavorConfig {
  name: string;
  price: number;
  category: string;
}

// Get the path to lounge configs
const getLoungeConfigsPath = () => {
  return path.join(process.cwd(), 'configs', 'lounges');
};

// Ensure configs directory exists
const ensureConfigsDirectory = () => {
  const configsPath = getLoungeConfigsPath();
  if (!fs.existsSync(configsPath)) {
    fs.mkdirSync(configsPath, { recursive: true });
  }
};

// Load all lounge configurations
const loadLoungeConfigs = (): LoungeConfig[] => {
  try {
    ensureConfigsDirectory();
    const configsPath = getLoungeConfigsPath();
    console.log('Looking for lounge configs in:', configsPath);
    
    const files = fs.readdirSync(configsPath);
    console.log('Found files:', files);
    
    const configs: LoungeConfig[] = [];
    
    for (const file of files) {
      if (file.endsWith('.yaml') || file.endsWith('.yml')) {
        try {
          const filePath = path.join(configsPath, file);
          const fileContent = fs.readFileSync(filePath, 'utf8');
          const config = yaml.load(fileContent) as LoungeConfig;
          
          console.log(`Loaded config from ${file}:`, {
            lounge_id: config.lounge_id,
            lounge_name: config.lounge_name,
            slug: config.slug
          });
          
          // Validate required fields
          if (config.lounge_id && config.lounge_name && config.slug) {
            configs.push(config);
            console.log(`Added config: ${config.lounge_name}`);
          } else {
            console.log(`Skipped config ${file} - missing required fields`);
          }
        } catch (error) {
          console.error(`Error loading config ${file}:`, error);
        }
      }
    }
    
    console.log(`Total configs loaded: ${configs.length}`);
    
    // If no configs found, create a default Cloud Lounge Demo
    if (configs.length === 0) {
      console.log('No configs found, creating default Cloud Lounge Demo');
      const defaultConfig: LoungeConfig = {
        lounge_id: 'CLOUD_DEMO',
        lounge_name: 'Cloud Lounge Demo',
        slug: 'cloud-lounge-demo',
        session_price: 25.00,
        reflex_enabled: true,
        contact: {
          owner_name: 'Sarah Martinez',
          email: 'sarah@cloudlounge.com',
          phone: '+1 (555) 123-4567',
          address: '123 Cloud Street, New York, NY 10001'
        },
        tables: [
          {
            id: 'table_1',
            name: 'VIP Booth 1',
            type: 'booth',
            capacity: 6,
            zone: 'VIP',
            coordinates: { x: 10, y: 15, width: 120, height: 80 },
            qr_enabled: true,
            status: 'active',
            price_multiplier: 1.5,
            description: 'Premium VIP booth with leather seating'
          },
          {
            id: 'table_2',
            name: 'VIP Booth 2',
            type: 'booth',
            capacity: 6,
            zone: 'VIP',
            coordinates: { x: 150, y: 15, width: 120, height: 80 },
            qr_enabled: true,
            status: 'active',
            price_multiplier: 1.5,
            description: 'Premium VIP booth with leather seating'
          },
          {
            id: 'table_3',
            name: 'Regular Table 1',
            type: 'table',
            capacity: 4,
            zone: 'Main Floor',
            coordinates: { x: 10, y: 120, width: 100, height: 60 },
            qr_enabled: true,
            status: 'active',
            price_multiplier: 1.0,
            description: 'Standard table in main area'
          },
          {
            id: 'table_4',
            name: 'Regular Table 2',
            type: 'table',
            capacity: 4,
            zone: 'Main Floor',
            coordinates: { x: 130, y: 120, width: 100, height: 60 },
            qr_enabled: true,
            status: 'active',
            price_multiplier: 1.0,
            description: 'Standard table in main area'
          },
          {
            id: 'table_5',
            name: 'Regular Table 3',
            type: 'table',
            capacity: 4,
            zone: 'Main Floor',
            coordinates: { x: 250, y: 120, width: 100, height: 60 },
            qr_enabled: true,
            status: 'active',
            price_multiplier: 1.0,
            description: 'Standard table in main area'
          }
        ],
        campaigns: [
          {
            id: 'welcome_2024',
            name: 'Welcome 2024',
            active: true,
            qr_prefix: 'WELCOME',
            start_date: '2024-01-01',
            end_date: '2024-12-31',
            description: 'New customer welcome campaign'
          },
          {
            id: 'vip_loyalty',
            name: 'VIP Loyalty Program',
            active: true,
            qr_prefix: 'VIP',
            start_date: '2024-01-01',
            end_date: '2024-12-31',
            description: 'Exclusive VIP member benefits'
          },
          {
            id: 'happy_hour',
            name: 'Happy Hour Special',
            active: true,
            qr_prefix: 'HAPPY',
            start_date: '2024-01-01',
            end_date: '2024-12-31',
            description: 'Weekday happy hour pricing'
          }
        ],
        qr_settings: {
          base_url: 'https://guest.hookahplus.net',
          include_campaign: true,
          include_table_info: true,
          auto_generate: true,
          bulk_generation: true
        }
      };
      
      configs.push(defaultConfig);
      console.log('Added default Cloud Lounge Demo config');
    }
    
    return configs;
  } catch (error) {
    console.error('Error loading lounge configs:', error);
    return [];
  }
};

// Load specific lounge configuration
const loadLoungeConfig = (loungeId: string): LoungeConfig | null => {
  try {
    const configs = loadLoungeConfigs();
    return configs.find(config => config.lounge_id === loungeId) || null;
  } catch (error) {
    console.error(`Error loading lounge config ${loungeId}:`, error);
    return null;
  }
};

// Save lounge configuration
const saveLoungeConfig = (config: LoungeConfig): boolean => {
  try {
    ensureConfigsDirectory();
    const configsPath = getLoungeConfigsPath();
    const filePath = path.join(configsPath, `${config.slug}.yaml`);
    
    const yamlContent = yaml.dump(config, {
      indent: 2,
      lineWidth: 120,
      noRefs: true,
      sortKeys: false
    });
    
    fs.writeFileSync(filePath, yamlContent, 'utf8');
    return true;
  } catch (error) {
    console.error(`Error saving lounge config ${config.lounge_id}:`, error);
    return false;
  }
};

// GET /api/lounges - List all lounges
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeTables = searchParams.get('includeTables') === 'true';
    const includeCampaigns = searchParams.get('includeCampaigns') === 'true';
    
    const configs = loadLoungeConfigs();
    
    // Filter data based on query parameters
    const filteredConfigs = configs.map(config => {
      const filtered: any = {
        lounge_id: config.lounge_id,
        lounge_name: config.lounge_name,
        slug: config.slug,
        session_price: config.session_price,
        reflex_enabled: config.reflex_enabled,
        contact: config.contact,
        hours: config.hours
      };
      
      if (includeTables) {
        filtered.tables = config.tables;
      }
      
      if (includeCampaigns) {
        filtered.campaigns = config.campaigns;
      }
      
      return filtered;
    });
    
    return NextResponse.json({
      success: true,
      lounges: filteredConfigs,
      total: filteredConfigs.length
    });
    
  } catch (error) {
    console.error('Error fetching lounges:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch lounges',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST /api/lounges - Create new lounge or save layout
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, lounge_name, session_price, seat_count, sections, slug, tables } = body;

    // Handle save_layout action
    if (action === 'save_layout' && tables) {
      try {
        // Load or create default lounge config
        const defaultLoungeId = 'CLOUD_DEMO';
        let config = loadLoungeConfig(defaultLoungeId);
        
        if (!config) {
          // Create new config if it doesn't exist
          config = {
            lounge_id: defaultLoungeId,
            lounge_name: 'Cloud Lounge Demo',
            slug: 'cloud-lounge-demo',
            session_price: 25.00,
            reflex_enabled: true,
            tables: [],
            campaigns: [],
            qr_settings: {
              base_url: process.env.NEXT_PUBLIC_GUEST_URL || 'https://guest.hookahplus.net',
              include_campaign: true,
              include_table_info: true,
              auto_generate: true,
              bulk_generation: true
            }
          };
        }

        // Update tables with layout data
        config.tables = tables.map((table: any) => ({
          id: table.id,
          name: table.name,
          type: table.seatingType?.toLowerCase() || 'table',
          capacity: table.capacity || 4,
          zone: 'main_floor',
          coordinates: {
            x: table.x || 0,
            y: table.y || 0,
            width: 80,
            height: 80
          },
          qr_enabled: true,
          status: 'active' as const,
          price_multiplier: 1.0,
          description: `${table.seatingType || 'Table'} seating`
        }));

        const saved = saveLoungeConfig(config);
        
        if (saved) {
          return NextResponse.json({
            success: true,
            message: 'Lounge layout saved successfully',
            tables: config.tables.length
          });
        } else {
          throw new Error('Failed to save layout');
        }
      } catch (error) {
        console.error('Error saving layout:', error);
        return NextResponse.json({ 
          error: 'Failed to save layout',
          details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
      }
    }

    // Original POST logic for creating lounges
    if (!lounge_name) {
      return NextResponse.json({ 
        error: 'Missing required field: lounge_name' 
      }, { status: 400 });
    }
    
    // Generate lounge_id and slug if not provided
    const lounge_id = body.lounge_id || `lounge_${Date.now()}`;
    const lounge_slug = slug || lounge_name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    // Create basic configuration
    const config: LoungeConfig = {
      lounge_name,
      slug: lounge_slug,
      lounge_id,
      session_price: session_price || 30,
      reflex_enabled: true,
      tables: [],
      campaigns: [],
      qr_settings: {
        base_url: process.env.NEXT_PUBLIC_GUEST_URL || 'https://guest.hookahplus.net',
        include_campaign: true,
        include_table_info: true,
        auto_generate: true,
        bulk_generation: true
      }
    };
    
    // Add default tables if seat_count is provided
    if (seat_count && seat_count > 0) {
      const tablesPerSection = Math.ceil(seat_count / (sections?.length || 1));
      const sections_list = sections || ['Main Floor'];
      
      sections_list.forEach((section: string, sectionIndex: number) => {
        for (let i = 0; i < tablesPerSection; i++) {
          const tableId = `T-${String(sectionIndex + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`;
          config.tables.push({
            id: tableId,
            name: `${section} Table ${i + 1}`,
            type: 'table',
            capacity: 4,
            zone: section.toLowerCase().replace(/[^a-z0-9]/g, '_'),
            coordinates: {
              x: 100 + (i * 100),
              y: 200 + (sectionIndex * 150),
              width: 80,
              height: 80
            },
            qr_enabled: true,
            status: 'active',
            price_multiplier: 1.0,
            description: `Standard table in ${section}`
          });
        }
      });
    }
    
    const saved = saveLoungeConfig(config);
    
    if (saved) {
      console.log(`[Lounge Registry] New lounge created: ${lounge_id} - ${lounge_name}`);
      
      return NextResponse.json({
        success: true,
        lounge: {
          lounge_id: config.lounge_id,
          lounge_name: config.lounge_name,
          slug: config.slug,
          table_count: config.tables.length
        },
        message: 'Lounge created successfully'
      });
    } else {
      throw new Error('Failed to save lounge configuration');
    }
    
  } catch (error) {
    console.error('Error creating lounge:', error);
    return NextResponse.json({ 
      error: 'Failed to create lounge',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT /api/lounges - Update lounge configuration or save layout
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, lounge_id, updates, tables } = body;

    // Handle save_layout action
    if (action === 'save_layout' && tables) {
      try {
        // Load or create default lounge config
        const defaultLoungeId = 'CLOUD_DEMO';
        let config = loadLoungeConfig(defaultLoungeId);
        
        if (!config) {
          // Create new config if it doesn't exist
          config = {
            lounge_id: defaultLoungeId,
            lounge_name: 'Cloud Lounge Demo',
            slug: 'cloud-lounge-demo',
            session_price: 25.00,
            reflex_enabled: true,
            tables: [],
            campaigns: [],
            qr_settings: {
              base_url: process.env.NEXT_PUBLIC_GUEST_URL || 'https://guest.hookahplus.net',
              include_campaign: true,
              include_table_info: true,
              auto_generate: true,
              bulk_generation: true
            }
          };
        }

        // Update tables with layout data
        config.tables = tables.map((table: any) => ({
          id: table.id,
          name: table.name,
          type: table.seatingType?.toLowerCase() || 'table',
          capacity: table.capacity || 4,
          zone: 'main_floor',
          coordinates: {
            x: table.x || 0,
            y: table.y || 0,
            width: 80,
            height: 80
          },
          qr_enabled: true,
          status: 'active' as const,
          price_multiplier: 1.0,
          description: `${table.seatingType || 'Table'} seating`
        }));

        const saved = saveLoungeConfig(config);
        
        if (saved) {
          return NextResponse.json({
            success: true,
            message: 'Lounge layout saved successfully',
            tables: config.tables.length
          });
        } else {
          throw new Error('Failed to save layout');
        }
      } catch (error) {
        console.error('Error saving layout:', error);
        return NextResponse.json({ 
          error: 'Failed to save layout',
          details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
      }
    }

    // Original PUT logic for updates
    if (!lounge_id) {
      return NextResponse.json({ error: 'Missing lounge_id' }, { status: 400 });
    }
    
    const existingConfig = loadLoungeConfig(lounge_id);
    if (!existingConfig) {
      return NextResponse.json({ error: 'Lounge not found' }, { status: 404 });
    }
    
    // Merge updates with existing config
    const updatedConfig = { ...existingConfig, ...updates };
    
    const saved = saveLoungeConfig(updatedConfig);
    
    if (saved) {
      return NextResponse.json({
        success: true,
        message: 'Lounge updated successfully',
        lounge: {
          lounge_id: updatedConfig.lounge_id,
          lounge_name: updatedConfig.lounge_name,
          slug: updatedConfig.slug
        }
      });
    } else {
      throw new Error('Failed to save updated lounge configuration');
    }
    
  } catch (error) {
    console.error('Error updating lounge:', error);
    return NextResponse.json({ 
      error: 'Failed to update lounge',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
