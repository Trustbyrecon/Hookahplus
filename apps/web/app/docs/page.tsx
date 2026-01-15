'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DocumentationPage() {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [trustLockVerified, setTrustLockVerified] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@hookahplus.com';

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
            title: 'First Time Setup',
            content: '• Create your account\n• Set up payment method\n• Configure preferences\n• Start your first session'
          }
        ]
      }
    },
    {
      id: 'user-guide',
      title: 'User Guide',
      icon: '📖',
      content: {
        overview: 'Complete user guide for all Hookah+ features and functionality.',
        sections: [
          {
            title: 'Session Management',
            content: '• Starting a new session\n• Managing active sessions\n• Ending sessions\n• Session history'
          },
          {
            title: 'Flavor Selection',
            content: '• Browse available flavors\n• Create custom mixes\n• Save favorite combinations\n• Share with friends'
          },
          {
            title: 'Payment & Billing',
            content: '• Secure payment processing\n• Billing history\n• Refund requests\n• Payment methods'
          }
        ]
      }
    },
    {
      id: 'api-reference',
      title: 'API Reference',
      icon: '🔌',
      content: {
        overview: 'Complete API reference for developers and integrators.',
        sections: [
          {
            title: 'Authentication',
            content: '• API keys\n• OAuth 2.0\n• Rate limiting\n• Security best practices'
          },
          {
            title: 'Endpoints',
            content: '• Sessions API\n• Users API\n• Payments API\n• Analytics API'
          },
          {
            title: 'Webhooks',
            content: '• Event types\n• Payload structure\n• Retry logic\n• Security verification'
          }
        ]
      }
    },
    {
      id: 'square-integration',
      title: 'Square POS Integration',
      icon: '🧾',
      content: {
        overview: 'Connect Square to sync Hookah+ sessions into Square Orders and keep status up to date via webhooks.',
        sections: [
          {
            title: 'Connect Square (OAuth)',
            content:
              '1. Ask your admin for your loungeId\n2. Visit /api/integrations/square/oauth/start?loungeId=YOUR_LOUNGE_ID\n3. Approve requested permissions in Square\n4. You should see an “ok: true” response with merchantId and locationId'
          },
          {
            title: 'Connection Check',
            content:
              'Use /api/integrations/square/connection-check?loungeId=YOUR_LOUNGE_ID\n\nIf this fails:\n• Reconnect Square\n• Confirm APP_BASE_URL matches your deployed domain\n• Confirm SQUARE_ENV is correct (sandbox vs production)'
          },
          {
            title: 'Order Creation + Status Sync',
            content:
              'When FOH closes a session, Hookah+ creates a Square Order (idempotent).\n\nSquare webhooks then update Hookah+ status for:\n• Paid\n• Refunded\n• Canceled/Void'
          },
          {
            title: 'Disconnect / Uninstall',
            content:
              'POST /api/integrations/square/disconnect with JSON body: { \"loungeId\": \"...\" }\n\nThis revokes Square authorization (best-effort) and removes the local connection.'
          }
        ]
      }
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: '🔧',
      content: {
        overview: 'Common issues and solutions to help you resolve problems quickly.',
        sections: [
          {
            title: 'Common Issues',
            content: '• Session not starting\n• Payment failures\n• Connection problems\n• App crashes'
          },
          {
            title: 'Error Codes',
            content: '• HTTP status codes\n• Custom error codes\n• Error messages\n• Resolution steps'
          },
          {
            title: 'Support',
            content: `• Contact support: ${supportEmail}\n• Include loungeId, merchantId (if known), and recent timestamps\n• Share the error message shown in the API response`
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
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Trust-Lock Verification Required</h2>
          <p className="text-gray-300 mb-6">
            Please complete Trust-Lock verification to access the documentation.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Retry Verification
          </button>
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
          {/* Navigation */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {documentationSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeSection === section.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/20 text-gray-300 hover:bg-white/30'
                }`}
              >
                <span className="mr-2">{section.icon}</span>
                {section.title}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
            {filteredSections.map((section) => (
              activeSection === section.id && (
                <div key={section.id}>
                  <div className="flex items-center mb-6">
                    <span className="text-3xl mr-4">{section.icon}</span>
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-2">{section.title}</h2>
                      <p className="text-gray-300 text-lg">{section.content.overview}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {section.content.sections.map((subsection, index) => (
                      <div key={index} className="bg-white/10 rounded-lg p-6 border border-white/20">
                        <h3 className="text-xl font-semibold text-white mb-3">{subsection.title}</h3>
                        <div className="text-gray-300 whitespace-pre-line">{subsection.content}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>

          {/* Quick Links */}
          <div className="mt-12 text-center">
            <h3 className="text-2xl font-bold text-white mb-6">Quick Links</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/support"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                🎫 Support Center
              </Link>
              <Link
                href="/api-docs"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                🔌 API Documentation
              </Link>
              <Link
                href="/dashboard"
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                📊 Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
