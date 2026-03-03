"use client";

import React from "react";
import { Users, ChefHat } from "lucide-react";

interface FOHBOHToggleProps {
  selectedRole: 'FOH' | 'BOH';
  onRoleChange: (role: 'FOH' | 'BOH') => void;
}

export function FOHBOHToggle({ selectedRole, onRoleChange }: FOHBOHToggleProps) {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-zinc-400 mr-3">View:</span>
      <div className="flex bg-zinc-800 rounded-lg p-1">
        <button
          onClick={() => onRoleChange('FOH')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            selectedRole === 'FOH'
              ? 'bg-teal-500 text-white shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>FOH</span>
        </button>
        <button
          onClick={() => onRoleChange('BOH')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            selectedRole === 'BOH'
              ? 'bg-teal-500 text-white shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
          }`}
        >
          <ChefHat className="w-4 h-4" />
          <span>BOH</span>
        </button>
      </div>
    </div>
  );
}
