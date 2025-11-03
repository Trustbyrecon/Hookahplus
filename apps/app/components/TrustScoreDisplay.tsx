'use client';

import React, { useEffect, useState } from 'react';

export default function TrustScoreDisplay() {
  const [trustScore, setTrustScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [trend, setTrend] = useState<Array<{ date: string; score: number }>>([]);

  useEffect(() => {
    const fetchTrustScore = async () => {
      try {
        // Try to fetch from trust API
        const response = await fetch('/api/live/trust?sessionId=all&staffId=all');
        if (response.ok) {
          const data = await response.json();
          if (typeof data.trust === 'number') {
            setTrustScore(data.trust);
          }
        }

        // Fallback: calculate from sessions
        const sessionsRes = await fetch('/api/sessions');
        if (sessionsRes.ok) {
          const sessions = await sessionsRes.json();
          const calculated = calculateTrustScore(sessions);
          setTrustScore(calculated);
          
          // Generate trend (last 7 days)
          const trendData = generateTrend(sessions);
          setTrend(trendData);
        }
      } catch (err) {
        console.error('Error fetching trust score:', err);
        // Default trust score
        setTrustScore(7.5);
      } finally {
        setLoading(false);
      }
    };

    fetchTrustScore();
    // Refresh every 30 seconds
    const interval = setInterval(fetchTrustScore, 30000);
    return () => clearInterval(interval);
  }, []);

  const calculateTrustScore = (sessions: any[]): number => {
    if (sessions.length === 0) return 7.0;

    let totalScore = 0;
    let sessionCount = 0;

    sessions.forEach(session => {
      if (!session.endTime) return; // Only count completed sessions

      let score = 7.0; // Base score

      // Positive factors
      if (session.refills > 0) score += 0.2; // Refills indicate good service
      if (session.notes && session.notes.length > 0) {
        const positiveNotes = session.notes.filter((n: string) => 
          !n.toLowerCase().includes('burnout') && 
          !n.toLowerCase().includes('problem')
        );
        score += positiveNotes.length * 0.1;
      }

      // Negative factors
      if (session.notes) {
        const burnouts = session.notes.filter((n: string) => 
          n.toLowerCase().includes('burnout')
        ).length;
        score -= burnouts * 0.3;
      }

      // Session duration factor (longer sessions = better)
      const duration = session.endTime - session.startTime;
      const hours = duration / (1000 * 60 * 60);
      if (hours > 1) score += 0.2;
      if (hours > 2) score += 0.2;

      // Clamp between 0 and 10
      score = Math.max(0, Math.min(10, score));

      totalScore += score;
      sessionCount++;
    });

    return sessionCount > 0 ? totalScore / sessionCount : 7.0;
  };

  const generateTrend = (sessions: any[]): Array<{ date: string; score: number }> => {
    const trend: Array<{ date: string; score: number }> = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const daySessions = sessions.filter(s => {
        const sDate = new Date(s.startTime);
        return sDate >= date && sDate < nextDate && s.endTime;
      });

      const dayScore = calculateTrustScore(daySessions);
      
      trend.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: dayScore
      });
    }

    return trend;
  };

  const getTrustColor = (score: number): string => {
    if (score >= 8.5) return 'text-green-400';
    if (score >= 7.0) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getTrustLabel = (score: number): string => {
    if (score >= 9.0) return 'Excellent';
    if (score >= 8.0) return 'Very Good';
    if (score >= 7.0) return 'Good';
    if (score >= 6.0) return 'Fair';
    return 'Needs Attention';
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-400">
        Loading trust score...
      </div>
    );
  }

  if (trustScore === null) {
    return (
      <div className="p-4 bg-gray-900/30 rounded-lg border border-gray-800 text-gray-400">
        Trust score not available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Trust Score</h2>
        <span className="text-sm text-gray-400">
          Updated: {new Date().toLocaleTimeString()}
        </span>
      </div>

      {/* Main Trust Score Display */}
      <div className="bg-gray-900/50 rounded-lg p-8 border border-gray-800">
        <div className="flex items-center justify-center gap-6">
          <div className="text-center">
            <div className={`text-6xl font-bold ${getTrustColor(trustScore)}`}>
              {trustScore.toFixed(1)}
            </div>
            <div className="text-sm text-gray-400 mt-2">out of 10.0</div>
          </div>
          <div className="flex-1 max-w-md">
            <div className={`text-xl font-semibold ${getTrustColor(trustScore)} mb-2`}>
              {getTrustLabel(trustScore)}
            </div>
            <div className="w-full bg-gray-800 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all ${
                  trustScore >= 8.5 ? 'bg-green-500' :
                  trustScore >= 7.0 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${(trustScore / 10) * 100}%` }}
              />
            </div>
            <div className="text-sm text-gray-400 mt-2">
              Trust score reflects operational reliability and guest satisfaction
            </div>
          </div>
        </div>
      </div>

      {/* Trend Chart */}
      {trend.length > 0 && (
        <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">Trust Score Trend (Last 7 Days)</h3>
          <div className="h-48 flex items-end justify-between gap-2">
            {trend.map((point, idx) => {
              const height = (point.score / 10) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex items-end justify-center" style={{ height: '180px' }}>
                    <div
                      className={`w-full rounded-t transition-all ${
                        point.score >= 8.5 ? 'bg-green-500' :
                        point.score >= 7.0 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ height: `${height}%`, minHeight: '4px' }}
                      title={`${point.date}: ${point.score.toFixed(1)}`}
                    />
                  </div>
                  <span className="text-xs text-gray-400">{point.date}</span>
                  <span className={`text-xs font-semibold ${getTrustColor(point.score)}`}>
                    {point.score.toFixed(1)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Trust Score Info */}
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
        <h3 className="text-sm font-semibold text-white mb-2">Trust Score Factors</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-gray-400">Session Duration</div>
            <div className="text-white font-semibold">+0.2 per hour</div>
          </div>
          <div>
            <div className="text-gray-400">Refills</div>
            <div className="text-white font-semibold">+0.2 per refill</div>
          </div>
          <div>
            <div className="text-gray-400">Positive Notes</div>
            <div className="text-white font-semibold">+0.1 each</div>
          </div>
          <div>
            <div className="text-gray-400">Burnouts</div>
            <div className="text-red-400 font-semibold">-0.3 each</div>
          </div>
        </div>
      </div>
    </div>
  );
}
