import logging
from datetime import datetime, timedelta
from django.utils import timezone
from django.db.models import Count, Q
from django.conf import settings
from django.core.mail import send_mail
from celery import shared_task
from django.contrib.auth import get_user_model

from .models import SecurityAuditLog, PHIAccessLog, AuditEvent, ComplianceReport

logger = logging.getLogger(__name__)
User = get_user_model()

@shared_task
def monitor_suspicious_access_patterns():
    """
    Task to monitor for suspicious access patterns and generate security alerts.
    
    This task runs regular checks for unusual access patterns that might
    indicate security concerns such as unauthorized access or data snooping.
    """
    logger.info("Starting suspicious access pattern check")
    
    try:
        now = timezone.now()
        # Set time window (last 24 hours)
        window_start = now - timedelta(hours=24)
        
        # 1. Check for after hours access (if outside configured business hours)
        business_hours_start = getattr(settings, 'BUSINESS_HOURS_START', 8)  # 8 AM default
        business_hours_end = getattr(settings, 'BUSINESS_HOURS_END', 18)     # 6 PM default
        weekend_days = getattr(settings, 'WEEKEND_DAYS', [5, 6])             # Saturday, Sunday (0 = Monday in Django)
        
        # Get all access events in last 24 hours
        recent_access = PHIAccessLog.objects.filter(timestamp__gte=window_start)
        
        after_hours_access = []
        for access in recent_access:
            access_time = access.timestamp
            is_weekend = access_time.weekday() in weekend_days
            is_after_hours = access_time.hour < business_hours_start or access_time.hour >= business_hours_end
            
            # Check if this is an after-hours access
            if (is_weekend or is_after_hours) and access.user and access.user.role != 'patient':
                after_hours_access.append(access)
        
        # Log security events for after hours access by non-patients
        for access in after_hours_access:
            SecurityAuditLog.objects.create(
                user=access.user,
                event_type=SecurityAuditLog.EventType.UNUSUAL_ACTIVITY,
                description=f"After-hours PHI access: {access.user.username} accessed {access.record_type} at {access.timestamp.strftime('%Y-%m-%d %H:%M')}",
                severity=SecurityAuditLog.Severity.LOW,
                additional_data={
                    'phi_access_id': str(access.id),
                    'record_type': access.record_type, 
                    'record_id': access.record_id,
                    'is_weekend': access.timestamp.weekday() in weekend_days,
                    'hour': access.timestamp.hour
                }
            )
        
        # 2. Check for high-volume access (users accessing too many patient records)
        from django.db.models import Count
        user_access_counts = PHIAccessLog.objects.filter(
            timestamp__gte=window_start
        ).values('user').annotate(
            patient_count=Count('patient', distinct=True)
        ).filter(
            patient_count__gt=20  # Threshold: accessing more than 20 different patients
        )
        
        # Log security events for users accessing unusually high numbers of patient records
        for item in user_access_counts:
            if not item['user']:
                continue  # Skip for anonymous access
                
            user = User.objects.get(id=item['user'])
            # Skip for roles that typically access many patients
            if user.role in ['admin', 'compliance']:
                continue
                
            SecurityAuditLog.objects.create(
                user=user,
                event_type=SecurityAuditLog.EventType.UNUSUAL_ACTIVITY,
                description=f"High-volume patient access: {user.username} accessed {item['patient_count']} different patients in 24 hours",
                severity=SecurityAuditLog.Severity.MEDIUM,
                additional_data={
                    'patient_count': item['patient_count'],
                    'threshold': 20,
                    'time_window': '24 hours'
                }
            )
        
        # 3. Check for users accessing patient records they don't typically access
        # This requires more context about typical user patterns
        from healthcare.models import MedicalRecord
        
        # Focus on provider role
        providers = User.objects.filter(role='provider')
        
        for provider in providers:
            # Get provider's normal patients
            provider_patients = set()
            for record in MedicalRecord.objects.filter(primary_physician=provider):
                provider_patients.add(record.patient_id)
            
            # Get recent PHI accesses
            recent_provider_access = PHIAccessLog.objects.filter(
                user=provider,
                timestamp__gte=window_start
            )
            
            # Check for access to patients outside normal caseload
            unusual_patient_access = []
            for access in recent_provider_access:
                if access.patient_id and access.patient_id not in provider_patients:
                    unusual_patient_access.append(access)
            
            # If there are more than 3 unusual patient accesses, flag it
            if len(unusual_patient_access) > 3:
                SecurityAuditLog.objects.create(
                    user=provider,
                    event_type=SecurityAuditLog.EventType.UNUSUAL_ACTIVITY,
                    description=f"Provider accessed {len(unusual_patient_access)} patients outside regular caseload",
                    severity=SecurityAuditLog.Severity.MEDIUM,
                    additional_data={
                        'unusual_access_count': len(unusual_patient_access),
                        'regular_patients': len(provider_patients),
                        'time_window': '24 hours'
                    }
                )
        
        # 4. Monitor for VIP record accesses
        from healthcare.models import MedicalRecord
        
        # Get VIP patient list if configured
        vip_patients = getattr(settings, 'VIP_PATIENT_IDS', [])
        for vip_id in vip_patients:
            try:
                # Check if any VIP medical records were accessed
                vip_access = PHIAccessLog.objects.filter(
                    timestamp__gte=window_start,
                    patient_id=vip_id
                )
                
                # Log each VIP access as high priority
                for access in vip_access:
                    SecurityAuditLog.objects.create(
                        user=access.user,
                        event_type=SecurityAuditLog.EventType.UNUSUAL_ACTIVITY,
                        description=f"VIP patient record accessed by {access.user.username}",
                        severity=SecurityAuditLog.Severity.HIGH,
                        additional_data={
                            'phi_access_id': str(access.id),
                            'record_type': access.record_type,
                            'record_id': access.record_id,
                            'vip_patient_id': vip_id
                        }
                    )
            except Exception as e:
                logger.error(f"Error processing VIP access for patient {vip_id}: {str(e)}")
        
        logger.info("Suspicious access pattern check completed successfully")
        return "Monitoring completed successfully"
        
    except Exception as e:
        logger.error(f"Error in suspicious access pattern check: {str(e)}")
        return f"Error in monitoring: {str(e)}"


