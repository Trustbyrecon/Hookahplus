// lib/customer-journey.ts
// Real-time customer journey tracking that links layout preview to fire sessions

export interface CustomerBooking {
  id: string;
  reservationId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  partySize: number;
  tableId: string;
  tableType: string;
  zone: string;
  position: { x: number; y: number };
  flavorMix: string;
  basePrice: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'active' | 'completed' | 'cancelled';
  currentStage: 'booking' | 'payment' | 'prep' | 'delivery' | 'service' | 'completion';
  createdAt: Date;
  updatedAt: Date;
  // Stripe integration
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  // BOH operations
  prepStaffId?: string;
  deliveryStaffId?: string;
  serviceStaffId?: string;
  estimatedPrepTime: number; // minutes
  estimatedSessionTime: number; // minutes
  actualPrepTime?: number;
  actualSessionTime?: number;
  // Customer preferences
  customerPreferences?: {
    favoriteFlavors?: string[];
    sessionDuration?: number;
    addOnPreferences?: string[];
    notes?: string;
    vipStatus?: boolean;
  };
  // Real-time tracking
  qrCode: string;
  checkInTime?: Date;
  sessionStartTime?: Date;
  sessionEndTime?: Date;
  // Metadata
  metadata: {
    source: 'layout_preview' | 'mobile_app' | 'staff_entry' | 'walk_in';
    ipAddress?: string;
    userAgent?: string;
    referrer?: string;
    campaignId?: string;
  };
}

export interface BOHOperation {
  id: string;
  bookingId: string;
  operationType: 'prep_start' | 'prep_complete' | 'delivery_start' | 'delivery_complete' | 'service_start' | 'service_end' | 'refill_request' | 'coal_swap' | 'session_pause' | 'session_resume';
  staffId: string;
  staffName: string;
  timestamp: Date;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface CustomerJourneyState {
  bookings: Map<string, CustomerBooking>;
  bohOperations: Map<string, BOHOperation[]>;
  activeSessions: Set<string>;
  staffAssignments: Map<string, string[]>; // staffId -> bookingIds[]
}

class CustomerJourneyManager {
  private state: CustomerJourneyState = {
    bookings: new Map(),
    bohOperations: new Map(),
    activeSessions: new Set(),
    staffAssignments: new Map()
  };

  private listeners: Set<(state: CustomerJourneyState) => void> = new Set();

  // Subscribe to real-time updates
  subscribe(listener: (state: CustomerJourneyState) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }

  // Create booking from layout preview
  createBookingFromLayoutPreview(data: {
    reservationId: string;
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    partySize: number;
    tableId: string;
    tableType: string;
    zone: string;
    position: { x: number; y: number };
    flavorMix: string;
    basePrice: number;
    totalPrice: number;
    status?: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'active' | 'completed' | 'cancelled';
    currentStage?: 'booking' | 'payment' | 'prep' | 'delivery' | 'service' | 'completion';
    seatNumber?: string;
    sequence?: number;
    metadata: {
      source: 'layout_preview' | 'reservation_hold' | 'qr_checkin' | 'multi_fire_session';
      ipAddress?: string;
      userAgent?: string;
      referrer?: string;
      campaignId?: string;
      [key: string]: any; // Allow additional metadata
    };
  }): CustomerBooking {
    const booking: CustomerBooking = {
      id: `booking_${Date.now()}_${data.reservationId}`,
      reservationId: data.reservationId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      partySize: data.partySize,
      tableId: data.tableId,
      tableType: data.tableType,
      zone: data.zone,
      position: data.position,
      flavorMix: data.flavorMix,
      basePrice: data.basePrice,
      totalPrice: data.totalPrice,
      status: data.status || 'pending',
      currentStage: data.currentStage || 'booking',
      createdAt: new Date(),
      updatedAt: new Date(),
      paymentStatus: 'pending',
      estimatedPrepTime: this.calculatePrepTime(data.tableType, data.partySize),
      estimatedSessionTime: this.calculateSessionTime(data.partySize),
      qrCode: `checkin_${data.reservationId}`,
      metadata: {
        ...data.metadata,
        seatNumber: data.seatNumber,
        sequence: data.sequence
      }
    };

    this.state.bookings.set(booking.id, booking);
    
    // Automatically trigger BOH operations based on booking type
    this.triggerBOHOperations(booking);
    
    this.notifyListeners();

    console.log(`[CUSTOMER_JOURNEY] Created booking from layout preview:`, booking);
    console.log(`[CUSTOMER_JOURNEY] Total bookings now:`, this.state.bookings.size);
    console.log(`[CUSTOMER_JOURNEY] All bookings:`, Array.from(this.state.bookings.values()));
    return booking;
  }

