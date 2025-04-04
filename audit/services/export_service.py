import csv
import io
import json
import logging
from datetime import datetime, timedelta
from django.utils import timezone
from django.db.models import Q
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings
from ..models import (
    AuditEvent, PHIAccessLog, SecurityAuditLog, 
    ComplianceReport, AuditExport
)

logger = logging.getLogger(__name__)


class ExportService:
    """Service for generating and managing data exports."""
    
    @staticmethod
    def generate_audit_export(export, filters=None):
        """
        Generate an audit export based on filters.
        
        Args:
            export: AuditExport object
            filters: Dictionary of filters to apply
            
        Returns:
            str: File URL if successful, None otherwise
        """
        try:
            # Update status to processing
            export.status = AuditExport.Status.PROCESSING
            export.save(update_fields=['status'])
            
            # Use filters from export object if not provided
            if filters is None:
                filters = export.filters
            
            # Build the queryset with filters
            queryset = AuditEvent.objects.all().order_by('-timestamp')
            
            # Apply filters
            queryset = ExportService._apply_audit_filters(queryset, filters)
            
            # Generate CSV in memory
            csv_buffer = io.StringIO()
            writer = csv.writer(csv_buffer)
            
            # Write header
            writer.writerow([
                'ID', 'Timestamp', 'User', 'Event Type', 'Resource Type', 
                'Resource ID', 'Description', 'IP Address', 'User Agent'
            ])
            
            # Write data rows
            for event in queryset:
                writer.writerow([
                    str(event.id),
                    event.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                    event.user.username if event.user else 'Anonymous',
                    event.get_event_type_display(),
                    event.resource_type,
                    event.resource_id,
                    event.description,
                    event.ip_address,
                    event.user_agent
                ])
            
            # Save the file to storage
            filename = f"audit_export_{export.user.username}_{timezone.now().strftime('%Y%m%d_%H%M%S')}.csv"
            file_path = f"audit_exports/{filename}"
            
            # Save to storage
            default_storage.save(file_path, ContentFile(csv_buffer.getvalue().encode('utf-8')))
            
            # Set the file URL
            if hasattr(settings, 'MEDIA_URL'):
                file_url = f"{settings.MEDIA_URL}{file_path}"
            else:
                file_url = file_path
                
            # Update export status
            export.status = AuditExport.Status.COMPLETED
            export.file_url = file_url
            export.completed_at = timezone.now()
            export.save(update_fields=['status', 'file_url', 'completed_at'])
            
            return file_url
            
        except Exception as e:
            logger.error(f"Error generating audit export: {str(e)}")
            
            # Update export with error status
            export.status = AuditExport.Status.FAILED
            export.error_message = str(e)
            export.save(update_fields=['status', 'error_message'])
            
            return None
    
    @staticmethod
    def generate_phi_access_export(export, filters=None):
        """
        Generate a PHI access logs export based on filters.
        
        Args:
            export: AuditExport object
            filters: Dictionary of filters to apply
            
        Returns:
            str: File URL if successful, None otherwise
        """
        try:
            # Update status to processing
            export.status = AuditExport.Status.PROCESSING
            export.save(update_fields=['status'])
            
            # Use filters from export object if not provided
            if filters is None:
                filters = export.filters
            
            # Build the queryset with filters
            queryset = PHIAccessLog.objects.all().order_by('-timestamp')
            
            # Apply filters
            queryset = ExportService._apply_phi_access_filters(queryset, filters)
            
            # Generate CSV in memory
            csv_buffer = io.StringIO()
            writer = csv.writer(csv_buffer)
            
            # Write header
            writer.writerow([
                'ID', 'Timestamp', 'User', 'Patient', 'Access Type', 
                'Reason', 'Record Type', 'Record ID', 'IP Address'
            ])
            
            # Write data rows
            for log in queryset:
                writer.writerow([
                    str(log.id),
                    log.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                    log.user.username if log.user else 'Anonymous',
                    log.patient.username if log.patient else 'Unknown',
                    log.get_access_type_display(),
                    log.reason,
                    log.record_type,
                    log.record_id,
                    log.ip_address
                ])
            
            # Save the file to storage
            filename = f"phi_access_export_{export.user.username}_{timezone.now().strftime('%Y%m%d_%H%M%S')}.csv"
            file_path = f"audit_exports/{filename}"
            
            # Save to storage
            default_storage.save(file_path, ContentFile(csv_buffer.getvalue().encode('utf-8')))
            
            # Set the file URL
            if hasattr(settings, 'MEDIA_URL'):
                file_url = f"{settings.MEDIA_URL}{file_path}"
            else:
                file_url = file_path
                
            # Update export status
            export.status = AuditExport.Status.COMPLETED
            export.file_url = file_url
            export.completed_at = timezone.now()
            export.save(update_fields=['status', 'file_url', 'completed_at'])
            
            return file_url
            
        except Exception as e:
            logger.error(f"Error generating PHI access export: {str(e)}")
            
            # Update export with error status
            export.status = AuditExport.Status.FAILED
            export.error_message = str(e)
            export.save(update_fields=['status', 'error_message'])
            
            return None
    
    @staticmethod
    def generate_security_audit_export(export, filters=None):
        """
        Generate a security audit logs export based on filters.
        
        Args:
            export: AuditExport object
            filters: Dictionary of filters to apply
            
        Returns:
            str: File URL if successful, None otherwise
        """
        try:
            # Update status to processing
            export.status = AuditExport.Status.PROCESSING
            export.save(update_fields=['status'])
            
            # Use filters from export object if not provided
            if filters is None:
                filters = export.filters
            
            # Build the queryset with filters
            queryset = SecurityAuditLog.objects.all().order_by('-timestamp')
            
            # Apply filters
            queryset = ExportService._apply_security_audit_filters(queryset, filters)
            
            # Generate CSV in memory
            csv_buffer = io.StringIO()
            writer = csv.writer(csv_buffer)
            
            # Write header
            writer.writerow([
                'ID', 'Timestamp', 'User', 'Event Type', 'Severity', 
                'Description', 'IP Address', 'Resolved', 'Resolved By', 
                'Resolved At', 'Resolution Notes'
            ])
            
            # Write data rows
            for log in queryset:
                writer.writerow([
                    str(log.id),
                    log.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                    log.user.username if log.user else 'Anonymous',
                    log.get_event_type_display(),
                    log.get_severity_display(),
                    log.description,
                    log.ip_address,
                    'Yes' if log.resolved else 'No',
                    log.resolved_by.username if log.resolved_by else '',
                    log.resolved_at.strftime('%Y-%m-%d %H:%M:%S') if log.resolved_at else '',
                    log.resolution_notes
                ])
            
            # Save the file to storage
            filename = f"security_audit_export_{export.user.username}_{timezone.now().strftime('%Y%m%d_%H%M%S')}.csv"
            file_path = f"audit_exports/{filename}"
            
            # Save to storage
            default_storage.save(file_path, ContentFile(csv_buffer.getvalue().encode('utf-8')))
            
            # Set the file URL
            if hasattr(settings, 'MEDIA_URL'):
                file_url = f"{settings.MEDIA_URL}{file_path}"
            else:
                file_url = file_path
                
            # Update export status
            export.status = AuditExport.Status.COMPLETED
            export.file_url = file_url
            export.completed_at = timezone.now()
            export.save(update_fields=['status', 'file_url', 'completed_at'])
            
            return file_url
            
        except Exception as e:
            logger.error(f"Error generating security audit export: {str(e)}")
            
            # Update export with error status
            export.status = AuditExport.Status.FAILED
            export.error_message = str(e)
            export.save(update_fields=['status', 'error_message'])
            
            return None
    
    @staticmethod
    def _apply_audit_filters(queryset, filters):
        """Apply filters to an audit queryset."""
        if 'user' in filters and filters['user']:
            queryset = queryset.filter(user__id=filters['user'])
        
        if 'event_type' in filters and filters['event_type']:
            queryset = queryset.filter(event_type=filters['event_type'])
        
        if 'resource_type' in filters and filters['resource_type']:
            queryset = queryset.filter(resource_type=filters['resource_type'])
        
        if 'start_date' in filters and filters['start_date']:
            try:
                start_date = datetime.fromisoformat(filters['start_date'].replace('Z', '+00:00'))
                queryset = queryset.filter(timestamp__gte=start_date)
            except (ValueError, TypeError):
                # Try alternative date format
                try:
                    start_date = datetime.strptime(filters['start_date'], '%Y-%m-%d')
                    queryset = queryset.filter(timestamp__gte=start_date)
                except (ValueError, TypeError):
                    logger.warning(f"Invalid start_date format: {filters['start_date']}")
        
        if 'end_date' in filters and filters['end_date']:
            try:
                end_date = datetime.fromisoformat(filters['end_date'].replace('Z', '+00:00'))
                end_date = end_date.replace(hour=23, minute=59, second=59)
                queryset = queryset.filter(timestamp__lte=end_date)
            except (ValueError, TypeError):
                # Try alternative date format
                try:
                    end_date = datetime.strptime(filters['end_date'], '%Y-%m-%d')
                    end_date = end_date.replace(hour=23, minute=59, second=59)
                    queryset = queryset.filter(timestamp__lte=end_date)
                except (ValueError, TypeError):
                    logger.warning(f"Invalid end_date format: {filters['end_date']}")
        
        if 'search' in filters and filters['search']:
            search = filters['search']
            queryset = queryset.filter(
                Q(description__icontains=search) |
                Q(resource_id__icontains=search) |
                Q(user__username__icontains=search) |
                Q(user__first_name__icontains=search) |
                Q(user__last_name__icontains=search)
            )
        
        if 'ip_address' in filters and filters['ip_address']:
            queryset = queryset.filter(ip_address=filters['ip_address'])
        
        if 'user_role' in filters and filters['user_role']:
            queryset = queryset.filter(user__role=filters['user_role'])
        
        return queryset
    
    @staticmethod
    def _apply_phi_access_filters(queryset, filters):
        """Apply filters to a PHI access logs queryset."""
        if 'user' in filters and filters['user']:
            queryset = queryset.filter(user__id=filters['user'])
        
        if 'patient' in filters and filters['patient']:
            queryset = queryset.filter(patient__id=filters['patient'])
        
        if 'access_type' in filters and filters['access_type']:
            queryset = queryset.filter(access_type=filters['access_type'])
        
        if 'record_type' in filters and filters['record_type']:
            queryset = queryset.filter(record_type=filters['record_type'])
        
        if 'start_date' in filters and filters['start_date']:
            try:
                start_date = datetime.fromisoformat(filters['start_date'].replace('Z', '+00:00'))
                queryset = queryset.filter(timestamp__gte=start_date)
            except (ValueError, TypeError):
                # Try alternative date format
                try:
                    start_date = datetime.strptime(filters['start_date'], '%Y-%m-%d')
                    queryset = queryset.filter(timestamp__gte=start_date)
                except (ValueError, TypeError):
                    logger.warning(f"Invalid start_date format: {filters['start_date']}")
        
        if 'end_date' in filters and filters['end_date']:
            try:
                end_date = datetime.fromisoformat(filters['end_date'].replace('Z', '+00:00'))
                end_date = end_date.replace(hour=23, minute=59, second=59)
                queryset = queryset.filter(timestamp__lte=end_date)
            except (ValueError, TypeError):
                # Try alternative date format
                try:
                    end_date = datetime.strptime(filters['end_date'], '%Y-%m-%d')
                    end_date = end_date.replace(hour=23, minute=59, second=59)
                    queryset = queryset.filter(timestamp__lte=end_date)
                except (ValueError, TypeError):
                    logger.warning(f"Invalid end_date format: {filters['end_date']}")
        
        if 'search' in filters and filters['search']:
            search = filters['search']
            queryset = queryset.filter(
                Q(reason__icontains=search) |
                Q(record_id__icontains=search) |
                Q(user__username__icontains=search) |
                Q(patient__username__icontains=search)
            )
        
        if 'missing_reason' in filters and filters.get('missing_reason') == 'true':
            queryset = queryset.filter(Q(reason='') | Q(reason='No reason provided'))
        
        if 'user_role' in filters and filters['user_role']:
            queryset = queryset.filter(user__role=filters['user_role'])
        
        if 'ip_address' in filters and filters['ip_address']:
            queryset = queryset.filter(ip_address=filters['ip_address'])
        
        return queryset
    
    @staticmethod
    def _apply_security_audit_filters(queryset, filters):
        """Apply filters to a security audit logs queryset."""
        if 'user' in filters and filters['user']:
            queryset = queryset.filter(user__id=filters['user'])
        
        if 'event_type' in filters and filters['event_type']:
            queryset = queryset.filter(event_type=filters['event_type'])
        
        if 'severity' in filters and filters['severity']:
            queryset = queryset.filter(severity=filters['severity'])
        
        if 'resolved' in filters:
            resolved = filters['resolved'].lower() == 'true'
            queryset = queryset.filter(resolved=resolved)
        
        if 'start_date' in filters and filters['start_date']:
            try:
                start_date = datetime.fromisoformat(filters['start_date'].replace('Z', '+00:00'))
                queryset = queryset.filter(timestamp__gte=start_date)
            except (ValueError, TypeError):
                # Try alternative date format
                try:
                    start_date = datetime.strptime(filters['start_date'], '%Y-%m-%d')
                    queryset = queryset.filter(timestamp__gte=start_date)
                except (ValueError, TypeError):
                    logger.warning(f"Invalid start_date format: {filters['start_date']}")
        
        if 'end_date' in filters and filters['end_date']:
            try:
                end_date = datetime.fromisoformat(filters['end_date'].replace('Z', '+00:00'))
                end_date = end_date.replace(hour=23, minute=59, second=59)
                queryset = queryset.filter(timestamp__lte=end_date)
            except (ValueError, TypeError):
                # Try alternative date format
                try:
                    end_date = datetime.strptime(filters['end_date'], '%Y-%m-%d')
                    end_date = end_date.replace(hour=23, minute=59, second=59)
                    queryset = queryset.filter(timestamp__lte=end_date)
                except (ValueError, TypeError):
                    logger.warning(f"Invalid end_date format: {filters['end_date']}")
        
        if 'search' in filters and filters['search']:
            search = filters['search']
            queryset = queryset.filter(
                Q(description__icontains=search) |
                Q(user__username__icontains=search) |
                Q(ip_address__icontains=search)
            )
        
        if 'ip_address' in filters and filters['ip_address']:
            queryset = queryset.filter(ip_address=filters['ip_address'])
        
        return queryset
