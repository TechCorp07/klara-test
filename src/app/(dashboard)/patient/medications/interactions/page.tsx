// src/app/(dashboard)/patient/medications/interactions/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { usePatientMedications } from '@/hooks/patient/usePatientMedications';
import { Card } from '@/components/ui/card';
import {
  ArrowLeft,
  AlertTriangle,
  Shield,
  Info,
  Search,
  Plus,
  X,
  ExternalLink,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Phone,
  Loader2
} from 'lucide-react';
import type { Prescription } from '@/types/patient.types';

interface DrugInteraction {
  id: string;
  medication1: string;
  medication2: string;
  severity: 'minor' | 'moderate' | 'major' | 'severe';
  type: 'drug_drug' | 'drug_food' | 'drug_condition';
  description: string;
  clinical_significance: string;
  management: string;
  onset: 'rapid' | 'delayed';
  documentation: 'excellent' | 'good' | 'fair' | 'poor';
  references?: string[];
}

interface FoodInteraction {
  medication: string;
  food_type: string;
  interaction_type: 'avoid' | 'take_with' | 'timing_matters';
  description: string;
  recommendation: string;
}

interface ConditionInteraction {
  medication: string;
  condition: string;
  severity: 'contraindicated' | 'caution' | 'monitor';
  description: string;
  monitoring_required: string;
}

