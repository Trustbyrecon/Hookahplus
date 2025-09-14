// hookahplus-v2-/lib/reservation-holds.ts
import { EventEmitter } from 'events';

export interface ReservationHold {
  id: string;
  tableId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  partySize: number;
  reservationTime: number; // timestamp
  duration: number; // minutes
  holdDuration: number; // minutes to hold table
  status: 'pending' | 'confirmed' | 'seated' | 'no_show' | 'cancelled' | 'completed';
  specialRequests?: string;
  depositAmount: number; // in cents
  depositPaid: boolean;
  confirmationCode: string;
  createdAt: number;
  confirmedAt?: number;
  seatedAt?: number;
  noShowAt?: number;
  cancelledAt?: number;
  notes?: string;
}

export interface NoShowPolicy {
  gracePeriod: number; // minutes after reservation time
  holdDuration: number; // minutes to hold table
  depositRequired: boolean;
  depositAmount: number; // in cents
  autoRelease: boolean; // auto-release table after hold duration
  penaltyFee: number; // in cents for no-show
  blacklistThreshold: number; // number of no-shows before blacklist
}

export interface CustomerProfile {
  customerId: string;
  name: string;
  phone: string;
  email?: string;
  totalReservations: number;
  noShowCount: number;
  blacklisted: boolean;
  lastReservation?: number;
  averagePartySize: number;
  preferredTable?: string;
  specialRequests?: string;
  loyaltyPoints: number;
}

export class ReservationHolds extends EventEmitter {
  private reservations: Map<string, ReservationHold> = new Map();
  private customerProfiles: Map<string, CustomerProfile> = new Map();
  private noShowPolicy: NoShowPolicy;
  private isRunning = false;

  constructor() {
    super();
    this.noShowPolicy = {
      gracePeriod: 15, // 15 minutes grace period
      holdDuration: 30, // Hold table for 30 minutes
      depositRequired: true,
      depositAmount: 1000, // $10.00 deposit
      autoRelease: true,
      penaltyFee: 500, // $5.00 penalty for no-show
      blacklistThreshold: 3 // Blacklist after 3 no-shows
    };
  }

  // Start reservation holds system
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('📅 Reservation Holds System Started');
    
