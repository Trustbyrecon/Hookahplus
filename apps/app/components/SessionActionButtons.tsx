"use client";

import React from 'react';
import { 
  Flame, 
  RefreshCw, 
  CheckCircle, 
  Flag, 
  Pause, 
  Zap, 
  MoreHorizontal,
  Clock,
  User,
  AlertTriangle,
  Play,
  Square,
  Edit3,
  Trash2,
  Eye,
  MessageSquare,
  Settings,
  ArrowRight,
  ArrowLeft,
  Plus,
  Minus,
  Star,
  Heart,
  Coffee,
  Wind,
  Sparkles,
  Brain,
  Lock,
  CreditCard,
  Smartphone,
  QrCode,
  Save,
  EyeOff,
  ShoppingCart,
  Star as StarIcon,
  Users,
  BarChart3,
  Settings as SettingsIcon,
  ChefHat,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Clock3,
  Phone,
  MapPin,
  Calendar,
  Filter,
  Search,
  ArrowUp,
  ArrowDown,
  Target,
  Zap as Lightning,
  DollarSign,
  Activity,
  TrendingDown,
  Shield
} from 'lucide-react';
import { Session, SessionAction, SessionStatus, SessionTeam } from '../types/session';

interface SessionActionButtonsProps {
  session: Session;
  onAction: (actionId: string, sessionId: string) => void;
  onStatusChange: (sessionId: string, newStatus: SessionStatus) => void;
  onAddNote: (sessionId: string) => void;
  onViewDetails: (sessionId: string) => void;
  onEditSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
}

