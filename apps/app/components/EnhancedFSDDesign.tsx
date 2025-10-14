"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, 
  Users, 
  Clock, 
  TrendingUp,
  Plus,
  BarChart3,
  Settings,
  ChefHat,
  UserCheck,
  AlertTriangle,
  Crown,
  Folder,
  FileText,
  RefreshCw,
  CheckCircle,
  Flag,
  Pause,
  Zap,
  Trash2,
  Edit3,
  Menu,
  X,
  DollarSign,
  Activity,
  TrendingDown,
  Star,
  Shield,
  AlertCircle,
  CheckCircle2,
  Clock3,
  User,
  Phone,
  MapPin,
  Calendar,
  Filter,
  Search,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Minus,
  Target,
  Zap as Lightning,
  Heart,
  Coffee,
  Wind,
  Sparkles,
  Brain,
  Lock,
  CreditCard,
  Smartphone,
  QrCode,
  Play,
  Save,
  Eye,
  EyeOff,
  ShoppingCart,
  Star as StarIcon,
  MessageSquare,
  CircleDot,
  RotateCcw,
  Wand2,
  FlaskConical,
  ListFilter,
  ChevronRight,
  Loader2,
  CheckCircle as CheckCircleIcon,
  XCircle,
  AlertCircle as AlertCircleIcon,
  Wifi,
  WifiOff,
  Server,
  Database,
  Zap as ZapIcon,
  Info,
  ArrowLeft
} from 'lucide-react';

// Enhanced visual design system matching FlavorWheel treatment
const ENHANCED_COLORS = {
  primary: 'teal',
  secondary: 'cyan',
  accent: 'purple',
  success: 'green',
  warning: 'amber',
  error: 'red',
  neutral: 'zinc'
};

const ENHANCED_SPACING = {
  xs: 'p-2',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8'
};

// Sophisticated card component with FlavorWheel styling
const EnhancedCard = ({ 
  children, 
  className = '', 
  variant = 'default',
  interactive = false,
  ...props 
}: {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'glass' | 'gradient';
  interactive?: boolean;
  [key: string]: any;
}) => {
  const baseClasses = "rounded-xl border transition-all duration-300";
  
  const variantClasses = {
    default: "bg-white/5 border-white/10",
    elevated: "bg-white/10 border-white/20 shadow-lg",
    glass: "bg-white/5 border-white/10 backdrop-blur-sm",
    gradient: "bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border-teal-500/30"
  };
  
  const interactiveClasses = interactive 
    ? "hover:bg-white/10 hover:border-teal-500/30 hover:scale-[1.02] cursor-pointer" 
    : "";
  
  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${interactiveClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Enhanced selection bar component
const EnhancedSelectionBar = ({ 
  title, 
  subtitle, 
  selectedItems = [], 
  totalPrice = 0,
  onClear,
  className = ''
}: {
  title: string;
  subtitle?: string;
  selectedItems?: Array<{ id: string; name: string; price: number }>;
  totalPrice?: number;
  onClear?: () => void;
  className?: string;
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-wrap items-center gap-2 rounded-xl bg-white/5 p-3 border border-white/10 ${className}`}
    >
      <div className="flex items-center gap-2">
        <CircleDot className="h-4 w-4 text-teal-400" />
        <span className="text-sm text-neutral-300">{title}:</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {selectedItems.length > 0 ? (
          selectedItems.map((item) => (
            <motion.span 
              key={item.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs px-2 py-1 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300"
            >
              {item.name} (${item.price.toFixed(2)})
            </motion.span>
          ))
        ) : (
          <span className="text-neutral-500 text-sm">{subtitle || 'None yet'}</span>
        )}
      </div>
      
      <div className="grow" />
      
      <div className="text-sm text-teal-400 font-medium">
        Total: ${totalPrice.toFixed(2)}
      </div>
      
      {onClear && selectedItems.length > 0 && (
        <button 
          onClick={onClear}
          className="text-xs flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition"
        >
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      )}
    </motion.div>
  );
};

// Enhanced session card with sophisticated styling
const EnhancedSessionCard = ({ 
  session, 
  onAction,
  variant = 'default'
}: {
  session: any;
  onAction?: (action: string, sessionId: string) => void;
  variant?: 'default' | 'live' | 'completed' | 'pending';
}) => {
  const variantStyles = {
    default: "border-zinc-700 bg-zinc-800/50",
    live: "border-green-500/30 bg-green-500/5",
    completed: "border-teal-500/30 bg-teal-500/5",
    pending: "border-amber-500/30 bg-amber-500/5"
  };
  
  const statusConfig = {
    ACTIVE: { color: 'green', icon: CheckCircle, label: 'LIVE' },
    COMPLETED: { color: 'teal', icon: CheckCircle2, label: 'DONE' },
    PENDING: { color: 'amber', icon: Clock, label: 'WAIT' },
    PAUSED: { color: 'orange', icon: Pause, label: 'PAUSED' }
  };
  
  const status = statusConfig[session.state as keyof typeof statusConfig] || statusConfig.PENDING;
  const StatusIcon = status.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={`rounded-xl p-4 border transition-all duration-300 ${variantStyles[variant]}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 bg-${status.color}-400 rounded-full ${session.state === 'ACTIVE' ? 'animate-pulse' : ''}`}></div>
          <span className={`text-sm font-medium text-${status.color}-400`}>{status.label}</span>
        </div>
        <span className="text-xs text-zinc-400">Table {session.tableId}</span>
      </div>
      
      <div className="space-y-2">
        <div className="text-lg font-semibold text-white">{session.flavor || 'Hookah Session'}</div>
        <div className="text-sm text-zinc-400">
          {session.customerName && `Guest: ${session.customerName}`}
          {session.customerPhone && ` | ${session.customerPhone}`}
        </div>
        <div className="text-sm text-zinc-400">
          {session.timerDuration && `Duration: ${session.timerDuration}min`}
          {session.startedAt && ` | Started: ${new Date(session.startedAt).toLocaleTimeString()}`}
          {session.pricingModel && ` | ${session.pricingModel === 'time-based' ? 'Time-based' : 'Flat rate'}`}
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">Revenue:</span>
          <span className="text-green-400 font-semibold">${(session.priceCents / 100).toFixed(2)}</span>
        </div>
        {session.flavorMix && session.flavorMix.length > 0 && (
          <div className="text-xs text-zinc-500">
            Mix: {session.flavorMix.join(' + ')}
          </div>
        )}
        {session.assignedBOH && session.assignedFOH && (
          <div className="text-xs text-zinc-500">
            Staff: {session.assignedBOH} (BOH) • {session.assignedFOH} (FOH)
          </div>
        )}
      </div>
      
      <div className="mt-3 pt-3 border-t border-zinc-700">
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAction?.('pause', session.id)}
            className="flex-1 px-3 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-medium transition-colors flex items-center justify-center gap-1"
          >
            <Pause className="w-3 h-3" />
            Pause
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAction?.('complete', session.id)}
            className="flex-1 px-3 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium transition-colors flex items-center justify-center gap-1"
          >
            <CheckCircle className="w-3 h-3" />
            Complete
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// Enhanced metrics display
const EnhancedMetrics = ({ metrics }: { metrics: any[] }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
      {metrics.map((metric, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="text-center"
        >
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${metric.bgColor} mb-3 ${metric.title === 'System Health' ? 'animate-pulse' : ''}`}>
            <div className={metric.color}>
              {metric.icon}
            </div>
          </div>
          <div className="text-2xl font-bold text-teal-400 mb-1">{metric.value}</div>
          <div className="text-sm text-zinc-400">{metric.title}</div>
          <div className="text-xs text-zinc-500 mt-1">{metric.change}</div>
        </motion.div>
      ))}
    </div>
  );
};

