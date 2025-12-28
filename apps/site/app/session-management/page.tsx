'use client';

import React from 'react';
import { SoftwareApplicationSchema } from '../../components/SchemaMarkup';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Link from 'next/link';
import { 
  PlayCircle, 
  CheckCircle, 
  Calendar,
  Clock,
  Timer,
  ArrowRight
} from 'lucide-react';

export default function SessionManagementPage() {
  const description = "Hookah+ Session Management provides complete control over hookah sessions from start to finish. Track timing, manage extensions, monitor table status, and optimize revenue per session.";
  const url = process.env.NEXT_PUBLIC_SITE_URL 
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/session-management`
    : "https://hookahplus.net/session-management";

  return (
    <>
      <SoftwareApplicationSchema 
        name="Session Management"
        description={description}
        url={url}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
        <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-zinc-800">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Session Management</h1>
            <p className="text-xl text-zinc-300 mb-8 leading-relaxed">{description}</p>

            <Card className="p-6 bg-zinc-800/50 border-zinc-700 mb-8">
              <h2 className="text-xl font-bold mb-4">Core Capabilities</h2>
              <ul className="space-y-3 text-zinc-300">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div><strong className="text-white">Session Timing:</strong> Real-time timers track session duration</div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div><strong className="text-white">Table Management:</strong> Assign sessions to tables and track occupancy</div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div><strong className="text-white">Extensions:</strong> Allow customers to extend sessions seamlessly</div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div><strong className="text-white">State Management:</strong> Track session states (pending, active, paused, closed)</div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div><strong className="text-white">Analytics:</strong> Session duration, revenue per session, peak time analysis</div>
                </li>
              </ul>
            </Card>
          </div>
        </section>

        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-zinc-900/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Session Lifecycle</h2>
            <div className="space-y-4">
              {[
                { step: '1', title: 'Session Created', desc: 'Session created from pre-order, walk-in, or reservation' },
                { step: '2', title: 'Payment Confirmed', desc: 'Payment processed, session moves to active state' },
                { step: '3', title: 'Timer Started', desc: 'Hookah delivered, timer begins tracking duration' },
                { step: '4', title: 'Active Session', desc: 'Real-time tracking of session duration and status' },
                { step: '5', title: 'Extension (Optional)', desc: 'Customer can extend session before time expires' },
                { step: '6', title: 'Session Closed', desc: 'Session ends, data saved, table marked available' }
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
            <h2 className="text-2xl font-bold mb-6">Related Features</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Link href="/session-timing">
                <Card className="p-6 bg-zinc-800/50 border-zinc-700 hover:border-teal-500/50 transition-colors cursor-pointer">
                  <Timer className="w-8 h-8 text-teal-400 mb-4" />
                  <h3 className="font-semibold mb-2">Session Timing</h3>
                  <p className="text-zinc-400 text-sm mb-2">Learn about real-time session timers</p>
                  <ArrowRight className="w-4 h-4 text-teal-400" />
                </Card>
              </Link>
              <Link href="/table-management">
                <Card className="p-6 bg-zinc-800/50 border-zinc-700 hover:border-teal-500/50 transition-colors cursor-pointer">
                  <Clock className="w-8 h-8 text-teal-400 mb-4" />
                  <h3 className="font-semibold mb-2">Table Management</h3>
                  <p className="text-zinc-400 text-sm mb-2">Explore table assignment and tracking</p>
                  <ArrowRight className="w-4 h-4 text-teal-400" />
                </Card>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="p-8 bg-gradient-to-r from-teal-900/30 to-cyan-900/30 border-teal-500/30">
              <h2 className="text-3xl font-bold mb-4">Ready to Manage Your Sessions?</h2>
              <p className="text-zinc-300 mb-8">See how Session Management can optimize your operations.</p>
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

