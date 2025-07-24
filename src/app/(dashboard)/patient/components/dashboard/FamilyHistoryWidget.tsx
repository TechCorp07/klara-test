// src/app/(dashboard)/patient/components/dashboard/FamilyHistoryWidget.tsx
import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, AlertTriangle, Heart, Dna } from 'lucide-react';
import { patientService } from '@/lib/api/services/patient.service';

interface FamilyMember {
  id: number;
  relationship: string;
  age?: number;
  is_deceased: boolean;
  cause_of_death?: string;
  medical_conditions: Array<{
    condition: string;
    age_of_onset?: number;
    severity: 'mild' | 'moderate' | 'severe';
    genetic_factor: boolean;
  }>;
  rare_disease_history: boolean;
  genetic_mutations?: string[];
}

interface FamilyHistoryProps {
  onAddMember?: () => void;
  onEditMember?: (memberId: number) => void;
  onViewGenetics?: () => void;
}

export function FamilyHistoryWidget({ onAddMember, onEditMember, onViewGenetics }: FamilyHistoryProps) {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [geneticRiskFactors, setGeneticRiskFactors] = useState<string[]>([]);


  const fetchFamilyHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the correct service method instead of direct API call
      const data = await patientService.getFamilyMedicalHistory();
      
      // Transform the data to match the widget's expected format
      const transformedMembers: FamilyMember[] = [
        ...data.immediate_family.map((member, index) => ({
          id: index + 1, // Generate ID since backend doesn't provide it
          relationship: member.relationship,
          age: undefined, // Backend doesn't provide this field
          is_deceased: false, // Backend doesn't provide this field
          medical_conditions: member.conditions.map(condition => ({
            condition,
            age_of_onset: member.age_of_onset,
            severity: 'mild' as const, // Default since backend doesn't provide
            genetic_factor: false // Default since backend doesn't provide
          })),
          rare_disease_history: false, // Default since backend doesn't provide
          genetic_mutations: [] // Default since backend doesn't provide
        })),
        ...data.extended_family.map((member, index) => ({
          id: index + 100, // Generate unique IDs for extended family
          relationship: member.relationship,
          age: undefined,
          is_deceased: false,
          medical_conditions: member.conditions.map(condition => ({
            condition,
            age_of_onset: member.age_of_onset,
            severity: 'mild' as const,
            genetic_factor: false
          })),
          rare_disease_history: false,
          genetic_mutations: []
        }))
      ];
      
      setFamilyMembers(transformedMembers);
      setGeneticRiskFactors([]); // Backend doesn't provide this yet
      
    } catch (err) {
      setError('Failed to load family history');
      console.error('Error fetching family history:', err);
      // Set empty arrays to prevent crashes
      setFamilyMembers([]);
      setGeneticRiskFactors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilyHistory();
  }, []);

  const getRelationshipIcon = (relationship: string) => {
    const rel = relationship.toLowerCase();
    if (rel.includes('mother') || rel.includes('father') || rel.includes('parent')) return '👨‍👩‍👧‍👦';
    if (rel.includes('brother') || rel.includes('sister') || rel.includes('sibling')) return '👫';
    if (rel.includes('grandmother') || rel.includes('grandfather') || rel.includes('grandparent')) return '👴';
    if (rel.includes('aunt') || rel.includes('uncle')) return '👨‍👩‍👧';
    if (rel.includes('cousin')) return '👥';
    return '👤';
  };

  const getRiskLevel = (member: FamilyMember) => {
    if (member.rare_disease_history) return 'high';
    if (member.medical_conditions.some(c => c.genetic_factor)) return 'medium';
    if (member.medical_conditions.length > 0) return 'low';
    return 'none';
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-red-700 bg-red-100 border-red-200';
      case 'medium':
        return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'low':
        return 'text-blue-700 bg-blue-100 border-blue-200';
      default:
        return 'text-green-700 bg-green-100 border-green-200';
    }
  };

  const getConditionSeverityColor = (severity: string) => {
    switch (severity) {
      case 'severe':
        return 'text-red-600';
      case 'moderate':
        return 'text-yellow-600';
      case 'mild':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-5 w-32 bg-gray-300 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Dna className="w-5 h-5 text-green-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Family History</h3>
        </div>
        <button
          onClick={onAddMember}
          className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4 inline mr-1" />
          Add Member
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Genetic Risk Summary */}
      {geneticRiskFactors.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
          <div className="flex items-center mb-2">
            <AlertTriangle className="w-4 h-4 text-purple-600 mr-2" />
            <h4 className="font-medium text-purple-900">Genetic Risk Factors</h4>
          </div>
          <div className="flex flex-wrap gap-1">
            {geneticRiskFactors.map((factor, index) => (
              <span
                key={index}
                className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded"
              >
                {factor}
              </span>
            ))}
          </div>
          <button
            onClick={onViewGenetics}
            className="text-xs text-purple-600 hover:text-purple-700 mt-2"
          >
            View detailed genetic analysis →
          </button>
        </div>
      )}

      {/* Family Members */}
      {familyMembers.length > 0 ? (
        <div className="space-y-3">
          {familyMembers.slice(0, 4).map((member) => {
            const riskLevel = getRiskLevel(member);
            return (
              <div key={member.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center">
                    <span className="text-xl mr-2">{getRelationshipIcon(member.relationship)}</span>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">
                        {member.relationship}
                        {member.age && ` (${member.age})`}
                        {member.is_deceased && ' ⚰️'}
                      </h4>
                      <div className={`inline-block px-2 py-1 text-xs rounded border ${getRiskColor(riskLevel)} mt-1`}>
                        {riskLevel === 'high' ? 'High Risk' :
                         riskLevel === 'medium' ? 'Medium Risk' :
                         riskLevel === 'low' ? 'Low Risk' : 'No Known Risk'}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => onEditMember?.(member.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>

                {/* Medical Conditions */}
                {member.medical_conditions.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-600 mb-1">Medical History:</div>
                    <div className="space-y-1">
                      {member.medical_conditions.slice(0, 3).map((condition, index) => (
                        <div key={index} className="text-xs flex items-center justify-between">
                          <span className="flex items-center">
                            <span className={`w-2 h-2 rounded-full mr-2 ${
                              condition.severity === 'severe' ? 'bg-red-500' :
                              condition.severity === 'moderate' ? 'bg-yellow-500' : 'bg-green-500'
                            }`}></span>
                            {condition.condition}
                            {condition.genetic_factor && (
                              <Dna className="w-5 h-5 text-green-600 mr-2" aria-label="Family History" />
                            )}
                          </span>
                          {condition.age_of_onset && (
                            <span className="text-gray-500">Age {condition.age_of_onset}</span>
                          )}
                        </div>
                      ))}
                      {member.medical_conditions.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{member.medical_conditions.length - 3} more conditions
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Rare Disease History */}
                {member.rare_disease_history && (
                  <div className="mt-2 bg-red-50 border border-red-200 rounded p-2">
                    <div className="flex items-center text-xs text-red-800">
                      <Heart className="w-3 h-3 mr-1" />
                      <span className="font-medium">Rare disease history documented</span>
                    </div>
                  </div>
                )}

                {/* Genetic Mutations */}
                {member.genetic_mutations && member.genetic_mutations.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-600 mb-1">Known Genetic Mutations:</div>
                    <div className="flex flex-wrap gap-1">
                      {member.genetic_mutations.map((mutation, index) => (
                        <span
                          key={index}
                          className="text-xs bg-purple-100 text-purple-800 px-1 py-0.5 rounded"
                        >
                          {mutation}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cause of Death */}
                {member.is_deceased && member.cause_of_death && (
                  <div className="mt-2 text-xs text-gray-600">
                    <strong>Cause of death:</strong> {member.cause_of_death}
                  </div>
                )}
              </div>
            );
          })}
          
          {familyMembers.length > 4 && (
            <div className="text-center py-2">
              <button
                onClick={onViewGenetics}
                className="text-sm text-green-600 hover:text-green-700"
              >
                View all {familyMembers.length} family members →
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm mb-2">No family history recorded</p>
          <p className="text-xs text-gray-400 mb-4">
            Add family medical history to help identify genetic risk factors for rare diseases
          </p>
          
          <div className="bg-blue-50 rounded-lg p-3 text-left">
            <h4 className="font-medium text-blue-900 mb-2 text-sm">Why Family History Matters:</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Identifies genetic predisposition to rare diseases</li>
              <li>• Helps providers make better treatment decisions</li>
              <li>• Enables early screening and prevention</li>
              <li>• Supports research into hereditary conditions</li>
            </ul>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onViewGenetics}
            className="flex items-center justify-center text-xs bg-purple-50 text-purple-700 px-3 py-2 rounded hover:bg-purple-100 transition-colors"
          >
            <Dna className="w-3 h-3 mr-1" />
            Genetic Analysis
          </button>
          <button
            onClick={onAddMember}
            className="flex items-center justify-center text-xs bg-green-50 text-green-700 px-3 py-2 rounded hover:bg-green-100 transition-colors"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Member
          </button>
        </div>
      </div>
    </div>
  );
}