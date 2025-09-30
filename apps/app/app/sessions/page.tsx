"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '../../components';
import GlobalNavigation from '../../components/GlobalNavigation';

export default function SessionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Global Navigation */}
      <GlobalNavigation />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Sessions</h1>
          <p className="text-zinc-400 mb-8">Manage your hookah sessions</p>
          <div className="flex justify-center space-x-4">
            <Link href="/fire-session-dashboard">
              <Button 
                className="btn-pretty-primary"
                size="lg"
              >
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
