//src/app/(dashboard)/patient/genetics/analysis/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Card } from '@/components/ui/card';
import { FormButton, FormAlert } from '@/components/ui/common';
import { Spinner } from '@/components/ui/spinner';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { 
  Dna, 
  AlertTriangle, 
  Users, 
  FileText, 
  Heart, 
  Shield,
  ArrowLeft,
  Download,
  Calendar
} from 'lucide-react';

interface GeneticRiskFactor {
  condition: string;
  risk_level: 'low' | 'moderate' | 'high' | 'very_high';
  family_history_count: number;
  inherited_pattern: string;
  age_of_onset_range: string;
  prevention_recommendations: string[];
}

interface GeneticMutation {
  gene: string;
  mutation: string;
  clinical_significance: string;
  associated_conditions: string[];
  carrier_status: boolean;
}

interface GeneticAnalysisData {
  patient_id: number;
  analysis_date: string;
  risk_factors: GeneticRiskFactor[];
  known_mutations: GeneticMutation[];
  family_history_summary: {
    total_relatives: number;
    affected_relatives: number;
    generations_analyzed: number;
    rare_diseases_found: string[];
  };
  recommendations: {
    genetic_testing: string[];
    lifestyle_modifications: string[];
    screening_schedule: string[];
    counseling_recommended: boolean;
  };
  risk_score: {
    overall_score: number;
    rare_disease_predisposition: number;
    oncological_risk: number;
    neurological_risk: number;
    cardiac_risk: number;
  };
}