export default function MedicationInteractionsPage() {
  const router = useRouter();
  const { getUserRole } = useAuth();
  
  const { medications, loading: medicationsLoading } = usePatientMedications();
  
  const [interactions, setInteractions] = useState<DrugInteraction[]>([]);
  const [foodInteractions, setFoodInteractions] = useState<FoodInteraction[]>([]);
  const [conditionInteractions, setConditionInteractions] = useState<ConditionInteraction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedications, setSelectedMedications] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'drug_drug' | 'drug_food' | 'drug_condition'>('drug_drug');

  // Role validation
  const userRole = getUserRole();
  useEffect(() => {
    if (userRole && userRole !== 'patient') {
      router.push(`/${userRole}`);
      return;
    }
  }, [userRole, router]);

  // Load interactions for active medications
  useEffect(() => {
    if (medications.length > 0) {
      const activeMedications = medications.filter(med => med.status === 'active');
      setSelectedMedications(activeMedications.map(med => med.id));
      checkInteractions(activeMedications.map(med => med.id));
    }
  }, [medications]);

  const checkInteractions = async (medicationIds: number[]) => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock data for drug-drug interactions
      const mockDrugInteractions: DrugInteraction[] = [
        {
          id: '1',
          medication1: 'Warfarin',
          medication2: 'Aspirin',
          severity: 'major',
          type: 'drug_drug',
          description: 'Concurrent use may increase risk of bleeding.',
          clinical_significance: 'The risk of bleeding may be increased when warfarin is used concurrently with aspirin.',
          management: 'Monitor INR closely and watch for signs of bleeding. Consider using alternative medications if possible.',
          onset: 'delayed',
          documentation: 'excellent',
          references: ['Drug Interaction Database', 'Clinical Pharmacology Review']
        },
        {
          id: '2',
          medication1: 'Metformin',
          medication2: 'Lisinopril',
          severity: 'moderate',
          type: 'drug_drug',
          description: 'May increase risk of lactic acidosis in patients with renal impairment.',
          clinical_significance: 'Monitor renal function and be alert for signs of lactic acidosis.',
          management: 'Monitor renal function regularly. Discontinue metformin if serum creatinine rises.',
          onset: 'delayed',
          documentation: 'good'
        }
      ];

      // Mock data for food interactions
      const mockFoodInteractions: FoodInteraction[] = [
        {
          medication: 'Warfarin',
          food_type: 'Vitamin K rich foods',
          interaction_type: 'avoid',
          description: 'High vitamin K foods may reduce warfarin effectiveness.',
          recommendation: 'Maintain consistent vitamin K intake. Avoid large amounts of leafy greens.'
        },
        {
          medication: 'Calcium supplements',
          food_type: 'Dairy products',
          interaction_type: 'timing_matters',
          description: 'Calcium absorption may be affected by timing with other medications.',
          recommendation: 'Take calcium supplements 2 hours apart from other medications.'
        }
      ];

      // Mock data for condition interactions
      const mockConditionInteractions: ConditionInteraction[] = [
        {
          medication: 'NSAIDs',
          condition: 'Chronic Kidney Disease',
          severity: 'caution',
          description: 'NSAIDs may worsen kidney function in patients with existing kidney disease.',
          monitoring_required: 'Monitor serum creatinine and BUN regularly.'
        }
      ];

      setInteractions(mockDrugInteractions);
      setFoodInteractions(mockFoodInteractions);
      setConditionInteractions(mockConditionInteractions);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check interactions');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'severe':
      case 'major':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'moderate':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'minor':
        return <Info className="w-5 h-5 text-blue-600" />;
      case 'contraindicated':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'caution':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'monitor':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Shield className="w-5 h-5 text-green-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'severe':
      case 'major':
      case 'contraindicated':
        return 'bg-red-50 border-red-200';
      case 'moderate':
      case 'caution':
        return 'bg-yellow-50 border-yellow-200';
      case 'minor':
      case 'monitor':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-green-50 border-green-200';
    }
  };

  const filteredInteractions = interactions.filter(interaction =>
    interaction.medication1.toLowerCase().includes(searchQuery.toLowerCase()) ||
    interaction.medication2.toLowerCase().includes(searchQuery.toLowerCase()) ||
    interaction.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFoodInteractions = foodInteractions.filter(interaction =>
    interaction.medication.toLowerCase().includes(searchQuery.toLowerCase()) ||
    interaction.food_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredConditionInteractions = conditionInteractions.filter(interaction =>
    interaction.medication.toLowerCase().includes(searchQuery.toLowerCase()) ||
    interaction.condition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (medicationsLoading) {
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
              <h1 className="text-3xl font-bold text-gray-900">Medication Interactions</h1>
              <p className="text-gray-600">Check for interactions between your medications, foods, and medical conditions</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => checkInteractions(selectedMedications)}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Check
            </button>
            
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <Card className="p-6 mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search interactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Current Medications */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Current Active Medications</h3>
            <div className="flex flex-wrap gap-2">
              {medications.filter(med => med.status === 'active').map((medication) => (
                <div key={medication.id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {medication.medication.name}
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <XCircle className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Major Interactions</p>
                <p className="text-2xl font-bold text-red-600">
                  {interactions.filter(i => i.severity === 'major' || i.severity === 'severe').length}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Moderate Interactions</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {interactions.filter(i => i.severity === 'moderate').length}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center">
              <Info className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Minor Interactions</p>
                <p className="text-2xl font-bold text-blue-600">
                  {interactions.filter(i => i.severity === 'minor').length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('drug_drug')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'drug_drug'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Drug-Drug Interactions
              </button>
              <button
                onClick={() => setActiveTab('drug_food')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'drug_food'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Food Interactions
              </button>
              <button
                onClick={() => setActiveTab('drug_condition')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'drug_condition'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Medical Conditions
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'drug_drug' && (
          <div className="space-y-6">
            {filteredInteractions.length === 0 ? (
              <Card className="p-8 text-center">
                <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Drug Interactions Found</h3>
                <p className="text-gray-600">Great news! We didn't find any significant interactions between your current medications.</p>
              </Card>
            ) : (
              filteredInteractions.map((interaction) => (
                <Card key={interaction.id} className={`p-6 ${getSeverityColor(interaction.severity)}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getSeverityIcon(interaction.severity)}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {interaction.medication1} ↔ {interaction.medication2}
                        </h3>
                        <p className="text-sm text-gray-600 capitalize">
                          {interaction.severity} interaction • {interaction.onset} onset
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        interaction.documentation === 'excellent' ? 'bg-green-100 text-green-800' :
                        interaction.documentation === 'good' ? 'bg-blue-100 text-blue-800' :
                        interaction.documentation === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {interaction.documentation} evidence
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Description</h4>
                      <p className="text-gray-700">{interaction.description}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Clinical Significance</h4>
                      <p className="text-gray-700">{interaction.clinical_significance}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Management</h4>
                      <p className="text-gray-700">{interaction.management}</p>
                    </div>
                    
                    {(interaction.severity === 'major' || interaction.severity === 'severe') && (
                      <div className="bg-red-100 border border-red-300 rounded-lg p-4">
                        <div className="flex items-center">
                          <Phone className="w-5 h-5 text-red-600 mr-3" />
                          <div>
                            <p className="font-medium text-red-900">Contact Your Healthcare Provider</p>
                            <p className="text-sm text-red-800">
                              This is a significant interaction. Please discuss with your doctor or pharmacist immediately.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'drug_food' && (
          <div className="space-y-6">
            {filteredFoodInteractions.length === 0 ? (
              <Card className="p-8 text-center">
                <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Food Interactions Found</h3>
                <p className="text-gray-600">We didn't find any significant food interactions with your current medications.</p>
              </Card>
            ) : (
              filteredFoodInteractions.map((interaction, index) => (
                <Card key={index} className="p-6 bg-orange-50 border-orange-200">
                  <div className="flex items-start space-x-3 mb-4">
                    <Info className="w-5 h-5 text-orange-600 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {interaction.medication} & {interaction.food_type}
                      </h3>
                      <p className="text-sm text-gray-600 capitalize">
                        {interaction.interaction_type.replace('_', ' ')} interaction
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Description</h4>
                      <p className="text-gray-700">{interaction.description}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Recommendation</h4>
                      <p className="text-gray-700">{interaction.recommendation}</p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'drug_condition' && (
          <div className="space-y-6">
            {filteredConditionInteractions.length === 0 ? (
              <Card className="p-8 text-center">
                <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Condition Interactions Found</h3>
                <p className="text-gray-600">We didn't find any significant interactions between your medications and medical conditions.</p>
              </Card>
            ) : (
              filteredConditionInteractions.map((interaction, index) => (
                <Card key={index} className={`p-6 ${getSeverityColor(interaction.severity)}`}>
                  <div className="flex items-start space-x-3 mb-4">
                    {getSeverityIcon(interaction.severity)}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {interaction.medication} & {interaction.condition}
                      </h3>
                      <p className="text-sm text-gray-600 capitalize">
                        {interaction.severity} severity
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Description</h4>
                      <p className="text-gray-700">{interaction.description}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Monitoring Required</h4>
                      <p className="text-gray-700">{interaction.monitoring_required}</p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Important Notice */}
        <Card className="p-6 bg-blue-50 border-blue-200 mt-8">
          <div className="flex items-start space-x-4">
            <Info className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Important Medical Disclaimer</h3>
              <div className="text-sm text-blue-800 space-y-2">
                <p>• This interaction checker is for informational purposes only and should not replace professional medical advice.</p>
                <p>• Always consult with your healthcare provider or pharmacist before making changes to your medication regimen.</p>
                <p>• The absence of an interaction in this tool does not guarantee that no interaction exists.</p>
                <p>• For emergency situations, contact your healthcare provider immediately or call emergency services.</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}