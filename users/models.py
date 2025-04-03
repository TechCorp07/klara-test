from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django_cryptography.fields import encrypt

class User(AbstractUser):
    """Custom user model for Klararety Health Platform."""
    
    class Role(models.TextChoices):
        PATIENT = 'patient', _('Patient')
        PROVIDER = 'provider', _('Healthcare Provider')
        PHARMCO = 'pharmco', _('Pharmacy')
        ADMIN = 'admin', _('Administrator')
        CAREGIVER = 'caregiver', _('Caregiver')
        RESEARCHER = 'researcher', _('Clinical Researcher')
        COMPLIANCE = 'compliance', _('Compliance Officer')
    
    email = models.EmailField(_('email address'), unique=True)
    phone_number = models.CharField(max_length=20, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.PATIENT,
    )
    two_factor_enabled = models.BooleanField(default=False)
    totp_secret = models.CharField(max_length=255, blank=True)
    profile_image = models.ImageField(upload_to='profile_images/', null=True, blank=True)
    terms_accepted = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    
    # Enhanced security fields
    login_attempts = models.IntegerField(default=0)
    account_locked = models.BooleanField(default=False)
    account_locked_time = models.DateTimeField(null=True, blank=True)
    password_last_changed = models.DateTimeField(null=True, blank=True)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    
    # Consent tracking
    data_sharing_consent = models.BooleanField(default=False)
    medication_adherence_monitoring_consent = models.BooleanField(default=False)
    vitals_monitoring_consent = models.BooleanField(default=False)
    research_consent = models.BooleanField(default=False)
    
    # Administrator approval
    is_approved = models.BooleanField(default=False)
    approved_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey(
        'self', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='approved_users'
    )

    @property
    def role_display(self):
        return self.get_role_display()
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
    
    def approve_user(self, approver):
        """Approve a user's account"""
        self.is_approved = True
        self.approved_at = timezone.now()
        self.approved_by = approver
        self.save(update_fields=['is_approved', 'approved_at', 'approved_by'])

    def lock_account(self):
        self.account_locked = True
        self.account_locked_time = timezone.now()
        self.save()

    def unlock_account(self):
        self.account_locked = False
        self.account_locked_time = None
        self.login_attempts = 0
        self.save()
    
    def increment_login_attempt(self):
        self.login_attempts += 1
        if self.login_attempts >= 5:  # Using 5 as default, this could be in settings
            self.lock_account()
        self.save()
    
    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'


class TwoFactorDevice(models.Model):
    """Model for storing two-factor authentication devices."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='two_factor_device')
    secret_key = models.CharField(max_length=255)
    confirmed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    last_used_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"2FA Device for {self.user.username}"


class PatientProfile(models.Model):
    """Profile for patients to track medication adherence and vitals."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='patient_profile')
    medical_id = encrypt(models.CharField(max_length=50, blank=True, null=True))
    emergency_contact_name = encrypt(models.CharField(max_length=255, blank=True, null=True))
    emergency_contact_phone = encrypt(models.CharField(max_length=20, blank=True, null=True))
    emergency_contact_relationship = models.CharField(max_length=50, blank=True, null=True)
    blood_type = encrypt(models.CharField(max_length=10, blank=True, null=True))
    allergies = encrypt(models.TextField(blank=True, null=True))
    
    # Condition/diagnosis fields
    primary_condition = encrypt(models.CharField(max_length=255, blank=True, null=True))
    condition_diagnosis_date = encrypt(models.DateField(null=True, blank=True))
    
    # Medication monitoring consent specifics
    medication_adherence_opt_in = models.BooleanField(default=False)
    medication_adherence_consent_date = models.DateTimeField(null=True, blank=True)
    
    # Vitals monitoring consent specifics
    vitals_monitoring_opt_in = models.BooleanField(default=False)
    vitals_monitoring_consent_date = models.DateTimeField(null=True, blank=True)
    
    # Authorized caregivers
    authorized_caregivers = models.ManyToManyField(
        User, 
        related_name='caregiver_patients',
        limit_choices_to={'role': User.Role.CAREGIVER},
        blank=True
    )
    
    def __str__(self):
        return f"Patient Profile: {self.user.username}"


class PatientCondition(models.Model):
    """Tracks specific conditions for a patient."""
    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name='conditions')
    
    # Condition details
    condition_name = encrypt(models.CharField(max_length=255))
    condition_code = encrypt(models.CharField(max_length=50, blank=True, null=True))  # ICD-10 or other coding
    diagnosis_date = encrypt(models.DateField(null=True, blank=True))
    diagnosing_provider = encrypt(models.CharField(max_length=255, blank=True, null=True))
    
    # Condition status
    is_primary = models.BooleanField(default=False)
    status = models.CharField(
        max_length=20,
        choices=[
            ('ACTIVE', 'Active'),
            ('REMISSION', 'In Remission'),
            ('RESOLVED', 'Resolved'),
            ('MONITORING', 'Monitoring')
        ],
        default='ACTIVE'
    )
    
    # Medications associated with this condition
    medications = encrypt(models.TextField(blank=True, null=True))
    
    # Custom fields for condition-specific data
    details = encrypt(models.JSONField(default=dict, blank=True))
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-is_primary', 'condition_name']
    
    def __str__(self):
        return f"{self.condition_name} for {self.patient.user.username}"


