"use client";

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  User,
  Copy,
  Save
} from 'lucide-react';

interface Shift {
  id: string;
  staffId: string;
  staffName: string;
  role: string;
  startTime: string;
  endTime: string;
  date: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  location?: string;
  notes?: string;
  breakDuration?: number; // in minutes
  overtime?: number; // in minutes
}

interface StaffMember {
  id: string;
  name: string;
  role: 'BOH' | 'FOH' | 'MANAGER' | 'ADMIN';
  email: string;
  phone: string;
  availability: {
    monday: { start: string; end: string; available: boolean }[];
    tuesday: { start: string; end: string; available: boolean }[];
    wednesday: { start: string; end: string; available: boolean }[];
    thursday: { start: string; end: string; available: boolean }[];
    friday: { start: string; end: string; available: boolean }[];
    saturday: { start: string; end: string; available: boolean }[];
    sunday: { start: string; end: string; available: boolean }[];
  };
  maxHoursPerWeek: number;
  currentHoursThisWeek: number;
}

interface StaffSchedulingProps {
  staffMembers: StaffMember[];
  onShiftCreate: (shift: Omit<Shift, 'id'>) => void;
  onShiftUpdate: (shiftId: string, updates: Partial<Shift>) => void;
  onShiftDelete: (shiftId: string) => void;
}

