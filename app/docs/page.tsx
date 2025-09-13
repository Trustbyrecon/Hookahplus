'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DocumentationPage() {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [trustLockVerified, setTrustLockVerified] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Trust-Lock verification for documentation access
    const verifyTrustLock = async () => {
      try {
        const response = await fetch('/api/trust-lock/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'docs_access',
            context: 'documentation'
          })
        });
        
        if (response.ok) {
          setTrustLockVerified(true);
        }
      } catch (error) {
        console.error('Trust-Lock verification failed:', error);
      }
    };

    verifyTrustLock();
  }, []);

  const documentationSections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: '🚀',
      content: {
        overview: 'Welcome to Hookah+ documentation. This guide will help you get started with our platform.',
        sections: [
          {
            title: 'Quick Start',
            content: '1. Scan QR code at your table\n2. Select flavor mix\n3. Complete payment\n4. Enjoy your session!'
          },
          {
            title: 'System Requirements',
            content: '• Modern web browser (Chrome, Firefox, Safari, Edge)\n• JavaScript enabled\n• Internet connection\n• Mobile device recommended'
          },
          {
            title: 'Trust-Lock Security',
            content: 'All operations are protected by Trust-Lock verification to ensure secure transactions and data protection.'
          }
        ]
      }
    },
    {
      id: 'user-guide',
      title: 'User Guide',
      icon: '👤',
      content: {
        overview: 'Complete guide for customers using Hookah+',
        sections: [
          {
            title: 'Starting a Session',
            content: 'Navigate to your table and scan the QR code. Select your preferred flavor combination and complete the secure payment process.'
          },
          {
            title: 'Managing Your Session',
            content: 'Use the dashboard to monitor your session, request additional charcoal, or extend your session time.'
          },
          {
            title: 'Payment Methods',
            content: 'We accept all major credit cards, Apple Pay, Google Pay, and digital wallets through our secure Stripe integration.'
          },
          {
            title: 'Troubleshooting',
            content: 'If you experience issues, contact support immediately. We monitor all sessions and can provide real-time assistance.'
          }
        ]
      }
    },
    {
      id: 'staff-guide',
      title: 'Staff Guide',
      icon: '👥',
      content: {
        overview: 'Guide for staff members managing Hookah+ operations',
        sections: [
          {
            title: 'Staff Panel Access',
            content: 'Access the staff panel through the admin dashboard. All staff actions require Trust-Lock verification.'
          },
          {
            title: 'Session Management',
            content: 'Monitor active sessions, update status, and manage customer requests through the real-time dashboard.'
          },
          {
            title: 'Customer Support',
            content: 'Use the integrated support tools to assist customers and resolve issues quickly.'
          },
          {
            title: 'Analytics & Reporting',
            content: 'Access detailed analytics on session performance, customer satisfaction, and operational metrics.'
          }
        ]
      }
    },
    {
      id: 'api-documentation',
      title: 'API Documentation',
      icon: '🔌',
      content: {
        overview: 'Complete API reference for developers',
        sections: [
          {
            title: 'Authentication',
            content: 'All API endpoints require Trust-Lock verification. Include the verification token in your requests.'
          },
          {
            title: 'Base URL',
            content: 'https://hookahplus.net/api'
          },
          {
            title: 'Endpoints',
            content: '• POST /sessions - Create new session\n• GET /sessions/{id} - Get session details\n• PUT /sessions/{id} - Update session\n• DELETE /sessions/{id} - Cancel session'
          },
          {
            title: 'Rate Limiting',
            content: 'API requests are limited to 100 requests per minute per IP address.'
          }
        ]
      }
    },
    {
      id: 'admin-guide',
      title: 'Admin Guide',
      icon: '⚙️',
      content: {
        overview: 'Administrative functions and system management',
        sections: [
          {
            title: 'Admin Control Center',
            content: 'Access comprehensive admin controls for managing venues, users, and system settings.'
          },
          {
            title: 'Reflex Agent Monitoring',
            content: 'Monitor and manage the Reflex Agent system for automated operations and decision making.'
          },
          {
            title: 'Analytics Dashboard',
            content: 'View detailed analytics on revenue, customer behavior, and system performance.'
          },
          {
            title: 'System Configuration',
            content: 'Configure system settings, manage integrations, and control feature flags.'
          }
        ]
      }
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: '🔧',
      content: {
        overview: 'Common issues and solutions',
        sections: [
          {
            title: 'Payment Issues',
            content: 'If payment fails, check your card details and ensure sufficient funds. Contact support if issues persist.'
          },
          {
            title: 'Session Not Starting',
            content: 'Verify your internet connection and try refreshing the page. Contact staff if the issue continues.'
          },
          {
            title: 'Trust-Lock Verification Failed',
            content: 'Ensure you have a stable internet connection and try again. Contact support if verification consistently fails.'
          },
          {
            title: 'Mobile App Issues',
            content: 'Clear your browser cache and cookies, then try again. Ensure you are using a supported browser.'
          }
        ]
      }
    }
  ];

  const filteredSections = documentationSections.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.content.overview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!trustLockVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Trust-Lock Verification Required</h2>
          <p className="text-gray-300 mb-6">
            Please complete Trust-Lock verification to access our documentation.
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Documentation</h1>
          <p className="text-gray-300 text-lg mb-6">
            Complete guides and API reference for Hookah+
          </p>
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-green-400 text-sm">Trust-Lock Verified</span>
          </div>
          
          {/* Search */}
          <div className="max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-white mb-4">Sections</h3>
                <nav className="space-y-2">
                  {documentationSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                        activeSection === section.id
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      <span className="mr-2">{section.icon}</span>
                      {section.title}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
                {filteredSections.map((section) => (
                  activeSection === section.id && (
                    <div key={section.id}>
                      <div className="flex items-center mb-6">
                        <span className="text-3xl mr-4">{section.icon}</span>
                        <h2 className="text-3xl font-bold text-white">{section.title}</h2>
                      </div>
                      
                      <div className="prose prose-invert max-w-none">
                        <p className="text-gray-300 text-lg mb-8">{section.content.overview}</p>
                        
                        <div className="space-y-6">
                          {section.content.sections.map((subsection, index) => (
                            <div key={index} className="bg-white/5 rounded-lg p-6">
                              <h3 className="text-xl font-semibold text-white mb-3">{subsection.title}</h3>
                              <div className="text-gray-300 whitespace-pre-line">{subsection.content}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="max-w-4xl mx-auto mt-12">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Quick Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                href="/support"
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-lg transition-colors text-center"
              >
                <div className="text-2xl mb-2">🎫</div>
                Support Center
              </Link>
              <Link
                href="/api-docs"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-colors text-center"
              >
                <div className="text-2xl mb-2">🔌</div>
                API Reference
              </Link>
              <Link
                href="/dashboard"
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition-colors text-center"
              >
                <div className="text-2xl mb-2">📊</div>
                Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="text-center mt-12">
          <Link
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-medium rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
