// hookahplus-v2-/lib/refill-workflow.ts
import { EventEmitter } from 'events';

export interface RefillRequest {
  id: string;
  sessionId: string;
  tableId: string;
  customerId: string;
  refillType: 'coal' | 'flavor' | 'water' | 'full_service';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  requestedAt: number;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  assignedStaff?: string;
  estimatedTime: number; // minutes
  actualTime?: number;
  notes?: string;
  cost: number; // in cents
}

export interface RefillBundle {
  id: string;
  name: string;
  description: string;
  items: RefillItem[];
  price: number; // in cents
  duration: number; // minutes
  category: 'basic' | 'premium' | 'luxury';
  upsellTarget: boolean;
}

export interface RefillItem {
  type: 'coal' | 'flavor' | 'water' | 'accessories';
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export class RefillWorkflow extends EventEmitter {
  private requests: Map<string, RefillRequest> = new Map();
  private bundles: Map<string, RefillBundle> = new Map();
  private staffAssignments: Map<string, string[]> = new Map(); // staffId -> requestIds
  private isRunning = false;

  constructor() {
    super();
    this.initializeBundles();
  }

  // Initialize refill bundles
  private initializeBundles() {
    const bundles: RefillBundle[] = [
      {
        id: 'basic_refill',
        name: 'Basic Refill',
        description: 'Fresh coal and water refill',
        items: [
          { type: 'coal', name: 'Fresh Coal', quantity: 1, unitPrice: 500, totalPrice: 500 },
          { type: 'water', name: 'Water Refill', quantity: 1, unitPrice: 0, totalPrice: 0 }
        ],
        price: 500, // $5.00
        duration: 5,
        category: 'basic',
        upsellTarget: false
      },
      {
        id: 'premium_refill',
        name: 'Premium Refill',
        description: 'Fresh coal, water, and flavor boost',
        items: [
          { type: 'coal', name: 'Premium Coal', quantity: 1, unitPrice: 500, totalPrice: 500 },
          { type: 'water', name: 'Water Refill', quantity: 1, unitPrice: 0, totalPrice: 0 },
          { type: 'flavor', name: 'Flavor Boost', quantity: 1, unitPrice: 300, totalPrice: 300 }
        ],
        price: 800, // $8.00
        duration: 8,
        category: 'premium',
        upsellTarget: true
      },
      {
        id: 'luxury_refill',
        name: 'Luxury Refill',
        description: 'Full service with premium accessories',
        items: [
          { type: 'coal', name: 'Luxury Coal', quantity: 2, unitPrice: 500, totalPrice: 1000 },
          { type: 'water', name: 'Water Refill', quantity: 1, unitPrice: 0, totalPrice: 0 },
          { type: 'flavor', name: 'Flavor Boost', quantity: 2, unitPrice: 300, totalPrice: 600 },
          { type: 'accessories', name: 'Premium Tongs', quantity: 1, unitPrice: 200, totalPrice: 200 }
        ],
        price: 1800, // $18.00
        duration: 12,
        category: 'luxury',
        upsellTarget: true
      }
    ];

    bundles.forEach(bundle => {
      this.bundles.set(bundle.id, bundle);
    });
  }

  // Start refill workflow system
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('🔄 Refill Workflow System Started');
    
    // Process requests every 30 seconds
    setInterval(() => {
      this.processRequests();
    }, 30000);
  }

  // Stop refill workflow system
  stop() {
    this.isRunning = false;
    console.log('⏹️ Refill Workflow System Stopped');
  }