    // Check reservations every minute
    setInterval(() => {
      this.checkReservations();
    }, 60000);
  }

  // Stop reservation holds system
  stop() {
    this.isRunning = false;
    console.log('⏹️ Reservation Holds System Stopped');
  }

  // Create reservation hold
  createReservation(data: {
    tableId: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    partySize: number;
    reservationTime: number;
    duration?: number;
    specialRequests?: string;
    depositPaid?: boolean;
  }): ReservationHold {
    const customerId = this.getOrCreateCustomerId(data.customerPhone);
    const confirmationCode = this.generateConfirmationCode();
    
    const reservation: ReservationHold = {
      id: `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tableId: data.tableId,
      customerId,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail,
      partySize: data.partySize,
      reservationTime: data.reservationTime,
      duration: data.duration || 90, // Default 90 minutes
      holdDuration: this.noShowPolicy.holdDuration,
      status: 'pending',
      depositAmount: this.noShowPolicy.depositAmount,
      depositPaid: data.depositPaid || false,
      confirmationCode,
      createdAt: Date.now(),
      specialRequests: data.specialRequests,
      notes: ''
    };

    this.reservations.set(reservation.id, reservation);
    
    // Update customer profile
    this.updateCustomerProfile(customerId, {
      name: data.customerName,
      phone: data.customerPhone,
      email: data.customerEmail,
      lastReservation: data.reservationTime
    });

    this.emit('reservation_created', {
      type: 'reservation_created',
      reservationId: reservation.id,
      tableId: reservation.tableId,
      customerId: reservation.customerId,
      timestamp: Date.now(),
      data: reservation
    });

    console.log(`📅 Reservation created: ${reservation.id} for ${data.customerName} at ${new Date(data.reservationTime).toLocaleString()}`);
    return reservation;
  }

  // Confirm reservation
  confirmReservation(reservationId: string, depositPaid: boolean = false): boolean {
    const reservation = this.reservations.get(reservationId);
    if (!reservation || reservation.status !== 'pending') return false;

    reservation.status = 'confirmed';
    reservation.confirmedAt = Date.now();
    reservation.depositPaid = depositPaid;

    this.emit('reservation_confirmed', {
      type: 'reservation_confirmed',
      reservationId,
      tableId: reservation.tableId,
      customerId: reservation.customerId,
      timestamp: Date.now(),
      data: reservation
    });

    console.log(`✅ Reservation confirmed: ${reservationId} (Deposit: ${depositPaid ? 'Paid' : 'Pending'})`);
    return true;
  }

  // Seat customer
  seatCustomer(reservationId: string): boolean {
    const reservation = this.reservations.get(reservationId);
    if (!reservation || reservation.status !== 'confirmed') return false;

    reservation.status = 'seated';
    reservation.seatedAt = Date.now();

    this.emit('customer_seated', {
      type: 'customer_seated',
      reservationId,
      tableId: reservation.tableId,
      customerId: reservation.customerId,
      timestamp: Date.now(),
      data: reservation
    });

    console.log(`🪑 Customer seated: ${reservationId} at table ${reservation.tableId}`);
    return true;
  }

  // Mark as no-show
  markNoShow(reservationId: string, reason?: string): boolean {
    const reservation = this.reservations.get(reservationId);
    if (!reservation || reservation.status === 'seated') return false;

    reservation.status = 'no_show';
    reservation.noShowAt = Date.now();

    // Update customer profile
    const customer = this.customerProfiles.get(reservation.customerId);
    if (customer) {
      customer.noShowCount++;
      if (customer.noShowCount >= this.noShowPolicy.blacklistThreshold) {
        customer.blacklisted = true;
        this.emit('customer_blacklisted', {
          type: 'customer_blacklisted',
          customerId: reservation.customerId,
          noShowCount: customer.noShowCount,
          timestamp: Date.now(),
          data: customer
        });
        console.log(`🚫 Customer blacklisted: ${reservation.customerId} (${customer.noShowCount} no-shows)`);
      }
    }

    this.emit('reservation_no_show', {
      type: 'reservation_no_show',
      reservationId,
      tableId: reservation.tableId,
      customerId: reservation.customerId,
      timestamp: Date.now(),
      data: { ...reservation, reason }
    });

    console.log(`❌ No-show: ${reservationId} (${reason || 'No reason provided'})`);
    return true;
  }

  // Cancel reservation
  cancelReservation(reservationId: string, reason?: string): boolean {
    const reservation = this.reservations.get(reservationId);
    if (!reservation || reservation.status === 'seated') return false;

    reservation.status = 'cancelled';
    reservation.cancelledAt = Date.now();

    this.emit('reservation_cancelled', {
      type: 'reservation_cancelled',
      reservationId,
      tableId: reservation.tableId,
      customerId: reservation.customerId,
      timestamp: Date.now(),
      data: { ...reservation, reason }
    });

    console.log(`❌ Reservation cancelled: ${reservationId} (${reason || 'No reason provided'})`);
    return true;
  }

  // Complete reservation
  completeReservation(reservationId: string): boolean {
    const reservation = this.reservations.get(reservationId);
    if (!reservation || reservation.status !== 'seated') return false;

    reservation.status = 'completed';

    // Update customer profile
    const customer = this.customerProfiles.get(reservation.customerId);
    if (customer) {
      customer.totalReservations++;
      customer.loyaltyPoints += this.calculateLoyaltyPoints(reservation);
    }

    this.emit('reservation_completed', {
      type: 'reservation_completed',
      reservationId,
      tableId: reservation.tableId,
      customerId: reservation.customerId,
      timestamp: Date.now(),
      data: reservation
    });

    console.log(`✅ Reservation completed: ${reservationId}`);
    return true;
  }

  // Check reservations for no-shows and auto-release
  private checkReservations() {
    const now = Date.now();
    
    this.reservations.forEach((reservation, reservationId) => {
      const reservationTime = reservation.reservationTime;
      const gracePeriodEnd = reservationTime + (this.noShowPolicy.gracePeriod * 60000);
      const holdEnd = reservationTime + (this.noShowPolicy.holdDuration * 60000);

      // Check for no-show after grace period
      if (reservation.status === 'confirmed' && now > gracePeriodEnd) {
        this.markNoShow(reservationId, 'Grace period exceeded');
      }

      // Auto-release table after hold duration
      if (this.noShowPolicy.autoRelease && 
          (reservation.status === 'no_show' || reservation.status === 'cancelled') && 
          now > holdEnd) {
        this.emit('table_auto_released', {
          type: 'table_auto_released',
          reservationId,
          tableId: reservation.tableId,
          timestamp: now,
          data: reservation
        });
        console.log(`🔄 Table auto-released: ${reservation.tableId} (reservation ${reservationId})`);
      }
    });
  }

  // Get reservation by ID
  getReservation(reservationId: string): ReservationHold | null {
    return this.reservations.get(reservationId) || null;
  }

  // Get reservations by table
  getReservationsByTable(tableId: string): ReservationHold[] {
    return Array.from(this.reservations.values()).filter(r => r.tableId === tableId);
  }

  // Get reservations by customer
  getReservationsByCustomer(customerId: string): ReservationHold[] {
    return Array.from(this.reservations.values()).filter(r => r.customerId === customerId);
  }

  // Get pending reservations
  getPendingReservations(): ReservationHold[] {
    return Array.from(this.reservations.values()).filter(r => r.status === 'pending');
  }

  // Get confirmed reservations
  getConfirmedReservations(): ReservationHold[] {
    return Array.from(this.reservations.values()).filter(r => r.status === 'confirmed');
  }

  // Get customer profile
  getCustomerProfile(customerId: string): CustomerProfile | null {
    return this.customerProfiles.get(customerId) || null;
  }

  // Check if customer is blacklisted
  isCustomerBlacklisted(customerId: string): boolean {
    const customer = this.customerProfiles.get(customerId);
    return customer?.blacklisted || false;
  }

  // Get or create customer ID
  private getOrCreateCustomerId(phone: string): string {
    // Find existing customer by phone
    for (const [customerId, customer] of this.customerProfiles.entries()) {
      if (customer.phone === phone) {
        return customerId;
      }
    }

    // Create new customer
    const customerId = `cust_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const customer: CustomerProfile = {
      customerId,
      name: '',
      phone,
      totalReservations: 0,
      noShowCount: 0,
      blacklisted: false,
      averagePartySize: 0,
      loyaltyPoints: 0
    };

    this.customerProfiles.set(customerId, customer);
    return customerId;
  }

  // Update customer profile
  private updateCustomerProfile(customerId: string, updates: Partial<CustomerProfile>) {
    const customer = this.customerProfiles.get(customerId);
    if (customer) {
      Object.assign(customer, updates);
      this.customerProfiles.set(customerId, customer);
    }
  }

  // Generate confirmation code
  private generateConfirmationCode(): string {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  }

  // Calculate loyalty points
  private calculateLoyaltyPoints(reservation: ReservationHold): number {
    let points = 10; // Base points
    points += reservation.partySize * 2; // 2 points per person
    points += reservation.depositPaid ? 5 : 0; // Bonus for deposit
    return points;
  }

  // Get analytics
  getAnalytics(): {
    totalReservations: number;
    confirmedReservations: number;
    noShowRate: number;
    averagePartySize: number;
    totalRevenue: number;
    blacklistedCustomers: number;
    popularTimes: { hour: number; count: number }[];
  } {
    const reservations = Array.from(this.reservations.values());
    const confirmed = reservations.filter(r => r.status === 'confirmed' || r.status === 'seated' || r.status === 'completed');
    const noShows = reservations.filter(r => r.status === 'no_show');
    
    const totalReservations = reservations.length;
    const confirmedReservations = confirmed.length;
    const noShowRate = totalReservations > 0 ? (noShows.length / totalReservations) * 100 : 0;
    const averagePartySize = reservations.length > 0 ? 
      reservations.reduce((sum, r) => sum + r.partySize, 0) / reservations.length : 0;
    const totalRevenue = reservations.reduce((sum, r) => sum + r.depositAmount, 0);
    const blacklistedCustomers = Array.from(this.customerProfiles.values()).filter(c => c.blacklisted).length;

    // Popular times
    const timeCounts = reservations.reduce((acc, r) => {
      const hour = new Date(r.reservationTime).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    const popularTimes = Object.entries(timeCounts)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalReservations,
      confirmedReservations,
      noShowRate,
      averagePartySize,
      totalRevenue,
      blacklistedCustomers,
      popularTimes
    };
  }
}

// Export singleton instance
export const reservationHolds = new ReservationHolds();