@shared_task
def generate_weekly_compliance_report():
    """
    Task to generate weekly HIPAA compliance report.
    
    This task generates a comprehensive weekly report on HIPAA compliance
    metrics and sends it to compliance officers.
    """
    logger.info("Starting weekly compliance report generation")
    
    try:
        now = timezone.now()
        report_date = now.date()
        
        # Define time window
        end_date = report_date
        start_date = end_date - timedelta(days=7)
        
        # Generate report record
        report = ComplianceReport.objects.create(
            report_type=ComplianceReport.ReportType.WEEKLY_AUDIT,
            report_date=report_date,
            status=ComplianceReport.Status.PROCESSING,
            parameters={
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat(),
                'report_name': f"Weekly HIPAA Compliance Report {start_date.isoformat()} to {end_date.isoformat()}"
            }
        )
        
        # Convert to datetime for database queries
        start_datetime = datetime.combine(start_date, datetime.min.time())
        end_datetime = datetime.combine(end_date, datetime.max.time())
        
        # Get statistics for report period
        phi_access_count = PHIAccessLog.objects.filter(
            timestamp__gte=start_datetime,
            timestamp__lte=end_datetime
        ).count()
        
        security_events_count = SecurityAuditLog.objects.filter(
            timestamp__gte=start_datetime,
            timestamp__lte=end_datetime
        ).count()
        
        audit_events_count = AuditEvent.objects.filter(
            timestamp__gte=start_datetime,
            timestamp__lte=end_datetime
        ).count()
        
        # PHI access without reason
        no_reason_count = PHIAccessLog.objects.filter(
            timestamp__gte=start_datetime,
            timestamp__lte=end_datetime,
            Q(reason='') | Q(reason='No reason provided')
        ).count()
        
        # High severity security events
        high_severity_count = SecurityAuditLog.objects.filter(
            timestamp__gte=start_datetime,
            timestamp__lte=end_datetime,
            severity__in=[SecurityAuditLog.Severity.HIGH, SecurityAuditLog.Severity.CRITICAL]
        ).count()
        
        # Break down events by type
        security_by_type = {}
        for event_type, _ in SecurityAuditLog.EventType.choices:
            count = SecurityAuditLog.objects.filter(
                timestamp__gte=start_datetime,
                timestamp__lte=end_datetime,
                event_type=event_type
            ).count()
            security_by_type[event_type] = count
            
        # Access by user role
        access_by_role = {}
        for role_choice in User._meta.get_field('role').choices:
            role = role_choice[0]
            count = PHIAccessLog.objects.filter(
                timestamp__gte=start_datetime,
                timestamp__lte=end_datetime,
                user__role=role
            ).count()
            access_by_role[role] = count
        
        # Generate summary information for report
        summary = {
            'period': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat()
            },
            'phi_access_count': phi_access_count,
            'security_events_count': security_events_count,
            'audit_events_count': audit_events_count,
            'missing_reason_count': no_reason_count,
            'missing_reason_percentage': (no_reason_count / phi_access_count * 100) if phi_access_count > 0 else 0,
            'high_severity_count': high_severity_count,
            'security_by_type': security_by_type,
            'access_by_role': access_by_role
        }
        
        # Generate CSV content
        import io
        import csv
        
        # Create CSV file in memory
        csv_buffer = io.StringIO()
        writer = csv.writer(csv_buffer)
        
        # Write header
        writer.writerow(['Weekly HIPAA Compliance Report'])
        writer.writerow([f"Period: {start_date.isoformat()} to {end_date.isoformat()}"])
        writer.writerow([])
        
        # Write summary statistics
        writer.writerow(['Summary Statistics'])
        writer.writerow(['Total PHI Access Events', phi_access_count])
        writer.writerow(['Total Security Events', security_events_count])
        writer.writerow(['Total Audit Events', audit_events_count])
        writer.writerow(['PHI Access without Reason', no_reason_count])
        writer.writerow(['High Severity Security Events', high_severity_count])
        writer.writerow([])
        
        # Write security events by type
        writer.writerow(['Security Events by Type'])
        for event_type, count in security_by_type.items():
            writer.writerow([event_type, count])
        writer.writerow([])
        
        # Write PHI access by role
        writer.writerow(['PHI Access by Role'])
        for role, count in access_by_role.items():
            writer.writerow([role, count])
        writer.writerow([])
        
        # Security events details
        writer.writerow(['Recent High Severity Security Events'])
        writer.writerow(['Timestamp', 'Event Type', 'Severity', 'User', 'Description'])
        
        high_severity_events = SecurityAuditLog.objects.filter(
            timestamp__gte=start_datetime,
            timestamp__lte=end_datetime,
            severity__in=[SecurityAuditLog.Severity.HIGH, SecurityAuditLog.Severity.CRITICAL]
        ).order_by('-timestamp')[:25]  # Limit to 25 most recent
        
        for event in high_severity_events:
            writer.writerow([
                event.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                event.get_event_type_display(),
                event.get_severity_display(),
                event.user.username if event.user else 'Anonymous',
                event.description
            ])
        
        # Save the CSV to storage and update the report
        from django.core.files.storage import default_storage
        from django.core.files.base import ContentFile
        
        # Save to storage
        filename = f"weekly_compliance_report_{start_date.isoformat()}_{end_date.isoformat()}.csv"
        file_path = f"compliance_reports/{filename}"
        
        default_storage.save(file_path, ContentFile(csv_buffer.getvalue().encode('utf-8')))
        
        # Set the file URL
        if hasattr(settings, 'MEDIA_URL'):
            file_url = f"{settings.MEDIA_URL}{file_path}"
        else:
            file_url = file_path
            
        # Update report with results
        report.file_url = file_url
        report.status = ComplianceReport.Status.COMPLETED
        report.notes = f"Weekly compliance report for {start_date.isoformat()} to {end_date.isoformat()}"
        report.save()
        
        # Send email notification to compliance officers
        compliance_emails = getattr(settings, 'COMPLIANCE_OFFICER_EMAILS', [])
        if compliance_emails:
            try:
                # Format HTML email with report highlights
                html_message = f"""
                <html>
                <head>
                    <style>
                        body {{ font-family: Arial, sans-serif; }}
                        .header {{ background-color: #4a86e8; color: white; padding: 10px; }}
                        .content {{ padding: 15px; }}
                        .stat {{ font-weight: bold; }}
                        .warning {{ color: #ff0000; }}
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h2>Weekly HIPAA Compliance Report</h2>
                        <p>{start_date.isoformat()} to {end_date.isoformat()}</p>
                    </div>
                    <div class="content">
                        <p>The weekly HIPAA compliance report has been generated and is now available for review.</p>
                        
                        <h3>Summary Statistics:</h3>
                        <ul>
                            <li>Total PHI Access Events: <span class="stat">{phi_access_count}</span></li>
                            <li>Total Security Events: <span class="stat">{security_events_count}</span></li>
                            <li>PHI Access without Reason: <span class="stat">{no_reason_count} ({summary['missing_reason_percentage']:.1f}%)</span></li>
                            <li>High Severity Security Events: <span class="stat {('warning' if high_severity_count > 0 else '')}">{high_severity_count}</span></li>
                        </ul>
                        
                        <p>
                            <a href="{file_url}">Download Full Report</a>
                        </p>
                    </div>
                </body>
                </html>
                """
                
                text_message = f"""
                Weekly HIPAA Compliance Report
                Period: {start_date.isoformat()} to {end_date.isoformat()}
                
                The weekly HIPAA compliance report has been generated and is now available for review.
                
                Summary Statistics:
                - Total PHI Access Events: {phi_access_count}
                - Total Security Events: {security_events_count}
                - PHI Access without Reason: {no_reason_count} ({summary['missing_reason_percentage']:.1f}%)
                - High Severity Security Events: {high_severity_count}
                
                Download the full report at: {file_url}
                """
                
                send_mail(
                    subject=f"Weekly HIPAA Compliance Report {end_date.isoformat()}",
                    message=text_message,
                    from_email=settings.EMAIL_HOST_USER,
                    recipient_list=compliance_emails,
                    html_message=html_message,
                    fail_silently=True
                )
            except Exception as e:
                logger.error(f"Error sending compliance report email: {str(e)}")
        
        logger.info(f"Weekly compliance report generated successfully")
        return "Report generated successfully"
        
    except Exception as e:
        logger.error(f"Error generating weekly compliance report: {str(e)}")
        
        # Try to update report status if it was created
        if 'report' in locals():
            report.status = ComplianceReport.Status.FAILED
            report.notes = f"Error generating report: {str(e)}"
            report.save()
            
        return f"Error generating report: {str(e)}"


