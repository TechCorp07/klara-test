import logging
from datetime import datetime, timedelta
from django.utils import timezone
from django.conf import settings
from django.db.models import Count, Q
from django.core.mail import send_mail
from django.template.loader import render_to_string
from ..models import SecurityAuditLog

logger = logging.getLogger(__name__)


class SecurityAlertService:
    """Service for security alert management and notifications."""
    
    @staticmethod
    def create_security_alert(event_type, description, severity, user=None, 
                              ip_address=None, user_agent=None, additional_data=None):
        """
        Create a new security alert.
        
        Args:
            event_type: Type of security event
            description: Description of the security event
            severity: Severity level of the event
            user: User involved in the event (if any)
            ip_address: IP address related to the event
            user_agent: User agent related to the event
            additional_data: Additional data related to the event
            
        Returns:
            SecurityAuditLog: The created security alert
        """
        if additional_data is None:
            additional_data = {}
            
        alert = SecurityAuditLog.objects.create(
            user=user,
            event_type=event_type,
            description=description,
            severity=severity,
            ip_address=ip_address,
            user_agent=user_agent,
            additional_data=additional_data
        )
        
        # Send notifications for high severity alerts
        if severity in [SecurityAuditLog.Severity.HIGH, SecurityAuditLog.Severity.CRITICAL]:
            SecurityAlertService.send_alert_notification(alert)
            
        return alert
    
    @staticmethod
    def resolve_alert(alert_id, user, notes=''):
        """
        Resolve a security alert.
        
        Args:
            alert_id: ID of the alert to resolve
            user: User resolving the alert
            notes: Resolution notes
            
        Returns:
            SecurityAuditLog: The updated alert or None if not found
        """
        try:
            alert = SecurityAuditLog.objects.get(id=alert_id)
            alert.resolve(user, notes)
            return alert
        except SecurityAuditLog.DoesNotExist:
            logger.error(f"Security alert with ID {alert_id} not found")
            return None
    
    @staticmethod
    def send_alert_notification(alert):
        """
        Send notifications for a security alert.
        
        Args:
            alert: The SecurityAuditLog object
        """
        if not getattr(settings, 'SECURITY_ALERT_EMAILS', None):
            logger.warning("No security alert email recipients configured")
            return
            
        subject = f"SECURITY ALERT: {alert.get_severity_display()} - {alert.get_event_type_display()}"
        
        context = {
            'alert': alert,
            'app_name': getattr(settings, 'APP_NAME', 'Klararety'),
            'dashboard_url': getattr(settings, 'SECURITY_DASHBOARD_URL', ''),
            'timestamp': alert.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
            'severity': alert.get_severity_display(),
            'event_type': alert.get_event_type_display(),
            'user': alert.user.username if alert.user else 'Anonymous',
            'description': alert.description,
            'ip_address': alert.ip_address or 'Unknown'
        }
        
        # Render email content from template
        try:
            from django.template.loader import render_to_string
            html_message = render_to_string('audit/email/security_alert.html', context)
            text_message = render_to_string('audit/email/security_alert.txt', context)
        except Exception as e:
            logger.error(f"Error rendering security alert email template: {str(e)}")
            # Fallback to plain message
            text_message = f"""
            Security Alert: {alert.get_severity_display()} - {alert.get_event_type_display()}
            
            Time: {alert.timestamp.strftime('%Y-%m-%d %H:%M:%S')}
            User: {alert.user.username if alert.user else 'Anonymous'}
            IP Address: {alert.ip_address or 'Unknown'}
            
            Description: {alert.description}
            
            Please check the security dashboard for more details.
            """
            html_message = text_message.replace('\n', '<br>')
        
        try:
            send_mail(
                subject=subject,
                message=text_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=settings.SECURITY_ALERT_EMAILS,
                html_message=html_message
            )
            logger.info(f"Security alert notification sent: {subject}")
        except Exception as e:
            logger.error(f"Failed to send security alert email: {str(e)}")
    
    @staticmethod
    def detect_suspicious_activity():
        """
        Detect suspicious activity patterns and create alerts.
        
        This method analyzes audit logs and PHI access patterns to detect
        potentially suspicious activities.
        
        Returns:
            list: List of created security alerts
        """
        alerts_created = []
        
        # Detect suspicious activities
        alerts_created.extend(SecurityAlertService._detect_multiple_failed_logins())
        alerts_created.extend(SecurityAlertService._detect_unusual_phi_access())
        alerts_created.extend(SecurityAlertService._detect_after_hours_access())
        alerts_created.extend(SecurityAlertService._detect_unusual_ip_addresses())
        
        return alerts_created
    
    @staticmethod
    def _detect_multiple_failed_logins():
        """Detect multiple failed login attempts."""
        from ..models import AuditEvent
        
        threshold = getattr(settings, 'FAILED_LOGIN_THRESHOLD', 5)
        time_window = getattr(settings, 'FAILED_LOGIN_WINDOW_MINUTES', 15)
        
        # Get timestamp for window start
        window_start = timezone.now() - timedelta(minutes=time_window)
        
        # Find users with multiple failed logins
        failed_logins = (
            AuditEvent.objects
            .filter(
                timestamp__gte=window_start,
                event_type=AuditEvent.EventType.LOGIN,
                description__contains="failed"
            )
            .values('user__username', 'ip_address')
            .annotate(count=Count('id'))
            .filter(count__gte=threshold)
        )
        
        alerts = []
        for login in failed_logins:
            username = login['user__username'] or 'Unknown'
            ip_address = login['ip_address']
            count = login['count']
            
            # Create security alert
            alert = SecurityAlertService.create_security_alert(
                event_type=SecurityAuditLog.EventType.BRUTE_FORCE_ATTEMPT,
                description=f"Multiple failed login attempts ({count}) for user {username}",
                severity=SecurityAuditLog.Severity.HIGH,
                ip_address=ip_address,
                additional_data={
                    'username': username,
                    'attempt_count': count,
                    'time_window_minutes': time_window
                }
            )
            alerts.append(alert)
            
        return alerts
    
    @staticmethod
    def _detect_unusual_phi_access():
        """Detect unusual patterns of PHI access."""
        from ..models import PHIAccessLog
        
        # Detect patterns like:
        # - Accessing many patient records in a short time
        # - Accessing patient records outside normal role patterns
        # - Accessing records without proper reason documentation
        
        alerts = []
        # Implementation would go here
        return alerts
    
    @staticmethod
    def _detect_after_hours_access():
        """Detect after-hours system access."""
        from ..models import AuditEvent
        
        # Detect access to sensitive resources outside of normal business hours
        
        alerts = []
        # Implementation would go here
        return alerts
    
    @staticmethod
    def _detect_unusual_ip_addresses():
        """Detect access from unusual IP addresses."""
        from ..models import AuditEvent
        
        # Detect access from IP addresses not previously associated with users
        
        alerts = []
        # Implementation would go here
        return alerts