class ProviderProfile(models.Model):
    """Profile for healthcare providers."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='provider_profile')
    license_number = models.CharField(max_length=50, blank=True, null=True)
    specialty = models.CharField(max_length=100, blank=True, null=True)
    practice_name = models.CharField(max_length=255, blank=True, null=True)
    practice_address = models.TextField(blank=True, null=True)
    years_of_experience = models.PositiveSmallIntegerField(default=0)
    npi_number = models.CharField(max_length=50, blank=True, null=True)
    
    # Provider specialties for rare conditions
    rare_condition_specialties = models.TextField(blank=True, null=True)
    
    # Provider availability
    accepting_new_patients = models.BooleanField(default=True)
    telemedicine_available = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Provider Profile: {self.user.username}"


class PharmcoProfile(models.Model):
    """Profile for pharmaceutical companies monitoring medication efficacy."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='pharmco_profile')
    pharmacy_name = models.CharField(max_length=255, blank=True, null=True)
    pharmacy_address = models.TextField(blank=True, null=True)
    pharmacy_license = models.CharField(max_length=50, blank=True, null=True)
    pharmacy_hours = models.TextField(blank=True, null=True)
    does_delivery = models.BooleanField(default=False)
    
    # Specialty pharmacy indicators
    is_specialty_pharmacy = models.BooleanField(default=False)
    specialty_conditions_served = models.TextField(blank=True, null=True)
    
    # Monitored medications
    monitored_medications = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"Pharmacy Profile: {self.user.username}"


class CaregiverProfile(models.Model):
    """Profile for patient caregivers."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='caregiver_profile')
    relationship_to_patient = models.CharField(max_length=100, blank=True)
    
    # Access level for patient data
    access_level = models.CharField(
        max_length=20,
        choices=[
            ('VIEW_ONLY', 'View Only'),
            ('SCHEDULE', 'Scheduling'),
            ('MEDICATIONS', 'Medication Management'),
            ('FULL', 'Full Access')
        ],
        default='VIEW_ONLY'
    )
    
    # Caregiver-specific fields
    is_primary_caregiver = models.BooleanField(default=False)
    notes = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"Caregiver Profile: {self.user.username}"


class ResearcherProfile(models.Model):
    """Profile for clinical researchers studying medication efficacy."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='researcher_profile')
    institution = models.CharField(max_length=255, blank=True, null=True)
    department = models.CharField(max_length=255, blank=True, null=True)
    research_focus = models.TextField(blank=True, null=True)
    
    # Credentials
    credentials = models.CharField(max_length=255, blank=True, null=True)
    
    # Research-specific fields
    active_studies = models.TextField(blank=True, null=True)
    study_recruitment_active = models.BooleanField(default=False)
    
    # Verification status
    is_verified = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Researcher Profile: {self.user.username}"


class ConsentLog(models.Model):
    """Track all consent changes for HIPAA compliance."""
    CONSENT_TYPES = (
        ('MEDICATION_ADHERENCE', 'Medication Adherence Monitoring'),
        ('VITALS_MONITORING', 'Vitals Monitoring'),
        ('DATA_SHARING', 'Data Sharing'),
        ('RESEARCH', 'Research Participation'),
        ('CAREGIVER_ACCESS', 'Caregiver Access'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='consent_logs')
    consent_type = models.CharField(max_length=25, choices=CONSENT_TYPES)
    consented = models.BooleanField()
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Consent Log'
        verbose_name_plural = 'Consent Logs'

class ComplianceProfile(models.Model):
    """Profile for HIPAA compliance officers."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='compliance_profile')
    
    # Compliance credentials
    hipaa_certification = models.BooleanField(default=False)
    certification_id = models.CharField(max_length=100, blank=True, null=True)
    certification_expiry = models.DateField(null=True, blank=True)
    
    # Department/organization info
    department = models.CharField(max_length=255, blank=True, null=True)
    title = models.CharField(max_length=255, blank=True, null=True)
    
    # Compliance access levels
    can_view_audit_logs = models.BooleanField(default=True)
    can_view_phi = models.BooleanField(default=True)
    can_view_consent_logs = models.BooleanField(default=True)
    
    # Notes about compliance officer role
    notes = models.TextField(blank=True, null=True)
    
    # When officer was added to the system
    added_date = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Compliance Officer: {self.user.username}"
    
    class Meta:
        verbose_name = 'Compliance Officer Profile'
        verbose_name_plural = 'Compliance Officer Profiles'