  // Update booking status
  updateBookingStatus(bookingId: string, status: CustomerBooking['status'], stage: CustomerBooking['currentStage']) {
    const booking = this.state.bookings.get(bookingId);
    if (!booking) return;

    booking.status = status;
    booking.currentStage = stage;
    booking.updatedAt = new Date();

    this.state.bookings.set(bookingId, booking);
    this.notifyListeners();

    console.log(`[CUSTOMER_JOURNEY] Updated booking ${bookingId}: ${status} - ${stage}`);
  }

  // Trigger BOH operations based on booking type
  private triggerBOHOperations(booking: CustomerBooking) {
    const operations: Omit<BOHOperation, 'id' | 'timestamp'>[] = [];

    // Base operations for all bookings
    operations.push({
      bookingId: booking.id,
      type: 'prep_notification',
      description: `New ${booking.metadata.source} booking for ${booking.customerName}`,
      priority: 'high',
      status: 'pending',
      assignedStaff: null,
      estimatedDuration: booking.estimatedPrepTime,
      metadata: {
        tableId: booking.tableId,
        zone: booking.zone,
        partySize: booking.partySize,
        flavorMix: booking.flavorMix
      }
    });

    // Specific operations based on booking source
    switch (booking.metadata.source) {
      case 'multi_fire_session':
        operations.push({
          bookingId: booking.id,
          type: 'multi_session_setup',
          description: `Setup multiple fire sessions for table ${booking.tableId}`,
          priority: 'high',
          status: 'pending',
          assignedStaff: null,
          estimatedDuration: booking.estimatedPrepTime + 5, // Extra time for multiple sessions
          metadata: {
            sessionNumber: booking.metadata.sessionNumber,
            totalSessions: booking.metadata.totalSessions,
            parentTableId: booking.metadata.parentTableId
          }
        });
        break;
        
      case 'reservation_hold':
        operations.push({
          bookingId: booking.id,
          type: 'reservation_prep',
          description: `Prepare table ${booking.tableId} for reservation hold`,
          priority: 'medium',
          status: 'pending',
          assignedStaff: null,
          estimatedDuration: 10, // Quick prep for reservation
          metadata: {
            holdAmount: booking.metadata.holdAmount,
            holdDuration: booking.metadata.holdDuration,
            qrCode: booking.metadata.qrCode
          }
        });
        break;
        
      case 'qr_checkin':
        operations.push({
          bookingId: booking.id,
          type: 'immediate_service',
          description: `Immediate service for walk-in customer at table ${booking.tableId}`,
          priority: 'urgent',
          status: 'pending',
          assignedStaff: null,
          estimatedDuration: booking.estimatedPrepTime,
          metadata: {
            qrCode: booking.metadata.qrCode,
            isWalkIn: true
          }
        });
        break;
    }

    // Add all operations
    operations.forEach(op => this.addBOHOperation(op));
    
    console.log(`[CUSTOMER_JOURNEY] Triggered ${operations.length} BOH operations for booking ${booking.id}`);
  }

  // Add BOH operation
  addBOHOperation(operation: Omit<BOHOperation, 'id' | 'timestamp'>) {
    const bohOp: BOHOperation = {
      ...operation,
      id: `boh_${Date.now()}_${operation.bookingId}`,
      timestamp: new Date()
    };

    if (!this.state.bohOperations.has(operation.bookingId)) {
      this.state.bohOperations.set(operation.bookingId, []);
    }
    this.state.bohOperations.get(operation.bookingId)!.push(bohOp);

    // Update booking status based on operation
    this.updateBookingFromBOHOperation(operation.bookingId, operation.operationType);

    this.notifyListeners();
    console.log(`[CUSTOMER_JOURNEY] Added BOH operation:`, bohOp);
  }

