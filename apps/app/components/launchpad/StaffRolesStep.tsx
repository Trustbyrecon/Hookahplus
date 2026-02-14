'use client';

import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Plus, X, Mail, User } from 'lucide-react';
import { StaffRolesData } from '../../types/launchpad';

interface StaffRolesStepProps {
  initialData?: StaffRolesData;
  onComplete: (data: StaffRolesData) => void;
  onBack?: () => void;
}

export function StaffRolesStep({ initialData, onComplete, onBack }: StaffRolesStepProps) {
  const [staff, setStaff] = useState<StaffRolesData['staff']>(
    initialData?.staff || []
  );
  const [shiftHandoffEnabled, setShiftHandoffEnabled] = useState(
    initialData?.shiftHandoffEnabled ?? true
  );
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<'owner' | 'manager' | 'staff'>('staff');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleAddStaff = () => {
    const email = newStaffEmail.trim().toLowerCase();
    
    if (!email) {
      setErrors({ email: 'Email is required' });
      return;
    }

    if (!validateEmail(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    if (staff.some((s) => s.email.toLowerCase() === email)) {
      setErrors({ email: 'This email is already added' });
      return;
    }

    setStaff([...staff, { email, role: newStaffRole }]);
    setNewStaffEmail('');
    setNewStaffRole('staff');
    setErrors({});
  };

  const handleRemoveStaff = (index: number) => {
    setStaff(staff.filter((_, i) => i !== index));
  };

  const handleUpdateRole = (index: number, role: 'owner' | 'manager' | 'staff') => {
    const updated = [...staff];
    updated[index].role = role;
    setStaff(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Require at least one owner
    const hasOwner = staff.some((s) => s.role === 'owner');
    if (!hasOwner) {
      setErrors({ staff: 'At least one owner is required' });
      return;
    }

    onComplete({
      staff,
      shiftHandoffEnabled,
    });
  };

  const ownerCount = staff.filter((s) => s.role === 'owner').length;

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Staff & Roles</h2>
        <p className="text-zinc-400 text-sm">
          Everyone sees what they need. Nothing more.
        </p>
        <p className="text-zinc-500 text-xs mt-1">
          Notes carry forward so nothing gets lost between shifts.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Add Staff */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-3">
            Add staff *
          </label>
          <div className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="email"
                value={newStaffEmail}
                onChange={(e) => {
                  setNewStaffEmail(e.target.value);
                  setErrors({});
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddStaff();
                  }
                }}
                className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:border-teal-500 focus:outline-none"
                placeholder="staff@example.com"
              />
            </div>
            <select
              value={newStaffRole}
              onChange={(e) =>
                setNewStaffRole(e.target.value as 'owner' | 'manager' | 'staff')
              }
              className="px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:border-teal-500 focus:outline-none"
            >
              <option value="owner">Owner</option>
              <option value="manager">Manager</option>
              <option value="staff">Staff</option>
            </select>
            <button
              type="button"
              onClick={handleAddStaff}
              className="px-4 py-3 bg-teal-600 hover:bg-teal-700 rounded-lg text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-400">{errors.email}</p>
          )}
        </div>

        {/* Staff List */}
        {staff.length > 0 && (
          <div className="space-y-2">
            {staff.map((member, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-4 bg-zinc-800 border border-zinc-600 rounded-lg"
              >
                <User className="w-5 h-5 text-zinc-400" />
                <div className="flex-1">
                  <div className="text-white">{member.email}</div>
                  <div className="text-xs text-zinc-400">
                    {member.role === 'owner' && 'Full access to all features'}
                    {member.role === 'manager' && 'Can manage sessions and staff'}
                    {member.role === 'staff' && 'Can manage sessions only'}
                  </div>
                </div>
                <select
                  value={member.role}
                  onChange={(e) =>
                    handleUpdateRole(
                      index,
                      e.target.value as 'owner' | 'manager' | 'staff'
                    )
                  }
                  className="px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white text-sm focus:border-teal-500 focus:outline-none"
                >
                  <option value="owner">Owner</option>
                  <option value="manager">Manager</option>
                  <option value="staff">Staff</option>
                </select>
                <button
                  type="button"
                  onClick={() => handleRemoveStaff(index)}
                  className="p-2 text-zinc-400 hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {errors.staff && (
          <p className="text-sm text-red-400">{errors.staff}</p>
        )}

        {ownerCount === 0 && staff.length > 0 && (
          <div className="p-3 bg-yellow-900/20 border border-yellow-600/50 rounded-lg">
            <p className="text-sm text-yellow-200">
              ⚠️ At least one owner is required. Please assign at least one staff member as owner.
            </p>
          </div>
        )}

        {/* Shift Handoff */}
        <div className="pt-4 border-t border-zinc-700">
          <label className="flex items-center gap-3 p-4 bg-zinc-800 border border-zinc-600 rounded-lg cursor-pointer hover:border-teal-500 transition-colors">
            <input
              type="checkbox"
              checked={shiftHandoffEnabled}
              onChange={(e) => setShiftHandoffEnabled(e.target.checked)}
              className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
            />
            <div>
              <div className="font-semibold text-white">Shift handoff</div>
              <div className="text-sm text-zinc-400">
                Enabled by default. Session notes and status carry forward between shifts.
              </div>
            </div>
          </label>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t border-zinc-700">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-2 px-6 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white hover:border-teal-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}
          <button
            type="submit"
            disabled={staff.length === 0 || ownerCount === 0}
            className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 rounded-lg text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Invite staff
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

