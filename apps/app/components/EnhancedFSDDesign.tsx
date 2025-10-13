"use client";

import React, { useState, useMemo } from 'react';
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
  ChevronRight
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
          Duration: {session.timerDuration}min | Started: {session.startedAt ? new Date(session.startedAt).toLocaleTimeString() : 'N/A'}
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">Revenue:</span>
          <span className="text-green-400 font-semibold">${(session.priceCents / 100).toFixed(2)}</span>
        </div>
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
        { id: "blue-mist", name: "Blue Mist Hookah", price: 32, description: "Premium blueberry mint blend with smooth clouds", quickAdd: true },
        { id: "double-apple", name: "Double Apple Hookah", price: 30, description: "Classic apple flavor with authentic taste", quickAdd: true },
        { id: "mint-fresh", name: "Mint Fresh Hookah", price: 29, description: "Cool mint with refreshing aftertaste", quickAdd: true },
        { id: "strawberry-mojito", name: "Strawberry Mojito", price: 8, description: "Fresh strawberry with mint and lime", quickAdd: true }
      ]
    },
    trending: {
      title: "Popular This Week",
      subtitle: "Trending flavors customers are loving",
      items: [
        { id: "blue-mist", name: "Blue Mist Hookah", price: 32, trending: true },
        { id: "mint-fresh", name: "Mint Fresh Hookah", price: 29, trending: true }
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

// Main enhanced FSD component
export default function EnhancedFSDDesign({ 
  sessions = [],
  onSessionAction,
  className = ''
}: {
  sessions?: any[];
  onSessionAction?: (action: string, sessionId: string) => void;
  className?: string;
}) {
  const [selectedFlavors, setSelectedFlavors] = useState<any[]>([]);
  const [activeView, setActiveView] = useState<'sessions' | 'flavors' | 'analytics'>('sessions');
  
  const metrics = [
    {
      title: 'Active Sessions',
      value: sessions.filter(s => s.state === 'ACTIVE').length.toString(),
      icon: <Flame className="w-6 h-6" />,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      change: '+12%',
      changeType: 'positive' as const
    },
    {
      title: 'Total Revenue',
      value: `$${sessions.reduce((sum, s) => sum + (s.priceCents || 0), 0) / 100}`,
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
            </div>
          </div>
        </motion.div>
        
        {/* Enhanced Metrics */}
        <EnhancedMetrics metrics={metrics} />
        
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
        
        {/* Content Based on Active View */}
        <AnimatePresence mode="wait">
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
                <span className="text-sm text-zinc-400">Real-time Management</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sessions.map((session) => (
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
                    <div className="text-3xl font-bold text-teal-400 mb-2">$12,340</div>
                    <div className="text-sm text-zinc-400">+5% from last week</div>
                  </div>
                </EnhancedCard>
                
                <EnhancedCard variant="glass">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Session Performance</h3>
                    <div className="text-3xl font-bold text-green-400 mb-2">92%</div>
                    <div className="text-sm text-zinc-400">Success Rate</div>
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
