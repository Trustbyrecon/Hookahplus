'use client';

import React, { useState } from 'react';
import { 
  Code, 
  Copy, 
  Check, 
  ExternalLink, 
  BookOpen, 
  Zap, 
  Shield, 
  Clock,
  Database,
  Server,
  Key,
  Globe,
  Terminal,
  FileText,
  ChevronDown,
  ChevronRight,
  Play
} from 'lucide-react';

export default function APIDocumentationPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['getting-started', 'authentication']));

  const copyToClipboard = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const apiEndpoints = [
    {
      method: 'GET',
      path: '/api/sessions',
      description: 'Retrieve all active sessions',
      parameters: [
        { name: 'status', type: 'string', required: false, description: 'Filter by session status' },
        { name: 'lounge_id', type: 'string', required: false, description: 'Filter by lounge ID' }
      ]
    },
    {
      method: 'POST',
      path: '/api/sessions',
      description: 'Create a new session',
      parameters: [
        { name: 'lounge_id', type: 'string', required: true, description: 'Lounge identifier' },
        { name: 'table_id', type: 'string', required: true, description: 'Table identifier' },
        { name: 'flavors', type: 'array', required: true, description: 'Selected flavors' }
      ]
    },
    {
      method: 'GET',
      path: '/api/lounges',
      description: 'List all lounges',
      parameters: []
    },
    {
      method: 'POST',
      path: '/api/lounges',
      description: 'Create a new lounge configuration',
      parameters: [
        { name: 'lounge_id', type: 'string', required: true, description: 'Unique lounge identifier' },
        { name: 'name', type: 'string', required: true, description: 'Lounge name' },
        { name: 'tables', type: 'array', required: true, description: 'Table configurations' }
      ]
    },
    {
      method: 'GET',
      path: '/api/qr/generate',
      description: 'Generate QR code for table',
      parameters: [
        { name: 'lounge_id', type: 'string', required: true, description: 'Lounge identifier' },
        { name: 'table_id', type: 'string', required: true, description: 'Table identifier' },
        { name: 'campaign_ref', type: 'string', required: false, description: 'Campaign reference' }
      ]
    }
  ];

  const codeExamples = {
    'create-session': `curl -X POST https://api.hookahplus.net/api/sessions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "lounge_id": "lounge_001",
    "table_id": "table_05",
    "flavors": ["Blue Mist", "Strawberry Mojito"],
    "pricing_model": "time_based",
    "estimated_duration": 45
  }'`,
    
    'get-sessions': `curl -X GET "https://api.hookahplus.net/api/sessions?status=active&lounge_id=lounge_001" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
    
    'generate-qr': `curl -X GET "https://api.hookahplus.net/api/qr/generate?lounge_id=lounge_001&table_id=table_05" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
    
    'javascript-example': `// JavaScript SDK Example
import { HookahPlusAPI } from '@hookahplus/sdk';

const api = new HookahPlusAPI({
  apiKey: 'your-api-key',
  baseURL: 'https://api.hookahplus.net'
});

// Create a new session
const session = await api.sessions.create({
  lounge_id: 'lounge_001',
  table_id: 'table_05',
  flavors: ['Blue Mist', 'Strawberry Mojito'],
  pricing_model: 'time_based',
  estimated_duration: 45
});

console.log('Session created:', session.id);`
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <Code className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">API Documentation</h1>
              <p className="text-zinc-400">Developer resources and integration guides</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Server className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">12</p>
                <p className="text-sm text-zinc-400">API Endpoints</p>
              </div>
            </div>
          </div>
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">99.9%</p>
                <p className="text-sm text-zinc-400">Uptime</p>
              </div>
            </div>
          </div>
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-white">&lt;100ms</p>
                <p className="text-sm text-zinc-400">Response Time</p>
              </div>
            </div>
          </div>
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Globe className="w-5 h-5 text-orange-400" />
              <div>
                <p className="text-2xl font-bold text-white">REST</p>
                <p className="text-sm text-zinc-400">API Type</p>
              </div>
            </div>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Table of Contents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { id: 'getting-started', title: 'Getting Started', icon: <Play className="w-4 h-4" /> },
              { id: 'authentication', title: 'Authentication', icon: <Key className="w-4 h-4" /> },
              { id: 'endpoints', title: 'API Endpoints', icon: <Server className="w-4 h-4" /> },
              { id: 'webhooks', title: 'Webhooks', icon: <Zap className="w-4 h-4" /> },
              { id: 'sdks', title: 'SDKs & Libraries', icon: <Code className="w-4 h-4" /> },
              { id: 'rate-limits', title: 'Rate Limits', icon: <Clock className="w-4 h-4" /> }
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => toggleSection(section.id)}
                className="flex items-center space-x-2 text-left p-2 rounded hover:bg-zinc-700 transition-colors"
              >
                {expandedSections.has(section.id) ? 
                  <ChevronDown className="w-4 h-4 text-primary-400" /> : 
                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                }
                {section.icon}
                <span className="text-white">{section.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Getting Started Section */}
        {expandedSections.has('getting-started') && (
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center space-x-2">
              <Play className="w-6 h-6 text-primary-400" />
              <span>Getting Started</span>
            </h2>
            <div className="space-y-4">
              <p className="text-zinc-300">
                The Hookah+ API allows you to integrate our lounge management system into your applications. 
                Our RESTful API provides endpoints for managing sessions, lounges, QR codes, and more.
              </p>
              <div className="bg-zinc-900/50 border border-zinc-600 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Base URL</h3>
                <code className="text-primary-400 font-mono">https://api.hookahplus.net</code>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-600 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">API Version</h3>
                <p className="text-zinc-300">Current version: <code className="text-primary-400">v1</code></p>
                <p className="text-sm text-zinc-400 mt-1">All endpoints are prefixed with <code>/api/v1</code></p>
              </div>
            </div>
          </div>
        )}

        {/* Authentication Section */}
        {expandedSections.has('authentication') && (
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center space-x-2">
              <Key className="w-6 h-6 text-primary-400" />
              <span>Authentication</span>
            </h2>
            <div className="space-y-4">
              <p className="text-zinc-300">
                All API requests require authentication using an API key. Include your API key in the Authorization header.
              </p>
              <div className="bg-zinc-900/50 border border-zinc-600 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Authorization Header</h3>
                <div className="flex items-center justify-between">
                  <code className="text-primary-400 font-mono">Authorization: Bearer YOUR_API_KEY</code>
                  <button
                    onClick={() => copyToClipboard('Authorization: Bearer YOUR_API_KEY', 'auth-header')}
                    className="ml-4 p-2 hover:bg-zinc-700 rounded transition-colors"
                  >
                    {copiedCode === 'auth-header' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">⚠️ Security Note</h3>
                <p className="text-zinc-300 text-sm">
                  Keep your API key secure and never expose it in client-side code. 
                  Use environment variables or secure key management systems.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* API Endpoints Section */}
        {expandedSections.has('endpoints') && (
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center space-x-2">
              <Server className="w-6 h-6 text-primary-400" />
              <span>API Endpoints</span>
            </h2>
            <div className="space-y-4">
              {apiEndpoints.map((endpoint, index) => (
                <div key={index} className="bg-zinc-900/50 border border-zinc-600 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        endpoint.method === 'GET' ? 'bg-green-500/20 text-green-400' :
                        endpoint.method === 'POST' ? 'bg-blue-500/20 text-blue-400' :
                        endpoint.method === 'PUT' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {endpoint.method}
                      </span>
                      <code className="text-primary-400 font-mono">{endpoint.path}</code>
                    </div>
                    <button
                      onClick={() => copyToClipboard(`curl -X ${endpoint.method} https://api.hookahplus.net${endpoint.path}`, `endpoint-${index}`)}
                      className="p-2 hover:bg-zinc-700 rounded transition-colors"
                    >
                      {copiedCode === `endpoint-${index}` ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-zinc-300 mb-3">{endpoint.description}</p>
                  {endpoint.parameters.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-2">Parameters:</h4>
                      <div className="space-y-1">
                        {endpoint.parameters.map((param, paramIndex) => (
                          <div key={paramIndex} className="flex items-center space-x-2 text-sm">
                            <code className="text-primary-400 font-mono">{param.name}</code>
                            <span className="text-zinc-400">({param.type})</span>
                            {param.required && <span className="text-red-400 text-xs">required</span>}
                            <span className="text-zinc-500">- {param.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Code Examples */}
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-white mb-4 flex items-center space-x-2">
            <Code className="w-6 h-6 text-primary-400" />
            <span>Code Examples</span>
          </h2>
          <div className="space-y-6">
            {Object.entries(codeExamples).map(([key, code]) => (
              <div key={key} className="bg-zinc-900/50 border border-zinc-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white capitalize">
                    {key.replace('-', ' ')}
                  </h3>
                  <button
                    onClick={() => copyToClipboard(code, key)}
                    className="flex items-center space-x-2 px-3 py-1 bg-zinc-700 hover:bg-zinc-600 rounded transition-colors"
                  >
                    {copiedCode === key ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    <span className="text-sm">Copy</span>
                  </button>
                </div>
                <pre className="text-sm text-zinc-300 overflow-x-auto">
                  <code>{code}</code>
                </pre>
              </div>
            ))}
          </div>
        </div>

        {/* SDKs Section */}
        {expandedSections.has('sdks') && (
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center space-x-2">
              <Code className="w-6 h-6 text-primary-400" />
              <span>SDKs & Libraries</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'JavaScript/Node.js', status: 'Available', color: 'text-green-400' },
                { name: 'Python', status: 'Coming Soon', color: 'text-yellow-400' },
                { name: 'PHP', status: 'Coming Soon', color: 'text-yellow-400' },
                { name: 'Ruby', status: 'Planned', color: 'text-zinc-400' }
              ].map((sdk, index) => (
                <div key={index} className="bg-zinc-900/50 border border-zinc-600 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">{sdk.name}</h3>
                  <p className={`text-sm ${sdk.color}`}>{sdk.status}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rate Limits Section */}
        {expandedSections.has('rate-limits') && (
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center space-x-2">
              <Clock className="w-6 h-6 text-primary-400" />
              <span>Rate Limits</span>
            </h2>
            <div className="space-y-4">
              <p className="text-zinc-300">
                API requests are rate limited to ensure fair usage and system stability.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-zinc-900/50 border border-zinc-600 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Free Tier</h3>
                  <p className="text-2xl font-bold text-primary-400">100</p>
                  <p className="text-sm text-zinc-400">requests per hour</p>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-600 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Pro Tier</h3>
                  <p className="text-2xl font-bold text-primary-400">1,000</p>
                  <p className="text-sm text-zinc-400">requests per hour</p>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-600 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Enterprise</h3>
                  <p className="text-2xl font-bold text-primary-400">10,000</p>
                  <p className="text-sm text-zinc-400">requests per hour</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Support Section */}
        <div className="bg-gradient-to-r from-primary-500/10 to-primary-600/10 border border-primary-500/30 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Need Help?</h2>
          <p className="text-zinc-300 mb-4">
            Our developer support team is here to help you integrate with the Hookah+ API.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="/community"
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Community Forum</span>
            </a>
            <a
              href="/support"
              className="flex items-center space-x-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Contact Support</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