@shared_task
def check_expired_compliance_reports():
    """
    Task to identify reports that are due for renewal.
    
    This task finds compliance reports that need to be renewed
    according to regulatory requirements and sends notifications.
    """
    logger.info("Starting compliance report expiration check")
    
    try:
        now = timezone.now()
        
        # Calculate expiration thresholds - reports older than regulatory requirements
        # HIPAA typically requires annual assessments
        annual_threshold = now.date() - timedelta(days=365)
        
        # Find reports that need renewal
        expired_reports = ComplianceReport.objects.filter(
            report_date__lt=annual_threshold,
            report_type__in=[
                ComplianceReport.ReportType.SECURITY_INCIDENTS,
                ComplianceReport.ReportType.SYSTEM_ACCESS,
                ComplianceReport.ReportType.USER_ACTIVITY
            ]
        )
        
        # Group by report type
        expired_by_type = {}
        for report in expired_reports:
            if report.report_type not in expired_by_type:
                expired_by_type[report.report_type] = []
            expired_by_type[report.report_type].append(report)
        
        # Send notification email
        compliance_emails = getattr(settings, 'COMPLIANCE_OFFICER_EMAILS', [])
        if compliance_emails and expired_reports.exists():
            try:
                message = "The following compliance reports are due for renewal:\n\n"
                
                for report_type, reports in expired_by_type.items():
                    report_type_display = dict(ComplianceReport.ReportType.choices).get(report_type, report_type)
                    message += f"\n{report_type_display} Reports:\n"
                    
                    for report in reports:
                        message += f"- Report from {report.report_date.isoformat()}, expired by {(now.date() - report.report_date).days} days\n"
                
                send_mail(
                    subject="HIPAA Compliance Reports Due for Renewal",
                    message=message,
                    from_email=settings.EMAIL_HOST_USER,
                    recipient_list=compliance_emails,
                    fail_silently=True
                )
            except Exception as e:
                logger.error(f"Error sending report expiration email: {str(e)}")
        
        return f"Found {expired_reports.count()} reports due for renewal"
        
    except Exception as e:
        logger.error(f"Error checking for expired compliance reports: {str(e)}")
        return f"Error checking expired reports: {str(e)}"
