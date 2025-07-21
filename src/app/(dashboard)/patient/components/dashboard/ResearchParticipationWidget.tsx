// src/app/(dashboard)/patient/components/dashboard/ResearchParticipationWidget.tsx
import React from 'react';
import { FlaskConical, Users, DollarSign, Calendar, Award, ChevronRight } from 'lucide-react';

interface ResearchParticipationProps {
  researchData: {
    enrolled_studies: Array<{
      id: number;
      title: string;
      phase: string;
      enrollment_date: string;
      next_visit_date?: string;
      compensation_earned: number;
    }>;
    available_studies: Array<{
      id: number;
      title: string;
      description: string;
      estimated_time_commitment: string;
      compensation: string;
      eligibility_match: number;
    }>;
    data_contributions: {
      total_surveys_completed: number;
      wearable_data_shared_days: number;
      clinical_visits_completed: number;
    };
  };
  onJoinStudy: (studyId: number) => void;
}

export function ResearchParticipationWidget({ researchData, onJoinStudy }: ResearchParticipationProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPhaseColor = (phase: string) => {
    switch (phase.toLowerCase()) {
      case 'phase i':
      case 'phase 1':
        return 'bg-blue-100 text-blue-800';
      case 'phase ii':
      case 'phase 2':
        return 'bg-yellow-100 text-yellow-800';
      case 'phase iii':
      case 'phase 3':
        return 'bg-green-100 text-green-800';
      case 'phase iv':
      case 'phase 4':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEligibilityColor = (match: number) => {
    if (match >= 90) return 'bg-green-100 text-green-800';
    if (match >= 75) return 'bg-yellow-100 text-yellow-800';
    if (match >= 50) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const totalCompensation = researchData.enrolled_studies.reduce(
    (sum, study) => sum + study.compensation_earned, 0
  );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-4">
        <FlaskConical className="w-5 h-5 text-purple-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Research Participation</h3>
      </div>

      {/* Active Studies */}
      {researchData.enrolled_studies.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Your Active Studies</h4>
          <div className="space-y-3">
            {researchData.enrolled_studies.map((study) => (
              <div key={study.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm line-clamp-2">
                      {study.title}
                    </div>
                    <div className="flex items-center mt-1 space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPhaseColor(study.phase)}`}>
                        {study.phase}
                      </span>
                      <span className="text-xs text-gray-600">
                        Enrolled: {formatDate(study.enrollment_date)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right ml-2">
                    <div className="text-sm font-medium text-green-600">
                      ${study.compensation_earned}
                    </div>
                    <div className="text-xs text-gray-600">earned</div>
                  </div>
                </div>
                
                {study.next_visit_date && (
                  <div className="flex items-center text-xs text-gray-600 mt-2">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>Next visit: {formatDate(study.next_visit_date)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Research Impact Summary */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Your Research Impact</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center mb-1">
              <Users className="w-4 h-4 text-blue-600 mr-1" />
              <span className="text-sm font-medium text-gray-900">Surveys</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {researchData.data_contributions.total_surveys_completed}
            </div>
            <div className="text-xs text-gray-600">completed</div>
          </div>

          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center mb-1">
              <Award className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-sm font-medium text-gray-900">Data Days</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {researchData.data_contributions.wearable_data_shared_days}
            </div>
            <div className="text-xs text-gray-600">shared</div>
          </div>

          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="flex items-center mb-1">
              <Calendar className="w-4 h-4 text-purple-600 mr-1" />
              <span className="text-sm font-medium text-gray-900">Visits</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {researchData.data_contributions.clinical_visits_completed}
            </div>
            <div className="text-xs text-gray-600">completed</div>
          </div>

          <div className="bg-yellow-50 p-3 rounded-lg">
            <div className="flex items-center mb-1">
              <DollarSign className="w-4 h-4 text-yellow-600 mr-1" />
              <span className="text-sm font-medium text-gray-900">Total Earned</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              ${totalCompensation}
            </div>
            <div className="text-xs text-gray-600">compensation</div>
          </div>
        </div>
      </div>

      {/* Available Studies */}
      {researchData.available_studies.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Recommended Studies</h4>
          <div className="space-y-3">
            {researchData.available_studies.slice(0, 2).map((study) => (
              <div key={study.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm line-clamp-2">
                      {study.title}
                    </div>
                    <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {study.description}
                    </div>
                  </div>
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getEligibilityColor(study.eligibility_match)}`}>
                    {study.eligibility_match}% match
                  </span>
                </div>
                
                <div className="flex items-center justify-between mt-3">
                  <div className="text-xs text-gray-600">
                    <span className="mr-3">⏱️ {study.estimated_time_commitment}</span>
                    <span>💰 {study.compensation}</span>
                  </div>
                  <button
                    onClick={() => onJoinStudy(study.id)}
                    className="flex items-center text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700 transition-colors"
                  >
                    <span>Learn More</span>
                    <ChevronRight className="w-3 h-3 ml-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Active Studies */}
      {researchData.enrolled_studies.length === 0 && researchData.available_studies.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          <FlaskConical className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm mb-2">No research studies available</p>
          <p className="text-xs text-gray-400">
            Research studies matching your rare condition will appear here when available
          </p>
        </div>
      )}
    </div>
  );
}