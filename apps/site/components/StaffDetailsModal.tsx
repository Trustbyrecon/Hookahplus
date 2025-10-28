'use client';

import React from 'react';
import { X, User, Star, CheckCircle, TrendingUp, DollarSign, Award } from 'lucide-react';

interface StaffDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: {
    id: string;
    name: string;
    role: string;
    rating: number;
    tasksCompleted: number;
    efficiency: number;
    revenue: string;
    avatar: string;
  };
}

export default function StaffDetailsModal({ isOpen, onClose, staff }: StaffDetailsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-lg w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-700">
          <h2 className="text-xl font-bold text-white">Staff Performance</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Profile Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center">
              <span className="text-teal-400 font-bold text-xl">{staff.avatar}</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{staff.name}</h3>
              <p className="text-zinc-400">{staff.role}</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-zinc-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="text-sm text-zinc-400">Rating</span>
              </div>
              <div className="text-2xl font-bold text-yellow-400">{staff.rating}/5</div>
            </div>

            <div className="bg-zinc-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-sm text-zinc-400">Tasks</span>
              </div>
              <div className="text-2xl font-bold text-green-400">{staff.tasksCompleted}</div>
            </div>

            <div className="bg-zinc-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-zinc-400">Efficiency</span>
              </div>
              <div className="text-2xl font-bold text-blue-400">{staff.efficiency}%</div>
            </div>

            <div className="bg-zinc-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-purple-400" />
                <span className="text-sm text-zinc-400">Revenue</span>
              </div>
              <div className="text-2xl font-bold text-purple-400">{staff.revenue}</div>
            </div>
          </div>

          {/* Performance Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-zinc-400">Overall Performance</span>
              <span className="text-teal-400 font-medium">{staff.efficiency}%</span>
            </div>
            <div className="w-full bg-zinc-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-teal-400 to-teal-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${staff.efficiency}%` }}
              ></div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-zinc-700">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                console.log(`Viewing detailed analytics for ${staff.name}`);
                onClose();
              }}
              className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Award className="w-4 h-4" />
              View Analytics
            </button>
          </div>
        </div>
      </div>
  );
}
