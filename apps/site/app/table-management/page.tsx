'use client';

import React from 'react';
import { SoftwareApplicationSchema } from '../../components/SchemaMarkup';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Link from 'next/link';
import { 
  LayoutGrid, 
  CheckCircle, 
  ArrowRight,
  MapPin,
  Users,
  Calendar,
  Eye,
  Zap
} from 'lucide-react';

export default function TableManagementPage() {
  const description = "Hookah+ Table Management provides real-time visibility into table status, availability, and session assignments. Manage your lounge layout, track table occupancy, and optimize seating efficiency.";
  const url = process.env.NEXT_PUBLIC_SITE_URL 
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/table-management`
    : "https://hookahplus.net/table-management";

  return (
    <>
      <SoftwareApplicationSchema 
        name="Table Management"
        description={description}
        url={url}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
        <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-zinc-800">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Table Management</h1>
            <p className="text-xl text-zinc-300 mb-8 leading-relaxed">{description}</p>

            <Card className="p-6 bg-zinc-800/50 border-zinc-700 mb-8">
              <h2 className="text-xl font-bold mb-4">Key Features</h2>
              <ul className="space-y-3 text-zinc-300">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div><strong className="text-white">Visual Layout:</strong> Interactive floor plan showing all tables and their status</div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div><strong className="text-white">Real-Time Status:</strong> See which tables are occupied, available, or reserved</div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div><strong className="text-white">Zone Management:</strong> Organize tables into zones (VIP, Main Floor, Patio, etc.)</div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div><strong className="text-white">Session Assignment:</strong> Assign active sessions to specific tables</div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div><strong className="text-white">Capacity Planning:</strong> Track table capacity and optimize seating</div>
                </li>
              </ul>
            </Card>
          </div>
        </section>

        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-zinc-900/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">How Table Management Works</h2>
            <div className="space-y-4">
              {[
                { step: '1', title: 'Layout Setup', desc: 'Configure your lounge layout with tables, zones, and capacity' },
                { step: '2', title: 'Real-Time View', desc: 'See all tables and their current status at a glance' },
                { step: '3', title: 'Session Assignment', desc: 'Assign sessions to tables as customers arrive' },
                { step: '4', title: 'Status Updates', desc: 'Table status updates automatically as sessions progress' },
                { step: '5', title: 'Availability', desc: 'Instantly see which tables are available for new customers' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400 font-bold flex-shrink-0">{item.step}</div>
                  <div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-zinc-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Benefits</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="p-6 bg-zinc-800/50 border-zinc-700">
                <Eye className="w-8 h-8 text-teal-400 mb-4" />
                <h3 className="font-semibold mb-2">Full Visibility</h3>
                <p className="text-zinc-400 text-sm">See your entire lounge status at a glance</p>
              </Card>
              <Card className="p-6 bg-zinc-800/50 border-zinc-700">
                <Zap className="w-8 h-8 text-teal-400 mb-4" />
                <h3 className="font-semibold mb-2">Faster Seating</h3>
                <p className="text-zinc-400 text-sm">Quickly identify and assign available tables</p>
              </Card>
              <Card className="p-6 bg-zinc-800/50 border-zinc-700">
                <Users className="w-8 h-8 text-teal-400 mb-4" />
                <h3 className="font-semibold mb-2">Better Service</h3>
                <p className="text-zinc-400 text-sm">Staff knows exactly where each customer is seated</p>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="p-8 bg-gradient-to-r from-teal-900/30 to-cyan-900/30 border-teal-500/30">
              <h2 className="text-3xl font-bold mb-4">Ready to Optimize Your Tables?</h2>
              <p className="text-zinc-300 mb-8">See how Table Management can help you maximize seating efficiency.</p>
              <Button
                variant="primary"
                size="lg"
                onClick={() => window.open('https://ig.me/m/hookahplusnet', '_blank')}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
              >
                <Calendar className="w-5 h-5 mr-2" />
                15 min demo
              </Button>
            </Card>
          </div>
        </section>
      </div>
    </>
  );
}

