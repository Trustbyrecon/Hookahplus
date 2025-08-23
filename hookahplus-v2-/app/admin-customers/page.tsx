"use client";

import { useState } from "react";
import CustomerProfileManager from "../../components/CustomerProfileManager";
import GlobalNavigation from "../../components/GlobalNavigation";

export default function AdminCustomersPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <GlobalNavigation />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-teal-400 mb-2">Customer Profile Management</h1>
          <p className="text-zinc-400">Manage customer profiles, preferences, and loyalty programs</p>
        </div>
        
        <CustomerProfileManager onProfileUpdate={(profile) => {
          console.log('Profile updated:', profile);
        }} />
      </div>
    </div>
  );
}
