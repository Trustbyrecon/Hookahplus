'use client';

import React from 'react';
import Link from 'next/link';
import Card from '../../components/Card';
import { 
  FileText, 
  Calendar, 
  ArrowRight,
  Clock,
  Users,
  CreditCard
} from 'lucide-react';

const blogPosts = [
  {
    slug: 'square-great-payments-hookah-lounges-struggle',
    title: 'Square Is Great at Payments. Why Hookah Lounges Still Struggle After Checkout.',
    excerpt: 'Square handles payments perfectly. But hookah lounges need session timing, customer memory, and shift handoff—capabilities Square doesn\'t provide. Here\'s why operations software sits above your POS.',
    date: '2025-01-25',
    readTime: '8 min read',
    category: 'Operations',
    icon: <CreditCard className="w-5 h-5" />
  },
  {
    slug: 'session-timing-runs-hookah-lounge',
    title: 'Why Session Timing, Not Transactions, Runs a Hookah Lounge',
    excerpt: 'Hookah lounges sell time, not products. Session timing—tracking duration, managing extensions, optimizing turnover—is what drives revenue. Here\'s why timing software matters more than transaction software.',
    date: '2025-01-25',
    readTime: '7 min read',
    category: 'Operations',
    icon: <Clock className="w-5 h-5" />
  },
  {
    slug: 'loyalty-remembering-people-not-points',
    title: 'Loyalty Isn\'t Points. It\'s Remembering People.',
    excerpt: 'Points-based loyalty programs are transactions. Real loyalty is remembering customer preferences, flavor mixes, and behavioral patterns across visits. Here\'s why customer memory matters more than points.',
    date: '2025-01-25',
    readTime: '9 min read',
    category: 'Customer Experience',
    icon: <Users className="w-5 h-5" />
  }
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-zinc-800">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Hookah+ Blog
            </span>
          </h1>
          <p className="text-xl text-zinc-300 mb-8 max-w-2xl mx-auto">
            Insights on hookah lounge operations, customer experience, and building profitable lounges.
          </p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {blogPosts.map((post) => (
              <Card 
                key={post.slug}
                className="p-6 bg-zinc-800/50 border-zinc-700 hover:border-teal-500/50 transition-all duration-300"
              >
                <Link href={`/blog/${post.slug}`}>
                  <div className="flex items-start gap-4">
                    <div className="text-teal-400 mt-1">
                      {post.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">
                          {post.category}
                        </span>
                        <span className="text-zinc-500">•</span>
                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <span className="text-zinc-500">•</span>
                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                          <Clock className="w-4 h-4" />
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-3 hover:text-teal-400 transition-colors">
                        {post.title}
                      </h2>
                      <p className="text-zinc-300 mb-4 leading-relaxed">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center gap-2 text-teal-400 font-medium group">
                        <span>Read more</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-zinc-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Transform Your Lounge?</h2>
          <p className="text-zinc-300 mb-8">
            Learn how Hookah+ works with your existing POS to add session management, customer memory, and loyalty.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/works-with-square"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-medium rounded-lg transition-all duration-300"
            >
              See How It Works With Square
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 px-6 py-3 border border-zinc-700 hover:border-teal-500/50 text-white font-medium rounded-lg transition-all duration-300"
            >
              Book a Demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

