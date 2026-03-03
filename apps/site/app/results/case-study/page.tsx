'use client';

import React from 'react';
import { motion } from 'framer-motion';
import PageHero from '../../../components/PageHero';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import { 
  ArrowRight,
  ArrowLeft,
  Download,
  TrendingUp,
  Clock,
  Users,
  DollarSign,
  CheckCircle
} from 'lucide-react';

export default function CaseStudyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <PageHero
        headline="Case Study: How Hookah+ Transformed Night Operations"
        subheadline="A real-world look at how one lounge increased revenue, improved service speed, and reduced operational chaos."
      />

      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Back Link */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => window.location.href = '/results'}
            className="text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Results
          </Button>
        </div>

        {/* Problem Section */}
        <section className="mb-16">
          <Card className="border-red-500/30 bg-red-500/5">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-white mb-6">The Problem</h2>
              <div className="space-y-4 text-zinc-300">
                <p>
                  A mid-size hookah lounge in a major city was struggling with several operational challenges:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span>Manual timers were inconsistent, leading to revenue disputes and guest complaints</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span>Staff couldn't remember guest flavor preferences, reducing repeat visits</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span>No visibility into which tables or staff members were performing best</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span>Service flow was chaotic, with unclear handoffs between prep and floor staff</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span>Checkout process required manual entry into POS, creating bottlenecks</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </section>

        {/* Setup Section */}
        <section className="mb-16">
          <Card className="border-teal-500/30 bg-teal-500/5">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-white mb-6">The Setup</h2>
              <div className="space-y-4 text-zinc-300">
                <p>
                  The lounge implemented Hookah+ over a 2-week period:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span>Integrated with existing Square POS system</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span>Set up QR codes at all tables</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span>Trained staff on session tracking and flavor mix builder</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span>Configured lounge layout with tables and zones</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span>Enabled automatic session data sync to POS</span>
                  </li>
                </ul>
                <p className="pt-4">
                  <strong className="text-white">No hardware changes required.</strong> The entire setup used existing tablets and the lounge's current payment infrastructure.
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* Metrics Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Results After 3 Months</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="border-green-500/30 bg-green-500/5">
              <div className="p-6 text-center">
                <Clock className="w-8 h-8 text-green-400 mx-auto mb-4" />
                <div className="text-4xl font-bold text-green-400 mb-2">↓ 35%</div>
                <div className="text-lg font-semibold text-white mb-1">Avg order time</div>
                <div className="text-sm text-zinc-400">Faster service delivery</div>
              </div>
            </Card>
            <Card className="border-teal-500/30 bg-teal-500/5">
              <div className="p-6 text-center">
                <Users className="w-8 h-8 text-teal-400 mx-auto mb-4" />
                <div className="text-4xl font-bold text-teal-400 mb-2">↑ 28%</div>
                <div className="text-lg font-semibold text-white mb-1">Repeat rate</div>
                <div className="text-sm text-zinc-400">More returning guests</div>
              </div>
            </Card>
            <Card className="border-blue-500/30 bg-blue-500/5">
              <div className="p-6 text-center">
                <TrendingUp className="w-8 h-8 text-blue-400 mx-auto mb-4" />
                <div className="text-4xl font-bold text-blue-400 mb-2">↑ 22%</div>
                <div className="text-lg font-semibold text-white mb-1">Turns/night</div>
                <div className="text-sm text-zinc-400">Higher table utilization</div>
              </div>
            </Card>
            <Card className="border-green-500/30 bg-green-500/5">
              <div className="p-6 text-center">
                <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-4" />
                <div className="text-4xl font-bold text-green-400 mb-2">↑ 18%</div>
                <div className="text-lg font-semibold text-white mb-1">Revenue per table</div>
                <div className="text-sm text-zinc-400">Better session management</div>
              </div>
            </Card>
          </div>
        </section>

        {/* Outcomes Section */}
        <section className="mb-16">
          <Card className="border-zinc-700">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Key Outcomes</h2>
              <div className="space-y-4 text-zinc-300">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Eliminated timer disputes:</strong> Automatic session tracking removed all arguments about session duration and pricing.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Improved guest experience:</strong> Staff could instantly recall guest preferences, making "same as last time" a reality.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Better staff accountability:</strong> Clear visibility into which staff members handled which sessions improved performance.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Streamlined checkout:</strong> Automatic POS sync reduced checkout time by 40% and eliminated manual entry errors.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Data-driven decisions:</strong> Owner could see which tables, zones, and flavor mixes generated the most revenue.
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Owner Quote */}
        <section className="mb-16">
          <Card className="border-teal-500/30 bg-teal-500/5">
            <div className="p-8">
              <blockquote className="text-xl text-zinc-300 italic mb-4">
                "Hookah+ transformed how we run our nights. We went from constant timer disputes and guessing games to a smooth, automated flow. Our staff loves it, our guests notice the difference, and our revenue shows it."
              </blockquote>
              <div className="text-zinc-400">
                — Lounge Owner, 3-month Hookah+ user
              </div>
            </div>
          </Card>
        </section>

        {/* CTAs */}
        <section className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="primary"
            size="lg"
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-8 py-4"
            onClick={() => window.location.href = '/onboarding'}
          >
            Book 15-min Demo
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-teal-500/50 text-teal-400 hover:bg-teal-500/10 hover:border-teal-400 px-8 py-4"
            onClick={() => {
              // Could trigger a download of a PDF case study
              window.location.href = '/results/case-study/download';
            }}
          >
            <Download className="w-5 h-5 mr-2" />
            Download Full Case Study
          </Button>
        </section>
      </div>
    </div>
  );
}

