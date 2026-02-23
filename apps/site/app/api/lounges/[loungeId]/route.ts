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

// Load specific lounge configuration
const loadLoungeConfig = (loungeId: string): LoungeConfig | null => {
  try {
    const configsPath = path.join(process.cwd(), 'configs', 'lounges');
    
    if (!fs.existsSync(configsPath)) {
      return null;
    }
    
    const files = fs.readdirSync(configsPath);
    
    for (const file of files) {
      if (file.endsWith('.yaml') || file.endsWith('.yml')) {
        try {
          const filePath = path.join(configsPath, file);
          const fileContent = fs.readFileSync(filePath, 'utf8');
          const config = yaml.load(fileContent) as LoungeConfig;
          
          if (config.lounge_id === loungeId) {
            return config;
          }
        } catch (error) {
          console.error(`Error loading config ${file}:`, error);
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Error loading lounge config ${loungeId}:`, error);
    return null;
  }
};

// Save lounge configuration
const saveLoungeConfig = (config: LoungeConfig): boolean => {
  try {
    const configsPath = path.join(process.cwd(), 'configs', 'lounges');
    
    if (!fs.existsSync(configsPath)) {
      fs.mkdirSync(configsPath, { recursive: true });
    }
    
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

// GET /api/lounges/[loungeId] - Get specific lounge
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ loungeId: string }> }
) {
  try {
    const { loungeId } = await params;
    const { searchParams } = new URL(req.url);
    const includeTables = searchParams.get('includeTables') !== 'false';
    const includeCampaigns = searchParams.get('includeCampaigns') !== 'false';
    const includeFlavors = searchParams.get('includeFlavors') !== 'false';
    
    const config = loadLoungeConfig(loungeId);
    
    if (!config) {
      return NextResponse.json({ error: 'Lounge not found' }, { status: 404 });
    }
    
    // Filter data based on query parameters
    const filteredConfig: any = {
      lounge_id: config.lounge_id,
      lounge_name: config.lounge_name,
      slug: config.slug,
      session_price: config.session_price,
      reflex_enabled: config.reflex_enabled,
      contact: config.contact,
      hours: config.hours,
      qr_settings: config.qr_settings
    };
    
    if (includeTables) {
      filteredConfig.tables = config.tables;
    }
    
    if (includeCampaigns) {
      filteredConfig.campaigns = config.campaigns;
    }
    
    if (includeFlavors) {
      filteredConfig.flavors = config.flavors;
    }
    
    return NextResponse.json({
      success: true,
      lounge: filteredConfig
    });
    
  } catch (error) {
    console.error(`Error fetching lounge:`, error);
    return NextResponse.json({ 
      error: 'Failed to fetch lounge',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT /api/lounges/[loungeId] - Update specific lounge
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ loungeId: string }> }
) {
  try {
    const { loungeId } = await params;
    const body = await req.json();
    const { updates } = body;
    
    const existingConfig = loadLoungeConfig(loungeId);
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
    console.error(`Error updating lounge:`, error);
    return NextResponse.json({ 
      error: 'Failed to update lounge',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE /api/lounges/[loungeId] - Delete specific lounge
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ loungeId: string }> }
) {
  try {
    const { loungeId } = await params;
    
    const config = loadLoungeConfig(loungeId);
    if (!config) {
      return NextResponse.json({ error: 'Lounge not found' }, { status: 404 });
    }
    
    const configsPath = path.join(process.cwd(), 'configs', 'lounges');
    const filePath = path.join(configsPath, `${config.slug}.yaml`);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    console.log(`[Lounge Registry] Lounge deleted: ${loungeId} - ${config.lounge_name}`);
    
    return NextResponse.json({
      success: true,
      message: 'Lounge deleted successfully'
    });
    
  } catch (error) {
    console.error(`Error deleting lounge:`, error);
    return NextResponse.json({ 
      error: 'Failed to delete lounge',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