export default function StaffScheduling({ 
  staffMembers, 
  onShiftCreate, 
  onShiftUpdate, 
  onShiftDelete 
}: StaffSchedulingProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month' | 'day'>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [newShift, setNewShift] = useState({
    staffId: '',
    startTime: '',
    endTime: '',
    date: '',
    location: '',
    notes: '',
    breakDuration: 30
  });

  // Generate demo shifts
  useEffect(() => {
    const demoShifts: Shift[] = [
      {
        id: 'shift-1',
        staffId: 'staff-001',
        staffName: 'Mike Rodriguez',
        role: 'BOH',
        startTime: '09:00',
        endTime: '17:00',
        date: new Date().toISOString().split('T')[0],
        status: 'scheduled',
        location: 'Main Floor',
        notes: 'Opening shift - prep work',
        breakDuration: 30
      },
      {
        id: 'shift-2',
        staffId: 'staff-002',
        staffName: 'Sarah Chen',
        role: 'FOH',
        startTime: '12:00',
        endTime: '20:00',
        date: new Date().toISOString().split('T')[0],
        status: 'confirmed',
        location: 'Main Floor',
        notes: 'Lunch rush coverage',
        breakDuration: 30
      },
      {
        id: 'shift-3',
        staffId: 'staff-003',
        staffName: 'Alex Johnson',
        role: 'MANAGER',
        startTime: '14:00',
        endTime: '22:00',
        date: new Date().toISOString().split('T')[0],
        status: 'scheduled',
        location: 'Main Floor',
        notes: 'Manager on duty',
        breakDuration: 30
      }
    ];
    setShifts(demoShifts);
  }, []);

  const getWeekDates = (date: Date) => {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay());
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const current = new Date(start);
      current.setDate(start.getDate() + i);
      dates.push(current);
    }
    return dates;
  };

  const getMonthDates = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const dates = [];
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      dates.push(new Date(year, month, i));
    }
    return dates;
  };

  const getShiftsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return shifts.filter(shift => shift.date === dateStr);
  };

  const getStatusColor = (status: Shift['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'confirmed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'completed': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'BOH': return 'bg-orange-500/20 text-orange-400';
      case 'FOH': return 'bg-blue-500/20 text-blue-400';
      case 'MANAGER': return 'bg-purple-500/20 text-purple-400';
      case 'ADMIN': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const handleCreateShift = () => {
    if (!newShift.staffId || !newShift.startTime || !newShift.endTime || !newShift.date) return;

    const staff = staffMembers.find(s => s.id === newShift.staffId);
    if (!staff) return;

    const shift: Shift = {
      id: `shift-${Date.now()}`,
      staffId: newShift.staffId,
      staffName: staff.name,
      role: staff.role,
      startTime: newShift.startTime,
      endTime: newShift.endTime,
      date: newShift.date,
      status: 'scheduled',
      location: newShift.location,
      notes: newShift.notes,
      breakDuration: newShift.breakDuration
    };

    // Add to local state
    setShifts([...shifts, shift]);
    
    // Notify parent
    onShiftCreate(shift);
    
    // Reset form
    setNewShift({
      staffId: '',
      startTime: '',
      endTime: '',
      date: '',
      location: '',
      notes: '',
      breakDuration: 30
    });
    setShowShiftModal(false);
  };

  const handleUpdateShift = () => {
    if (!editingShift) return;

    const updatedShift: Shift = {
      ...editingShift,
      staffId: newShift.staffId,
      staffName: staffMembers.find(s => s.id === newShift.staffId)?.name || editingShift.staffName,
      role: staffMembers.find(s => s.id === newShift.staffId)?.role || editingShift.role,
      startTime: newShift.startTime,
      endTime: newShift.endTime,
      date: newShift.date,
      location: newShift.location,
      notes: newShift.notes,
      breakDuration: newShift.breakDuration
    };

    // Update local state
    setShifts(shifts.map(s => s.id === editingShift.id ? updatedShift : s));
    
    // Notify parent
    onShiftUpdate(editingShift.id, updatedShift);

    setEditingShift(null);
    setNewShift({
      staffId: '',
      startTime: '',
      endTime: '',
      date: '',
      location: '',
      notes: '',
      breakDuration: 30
    });
    setShowShiftModal(false);
  };

  const handleEditShift = (shift: Shift) => {
    setEditingShift(shift);
    setNewShift({
      staffId: shift.staffId,
      startTime: shift.startTime,
      endTime: shift.endTime,
      date: shift.date,
      location: shift.location || '',
      notes: shift.notes || '',
      breakDuration: shift.breakDuration || 30
    });
    setShowShiftModal(true);
  };

  const handleDeleteShift = (shiftId: string) => {
    if (confirm('Are you sure you want to delete this shift?')) {
      // Remove from local state
      setShifts(shifts.filter(s => s.id !== shiftId));
      
      // Notify parent
      onShiftDelete(shiftId);
    }
  };

  const handleCopyShift = (shift: Shift) => {
    setNewShift({
      staffId: shift.staffId,
      startTime: shift.startTime,
      endTime: shift.endTime,
      date: new Date().toISOString().split('T')[0],
      location: shift.location || '',
      notes: shift.notes || '',
      breakDuration: shift.breakDuration || 30
    });
    setShowShiftModal(true);
  };

  const weekDates = getWeekDates(currentDate);
  const monthDates = getMonthDates(currentDate);

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-white">Staff Scheduling</h2>
          <p className="text-zinc-400">Manage staff shifts and availability</p>
        </div>
        
        <div className="flex space-x-3">
          {/* View Mode Selector */}
          <div className="flex bg-zinc-800 rounded-lg p-1">
            {[
              { id: 'day', label: 'Day', icon: Calendar },
              { id: 'week', label: 'Week', icon: Calendar },
              { id: 'month', label: 'Month', icon: Calendar }
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id as any)}
                className={`flex items-center space-x-2 px-3 py-1 rounded-md text-sm transition-colors ${
                  viewMode === mode.id
                    ? 'bg-blue-600 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
                }`}
              >
                <mode.icon className="w-4 h-4" />
                <span>{mode.label}</span>
              </button>
            ))}
          </div>

          {/* Date Navigation */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                const newDate = new Date(currentDate);
                if (viewMode === 'week') newDate.setDate(newDate.getDate() - 7);
                else if (viewMode === 'month') newDate.setMonth(newDate.getMonth() - 1);
                else newDate.setDate(newDate.getDate() - 1);
                setCurrentDate(newDate);
              }}
              className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-zinc-400" />
            </button>
            <span className="text-sm text-zinc-300 min-w-[120px] text-center">
              {currentDate.toLocaleDateString('en-US', { 
                month: 'short', 
                year: 'numeric',
                ...(viewMode === 'day' ? { day: 'numeric' } : {})
              })}
            </span>
            <button
              onClick={() => {
                const newDate = new Date(currentDate);
                if (viewMode === 'week') newDate.setDate(newDate.getDate() + 7);
                else if (viewMode === 'month') newDate.setMonth(newDate.getMonth() + 1);
                else newDate.setDate(newDate.getDate() + 1);
                setCurrentDate(newDate);
              }}
              className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            </button>
          </div>

          {/* Add Shift Button */}
          <button
            onClick={() => {
              setEditingShift(null);
              setNewShift({
                staffId: '',
                startTime: '',
                endTime: '',
                date: selectedDate.toISOString().split('T')[0],
                location: '',
                notes: '',
                breakDuration: 30
              });
              setShowShiftModal(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Shift</span>
          </button>
        </div>
      </div>

      {/* Schedule View */}
      <div className="bg-zinc-800/50 rounded-lg border border-zinc-700">
        {viewMode === 'week' && (
          <div className="p-4">
            <div className="grid grid-cols-8 gap-2 mb-4">
              <div className="text-sm font-medium text-zinc-400">Time</div>
              {weekDates.map((date, index) => (
                <div key={index} className="text-center">
                  <div className="text-sm font-medium text-zinc-300">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {date.getDate()}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-2">
              {Array.from({ length: 24 }, (_, hour) => (
                <div key={hour} className="grid grid-cols-8 gap-2">
                  <div className="text-xs text-zinc-500 py-2">
                    {hour.toString().padStart(2, '0')}:00
                  </div>
                  {weekDates.map((date, dayIndex) => (
                    <div key={dayIndex} className="min-h-[40px] border border-zinc-700 rounded p-1">
                      {getShiftsForDate(date).map((shift) => {
                        const startHour = parseInt(shift.startTime.split(':')[0]);
                        const endHour = parseInt(shift.endTime.split(':')[0]);
                        if (hour >= startHour && hour < endHour) {
                          return (
                            <div
                              key={shift.id}
                              className={`text-xs p-1 rounded border ${getStatusColor(shift.status)}`}
                            >
                              <div className="font-medium">{shift.staffName}</div>
                              <div className="text-xs opacity-75">{shift.startTime}-{shift.endTime}</div>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {viewMode === 'day' && (
          <div className="p-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-white">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
            </div>
            
            <div className="space-y-2">
              {getShiftsForDate(selectedDate).map((shift) => (
                <div key={shift.id} className="bg-zinc-700/50 rounded-lg p-4 border border-zinc-600">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`px-2 py-1 rounded text-xs font-medium ${getRoleColor(shift.role)}`}>
                        {shift.role}
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(shift.status)}`}>
                        {shift.status.toUpperCase()}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditShift(shift)}
                        className="p-1 text-zinc-400 hover:text-white transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCopyShift(shift)}
                        className="p-1 text-zinc-400 hover:text-white transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteShift(shift.id)}
                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white">{shift.staffName}</h4>
                      <div className="flex items-center space-x-4 text-sm text-zinc-400">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{shift.startTime} - {shift.endTime}</span>
                        </div>
                        {shift.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{shift.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-sm text-zinc-400">
                      <div>Break: {shift.breakDuration}min</div>
                      {shift.overtime && <div>OT: {shift.overtime}min</div>}
                    </div>
                  </div>
                  
                  {shift.notes && (
                    <div className="mt-2 text-sm text-zinc-300 bg-zinc-800/50 rounded p-2">
                      {shift.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {viewMode === 'month' && (
          <div className="p-4">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-zinc-400 p-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {monthDates.map((date, index) => (
                <div
                  key={index}
                  className={`min-h-[100px] border border-zinc-700 rounded p-2 ${
                    date.getMonth() !== currentDate.getMonth() ? 'opacity-50' : ''
                  }`}
                >
                  <div className="text-sm font-medium text-zinc-300 mb-1">
                    {date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {getShiftsForDate(date).slice(0, 2).map((shift) => (
                      <div
                        key={shift.id}
                        className={`text-xs p-1 rounded ${getStatusColor(shift.status)}`}
                      >
                        <div className="font-medium truncate">{shift.staffName}</div>
                        <div className="text-xs opacity-75">{shift.startTime}-{shift.endTime}</div>
                      </div>
                    ))}
                    {getShiftsForDate(date).length > 2 && (
                      <div className="text-xs text-zinc-500">
                        +{getShiftsForDate(date).length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Shift Modal */}
      {showShiftModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {editingShift ? 'Edit Shift' : 'Create New Shift'}
              </h3>
              <button
                onClick={() => setShowShiftModal(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Staff Member</label>
                <select
                  value={newShift.staffId}
                  onChange={(e) => setNewShift({ ...newShift, staffId: e.target.value })}
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                >
                  <option value="">Select staff member</option>
                  {staffMembers.map((staff) => (
                    <option key={staff.id} value={staff.id}>{staff.name} ({staff.role})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Start Time</label>
                  <input
                    type="time"
                    value={newShift.startTime}
                    onChange={(e) => setNewShift({ ...newShift, startTime: e.target.value })}
                    className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">End Time</label>
                  <input
                    type="time"
                    value={newShift.endTime}
                    onChange={(e) => setNewShift({ ...newShift, endTime: e.target.value })}
                    className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Date</label>
                <input
                  type="date"
                  value={newShift.date}
                  onChange={(e) => setNewShift({ ...newShift, date: e.target.value })}
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Location</label>
                <input
                  type="text"
                  value={newShift.location}
                  onChange={(e) => setNewShift({ ...newShift, location: e.target.value })}
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                  placeholder="e.g., Main Floor, Bar Area"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Break Duration (minutes)</label>
                <input
                  type="number"
                  value={newShift.breakDuration}
                  onChange={(e) => setNewShift({ ...newShift, breakDuration: parseInt(e.target.value) || 30 })}
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                  min="0"
                  max="120"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Notes</label>
                <textarea
                  value={newShift.notes}
                  onChange={(e) => setNewShift({ ...newShift, notes: e.target.value })}
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white h-20 resize-none"
                  placeholder="Additional notes for this shift..."
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowShiftModal(false)}
                className="flex-1 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors text-white"
              >
                Cancel
              </button>
              <button
                onClick={editingShift ? handleUpdateShift : handleCreateShift}
                disabled={!newShift.staffId || !newShift.startTime || !newShift.endTime || !newShift.date}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-600 disabled:cursor-not-allowed rounded-lg transition-colors text-white flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{editingShift ? 'Update Shift' : 'Create Shift'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
