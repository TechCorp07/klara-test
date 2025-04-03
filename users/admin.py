from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    User, TwoFactorDevice, PatientProfile, ProviderProfile, 
    PharmcoProfile, CaregiverProfile, ResearcherProfile,
    ComplianceProfile, PatientCondition, ConsentLog
)

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin configuration for the custom User model."""
    model = User
    list_display = ('username', 'email', 'role', 'is_active', 'is_approved', 'two_factor_enabled', 'date_joined')
    list_filter = ('role', 'is_staff', 'is_active', 'is_approved', 'two_factor_enabled')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email', 'phone_number', 'date_of_birth', 'profile_image')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'is_approved', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined', 'approved_at')}),
        ('Role & Security', {'fields': ('role', 'two_factor_enabled', 'login_attempts', 'account_locked', 'account_locked_time', 'password_last_changed')}),
        ('Consent', {'fields': ('terms_accepted', 'data_sharing_consent', 'medication_adherence_monitoring_consent', 'vitals_monitoring_consent', 'research_consent')}),
        ('Approval', {'fields': ('approved_by',)}),
    )
    
    readonly_fields = ('date_joined', 'last_login', 'password_last_changed', 'approved_at', 'approved_by')
    
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ("Role & Contact", {
            'fields': ('role', 'email', 'phone_number')
        }),
    )
    
    ordering = ('date_joined',)
    
    def unlock_users(self, request, queryset):
        """Admin action to unlock users."""
        for user in queryset:
            if user.account_locked:
                user.account_locked = False
                user.account_locked_time = None
                user.login_attempts = 0
                user.save()
    
    def approve_users(self, request, queryset):
        """Admin action to approve users."""
        for user in queryset:
            if not user.is_approved:
                user.approve_user(request.user)
                
                # Send approval email
                try:
                    self.send_approval_email(user)
                except Exception as e:
                    self.message_user(request, f"User {user.username} approved but email failed: {str(e)}", level='WARNING')
                    continue
                    
        self.message_user(request, f"{queryset.count()} users were successfully approved")
    
    def send_approval_email(self, user):
        """Send approval notification email to user."""
        from django.core.mail import send_mail
        from django.conf import settings
        from django.template.loader import render_to_string
        
        subject = "Your Klararety Health Platform Account has been Approved"
        
        message = f"""
        Hello {user.first_name or user.username},
        
        Your account on the Klararety Health Platform has been approved. You can now log in using your credentials.
        
        Role: {user.get_role_display()}
        Username: {user.username}
        
        Thank you for joining the Klararety Health Platform.
        
        Best regards,
        The Klararety Team
        """
        
        # Send the email
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[user.email],
            fail_silently=False,
        )
    
    approve_users.short_description = "Approve selected users"
    unlock_users.short_description = "Unlock selected users"
    
    actions = [unlock_users, approve_users]

@admin.register(TwoFactorDevice)
class TwoFactorDeviceAdmin(admin.ModelAdmin):
    """Admin configuration for TwoFactorDevice model."""
    list_display = ('user', 'confirmed', 'created_at', 'last_used_at')
    search_fields = ('user__username', 'user__email')
    list_filter = ('confirmed',)
    readonly_fields = ('created_at', 'last_used_at')

@admin.register(PatientProfile)
class PatientProfileAdmin(admin.ModelAdmin):
    """Admin configuration for PatientProfile model."""
    list_display = ('user', 'primary_condition', 'medication_adherence_opt_in', 'vitals_monitoring_opt_in')
    search_fields = ('user__username', 'user__email', 'primary_condition')
    list_filter = ('medication_adherence_opt_in', 'vitals_monitoring_opt_in')
    filter_horizontal = ('authorized_caregivers',)
    
    fieldsets = (
        ('User Information', {'fields': ('user',)}),
        ('Medical Information', {'fields': ('medical_id', 'primary_condition', 'condition_diagnosis_date', 'blood_type', 'allergies')}),
        ('Emergency Contact', {'fields': ('emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship')}),
        ('Consent Settings', {'fields': ('medication_adherence_opt_in', 'medication_adherence_consent_date', 'vitals_monitoring_opt_in', 'vitals_monitoring_consent_date')}),
        ('Caregivers', {'fields': ('authorized_caregivers',)}),
    )
    
    readonly_fields = ('medication_adherence_consent_date', 'vitals_monitoring_consent_date')

@admin.register(PatientCondition)
class PatientConditionAdmin(admin.ModelAdmin):
    """Admin configuration for PatientCondition model."""
    list_display = ('patient', 'condition_name', 'diagnosis_date', 'status', 'is_primary')
    search_fields = ('patient__user__username', 'condition_name')
    list_filter = ('status', 'is_primary')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(ProviderProfile)
class ProviderProfileAdmin(admin.ModelAdmin):
    """Admin configuration for ProviderProfile model."""
    list_display = ('user', 'license_number', 'specialty', 'npi_number', 'accepting_new_patients')
    search_fields = ('user__username', 'user__email', 'license_number', 'specialty')
    list_filter = ('accepting_new_patients', 'telemedicine_available')

@admin.register(PharmcoProfile)
class PharmcoProfileAdmin(admin.ModelAdmin):
    """Admin configuration for PharmcoProfile model."""
    list_display = ('user', 'pharmacy_name', 'pharmacy_license', 'is_specialty_pharmacy', 'does_delivery')
    search_fields = ('user__username', 'pharmacy_name', 'pharmacy_license')
    list_filter = ('is_specialty_pharmacy', 'does_delivery')

@admin.register(CaregiverProfile)
class CaregiverProfileAdmin(admin.ModelAdmin):
    """Admin configuration for CaregiverProfile model."""
    list_display = ('user', 'relationship_to_patient', 'access_level', 'is_primary_caregiver')
    search_fields = ('user__username', 'user__email')
    list_filter = ('access_level', 'is_primary_caregiver')

@admin.register(ResearcherProfile)
class ResearcherProfileAdmin(admin.ModelAdmin):
    """Admin configuration for ResearcherProfile model."""
    list_display = ('user', 'institution', 'department', 'is_verified', 'study_recruitment_active')
    search_fields = ('user__username', 'user__email', 'institution')
    list_filter = ('is_verified', 'study_recruitment_active')
    
    def verify_researchers(self, request, queryset):
        """Admin action to verify researchers."""
        queryset.update(is_verified=True)
    
    verify_researchers.short_description = "Verify selected researchers"
    
    actions = [verify_researchers]

@admin.register(ConsentLog)
class ConsentLogAdmin(admin.ModelAdmin):
    """Admin configuration for ConsentLog model."""
    list_display = ('user', 'consent_type', 'consented', 'timestamp', 'ip_address')
    search_fields = ('user__username', 'user__email')
    list_filter = ('consent_type', 'consented', 'timestamp')
    readonly_fields = ('user', 'consent_type', 'consented', 'timestamp', 'ip_address', 'user_agent')
    
    def has_add_permission(self, request):
        """Disable adding consent logs manually."""
        return False
    
    def has_change_permission(self, request, obj=None):
        """Disable changing consent logs."""
        return False

@admin.register(ComplianceProfile)
class ComplianceProfileAdmin(admin.ModelAdmin):
    """Admin configuration for ComplianceProfile model."""
    list_display = ('user', 'hipaa_certification', 'certification_expiry', 'can_view_phi', 'can_view_audit_logs')
    search_fields = ('user__username', 'user__email', 'certification_id')
    list_filter = ('hipaa_certification', 'can_view_phi', 'can_view_audit_logs', 'can_view_consent_logs')
    
    fieldsets = (
        ('User Information', {'fields': ('user',)}),
        ('Certification', {'fields': ('hipaa_certification', 'certification_id', 'certification_expiry')}),
        ('Organization', {'fields': ('department', 'title')}),
        ('Access Levels', {'fields': ('can_view_audit_logs', 'can_view_phi', 'can_view_consent_logs')}),
        ('Notes', {'fields': ('notes',)}),
    )
    
    readonly_fields = ('added_date',)
