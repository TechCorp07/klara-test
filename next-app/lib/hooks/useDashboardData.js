import { useAuth } from '@/contexts/AuthContext';
import { useQueryWrapper } from '@/useQueryWrapper';

/**
 * Custom hook for fetching common dashboard data based on user role
 * 
 * @param {Object} options - Options for the queries
 * @returns {Object} Dashboard data queries
 */
export function useDashboardData(options = {}) {
  const { user } = useAuth();
  const { services = {} } = options;
  
  // Base queries that are common to all dashboards
  const baseQueries = {
    user
  };
  
  // Role-specific queries
  if (!user) return baseQueries;
  
  switch(user.role) {
    case 'admin':
    case 'superadmin':
      return {
        ...baseQueries,
        systemStats: useQueryWrapper(
          ['systemStats'],
          () => services.auditService?.getSystemStats(),
          { enabled: !!user && !!services.auditService }
        ),
        pendingApprovals: useQueryWrapper(
          ['pendingApprovals'],
          () => services.healthcare?.getPendingApprovals(),
          { enabled: !!user && !!services.healthcare }
        ),
        recentUsers: useQueryWrapper(
          ['recentUsers'],
          () => services.auditService?.getRecentUsers(),
          { enabled: !!user && !!services.auditService }
        ),
        systemAlerts: useQueryWrapper(
          ['systemAlerts'],
          () => services.auditService?.getSystemAlerts(),
          { enabled: !!user && !!services.auditService }
        )
      };
      
    case 'patient':
      return {
        ...baseQueries,
        appointments: useQueryWrapper(
          ['upcomingAppointments'],
          () => services.telemedicine?.getUpcomingAppointments(),
          { enabled: !!user && !!services.telemedicine }
        ),
        medications: useQueryWrapper(
          ['medications', user?.id],
          () => services.medication?.getMedications({ patient: user?.id }),
          { enabled: !!user && !!services.medication }
        ),
        medicalRecords: useQueryWrapper(
          ['medicalRecords', user?.id],
          () => services.healthcare?.getMedicalRecords(user?.id),
          { enabled: !!user && !!services.healthcare }
        ),
        wearableData: useQueryWrapper(
          ['wearableData', user?.id],
          () => services.wearables?.getWearableData(user?.id, 'all', null, null),
          { enabled: !!user && !!services.wearables }
        )
      };
      
    case 'provider':
      return {
        ...baseQueries,
        appointments: useQueryWrapper(
          ['providerAppointments'],
          () => services.telemedicine?.getProviderAppointments(),
          { enabled: !!user && !!services.telemedicine }
        ),
        patients: useQueryWrapper(
          ['providerPatients'],
          () => services.healthcare?.getProviderPatients(),
          { enabled: !!user && !!services.healthcare }
        ),
        messages: useQueryWrapper(
          ['providerMessages'],
          () => services.telemedicine?.getProviderMessages({ status: 'unread' }),
          { enabled: !!user && !!services.telemedicine }
        ),
        referrals: useQueryWrapper(
          ['providerReferrals'],
          () => services.healthcare?.getProviderReferrals(),
          { enabled: !!user && !!services.healthcare }
        )
      };
      
    case 'researcher':
      return {
        ...baseQueries,
        studies: useQueryWrapper(
          ['researchStudies'],
          () => services.healthcare?.getResearchStudies(),
          { enabled: !!user && !!services.healthcare }
        ),
        participants: useQueryWrapper(
          ['studyParticipants'],
          () => services.healthcare?.getStudyParticipants(),
          { enabled: !!user && !!services.healthcare }
        ),
        anonymizedData: useQueryWrapper(
          ['anonymizedData'],
          () => services.healthcare?.getAnonymizedPatientData(),
          { enabled: !!user && !!services.healthcare }
        ),
        rareConditions: useQueryWrapper(
          ['rareConditions'],
          () => services.healthcare?.getRareConditionRegistry(),
          { enabled: !!user && !!services.healthcare }
        )
      };
      
    case 'pharmco':
      return {
        ...baseQueries,
        inventory: useQueryWrapper(
          ['medicationInventory'],
          () => services.medication?.getMedicationInventory(),
          { enabled: !!user && !!services.medication }
        ),
        prescriptions: useQueryWrapper(
          ['pendingPrescriptions'],
          () => services.medication?.getPrescriptions({ status: 'pending' }),
          { enabled: !!user && !!services.medication }
        ),
        adherenceData: useQueryWrapper(
          ['medicationAdherence'],
          () => services.medication?.getMedicationAdherenceStats(),
          { enabled: !!user && !!services.medication }
        ),
        interactions: useQueryWrapper(
          ['medicationInteractions'],
          () => services.medication?.getMedicationInteractions(),
          { enabled: !!user && !!services.medication }
        )
      };
      
    case 'caregiver':
      return {
        ...baseQueries,
        patients: useQueryWrapper(
          ['caregiverPatients'],
          () => services.healthcare?.getCaregiverPatients(),
          { enabled: !!user && !!services.healthcare }
        ),
        appointments: useQueryWrapper(
          ['caregiverAppointments'],
          () => services.telemedicine?.getCaregiverAppointments(),
          { enabled: !!user && !!services.telemedicine }
        ),
        medications: useQueryWrapper(
          ['caregiverMedications'],
          () => services.healthcare?.getCaregiverMedications(),
          { enabled: !!user && !!services.healthcare }
        ),
        careTasks: useQueryWrapper(
          ['caregiverTasks'],
          () => services.healthcare?.getCaregiverTasks(),
          { enabled: !!user && !!services.healthcare }
        )
      };
      
    case 'compliance':
      return {
        ...baseQueries,
        auditLogs: useQueryWrapper(
          ['auditLogs'],
          () => services.auditService?.getAuditLogs({ limit: 5 }),
          { enabled: !!user && !!services.auditService }
        ),
        complianceReports: useQueryWrapper(
          ['complianceReports'],
          () => services.auditService?.getComplianceReports(),
          { enabled: !!user && !!services.auditService }
        ),
        securityIncidents: useQueryWrapper(
          ['securityIncidents'],
          () => services.auditService?.getSecurityIncidents(),
          { enabled: !!user && !!services.auditService }
        ),
        complianceMetrics: useQueryWrapper(
          ['complianceMetrics'],
          () => services.auditService?.getComplianceMetrics(),
          { enabled: !!user && !!services.auditService }
        )
      };
      
    default:
      return baseQueries;
  }
}