import { NextResponse } from "next/server";

// Type definitions to match the frontend interface
interface ConnectorProfile {
  id: string;
  name: string;
  city: string;
  status: 'pending' | 'approved' | 'active';
  loungesIdentified: number;
  loungesSignedUp: number;
  revenueEarned: number;
  specialties: string[];
  socialMedia: string[];
  applicationDate: number;
  approvalDate?: number;
  notes: string;
}

interface LoungeOpportunity {
  id: string;
  name: string;
  city: string;
  connectorId: string;
  status: 'identified' | 'contacted' | 'interested' | 'signed_up';
  estimatedRevenue: number;
  contactInfo: string;
  notes: string;
}

// Mock data for connectors and opportunities
let connectors: ConnectorProfile[] = [
  {
    id: 'conn_001',
    name: 'Alex Johnson',
    city: 'Los Angeles',
    status: 'active',
    loungesIdentified: 8,
    loungesSignedUp: 5,
    revenueEarned: 1250,
    specialties: ['Community Leadership', 'Hookah Culture'],
    socialMedia: ['@alex_hookah', 'TikTok: 50K followers'],
    applicationDate: Date.now() - 30 * 24 * 60 * 60 * 1000,
    approvalDate: Date.now() - 25 * 24 * 60 * 60 * 1000,
    notes: 'Strong community presence in LA hookah scene'
  },
  {
    id: 'conn_002',
    name: 'Sarah Chen',
    city: 'New York',
    status: 'approved',
    loungesIdentified: 6,
    loungesSignedUp: 0,
    revenueEarned: 0,
    specialties: ['Influencer Marketing', 'Diaspora Communities'],
    socialMedia: ['@sarah_chen', 'Instagram: 25K followers'],
    applicationDate: Date.now() - 15 * 24 * 60 * 60 * 1000,
    approvalDate: Date.now() - 10 * 24 * 60 * 60 * 1000,
    notes: 'Recently approved, starting outreach'
  }
];

let opportunities: LoungeOpportunity[] = [
  {
    id: 'opp_001',
    name: 'Oasis Hookah Lounge',
    city: 'Los Angeles',
    connectorId: 'conn_001',
    status: 'signed_up',
    estimatedRevenue: 5000,
    contactInfo: 'owner@oasislounge.com',
    notes: 'High-end lounge, premium clientele'
  },
  {
    id: 'opp_002',
    name: 'Cloud Nine Hookah',
    city: 'Los Angeles',
    connectorId: 'conn_001',
    status: 'interested',
    estimatedRevenue: 3500,
    contactInfo: 'manager@cloudnine.com',
    notes: 'Student-focused, good location'
  }
];

export async function GET() {
  try {
    const totalRevenue = connectors.reduce((sum, c) => sum + c.revenueEarned, 0);
    const totalLounges = opportunities.filter(o => o.status === 'signed_up').length;
    const activeConnectors = connectors.filter(c => c.status === 'active').length;

    return NextResponse.json({
      success: true,
      data: {
        connectors,
        opportunities,
        metrics: {
          totalRevenue,
          totalLounges,
          activeConnectors,
          totalConnectors: connectors.length
        }
      }
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, data } = body;

    if (!data) {
      return NextResponse.json({
        success: false,
        message: 'Missing data'
      }, { status: 400 });
    }

    switch (action) {
                   case 'add_connector':
        if (!data.name || !data.city) {
          return NextResponse.json({
            success: false,
            message: 'Name and city are required'
          }, { status: 400 });
        }
        
        const newConnector: ConnectorProfile = {
          id: `conn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          name: data.name,
          city: data.city,
          status: 'pending',
          loungesIdentified: 0,
          loungesSignedUp: 0,
          revenueEarned: 0,
          specialties: data.specialties || [],
          socialMedia: data.socialMedia || [],
          applicationDate: Date.now(),
          approvalDate: undefined, // Will be set when approved
          notes: data.notes || ''
        };
        connectors.push(newConnector);
        return NextResponse.json({
          success: true,
          message: 'Connector added successfully',
          connector: newConnector
        });

      case 'add_opportunity':
        if (!data.name || !data.city || !data.connectorId) {
          return NextResponse.json({
            success: false,
            message: 'Name, city, and connector ID are required'
          }, { status: 400 });
        }
        
        const newOpportunity: LoungeOpportunity = {
          id: `opp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          name: data.name,
          city: data.city,
          connectorId: data.connectorId,
          status: 'identified',
          estimatedRevenue: data.estimatedRevenue || 0,
          contactInfo: data.contactInfo || '',
          notes: data.notes || ''
        };
        opportunities.push(newOpportunity);
        return NextResponse.json({
          success: true,
          message: 'Opportunity added successfully',
          opportunity: newOpportunity
        });

      case 'update_connector_status':
        const connector = connectors.find(c => c.id === data.connectorId);
        if (connector) {
          connector.status = data.status;
          if (data.status === 'approved' && !connector.approvalDate) {
            connector.approvalDate = Date.now();
          }
          return NextResponse.json({
            success: true,
            message: 'Connector status updated',
            connector
          });
        }
        return NextResponse.json({
          success: false,
          message: 'Connector not found'
        }, { status: 404 });

      case 'update_opportunity_status':
        const opportunity = opportunities.find(o => o.id === data.opportunityId);
        if (opportunity) {
          opportunity.status = data.status;
          if (data.status === 'signed_up') {
            // Update connector metrics
            const connector = connectors.find(c => c.id === opportunity.connectorId);
            if (connector) {
              connector.loungesSignedUp += 1;
              connector.revenueEarned += opportunity.estimatedRevenue * 0.05; // 5% revenue share
            }
          }
          return NextResponse.json({
            success: true,
            message: 'Opportunity status updated',
            opportunity
          });
        }
        return NextResponse.json({
          success: false,
          message: 'Opportunity not found'
        }, { status: 404 });

      default:
        return NextResponse.json({
          success: false,
          message: 'Invalid action'
        }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