export default function GeneticsAnalysisPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [analysisData, setAnalysisData] = useState<GeneticAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchGeneticAnalysis();
  }, []);

  const fetchGeneticAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get(ENDPOINTS.PATIENT.GENETIC_ANALYSIS);
      
      if (response.status === 200) {
        setAnalysisData(response.data as GeneticAnalysisData);
      } else if (response.status === 404) {
        // No analysis exists yet - show option to generate
        setAnalysisData(null);
      } else {
        throw new Error('Failed to fetch genetic analysis');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load genetic analysis');
      }
    } finally {
      setLoading(false);
    }
  };

  const generateAnalysis = async () => {
    try {
      setGenerating(true);
      setError(null);
  
      const response = await apiClient.post(ENDPOINTS.PATIENT.GENETIC_ANALYSIS);
  
      if (response.status === 200 || response.status === 201) {
        setAnalysisData(response.data as GeneticAnalysisData);
      } else {
        throw new Error('Failed to generate genetic analysis');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to generate analysis');
      }
    } finally {
      setGenerating(false);
    }
  };

  const exportAnalysis = () => {
    if (!analysisData) return;
    
    const reportData = {
      patient: user?.email,
      generated_date: new Date().toISOString(),
      analysis: analysisData
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `genetic-analysis-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'very_high': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <FormButton 
          variant="secondary" 
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </FormButton>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Genetic Analysis</h1>
            <p className="text-gray-600">
              Comprehensive genetic risk assessment based on your family medical history
            </p>
          </div>
          
          {analysisData && (
            <div className="flex space-x-3">
              <FormButton
                variant="outline"
                onClick={exportAnalysis}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </FormButton>
              <FormButton
                variant="outline"
                onClick={() => router.push('/patient/appointments/schedule')}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Genetic Counseling
              </FormButton>
            </div>
          )}
        </div>
      </div>

      {error && (
        <FormAlert 
          type="error" 
          message={error} 
          dismissible 
          onDismiss={() => setError(null)} 
        />
      )}

      {!analysisData ? (
        // No analysis available - show generation option
        <Card className="p-8 text-center">
          <Dna className="w-16 h-16 mx-auto mb-4 text-purple-600" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Generate Your Genetic Analysis
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Our advanced AI will analyze your family medical history to identify potential 
            genetic risk factors for rare diseases and provide personalized recommendations 
            for screening and prevention.
          </p>
          
          <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left max-w-2xl mx-auto">
            <h3 className="font-medium text-blue-900 mb-2">Analysis includes:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Genetic risk assessment for rare diseases</li>
              <li>• Inheritance pattern analysis</li>
              <li>• Personalized screening recommendations</li>
              <li>• Genetic testing suggestions</li>
              <li>• Lifestyle modification advice</li>
            </ul>
          </div>

          <FormButton
            onClick={generateAnalysis}
            disabled={generating}
            className="px-8 py-3"
          >
            {generating ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Analyzing Family History...
              </>
            ) : (
              <>
                <Dna className="w-5 h-5 mr-2" />
                Generate Genetic Analysis
              </>
            )}
          </FormButton>
        </Card>
      ) : (
        // Show analysis results
        <div className="space-y-6">
          {/* Analysis Summary */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Analysis Summary</h2>
              <span className="text-sm text-gray-500">
                Generated on {new Date(analysisData.analysis_date).toLocaleDateString()}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Users className="w-5 h-5 text-purple-600 mr-2" />
                  <span className="text-sm font-medium text-purple-900">Family History</span>
                </div>
                <div className="text-2xl font-bold text-purple-900">
                  {analysisData.family_history_summary.affected_relatives}
                </div>
                <div className="text-xs text-purple-700">
                  of {analysisData.family_history_summary.total_relatives} relatives affected
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Shield className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-900">Overall Risk</span>
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  {analysisData.risk_score.overall_score}%
                </div>
                <div className="text-xs text-blue-700">genetic predisposition</div>
              </div>

              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
                  <span className="text-sm font-medium text-orange-900">Risk Factors</span>
                </div>
                <div className="text-2xl font-bold text-orange-900">
                  {analysisData.risk_factors.length}
                </div>
                <div className="text-xs text-orange-700">identified conditions</div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <FileText className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-900">Recommendations</span>
                </div>
                <div className="text-2xl font-bold text-green-900">
                  {analysisData.recommendations.genetic_testing.length + 
                   analysisData.recommendations.screening_schedule.length}
                </div>
                <div className="text-xs text-green-700">actionable items</div>
              </div>
            </div>
          </Card>

          {/* Risk Factors */}
          {analysisData.risk_factors.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Genetic Risk Factors</h2>
              <div className="space-y-4">
                {analysisData.risk_factors.map((factor, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{factor.condition}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Inheritance pattern: {factor.inherited_pattern}
                        </p>
                        <p className="text-sm text-gray-600">
                          Typical onset: {factor.age_of_onset_range}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getRiskColor(factor.risk_level)}`}>
                        {factor.risk_level.replace('_', ' ').toUpperCase()} RISK
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded p-3 mt-3">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Prevention Recommendations:</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {factor.prevention_recommendations.map((rec, recIndex) => (
                          <li key={recIndex} className="flex items-start">
                            <span className="text-green-600 mr-2">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Known Mutations */}
          {analysisData.known_mutations.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Known Genetic Mutations</h2>
              <div className="grid gap-4">
                {analysisData.known_mutations.map((mutation, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{mutation.gene}</h3>
                        <p className="text-sm text-gray-600">{mutation.mutation}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded ${
                        mutation.carrier_status ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {mutation.carrier_status ? 'Carrier' : 'Normal'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Clinical significance:</strong> {mutation.clinical_significance}
                    </p>
                    <div className="text-sm text-gray-700">
                      <strong>Associated conditions:</strong> {mutation.associated_conditions.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Recommendations */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Personalized Recommendations</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Genetic Testing */}
              {analysisData.recommendations.genetic_testing.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Dna className="w-4 h-4 mr-2 text-purple-600" />
                    Recommended Genetic Testing
                  </h3>
                  <ul className="space-y-2">
                    {analysisData.recommendations.genetic_testing.map((test, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start">
                        <span className="text-purple-600 mr-2">•</span>
                        {test}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Screening Schedule */}
              {analysisData.recommendations.screening_schedule.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                    Screening Schedule
                  </h3>
                  <ul className="space-y-2">
                    {analysisData.recommendations.screening_schedule.map((screening, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        {screening}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Lifestyle Modifications */}
              {analysisData.recommendations.lifestyle_modifications.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Heart className="w-4 h-4 mr-2 text-green-600" />
                    Lifestyle Modifications
                  </h3>
                  <ul className="space-y-2">
                    {analysisData.recommendations.lifestyle_modifications.map((mod, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start">
                        <span className="text-green-600 mr-2">•</span>
                        {mod}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Genetic Counseling */}
              {analysisData.recommendations.counseling_recommended && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Users className="w-4 h-4 mr-2 text-orange-600" />
                    Genetic Counseling
                  </h3>
                  <p className="text-sm text-gray-700 mb-3">
                    Based on your family history and risk factors, genetic counseling is recommended 
                    to help you understand your results and make informed decisions.
                  </p>
                  <FormButton
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/patient/appointments/schedule')}
                  >
                    Schedule Counseling Session
                  </FormButton>
                </div>
              )}
            </div>
          </Card>

          {/* Next Steps */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Next Steps</h2>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 rounded-full p-1">
                  <span className="text-blue-600 text-xs font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Share with your healthcare provider</h3>
                  <p className="text-sm text-gray-600">
                    Discuss these results with your doctor to develop a personalized care plan.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 rounded-full p-1">
                  <span className="text-blue-600 text-xs font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Update family history regularly</h3>
                  <p className="text-sm text-gray-600">
                    Keep your family medical history current as new information becomes available.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 rounded-full p-1">
                  <span className="text-blue-600 text-xs font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Follow screening recommendations</h3>
                  <p className="text-sm text-gray-600">
                    Adhere to the suggested screening schedule for early detection and prevention.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}