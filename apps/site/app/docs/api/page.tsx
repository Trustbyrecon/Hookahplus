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
  ChevronDown,
  ChevronRight,
  Play,
  Download
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

  const codeExamples = {
    auth: `curl -X POST https://api.hookahplus.net/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'`,
    
    createSession: `curl -X POST https://api.hookahplus.net/sessions \\
  -H "Authorization: Bearer YOUR_API_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "loungeId": "lounge_123",
    "tableId": "table_5",
    "flavors": ["blue-mist", "mint-fresh"],
    "duration": 45,
    "pricingModel": "time-based"
  }'`,
    
    getSessions: `curl -X GET https://api.hookahplus.net/sessions \\
  -H "Authorization: Bearer YOUR_API_TOKEN" \\
  -H "Content-Type: application/json"`,
    
    webhook: `// Webhook endpoint example
app.post('/webhook/session-update', (req, res) => {
  const { sessionId, status, timestamp } = req.body;
  
  // Process session update
  console.log(\`Session \${sessionId} updated to \${status}\`);
  
  res.status(200).json({ received: true });
});`
  };

  const apiEndpoints = [
    {
      method: 'POST',
      path: '/auth/login',
      description: 'Authenticate user and get API token',
      parameters: [
        { name: 'email', type: 'string', required: true, description: 'User email address' },
        { name: 'password', type: 'string', required: true, description: 'User password' }
      ]
    },
    {
      method: 'POST',
      path: '/sessions',
      description: 'Create a new hookah session',
      parameters: [
        { name: 'loungeId', type: 'string', required: true, description: 'Unique lounge identifier' },
        { name: 'tableId', type: 'string', required: true, description: 'Table identifier within lounge' },
        { name: 'flavors', type: 'array', required: true, description: 'Array of selected flavor IDs' },
        { name: 'duration', type: 'number', required: false, description: 'Session duration in minutes (default: 45)' },
        { name: 'pricingModel', type: 'string', required: false, description: 'time-based or flat-rate' }
      ]
    },
    {
      method: 'GET',
      path: '/sessions',
      description: 'Get all active sessions for a lounge',
      parameters: [
        { name: 'loungeId', type: 'string', required: false, description: 'Filter by lounge ID' },
        { name: 'status', type: 'string', required: false, description: 'Filter by session status' }
      ]
    },
    {
      method: 'PUT',
      path: '/sessions/{sessionId}',
      description: 'Update session status or details',
      parameters: [
        { name: 'status', type: 'string', required: false, description: 'New session status' },
        { name: 'notes', type: 'string', required: false, description: 'Staff notes' }
      ]
    },
    {
      method: 'GET',
      path: '/lounges',
      description: 'Get lounge information and configuration',
      parameters: [
        { name: 'loungeId', type: 'string', required: false, description: 'Specific lounge ID' }
      ]
    },
    {
      method: 'POST',
      path: '/qr/generate',
      description: 'Generate QR code for table/campaign',
      parameters: [
        { name: 'loungeId', type: 'string', required: true, description: 'Lounge identifier' },
        { name: 'tableId', type: 'string', required: true, description: 'Table identifier' },
        { name: 'campaignRef', type: 'string', required: false, description: 'Campaign reference' }
      ]
    }
  ];

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
                <p className="text-2xl font-bold text-white">REST API</p>
                <p className="text-sm text-zinc-400">RESTful endpoints</p>
              </div>
            </div>
          </div>
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">HTTPS</p>
                <p className="text-sm text-zinc-400">Secure by default</p>
              </div>
            </div>
          </div>
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-white">99.9%</p>
                <p className="text-sm text-zinc-400">Uptime SLA</p>
              </div>
            </div>
          </div>
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Zap className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-2xl font-bold text-white">Real-time</p>
                <p className="text-sm text-zinc-400">WebSocket support</p>
              </div>
            </div>
          </div>
        </div>

        {/* API Sections */}
        <div className="space-y-6">
          {/* Getting Started */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg">
            <button
              onClick={() => toggleSection('getting-started')}
              className="w-full p-6 text-left flex items-center justify-between hover:bg-zinc-700/50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <BookOpen className="w-5 h-5 text-primary-400" />
                <h2 className="text-xl font-semibold text-white">Getting Started</h2>
              </div>
              {expandedSections.has('getting-started') ? 
                <ChevronDown className="w-5 h-5 text-zinc-400" /> : 
                <ChevronRight className="w-5 h-5 text-zinc-400" />
              }
            </button>
            
            {expandedSections.has('getting-started') && (
              <div className="px-6 pb-6 border-t border-zinc-700">
                <div className="space-y-4">
                  <p className="text-zinc-300">
                    The Hookah+ API allows you to integrate hookah session management into your existing systems. 
                    Our RESTful API provides endpoints for session management, lounge operations, and real-time updates.
                  </p>
                  
                  <div className="bg-zinc-900/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-2">Base URL</h3>
                    <code className="text-primary-400 font-mono">https://api.hookahplus.net/v1</code>
                  </div>
                  
                  <div className="bg-zinc-900/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-2">Rate Limits</h3>
                    <ul className="text-zinc-300 space-y-1">
                      <li>• 1000 requests per hour per API key</li>
                      <li>• 100 requests per minute for session creation</li>
                      <li>• WebSocket connections: 10 concurrent per API key</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Authentication */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg">
            <button
              onClick={() => toggleSection('authentication')}
              className="w-full p-6 text-left flex items-center justify-between hover:bg-zinc-700/50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Key className="w-5 h-5 text-primary-400" />
                <h2 className="text-xl font-semibold text-white">Authentication</h2>
              </div>
              {expandedSections.has('authentication') ? 
                <ChevronDown className="w-5 h-5 text-zinc-400" /> : 
                <ChevronRight className="w-5 h-5 text-zinc-400" />
              }
            </button>
            
            {expandedSections.has('authentication') && (
              <div className="px-6 pb-6 border-t border-zinc-700">
                <div className="space-y-4">
                  <p className="text-zinc-300">
                    All API requests require authentication using Bearer tokens. Obtain your API key from the admin dashboard.
                  </p>
                  
                  <div className="bg-zinc-900/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-white">Login Example</h3>
                      <button
                        onClick={() => copyToClipboard(codeExamples.auth, 'auth')}
                        className="flex items-center space-x-1 text-sm text-primary-400 hover:text-primary-300 transition-colors"
                      >
                        {copiedCode === 'auth' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span>{copiedCode === 'auth' ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="text-sm text-zinc-300 overflow-x-auto">
                      <code>{codeExamples.auth}</code>
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* API Endpoints */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg">
            <button
              onClick={() => toggleSection('endpoints')}
              className="w-full p-6 text-left flex items-center justify-between hover:bg-zinc-700/50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Terminal className="w-5 h-5 text-primary-400" />
                <h2 className="text-xl font-semibold text-white">API Endpoints</h2>
              </div>
              {expandedSections.has('endpoints') ? 
                <ChevronDown className="w-5 h-5 text-zinc-400" /> : 
                <ChevronRight className="w-5 h-5 text-zinc-400" />
              }
            </button>
            
            {expandedSections.has('endpoints') && (
              <div className="px-6 pb-6 border-t border-zinc-700">
                <div className="space-y-4">
                  {apiEndpoints.map((endpoint, index) => (
                    <div key={index} className="bg-zinc-900/50 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
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
                      <p className="text-zinc-300 mb-3">{endpoint.description}</p>
                      
                      {endpoint.parameters && endpoint.parameters.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-2">Parameters:</h4>
                          <div className="space-y-2">
                            {endpoint.parameters.map((param, paramIndex) => (
                              <div key={paramIndex} className="flex items-center space-x-4 text-sm">
                                <code className="text-primary-400 font-mono w-24">{param.name}</code>
                                <span className="text-zinc-400 w-16">{param.type}</span>
                                <span className={`w-16 ${param.required ? 'text-red-400' : 'text-zinc-500'}`}>
                                  {param.required ? 'Required' : 'Optional'}
                                </span>
                                <span className="text-zinc-300 flex-1">{param.description}</span>
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
          </div>

          {/* Code Examples */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg">
            <button
              onClick={() => toggleSection('examples')}
              className="w-full p-6 text-left flex items-center justify-between hover:bg-zinc-700/50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Code className="w-5 h-5 text-primary-400" />
                <h2 className="text-xl font-semibold text-white">Code Examples</h2>
              </div>
              {expandedSections.has('examples') ? 
                <ChevronDown className="w-5 h-5 text-zinc-400" /> : 
                <ChevronRight className="w-5 h-5 text-zinc-400" />
              }
            </button>
            
            {expandedSections.has('examples') && (
              <div className="px-6 pb-6 border-t border-zinc-700">
                <div className="space-y-6">
                  {/* Create Session */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-white">Create Session</h3>
                      <button
                        onClick={() => copyToClipboard(codeExamples.createSession, 'createSession')}
                        className="flex items-center space-x-1 text-sm text-primary-400 hover:text-primary-300 transition-colors"
                      >
                        {copiedCode === 'createSession' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span>{copiedCode === 'createSession' ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="bg-zinc-900/50 rounded-lg p-4 text-sm text-zinc-300 overflow-x-auto">
                      <code>{codeExamples.createSession}</code>
                    </pre>
                  </div>

                  {/* Get Sessions */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-white">Get Sessions</h3>
                      <button
                        onClick={() => copyToClipboard(codeExamples.getSessions, 'getSessions')}
                        className="flex items-center space-x-1 text-sm text-primary-400 hover:text-primary-300 transition-colors"
                      >
                        {copiedCode === 'getSessions' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span>{copiedCode === 'getSessions' ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="bg-zinc-900/50 rounded-lg p-4 text-sm text-zinc-300 overflow-x-auto">
                      <code>{codeExamples.getSessions}</code>
                    </pre>
                  </div>

                  {/* Webhook Example */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-white">Webhook Handler</h3>
                      <button
                        onClick={() => copyToClipboard(codeExamples.webhook, 'webhook')}
                        className="flex items-center space-x-1 text-sm text-primary-400 hover:text-primary-300 transition-colors"
                      >
                        {copiedCode === 'webhook' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span>{copiedCode === 'webhook' ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="bg-zinc-900/50 rounded-lg p-4 text-sm text-zinc-300 overflow-x-auto">
                      <code>{codeExamples.webhook}</code>
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SDK Downloads */}
        <div className="mt-8 bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">SDK Downloads</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-zinc-900/50 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <Code className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold text-white">JavaScript</h3>
              </div>
              <p className="text-sm text-zinc-400 mb-3">Node.js and browser support</p>
              <button className="flex items-center space-x-2 text-sm text-primary-400 hover:text-primary-300 transition-colors">
                <Download className="w-4 h-4" />
                <span>Download SDK</span>
              </button>
            </div>
            <div className="bg-zinc-900/50 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <Terminal className="w-5 h-5 text-green-400" />
                <h3 className="font-semibold text-white">Python</h3>
              </div>
              <p className="text-sm text-zinc-400 mb-3">Full async support</p>
              <button className="flex items-center space-x-2 text-sm text-primary-400 hover:text-primary-300 transition-colors">
                <Download className="w-4 h-4" />
                <span>Download SDK</span>
              </button>
            </div>
            <div className="bg-zinc-900/50 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <Globe className="w-5 h-5 text-purple-400" />
                <h3 className="font-semibold text-white">PHP</h3>
              </div>
              <p className="text-sm text-zinc-400 mb-3">Laravel integration ready</p>
              <button className="flex items-center space-x-2 text-sm text-primary-400 hover:text-primary-300 transition-colors">
                <Download className="w-4 h-4" />
                <span>Download SDK</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
