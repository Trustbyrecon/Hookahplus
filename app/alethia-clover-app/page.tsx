"use client";
import { useState } from 'react';

interface CloverRequirement {
  id: string;
  category: string;
  requirement: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  priority: 'high' | 'medium' | 'low';
  notes: string;
}

interface CloverAppPhase {
  id: string;
  name: string;
  description: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked';
  progress: number;
  tasks: string[];
}

export default function AlethiaCloverAppPage() {
  const [requirements, setRequirements] = useState<CloverRequirement[]>([
    {
      id: 'cert-1',
      category: 'Certification',
      requirement: 'Clover App Store submission requirements',
      status: 'pending',
      priority: 'high',
      notes: 'Need to review Clover developer documentation'
    },
    {
      id: 'cert-2',
      category: 'Certification',
      requirement: 'OAuth 2.0 implementation',
      status: 'pending',
      priority: 'high',
      notes: 'Required for merchant authentication'
    },
    {
      id: 'cert-3',
      category: 'Certification',
      requirement: 'Security review compliance',
      status: 'pending',
      priority: 'high',
      notes: 'PCI DSS and data security requirements'
    },
    {
      id: 'tech-1',
      category: 'Technical',
      requirement: 'Clover JavaScript SDK integration',
      status: 'pending',
      priority: 'high',
      notes: 'Core SDK for POS integration'
    },
    {
      id: 'tech-2',
      category: 'Technical',
      requirement: 'WebView dashboard implementation',
      status: 'pending',
      priority: 'medium',
      notes: 'Embedded dashboard within Clover POS'
    },
    {
      id: 'tech-3',
      category: 'Technical',
      requirement: 'API hooks and webhooks',
      status: 'pending',
      priority: 'medium',
      notes: 'Real-time data synchronization'
    },
    {
      id: 'ux-1',
      category: 'UX Design',
      requirement: 'Clover POS UI optimization',
      status: 'pending',
      priority: 'medium',
      notes: 'Adapt interface for Clover screen sizes'
    },
    {
      id: 'ux-2',
      category: 'UX Design',
      requirement: 'Operator-first view design',
      status: 'pending',
      priority: 'medium',
      notes: 'Prioritize staff workflow efficiency'
    },
    {
      id: 'ux-3',
      category: 'UX Design',
      requirement: 'Branding alignment',
      status: 'pending',
      priority: 'low',
      notes: 'Ensure consistent brand experience'
    }
  ]);

  const [phases, setPhases] = useState<CloverAppPhase[]>([
    {
      id: 'phase-1',
      name: 'Research & Preparation',
      description: 'Clover App certification requirements and technical research',
      status: 'not-started',
      progress: 0,
      tasks: [
        'Review Clover App Store guidelines',
        'Research OAuth 2.0 implementation',
        'Analyze security requirements',
        'Map UX to Clover POS interface'
      ]
    },
    {
      id: 'phase-2',
      name: 'Technical Scaffold',
      description: 'Build Clover app shell with core SDK integration',
      status: 'not-started',
      progress: 0,
      tasks: [
        'Set up Clover app project structure',
        'Integrate Clover JavaScript SDK',
        'Implement OAuth login flow',
        'Create embedded WebView dashboard'
      ]
    },
    {
      id: 'phase-3',
      name: 'UX Adaptation',
      description: 'Optimize UI for Clover POS and operator workflow',
      status: 'not-started',
      progress: 0,
      tasks: [
        'Design Clover-optimized layouts',
        'Implement operator-first workflows',
        'Ensure responsive design',
        'Align branding and visual identity'
      ]
    },
    {
      id: 'phase-4',
      name: 'Certification Preparation',
      description: 'Testing, sandbox validation, and submission preparation',
      status: 'not-started',
      progress: 0,
      tasks: [
        'Conduct Clover sandbox tests',
        'Validate all certification requirements',
        'Prepare submission package',
        'Create marketing materials'
      ]
    }
  ]);

  const [activePhase, setActivePhase] = useState<string>('phase-1');
  const [showRequirementModal, setShowRequirementModal] = useState(false);
  const [editingRequirement, setEditingRequirement] = useState<CloverRequirement | null>(null);

  const updateRequirementStatus = (id: string, status: CloverRequirement['status']) => {
    setRequirements(prev => prev.map(req => 
      req.id === id ? { ...req, status } : req
    ));
  };

  const updatePhaseProgress = (phaseId: string, progress: number) => {
    setPhases(prev => prev.map(phase => 
      phase.id === phaseId ? { ...phase, progress } : phase
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'in-progress': return 'text-blue-400';
      case 'blocked': return 'text-red-400';
      default: return 'text-zinc-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-zinc-400';
    }
  };

  const getOverallProgress = () => {
    const totalRequirements = requirements.length;
    const completedRequirements = requirements.filter(req => req.status === 'completed').length;
    return Math.round((completedRequirements / totalRequirements) * 100);
  };

  const currentPhase = phases.find(phase => phase.id === activePhase);

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-700 p-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-purple-400 mb-2">Alethia Agent - Clover App Roadmap</h1>
          <p className="text-zinc-400 text-xl">Prepare Hookah+ Clover App release package for merchant store</p>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Clover App Progress</h2>
            <div className="text-2xl font-bold text-purple-400">{getOverallProgress()}%</div>
          </div>
          
          <div className="w-full bg-zinc-700 rounded-full h-3 mb-4">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${getOverallProgress()}%` }}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl text-purple-400 mb-1">
                {requirements.filter(req => req.status === 'completed').length}
              </div>
              <div className="text-zinc-400 text-sm">Completed</div>
            </div>
            <div>
              <div className="text-2xl text-blue-400 mb-1">
                {requirements.filter(req => req.status === 'in-progress').length}
              </div>
              <div className="text-zinc-400 text-sm">In Progress</div>
            </div>
            <div>
              <div className="text-2xl text-yellow-400 mb-1">
                {requirements.filter(req => req.status === 'pending').length}
              </div>
              <div className="text-zinc-400 text-sm">Pending</div>
            </div>
            <div>
              <div className="text-2xl text-red-400 mb-1">
                {requirements.filter(req => req.status === 'blocked').length}
              </div>
              <div className="text-zinc-400 text-sm">Blocked</div>
            </div>
          </div>
        </div>

        {/* Development Phases */}
        <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Development Phases</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {phases.map((phase) => (
              <div 
                key={phase.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  activePhase === phase.id
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-zinc-700 bg-zinc-700 hover:border-zinc-600'
                }`}
                onClick={() => setActivePhase(phase.id)}
              >
                <div className="text-center mb-3">
                  <div className="text-2xl mb-2">🚀</div>
                  <h3 className="font-semibold text-white text-sm">{phase.name}</h3>
                </div>
                
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-zinc-400 text-xs">Progress</span>
                    <span className="text-purple-400 text-xs">{phase.progress}%</span>
                  </div>
                  <div className="w-full bg-zinc-600 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${phase.progress}%` }}
                    />
                  </div>
                </div>

                <div className="text-xs text-zinc-400">
                  {phase.tasks.length} tasks
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Phase Details */}
        {currentPhase && (
          <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">{currentPhase.name}</h2>
              <div className="flex items-center gap-4">
                <span className="text-zinc-400">Progress:</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={currentPhase.progress}
                  onChange={(e) => updatePhaseProgress(currentPhase.id, parseInt(e.target.value))}
                  className="w-32"
                />
                <span className="text-purple-400 font-bold">{currentPhase.progress}%</span>
              </div>
            </div>
            
            <p className="text-zinc-300 mb-6">{currentPhase.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-purple-300 mb-3">Tasks</h3>
                <ul className="space-y-2">
                  {currentPhase.tasks.map((task, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <span className="text-purple-400">•</span>
                      <span className="text-zinc-300">{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-blue-300 mb-3">Phase Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-400">Status:</span>
                    <span className={`px-3 py-1 rounded text-sm font-medium ${
                      currentPhase.status === 'completed' ? 'bg-green-600 text-white' :
                      currentPhase.status === 'in-progress' ? 'bg-blue-600 text-white' :
                      currentPhase.status === 'blocked' ? 'bg-red-600 text-white' :
                      'bg-zinc-600 text-white'
                    }`}>
                      {currentPhase.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-400">Progress:</span>
                    <span className="text-purple-400 font-bold">{currentPhase.progress}%</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-400">Tasks:</span>
                    <span className="text-white">{currentPhase.tasks.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Certification Requirements */}
        <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Certification Requirements</h2>
            <button
              onClick={() => setShowRequirementModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              + Add Requirement
            </button>
          </div>
          
          <div className="space-y-4">
            {requirements.map((req) => (
              <div key={req.id} className="flex items-center gap-4 p-4 bg-zinc-700 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-white">{req.requirement}</h3>
                    <span className={`text-sm px-2 py-1 rounded ${getPriorityColor(req.priority)} bg-zinc-800`}>
                      {req.priority.toUpperCase()}
                    </span>
                    <span className={`text-sm px-2 py-1 rounded ${getStatusColor(req.status)} bg-zinc-800`}>
                      {req.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-zinc-400 text-sm mb-2">{req.notes}</p>
                  <div className="text-xs text-zinc-500">Category: {req.category}</div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => updateRequirementStatus(req.id, 'in-progress')}
                    disabled={req.status === 'completed'}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-600 text-white text-sm rounded transition-colors"
                  >
                    Start
                  </button>
                  <button
                    onClick={() => updateRequirementStatus(req.id, 'completed')}
                    disabled={req.status === 'completed'}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-zinc-600 text-white text-sm rounded transition-colors"
                  >
                    Complete
                  </button>
                  <button
                    onClick={() => updateRequirementStatus(req.id, 'blocked')}
                    disabled={req.status === 'completed'}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-zinc-600 text-white text-sm rounded transition-colors"
                  >
                    Block
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clover App Features */}
        <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Clover App Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-4">🔐</div>
              <h3 className="text-lg font-semibold text-purple-300 mb-2">OAuth Integration</h3>
              <p className="text-zinc-400 text-sm">Secure merchant authentication with Clover POS</p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-lg font-semibold text-blue-300 mb-2">Embedded Dashboard</h3>
              <p className="text-zinc-400 text-sm">WebView integration within Clover interface</p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-lg font-semibold text-green-300 mb-2">Real-time Sync</h3>
              <p className="text-zinc-400 text-sm">Live data synchronization with webhooks</p>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-purple-900 to-pink-900 rounded-xl p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Build the Clover App?</h2>
          <p className="text-xl text-purple-100 mb-8">
            Transform Hookah+ into a native Clover POS experience
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setActivePhase('phase-1')}
              className="bg-white text-purple-900 hover:bg-gray-100 px-8 py-4 rounded-xl text-xl font-bold transition-colors"
            >
              🚀 Start Development
            </button>
            <a
              href="/owner-cta?form=waitlist"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-purple-900 px-8 py-4 rounded-xl text-xl font-bold transition-colors"
            >
              📋 Join Waitlist
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
