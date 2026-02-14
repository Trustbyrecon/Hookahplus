import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

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

interface LoungeConfig {
  lounge_name: string;
  slug: string;
  lounge_id: string;
  session_price: number;
  reflex_enabled: boolean;
  tables: TableConfig[];
  qr_settings?: {
    base_url: string;
    include_campaign: boolean;
    include_table_info: boolean;
    auto_generate: boolean;
    bulk_generation: boolean;
  };
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

// GET /api/lounges/[loungeId]/tables - Get lounge tables
export async function GET(
  req: NextRequest,
  { params }: { params: { loungeId: string } }
) {
  try {
    const { loungeId } = params;
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const qrEnabled = searchParams.get('qrEnabled');
    const zone = searchParams.get('zone');
    
    const config = loadLoungeConfig(loungeId);
    
    if (!config) {
      return NextResponse.json({ error: 'Lounge not found' }, { status: 404 });
    }
    
    let tables = config.tables || [];
    
    // Apply filters
    if (status) {
      tables = tables.filter(table => table.status === status);
    }
    
    if (qrEnabled === 'true') {
      tables = tables.filter(table => table.qr_enabled === true);
    }
    
    if (zone) {
      tables = tables.filter(table => table.zone === zone);
    }
    
    // Sort by table ID
    tables.sort((a, b) => a.id.localeCompare(b.id));
    
    return NextResponse.json({
      success: true,
      tables,
      total: tables.length,
      lounge: {
        lounge_id: config.lounge_id,
        lounge_name: config.lounge_name
      }
    });
    
  } catch (error) {
    console.error(`Error fetching tables for lounge ${params.loungeId}:`, error);
    return NextResponse.json({ 
      error: 'Failed to fetch tables',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST /api/lounges/[loungeId]/tables - Add new table
export async function POST(
  req: NextRequest,
  { params }: { params: { loungeId: string } }
) {
  try {
    const { loungeId } = params;
    const body = await req.json();
    const { table } = body;
    
    if (!table) {
      return NextResponse.json({ error: 'Missing table data' }, { status: 400 });
    }
    
    const config = loadLoungeConfig(loungeId);
    if (!config) {
      return NextResponse.json({ error: 'Lounge not found' }, { status: 404 });
    }
    
    // Validate required fields
    if (!table.id || !table.name || !table.type) {
      return NextResponse.json({ 
        error: 'Missing required fields: id, name, type' 
      }, { status: 400 });
    }
    
    // Check if table ID already exists
    const existingTable = config.tables.find(t => t.id === table.id);
    if (existingTable) {
      return NextResponse.json({ 
        error: 'Table ID already exists' 
      }, { status: 409 });
    }
    
    // Create new table with defaults
    const newTable: TableConfig = {
      id: table.id,
      name: table.name,
      type: table.type,
      capacity: table.capacity || 4,
      zone: table.zone || 'main_floor',
      coordinates: table.coordinates || {
        x: 100,
        y: 200,
        width: 80,
        height: 80
      },
      qr_enabled: table.qr_enabled !== false,
      status: table.status || 'active',
      price_multiplier: table.price_multiplier || 1.0,
      description: table.description || `Table ${table.name}`
    };
    
    // Add table to config
    config.tables.push(newTable);
    
    const saved = saveLoungeConfig(config);
    
    if (saved) {
      console.log(`[Lounge Registry] Table added: ${loungeId} - ${table.id}`);
      
      return NextResponse.json({
        success: true,
        table: newTable,
        message: 'Table added successfully'
      });
    } else {
      throw new Error('Failed to save updated lounge configuration');
    }
    
  } catch (error) {
    console.error(`Error adding table to lounge ${params.loungeId}:`, error);
    return NextResponse.json({ 
      error: 'Failed to add table',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT /api/lounges/[loungeId]/tables - Update table
export async function PUT(
  req: NextRequest,
  { params }: { params: { loungeId: string } }
) {
  try {
    const { loungeId } = params;
    const body = await req.json();
    const { tableId, updates } = body;
    
    if (!tableId) {
      return NextResponse.json({ error: 'Missing tableId' }, { status: 400 });
    }
    
    const config = loadLoungeConfig(loungeId);
    if (!config) {
      return NextResponse.json({ error: 'Lounge not found' }, { status: 404 });
    }
    
    const tableIndex = config.tables.findIndex(t => t.id === tableId);
    if (tableIndex === -1) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }
    
    // Update table
    config.tables[tableIndex] = { ...config.tables[tableIndex], ...updates };
    
    const saved = saveLoungeConfig(config);
    
    if (saved) {
      console.log(`[Lounge Registry] Table updated: ${loungeId} - ${tableId}`);
      
      return NextResponse.json({
        success: true,
        table: config.tables[tableIndex],
        message: 'Table updated successfully'
      });
    } else {
      throw new Error('Failed to save updated lounge configuration');
    }
    
  } catch (error) {
    console.error(`Error updating table in lounge ${params.loungeId}:`, error);
    return NextResponse.json({ 
      error: 'Failed to update table',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE /api/lounges/[loungeId]/tables - Delete table
export async function DELETE(
  req: NextRequest,
  { params }: { params: { loungeId: string } }
) {
  try {
    const { loungeId } = params;
    const { searchParams } = new URL(req.url);
    const tableId = searchParams.get('tableId');
    
    if (!tableId) {
      return NextResponse.json({ error: 'Missing tableId' }, { status: 400 });
    }
    
    const config = loadLoungeConfig(loungeId);
    if (!config) {
      return NextResponse.json({ error: 'Lounge not found' }, { status: 404 });
    }
    
    const tableIndex = config.tables.findIndex(t => t.id === tableId);
    if (tableIndex === -1) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }
    
    // Remove table
    const removedTable = config.tables.splice(tableIndex, 1)[0];
    
    const saved = saveLoungeConfig(config);
    
    if (saved) {
      console.log(`[Lounge Registry] Table deleted: ${loungeId} - ${tableId}`);
      
      return NextResponse.json({
        success: true,
        table: removedTable,
        message: 'Table deleted successfully'
      });
    } else {
      throw new Error('Failed to save updated lounge configuration');
    }
    
  } catch (error) {
    console.error(`Error deleting table from lounge ${params.loungeId}:`, error);
    return NextResponse.json({ 
      error: 'Failed to delete table',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
