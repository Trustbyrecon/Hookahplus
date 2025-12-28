'use client';

import React from 'react';
import { SoftwareApplicationSchema } from '../../components/SchemaMarkup';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Link from 'next/link';
import { 
  TrendingUp, 
  CheckCircle, 
  Calendar,
  Clock,
  BarChart3,
  ArrowRight
} from 'lucide-react';

export default function PeakHourManagementPage() {
  const description = "Hookah+ Peak Hour Management helps you handle busy periods efficiently. Dynamic pricing, session timing controls, and capacity management tools to maximize revenue during peak hours.";
  const url = process.env.NEXT_PUBLIC_SITE_URL 
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/peak-hour-management`
    : "https://hookahplus.net/peak-hour-management";

  return (
    <>
      <SoftwareApplicationSchema 
        name="Peak Hour Management"
        description={description}
        url={url}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
        <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-zinc-800">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Peak Hour Management</h1>
            <p className="text-xl text-zinc-300 mb-8 leading-relaxed">{description}</p>

            <Card className="p-6 bg-zinc-800/50 border-zinc-700 mb-8">
              <h2 className="text-xl font-bold mb-4">Peak Hour Features</h2>
              <ul className="space-y-3 text-zinc-300">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div><strong className="text-white">Dynamic Pricing:</strong> Automatically adjust prices during peak hours</div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div><strong className="text-white">Session Limits:</strong> Set maximum session duration during busy periods</div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div><strong className="text-white">Capacity Alerts:</strong> Get notified when approaching capacity</div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div><strong className="text-white">Waitlist Management:</strong> Handle overflow with intelligent waitlist</div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div><strong className="text-white">Analytics:</strong> Track peak hour performance and optimize</div>
                </li>
              </ul>
            </Card>
          </div>
        </section>

        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-zinc-900/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">How Peak Hour Management Works</h2>
            <div className="space-y-4">
              {[
                { step: '1', title: 'Peak Detection', desc: 'System identifies peak hours based on historical data' },
                { step: '2', title: 'Auto-Adjustments', desc: 'Pricing and timing rules activate automatically' },
                { step: '3', title: 'Capacity Monitoring', desc: 'Real-time tracking of table occupancy' },
                { step: '4', title: 'Optimization', desc: 'System suggests actions to maximize revenue' },
                { step: '5', title: 'Post-Peak Analysis', desc: 'Review performance and adjust strategies' }
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
                <TrendingUp className="w-8 h-8 text-teal-400 mb-4" />
                <h3 className="font-semibold mb-2">Maximize Revenue</h3>
                <p className="text-zinc-400 text-sm">Optimize pricing and turnover during peak hours</p>
              </Card>
              <Card className="p-6 bg-zinc-800/50 border-zinc-700">
                <BarChart3 className="w-8 h-8 text-teal-400 mb-4" />
                <h3 className="font-semibold mb-2">Data-Driven</h3>
                <p className="text-zinc-400 text-sm">Make decisions based on actual peak hour patterns</p>
              </Card>
              <Card className="p-6 bg-zinc-800/50 border-zinc-700">
                <Clock className="w-8 h-8 text-teal-400 mb-4" />
                <h3 className="font-semibold mb-2">Reduce Stress</h3>
                <p className="text-zinc-400 text-sm">Automated controls handle busy periods smoothly</p>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="p-8 bg-gradient-to-r from-teal-900/30 to-cyan-900/30 border-teal-500/30">
              <h2 className="text-3xl font-bold mb-4">Ready to Master Peak Hours?</h2>
              <p className="text-zinc-300 mb-8">See how Peak Hour Management can optimize your busiest periods.</p>
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

