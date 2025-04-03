from rest_framework import permissions

class IsAdminOrSelfOnly(permissions.BasePermission):
    """Allow users to edit only their own profile unless they are admins."""
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any authenticated user
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Write permissions are only allowed to the user or admin
        return obj == request.user or request.user.is_staff or request.user.role == 'admin'


class IsRoleOwnerOrReadOnly(permissions.BasePermission):
    """Allow owners of profiles to edit them."""
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed based on view's get_queryset
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Write permissions are only allowed to the owner or admin
        return obj.user == request.user or request.user.is_staff or request.user.role == 'admin'


class IsCaregiverWithPermission(permissions.BasePermission):
    """Allow caregivers to access patient data based on their permission level."""
    def has_permission(self, request, view):
        # Always allow admins and providers
        if request.user.is_staff or request.user.role in ['admin', 'provider']:
            return True
            
        # For caregivers, check their access level
        if request.user.role == 'caregiver' and hasattr(request.user, 'caregiver_profile'):
            # For list actions, rely on get_queryset filtering
            if view.action == 'list':
                return True
                
            # For detail actions, check if patient ID is provided
            patient_id = request.query_params.get('patient_id')
            if patient_id:
                from users.models import PatientProfile
                try:
                    patient = PatientProfile.objects.get(id=patient_id)
                    # Check if caregiver is authorized for this patient
                    if patient.authorized_caregivers.filter(id=request.user.id).exists():
                        # Check access level based on the action
                        if view.action in ['retrieve']:
                            # View access is allowed for all levels
                            return True
                        elif view.action in ['create', 'update', 'partial_update', 'destroy']:
                            # Modify access depends on access level
                            access_level = request.user.caregiver_profile.access_level
                            if 'medication' in view.basename.lower():
                                return access_level in ['MEDICATIONS', 'FULL']
                            elif 'appointment' in view.basename.lower():
                                return access_level in ['SCHEDULE', 'FULL']
                            else:
                                return access_level == 'FULL'
                except PatientProfile.DoesNotExist:
                    return False
                    
        # For patients, they can access their own data
        if request.user.role == 'patient':
            return True
            
        # Default denial
        return False


class IsPharmcoWithConsent(permissions.BasePermission):
    """Allow pharma companies to access data only for patients who have consented."""
    def has_permission(self, request, view):
        # Always allow admins
        if request.user.is_staff or request.user.role == 'admin':
            return True
            
        # For pharmaceutical companies
        if request.user.role == 'pharmco':
            # For list actions, rely on get_queryset filtering
            if view.action == 'list':
                return True
                
            # For detail actions, check if patient has consented
            if view.action in ['retrieve'] and hasattr(view, 'get_object'):
                obj = view.get_object()
                
                # Check if this is medication adherence data
                if 'medication' in view.basename.lower() or 'adherence' in view.basename.lower():
                    # Check if patient has consented to medication monitoring
                    if hasattr(obj, 'patient'):
                        return obj.patient.medication_adherence_opt_in
                    elif hasattr(obj, 'user') and hasattr(obj.user, 'patient_profile'):
                        return obj.user.patient_profile.medication_adherence_opt_in
                        
                # Check if this is vitals data
                elif 'vital' in view.basename.lower():
                    # Check if patient has consented to vitals monitoring
                    if hasattr(obj, 'patient'):
                        return obj.patient.vitals_monitoring_opt_in
                    elif hasattr(obj, 'user') and hasattr(obj.user, 'patient_profile'):
                        return obj.user.patient_profile.vitals_monitoring_opt_in
                        
        # Default denial for pharmco
        return False


class IsResearcherWithConsent(permissions.BasePermission):
    """Allow researchers to access anonymized data only for patients who have consented to research."""
    def has_permission(self, request, view):
        # Always allow admins
        if request.user.is_staff or request.user.role == 'admin':
            return True
            
        # For researchers
        if request.user.role == 'researcher' and hasattr(request.user, 'researcher_profile'):
            # Only verified researchers can access data
            if not request.user.researcher_profile.is_verified:
                return False
                
            # For list actions, rely on get_queryset filtering for research-consented patients
            if view.action == 'list':
                return True
                
            # For detail actions, check if patient has consented to research
            if view.action in ['retrieve'] and hasattr(view, 'get_object'):
                obj = view.get_object()
                
                # Check if patient has consented to research
                if hasattr(obj, 'patient'):
                    return obj.patient.user.research_consent
                elif hasattr(obj, 'user'):
                    return obj.user.research_consent
                    
        # Default denial for researchers
        return False


class IsComplianceOfficer(permissions.BasePermission):
    """Allow compliance officers full read access to HIPAA-relevant data."""
    def has_permission(self, request, view):
        # Always allow admins
        if request.user.is_staff or request.user.role == 'admin':
            return True
            
        # For compliance officers
        if request.user.role == 'compliance' and hasattr(request.user, 'compliance_profile'):
            # Read-only for most views
            if request.method in permissions.SAFE_METHODS:
                # Check specific permissions based on view type
                if 'audit' in view.basename.lower() and request.user.compliance_profile.can_view_audit_logs:
                    return True
                elif ('patient' in view.basename.lower() or 'phi' in view.basename.lower()) and request.user.compliance_profile.can_view_phi:
                    return True
                elif 'consent' in view.basename.lower() and request.user.compliance_profile.can_view_consent_logs:
                    return True
                # Generic safety check - compliance officers can see most data but not modify
                return True
            # No write permissions for compliance officers except on their own profile
            return False
        
        # Default denial for non-compliance users
        return False

class IsApprovedUser(permissions.BasePermission):
    """
    Allows access only to approved users.
    Admins are always considered approved.
    """
    message = "Your account is pending administrator approval."
    
    def has_permission(self, request, view):
        # Allow unapproved users to access login and registration
        if view.action in ['create', 'login', 'verify_2fa']:
            return True
            
        # Admins and staff are always approved
        if request.user.is_staff or request.user.role == 'admin':
            return True
            
        # For all other actions, check if the user is approved
        return request.user.is_approved
        
    def has_object_permission(self, request, view, obj):
        # Allow unapproved users to access login and registration
        if view.action in ['create', 'login', 'verify_2fa']:
            return True
            
        # Admins and staff are always approved
        if request.user.is_staff or request.user.role == 'admin':
            return True
            
        # For all other actions, check if the user is approved
        return request.user.is_approved
