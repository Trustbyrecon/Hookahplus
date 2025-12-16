'use client';

import React from 'react';
import Link from 'next/link';
import NewsletterSignup from '../components/NewsletterSignup';
import { Mail, Phone, MapPin, Linkedin, Instagram } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-zinc-950 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">H+</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                HOOKAH+
              </span>
            </div>
            <p className="text-zinc-400 text-sm mb-4">
              The future of hookah lounge management with AI-powered personalization, secure payments, and seamless ordering experiences.
            </p>
            <div className="flex items-center gap-4 text-zinc-500">
              <a href="https://www.linkedin.com/company/hookahplus-net/?viewAsMember=true" target="_blank" rel="noopener noreferrer" className="hover:text-teal-400 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/hookahplusnet/" target="_blank" rel="noopener noreferrer" className="hover:text-teal-400 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/#how-it-works" className="text-zinc-400 hover:text-teal-400 transition-colors">
                  Overview
                </Link>
              </li>
              <li>
                <Link href="/sessions" className="text-zinc-400 hover:text-teal-400 transition-colors">
                  Sessions
                </Link>
              </li>
              <li>
                <Link href="/fire-session-dashboard" className="text-zinc-400 hover:text-teal-400 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-zinc-400 hover:text-teal-400 transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/docs" className="text-zinc-400 hover:text-teal-400 transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-zinc-400 hover:text-teal-400 transition-colors">
                  Support
                </Link>
              </li>
              <li>
                <Link href="/results/case-study" className="text-zinc-400 hover:text-teal-400 transition-colors">
                  Case Study
                </Link>
              </li>
              <li>
                <Link href="/#roi-calculator" className="text-zinc-400 hover:text-teal-400 transition-colors">
                  ROI Calculator
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="border-t border-zinc-800 pt-8 mb-8">
          <NewsletterSignup variant="inline" />
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-400 text-sm">
            © {currentYear} HookahPlus. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-zinc-400">
            <Link href="/privacy" className="hover:text-teal-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-teal-400 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

