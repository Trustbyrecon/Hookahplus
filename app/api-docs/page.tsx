'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function APIDocumentationPage() {
  const [trustLockVerified, setTrustLockVerified] = useState(false);
  const [activeEndpoint, setActiveEndpoint] = useState('sessions');

  useEffect(() => {
    // Trust-Lock verification for API documentation access
    const verifyTrustLock = async () => {
      try {
        const response = await fetch('/api/trust-lock/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'api_docs_access',
            context: 'api_documentation'
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

  const apiEndpoints = [
    {
      id: 'sessions',
      title: 'Sessions API',
      description: 'Manage hookah sessions',
      methods: [
        {
          method: 'POST',
          path: '/api/sessions',
          description: 'Create a new session',
          requestBody: {
            tableId: 'string',
            flavorMix: 'object',
            customerPhone: 'string (optional)'
          },
          response: {
            success: 'boolean',
            data: {
              sessionId: 'string',
              status: 'string',
              createdAt: 'string'
            }
          }
        },
        {
          method: 'GET',
          path: '/api/sessions/{id}',
          description: 'Get session details',
          response: {
            success: 'boolean',
            data: {
              sessionId: 'string',
              status: 'string',
              tableId: 'string',
              flavorMix: 'object',
              createdAt: 'string',
              updatedAt: 'string'
            }
          }
        },
        {
          method: 'PUT',
          path: '/api/sessions/{id}',
          description: 'Update session status',
          requestBody: {
            status: 'string',
            metadata: 'object (optional)'
          },
          response: {
            success: 'boolean',
            data: {
              sessionId: 'string',
              status: 'string',
              updatedAt: 'string'
            }
          }
        }
      ]
    },
    {
      id: 'payments',
      title: 'Payments API',
      description: 'Handle payment processing',
      methods: [
        {
          method: 'POST',
          path: '/api/payments/create-intent',
          description: 'Create payment intent',
          requestBody: {
            amount: 'number',
            currency: 'string',
            sessionId: 'string'
          },
          response: {
            success: 'boolean',
            data: {
              clientSecret: 'string',
              paymentIntentId: 'string'
            }
          }
        },
        {
          method: 'POST',
          path: '/api/payments/confirm',
          description: 'Confirm payment',
          requestBody: {
            paymentIntentId: 'string',
            sessionId: 'string'
          },
          response: {
            success: 'boolean',
            data: {
              status: 'string',
              amount: 'number',
              currency: 'string'
            }
          }
        }
      ]
    },
    {
      id: 'analytics',
      title: 'Analytics API',
      description: 'Retrieve analytics data',
      methods: [
        {
          method: 'GET',
          path: '/api/analytics/sessions',
          description: 'Get session analytics',
          queryParams: {
            startDate: 'string (ISO date)',
            endDate: 'string (ISO date)',
            venueId: 'string (optional)'
          },
          response: {
            success: 'boolean',
            data: {
              totalSessions: 'number',
              activeSessions: 'number',
              revenue: 'number',
              averageSessionTime: 'number'
            }
          }
        },
        {
          method: 'GET',
          path: '/api/analytics/revenue',
          description: 'Get revenue analytics',
          queryParams: {
            period: 'string (daily|weekly|monthly)',
            venueId: 'string (optional)'
          },
          response: {
            success: 'boolean',
            data: {
              totalRevenue: 'number',
              periodRevenue: 'number',
              growthRate: 'number',
              topFlavors: 'array'
            }
          }
        }
      ]
    },
    {
      id: 'admin',
      title: 'Admin API',
      description: 'Administrative functions',
      methods: [
        {
          method: 'GET',
          path: '/api/admin/venues',
          description: 'Get all venues',
          response: {
            success: 'boolean',
            data: {
              venues: 'array',
              totalCount: 'number'
            }
          }
        },
        {
          method: 'POST',
          path: '/api/admin/venues',
          description: 'Create new venue',
          requestBody: {
            name: 'string',
            address: 'string',
            capacity: 'number',
            settings: 'object'
          },
          response: {
            success: 'boolean',
            data: {
              venueId: 'string',
              name: 'string',
              createdAt: 'string'
            }
          }
        }
      ]
    }
  ];

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
            Please complete Trust-Lock verification to access API documentation.
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
        </div>
      </div>
    );
  }

  const currentEndpoint = apiEndpoints.find(ep => ep.id === activeEndpoint);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">API Documentation</h1>
          <p className="text-gray-300 text-lg mb-6">
            Complete API reference for Hookah+ developers
          </p>
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-green-400 text-sm">Trust-Lock Verified</span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-white mb-4">Endpoints</h3>
                <nav className="space-y-2">
                  {apiEndpoints.map((endpoint) => (
                    <button
                      key={endpoint.id}
                      onClick={() => setActiveEndpoint(endpoint.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                        activeEndpoint === endpoint.id
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      {endpoint.title}
                    </button>
                  ))}
                </nav>

                {/* Authentication Info */}
                <div className="mt-8 p-4 bg-yellow-500/20 rounded-lg">
                  <h4 className="text-yellow-400 font-semibold mb-2">Authentication</h4>
                  <p className="text-yellow-200 text-sm">
                    All API requests require Trust-Lock verification. Include the verification token in your requests.
                  </p>
                </div>

                {/* Base URL */}
                <div className="mt-4 p-4 bg-blue-500/20 rounded-lg">
                  <h4 className="text-blue-400 font-semibold mb-2">Base URL</h4>
                  <code className="text-blue-200 text-sm">https://hookahplus.net/api</code>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
                {currentEndpoint && (
                  <div>
                    <div className="mb-6">
                      <h2 className="text-3xl font-bold text-white mb-2">{currentEndpoint.title}</h2>
                      <p className="text-gray-300 text-lg">{currentEndpoint.description}</p>
                    </div>

                    <div className="space-y-8">
                      {currentEndpoint.methods.map((method, index) => (
                        <div key={index} className="bg-white/5 rounded-lg p-6">
                          <div className="flex items-center mb-4">
                            <span className={`px-3 py-1 rounded text-sm font-bold mr-4 ${
                              method.method === 'GET' ? 'bg-green-600' :
                              method.method === 'POST' ? 'bg-blue-600' :
                              method.method === 'PUT' ? 'bg-yellow-600' :
                              method.method === 'DELETE' ? 'bg-red-600' : 'bg-gray-600'
                            }`}>
                              {method.method}
                            </span>
                            <code className="text-white text-lg">{method.path}</code>
                          </div>

                          <p className="text-gray-300 mb-4">{method.description}</p>

                          {/* Request Body */}
                          {method.requestBody && (
                            <div className="mb-4">
                              <h4 className="text-white font-semibold mb-2">Request Body</h4>
                              <div className="bg-black/30 rounded p-4">
                                <pre className="text-green-400 text-sm overflow-x-auto">
                                  {JSON.stringify(method.requestBody, null, 2)}
                                </pre>
                              </div>
                            </div>
                          )}

                          {/* Query Parameters */}
                          {method.queryParams && (
                            <div className="mb-4">
                              <h4 className="text-white font-semibold mb-2">Query Parameters</h4>
                              <div className="bg-black/30 rounded p-4">
                                <pre className="text-blue-400 text-sm overflow-x-auto">
                                  {JSON.stringify(method.queryParams, null, 2)}
                                </pre>
                              </div>
                            </div>
                          )}

                          {/* Response */}
                          {method.response && (
                            <div>
                              <h4 className="text-white font-semibold mb-2">Response</h4>
                              <div className="bg-black/30 rounded p-4">
                                <pre className="text-yellow-400 text-sm overflow-x-auto">
                                  {JSON.stringify(method.response, null, 2)}
                                </pre>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Code Examples */}
        <div className="max-w-4xl mx-auto mt-12">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Code Examples</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* JavaScript Example */}
              <div className="bg-black/30 rounded-lg p-6">
                <h4 className="text-white font-semibold mb-4">JavaScript (Fetch)</h4>
                <pre className="text-green-400 text-sm overflow-x-auto">
{`// Create a new session
const response = await fetch('/api/sessions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Trust-Lock-Token': 'your-token'
  },
  body: JSON.stringify({
    tableId: 'T-001',
    flavorMix: {
      primary: 'Blue Mist',
      secondary: 'Mint'
    }
  })
});

const data = await response.json();
console.log(data);`}
                </pre>
              </div>

              {/* cURL Example */}
              <div className="bg-black/30 rounded-lg p-6">
                <h4 className="text-white font-semibold mb-4">cURL</h4>
                <pre className="text-blue-400 text-sm overflow-x-auto">
{`curl -X POST https://hookahplus.net/api/sessions \\
  -H "Content-Type: application/json" \\
  -H "X-Trust-Lock-Token: your-token" \\
  -d '{
    "tableId": "T-001",
    "flavorMix": {
      "primary": "Blue Mist",
      "secondary": "Mint"
    }
  }'`}
                </pre>
              </div>
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
