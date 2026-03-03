'use client';

import React, { useState, useEffect } from 'react';
import Card from './Card';
import Button from './Button';
import { 
  Lightbulb, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  RefreshCw,
  X,
  User,
  Shield,
  Users
} from 'lucide-react';

interface CoachingBullet {
  type: 'highlight' | 'improvement' | 'tip';
  text: string;
}

interface CoachingData {
  role: 'prep' | 'foh' | 'runner';
  bullets: CoachingBullet[];
  performanceScore: number;
  timestamp: string;
}

interface CoachingPanelProps {
  role?: 'prep' | 'foh' | 'runner';
  staffId?: string;
  loungeId?: string;
  onDismiss?: () => void;
  showDismiss?: boolean;
}

const roleLabels = {
  prep: 'BOH (Prep)',
  foh: 'FOH (Service)',
  runner: 'Runner',
};

const roleIcons = {
  prep: Shield,
  foh: User,
  runner: Users,
};

export default function CoachingPanel({
  role = 'foh',
  staffId,
  loungeId,
  onDismiss,
  showDismiss = true,
}: CoachingPanelProps) {
  const [coachingData, setCoachingData] = useState<CoachingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRead, setIsRead] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'prep' | 'foh' | 'runner'>(role);

  const fetchCoaching = async (targetRole: 'prep' | 'foh' | 'runner') => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        role: targetRole,
      });
      if (staffId) {
        params.append('staffId', staffId);
      }
      if (loungeId) {
        params.append('loungeId', loungeId);
      }

      const response = await fetch(`/api/coaching?${params.toString()}`);
      const data = await response.json();

      if (data.success && data.coaching) {
        setCoachingData(data.coaching);
        // Check if already read
        const readKey = `coaching-read-${targetRole}-${staffId || 'all'}`;
        setIsRead(localStorage.getItem(readKey) === 'true');
      } else {
        setError(data.error || 'Failed to load coaching');
      }
    } catch (err) {
      console.error('Error fetching coaching:', err);
      setError('Failed to load coaching data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoaching(selectedRole);
  }, [selectedRole, staffId, loungeId]);

  const handleGotIt = () => {
    if (coachingData) {
      const readKey = `coaching-read-${coachingData.role}-${staffId || 'all'}`;
      localStorage.setItem(readKey, 'true');
      setIsRead(true);
    }
  };

  const handleRoleChange = (newRole: 'prep' | 'foh' | 'runner') => {
    setSelectedRole(newRole);
    setIsRead(false);
  };

  const getBulletIcon = (type: string) => {
    switch (type) {
      case 'highlight':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'improvement':
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      case 'tip':
        return <Lightbulb className="w-4 h-4 text-blue-400" />;
      default:
        return <Lightbulb className="w-4 h-4 text-zinc-400" />;
    }
  };

  const getBulletColor = (type: string) => {
    switch (type) {
      case 'highlight':
        return 'text-green-300 bg-green-500/10 border-green-500/30';
      case 'improvement':
        return 'text-yellow-300 bg-yellow-500/10 border-yellow-500/30';
      case 'tip':
        return 'text-blue-300 bg-blue-500/10 border-blue-500/30';
      default:
        return 'text-zinc-300 bg-zinc-800/30 border-zinc-700';
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 75) return 'text-yellow-400';
    return 'text-red-400';
  };

  const RoleIcon = roleIcons[selectedRole];

  return (
    <Card className="border-blue-500/30 bg-blue-500/5 relative">
      {showDismiss && onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 p-1 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Lightbulb className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Micro-Coaching</h3>
            <p className="text-sm text-zinc-400">Personalized tips for your role</p>
          </div>
        </div>
        <button
          onClick={() => fetchCoaching(selectedRole)}
          className="p-2 text-zinc-400 hover:text-blue-400 transition-colors rounded-lg hover:bg-zinc-800/50"
          title="Refresh"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Role Selector */}
      <div className="flex gap-2 mb-4">
        {(['prep', 'foh', 'runner'] as const).map((r) => {
          const Icon = roleIcons[r];
          return (
            <button
              key={r}
              onClick={() => handleRoleChange(r)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                selectedRole === r
                  ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                  : 'bg-zinc-800/30 border-zinc-700 text-zinc-400 hover:border-zinc-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{roleLabels[r]}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="text-center py-8 text-zinc-400">Loading coaching tips...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-400">{error}</div>
      ) : coachingData ? (
        <div className="space-y-4">
          {/* Performance Score */}
          <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg border border-zinc-700">
            <div className="flex items-center gap-3">
              <RoleIcon className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm text-zinc-400">Performance Score</p>
                <p className={`text-2xl font-bold ${getPerformanceColor(coachingData.performanceScore)}`}>
                  {coachingData.performanceScore}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-500">Last 7 days</p>
              <p className="text-xs text-zinc-500">
                {new Date(coachingData.timestamp).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Coaching Bullets */}
          <div className="space-y-3">
            {coachingData.bullets.map((bullet, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border ${getBulletColor(bullet.type)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getBulletIcon(bullet.type)}</div>
                  <p className="text-sm flex-1 leading-relaxed">{bullet.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Got It Button */}
          {!isRead && (
            <div className="pt-4 border-t border-zinc-800">
              <Button
                onClick={handleGotIt}
                variant="primary"
                className="w-full"
                leftIcon={<CheckCircle className="w-4 h-4" />}
              >
                Got it
              </Button>
            </div>
          )}

          {isRead && (
            <div className="pt-4 border-t border-zinc-800">
              <div className="flex items-center justify-center gap-2 text-sm text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span>Marked as read</span>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </Card>
  );
}

