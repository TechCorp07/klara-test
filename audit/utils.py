import logging
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)

def log_phi_access(user, patient, access_type, reason, record_type, record_id, 
                   additional_data=None, ip_address=None, user_agent=None):
    """
    Centralized function to log PHI access and create associated audit event.
    
    Args:
        user: User accessing the PHI
        patient: Patient whose PHI is being accessed
        access_type: Type of access (PHIAccessLog.AccessType)
        reason: Reason for accessing the PHI
        record_type: Type of record being accessed
        record_id: ID of the record being accessed
        additional_data: Additional data to log
        ip_address: IP address of the user
        user_agent: User agent of the client
        
    Returns:
        PHIAccessLog: The created access log
    """
    from .models import PHIAccessLog, AuditEvent
    
    # Default values
    if additional_data is None:
        additional_data = {}
        
    # Ensure we have a valid reason
    if not reason:
        reason = "No reason provided"
        
    # Map PHIAccessLog.AccessType to AuditEvent.EventType
    access_to_event_type = {
        PHIAccessLog.AccessType.VIEW: AuditEvent.EventType.READ,
        PHIAccessLog.AccessType.MODIFY: AuditEvent.EventType.UPDATE,
        PHIAccessLog.AccessType.EXPORT: AuditEvent.EventType.EXPORT,
        PHIAccessLog.AccessType.SHARE: AuditEvent.EventType.SHARE,
        PHIAccessLog.AccessType.PRINT: AuditEvent.EventType.ACCESS,
    }
    
    # Determine event type for audit event
    event_type = access_to_event_type.get(access_type, AuditEvent.EventType.ACCESS)
    
    # Create PHI access log
    access_log = PHIAccessLog.objects.create(
        user=user,
        patient=patient,
        access_type=access_type,
        reason=reason,
        record_type=record_type,
        record_id=str(record_id),
        ip_address=ip_address,
        user_agent=user_agent,
        additional_data=additional_data
    )
    
    # Create audit event
    patient_desc = patient.username if patient else "Unknown patient"
    AuditEvent.objects.create(
        user=user,
        event_type=event_type,
        resource_type=record_type,
        resource_id=str(record_id),
        description=f"{access_type} access to {record_type} for {patient_desc}",
        ip_address=ip_address,
        user_agent=user_agent
    )
    
    return access_log

def get_patient(patient_id):
    """
    Get a patient User object by ID with proper error handling.
    
    Args:
        patient_id: ID of the patient
        
    Returns:
        User: Patient user or None if not found
    """
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    try:
        return User.objects.get(id=patient_id)
    except (User.DoesNotExist, ValueError):
        logger.warning(f"Patient with ID {patient_id} not found")
        return None

def get_setting(name, default=None):
    """Get a setting with a default value if not found."""
    return getattr(settings, name, default)

def anonymize_ip(ip_address):
    """
    Anonymize an IP address by removing the last octet or part.
    
    Args:
        ip_address: IP address to anonymize
        
    Returns:
        str: Anonymized IP address
    """
    if not ip_address:
        return None
        
    # Check if IPv4 or IPv6
    if ':' in ip_address:
        # IPv6 - remove last 64 bits
        return ip_address.rsplit(':', 4)[0] + ':0:0:0:0'
    else:
        # IPv4 - remove last octet
        return ip_address.rsplit('.', 1)[0] + '.0'

def sanitize_request_data(request_data):
    """
    Sanitize sensitive data from request.
    
    Args:
        request_data: Dictionary of request data
        
    Returns:
        dict: Sanitized data with sensitive fields masked
    """
    if not request_data:
        return {}
        
    sanitized = {}
    
    # Copy and sanitize data
    for key, value in request_data.items():
        # Skip sensitive fields
        if key.lower() in ['password', 'token', 'authorization', 'credit_card', 'ssn', 'social_security']:
            sanitized[key] = '********'
        else:
            sanitized[key] = value
            
    return sanitized
