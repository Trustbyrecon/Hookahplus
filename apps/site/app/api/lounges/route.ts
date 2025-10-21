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
    const files = fs.readdirSync(configsPath);
    
    const configs: LoungeConfig[] = [];
    
    for (const file of files) {
      if (file.endsWith('.yaml') || file.endsWith('.yml')) {
        try {
          const filePath = path.join(configsPath, file);
          const fileContent = fs.readFileSync(filePath, 'utf8');
          const config = yaml.load(fileContent) as LoungeConfig;
          
          // Validate required fields
          if (config.lounge_id && config.lounge_name && config.slug) {
            configs.push(config);
          }
        } catch (error) {
          console.error(`Error loading config ${file}:`, error);
        }
      }
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

// POST /api/lounges - Create new lounge
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lounge_name, session_price, seat_count, sections, slug } = body;
    
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

// PUT /api/lounges - Update lounge configuration
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { lounge_id, updates } = body;
    
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
