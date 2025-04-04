from django.db import models
from django.conf import settings
from django.utils import timezone
import uuid


class AuditEvent(models.Model):
    """
    Model for general audit events.
    Tracks API access, system events, and user actions.
    """
    class EventType(models.TextChoices):
        CREATE = 'create', 'Create'
        READ = 'read', 'Read'
        UPDATE = 'update', 'Update'
        DELETE = 'delete', 'Delete'
        LOGIN = 'login', 'Login'
        LOGOUT = 'logout', 'Logout'
        ACCESS = 'access', 'Access'
        ERROR = 'error', 'Error'
        PASSWORD_RESET = 'password_reset', 'Password Reset'
        ACCOUNT_LOCKOUT = 'account_lockout', 'Account Lockout'
        PERMISSION_CHANGE = 'permission_change', 'Permission Change'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        related_name='audit_events',
        null=True,
        blank=True
    )
    event_type = models.CharField(max_length=20, choices=EventType.choices)
    resource_type = models.CharField(max_length=100)
    resource_id = models.CharField(max_length=100, blank=True)
    description = models.TextField()
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    additional_data = models.JSONField(default=dict, blank=True)
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['event_type']),
            models.Index(fields=['resource_type']),
            models.Index(fields=['user']),
        ]
    
    def __str__(self):
        return f"{self.event_type} {self.resource_type} by {self.user or 'Anonymous'}"


class PHIAccessLog(models.Model):
    """
    Model for tracking Protected Health Information (PHI) access.
    HIPAA requires detailed logging of all PHI access.
    """
    class AccessType(models.TextChoices):
        VIEW = 'view', 'View'
        MODIFY = 'modify', 'Modify'
        EXPORT = 'export', 'Export'
        SHARE = 'share', 'Share'
        PRINT = 'print', 'Print'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name='phi_access_logs',
        null=True
    )
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name='phi_accessed_logs',
        null=True
    )
    access_type = models.CharField(max_length=20, choices=AccessType.choices)
    reason = models.TextField()
    record_type = models.CharField(max_length=100)
    record_id = models.CharField(max_length=100)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    additional_data = models.JSONField(default=dict, blank=True)
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['access_type']),
            models.Index(fields=['user']),
            models.Index(fields=['patient']),
        ]
        verbose_name = 'PHI Access Log'
        verbose_name_plural = 'PHI Access Logs'
    
    def __str__(self):
        return f"{self.access_type} of {self.patient}'s {self.record_type} by {self.user}"


class SecurityAuditLog(models.Model):
    """
    Model for tracking security-related events.
    For security alerts, threats, and potential breaches.
    """
    class EventType(models.TextChoices):
        LOGIN_FAILED = 'login_failed', 'Login Failed'
        SUSPICIOUS_ACCESS = 'suspicious_access', 'Suspicious Access'
        PERMISSION_VIOLATION = 'permission_violation', 'Permission Violation'
        BRUTE_FORCE_ATTEMPT = 'brute_force_attempt', 'Brute Force Attempt'
        UNUSUAL_ACTIVITY = 'unusual_activity', 'Unusual Activity'
        SYSTEM_ERROR = 'system_error', 'System Error'
    
    class Severity(models.TextChoices):
        LOW = 'low', 'Low'
        MEDIUM = 'medium', 'Medium'
        HIGH = 'high', 'High'
        CRITICAL = 'critical', 'Critical'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name='security_audit_logs',
        null=True,
        blank=True
    )
    event_type = models.CharField(max_length=30, choices=EventType.choices)
    description = models.TextField()
    severity = models.CharField(max_length=10, choices=Severity.choices, default=Severity.MEDIUM)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    additional_data = models.JSONField(default=dict, blank=True)
    resolved = models.BooleanField(default=False)
    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name='resolved_security_logs',
        null=True,
        blank=True
    )
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolution_notes = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['event_type']),
            models.Index(fields=['severity']),
            models.Index(fields=['resolved']),
        ]
        verbose_name = 'Security Audit Log'
        verbose_name_plural = 'Security Audit Logs'
    
    def __str__(self):
        return f"{self.event_type} - {self.severity} severity"
    
    def resolve(self, user, notes=''):
        """Mark security issue as resolved"""
        self.resolved = True
        self.resolved_by = user
        self.resolved_at = timezone.now()
        self.resolution_notes = notes
        self.save()


class ComplianceReport(models.Model):
    """
    Model for HIPAA compliance reports.
    For scheduled and ad-hoc compliance reporting.
    """
    class ReportType(models.TextChoices):
        DAILY_AUDIT = 'daily_audit', 'Daily Audit'
        PHI_ACCESS = 'phi_access', 'PHI Access'
        SECURITY_INCIDENTS = 'security_incidents', 'Security Incidents'
        USER_ACTIVITY = 'user_activity', 'User Activity'
        SYSTEM_ACCESS = 'system_access', 'System Access'
        CUSTOM = 'custom', 'Custom Report'
    
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        PROCESSING = 'processing', 'Processing'
        COMPLETED = 'completed', 'Completed'
        FAILED = 'failed', 'Failed'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    report_type = models.CharField(max_length=30, choices=ReportType.choices)
    report_date = models.DateField()
    generated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name='generated_compliance_reports',
        null=True,
        blank=True
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    file_url = models.URLField(blank=True)
    parameters = models.JSONField(default=dict, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-report_date']
        indexes = [
            models.Index(fields=['report_type']),
            models.Index(fields=['report_date']),
            models.Index(fields=['status']),
        ]
        verbose_name = 'Compliance Report'
        verbose_name_plural = 'Compliance Reports'
    
    def __str__(self):
        return f"{self.get_report_type_display()} - {self.report_date}"


class AuditExport(models.Model):
    """
    Model for audit data exports.
    For exporting audit data for reporting or investigation.
    """
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        PROCESSING = 'processing', 'Processing'
        COMPLETED = 'completed', 'Completed'
        FAILED = 'failed', 'Failed'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='audit_exports'
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    file_url = models.URLField(blank=True)
    filters = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['user']),
        ]
    
    def __str__(self):
        return f"Audit Export by {self.user.username} ({self.status})"
