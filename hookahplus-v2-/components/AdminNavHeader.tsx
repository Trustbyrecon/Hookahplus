"use client";

import React from 'react';

const AdminNavHeader = () => {
  return (
    <nav className="bg-zinc-900 border-b border-zinc-700 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a 
            href="/dashboard" 
            className="text-zinc-300 hover:text-white transition-colors"
          >
            🏠 Dashboard
          </a>
          <a 
            href="/admin" 
            className="text-purple-400 hover:text-purple-300 transition-colors font-medium"
          >
            ⚙️ Admin Control
          </a>
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <span>Admin Panel</span>
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavHeader;