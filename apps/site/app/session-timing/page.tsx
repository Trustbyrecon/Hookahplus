'use client';

import React from 'react';
import { SoftwareApplicationSchema } from '../../components/SchemaMarkup';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Link from 'next/link';
import { 
  Clock, 
  CheckCircle, 
  ArrowRight,
  Timer,
  TrendingUp,
  Calendar,
  BarChart3,
  DollarSign
} from 'lucide-react';

export default function SessionTimingPage() {
  const description = "Hookah+ Session Timing tracks time, not just transactions. It monitors session duration, manages table turnover, and optimizes revenue per table through intelligent timing management.";
  const url = process.env.NEXT_PUBLIC_SITE_URL 
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/session-timing`
    : "https://hookahplus.net/session-timing";

  return (
    <>
      <SoftwareApplicationSchema 
        name="Session Timing"
        description={description}
        url={url}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
        <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-zinc-800">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Session Timing</h1>
            <p className="text-xl text-zinc-300 mb-8 leading-relaxed">{description}</p>

            <Card className="p-6 bg-gradient-to-r from-teal-900/20 to-cyan-900/20 border-teal-500/30 mb-8">
              <p className="text-2xl font-semibold text-center">"Track time, not just transactions."</p>
            </Card>

            <Card className="p-6 bg-zinc-800/50 border-zinc-700 mb-8">
              <h2 className="text-xl font-bold mb-4">Key Features</h2>
              <ul className="space-y-3 text-zinc-300">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div><strong className="text-white">Real-Time Timers:</strong> Track active sessions with live countdown timers</div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div><strong className="text-white">Table Turnover:</strong> Optimize revenue by managing session duration and table availability</div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div><strong className="text-white">Peak Hour Management:</strong> Handle busy periods with intelligent timing controls</div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div><strong className="text-white">Session Extensions:</strong> Allow customers to extend sessions seamlessly</div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div><strong className="text-white">Analytics:</strong> Track average session duration, peak times, and revenue per table</div>
                </li>
              </ul>
            </Card>
          </div>
        </section>

        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-zinc-900/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">How Session Timing Works</h2>
            <div className="space-y-4">
              {[
                { step: '1', title: 'Session Start', desc: 'Timer begins when hookah is delivered to table' },
                { step: '2', title: 'Live Tracking', desc: 'Real-time countdown shows remaining session time' },
                { step: '3', title: 'Extension Options', desc: 'Customers can extend sessions before time expires' },
                { step: '4', title: 'Session End', desc: 'Timer stops when session closes, data saved for analytics' },
                { step: '5', title: 'Table Ready', desc: 'Table marked available for next customer' }
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
                <h3 className="font-semibold mb-2">Higher Revenue</h3>
                <p className="text-zinc-400 text-sm">Optimize table turnover to maximize revenue per table per day</p>
              </Card>
              <Card className="p-6 bg-zinc-800/50 border-zinc-700">
                <BarChart3 className="w-8 h-8 text-teal-400 mb-4" />
                <h3 className="font-semibold mb-2">Data-Driven</h3>
                <p className="text-zinc-400 text-sm">Analytics show peak times, average duration, and optimization opportunities</p>
              </Card>
              <Card className="p-6 bg-zinc-800/50 border-zinc-700">
                <DollarSign className="w-8 h-8 text-teal-400 mb-4" />
                <h3 className="font-semibold mb-2">Better Planning</h3>
                <p className="text-zinc-400 text-sm">Forecast demand and optimize staffing based on timing data</p>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="p-8 bg-gradient-to-r from-teal-900/30 to-cyan-900/30 border-teal-500/30">
              <h2 className="text-3xl font-bold mb-4">Ready to Optimize Your Sessions?</h2>
              <p className="text-zinc-300 mb-8">See how Session Timing can help you maximize revenue per table.</p>
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