  // Update booking based on BOH operation
  private updateBookingFromBOHOperation(bookingId: string, operationType: BOHOperation['operationType']) {
    const booking = this.state.bookings.get(bookingId);
    if (!booking) return;

    switch (operationType) {
      case 'prep_start':
        booking.status = 'preparing';
        booking.currentStage = 'prep';
        break;
      case 'prep_complete':
        booking.status = 'ready';
        break;
      case 'delivery_start':
        booking.status = 'delivered';
        booking.currentStage = 'delivery';
        break;
      case 'service_start':
        booking.status = 'active';
        booking.currentStage = 'service';
        booking.sessionStartTime = new Date();
        this.state.activeSessions.add(bookingId);
        break;
      case 'service_end':
        booking.status = 'completed';
        booking.currentStage = 'completion';
        booking.sessionEndTime = new Date();
        this.state.activeSessions.delete(bookingId);
        break;
    }

    this.state.bookings.set(bookingId, booking);
  }

  // Get all bookings
  getAllBookings(): CustomerBooking[] {
    return Array.from(this.state.bookings.values());
  }

  // Get active bookings
  getActiveBookings(): CustomerBooking[] {
    return this.getAllBookings().filter(booking => 
      ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'active'].includes(booking.status)
    );
  }

  // Get bookings by status
  getBookingsByStatus(status: CustomerBooking['status']): CustomerBooking[] {
    return this.getAllBookings().filter(booking => booking.status === status);
  }

  // Get BOH operations for booking
  getBOHOperations(bookingId: string): BOHOperation[] {
    return this.state.bohOperations.get(bookingId) || [];
  }

  // Calculate prep time based on table type and party size
  private calculatePrepTime(tableType: string, partySize: number): number {
    const baseTime = {
      'stool': 3,
      'table': 5,
      'booth': 7,
      'sectional': 10,
      'vip': 12
    }[tableType] || 5;

    const partyMultiplier = Math.min(partySize / 2, 2); // Max 2x multiplier
    return Math.round(baseTime * partyMultiplier);
  }

  // Calculate session time based on party size
  private calculateSessionTime(partySize: number): number {
    const baseTime = 60; // 1 hour base
    const partyBonus = Math.min(partySize * 10, 30); // Max 30 min bonus
    return baseTime + partyBonus;
  }

  // Get real-time dashboard data
  getDashboardData() {
    const bookings = this.getAllBookings();
    const activeSessions = this.getActiveBookings();
    
    return {
      totalBookings: bookings.length,
      activeSessions: activeSessions.length,
      pendingBookings: this.getBookingsByStatus('pending').length,
      preparingBookings: this.getBookingsByStatus('preparing').length,
      readyBookings: this.getBookingsByStatus('ready').length,
      activeBookings: this.getBookingsByStatus('active').length,
      completedBookings: this.getBookingsByStatus('completed').length,
      totalRevenue: bookings
        .filter(b => b.paymentStatus === 'paid')
        .reduce((sum, b) => sum + b.totalPrice, 0),
      averageSessionTime: this.calculateAverageSessionTime(bookings),
      topFlavors: this.getTopFlavors(bookings),
      staffUtilization: this.getStaffUtilization()
    };
  }

  private calculateAverageSessionTime(bookings: CustomerBooking[]): number {
    const completedBookings = bookings.filter(b => b.sessionStartTime && b.sessionEndTime);
    if (completedBookings.length === 0) return 0;

    const totalTime = completedBookings.reduce((sum, b) => {
      const duration = b.sessionEndTime!.getTime() - b.sessionStartTime!.getTime();
      return sum + duration;
    }, 0);

    return Math.round(totalTime / completedBookings.length / 60000); // Convert to minutes
  }

  private getTopFlavors(bookings: CustomerBooking[]): Array<{ flavor: string; count: number }> {
    const flavorCounts = new Map<string, number>();
    
    bookings.forEach(booking => {
      const count = flavorCounts.get(booking.flavorMix) || 0;
      flavorCounts.set(booking.flavorMix, count + 1);
    });

    return Array.from(flavorCounts.entries())
      .map(([flavor, count]) => ({ flavor, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private getStaffUtilization(): Record<string, number> {
    const staffUtilization: Record<string, number> = {};
    
    this.state.staffAssignments.forEach((bookingIds, staffId) => {
      const activeBookings = bookingIds.filter(id => {
        const booking = this.state.bookings.get(id);
        return booking && ['preparing', 'ready', 'delivered', 'active'].includes(booking.status);
      });
      staffUtilization[staffId] = activeBookings.length;
    });

    return staffUtilization;
  }
}

// Export singleton instance
export const customerJourneyManager = new CustomerJourneyManager();
