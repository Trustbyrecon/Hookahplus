import { NextRequest, NextResponse } from 'next/server';

interface HitTrustApplication {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  phone?: string;
  businessType: string;
  currentSystem?: string;
  integrationNeeds?: string;
  timeline: string;
  message?: string;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected' | 'onboarded';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  notes?: string[];
}

// In-memory storage for demo (in production, use database)
const applications = new Map<string, HitTrustApplication>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      businessName,
      contactName,
      email,
      phone,
      businessType,
      currentSystem,
      integrationNeeds,
      timeline,
      message
    } = body;

    if (!businessName || !contactName || !email || !businessType || !timeline) {
      return NextResponse.json({ 
        error: 'Missing required fields: businessName, contactName, email, businessType, timeline' 
      }, { status: 400 });
    }

    const applicationId = `hittrust_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const application: HitTrustApplication = {
      id: applicationId,
      businessName,
      contactName,
      email,
      phone,
      businessType,
      currentSystem,
      integrationNeeds,
      timeline,
      message,
      status: 'pending',
      priority: timeline === 'immediate' ? 'high' : timeline === 'short' ? 'medium' : 'low',
      createdAt: now,
      updatedAt: now,
      notes: []
    };

    applications.set(applicationId, application);

    // Track application submission
    console.log(`[HitTrust] New application submitted: ${applicationId} - ${businessName}`);

    return NextResponse.json({
      success: true,
      applicationId,
      message: 'HitTrust application submitted successfully',
      application: {
        id: application.id,
        businessName: application.businessName,
        status: application.status,
        priority: application.priority
      }
    });

  } catch (error) {
    console.error('HitTrust application error:', error);
    return NextResponse.json({ 
      error: 'Failed to submit HitTrust application',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const assignedTo = searchParams.get('assignedTo');

    let filteredApplications = Array.from(applications.values());

    // Apply filters
    if (status) {
      filteredApplications = filteredApplications.filter(app => app.status === status);
    }
    if (priority) {
      filteredApplications = filteredApplications.filter(app => app.priority === priority);
    }
    if (assignedTo) {
      filteredApplications = filteredApplications.filter(app => app.assignedTo === assignedTo);
    }

    // Sort by priority and creation date
    filteredApplications.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
      
      if (aPriority !== bPriority) return bPriority - aPriority;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json({
      success: true,
      applications: filteredApplications,
      total: filteredApplications.length
    });

  } catch (error) {
    console.error('HitTrust applications fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch HitTrust applications',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { applicationId, updates, action } = body;

    if (!applicationId) {
      return NextResponse.json({ error: 'Missing applicationId' }, { status: 400 });
    }

    const application = applications.get(applicationId);
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const now = new Date().toISOString();

    switch (action) {
      case 'update_status':
        const { status, notes } = updates;
        if (!status) {
          return NextResponse.json({ error: 'Missing status' }, { status: 400 });
        }
        
        application.status = status;
        application.updatedAt = now;
        if (notes) {
          application.notes = [...(application.notes || []), {
            text: notes,
            timestamp: now,
            author: 'System'
          }];
        }
        break;

      case 'assign':
        const { assignedTo } = updates;
        if (!assignedTo) {
          return NextResponse.json({ error: 'Missing assignedTo' }, { status: 400 });
        }
        
        application.assignedTo = assignedTo;
        application.updatedAt = now;
        break;

      case 'add_note':
        const { note, author } = updates;
        if (!note) {
          return NextResponse.json({ error: 'Missing note' }, { status: 400 });
        }
        
        application.notes = [...(application.notes || []), {
          text: note,
          timestamp: now,
          author: author || 'System'
        }];
        application.updatedAt = now;
        break;

      case 'update_priority':
        const { priority } = updates;
        if (!priority) {
          return NextResponse.json({ error: 'Missing priority' }, { status: 400 });
        }
        
        application.priority = priority;
        application.updatedAt = now;
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    applications.set(applicationId, application);

    return NextResponse.json({
      success: true,
      message: 'Application updated successfully',
      application
    });

  } catch (error) {
    console.error('HitTrust application update error:', error);
    return NextResponse.json({ 
      error: 'Failed to update HitTrust application',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
