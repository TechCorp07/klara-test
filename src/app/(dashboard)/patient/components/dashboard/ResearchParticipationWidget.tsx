// src/app/(dashboard)/patient/components/dashboard/ResearchParticipationWidget.tsx
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
        eligibility_match: number; // percentage
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
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Research Participation</h3>
  
        {/* Enrolled Studies */}
        {researchData.enrolled_studies.length > 0 ? (
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Enrolled Studies</h4>
            {researchData.enrolled_studies.map((study) => (
              <div key={study.id} className="border border-green-200 bg-green-50 rounded-lg p-3 mb-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium text-green-800">{study.title}</div>
                    <div className="text-sm text-green-600">Phase {study.phase}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-800">${study.compensation_earned}</div>
                    <div className="text-xs text-green-600">earned</div>
                  </div>
                </div>
                {study.next_visit_date && (
                  <div className="text-sm text-green-700">
                    Next visit: {new Date(study.next_visit_date).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="mb-6 text-center py-4 text-gray-500">
            <p>Not enrolled in any studies</p>
          </div>
        )}
  
        {/* Data Contributions */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="text-center">
            <div className="text-xl font-bold text-purple-600">{researchData.data_contributions.total_surveys_completed}</div>
            <div className="text-xs text-gray-600">Surveys</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600">{researchData.data_contributions.wearable_data_shared_days}</div>
            <div className="text-xs text-gray-600">Data Days</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-600">{researchData.data_contributions.clinical_visits_completed}</div>
            <div className="text-xs text-gray-600">Visits</div>
          </div>
        </div>
  
        {/* Available Studies */}
        {researchData.available_studies.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Available Studies</h4>
            {researchData.available_studies.slice(0, 2).map((study) => (
              <div key={study.id} className="border border-gray-200 rounded-lg p-3 mb-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium text-gray-900">{study.title}</div>
                    <div className="text-sm text-gray-600 mb-1">{study.description}</div>
                    <div className="text-xs text-gray-500">{study.estimated_time_commitment}</div>
                  </div>
                  <div className="text-right ml-4">
                    <div className={`text-sm font-medium ${
                      study.eligibility_match >= 80 ? 'text-green-600' :
                      study.eligibility_match >= 60 ? 'text-yellow-600' : 'text-gray-600'
                    }`}>
                      {study.eligibility_match}% match
                    </div>
                    <div className="text-xs text-gray-600">{study.compensation}</div>
                  </div>
                </div>
                <button
                  onClick={() => onJoinStudy(study.id)}
                  className="w-full bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition-colors"
                >
                  Learn More
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }  