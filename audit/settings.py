# HIPAA Audit Configuration
from datetime import timedelta
import crontab

AUDIT_ENABLED = True

# Paths to exclude from audit logging
AUDIT_SKIP_PATHS = [
    r'^/admin/',
    r'^/static/',
    r'^/media/',
    r'^/favicon\.ico$',
    r'^/robots\.txt$',
    r'^/api/docs/',
    r'^/api/schema/'
]

# Paths that contain PHI and require special logging
AUDIT_PHI_PATHS = [
    r'^/api/healthcare/',
    r'^/api/medication/',
    r'^/api/telemedicine/',
    r'^/api/patients/',
    r'^/api/providers/'
]

# Security settings
AUDIT_TRACK_FAILED_LOGINS = True
AUDIT_FAILED_LOGIN_THRESHOLD = 5  # Number of failures before flagging
AUDIT_FAILED_LOGIN_WINDOW_MINUTES = 15  # Time window for failures
ACCOUNT_LOCKOUT_THRESHOLD = 10  # Number of failures before account lockout
ACCOUNT_LOCKOUT_DURATION_MINUTES = 30  # Duration of lockout

# Data retention settings
AUDIT_EVENT_RETENTION_DAYS = 730  # 2 years (HIPAA requirement)
AUDIT_EXPORT_RETENTION_DAYS = 90  # 3 months

# Business hours for after-hours detection
BUSINESS_HOURS_START = 8  # 8:00 AM
BUSINESS_HOURS_END = 18   # 6:00 PM
WEEKEND_DAYS = [5, 6]     # Saturday (5) and Sunday (6)

# VIP patient settings
VIP_PATIENT_IDS = []  # List of patient IDs requiring special monitoring

# Compliance officer emails for automated reports
COMPLIANCE_OFFICER_EMAILS = []  # List of email addresses for compliance notifications

# Email notification settings
AUDIT_EMAIL_NOTIFICATIONS = True
SECURITY_ALERT_EMAILS = []  # List of email addresses for security alerts

# Authentication requirements
AUTH_PASSWORD_EXPIRY_DAYS = 90  # Password expires after 90 days
AUTH_2FA_REQUIRED_ROLES = ['admin', 'provider', 'compliance']  # Roles requiring 2FA

# API throttling settings for security
REST_FRAMEWORK = {
    # Existing settings...
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/day',
        'user': '1000/day',
        'audit_api': '100/hour',  # Specific throttle for audit API
        'auth': '20/hour',        # Authentication endpoints
    },
}

# Automated task scheduling
CELERYBEAT_SCHEDULE = {
    'monitor-suspicious-access': {
        'task': 'audit.tasks.monitor_suspicious_access_patterns',
        'schedule': timedelta(hours=8),  # Run 3 times per day
    },
    'weekly-compliance-report': {
        'task': 'audit.tasks.generate_weekly_compliance_report',
        'schedule': crontab(day_of_week=1, hour=1, minute=0),  # Monday at 1:00 AM
    },
    'check-expired-reports': {
        'task': 'audit.tasks.check_expired_compliance_reports',
        'schedule': crontab(day_of_week=1, hour=2, minute=0),  # Monday at 2:00 AM
    },
    'cleanup-old-audit-exports': {
        'task': 'audit.tasks.cleanup_old_audit_exports',
        'schedule': crontab(day_of_week=0, hour=3, minute=0),  # Sunday at 3:00 AM
    },
    'cleanup-old-audit-events': {
        'task': 'audit.tasks.cleanup_old_audit_events',
        'schedule': crontab(day=1, hour=4, minute=0),  # 1st of month at 4:00 AM
    },
}

# Define roles with permission to access PHI
PHI_ACCESS_ROLES = ['admin', 'provider', 'compliance', 'caregiver']

# Minimum necessary access thresholds
MINIMUM_NECESSARY_THRESHOLDS = {
    'patient_count_warning': 20,      # Alert when provider accesses >20 patients in a day
    'record_count_warning': 100,      # Alert when user accesses >100 records in a day
    'rapid_access_threshold': 30,     # Alert when user accesses >30 records in an hour
    'records_per_minute_max': 5,      # Alert when user accesses >5 records per minute
}

# Sensitive resources requiring approval for modifications
SENSITIVE_RESOURCES = [
    'medical_record',
    'medication_schedule',
    'genetic_data',
    'mental_health',
]

# Integration settings for audit health check
AUDIT_HEALTH_CHECK_ENABLED = True
AUDIT_HEALTH_CHECK_INTERVAL_HOURS = 24
