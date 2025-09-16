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
            sessionId: 'string',
            message: 'string'
          }
        },
        {
          method: 'GET',
          path: '/api/sessions',
          description: 'Get all sessions',
          queryParams: {
            status: 'string (optional)',
            limit: 'number (optional)'
          },
          response: {
            sessions: 'array',
            total: 'number'
          }
        },
        {
          method: 'GET',
          path: '/api/sessions/[id]',
          description: 'Get specific session',
          response: {
            session: 'object',
            status: 'string'
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
          path: '/api/payments',
          description: 'Process payment',
          requestBody: {
            amount: 'number',
            currency: 'string',
            paymentMethodId: 'string'
          },
          response: {
            success: 'boolean',
            transactionId: 'string',
            status: 'string'
          }
        },
        {
          method: 'GET',
          path: '/api/payments/[id]',
          description: 'Get payment status',
          response: {
            payment: 'object',
            status: 'string'
          }
        }
      ]
    },
    {
      id: 'users',
      title: 'Users API',
      description: 'User management',
      methods: [
        {
          method: 'POST',
          path: '/api/users',
          description: 'Create user account',
          requestBody: {
            email: 'string',
            name: 'string',
            phone: 'string (optional)'
          },
          response: {
            success: 'boolean',
            userId: 'string',
            message: 'string'
          }
        },
        {
          method: 'GET',
          path: '/api/users/[id]',
          description: 'Get user profile',
          response: {
            user: 'object',
            preferences: 'object'
          }
        }
      ]
    }
  ];

  if (!trustLockVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Trust-Lock Verification Required</h2>
          <p className="text-gray-300 mb-6">
            Please complete Trust-Lock verification to access the API documentation.
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
          <h1 className="text-4xl font-bold text-white mb-4">API Documentation</h1>
          <p className="text-gray-300 text-lg mb-6">
            Complete API reference for developers and integrators
          </p>
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-green-400 text-sm">Trust-Lock Verified</span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* API Endpoints Navigation */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {apiEndpoints.map((endpoint) => (
              <button
                key={endpoint.id}
                onClick={() => setActiveEndpoint(endpoint.id)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeEndpoint === endpoint.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/20 text-gray-300 hover:bg-white/30'
                }`}
              >
                {endpoint.title}
              </button>
            ))}
          </div>

          {/* API Content */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
            {apiEndpoints.map((endpoint) => (
              activeEndpoint === endpoint.id && (
                <div key={endpoint.id}>
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-white mb-4">{endpoint.title}</h2>
                    <p className="text-gray-300 text-lg">{endpoint.description}</p>
                  </div>

                  <div className="space-y-8">
                    {endpoint.methods.map((method, index) => (
                      <div key={index} className="bg-white/10 rounded-lg p-6 border border-white/20">
                        <div className="flex items-center mb-4">
                          <span className={`px-3 py-1 rounded text-sm font-bold mr-4 ${
                            method.method === 'GET' ? 'bg-green-600 text-white' :
                            method.method === 'POST' ? 'bg-blue-600 text-white' :
                            method.method === 'PUT' ? 'bg-yellow-600 text-white' :
                            method.method === 'DELETE' ? 'bg-red-600 text-white' :
                            'bg-gray-600 text-white'
                          }`}>
                            {method.method}
                          </span>
                          <code className="text-purple-400 text-lg font-mono">{method.path}</code>
                        </div>
                        
                        <p className="text-gray-300 mb-4">{method.description}</p>
                        
                        {method.requestBody && (
                          <div className="mb-4">
                            <h4 className="text-white font-semibold mb-2">Request Body:</h4>
                            <pre className="bg-black/30 rounded p-4 text-green-400 text-sm overflow-x-auto">
                              {JSON.stringify(method.requestBody, null, 2)}
                            </pre>
                          </div>
                        )}
                        
                        {method.queryParams && (
                          <div className="mb-4">
                            <h4 className="text-white font-semibold mb-2">Query Parameters:</h4>
                            <pre className="bg-black/30 rounded p-4 text-blue-400 text-sm overflow-x-auto">
                              {JSON.stringify(method.queryParams, null, 2)}
                            </pre>
                          </div>
                        )}
                        
                        <div>
                          <h4 className="text-white font-semibold mb-2">Response:</h4>
                          <pre className="bg-black/30 rounded p-4 text-yellow-400 text-sm overflow-x-auto">
                            {JSON.stringify(method.response, null, 2)}
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>

          {/* Authentication Section */}
          <div className="mt-12 bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">Authentication</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">API Keys</h3>
                <p className="text-gray-300 mb-4">
                  Include your API key in the Authorization header:
                </p>
                <pre className="bg-black/30 rounded p-4 text-green-400 text-sm">
                  Authorization: Bearer YOUR_API_KEY
                </pre>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Rate Limiting</h3>
                <p className="text-gray-300 mb-4">
                  API requests are limited to 1000 requests per hour per API key.
                </p>
                <div className="text-sm text-gray-400">
                  <p>• 1000 requests/hour</p>
                  <p>• 429 status code when exceeded</p>
                  <p>• Reset every hour</p>
                </div>
              </div>
            </div>
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
                href="/docs"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                📚 Documentation
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
