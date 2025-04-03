from datetime import timezone
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import (
    ComplianceProfile, TwoFactorDevice, PatientProfile, ProviderProfile, PharmcoProfile,
    CaregiverProfile, ResearcherProfile, PatientCondition, ConsentLog
)

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """Serializer for user model."""
    password = serializers.CharField(write_only=True, required=False)
    password_confirm = serializers.CharField(write_only=True, required=False)
    is_approved = serializers.BooleanField(read_only=True)
    approved_at = serializers.DateTimeField(read_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 
                  'phone_number', 'date_of_birth', 'role', 'role_display',
                  'two_factor_enabled', 'profile_image', 'date_joined',
                  'password', 'password_confirm', 'terms_accepted',
                  'data_sharing_consent', 'medication_adherence_monitoring_consent',
                  'vitals_monitoring_consent', 'research_consent', 
                  'is_approved', 'approved_at')
        read_only_fields = ('id', 'date_joined', 'role_display', 'two_factor_enabled', 
                           'is_approved', 'approved_at')
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def validate(self, data):
        """Validate password confirmation."""
        if 'password' in data and 'password_confirm' in data:
            if data['password'] != data['password_confirm']:
                raise serializers.ValidationError({"password_confirm": "Passwords don't match."})
            
            # Validate password strength
            validate_password(data['password'])
            
            # Remove password_confirm from data
            data.pop('password_confirm')
        
        return data
    
    def create(self, validated_data):
        """Create a new user with encrypted password."""
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        
        if password:
            user.set_password(password)
            user.password_last_changed = timezone.now()
        
        user.save()
        return user
    
    def update(self, instance, validated_data):
        """Update user, handling password separately."""
        password = validated_data.pop('password', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if password:
            instance.set_password(password)
            instance.password_last_changed = timezone.now()
        
        instance.save()
        return instance


class LoginSerializer(serializers.Serializer):
    """Serializer for user login."""
    username = serializers.CharField()
    password = serializers.CharField(style={'input_type': 'password'})


class TwoFactorAuthSerializer(serializers.Serializer):
    """Serializer for two-factor authentication."""
    user_id = serializers.IntegerField()
    token = serializers.CharField(max_length=6)


class TwoFactorSetupSerializer(serializers.Serializer):
    """Serializer for setting up two-factor authentication."""
    token = serializers.CharField(max_length=6)


class TwoFactorDisableSerializer(serializers.Serializer):
    """Serializer for disabling two-factor authentication."""
    password = serializers.CharField(style={'input_type': 'password'})


class ConsentLogSerializer(serializers.ModelSerializer):
    """Serializer for consent logs."""
    class Meta:
        model = ConsentLog
        fields = '__all__'
        read_only_fields = ('user', 'timestamp', 'ip_address', 'user_agent')


class PatientConditionSerializer(serializers.ModelSerializer):
    """Serializer for patient conditions."""
    class Meta:
        model = PatientCondition
        fields = '__all__'
        read_only_fields = ('patient', 'created_at', 'updated_at')


class BaseProfileSerializer(serializers.ModelSerializer):
    """Base serializer for all profile types."""
    def validate(self, attrs):
        request = self.context.get('request')
        if 'user' in attrs and request:
            if attrs['user'] != request.user and not request.user.is_staff:
                raise serializers.ValidationError({"user": "You can only modify your own profile."})
        return attrs


class PatientProfileSerializer(BaseProfileSerializer):
    """Serializer for patient profiles with medication adherence tracking."""
    conditions = PatientConditionSerializer(many=True, read_only=True)
    
    class Meta:
        model = PatientProfile
        fields = '__all__'
        read_only_fields = ('user',)
    
    def update(self, instance, validated_data):
        """Update patient profile with consent logging."""
        request = self.context.get('request')
        
        # Check for consent field changes
        old_medication_adherence = instance.medication_adherence_opt_in
        old_vitals_monitoring = instance.vitals_monitoring_opt_in
        
        # Update the instance
        instance = super().update(instance, validated_data)
        
        # Log consent changes if they occurred
        if request and old_medication_adherence != instance.medication_adherence_opt_in:
            ConsentLog.objects.create(
                user=instance.user,
                consent_type='MEDICATION_ADHERENCE',
                consented=instance.medication_adherence_opt_in,
                ip_address=request.META.get('REMOTE_ADDR', ''),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
            
            # Update user's main consent flag
            instance.user.medication_adherence_monitoring_consent = instance.medication_adherence_opt_in
            instance.user.save(update_fields=['medication_adherence_monitoring_consent'])
            
        if request and old_vitals_monitoring != instance.vitals_monitoring_opt_in:
            ConsentLog.objects.create(
                user=instance.user,
                consent_type='VITALS_MONITORING',
                consented=instance.vitals_monitoring_opt_in,
                ip_address=request.META.get('REMOTE_ADDR', ''),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
            
            # Update user's main consent flag
            instance.user.vitals_monitoring_consent = instance.vitals_monitoring_opt_in
            instance.user.save(update_fields=['vitals_monitoring_consent'])
        
        return instance


class ProviderProfileSerializer(BaseProfileSerializer):
    """Serializer for healthcare provider profiles."""
    class Meta:
        model = ProviderProfile
        fields = '__all__'
        read_only_fields = ('user',)


class PharmcoProfileSerializer(BaseProfileSerializer):
    """Serializer for pharmaceutical company profiles."""
    class Meta:
        model = PharmcoProfile
        fields = '__all__'
        read_only_fields = ('user',)


class CaregiverProfileSerializer(BaseProfileSerializer):
    """Serializer for caregiver profiles."""
    class Meta:
        model = CaregiverProfile
        fields = '__all__'
        read_only_fields = ('user',)
    
    def update(self, instance, validated_data):
        """Update caregiver profile with consent logging for access changes."""
        request = self.context.get('request')
        old_access_level = instance.access_level
        
        # Update the instance
        instance = super().update(instance, validated_data)
        
        # Log access level changes
        if request and old_access_level != instance.access_level:
            # Log this change as it affects patient data access
            ConsentLog.objects.create(
                user=instance.user,
                consent_type='CAREGIVER_ACCESS',
                consented=True,  # Changed access level, but still has access
                ip_address=request.META.get('REMOTE_ADDR', ''),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
        
        return instance

class ResearcherProfileSerializer(BaseProfileSerializer):
    """Serializer for clinical researcher profiles."""
    class Meta:
        model = ResearcherProfile
        fields = '__all__'
        read_only_fields = ('user', 'is_verified')

class ComplianceProfileSerializer(BaseProfileSerializer):
    """Serializer for compliance officer profiles."""
    class Meta:
        model = ComplianceProfile
        fields = '__all__'
        read_only_fields = ('user', 'added_date')