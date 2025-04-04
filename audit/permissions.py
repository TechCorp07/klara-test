from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """
    Permission to only allow admin users to access the audit system.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'admin'

class IsSuperuser(permissions.BasePermission):
    """
    Permission to only allow superusers to access sensitive audit operations.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_superuser

class IsComplianceOfficer(permissions.BasePermission):
    """
    Permission to allow compliance officers to access audit reports.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and \
               (request.user.role == 'admin' or request.user.role == 'compliance_officer')

class CanAccessPHILogs(permissions.BasePermission):
    """
    Permission to allow access to PHI access logs.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        return request.user.role in ['admin', 'compliance_officer', 'provider']
