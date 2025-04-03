from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from django.apps import apps
from django.utils import timezone

# Import all profile models
from .models import (
    PatientProfile, ProviderProfile, PharmcoProfile,
    CaregiverProfile, ResearcherProfile, ComplianceProfile
)

User = apps.get_model('users', 'User')

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Create the appropriate profile when a user is created."""
    if not created:
        return

    role = getattr(instance, 'role', None)

    # Create profile based on user role
    if role == 'patient' and not hasattr(instance, 'patient_profile'):
        PatientProfile.objects.create(user=instance)
    
    elif role == 'provider' and not hasattr(instance, 'provider_profile'):
        ProviderProfile.objects.create(user=instance)
    
    elif role == 'pharmco' and not hasattr(instance, 'pharmco_profile'):
        PharmcoProfile.objects.create(user=instance)
    
    elif role == 'caregiver' and not hasattr(instance, 'caregiver_profile'):
        CaregiverProfile.objects.create(user=instance)
    
    elif role == 'researcher' and not hasattr(instance, 'researcher_profile'):
        ResearcherProfile.objects.create(user=instance)
        
    elif role == 'compliance' and not hasattr(instance, 'compliance_profile'):
        ComplianceProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """Save the appropriate profile when a user is updated."""
    role = getattr(instance, 'role', None)
    
    if role == 'patient' and hasattr(instance, 'patient_profile'):
        instance.patient_profile.save()
    
    elif role == 'provider' and hasattr(instance, 'provider_profile'):
        instance.provider_profile.save()
    
    elif role == 'pharmco' and hasattr(instance, 'pharmco_profile'):
        instance.pharmco_profile.save()
    
    elif role == 'caregiver' and hasattr(instance, 'caregiver_profile'):
        instance.caregiver_profile.save()
    
    elif role == 'researcher' and hasattr(instance, 'researcher_profile'):
        instance.researcher_profile.save()
        
    elif role == 'compliance' and hasattr(instance, 'compliance_profile'):
        instance.compliance_profile.save()

@receiver(post_save, sender=PatientProfile)
def track_consent_changes(sender, instance, **kwargs):
    """Track consent changes for patients."""
    # Update user consent flags if they've changed in the profile
    user = instance.user
    
    # Update medication adherence consent
    if user.medication_adherence_monitoring_consent != instance.medication_adherence_opt_in:
        user.medication_adherence_monitoring_consent = instance.medication_adherence_opt_in
        user.save(update_fields=['medication_adherence_monitoring_consent'])
        
        # Log the consent change
        from .models import ConsentLog
        ConsentLog.objects.create(
            user=user,
            consent_type='MEDICATION_ADHERENCE',
            consented=instance.medication_adherence_opt_in
        )
    
    # Update vitals monitoring consent
    if user.vitals_monitoring_consent != instance.vitals_monitoring_opt_in:
        user.vitals_monitoring_consent = instance.vitals_monitoring_opt_in
        user.save(update_fields=['vitals_monitoring_consent'])
        
        # Log the consent change
        from .models import ConsentLog
        ConsentLog.objects.create(
            user=user,
            consent_type='VITALS_MONITORING',
            consented=instance.vitals_monitoring_opt_in
        )
