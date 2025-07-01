// src/app/(dashboard)/patient/research-participation/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { patientService } from '@/lib/api/services/patient.service';
import { Spinner } from '@/components/ui/spinner';

interface ClinicalStudy {
  id: number;
  title: string;
  description: string;
  phase: 'I' | 'II' | 'III' | 'IV' | 'Observational';
  status: 'recruiting' | 'active' | 'completed' | 'suspended' | 'terminated';
  sponsor: {
    name: string;
    type: 'academic' | 'industry' | 'government';
  };
  principal_investigator: {
    name: string;
    affiliation: string;
  };
  condition: string;
  intervention_type: 'drug' | 'device' | 'behavioral' | 'procedure' | 'other';
  intervention_name: string;
  duration_weeks: number;
  location: {
    city: string;
    state: string;
    facility: string;
  };
  eligibility_criteria: {
    min_age: number;
    max_age: number;
    gender: 'all' | 'male' | 'female';
    conditions: string[];
    exclusions: string[];
  };
  compensation: {
    provided: boolean;
    amount?: number;
    description?: string;
  };
  estimated_enrollment: number;
  start_date: string;
  completion_date: string;
  contact_info: {
    name: string;
    phone: string;
    email: string;
  };
  nct_number?: string; // ClinicalTrials.gov identifier
  irb_approved: boolean;
  user_interested: boolean;
  user_eligible: boolean | null; // null = not assessed yet
}

interface ResearchParticipation {
  id: number;
  study: ClinicalStudy;
  status: 'interested' | 'screening' | 'enrolled' | 'completed' | 'withdrawn';
  enrolled_date?: string;
  completion_date?: string;
  withdrawal_reason?: string;
  notes?: string;
}

interface StudyFilters {
  condition: string;
  phase: string;
  interventionType: string;
  location: string;
  status: string;
  compensated: boolean | null;
}

export default function ResearchParticipationPage() {
  const [activeTab, setActiveTab] = useState<'available' | 'my_studies' | 'completed'>('available');
  const [availableStudies, setAvailableStudies] = useState<ClinicalStudy[]>([]);
  const [myParticipation, setMyParticipation] = useState<ResearchParticipation[]>([]);
  const [selectedStudy, setSelectedStudy] = useState<ClinicalStudy | null>(null);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [interestNotes, setInterestNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<StudyFilters>({
    condition: '',
    phase: '',
    interventionType: '',
    location: '',
    status: 'recruiting',
    compensated: null,
  });

  // Fetch available studies and user participation
  useEffect(() => {
    const fetchResearchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [studiesResponse, participationResponse] = await Promise.all([
          patientService.getAvailableStudies({
            condition: filters.condition || undefined,
            phase: filters.phase || undefined,
            location: filters.location || undefined,
          }),
          patientService.getResearchParticipation(),
        ]);

        setAvailableStudies(studiesResponse.results || []);
        setMyParticipation(participationResponse || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load research data');
      } finally {
        setLoading(false);
      }
    };

    fetchResearchData();
  }, [filters]);

  // Filter available studies
  const filteredStudies = availableStudies.filter(study => {
    if (filters.condition && !study.condition.toLowerCase().includes(filters.condition.toLowerCase())) return false;
    if (filters.phase && study.phase !== filters.phase) return false;
    if (filters.interventionType && study.intervention_type !== filters.interventionType) return false;
    if (filters.location && !study.location.city.toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (filters.status && study.status !== filters.status) return false;
    if (filters.compensated !== null && study.compensation.provided !== filters.compensated) return false;
    
    return true;
  });

  // Get study phase color
  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'I':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'II':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'III':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'IV':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Observational':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recruiting':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'active':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'terminated':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get intervention type icon
  const getInterventionIcon = (type: string) => {
    switch (type) {
      case 'drug':
        return '💊';
      case 'device':
        return '🔬';
      case 'behavioral':
        return '🧠';
      case 'procedure':
        return '🏥';
      default:
        return '📋';
    }
  };

  // Express interest in study
  const expressInterest = async () => {
    if (!selectedStudy) return;

    try {
      await patientService.expressClinicalTrialInterest(selectedStudy.id, interestNotes);
      
      // Update local state
      setAvailableStudies(prev =>
        prev.map(study =>
          study.id === selectedStudy.id ? { ...study, user_interested: true } : study
        )
      );
      
      setShowInterestModal(false);
      setSelectedStudy(null);
      setInterestNotes('');
      
      // Show success message
      console.log('Interest expressed successfully');
    } catch (err) {
      console.error('Failed to express interest:', err);
      // Show error message
    }
  };

  // Check eligibility (mock function)
  const checkEligibility = (study: ClinicalStudy): { eligible: boolean; reasons: string[] } => {
    const reasons: string[] = [];
    
    // This would normally check against user's profile data
    // For demo purposes, we'll just use some mock logic
    
    // Age check (assuming user is 35 years old)
    const userAge = 35;
    if (userAge < study.eligibility_criteria.min_age) {
      reasons.push(`Must be at least ${study.eligibility_criteria.min_age} years old`);
    }
    if (userAge > study.eligibility_criteria.max_age) {
      reasons.push(`Must be ${study.eligibility_criteria.max_age} years old or younger`);
    }
    
    return { eligible: reasons.length === 0, reasons };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Spinner size="lg" />
        <span className="ml-2 text-gray-600">Loading research opportunities...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-800 mb-2">Unable to Load Research Studies</h3>
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Research Participation</h1>
        <p className="mt-2 text-gray-600">
          Explore clinical trials and research studies that could benefit your health and advance medical science.
        </p>
      </div>

      {/* Information Notice */}
      <div className="mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium text-blue-800">About Clinical Research</p>
              <div className="text-sm text-blue-700 mt-1">
                <p>• Participation is always voluntary - you can withdraw at any time</p>
                <p>• All studies are reviewed and approved by ethics committees</p>
                <p>• Your privacy and safety are our top priorities</p>
                <p>• Speak with your doctor before joining any study</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'available', label: 'Available Studies', count: filteredStudies.length },
              { key: 'my_studies', label: 'My Studies', count: myParticipation.filter(p => ['interested', 'screening', 'enrolled'].includes(p.status)).length },
              { key: 'completed', label: 'Completed', count: myParticipation.filter(p => ['completed', 'withdrawn'].includes(p.status)).length },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Available Studies Tab */}
      {activeTab === 'available' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Filter Studies</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                <input
                  type="text"
                  placeholder="e.g., diabetes, cancer..."
                  value={filters.condition}
                  onChange={(e) => setFilters({ ...filters, condition: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phase</label>
                <select
                  value={filters.phase}
                  onChange={(e) => setFilters({ ...filters, phase: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Phases</option>
                  <option value="I">Phase I</option>
                  <option value="II">Phase II</option>
                  <option value="III">Phase III</option>
                  <option value="IV">Phase IV</option>
                  <option value="Observational">Observational</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Intervention Type</label>
                <select
                  value={filters.interventionType}
                  onChange={(e) => setFilters({ ...filters, interventionType: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="drug">Drug/Treatment</option>
                  <option value="device">Medical Device</option>
                  <option value="behavioral">Behavioral</option>
                  <option value="procedure">Procedure</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  placeholder="City or facility..."
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="recruiting">Recruiting</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => setFilters({
                    condition: '', phase: '', interventionType: '', 
                    location: '', status: 'recruiting', compensated: null
                  })}
                  className="w-full px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Studies List */}
          {filteredStudies.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
              <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <p className="text-gray-500 mb-4">No studies match your criteria</p>
              <p className="text-sm text-gray-400">
                Try adjusting your filters to see more studies
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredStudies.map(study => {
                const eligibility = checkEligibility(study);
                
                return (
                  <div key={study.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-2xl">{getInterventionIcon(study.intervention_type)}</span>
                          <h3 className="text-lg font-semibold text-gray-900">{study.title}</h3>
                        </div>
                        
                        <div className="flex items-center space-x-3 mb-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPhaseColor(study.phase)}`}
                          >
                            Phase {study.phase}
                          </span>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(study.status)}`}
                          >
                            {study.status}
                          </span>
                          {study.compensation.provided && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                              💰 Compensated
                            </span>
                          )}
                          {study.user_interested && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                              ⭐ Interested
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4 line-clamp-3">{study.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Condition:</span>
                        <p className="text-gray-900">{study.condition}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Intervention:</span>
                        <p className="text-gray-900">{study.intervention_name}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Duration:</span>
                        <p className="text-gray-900">{study.duration_weeks} weeks</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Location:</span>
                        <p className="text-gray-900">{study.location.city}, {study.location.state}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Sponsor:</span>
                        <p className="text-gray-900">{study.sponsor.name} ({study.sponsor.type})</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Principal Investigator:</span>
                        <p className="text-gray-900">{study.principal_investigator.name}</p>
                      </div>
                    </div>

                    {/* Eligibility */}
                    <div className="mb-4 p-3 rounded-lg border">
                      <h4 className="font-medium text-gray-900 mb-2">Eligibility</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Age Range:</span>
                          <p className="text-gray-900">
                            {study.eligibility_criteria.min_age} - {study.eligibility_criteria.max_age} years
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Gender:</span>
                          <p className="text-gray-900 capitalize">{study.eligibility_criteria.gender}</p>
                        </div>
                      </div>
                      
                      {!eligibility.eligible && eligibility.reasons.length > 0 && (
                        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                          <p className="text-sm font-medium text-yellow-800">Potential eligibility concerns:</p>
                          <ul className="text-sm text-yellow-700 mt-1">
                            {eligibility.reasons.map((reason, index) => (
                              <li key={index}>• {reason}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        {study.nct_number && (
                          <span>NCT: {study.nct_number}</span>
                        )}
                        <span>Enrollment: {study.estimated_enrollment} participants</span>
                      </div>
                      
                      <div className="flex space-x-3">
                        <Link
                          href={`/dashboard/patient/research-participation/${study.id}`}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Learn More
                        </Link>
                        
                        {!study.user_interested && study.status === 'recruiting' && (
                          <button
                            onClick={() => {
                              setSelectedStudy(study);
                              setShowInterestModal(true);
                            }}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                          >
                            Express Interest
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* My Studies Tab */}
      {activeTab === 'my_studies' && (
        <div className="space-y-6">
          {myParticipation.filter(p => ['interested', 'screening', 'enrolled'].includes(p.status)).length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
              <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <p className="text-gray-500 mb-4">No current study participation</p>
              <p className="text-sm text-gray-400">
                Express interest in studies to get started
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myParticipation
                .filter(p => ['interested', 'screening', 'enrolled'].includes(p.status))
                .map(participation => (
                  <div key={participation.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{participation.study.title}</h3>
                        <p className="text-sm text-gray-600">{participation.study.condition}</p>
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          participation.status === 'enrolled' ? 'bg-green-100 text-green-800 border-green-200' :
                          participation.status === 'screening' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                          'bg-blue-100 text-blue-800 border-blue-200'
                        }`}
                      >
                        {participation.status}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 mb-4">{participation.study.description}</p>
                    
                    {participation.notes && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700">Your Notes:</p>
                        <p className="text-sm text-gray-600 mt-1">{participation.notes}</p>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        {participation.enrolled_date && (
                          <span>Enrolled: {new Date(participation.enrolled_date).toLocaleDateString()}</span>
                        )}
                      </div>
                      <Link
                        href={`/dashboard/patient/research-participation/${participation.study.id}`}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Completed Tab */}
      {activeTab === 'completed' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Completed Studies</h3>
          <p className="text-gray-600">
            Your completed research participation history will be displayed here.
          </p>
        </div>
      )}

      {/* Express Interest Modal */}
      {showInterestModal && selectedStudy && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Express Interest in Study</h3>
              <p className="text-sm text-gray-600 mb-4">
                <strong>{selectedStudy.title}</strong>
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Why are you interested in this study? (optional)
                </label>
                <textarea
                  value={interestNotes}
                  onChange={(e) => setInterestNotes(e.target.value)}
                  rows={4}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Share your motivation or questions about the study..."
                />
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Expressing interest does not commit you to participation. 
                  The research team will contact you with more information about eligibility and next steps.
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowInterestModal(false);
                    setSelectedStudy(null);
                    setInterestNotes('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={expressInterest}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  Express Interest
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
