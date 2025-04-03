from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    MedicalRecord, Medication, MedicationIntake, Allergy, Condition, ConditionFlare,
    Symptom, Immunization, LabTest, LabResult, VitalSign, Treatment, FamilyHistory,
    HealthDataConsent, HealthDataAuditLog, EHRIntegration, WearableIntegration,
    RareConditionRegistry, ReferralNetwork
)

User = get_user_model()

class UserBasicSerializer(serializers.ModelSerializer):
    """Simplified user serializer for nested relationships."""
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'email', 'role', 'role_display', 'is_approved')
        read_only_fields = ('id', 'role_display', 'is_approved')

class RareConditionRegistrySerializer(serializers.ModelSerializer):
    """Serializer for rare condition registry."""
    class Meta:
        model = RareConditionRegistry
        fields = '__all__'

class MedicalRecordSerializer(serializers.ModelSerializer):
    """Serializer for medical records."""
    patient_details = UserBasicSerializer(source='patient', read_only=True)
    primary_physician_details = UserBasicSerializer(source='primary_physician', read_only=True)
    created_by_details = UserBasicSerializer(source='created_by', read_only=True)
    updated_by_details = UserBasicSerializer(source='updated_by', read_only=True)
    
    class Meta:
        model = MedicalRecord
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 
                           'created_by_details', 'updated_by_details', 'version')
    
    def create(self, validated_data):
        # Set the created_by field
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['created_by'] = request.user
            validated_data['updated_by'] = request.user
        
        # Check for rare conditions
        if 'conditions' in self.initial_data and isinstance(self.initial_data['conditions'], list):
            has_rare = any(c.get('is_rare_condition', False) for c in self.initial_data['conditions'])
            validated_data['has_rare_condition'] = has_rare
        
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        # Set the updated_by field
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['updated_by'] = request.user
        
        # Increment version
        validated_data['version'] = instance.version + 1
        
        return super().update(instance, validated_data)

class MedicationIntakeSerializer(serializers.ModelSerializer):
    """Serializer for medication intake tracking."""
    recorded_by_details = UserBasicSerializer(source='recorded_by', read_only=True)
    
    class Meta:
        model = MedicationIntake
        fields = '__all__'
        read_only_fields = ('created_at', 'recorded_by_details')

class MedicationSerializer(serializers.ModelSerializer):
    """Serializer for medications."""
    prescriber_details = UserBasicSerializer(source='prescriber', read_only=True)
    created_by_details = UserBasicSerializer(source='created_by', read_only=True)
    intakes = MedicationIntakeSerializer(many=True, read_only=True)
    
    class Meta:
        model = Medication
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 
                           'created_by_details', 'prescriber_details', 'intakes')
    
    def create(self, validated_data):
        # Set the created_by field
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['created_by'] = request.user
        
        return super().create(validated_data)

class AllergySerializer(serializers.ModelSerializer):
    """Serializer for allergies."""
    created_by_details = UserBasicSerializer(source='created_by', read_only=True)
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    
    class Meta:
        model = Allergy
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 
                           'created_by_details', 'severity_display')
    
    def create(self, validated_data):
        # Set the created_by field
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['created_by'] = request.user
        
        return super().create(validated_data)

class SymptomSerializer(serializers.ModelSerializer):
    """Serializer for symptoms."""
    created_by_details = UserBasicSerializer(source='created_by', read_only=True)
    
    class Meta:
        model = Symptom
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'created_by_details')
    
    def create(self, validated_data):
        # Set the created_by field
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['created_by'] = request.user
        
        return super().create(validated_data)

class ConditionFlareSerializer(serializers.ModelSerializer):
    """Serializer for condition flares."""
    recorded_by_details = UserBasicSerializer(source='recorded_by', read_only=True)
    
    class Meta:
        model = ConditionFlare
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'recorded_by_details')