// Enhanced flavor selection interface
// INTENT: This is for lounge staff to quickly build flavor profiles for customer sessions
// ENDPOINT: Selected flavors are sent to POST /api/sessions as part of session creation
// WORKFLOW: Staff selects flavors → Creates session → Flavors become part of session data
const EnhancedFlavorSelection = ({ 
  onFlavorSelect,
  selectedFlavors = [],
  className = ''
}: {
  onFlavorSelect?: (flavor: any) => void;
  selectedFlavors?: any[];
  className?: string;
}) => {
  const [activeCategory, setActiveCategory] = useState('popular');
  
  const flavorCategories = {
    popular: {
      title: "Quick Order",
      subtitle: "Select popular flavors to build your quick order",
      items: [
        { id: "blue-mist-mint", name: "Blue Mist + Mint", price: 35, description: "Premium blueberry mint blend with smooth clouds", quickAdd: true },
        { id: "strawberry-mojito", name: "Strawberry Mojito", price: 28, description: "Fresh strawberry with mint and lime", quickAdd: true },
        { id: "double-apple-cardamom", name: "Double Apple + Cardamom", price: 42, description: "Classic apple with exotic spice", quickAdd: true },
        { id: "watermelon-mint", name: "Watermelon Mint", price: 32, description: "Refreshing summer blend", quickAdd: true },
        { id: "rose-lavender", name: "Rose + Lavender", price: 45, description: "Elegant floral combination", quickAdd: true },
        { id: "peach-wave", name: "Peach Wave", price: 28, description: "Sweet peach with tropical notes", quickAdd: true }
      ]
    },
    trending: {
      title: "Popular This Week",
      subtitle: "Trending flavors customers are loving",
      items: [
        { id: "blue-mist-mint", name: "Blue Mist + Mint", price: 35, trending: true },
        { id: "strawberry-mojito", name: "Strawberry Mojito", price: 28, trending: true },
        { id: "watermelon-mint", name: "Watermelon Mint", price: 32, trending: true }
      ]
    },
    premium: {
      title: "Premium Mixes",
      subtitle: "Sophisticated flavor combinations",
      items: [
        { id: "rose-lavender", name: "Rose + Lavender", price: 45, description: "Elegant floral combination" },
        { id: "double-apple-cardamom", name: "Double Apple + Cardamom", price: 42, description: "Classic apple with exotic spice" },
        { id: "vanilla-caramel", name: "Vanilla + Caramel", price: 38, description: "Rich dessert-inspired blend" },
        { id: "jasmine-honey", name: "Jasmine + Honey", price: 40, description: "Aromatic with natural sweetness" }
      ]
    }
  };
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Category Tabs */}
      <div className="flex space-x-2">
        {Object.entries(flavorCategories).map(([key, category]) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeCategory === key
                ? 'bg-teal-500/20 border border-teal-500/30 text-teal-300'
                : 'bg-white/5 border border-white/10 text-neutral-300 hover:bg-white/10'
            }`}
          >
            {category.title}
          </button>
        ))}
      </div>
      
      {/* Flavor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {flavorCategories[activeCategory as keyof typeof flavorCategories].items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            className="rounded-xl bg-white/5 border border-white/10 p-4 hover:border-teal-500/30 transition-all cursor-pointer"
            onClick={() => onFlavorSelect?.(item)}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-white mb-1">{item.name}</h4>
                  <p className="text-zinc-400 text-sm">{'description' in item ? item.description : 'Premium flavor blend'}</p>
                </div>
                {'trending' in item && item.trending && (
                  <div className="bg-amber-500/20 text-amber-300 text-xs px-2 py-1 rounded-full">
                    Trending
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-teal-400 font-bold text-lg">${item.price}</span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="px-3 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium transition-colors"
                >
                  {'quickAdd' in item && item.quickAdd ? 'Quick Add' : 'Add'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Enhanced Role Selector Component
const EnhancedRoleSelector = ({ 
  userRole, 
  onRoleChange, 
  selectedRole 
}: {
  userRole: string;
  onRoleChange: (role: string) => void;
  selectedRole: string;
}) => {
  const roles = [
    { id: 'BOH', label: 'BOH', icon: ChefHat, color: 'text-orange-400' },
    { id: 'FOH', label: 'FOH', icon: UserCheck, color: 'text-blue-400' },
    { id: 'MANAGER', label: 'MANAGER', icon: Crown, color: 'text-purple-400' },
    { id: 'ADMIN', label: 'ADMIN', icon: Shield, color: 'text-red-400' }
  ];

  return (
    <div className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
      <span className="text-sm text-zinc-400">Role:</span>
      <select 
        value={userRole} 
        onChange={(e) => onRoleChange(e.target.value)}
        className="bg-zinc-800 text-white text-sm font-medium px-3 py-2 rounded-lg border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 min-w-[120px]"
      >
        {roles.map(role => {
          const Icon = role.icon;
          return (
            <option key={role.id} value={role.id} className="bg-zinc-800 text-white">
              {role.label}
            </option>
          );
        })}
      </select>
      <span className="text-xs text-zinc-500">({selectedRole} View)</span>
    </div>
  );
};

// Enhanced Filter Tabs Component
const EnhancedFilterTabs = ({ 
  activeTab, 
  onTabChange, 
  sessionCounts 
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
  sessionCounts: { overview: number; boh: number; foh: number; edgeCases: number };
}) => {
  const tabs = [
    { id: 'overview', label: 'Overview', count: sessionCounts.overview, icon: BarChart3 },
    { id: 'boh', label: 'BOH', count: sessionCounts.boh, icon: ChefHat },
    { id: 'foh', label: 'FOH', count: sessionCounts.foh, icon: UserCheck },
    { id: 'edgeCases', label: 'Edge Cases', count: sessionCounts.edgeCases, icon: AlertTriangle }
  ];

  return (
    <div className="flex space-x-2 mb-6">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-teal-600 text-white'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4" />
            {tab.label} ({tab.count})
          </button>
        );
      })}
    </div>
  );
};

// Enhanced Debug Info Bar Component
const EnhancedDebugInfoBar = ({ 
  theme, 
  sessionsLoaded, 
  loading, 
  apiStatus, 
  hitrustStatus 
}: {
  theme: string;
  sessionsLoaded: number;
  loading: boolean;
  apiStatus: string;
  hitrustStatus: string;
}) => {
  return (
    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 mb-6">
      <div className="flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center space-x-4">
          <span>Theme: {theme}</span>
          <span>Sessions Loaded: {sessionsLoaded}</span>
          <span>Loading: {loading ? '⏳' : '✅'}</span>
          <span>API Status: {apiStatus}</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            <span>HiTrust: {hitrustStatus}</span>
          </div>
        </div>
      </div>
    </div>
  );
};



// Enhanced Tab-Specific Session Cards
const EnhancedTabSessionCard = ({ session, tabType, onAction, userRole = 'MANAGER' }: { 
  session: any; 
  tabType: string; 
  onAction?: (action: string, sessionId: string) => void;
  userRole?: 'BOH' | 'FOH' | 'MANAGER' | 'ADMIN';
}) => {
  const getStatusColor = (state: string) => {
    switch (state) {
      case 'CREATED': return 'bg-blue-500/20 border-blue-500/30 text-blue-300';
      case 'ACTIVE': return 'bg-green-500/20 border-green-500/30 text-green-300';
      case 'PREP_IN_PROGRESS': return 'bg-orange-500/20 border-orange-500/30 text-orange-300';
      case 'READY_FOR_DELIVERY': return 'bg-teal-500/20 border-teal-500/30 text-teal-300';
      case 'FOH_PICKUP': return 'bg-purple-500/20 border-purple-500/30 text-purple-300';
      case 'PAUSED': return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300';
      case 'COMPLETED': return 'bg-purple-500/20 border-purple-500/30 text-purple-300';
      case 'PAYMENT_FAILED': return 'bg-red-500/20 border-red-500/30 text-red-300';
      case 'PREP_ISSUE': return 'bg-red-600/20 border-red-600/30 text-red-400';
      case 'BOH_HOLD': return 'bg-yellow-600/20 border-yellow-600/30 text-yellow-400';
      case 'REFILL_NEEDED': return 'bg-blue-600/20 border-blue-600/30 text-blue-400';
      case 'RESOLVED': return 'bg-green-600/20 border-green-600/30 text-green-400';
      case 'PAYMENT_RETRY': return 'bg-orange-600/20 border-orange-600/30 text-orange-400';
      case 'ESCALATED': return 'bg-red-800/20 border-red-800/30 text-red-500';
      default: return 'bg-zinc-500/20 border-zinc-500/30 text-zinc-300';
    }
  };

  const getStatusIcon = (state: string) => {
    switch (state) {
      case 'CREATED': return '⏳';
      case 'PREP_IN_PROGRESS': return '👨‍🍳';
      case 'READY_FOR_DELIVERY': return '📦';
      case 'FOH_PICKUP': return '🚶‍♂️';
      case 'ACTIVE': return '🔥';
      case 'PAUSED': return '⏸️';
      case 'COMPLETED': return '✅';
      case 'PAYMENT_FAILED': return '💳❌';
      case 'PREP_ISSUE': return '⚠️';
      case 'BOH_HOLD': return '⏳';
      case 'REFILL_NEEDED': return '🔄';
      case 'RESOLVED': return '✅';
      case 'PAYMENT_RETRY': return '🔄💳';
      case 'ESCALATED': return '🚨';
      default: return '❓';
    }
  };

  const getTabSpecificActions = () => {
    // Generate HiTrust-enhanced contextual messages based on session data
    const getContextualMessage = (action: string) => {
      const customerName = session.customerName?.split(' ')[0] || 'Customer';
      const tableId = session.tableId;
      const flavor = session.flavor;
      const hiTrust = session.hiTrustIntelligence;
      
      // Base contextual message
      let baseMessage = '';
      switch (action) {
        case 'start_prep':
          baseMessage = `${customerName}'s ${flavor} hookah ready for prep at ${tableId}`;
          break;
        case 'prep_complete':
          baseMessage = `${flavor} hookah prepared and ready for ${customerName} at ${tableId}`;
          break;
        case 'prep_issue':
          baseMessage = `Issue with ${flavor} prep for ${customerName} - needs attention`;
          break;
        case 'foh_pickup':
          baseMessage = `Pick up ${flavor} hookah for ${customerName} at ${tableId}`;
          break;
        case 'deliver_to_table':
          baseMessage = `Deliver ${flavor} to ${customerName} at ${tableId}`;
          break;
        case 'pause':
          baseMessage = `Pause ${customerName}'s ${flavor} session at ${tableId}`;
          break;
        case 'resume':
          baseMessage = `Resume ${customerName}'s ${flavor} session at ${tableId}`;
          break;
        case 'refill_request':
          baseMessage = `Refill ${flavor} for ${customerName} at ${tableId}`;
          break;
        case 'complete':
          baseMessage = `Complete ${customerName}'s ${flavor} session at ${tableId}`;
          break;
        case 'boh_hold':
          baseMessage = `Hold ${flavor} at BOH for ${customerName}`;
          break;
        case 'return_to_boh':
          baseMessage = `Return ${flavor} to BOH from ${tableId}`;
          break;
        case 'boh_refill':
          baseMessage = `Send ${flavor} to BOH for refill`;
          break;
        case 'retry_payment':
          baseMessage = `Retry payment for ${customerName} at ${tableId}`;
          break;
        case 'resolve':
          baseMessage = `Resolve payment issue for ${customerName}`;
          break;
        case 'escalate':
          baseMessage = `Escalate ${customerName}'s payment issue`;
          break;
        default:
          baseMessage = `Action for ${customerName} at ${tableId}`;
      }
      
      // Add HiTrust intelligence insights
      if (hiTrust) {
        const insights = [];
        
        // Add behavioral insights
        if (hiTrust.customerInsights.behaviorPattern === 'premium_spender') {
          insights.push('VIP customer');
        }
        
        // Add refill history
        if (hiTrust.customerInsights.refillHistory > 0) {
          insights.push(`${hiTrust.customerInsights.refillHistory} refills`);
        }
        
        // Add revenue opportunities
        if (hiTrust.revenueIntelligence.potentialUpsell > 0) {
          insights.push(`+$${hiTrust.revenueIntelligence.potentialUpsell} upsell`);
        }
        
        // Add predictive insights
        if (hiTrust.predictiveActions.confidence > 0.8) {
          insights.push(`${Math.round(hiTrust.predictiveActions.confidence * 100)}% confidence`);
        }
        
        if (insights.length > 0) {
          baseMessage += ` (${insights.join(', ')})`;
        }
      }
      
      return baseMessage;
    };

    // BOH/FOH Operational Workflow Logic with Contextual Messages
    const getOperationalActions = () => {
      switch (session.state) {
        case 'CREATED':
          return [
            { 
              action: 'start_prep', 
              label: 'Start Prep', 
              icon: ChefHat, 
              color: 'bg-orange-600 hover:bg-orange-700',
              businessLogic: getContextualMessage('start_prep')
            }
          ];
        case 'PREP_IN_PROGRESS':
          return [
            { 
              action: 'prep_complete', 
              label: 'Prep Complete', 
              icon: CheckCircle, 
              color: 'bg-green-600 hover:bg-green-700',
              businessLogic: getContextualMessage('prep_complete')
            },
            { 
              action: 'prep_issue', 
              label: 'Prep Issue', 
              icon: AlertTriangle, 
              color: 'bg-red-600 hover:bg-red-700',
              businessLogic: getContextualMessage('prep_issue')
            }
          ];
        case 'READY_FOR_DELIVERY':
          return [
            { 
              action: 'foh_pickup', 
              label: 'FOH Pickup', 
              icon: UserCheck, 
              color: 'bg-teal-600 hover:bg-teal-700',
              businessLogic: getContextualMessage('foh_pickup')
            },
            { 
              action: 'boh_hold', 
              label: 'Hold at BOH', 
              icon: Clock, 
              color: 'bg-yellow-600 hover:bg-yellow-700',
              businessLogic: getContextualMessage('boh_hold')
            }
          ];
        case 'FOH_PICKUP':
          return [
            { 
              action: 'deliver_to_table', 
              label: 'Deliver to Table', 
              icon: ArrowDown, 
              color: 'bg-purple-600 hover:bg-purple-700',
              businessLogic: getContextualMessage('deliver_to_table')
            },
            { 
              action: 'return_to_boh', 
              label: 'Return to BOH', 
              icon: ArrowLeft, 
              color: 'bg-orange-600 hover:bg-orange-700',
              businessLogic: getContextualMessage('return_to_boh')
            }
          ];
        case 'ACTIVE':
          return [
            { 
              action: 'pause', 
              label: 'Pause Session', 
              icon: Pause, 
              color: 'bg-yellow-600 hover:bg-yellow-700',
              businessLogic: getContextualMessage('pause')
            },
            { 
              action: 'refill_request', 
              label: 'Refill Request', 
              icon: RotateCcw, 
              color: 'bg-blue-600 hover:bg-blue-700',
              businessLogic: getContextualMessage('refill_request')
            },
            { 
              action: 'complete', 
              label: 'Complete Session', 
              icon: CheckCircle, 
              color: 'bg-green-600 hover:bg-green-700',
              businessLogic: getContextualMessage('complete')
            }
          ];
        case 'PAUSED':
          return [
            { 
              action: 'resume', 
              label: 'Resume Session', 
              icon: Play, 
              color: 'bg-green-600 hover:bg-green-700',
              businessLogic: getContextualMessage('resume')
            },
            { 
              action: 'complete', 
              label: 'Complete Session', 
              icon: CheckCircle, 
              color: 'bg-purple-600 hover:bg-purple-700',
              businessLogic: getContextualMessage('complete')
            }
          ];
        case 'REFILL_NEEDED':
          return [
            { 
              action: 'boh_refill', 
              label: 'BOH Refill', 
              icon: ChefHat, 
              color: 'bg-orange-600 hover:bg-orange-700',
              businessLogic: getContextualMessage('boh_refill')
            },
            { 
              action: 'complete', 
              label: 'Complete Session', 
              icon: CheckCircle, 
              color: 'bg-green-600 hover:bg-green-700',
              businessLogic: getContextualMessage('complete')
            }
          ];
        case 'PAYMENT_FAILED':
          return [
            { 
              action: 'retry_payment', 
              label: 'Retry Payment', 
              icon: CreditCard, 
              color: 'bg-red-600 hover:bg-red-700',
              businessLogic: getContextualMessage('retry_payment')
            },
            { 
              action: 'resolve', 
              label: 'Resolve Issue', 
              icon: Shield, 
              color: 'bg-orange-600 hover:bg-orange-700',
              businessLogic: getContextualMessage('resolve')
            },
            { 
              action: 'escalate', 
              label: 'Escalate', 
              icon: AlertTriangle, 
              color: 'bg-red-600 hover:bg-red-700',
              businessLogic: getContextualMessage('escalate')
            }
          ];
        default:
          return [
            { 
              action: 'view', 
              label: 'View Details', 
              icon: Eye, 
              color: 'bg-zinc-600 hover:bg-zinc-700',
              businessLogic: getContextualMessage('view')
            }
          ];
      }
    };

    // For Overview tab, show operational workflow actions
    if (tabType === 'overview') {
      return getOperationalActions();
    }

    // Role-based action filtering
    const allActions = getOperationalActions();
    
    // Filter by user role first
    let roleFilteredActions = allActions;
    switch (userRole) {
      case 'BOH':
        roleFilteredActions = allActions.filter(action => 
          ['start_prep', 'prep_complete', 'ready_delivery', 'prep_issue'].includes(action.action)
        );
        break;
      case 'FOH':
        roleFilteredActions = allActions.filter(action => 
          ['foh_pickup', 'deliver_to_table', 'pause', 'resume', 'complete', 'refill_request'].includes(action.action)
        );
        break;
      case 'MANAGER':
      case 'ADMIN':
        // Managers and Admins see all actions
        roleFilteredActions = allActions;
        break;
    }
    
    // Then filter by tab type
    switch (tabType) {
      case 'boh':
        return roleFilteredActions.filter(action => 
          ['start_prep', 'prep_complete', 'ready_delivery'].includes(action.action)
        );
      case 'foh':
        return roleFilteredActions.filter(action => 
          ['foh_pickup', 'deliver_to_table', 'pause', 'resume', 'complete', 'refill_request'].includes(action.action)
        );
      case 'edgeCases':
        return roleFilteredActions.filter(action => 
          ['retry_payment', 'resolve', 'escalate'].includes(action.action)
        );
      default:
        return roleFilteredActions;
    }
  };

  const actions = getTabSpecificActions();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-semibold text-white">{session.tableId}</span>
            <span className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${getStatusColor(session.state)}`}>
              <span className="text-sm">{getStatusIcon(session.state)}</span>
              {session.state.replace('_', ' ')}
            </span>
          </div>
          
          {/* Customer Info - Compact */}
          <div className="text-sm text-zinc-300 font-medium">{session.customerName}</div>
          <div className="text-xs text-zinc-500">{session.customerPhone}</div>
          
          {/* Session Details - Only show relevant info */}
          <div className="flex items-center gap-3 mt-2 text-xs">
            {session.timerDuration && (
              <span className="text-zinc-400">
                {session.timerDuration}min | {session.startedAt ? new Date(session.startedAt).toLocaleTimeString() : 'N/A'}
              </span>
            )}
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              session.pricingModel === 'time-based' 
                ? 'bg-blue-500/20 text-blue-300' 
                : 'bg-green-500/20 text-green-300'
            }`}>
              {session.pricingModel === 'time-based' ? 'Time-based' : 'Flat rate'}
            </span>
          </div>
        </div>
        
        {/* Price and Flavor - Right aligned */}
        <div className="text-right">
          <div className="text-lg font-semibold text-green-400">${(session.priceCents / 100).toFixed(2)}</div>
          <div className="text-xs text-zinc-400 max-w-24 truncate">{session.flavor}</div>
        </div>
      </div>

      {/* Staff Assignment */}
      {session.assignedBOH && session.assignedFOH && (
        <div className="text-xs text-zinc-500 mb-3">
          Staff: {session.assignedBOH} (BOH) • {session.assignedFOH} (FOH)
        </div>
      )}

      {/* Customer KPIs - Compact operational view */}
      <div className="mt-3 p-2 bg-zinc-800/30 rounded-lg border border-zinc-700">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <span className="text-zinc-400">Satisfaction:</span>
            <span className="text-green-400 font-medium">{session.customerKPIs?.satisfaction || 'N/A'}/5</span>
            <span className="text-zinc-400">•</span>
            <span className="text-zinc-400">Loyalty:</span>
            <span className="text-blue-400 font-medium">{session.customerKPIs?.loyaltyTier || 'New'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-400">Avg:</span>
            <span className="text-green-400 font-medium">${session.customerKPIs?.avgSpend || 0}</span>
            <span className="text-zinc-400">•</span>
            <span className="text-cyan-400 font-medium">{session.customerKPIs?.visitFrequency || 'First'}</span>
          </div>
        </div>
      </div>

      {/* HiTrust Intelligence Layer */}
      {session.hiTrustIntelligence && (
        <div className="mt-3 p-3 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg border border-blue-500/30">
          <div className="text-xs text-blue-300 font-medium mb-2 flex items-center gap-1">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
            HiTrust Intelligence
          </div>
          
          {/* Predictive Actions */}
          <div className="mb-2">
            <div className="text-xs text-zinc-400 mb-1">Predicted Next Actions:</div>
            <div className="flex flex-wrap gap-1">
              {session.hiTrustIntelligence.predictiveActions.likelyNext.map((action: string, index: number) => (
                <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">
                  {action.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>

          {/* Revenue Intelligence */}
          <div className="mb-2">
            <div className="text-xs text-zinc-400 mb-1">Revenue Opportunities:</div>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-green-400">
                +${session.hiTrustIntelligence.revenueIntelligence.potentialUpsell}
              </span>
              <span className="text-zinc-500">•</span>
              <span className="text-blue-400">
                {Math.round(session.hiTrustIntelligence.predictiveActions.refillProbability * 100)}% refill
              </span>
              <span className="text-zinc-500">•</span>
              <span className="text-purple-400">
                {Math.round(session.hiTrustIntelligence.predictiveActions.timeExtensionProbability * 100)}% extend
              </span>
            </div>
          </div>

          {/* Customer Insights */}
          <div className="text-xs text-zinc-500">
            <span className="text-zinc-400">Behavior:</span> {session.hiTrustIntelligence.customerInsights.behaviorPattern.replace('_', ' ')}
            <span className="text-zinc-500 mx-2">•</span>
            <span className="text-zinc-400">Refills:</span> {session.hiTrustIntelligence.customerInsights.refillHistory}
            <span className="text-zinc-500 mx-2">•</span>
            <span className="text-zinc-400">Confidence:</span> {Math.round(session.hiTrustIntelligence.predictiveActions.confidence * 100)}%
          </div>
        </div>
      )}

      {/* Session Notes - Operational notes only, no redundant info */}
      <div className="mt-3 p-2 bg-zinc-800/30 border border-zinc-700 rounded-lg">
        <div className="text-xs text-zinc-400 font-medium mb-1 flex items-center gap-1">
          <Info className="w-3 h-3" /> Operational Notes:
        </div>
        <div className="text-xs text-zinc-300">
          {session.operationalNotes || 'No operational notes. Add special instructions, allergies, or service notes.'}
        </div>
      </div>

      {/* Edge Case Details */}
      {session.edgeCase && (
        <div className="mt-3 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="text-xs text-red-300 font-medium mb-1">
            Edge Case: {session.edgeCaseType}
          </div>
          {session.edgeCaseDetails && (
            <div className="text-xs text-red-400">
              Error: {session.edgeCaseDetails.errorCode} | Retries: {session.edgeCaseDetails.retryCount}
            </div>
          )}
        </div>
      )}

      {/* Tab-Specific Actions with Business Logic */}
      <div className="flex flex-wrap gap-2 mt-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <div key={action.action} className="relative group">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onAction?.(action.action, session.id)}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-white text-xs font-medium transition-colors ${action.color || 'bg-zinc-700 hover:bg-zinc-600'}`}
                title={action.businessLogic}
              >
                <Icon className="w-3 h-3" />
                {action.label}
                {action.businessLogic && (
                  <Info className="w-3 h-3 ml-1 opacity-60" />
                )}
              </motion.button>
              
              {/* Business Logic Tooltip */}
              {action.businessLogic && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-zinc-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 max-w-xs">
                  <div className="text-center font-medium text-zinc-300 mb-1">Business Logic:</div>
                  <div className="text-zinc-400">{action.businessLogic}</div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-zinc-900"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Status Transition Indicator */}
      {session.lastUpdated && (
        <div className="mt-2 text-xs text-zinc-500 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Last updated: {new Date(session.lastUpdated).toLocaleTimeString()}
        </div>
      )}
    </motion.div>
  );
};


// Main enhanced FSD component
export default function EnhancedFSDDesign({ 
  sessions = [],
  userRole = 'MANAGER',
  onSessionAction,
  className = ''
}: {
  sessions?: any[];
  userRole?: 'BOH' | 'FOH' | 'MANAGER' | 'ADMIN';
  onSessionAction?: (action: string, sessionId: string) => void;
  className?: string;
}) {
  const [selectedFlavors, setSelectedFlavors] = useState<any[]>([]);
  const [activeView, setActiveView] = useState<'sessions' | 'flavors' | 'analytics'>('sessions');
  
  // Enhanced state management for Classic Design business logic
  const [selectedRole, setSelectedRole] = useState<'FOH' | 'BOH'>('FOH');
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState('Connected');
  const [hitrustStatus, setHitrustStatus] = useState('Verified');
  const [theme, setTheme] = useState('midnight');
  const [notifications, setNotifications] = useState<any[]>([]);
  
  // Notification system disabled to prevent banner notifications
  const addNotification = useCallback((type: 'success' | 'error' | 'info', message: string, sessionId?: string) => {
    // Notifications disabled per user request
    console.log(`[${type.toUpperCase()}] ${message}`, sessionId ? `Session: ${sessionId}` : '');
  }, []);

  // Enhanced session state management with real-time updates
  const updateSessionState = useCallback((sessionId: string, newState: string, additionalData?: any) => {
    // Since sessions is a prop, we'll trigger a refresh instead of direct state update
    // The parent component should handle the state update
    window.dispatchEvent(new CustomEvent('sessionStateUpdate', { 
      detail: { sessionId, newState, additionalData } 
    }));
    
    // Add notification for state change
    addNotification('info', `Session ${sessionId} state changed to ${newState.replace('_', ' ')}`, sessionId);
  }, [addNotification]);
  

  

  const refreshSessions = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setApiStatus('Connected');
    } catch (error) {
      setApiStatus('Disconnected');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRoleChange = useCallback((role: string) => {
    // Role is now managed by parent component
    console.log(`Role changed to: ${role}`);
    // Determine view based on role
    switch (role) {
      case 'BOH': setSelectedRole('BOH'); break;
      case 'FOH': setSelectedRole('FOH'); break;
      case 'MANAGER': setSelectedRole('FOH'); break;
      case 'ADMIN': setSelectedRole('FOH'); break;
      default: setSelectedRole('FOH');
    }
  }, []);

  // Tab-specific API routing functions
  const handleTabAction = useCallback(async (action: string, sessionId: string) => {
    setLoading(true);
    try {
      let endpoint = '';
      let method = 'POST';
      let body: any = { sessionId };
      let newState = '';

      switch (action) {
        // Overview Tab Actions
        case 'view':
          // Navigate to session details
          window.open(`/sessions/${sessionId}`, '_blank');
          return;
        case 'edit':
          // Open edit modal
          window.dispatchEvent(new CustomEvent('openEditSessionModal', { detail: { sessionId } }));
          return;

        // BOH Workflow Actions
        case 'start_prep':
          endpoint = '/api/sessions/[id]/transition';
          newState = 'PREP_IN_PROGRESS';
          body = { 
            sessionId, 
            newState, 
            operatorId: 'enhanced_fsd', 
            workflow: 'BOH_START_PREP',
            businessLogic: 'BOH begins hookah preparation: coals heating, bowl packing, flavor mixing',
            timestamp: new Date().toISOString()
          };
          break;
        case 'prep_complete':
          endpoint = '/api/sessions/[id]/transition';
          newState = 'READY_FOR_DELIVERY';
          body = { 
            sessionId, 
            newState, 
            operatorId: 'enhanced_fsd', 
            workflow: 'BOH_PREP_COMPLETE',
            businessLogic: 'BOH completes preparation: hookah assembled, coals ready, quality checked, ready for FOH pickup',
            timestamp: new Date().toISOString()
          };
          break;
        case 'prep_issue':
          endpoint = '/api/sessions/[id]/transition';
          newState = 'PREP_ISSUE';
          body = { 
            sessionId, 
            newState, 
            operatorId: 'enhanced_fsd', 
            workflow: 'BOH_PREP_ISSUE',
            businessLogic: 'BOH encounters issue: missing ingredients, equipment problem, needs management intervention',
            timestamp: new Date().toISOString()
          };
          break;
        case 'boh_hold':
          endpoint = '/api/sessions/[id]/transition';
          newState = 'BOH_HOLD';
          body = { 
            sessionId, 
            newState, 
            operatorId: 'enhanced_fsd', 
            workflow: 'BOH_HOLD',
            businessLogic: 'Hold hookah at BOH station: customer not ready, table not available, special timing request',
            timestamp: new Date().toISOString()
          };
          break;

        // FOH Workflow Actions
        case 'foh_pickup':
          endpoint = '/api/sessions/[id]/transition';
          newState = 'FOH_PICKUP';
          body = { 
            sessionId, 
            newState, 
            operatorId: 'enhanced_fsd', 
            workflow: 'FOH_PICKUP',
            businessLogic: 'FOH collects prepared hookah from BOH station, verifies completeness, begins delivery to table',
            timestamp: new Date().toISOString()
          };
          break;
        case 'deliver_to_table':
          endpoint = '/api/sessions/[id]/transition';
          newState = 'ACTIVE';
          body = { 
            sessionId, 
            newState, 
            operatorId: 'enhanced_fsd', 
            workflow: 'FOH_DELIVER',
            businessLogic: 'FOH delivers hookah to table: setup complete, customer briefed, session timer started',
            timestamp: new Date().toISOString()
          };
          break;
        case 'return_to_boh':
          endpoint = '/api/sessions/[id]/transition';
          newState = 'PREP_IN_PROGRESS';
          body = { 
            sessionId, 
            newState, 
            operatorId: 'enhanced_fsd', 
            workflow: 'FOH_RETURN_TO_BOH',
            businessLogic: 'Return hookah to BOH: customer not at table, table issue, needs re-preparation',
            timestamp: new Date().toISOString()
          };
          break;
        case 'pause':
          endpoint = '/api/sessions/[id]/transition';
          newState = 'PAUSED';
          body = { 
            sessionId, 
            newState, 
            operatorId: 'enhanced_fsd', 
            workflow: 'FOH_PAUSE',
            businessLogic: 'Pause active session: customer step away, coals cooling, timer paused, session preserved',
            timestamp: new Date().toISOString()
          };
          break;
        case 'resume':
          endpoint = '/api/sessions/[id]/transition';
          newState = 'ACTIVE';
          body = { 
            sessionId, 
            newState, 
            operatorId: 'enhanced_fsd', 
            workflow: 'FOH_RESUME',
            businessLogic: 'Resume paused session: customer returned, coals reheated, timer restarted, service continues',
            timestamp: new Date().toISOString()
          };
          break;
        case 'complete':
          endpoint = '/api/sessions/[id]/transition';
          newState = 'COMPLETED';
          body = { 
            sessionId, 
            newState, 
            operatorId: 'enhanced_fsd', 
            workflow: 'FOH_COMPLETE',
            businessLogic: 'Session completed: customer finished, cleanup initiated, payment processed, table cleared',
            timestamp: new Date().toISOString()
          };
          break;
        case 'refill_request':
          endpoint = '/api/sessions/[id]/refill';
          newState = 'REFILL_NEEDED';
          body = { 
            sessionId, 
            newState,
            operatorId: 'enhanced_fsd', 
            workflow: 'FOH_REFILL_REQUEST',
            businessLogic: 'Customer requests refill: return to BOH for new coals/flavor, maintain session continuity',
            timestamp: new Date().toISOString()
          };
          break;
        case 'boh_refill':
          endpoint = '/api/sessions/[id]/transition';
          newState = 'REFILL_NEEDED';
          body = { 
            sessionId, 
            newState, 
            operatorId: 'enhanced_fsd', 
            workflow: 'FOH_TO_BOH_REFILL',
            businessLogic: 'Send to BOH for refill: new coals, flavor refresh, quality check, return to FOH',
            timestamp: new Date().toISOString()
          };
          break;

        // Edge Case Actions
        case 'resolve':
          endpoint = '/api/ktl4/break-glass';
          newState = 'RESOLVED';
          body = { 
            actionType: 'manual_override', 
            targetId: sessionId, 
            operatorId: 'enhanced_fsd',
            reason: 'Manual resolution of edge case',
            newState,
            timestamp: new Date().toISOString()
          };
          break;
        case 'retry_payment':
          endpoint = '/api/payments/retry';
          newState = 'PAYMENT_RETRY';
          body = { 
            sessionId, 
            operatorId: 'enhanced_fsd',
            newState,
            timestamp: new Date().toISOString()
          };
          break;
        case 'escalate':
          endpoint = '/api/ktl4/alerts';
          newState = 'ESCALATED';
          body = { 
            priority: 'high',
            flowName: 'session_lifecycle',
            alertType: 'escalation',
            message: `Session ${sessionId} requires escalation`,
            details: { sessionId },
            operatorId: 'enhanced_fsd',
            newState,
            timestamp: new Date().toISOString()
          };
          break;

        default:
          console.warn('Unknown action:', action);
          return;
      }

      // Make API call
      const response = await fetch(endpoint.replace('[id]', sessionId), {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`${action} successful:`, result);
        
        // Update local session state immediately for better UX
        if (newState) {
          updateSessionState(sessionId, newState);
        }
        
        // Refresh sessions after successful action
        await refreshSessions();
        
        // Trigger custom event for UI updates
        window.dispatchEvent(new CustomEvent('sessionActionCompleted', { 
          detail: { action, sessionId, result, newState } 
        }));

        // Show success notification
        addNotification('success', `Session ${sessionId} ${action.replace('_', ' ')} successful`, sessionId);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API call failed: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error(`Failed to execute ${action}:`, error);
      // Show error notification
      addNotification('error', `Failed to ${action.replace('_', ' ')} session ${sessionId}`, sessionId);
    } finally {
      setLoading(false);
    }
  }, [refreshSessions, updateSessionState, addNotification]);

  // Enhanced sample data for QA testing - demonstrates full guest-to-lounge-owner workflow
  const sampleSessions = [
    // OVERVIEW TAB SESSIONS - Complete Workflow States
    {
      id: 'session_T-001_1758552685415',
      tableId: 'T-001',
      customerRef: '15551234556',
      flavor: 'Blue Mist + Mint',
      priceCents: 3500,
      state: 'ACTIVE',
      assignedBOHId: 'boh-1',
      assignedFOHId: 'foh-1',
      startedAt: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
      timerDuration: 60,
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
      updatedAt: new Date(),
      assignedBOH: 'Mike Rodriguez',
      assignedFOH: 'Sarah Chen',
      operationalNotes: 'VIP customer - prefers extra mint, allergic to rose flavors',
      customerName: 'Alex Johnson',
      customerPhone: '+1 (555) 123-4567',
      flavorMix: ['Blue Mist', 'Mint'],
      pricingModel: 'time-based',
      basePrice: 30,
      flavorMixPrice: 5,
      customerKPIs: {
        satisfaction: 4.8,
        repeatCustomer: true,
        avgSpend: 45,
        loyaltyTier: 'Gold',
        visitFrequency: 'Weekly'
      },
      // HiTrust Intelligence Layer
      hiTrustIntelligence: {
        customerInsights: {
          behaviorPattern: 'premium_spender',
          refillHistory: 2, // 2 refills this session
          avgSessionDuration: 65, // minutes
          preferredFlavors: ['Blue Mist', 'Mint', 'Double Apple'],
          timeExtensionRate: 0.3, // 30% of sessions
          flavorAddOnRate: 0.6 // 60% add flavors
        },
        operationalMetrics: {
          staffEfficiency: 0.95,
          issueResolutionRate: 1.0,
          customerRetentionRate: 0.92,
          avgPrepTime: 7, // minutes
          avgDeliveryTime: 2 // minutes
        },
        revenueIntelligence: {
          currentOrderValue: 35.00,
          potentialUpsell: 12.50, // time extension + flavor add-on
          refillRevenue: 8.00,
          loyaltyDiscount: 0.1, // 10% for Gold tier
          suggestedActions: ['time_extension', 'flavor_addon', 'refill']
        },
        predictiveActions: {
          likelyNext: ['REFILL_NEEDED', 'TIME_EXTENSION'],
          refillProbability: 0.7,
          timeExtensionProbability: 0.4,
          completionProbability: 0.3,
          confidence: 0.85
        }
      }
    },
    // BOH TAB SESSIONS (2 total)
    {
      id: 'session_T-003_1758552685416',
      tableId: 'T-003',
      customerRef: '15551234557',
      flavor: 'Strawberry Mojito',
      priceCents: 2800,
      state: 'PREP_IN_PROGRESS',
      assignedBOHId: 'boh-2',
      assignedFOHId: 'foh-2',
      createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      updatedAt: new Date(),
      assignedBOH: 'David Wilson',
      assignedFOH: 'Emily Davis',
      operationalNotes: 'First-time customer, prefers mild flavors, table near window',
      customerName: 'Maria Garcia',
      customerPhone: '+1 (555) 234-5678',
      flavorMix: ['Strawberry', 'Mint', 'Lime'],
      pricingModel: 'flat',
      basePrice: 30,
      flavorMixPrice: 8,
      customerKPIs: {
        satisfaction: 4.5,
        repeatCustomer: false,
        avgSpend: 28,
        loyaltyTier: 'Silver',
        visitFrequency: 'Monthly'
      },
      // HiTrust Intelligence Layer
      hiTrustIntelligence: {
        customerInsights: {
          behaviorPattern: 'first_time_customer',
          refillHistory: 0,
          avgSessionDuration: 45,
          preferredFlavors: ['Strawberry', 'Mint', 'Lime'],
          timeExtensionRate: 0.1,
          flavorAddOnRate: 0.2
        },
        operationalMetrics: {
          staffEfficiency: 0.88,
          issueResolutionRate: 0.95,
          customerRetentionRate: 0.75,
          avgPrepTime: 10,
          avgDeliveryTime: 3
        },
        revenueIntelligence: {
          currentOrderValue: 28.00,
          potentialUpsell: 5.00,
          refillRevenue: 0.00,
          loyaltyDiscount: 0.05,
          suggestedActions: ['flavor_addon', 'time_extension']
        },
        predictiveActions: {
          likelyNext: ['COMPLETED', 'FLAVOR_ADDON'],
          refillProbability: 0.2,
          timeExtensionProbability: 0.1,
          completionProbability: 0.8,
          confidence: 0.75
        }
      }
    },
    {
      id: 'session_T-005_1758552685417',
      tableId: 'T-005',
      customerRef: '15551234558',
      flavor: 'Double Apple + Cardamom',
      priceCents: 4200,
      state: 'READY_FOR_DELIVERY',
      assignedBOHId: 'boh-1',
      assignedFOHId: 'foh-3',
      createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      updatedAt: new Date(),
      assignedBOH: 'Mike Rodriguez',
      assignedFOH: 'James Brown',
      operationalNotes: 'Regular customer, strong flavor preference, birthday celebration',
      customerName: 'Ahmed Hassan',
      customerPhone: '+1 (555) 345-6789',
      flavorMix: ['Double Apple', 'Cardamom'],
      pricingModel: 'time-based',
      basePrice: 30,
      flavorMixPrice: 12,
      customerKPIs: {
        satisfaction: 4.9,
        repeatCustomer: true,
        avgSpend: 52,
        loyaltyTier: 'Platinum',
        visitFrequency: 'Bi-weekly'
      }
    },
    // FOH TAB SESSIONS (2 total)
    {
      id: 'session_T-007_1758552685418',
      tableId: 'T-007',
      customerRef: '15551234559',
      flavor: 'Watermelon Mint',
      priceCents: 3200,
      state: 'COMPLETED',
      assignedBOHId: 'boh-2',
      assignedFOHId: 'foh-1',
      startedAt: new Date(Date.now() - 90 * 60 * 1000), // 90 minutes ago
      endedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      timerDuration: 60,
      createdAt: new Date(Date.now() - 95 * 60 * 1000),
      updatedAt: new Date(Date.now() - 30 * 60 * 1000),
      assignedBOH: 'David Wilson',
      assignedFOH: 'Sarah Chen',
      operationalNotes: 'Completed session, left positive review, recommended to friends',
      customerName: 'Jennifer Lee',
      customerPhone: '+1 (555) 456-7890',
      flavorMix: ['Watermelon', 'Mint'],
      pricingModel: 'flat',
      basePrice: 30,
      flavorMixPrice: 2,
      customerKPIs: {
        satisfaction: 4.7,
        repeatCustomer: true,
        avgSpend: 38,
        loyaltyTier: 'Gold',
        visitFrequency: 'Weekly'
      }
    },
    {
      id: 'session_T-009_1758552685419',
      tableId: 'T-009',
      customerRef: '15551234560',
      flavor: 'Rose + Lavender',
      priceCents: 4500,
      state: 'PAUSED',
      assignedBOHId: 'boh-1',
      assignedFOHId: 'foh-2',
      startedAt: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      timerDuration: 90,
      createdAt: new Date(Date.now() - 50 * 60 * 1000),
      updatedAt: new Date(),
      assignedBOH: 'Mike Rodriguez',
      assignedFOH: 'Emily Davis',
      operationalNotes: 'Customer stepped out for phone call, will return in 10 minutes',
      customerName: 'Robert Kim',
      customerPhone: '+1 (555) 567-8901',
      flavorMix: ['Rose', 'Lavender'],
      pricingModel: 'time-based',
      basePrice: 30,
      flavorMixPrice: 15,
      customerKPIs: {
        satisfaction: 4.6,
        repeatCustomer: false,
        avgSpend: 42,
        loyaltyTier: 'Silver',
        visitFrequency: 'Monthly'
      }
    },
    // EDGE CASE SESSION (1 total)
    {
      id: 'session_T-011_1758552685420',
      tableId: 'T-011',
      customerRef: '15551234561',
      flavor: 'Payment Failed Session',
      priceCents: 0,
      state: 'PAYMENT_FAILED',
      assignedBOHId: 'boh-2',
      assignedFOHId: 'foh-3',
      createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      updatedAt: new Date(),
      assignedBOH: 'David Wilson',
      assignedFOH: 'James Brown',
      operationalNotes: 'Payment declined - card expired, customer needs to update payment method',
      customerName: 'Lisa Wang',
      customerPhone: '+1 (555) 678-9012',
      flavorMix: ['Double Apple'],
      pricingModel: 'flat',
      basePrice: 30,
      flavorMixPrice: 0,
      edgeCase: true,
      edgeCaseType: 'PAYMENT_FAILED',
      edgeCaseDetails: {
        errorCode: 'CARD_DECLINED',
        retryCount: 2,
        lastAttempt: new Date(Date.now() - 5 * 60 * 1000),
        requiresManualIntervention: true
      },
      customerKPIs: {
        satisfaction: 3.2,
        repeatCustomer: false,
        avgSpend: 0,
        loyaltyTier: 'New',
        visitFrequency: 'First Visit'
      }
    }
  ];
  
  // Use sample data if no sessions provided, otherwise use provided sessions
  const displaySessions = sessions.length > 0 ? sessions : sampleSessions;
  
  const metrics = [
    {
      title: 'Active Sessions',
      value: displaySessions.filter(s => s.state === 'ACTIVE').length.toString(),
      icon: <Flame className="w-6 h-6" />,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      change: '+12%',
      changeType: 'positive' as const
    },
    {
      title: 'Total Revenue',
      value: `$${(displaySessions.reduce((sum, s) => sum + (s.priceCents || 0), 0) / 100).toFixed(0)}`,
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      change: '+5%',
      changeType: 'positive' as const
    },
    {
      title: 'System Health',
      value: 'EXCELLENT',
      icon: <Heart className="w-6 h-6" />,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      change: '0%',
      changeType: 'neutral' as const
    },
    {
      title: 'Trust Score',
      value: '92%',
      icon: <Star className="w-6 h-6" />,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      change: 'Trust Aligned',
      changeType: 'positive' as const
    }
  ];
  
  const handleFlavorSelect = (flavor: any) => {
    setSelectedFlavors(prev => [...prev, flavor]);
  };
  
  const clearSelectedFlavors = () => {
    setSelectedFlavors([]);
  };
  
  const totalPrice = selectedFlavors.reduce((sum, flavor) => sum + flavor.price, 0);
  
  return (
    <div className={`min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white ${className}`}>
      {/* Global Navigation */}
      <div className="bg-zinc-900/50 backdrop-blur-sm border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🍃</div>
              <div>
                <h1 className="text-xl font-bold">Hookah+ Operations</h1>
                <p className="text-sm text-zinc-400">Fire Session Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-zinc-400">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Live</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/30">
                <Flame className="w-8 h-8 text-teal-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  Fire Session Dashboard
                </h1>
                <p className="text-xl text-zinc-400">
                  Enterprise-grade session management with AI-powered intelligence
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-400 font-medium">Live</span>
              </div>
              
              {/* Role Selector - Keep for role-based functionality */}
              <EnhancedRoleSelector
                userRole={userRole}
                onRoleChange={handleRoleChange}
                selectedRole={selectedRole}
              />
              
            </div>
          </div>
        </motion.div>
        
        {/* Enhanced Metrics */}
        <EnhancedMetrics metrics={metrics} />
        
        {/* Debug Info Bar */}
        <EnhancedDebugInfoBar
          theme={theme}
          sessionsLoaded={displaySessions.length}
          loading={loading}
          apiStatus={apiStatus}
          hitrustStatus={hitrustStatus}
        />
        
        {/* Filter Tabs */}
        <EnhancedFilterTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          sessionCounts={{
            overview: displaySessions.length,
            boh: displaySessions.filter(s => s.state === 'PREP_IN_PROGRESS' || s.state === 'READY_FOR_DELIVERY').length,
            foh: displaySessions.filter(s => s.state === 'ACTIVE' || s.state === 'PAUSED').length,
            edgeCases: displaySessions.filter(s => s.edgeCase).length
          }}
        />
        
        {/* View Toggle */}
        <div className="flex items-center gap-2 mb-6">
          {[
            { id: 'sessions', label: 'Sessions', icon: Clock },
            { id: 'flavors', label: 'Flavor Mix', icon: Sparkles },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 }
          ].map((view) => {
            const Icon = view.icon;
            return (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeView === view.id
                    ? 'bg-teal-500/20 border border-teal-500/30 text-teal-300'
                    : 'bg-white/5 border border-white/10 text-neutral-300 hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                {view.label}
              </button>
            );
          })}
        </div>
        
        {/* Enhanced Selection Bar */}
        {selectedFlavors.length > 0 && (
          <EnhancedSelectionBar
            title="Selected Flavors"
            selectedItems={selectedFlavors}
            totalPrice={totalPrice}
            onClear={clearSelectedFlavors}
            className="mb-6"
          />
        )}
        
        {/* Content Based on Active Tab */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* HiTrust Intelligence Dashboard */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl border border-blue-500/30"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></span>
                    <h2 className="text-lg font-semibold text-blue-300">HiTrust Intelligence Dashboard</h2>
                  </div>
                  <div className="text-xs text-zinc-400">
                    Real-time operational insights
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Revenue Intelligence */}
                  <div className="p-3 bg-zinc-800/30 rounded-lg border border-zinc-700">
                    <div className="text-xs text-zinc-400 mb-1">Revenue Opportunities</div>
                    <div className="text-lg font-semibold text-green-400">+$47.50</div>
                    <div className="text-xs text-zinc-500">Across all sessions</div>
                  </div>
                  
                  {/* Predictive Actions */}
                  <div className="p-3 bg-zinc-800/30 rounded-lg border border-zinc-700">
                    <div className="text-xs text-zinc-400 mb-1">Predicted Actions</div>
                    <div className="text-lg font-semibold text-blue-400">3 Refills</div>
                    <div className="text-xs text-zinc-500">85% confidence</div>
                  </div>
                  
                  {/* Customer Insights */}
                  <div className="p-3 bg-zinc-800/30 rounded-lg border border-zinc-700">
                    <div className="text-xs text-zinc-400 mb-1">Customer Behavior</div>
                    <div className="text-lg font-semibold text-purple-400">Premium</div>
                    <div className="text-xs text-zinc-500">2 VIP customers</div>
                  </div>
                  
                  {/* Operational Efficiency */}
                  <div className="p-3 bg-zinc-800/30 rounded-lg border border-zinc-700">
                    <div className="text-xs text-zinc-400 mb-1">Staff Efficiency</div>
                    <div className="text-lg font-semibold text-cyan-400">92%</div>
                    <div className="text-xs text-zinc-500">Average across teams</div>
                  </div>
                </div>
              </motion.div>

              {/* Live Sessions Header */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <h2 className="text-2xl font-bold text-white">Live Sessions</h2>
                <span className="text-sm text-zinc-400">Overview Dashboard - All Roles</span>
              </div>
              
              {/* Unified Live Sessions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displaySessions.map((session) => (
                  <EnhancedTabSessionCard
                    key={session.id}
                    session={session}
                    tabType="overview"
                    userRole={userRole}
                    onAction={handleTabAction}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'boh' && (
            <motion.div
              key="boh"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="mb-4 p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl">
                <h3 className="text-lg font-semibold text-orange-300 mb-2">👨‍🍳 BOH (Back of House) Workflow</h3>
                <p className="text-sm text-zinc-400">
                  Prep and preparation workflow management with staff coordination and quality control.
                </p>
              </div>
              <div className="grid gap-4">
                {displaySessions.filter(s => s.state === 'PREP_IN_PROGRESS' || s.state === 'READY_FOR_DELIVERY').map((session) => (
                  <EnhancedTabSessionCard
                    key={session.id}
                    session={session}
                    tabType="boh"
                    onAction={handleTabAction}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'foh' && (
            <motion.div
              key="foh"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="mb-4 p-4 bg-gradient-to-r from-green-500/10 to-teal-500/10 border border-green-500/20 rounded-xl">
                <h3 className="text-lg font-semibold text-green-300 mb-2">👥 FOH (Front of House) Service</h3>
                <p className="text-sm text-zinc-400">
                  Customer service and session management with real-time monitoring and satisfaction tracking.
                </p>
              </div>
              <div className="grid gap-4">
                {displaySessions.filter(s => s.state === 'ACTIVE' || s.state === 'PAUSED').map((session) => (
                  <EnhancedTabSessionCard
                    key={session.id}
                    session={session}
                    tabType="foh"
                    onAction={handleTabAction}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'edgeCases' && (
            <motion.div
              key="edgeCases"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="mb-4 p-4 bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/20 rounded-xl">
                <h3 className="text-lg font-semibold text-red-300 mb-2">⚠️ Edge Cases & Error Handling</h3>
                <p className="text-sm text-zinc-400">
                  Critical issues requiring immediate attention: payment failures, system errors, and manual intervention.
                </p>
              </div>
              <div className="grid gap-4">
                {displaySessions.filter(s => s.edgeCase).map((session) => (
                  <EnhancedTabSessionCard
                    key={session.id}
                    session={session}
                    tabType="edgeCases"
                    onAction={handleTabAction}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Legacy Sessions View */}
          {activeView === 'sessions' && (
            <motion.div
              key="sessions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center space-x-3 mb-4">
                <Clock className="w-6 h-6 text-teal-400" />
                <h2 className="text-2xl font-bold text-white">Live Sessions</h2>
                <span className="text-sm text-zinc-400">Role-Specific Management - {userRole}</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displaySessions.map((session) => (
                  <EnhancedSessionCard
                    key={session.id}
                    session={session}
                    onAction={onSessionAction}
                    variant={session.state === 'ACTIVE' ? 'live' : 'default'}
                  />
                ))}
              </div>
            </motion.div>
          )}
          
          {activeView === 'flavors' && (
            <motion.div
              key="flavors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <EnhancedFlavorSelection
                onFlavorSelect={handleFlavorSelect}
                selectedFlavors={selectedFlavors}
              />
            </motion.div>
          )}
          
          {activeView === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center space-x-3 mb-4">
                <BarChart3 className="w-6 h-6 text-teal-400" />
                <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
                <span className="text-sm text-zinc-400">Performance Insights</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EnhancedCard variant="glass">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Revenue Trends</h3>
                    <div className="text-3xl font-bold text-teal-400 mb-2">$1,247</div>
                    <div className="text-sm text-zinc-400">+5% from last week</div>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Today:</span>
                        <span className="text-green-400">$247</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">This Week:</span>
                        <span className="text-teal-400">$1,247</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">This Month:</span>
                        <span className="text-blue-400">$4,892</span>
                      </div>
                    </div>
                  </div>
                </EnhancedCard>
                
                <EnhancedCard variant="glass">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Session Performance</h3>
                    <div className="text-3xl font-bold text-green-400 mb-2">92%</div>
                    <div className="text-sm text-zinc-400">Success Rate</div>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Avg Duration:</span>
                        <span className="text-blue-400">58 min</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Customer Satisfaction:</span>
                        <span className="text-green-400">4.8/5</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Repeat Rate:</span>
                        <span className="text-purple-400">67%</span>
                      </div>
                    </div>
                  </div>
                </EnhancedCard>
                
                <EnhancedCard variant="glass">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Popular Flavors</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-300">Blue Mist + Mint</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-zinc-700 rounded-full h-2">
                            <div className="bg-teal-400 h-2 rounded-full" style={{ width: '85%' }}></div>
                          </div>
                          <span className="text-teal-400 text-sm">85%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-300">Strawberry Mojito</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-zinc-700 rounded-full h-2">
                            <div className="bg-green-400 h-2 rounded-full" style={{ width: '72%' }}></div>
                          </div>
                          <span className="text-green-400 text-sm">72%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-300">Watermelon Mint</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-zinc-700 rounded-full h-2">
                            <div className="bg-blue-400 h-2 rounded-full" style={{ width: '68%' }}></div>
                          </div>
                          <span className="text-blue-400 text-sm">68%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </EnhancedCard>
                
                <EnhancedCard variant="glass">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Staff Performance</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-300">Mike Rodriguez (BOH)</span>
                        <span className="text-green-400 text-sm">3 sessions</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-300">Sarah Chen (FOH)</span>
                        <span className="text-teal-400 text-sm">2 sessions</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-300">Emily Davis (FOH)</span>
                        <span className="text-blue-400 text-sm">2 sessions</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-300">David Wilson (BOH)</span>
                        <span className="text-purple-400 text-sm">2 sessions</span>
                      </div>
                    </div>
                  </div>
                </EnhancedCard>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* HiTrust Signal Display */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 rounded-xl bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 p-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-purple-300">HiTrust Intelligence Active</h3>
          </div>
          <p className="text-zinc-400 text-sm">
            All session data is cryptographically verified and trust-stamped for maximum security and compliance.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