  // Create refill request
  createRefillRequest(data: {
    sessionId: string;
    tableId: string;
    customerId: string;
    refillType: RefillRequest['refillType'];
    priority?: RefillRequest['priority'];
    notes?: string;
  }): RefillRequest {
    const request: RefillRequest = {
      id: `refill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId: data.sessionId,
      tableId: data.tableId,
      customerId: data.customerId,
      refillType: data.refillType,
      priority: data.priority || 'normal',
      requestedAt: Date.now(),
      status: 'pending',
      estimatedTime: this.getEstimatedTime(data.refillType),
      notes: data.notes,
      cost: this.getRefillCost(data.refillType)
    };

    this.requests.set(request.id, request);
    
    this.emit('refill_requested', {
      type: 'refill_requested',
      requestId: request.id,
      sessionId: request.sessionId,
      tableId: request.tableId,
      timestamp: Date.now(),
      data: request
    });

    console.log(`🔄 Refill request created: ${request.id} (${request.refillType}, ${request.priority})`);
    return request;
  }

  // Create refill request from bundle
  createRefillFromBundle(data: {
    sessionId: string;
    tableId: string;
    customerId: string;
    bundleId: string;
    priority?: RefillRequest['priority'];
    notes?: string;
  }): RefillRequest | null {
    const bundle = this.bundles.get(data.bundleId);
    if (!bundle) return null;

    const request: RefillRequest = {
      id: `refill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId: data.sessionId,
      tableId: data.tableId,
      customerId: data.customerId,
      refillType: 'full_service',
      priority: data.priority || 'normal',
      requestedAt: Date.now(),
      status: 'pending',
      estimatedTime: bundle.duration,
      notes: `${bundle.name}: ${data.notes || ''}`,
      cost: bundle.price
    };

    this.requests.set(request.id, request);
    
    this.emit('refill_requested', {
      type: 'refill_requested',
      requestId: request.id,
      sessionId: request.sessionId,
      tableId: request.tableId,
      timestamp: Date.now(),
      data: { ...request, bundle: bundle.name }
    });

    console.log(`🔄 Bundle refill request created: ${request.id} (${bundle.name})`);
    return request;
  }

  // Auto-assign refill request to staff
  autoAssignRequest(requestId: string, staffId: string): boolean {
    const request = this.requests.get(requestId);
    if (!request || request.status !== 'pending') return false;

    request.status = 'assigned';
    request.assignedStaff = staffId;

    // Track staff assignments
    if (!this.staffAssignments.has(staffId)) {
      this.staffAssignments.set(staffId, []);
    }
    this.staffAssignments.get(staffId)!.push(requestId);

    this.emit('refill_assigned', {
      type: 'refill_assigned',
      requestId,
      staffId,
      tableId: request.tableId,
      timestamp: Date.now(),
      data: request
    });

    console.log(`🔄 Refill request ${requestId} assigned to staff ${staffId}`);
    return true;
  }

  // Start refill work
  startRefill(requestId: string): boolean {
    const request = this.requests.get(requestId);
    if (!request || request.status !== 'assigned') return false;

    request.status = 'in_progress';
    
    this.emit('refill_started', {
      type: 'refill_started',
      requestId,
      tableId: request.tableId,
      timestamp: Date.now(),
      data: request
    });

    console.log(`🔄 Refill work started: ${requestId}`);
    return true;
  }

  // Complete refill
  completeRefill(requestId: string, actualTime?: number): boolean {
    const request = this.requests.get(requestId);
    if (!request || request.status !== 'in_progress') return false;

    request.status = 'completed';
    request.actualTime = actualTime || Math.round((Date.now() - request.requestedAt) / 60000);

    this.emit('refill_completed', {
      type: 'refill_completed',
      requestId,
      tableId: request.tableId,
      timestamp: Date.now(),
      data: request
    });

    console.log(`✅ Refill completed: ${requestId} (${request.actualTime}min, $${(request.cost/100).toFixed(2)})`);
    return true;
  }

  // Cancel refill request
  cancelRefill(requestId: string, reason?: string): boolean {
    const request = this.requests.get(requestId);
    if (!request || request.status === 'completed') return false;

    request.status = 'cancelled';
    
    this.emit('refill_cancelled', {
      type: 'refill_cancelled',
      requestId,
      tableId: request.tableId,
      timestamp: Date.now(),
      data: { ...request, reason }
    });

    console.log(`❌ Refill cancelled: ${requestId} (${reason || 'No reason provided'})`);
    return true;
  }

  // Get available bundles for upsell
  getUpsellBundles(): RefillBundle[] {
    return Array.from(this.bundles.values()).filter(bundle => bundle.upsellTarget);
  }