class ConditionSerializer(serializers.ModelSerializer):
    """Serializer for medical conditions."""
    created_by_details = UserBasicSerializer(source='created_by', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    flares = ConditionFlareSerializer(many=True, read_only=True)
    symptoms = SymptomSerializer(many=True, read_only=True)
    rare_condition_details = RareConditionRegistrySerializer(source='rare_condition', read_only=True)
    
    class Meta:
        model = Condition
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'created_by_details',
                           'status_display', 'category_display', 'flares', 'symptoms',
                           'rare_condition_details')
    
    def create(self, validated_data):
        # Set the created_by field
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['created_by'] = request.user
        
        # Update medical record if this is a rare condition
        if validated_data.get('is_rare_condition', False):
            medical_record = validated_data.get('medical_record')
            if medical_record:
                medical_record.has_rare_condition = True
                medical_record.save(update_fields=['has_rare_condition'])
        
        return super().create(validated_data)

class ImmunizationSerializer(serializers.ModelSerializer):
    """Serializer for immunizations."""
    created_by_details = UserBasicSerializer(source='created_by', read_only=True)
    
    class Meta:
        model = Immunization
        fields = '__all__'
        read_only_fields = ('created_at', 'created_by', 'created_by_details')
    
    def create(self, validated_data):
        # Set the created_by field
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['created_by'] = request.user
        
        return super().create(validated_data)

class LabResultSerializer(serializers.ModelSerializer):
    """Serializer for lab results."""
    created_by_details = UserBasicSerializer(source='created_by', read_only=True)
    interpreted_by_details = UserBasicSerializer(source='interpreted_by', read_only=True)
    
    class Meta:
        model = LabResult
        fields = '__all__'
        read_only_fields = ('created_at', 'created_by', 'created_by_details', 
                           'interpreted_by_details')
    
    def create(self, validated_data):
        # Set the created_by field
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['created_by'] = request.user
        
        return super().create(validated_data)

class LabTestSerializer(serializers.ModelSerializer):
    """Serializer for lab tests."""
    ordered_by_details = UserBasicSerializer(source='ordered_by', read_only=True)
    created_by_details = UserBasicSerializer(source='created_by', read_only=True)
    results = LabResultSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    related_condition_details = ConditionSerializer(source='related_condition', read_only=True)
    
    class Meta:
        model = LabTest
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'created_by_details',
                           'ordered_by_details', 'results', 'status_display',
                           'related_condition_details')
    
    def create(self, validated_data):
        # Set the created_by field
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['created_by'] = request.user
        
        return super().create(validated_data)

class VitalSignSerializer(serializers.ModelSerializer):
    """Serializer for vital signs."""
    created_by_details = UserBasicSerializer(source='created_by', read_only=True)
    measurement_type_display = serializers.CharField(source='get_measurement_type_display', read_only=True)
    related_to_condition_details = ConditionSerializer(source='related_to_condition', read_only=True)
    
    class Meta:
        model = VitalSign
        fields = '__all__'
        read_only_fields = ('created_at', 'created_by', 'created_by_details',
                           'measurement_type_display', 'related_to_condition_details')
    
    def create(self, validated_data):
        # Set the created_by field
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['created_by'] = request.user
        
        return super().create(validated_data)

class TreatmentSerializer(serializers.ModelSerializer):
    """Serializer for treatments."""
    provider_details = UserBasicSerializer(source='provider', read_only=True)
    created_by_details = UserBasicSerializer(source='created_by', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    related_condition_details = ConditionSerializer(source='related_condition', read_only=True)
    
    class Meta:
        model = Treatment
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'created_by_details',
                           'provider_details', 'status_display', 'related_condition_details')
    
    def create(self, validated_data):
        # Set the created_by field
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['created_by'] = request.user
        
        return super().create(validated_data)

