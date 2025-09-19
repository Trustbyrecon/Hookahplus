// components/RealTimeCustomerJourney.tsx
"use client";

import { useState, useEffect } from 'react';
import { customerJourneyManager, CustomerBooking, BOHOperation } from '../lib/customer-journey';

interface DashboardData {
  totalBookings: number;
  activeSessions: number;
  pendingBookings: number;
  preparingBookings: number;
  readyBookings: number;
  activeBookings: number;
  completedBookings: number;
  totalRevenue: number;
  averageSessionTime: number;
  topFlavors: Array<{ flavor: string; count: number }>;
  staffUtilization: Record<string, number>;
}

export default function RealTimeCustomerJourney() {
  const [bookings, setBookings] = useState<CustomerBooking[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<CustomerBooking | null>(null);
  const [bohOperations, setBohOperations] = useState<BOHOperation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = customerJourneyManager.subscribe((state) => {
      const allBookings = Array.from(state.bookings.values());
      setBookings(allBookings);
      setDashboardData(customerJourneyManager.getDashboardData());
    });

    // Initial load
    const loadData = async () => {
      try {
        const response = await fetch('/api/customer-journey?action=dashboard');
        const result = await response.json();
        if (result.success) {
          setDashboardData(result.data);
        }

        const bookingsResponse = await fetch('/api/customer-journey?action=active');
        const bookingsResult = await bookingsResponse.json();
        if (bookingsResult.success) {
          setBookings(bookingsResult.data);
        }
      } catch (error) {
        console.error('Failed to load customer journey data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    return () => {
      unsubscribe();
    };
  }, []);

  // Load BOH operations for selected booking
  useEffect(() => {
    if (selectedBooking) {
      const loadBohOperations = async () => {
        try {
          const response = await fetch(`/api/customer-journey?action=boh-operations&bookingId=${selectedBooking.id}`);
          const result = await response.json();
          if (result.success) {
            setBohOperations(result.data);
          }
        } catch (error) {
          console.error('Failed to load BOH operations:', error);
        }
      };

      loadBohOperations();
    }
  }, [selectedBooking]);

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-orange-100 text-orange-800',
      ready: 'bg-green-100 text-green-800',
      delivered: 'bg-teal-100 text-teal-800',
      active: 'bg-purple-100 text-purple-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStageColor = (stage: string) => {
    const colors = {
      booking: 'bg-blue-50 border-blue-200',
      payment: 'bg-green-50 border-green-200',
      prep: 'bg-orange-50 border-orange-200',
      delivery: 'bg-teal-50 border-teal-200',
      service: 'bg-purple-50 border-purple-200',
      completion: 'bg-gray-50 border-gray-200'
    };
    return colors[stage as keyof typeof colors] || 'bg-gray-50 border-gray-200';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🌿</div>
          <div className="text-xl text-zinc-400">Loading Customer Journey...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Header */}
      <div className="px-4 py-6 border-b border-teal-500/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-teal-300">Real-Time Customer Journey</h1>
              <p className="text-zinc-400">Live tracking from layout preview to fire session completion</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Dashboard Stats */}
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
              <h3 className="text-lg font-semibold text-teal-300 mb-2">Total Bookings</h3>
              <p className="text-3xl font-bold text-white">{dashboardData.totalBookings}</p>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
              <h3 className="text-lg font-semibold text-teal-300 mb-2">Active Sessions</h3>
              <p className="text-3xl font-bold text-white">{dashboardData.activeSessions}</p>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
              <h3 className="text-lg font-semibold text-teal-300 mb-2">Total Revenue</h3>
              <p className="text-3xl font-bold text-white">${dashboardData.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
              <h3 className="text-lg font-semibold text-teal-300 mb-2">Avg Session Time</h3>
              <p className="text-3xl font-bold text-white">{dashboardData.averageSessionTime}m</p>
            </div>
          </div>
        )}

        {/* Status Breakdown */}
        {dashboardData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/30">
              <p className="text-yellow-300 font-semibold">Pending</p>
              <p className="text-2xl font-bold text-white">{dashboardData.pendingBookings}</p>
            </div>
            <div className="bg-orange-900/20 rounded-lg p-4 border border-orange-500/30">
              <p className="text-orange-300 font-semibold">Preparing</p>
              <p className="text-2xl font-bold text-white">{dashboardData.preparingBookings}</p>
            </div>
            <div className="bg-green-900/20 rounded-lg p-4 border border-green-500/30">
              <p className="text-green-300 font-semibold">Ready</p>
              <p className="text-2xl font-bold text-white">{dashboardData.readyBookings}</p>
            </div>
            <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/30">
              <p className="text-purple-300 font-semibold">Active</p>
              <p className="text-2xl font-bold text-white">{dashboardData.activeBookings}</p>
            </div>
          </div>
        )}

        {/* Bookings List */}
        <div className="bg-zinc-800/50 rounded-lg border border-zinc-700">
          <div className="p-6 border-b border-zinc-700">
            <h2 className="text-xl font-semibold text-white">Customer Bookings</h2>
            <p className="text-zinc-400">Real-time tracking of all customer journeys</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Table</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Flavor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Stage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-700">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-zinc-700/30">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">{booking.customerName}</div>
                        <div className="text-sm text-zinc-400">Party of {booking.partySize}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{booking.tableId}</div>
                      <div className="text-sm text-zinc-400">{booking.tableType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {booking.flavorMix}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStageColor(booking.currentStage)}`}>
                        {booking.currentStage}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      ${booking.totalPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="text-teal-400 hover:text-teal-300"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Booking Details Modal */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-zinc-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-white">Booking Details</h3>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-zinc-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-zinc-400">Customer Name</label>
                    <p className="text-white">{selectedBooking.customerName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-zinc-400">Party Size</label>
                    <p className="text-white">{selectedBooking.partySize}</p>
                  </div>
                  <div>
                    <label className="text-sm text-zinc-400">Table</label>
                    <p className="text-white">{selectedBooking.tableId} ({selectedBooking.tableType})</p>
                  </div>
                  <div>
                    <label className="text-sm text-zinc-400">Zone</label>
                    <p className="text-white">{selectedBooking.zone}</p>
                  </div>
                  <div>
                    <label className="text-sm text-zinc-400">Flavor Mix</label>
                    <p className="text-white">{selectedBooking.flavorMix}</p>
                  </div>
                  <div>
                    <label className="text-sm text-zinc-400">Total Price</label>
                    <p className="text-white">${selectedBooking.totalPrice.toFixed(2)}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-zinc-400">BOH Operations</label>
                  <div className="mt-2 space-y-2">
                    {bohOperations.map((op) => (
                      <div key={op.id} className="bg-zinc-700/50 rounded p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-white font-medium">{op.operationType.replace('_', ' ')}</p>
                            <p className="text-zinc-400 text-sm">by {op.staffName}</p>
                          </div>
                          <p className="text-zinc-400 text-sm">
                            {new Date(op.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        {op.notes && (
                          <p className="text-zinc-300 text-sm mt-1">{op.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
