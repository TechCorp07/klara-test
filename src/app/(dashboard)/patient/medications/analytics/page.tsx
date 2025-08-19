// src/app/(dashboard)/patient/medications/analytics/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { usePatientMedications } from '@/hooks/patient/usePatientMedications';
import { patientService } from '@/lib/api/services/patient.service';
import { Card } from '@/components/ui/card';
import type { MedicationAnalytics } from '@/types/patient.types';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Target,
  Award,
  Zap,
  Heart,
  Activity,
  Shield,
  Download,
  Filter,
  RefreshCw,
  Loader2
} from 'lucide-react';

interface AdherenceGoal {
  target_rate: number;
  current_rate: number;
  days_to_goal: number;
  is_achieved: boolean;
}

export default function MedicationAnalyticsPage() {
  const router = useRouter();
  const { getUserRole } = useAuth();
  
  const { medications, loading: medicationsLoading } = usePatientMedications();
  
  const [analytics, setAnalytics] = useState<MedicationAnalytics | null>(null);
  const [adherenceGoal, setAdherenceGoal] = useState<AdherenceGoal | null>(null);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Role validation
  const userRole = getUserRole();
  useEffect(() => {
    if (userRole && userRole !== 'patient') {
      router.push(`/${userRole}`);
      return;
    }
  }, [userRole, router]);

  // Load analytics data
  useEffect(() => {
    if (medications.length > 0) {
      loadAnalytics();
    }
  }, [medications, timeframe]);

  // Helper function to create complete analytics data
  const createCompleteAnalytics = (data: Partial<MedicationAnalytics>): MedicationAnalytics => {
    return {
      adherence_trends: data.adherence_trends || [],
      missed_doses: data.missed_doses || [],
      side_effects: data.side_effects || [],
      effectiveness_ratings: data.effectiveness_ratings || [],
      insights: data.insights || {
        best_adherence_day: '',
        worst_adherence_day: '',
        optimal_time_pattern: '',
        improvement_suggestions: []
      }
    };
  };

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load medication analytics
      const analyticsData = await patientService.getMedicationAnalytics(timeframe);
      setAnalytics(analyticsData);
      
      // Calculate adherence goal (mock data - replace with actual API call)
      const activeMedications = medications.filter(med => med.status === 'active');
      const currentRate = 85; // This would come from actual calculation
      
      setAdherenceGoal({
        target_rate: 90,
        current_rate: currentRate,
        days_to_goal: currentRate >= 90 ? 0 : Math.ceil((90 - currentRate) / 2),
        is_achieved: currentRate >= 90
      });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
      // Set empty analytics data with all required properties in case of error
      setAnalytics(createCompleteAnalytics({}));
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadAnalytics();
  };

  const getAdherenceTrend = () => {
    if (!analytics?.adherence_trends || analytics.adherence_trends.length < 2) return null;
    
    const recent = analytics.adherence_trends.slice(-7);
    const earlier = analytics.adherence_trends.slice(-14, -7);
    
    const recentAvg = recent.reduce((acc, curr) => acc + curr.rate, 0) / recent.length;
    const earlierAvg = earlier.reduce((acc, curr) => acc + curr.rate, 0) / earlier.length;
    
    const change = recentAvg - earlierAvg;
    return {
      change: Math.round(change * 100) / 100,
      isImproving: change > 0,
      percentage: Math.abs(Math.round((change / earlierAvg) * 100))
    };
  };

  if (loading || medicationsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <Card className="p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Analytics</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </button>
          </Card>
        </div>
      </div>
    );
  }

  const trend = getAdherenceTrend();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Medication Analytics</h1>
              <p className="text-gray-600">Insights into your medication adherence and patterns</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as '7d' | '30d' | '90d')}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            
            <button
              onClick={handleRefresh}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
            
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Adherence</p>
                <p className="text-2xl font-bold text-gray-900">
                  {adherenceGoal ? `${adherenceGoal.current_rate}%` : '85%'}
                </p>
                {trend && (
                  <div className="flex items-center mt-1">
                    {trend.isImproving ? (
                      <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                    )}
                    <span className={`text-sm ${trend.isImproving ? 'text-green-600' : 'text-red-600'}`}>
                      {trend.isImproving ? '+' : ''}{trend.change}% from last week
                    </span>
                  </div>
                )}
              </div>
              <div className={`p-3 rounded-full ${
                adherenceGoal && adherenceGoal.current_rate >= 85 ? 'bg-green-100' : 'bg-yellow-100'
              }`}>
                <BarChart3 className={`w-6 h-6 ${
                  adherenceGoal && adherenceGoal.current_rate >= 85 ? 'text-green-600' : 'text-yellow-600'
                }`} />
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Doses This Week</p>
                <p className="text-2xl font-bold text-gray-900">42</p>
                <p className="text-sm text-green-600 mt-1">38 taken, 4 missed</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Streak</p>
                <p className="text-2xl font-bold text-gray-900">12 days</p>
                <p className="text-sm text-purple-600 mt-1">Personal best: 18 days</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Goal Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {adherenceGoal?.is_achieved ? 'Achieved!' : `${adherenceGoal?.days_to_goal || 5} days`}
                </p>
                <p className="text-sm text-gray-600 mt-1">To reach 90% adherence</p>
              </div>
              <div className={`p-3 rounded-full ${
                adherenceGoal?.is_achieved ? 'bg-green-100' : 'bg-orange-100'
              }`}>
                <Zap className={`w-6 h-6 ${
                  adherenceGoal?.is_achieved ? 'text-green-600' : 'text-orange-600'
                }`} />
              </div>
            </div>
          </Card>
        </div>

        {/* Progress Toward Goal */}
        {adherenceGoal && (
          <Card className="p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Adherence Goal Progress</h3>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">Target: {adherenceGoal.target_rate}%</p>
                <p className="text-lg font-semibold text-gray-900">
                  Current: {adherenceGoal.current_rate}%
                </p>
              </div>
              
              {adherenceGoal.is_achieved ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span className="font-medium">Goal Achieved!</span>
                </div>
              ) : (
                <div className="text-right">
                  <p className="text-sm text-gray-600">Days to goal</p>
                  <p className="text-lg font-semibold text-gray-900">{adherenceGoal.days_to_goal}</p>
                </div>
              )}
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  adherenceGoal.is_achieved ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min((adherenceGoal.current_rate / adherenceGoal.target_rate) * 100, 100)}%` }}
              />
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Adherence Trends */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Adherence Trends</h3>
            <div className="space-y-4">
              {analytics?.adherence_trends?.slice(-7).map((trend, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {new Date(trend.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          trend.rate >= 0.8 ? 'bg-green-500' : 
                          trend.rate >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${trend.rate * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">
                      {Math.round(trend.rate * 100)}%
                    </span>
                  </div>
                </div>
              )) || (
                <p className="text-sm text-gray-500">No adherence data available for the selected timeframe.</p>
              )}
            </div>
          </Card>

          {/* Missed Doses Analysis */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Missed Doses Patterns</h3>
            <div className="space-y-4">
              {analytics?.missed_doses?.slice(0, 5).map((item, index) => (
                <div key={index} className="border-l-4 border-red-400 pl-4">
                  <p className="font-medium text-gray-900">{item.medication}</p>
                  <p className="text-sm text-gray-600">
                    {item.missed_times.length} missed doses
                  </p>
                  <div className="mt-1">
                    {item.missed_times.slice(0, 3).map((time, timeIndex) => (
                      <span key={timeIndex} className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded mr-1 mb-1">
                        {new Date(time).toLocaleDateString()}
                      </span>
                    ))}
                    {item.missed_times.length > 3 && (
                      <span className="text-xs text-gray-500">+{item.missed_times.length - 3} more</span>
                    )}
                  </div>
                </div>
              )) || (
                <p className="text-sm text-gray-500">No missed doses data available.</p>
              )}
            </div>
          </Card>
        </div>

        {/* Insights and Recommendations */}
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Personalized Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Patterns</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <p>• <strong>Best day:</strong> {analytics?.insights?.best_adherence_day || 'Monday'} (96% adherence)</p>
                <p>• <strong>Challenging day:</strong> {analytics?.insights?.worst_adherence_day || 'Friday'} (78% adherence)</p>
                <p>• <strong>Optimal time:</strong> {analytics?.insights?.optimal_time_pattern || 'Morning doses'} have highest success</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
              <div className="space-y-2 text-sm text-gray-700">
                {analytics?.insights?.improvement_suggestions?.map((suggestion, index) => (
                  <p key={index}>• {suggestion}</p>
                )) || (
                  <>
                    <p>• Set additional reminders for Friday doses</p>
                    <p>• Consider pill organizers for complex regimens</p>
                    <p>• Schedule weekend refill reminders</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Side Effects Tracking */}
        {analytics?.side_effects && analytics.side_effects.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Side Effects Tracking</h3>
            <div className="space-y-4">
              {analytics.side_effects.map((item, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{item.medication}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      item.severity === 'mild' ? 'bg-yellow-100 text-yellow-800' :
                      item.severity === 'moderate' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {item.severity}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.effects.map((effect, effectIndex) => (
                      <span key={effectIndex} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                        {effect}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}