export default function SessionActionButtons({
  session,
  onAction,
  onStatusChange,
  onAddNote,
  onViewDetails,
  onEditSession,
  onDeleteSession
}: SessionActionButtonsProps) {
  
  // Define all possible actions with their conditions
  const allActions: SessionAction[] = [
    // BOH Actions
    {
      id: 'start_prep',
      label: 'Start Prep',
      icon: '👨‍🍳',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/30',
      hoverColor: 'hover:bg-blue-500/30',
      enabled: session.status === 'CREATED' && session.team === 'BOH',
      team: ['BOH'],
      status: ['CREATED'],
      description: 'Begin preparation of hookah',
      action: () => onStatusChange(session.id, 'PREP_IN_PROGRESS')
    },
    {
      id: 'heat_up',
      label: 'Heat Up',
      icon: '🔥',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
      borderColor: 'border-orange-500/30',
      hoverColor: 'hover:bg-orange-500/30',
      enabled: session.status === 'PREP_IN_PROGRESS' && session.team === 'BOH',
      team: ['BOH'],
      status: ['PREP_IN_PROGRESS'],
      description: 'Heat up the hookah coals',
      action: () => onStatusChange(session.id, 'HEAT_UP')
    },
    {
      id: 'ready_for_delivery',
      label: 'Ready for Delivery',
      icon: '✅',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/30',
      hoverColor: 'hover:bg-green-500/30',
      enabled: session.status === 'HEAT_UP' && session.team === 'BOH',
      team: ['BOH'],
      status: ['HEAT_UP'],
      description: 'Hookah is ready for FOH delivery',
      action: () => onStatusChange(session.id, 'READY_FOR_DELIVERY')
    },
    {
      id: 'restart_prep',
      label: 'Restart Prep',
      icon: '🔄',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/20',
      borderColor: 'border-cyan-500/30',
      hoverColor: 'hover:bg-cyan-500/30',
      enabled: ['PREP_IN_PROGRESS', 'HEAT_UP', 'READY_FOR_DELIVERY'].includes(session.status) && session.team === 'BOH',
      team: ['BOH'],
      status: ['PREP_IN_PROGRESS', 'HEAT_UP', 'READY_FOR_DELIVERY'],
      description: 'Restart the preparation process',
      action: () => onStatusChange(session.id, 'CREATED')
    },
    
    // FOH Actions
    {
      id: 'deliver_session',
      label: 'Deliver & Start Session',
      icon: '🚚',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-500/30',
      hoverColor: 'hover:bg-purple-500/30',
      enabled: session.status === 'READY_FOR_DELIVERY' && session.team === 'FOH',
      team: ['FOH'],
      status: ['READY_FOR_DELIVERY'],
      description: 'Deliver hookah to table and start session timer',
      action: () => onStatusChange(session.id, 'SESSION_ACTIVE')
    },
    {
      id: 'request_refill',
      label: 'Request Refill',
      icon: '🔄',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500/30',
      hoverColor: 'hover:bg-yellow-500/30',
      enabled: session.status === 'SESSION_ACTIVE' && session.team === 'FOH',
      team: ['FOH'],
      status: ['SESSION_ACTIVE'],
      description: 'Request flavor refill from BOH',
      action: () => onStatusChange(session.id, 'REQUEST_REFILL')
    },
    
    // Universal Actions
    {
      id: 'pause_session',
      label: 'Pause Session',
      icon: '⏸️',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500/30',
      hoverColor: 'hover:bg-yellow-500/30',
      enabled: ['SESSION_ACTIVE', 'REQUEST_REFILL'].includes(session.status),
      team: ['BOH', 'FOH', 'MANAGEMENT'],
      status: ['SESSION_ACTIVE', 'REQUEST_REFILL'],
      description: 'Pause the current session',
      action: () => onStatusChange(session.id, 'PAUSED')
    },
    {
      id: 'resume_session',
      label: 'Resume Session',
      icon: '▶️',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/30',
      hoverColor: 'hover:bg-green-500/30',
      enabled: session.status === 'PAUSED',
      team: ['BOH', 'FOH', 'MANAGEMENT'],
      status: ['PAUSED'],
      description: 'Resume the paused session',
      action: () => onStatusChange(session.id, 'SESSION_ACTIVE')
    },
    {
      id: 'complete_session',
      label: 'Complete Session',
      icon: '✅',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/30',
      hoverColor: 'hover:bg-green-500/30',
      enabled: ['SESSION_ACTIVE', 'REQUEST_REFILL', 'PAUSED'].includes(session.status),
      team: ['BOH', 'FOH', 'MANAGEMENT'],
      status: ['SESSION_ACTIVE', 'REQUEST_REFILL', 'PAUSED'],
      description: 'Mark session as completed',
      action: () => onStatusChange(session.id, 'COMPLETED')
    },
    
    // Edge Case Actions
    {
      id: 'flag_manager',
      label: 'Flag Manager',
      icon: '🚩',
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/30',
      hoverColor: 'hover:bg-red-500/30',
      enabled: true, // Always available for edge cases
      team: ['BOH', 'FOH', 'EDGE'],
      status: ['STAFF_HOLD', 'EQUIPMENT_ISSUE', 'CUSTOMER_ISSUE'],
      description: 'Flag this session for manager attention',
      action: () => onAction('flag_manager', session.id)
    },
    {
      id: 'resolve_issue',
      label: 'Resolve Issue',
      icon: '🔧',
      color: 'text-teal-400',
      bgColor: 'bg-teal-500/20',
      borderColor: 'border-teal-500/30',
      hoverColor: 'hover:bg-teal-500/30',
      enabled: ['STAFF_HOLD', 'EQUIPMENT_ISSUE', 'CUSTOMER_ISSUE'].includes(session.status),
      team: ['BOH', 'FOH', 'MANAGEMENT'],
      status: ['STAFF_HOLD', 'EQUIPMENT_ISSUE', 'CUSTOMER_ISSUE'],
      description: 'Mark issue as resolved',
      action: () => onStatusChange(session.id, 'SESSION_ACTIVE')
    },
    {
      id: 'hold_session',
      label: 'Hold Session',
      icon: '⏸️',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500/30',
      hoverColor: 'hover:bg-yellow-500/30',
      enabled: !['PAUSED', 'COMPLETED', 'CANCELLED'].includes(session.status),
      team: ['BOH', 'FOH', 'MANAGEMENT'],
      status: ['CREATED', 'PREP_IN_PROGRESS', 'HEAT_UP', 'READY_FOR_DELIVERY', 'SESSION_ACTIVE', 'REQUEST_REFILL'],
      description: 'Put session on hold',
      action: () => onStatusChange(session.id, 'STAFF_HOLD')
    }
  ];

  // Filter actions based on current session state
  const availableActions = allActions.filter(action => 
    action.enabled && 
    action.team.includes(session.team) && 
    action.status.includes(session.status)
  );

  // More button actions (always available)
  const moreActions = [
    {
      id: 'add_note',
      label: 'Add Note',
      icon: <MessageSquare className="w-4 h-4" />,
      action: () => onAddNote(session.id)
    },
    {
      id: 'view_details',
      label: 'View Details',
      icon: <Eye className="w-4 h-4" />,
      action: () => onViewDetails(session.id)
    },
    {
      id: 'edit_session',
      label: 'Edit Session',
      icon: <Edit3 className="w-4 h-4" />,
      action: () => onEditSession(session.id)
    },
    {
      id: 'delete_session',
      label: 'Delete Session',
      icon: <Trash2 className="w-4 h-4" />,
      action: () => onDeleteSession(session.id)
    }
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {/* Primary Actions */}
      {availableActions.slice(0, 4).map((action) => (
        <button
          key={action.id}
          onClick={action.action}
          className={`btn-pretty-pill ${action.bgColor} ${action.color} ${action.borderColor} ${action.hoverColor} transition-all duration-300 transform hover:scale-105`}
          title={action.description}
        >
          <span className="mr-2">{action.icon}</span>
          {action.label}
        </button>
      ))}
      
      {/* More Button */}
      <div className="relative group">
        <button className="btn-pretty-pill bg-zinc-500/20 text-zinc-400 border border-zinc-500/30 hover:bg-zinc-500/30 transition-all duration-300">
          <MoreHorizontal className="w-4 h-4 mr-2" />
          More
        </button>
        
        {/* Dropdown Menu */}
        <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10">
          <div className="py-2">
            {moreActions.map((action) => (
              <button
                key={action.id}
                onClick={action.action}
                className="w-full px-4 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors flex items-center"
              >
                {action.icon}
                <span className="ml-3">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