class FamilyHistorySerializer(serializers.ModelSerializer):
    """Serializer for family history."""
    created_by_details = UserBasicSerializer(source='created_by', read_only=True)
    relationship_display = serializers.CharField(source='get_relationship_display', read_only=True)
    rare_condition_details = RareConditionRegistrySerializer(source='rare_condition', read_only=True)
    
    class Meta:
        model = FamilyHistory
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'created_by_details',
                           'relationship_display', 'rare_condition_details')
    
    def create(self, validated_data):
        # Set the created_by field
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['created_by'] = request.user
        
        return super().create(validated_data)

class HealthDataConsentSerializer(serializers.ModelSerializer):
    """Serializer for health data consent."""
    patient_details = UserBasicSerializer(source='patient', read_only=True)
    authorized_entity_details = UserBasicSerializer(source='authorized_entity', read_only=True)
    consent_type_display = serializers.CharField(source='get_consent_type_display', read_only=True)
    
    class Meta:
        model = HealthDataConsent
        fields = '__all__'
        read_only_fields = ('consented_at', 'updated_at', 'patient_details', 
                           'authorized_entity_details', 'consent_type_display')
    
    def create(self, validated_data):
        # Capture IP and user agent
        request = self.context.get('request')
        if request:
            validated_data['ip_address'] = self.get_client_ip(request)
            validated_data['user_agent'] = request.META.get('HTTP_USER_AGENT', '')
        
        return super().create(validated_data)
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR', '')
        return ip

class HealthDataAuditLogSerializer(serializers.ModelSerializer):
    """Serializer for health data audit logs."""
    user_details = UserBasicSerializer(source='user', read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    
    class Meta:
        model = HealthDataAuditLog
        fields = '__all__'
        read_only_fields = ('timestamp', 'user_details', 'action_display')

class EHRIntegrationSerializer(serializers.ModelSerializer):
    """Serializer for EHR integrations."""
    patient_details = UserBasicSerializer(source='patient', read_only=True)
    created_by_details = UserBasicSerializer(source='created_by', read_only=True)
    integration_type_display = serializers.CharField(source='get_integration_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = EHRIntegration
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'created_by_details',
                           'patient_details', 'integration_type_display', 'status_display',
                           'access_token', 'refresh_token')  # Don't expose tokens in API
    
    def create(self, validated_data):
        # Set the created_by field
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['created_by'] = request.user
        
        return super().create(validated_data)

class WearableIntegrationSerializer(serializers.ModelSerializer):
    """Serializer for wearable integrations."""
    patient_details = UserBasicSerializer(source='patient', read_only=True)
    device_type_display = serializers.CharField(source='get_device_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = WearableIntegration
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'patient_details',
                           'device_type_display', 'status_display',
                           'access_token', 'refresh_token')  # Don't expose tokens in API

class ReferralNetworkSerializer(serializers.ModelSerializer):
    """Serializer for rare condition specialist referral network."""
    provider_details = UserBasicSerializer(source='provider', read_only=True)
    specific_conditions_details = RareConditionRegistrySerializer(
        source='specific_conditions', many=True, read_only=True
    )
    
    class Meta:
        model = ReferralNetwork
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'provider_details',
                           'specific_conditions_details')

# Comprehensive nested serializers for detailed views
class MedicalRecordDetailSerializer(MedicalRecordSerializer):
    """Detailed serializer for medical records with all related data."""
    conditions = ConditionSerializer(many=True, read_only=True)
    medications = MedicationSerializer(many=True, read_only=True)
    allergies = AllergySerializer(many=True, read_only=True)
    lab_tests = LabTestSerializer(many=True, read_only=True)
    immunizations = ImmunizationSerializer(many=True, read_only=True)
    vital_signs = VitalSignSerializer(many=True, read_only=True)
    treatments = TreatmentSerializer(many=True, read_only=True)
    family_history = FamilyHistorySerializer(many=True, read_only=True)
    
    class Meta(MedicalRecordSerializer.Meta):
        pass