  // Get refill request
  getRequest(requestId: string): RefillRequest | null {
    return this.requests.get(requestId) || null;
  }

  // Get requests by status
  getRequestsByStatus(status: RefillRequest['status']): RefillRequest[] {
    return Array.from(this.requests.values()).filter(r => r.status === status);
  }

  // Get requests by table
  getRequestsByTable(tableId: string): RefillRequest[] {
    return Array.from(this.requests.values()).filter(r => r.tableId === tableId);
  }

  // Get staff workload
  getStaffWorkload(staffId: string): {
    assigned: number;
    inProgress: number;
    completed: number;
    averageTime: number;
  } {
    const staffRequests = this.staffAssignments.get(staffId) || [];
    const requests = staffRequests.map(id => this.requests.get(id)).filter(Boolean) as RefillRequest[];
    
    const assigned = requests.filter(r => r.status === 'assigned').length;
    const inProgress = requests.filter(r => r.status === 'in_progress').length;
    const completed = requests.filter(r => r.status === 'completed').length;
    const averageTime = completed > 0 ? 
      requests.filter(r => r.status === 'completed' && r.actualTime)
        .reduce((sum, r) => sum + (r.actualTime || 0), 0) / completed : 0;

    return { assigned, inProgress, completed, averageTime };
  }

  // Process pending requests
  private processRequests() {
    const pendingRequests = this.getRequestsByStatus('pending');
    
    // Sort by priority and request time
    pendingRequests.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return a.requestedAt - b.requestedAt;
    });

    // Auto-assign to available staff (simplified logic)
    pendingRequests.forEach(request => {
      // In a real system, this would check staff availability
      // For now, we'll just emit an event for manual assignment
      this.emit('refill_needs_assignment', {
        type: 'refill_needs_assignment',
        requestId: request.id,
        tableId: request.tableId,
        priority: request.priority,
        timestamp: Date.now(),
        data: request
      });
    });
  }

  // Get estimated time for refill type
  private getEstimatedTime(refillType: RefillRequest['refillType']): number {
    const times = {
      coal: 3,
      flavor: 5,
      water: 2,
      full_service: 10
    };
    return times[refillType];
  }

  // Get cost for refill type
  private getRefillCost(refillType: RefillRequest['refillType']): number {
    const costs = {
      coal: 500, // $5.00
      flavor: 300, // $3.00
      water: 0, // Free
      full_service: 1000 // $10.00
    };
    return costs[refillType];
  }

  // Get analytics
  getAnalytics(): {
    totalRequests: number;
    completedRequests: number;
    averageCompletionTime: number;
    totalRevenue: number;
    popularRefillTypes: { type: string; count: number }[];
    staffPerformance: { staffId: string; completed: number; averageTime: number }[];
  } {
    const requests = Array.from(this.requests.values());
    const completed = requests.filter(r => r.status === 'completed');
    
    const totalRequests = requests.length;
    const completedRequests = completed.length;
    const averageCompletionTime = completed.length > 0 ? 
      completed.reduce((sum, r) => sum + (r.actualTime || 0), 0) / completed.length : 0;
    const totalRevenue = requests.reduce((sum, r) => sum + r.cost, 0);

    // Popular refill types
    const typeCounts = requests.reduce((acc, r) => {
      acc[r.refillType] = (acc[r.refillType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const popularRefillTypes = Object.entries(typeCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    // Staff performance
    const staffPerformance = Array.from(this.staffAssignments.entries()).map(([staffId, requestIds]) => {
      const staffRequests = requestIds.map(id => this.requests.get(id)).filter(Boolean) as RefillRequest[];
      const completed = staffRequests.filter(r => r.status === 'completed');
      const averageTime = completed.length > 0 ? 
        completed.reduce((sum, r) => sum + (r.actualTime || 0), 0) / completed.length : 0;
      
      return { staffId, completed: completed.length, averageTime };
    });

    return {
      totalRequests,
      completedRequests,
      averageCompletionTime,
      totalRevenue,
      popularRefillTypes,
      staffPerformance
    };
  }
}

// Export singleton instance
export const refillWorkflow = new RefillWorkflow();
