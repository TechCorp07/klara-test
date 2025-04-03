import pyotp
import qrcode
import io
import base64
from django.contrib.auth import authenticate
from django.utils import timezone
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from .models import (
    TwoFactorDevice, PatientProfile, ProviderProfile, PharmcoProfile,
    CaregiverProfile, ResearcherProfile, ComplianceProfile, PatientCondition, ConsentLog
)
from .serializers import (
    UserSerializer, LoginSerializer, TwoFactorAuthSerializer,
    TwoFactorSetupSerializer, TwoFactorDisableSerializer,
    PatientProfileSerializer, ProviderProfileSerializer,
    PharmcoProfileSerializer, CaregiverProfileSerializer,
    ResearcherProfileSerializer, ComplianceProfileSerializer,
    PatientConditionSerializer, ConsentLogSerializer
)
from .permissions import IsAdminOrSelfOnly, IsApprovedUser, IsRoleOwnerOrReadOnly, IsComplianceOfficer

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for user management for Klararety Health Platform."""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_permissions(self):
        """Set custom permissions for different actions."""
        if self.action in ['create', 'login', 'verify_2fa']:
            permission_classes = [AllowAny]
        elif self.action in ['retrieve', 'update', 'partial_update', 'me', 'setup_2fa', 'confirm_2fa', 'disable_2fa']:
            permission_classes = [IsAuthenticated, IsAdminOrSelfOnly, IsApprovedUser]
        elif self.action in ['approve_user', 'pending_approvals']:
            permission_classes = [IsAuthenticated, permissions.IsAdminUser]
        else:
            permission_classes = [permissions.IsAdminUser]
        return [permission() for permission in permission_classes]
    
    @swagger_auto_schema(method='post', operation_description="Login a user and return token or require 2FA", tags=['Authentication'])
    @action(detail=False, methods=['post'])
    def login(self, request):
        """Login user with enhanced security checks."""
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        
        # Get client IP for logging
        ip_address = self._get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        try:
            user = User.objects.get(username=username)
            
            # Check for account lockout
            if user.account_locked:
                lockout_duration = timezone.now() - user.account_locked_time
                if lockout_duration.total_seconds() < 1800:  # 30 minutes
                    # Log failed attempt for security
                    self._log_security_event(
                        user=user,
                        event_type="AUTH_FAILURE",
                        description="Login attempt on locked account",
                        ip_address=ip_address,
                        user_agent=user_agent
                    )
                    
                    minutes_left = 30 - int(lockout_duration.total_seconds() / 60)
                    return Response(
                        {'detail': f'Account is temporarily locked. Try again in {minutes_left} minutes.'},
                        status=status.HTTP_403_FORBIDDEN
                    )
                else:
                    # Reset lockout if over 30 minutes
                    user.account_locked = False
                    user.login_attempts = 0
                    user.save(update_fields=['account_locked', 'login_attempts'])
        except User.DoesNotExist:
            user = None
        
        # Authenticate and check credentials
        authenticated_user = authenticate(username=username, password=password)
        
        if not authenticated_user:
            # Handle failed login
            if user:
                # Increment failed attempts for valid username
                user.increment_login_attempt()
                
                # Log failed attempt for security
                self._log_security_event(
                    user=user,
                    event_type="AUTH_FAILURE",
                    description="Invalid password",
                    ip_address=ip_address,
                    user_agent=user_agent
                )
                
                if user.account_locked:
                    return Response(
                        {'detail': 'Account locked due to too many failed attempts. Try again in 30 minutes.'},
                        status=status.HTTP_403_FORBIDDEN
                    )
            else:
                # Log attempt with non-existent username
                self._log_security_event(
                    user=None,
                    event_type="AUTH_FAILURE",
                    description=f"Login attempt with invalid username: {username}",
                    ip_address=ip_address,
                    user_agent=user_agent
                )
            
            # Return generic error for security
            return Response(
                {'detail': 'Invalid credentials'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Login successful - handle successful authentication
        user = authenticated_user
        
        # Check if user is approved
        if not user.is_approved and not user.is_staff and user.role != 'admin':
            return Response(
                {'detail': 'Your account is pending administrator approval.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Reset login attempts
        user.login_attempts = 0
        user.last_login_ip = ip_address
        user.save(update_fields=['login_attempts', 'last_login_ip'])
        
        # Log successful login
        self._log_security_event(
            user=user,
            event_type="AUTH_SUCCESS",
            description="Successful login",
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        # Check if password is expired (if using password expiry)
        if hasattr(user, 'password_last_changed') and user.password_last_changed:
            password_age = timezone.now() - user.password_last_changed
            # 90 days password expiry (typical for healthcare)
            if password_age.days > 90:
                return Response({
                    'requires_password_reset': True,
                    'user_id': user.id,
                    'message': 'Your password has expired and must be changed'
                }, status=status.HTTP_200_OK)
        
        # Check if 2FA is enabled
        if user.two_factor_enabled:
            return Response({
                'requires_2fa': True,
                'user_id': user.id
            })
        
        # Standard login - generate token
        Token.objects.filter(user=user).delete()
        token = Token.objects.create(user=user)
        
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        })
    
    @swagger_auto_schema(method='get', operation_description="Get a list of users pending approval", tags=['Administration'])
    @action(detail=False, methods=['get'])
    def pending_approvals(self, request):
        """Get a list of users pending approval."""
        pending_users = User.objects.filter(is_approved=False)
        serializer = self.get_serializer(pending_users, many=True)
        return Response(serializer.data)
    
    @swagger_auto_schema(method='post', operation_description="Approve a user account", tags=['Administration'])
    @action(detail=True, methods=['post'])
    def approve_user(self, request, pk=None):
        """Approve a user account."""
        user = self.get_object()
        
        if user.is_approved:
            return Response({'detail': 'User is already approved'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Approve the user
        user.approve_user(request.user)
        
        # Send approval email
        try:
            from django.core.mail import send_mail
            from django.conf import settings
            
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
            
        except Exception as e:
            # Log the error but continue with approval
            import logging
            logger = logging.getLogger('django')
            logger.error(f"Failed to send approval email to {user.email}: {str(e)}")
            
            return Response({
                'detail': f'User approved but email notification failed: {str(e)}',
                'user': UserSerializer(user).data
            })
        
        return Response({
            'detail': 'User approved and notified via email',
            'user': UserSerializer(user).data
        })

    @swagger_auto_schema(method='get', operation_description="Get current authenticated user info", tags=['Users'])
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user profile with role-specific data."""
        user = request.user
        serializer = self.get_serializer(user)
        data = serializer.data
        
        # Add role-specific profile data
        if user.role == 'patient' and hasattr(user, 'patient_profile'):
            data['patient_profile'] = PatientProfileSerializer(user.patient_profile).data
            conditions = PatientCondition.objects.filter(patient=user.patient_profile)
            if conditions.exists():
                data['conditions'] = PatientConditionSerializer(conditions, many=True).data
        
        elif user.role == 'provider' and hasattr(user, 'provider_profile'):
            data['provider_profile'] = ProviderProfileSerializer(user.provider_profile).data
        
        elif user.role == 'pharmco' and hasattr(user, 'pharmco_profile'):
            data['pharmco_profile'] = PharmcoProfileSerializer(user.pharmco_profile).data
        
        elif user.role == 'caregiver' and hasattr(user, 'caregiver_profile'):
            data['caregiver_profile'] = CaregiverProfileSerializer(user.caregiver_profile).data
            patients = user.caregiver_patients.all()
            if patients.exists():
                data['patients'] = PatientProfileSerializer(patients, many=True).data
        
        elif user.role == 'researcher' and hasattr(user, 'researcher_profile'):
            data['researcher_profile'] = ResearcherProfileSerializer(user.researcher_profile).data
            
        elif user.role == 'compliance' and hasattr(user, 'compliance_profile'):
            data['compliance_profile'] = ComplianceProfileSerializer(user.compliance_profile).data
        
        return Response(data)
    
    @swagger_auto_schema(method='post', operation_description="Verify 2FA token to complete login", tags=['Authentication'])
    @action(detail=False, methods=['post'])
    def verify_2fa(self, request):
        """Verify 2FA token and complete login."""
        serializer = TwoFactorAuthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Get client IP for logging
        ip_address = self._get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        try:
            user = User.objects.get(id=serializer.validated_data['user_id'])
            device = TwoFactorDevice.objects.get(user=user)
        except (User.DoesNotExist, TwoFactorDevice.DoesNotExist):
            return Response(
                {'detail': 'Invalid user or 2FA not set up'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify token
        totp = pyotp.TOTP(device.secret_key)
        if not totp.verify(serializer.validated_data['token']):
            # Log failed 2FA attempt
            self._log_security_event(
                user=user,
                event_type="2FA_FAILURE",
                description="Invalid 2FA verification code",
                ip_address=ip_address,
                user_agent=user_agent
            )
            
            return Response(
                {'detail': 'Invalid verification code'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update last used timestamp
        device.last_used_at = timezone.now()
        device.save()
        
        # Log successful 2FA verification
        self._log_security_event(
            user=user,
            event_type="2FA_SUCCESS",
            description="Successful 2FA verification",
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        # Complete login
        Token.objects.filter(user=user).delete()
        token = Token.objects.create(user=user)
        
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        })
    
    @action(detail=False, methods=['post'])
    def logout(self, request):
        """Logout user and delete token."""
        if request.user.is_authenticated:
            # Log logout for security
            self._log_security_event(
                user=request.user,
                event_type="LOGOUT",
                description="User logged out",
                ip_address=self._get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
            
            Token.objects.filter(user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @swagger_auto_schema(method='post', operation_description="Setup 2FA and return QR code", tags=['Authentication'])
    @action(detail=False, methods=['post'])
    def setup_2fa(self, request):
        """Set up two-factor authentication."""
        user = request.user
        
        # Generate secret key
        secret_key = pyotp.random_base32()
        
        # Create or update device
        device, created = TwoFactorDevice.objects.get_or_create(
            user=user,
            defaults={'secret_key': secret_key}
        )
        
        if not created:
            device.secret_key = secret_key
            device.confirmed = False
            device.save()
        
        # Generate QR code
        totp = pyotp.TOTP(secret_key)
        uri = totp.provisioning_uri(user.email, issuer_name="Klararety Health")
        
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(uri)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        qr_code_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        # Log 2FA setup initiation
        self._log_security_event(
            user=user,
            event_type="2FA_SETUP",
            description="2FA setup initiated",
            ip_address=self._get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        return Response({
            'secret_key': secret_key,
            'qr_code': f'data:image/png;base64,{qr_code_base64}'
        })
    
    @swagger_auto_schema(method='post', operation_description="Confirm 2FA with a token", tags=['Authentication'])
    @action(detail=False, methods=['post'])
    def confirm_2fa(self, request):
        """Confirm and enable two-factor authentication."""
        serializer = TwoFactorSetupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        
        try:
            device = TwoFactorDevice.objects.get(user=user)
        except TwoFactorDevice.DoesNotExist:
            return Response(
                {'detail': '2FA setup not initiated'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify token
        totp = pyotp.TOTP(device.secret_key)
        if not totp.verify(serializer.validated_data['token']):
            # Log failed 2FA confirmation
            self._log_security_event(
                user=user,
                event_type="2FA_SETUP_FAILURE",
                description="Invalid verification code during 2FA setup",
                ip_address=self._get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
            
            return Response(
                {'detail': 'Invalid verification code'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Enable 2FA
        device.confirmed = True
        device.last_used_at = timezone.now()
        device.save()
        
        user.two_factor_enabled = True
        user.save()
        
        # Log successful 2FA setup
        self._log_security_event(
            user=user,
            event_type="2FA_SETUP_SUCCESS",
            description="2FA setup completed successfully",
            ip_address=self._get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        return Response({'success': True})
    
    @swagger_auto_schema(method='post', operation_description="Disable 2FA after password verification", tags=['Authentication'])
    @action(detail=False, methods=['post'])
    def disable_2fa(self, request):
        """Disable two-factor authentication."""
        serializer = TwoFactorDisableSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        
        # Verify password
        if not user.check_password(serializer.validated_data['password']):
            # Log failed 2FA disable attempt
            self._log_security_event(
                user=user,
                event_type="2FA_DISABLE_FAILURE",
                description="Invalid password during 2FA disable attempt",
                ip_address=self._get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
            
            return Response(
                {'detail': 'Invalid password'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Disable 2FA
        TwoFactorDevice.objects.filter(user=user).delete()
        user.two_factor_enabled = False
        user.save()
        
        # Log successful 2FA disable
        self._log_security_event(
            user=user,
            event_type="2FA_DISABLE_SUCCESS",
            description="2FA disabled successfully",
            ip_address=self._get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        return Response({'success': True})
    
    @action(detail=False, methods=['post'])
    def update_consent(self, request):
        """Update user consent settings."""
        user = request.user
        consent_type = request.data.get('consent_type')
        consented = request.data.get('consented', False)
        
        # Validate consent type
        valid_consent_types = [
            'data_sharing_consent',
            'medication_adherence_monitoring_consent',
            'vitals_monitoring_consent',
            'research_consent'
        ]
        
        if not consent_type or consent_type not in valid_consent_types:
            return Response(
                {'detail': 'Invalid consent type'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update user consent setting
        setattr(user, consent_type, consented)
        user.save(update_fields=[consent_type])
        
        # Map consent type to the ConsentLog type
        consent_log_type_map = {
            'data_sharing_consent': 'DATA_SHARING',
            'medication_adherence_monitoring_consent': 'MEDICATION_ADHERENCE',
            'vitals_monitoring_consent': 'VITALS_MONITORING',
            'research_consent': 'RESEARCH'
        }
        
        # Log consent change
        ConsentLog.objects.create(
            user=user,
            consent_type=consent_log_type_map[consent_type],
            consented=consented,
            ip_address=self._get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        # Update profile-specific consent if applicable
        if consent_type == 'medication_adherence_monitoring_consent' and hasattr(user, 'patient_profile'):
            user.patient_profile.medication_adherence_opt_in = consented
            user.patient_profile.medication_adherence_consent_date = timezone.now() if consented else None
            user.patient_profile.save(update_fields=['medication_adherence_opt_in', 'medication_adherence_consent_date'])
            
        elif consent_type == 'vitals_monitoring_consent' and hasattr(user, 'patient_profile'):
            user.patient_profile.vitals_monitoring_opt_in = consented
            user.patient_profile.vitals_monitoring_consent_date = timezone.now() if consented else None
            user.patient_profile.save(update_fields=['vitals_monitoring_opt_in', 'vitals_monitoring_consent_date'])
        
        return Response({'success': True})
    
    def _get_client_ip(self, request):
        """Get client IP safely accounting for proxies."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR', '')
        return ip
    
    def _log_security_event(self, user, event_type, description, ip_address, user_agent):
        """Helper to log security events to the audit log."""
        try:
            from audit.models import SecurityAuditLog
            
            SecurityAuditLog.objects.create(
                user=user,
                event_type=event_type,
                description=description,
                ip_address=ip_address,
                user_agent=user_agent
            )
        except Exception as e:
            # Fallback logging if audit module not available
            import logging
            logger = logging.getLogger('security')
            logger.error(f"Security event: {event_type} - {description} - User: {user.username if user else 'None'}")


class PatientProfileViewSet(viewsets.ModelViewSet):
    """ViewSet for patient profiles with medication adherence tracking."""
    queryset = PatientProfile.objects.all()
    serializer_class = PatientProfileSerializer
    permission_classes = [IsAuthenticated, IsRoleOwnerOrReadOnly]
    
    def get_queryset(self):
        user = self.request.user
        
        # Filter based on role permissions
        if user.role == 'patient':
            # Patients can only see their own profile
            return PatientProfile.objects.filter(user=user)
        elif user.role == 'provider':
            # Providers can see all patient profiles
            return PatientProfile.objects.all()
        elif user.role == 'caregiver':
            # Caregivers can see patients they are authorized for
            return PatientProfile.objects.filter(authorized_caregivers=user)
        elif user.role == 'admin':
            # Admins can see all profiles
            return PatientProfile.objects.all()
        elif user.role == 'pharmco':
            # Pharmco can see patients who have consented to monitoring
            return PatientProfile.objects.filter(medication_adherence_opt_in=True)
        elif user.role == 'compliance' and hasattr(user, 'compliance_profile') and user.compliance_profile.can_view_phi:
            # Compliance officers with PHI access can see all patient profiles
            return PatientProfile.objects.all()
        else:
            # Other roles can't access patient profiles
            return PatientProfile.objects.none()
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def add_caregiver(self, request, pk=None):
        """Add a caregiver to a patient's authorized caregivers."""
        patient_profile = self.get_object()
        caregiver_id = request.data.get('caregiver_id')
        
        if not caregiver_id:
            return Response(
                {'detail': 'Caregiver ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            caregiver = User.objects.get(id=caregiver_id, role='caregiver')
        except User.DoesNotExist:
            return Response(
                {'detail': 'Caregiver not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        patient_profile.authorized_caregivers.add(caregiver)
        
        # Log caregiver access consent
        ConsentLog.objects.create(
            user=patient_profile.user,
            consent_type='CAREGIVER_ACCESS',
            consented=True,
            ip_address=self._get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        return Response({'success': True})
    
    @action(detail=True, methods=['post'])
    def remove_caregiver(self, request, pk=None):
        """Remove a caregiver from a patient's authorized caregivers."""
        patient_profile = self.get_object()
        caregiver_id = request.data.get('caregiver_id')
        
        if not caregiver_id:
            return Response(
                {'detail': 'Caregiver ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            caregiver = User.objects.get(id=caregiver_id)
            if caregiver in patient_profile.authorized_caregivers.all():
                patient_profile.authorized_caregivers.remove(caregiver)
                
                # Log caregiver access revocation
                ConsentLog.objects.create(
                    user=patient_profile.user,
                    consent_type='CAREGIVER_ACCESS',
                    consented=False,
                    ip_address=self._get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', '')
                )
                
                return Response({'success': True})
            else:
                return Response(
                    {'detail': 'Caregiver not authorized for this patient'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except User.DoesNotExist:
            return Response(
                {'detail': 'Caregiver not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def _get_client_ip(self, request):
        """Get client IP safely accounting for proxies."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR', '')
        return ip


class PatientConditionViewSet(viewsets.ModelViewSet):
    """ViewSet for patient conditions."""
    queryset = PatientCondition.objects.all()
    serializer_class = PatientConditionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Filter based on role permissions
        if user.role == 'patient':
            # Patients can only see their own conditions
            if hasattr(user, 'patient_profile'):
                return PatientCondition.objects.filter(patient=user.patient_profile)
            return PatientCondition.objects.none()
        elif user.role == 'provider':
            # Providers can see all patient conditions
            return PatientCondition.objects.all()
        elif user.role == 'caregiver':
            # Caregivers can see conditions of patients they are authorized for
            return PatientCondition.objects.filter(
                patient__authorized_caregivers=user
            )
        elif user.role == 'admin':
            # Admins can see all conditions
            return PatientCondition.objects.all()
        elif user.role == 'pharmco':
            # Pharmco can see conditions of patients who consented to monitoring
            return PatientCondition.objects.filter(
                patient__medication_adherence_opt_in=True
            )
        elif user.role == 'compliance' and hasattr(user, 'compliance_profile') and user.compliance_profile.can_view_phi:
            # Compliance officers with PHI access can see all conditions
            return PatientCondition.objects.all()
        elif user.role == 'researcher' and hasattr(user, 'researcher_profile') and user.researcher_profile.is_verified:
            # Verified researchers can see conditions for research-consented patients
            return PatientCondition.objects.filter(
                patient__user__research_consent=True
            )
        else:
            # Other roles can't access conditions
            return PatientCondition.objects.none()
    
    def perform_create(self, serializer):
        """Ensure condition is associated with the patient."""
        user = self.request.user
        
        if user.role == 'patient' and hasattr(user, 'patient_profile'):
            serializer.save(patient=user.patient_profile)
        elif 'patient_id' in self.request.data:
            try:
                patient_profile = PatientProfile.objects.get(id=self.request.data['patient_id'])
                # Check if user has permission to add conditions to this patient
                if user.role in ['provider', 'admin'] or (
                    user.role == 'caregiver' and 
                    patient_profile.authorized_caregivers.filter(id=user.id).exists() and
                    user.caregiver_profile.access_level in ['MEDICATIONS', 'FULL']
                ):
                    serializer.save(patient=patient_profile)
                else:
                    raise serializers.ValidationError(
                        "You don't have permission to add conditions to this patient"
                    )
            except PatientProfile.DoesNotExist:
                raise serializers.ValidationError("Patient profile not found")
        else:
            raise serializers.ValidationError("Patient ID is required")


class ProviderProfileViewSet(viewsets.ModelViewSet):
    """ViewSet for healthcare provider profiles."""
    queryset = ProviderProfile.objects.all()
    serializer_class = ProviderProfileSerializer
    permission_classes = [IsAuthenticated, IsRoleOwnerOrReadOnly]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'provider' and self.action in ['update', 'partial_update', 'destroy']:
            # Providers can only edit their own profile
            return ProviderProfile.objects.filter(user=user)
                
        # Most users can view provider profiles
        return ProviderProfile.objects.all()
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class PharmcoProfileViewSet(viewsets.ModelViewSet):
    """ViewSet for pharmaceutical company profiles."""
    queryset = PharmcoProfile.objects.all()
    serializer_class = PharmcoProfileSerializer
    permission_classes = [IsAuthenticated, IsRoleOwnerOrReadOnly]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'pharmco' and self.action in ['update', 'partial_update', 'destroy']:
            # Pharmaceutical companies can only edit their own profile
            return PharmcoProfile.objects.filter(user=user)
                
        # Admins and providers can view all pharmacy profiles
        if user.role in ['admin', 'provider']:
            return PharmcoProfile.objects.all()
            
        # Patients can view all pharmacy profiles
        if user.role == 'patient':
            return PharmcoProfile.objects.all()
            
        # Others can't view pharmacy profiles
        return PharmcoProfile.objects.none()
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CaregiverProfileViewSet(viewsets.ModelViewSet):
    """ViewSet for caregiver profiles."""
    queryset = CaregiverProfile.objects.all()
    serializer_class = CaregiverProfileSerializer
    permission_classes = [IsAuthenticated, IsRoleOwnerOrReadOnly]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'caregiver' and self.action in ['update', 'partial_update', 'destroy']:
            # Caregivers can only edit their own profile
            return CaregiverProfile.objects.filter(user=user)
        
        if user.role == 'patient':
            # Patients can see profiles of their caregivers
            if hasattr(user, 'patient_profile'):
                return CaregiverProfile.objects.filter(
                    user__in=user.patient_profile.authorized_caregivers.all()
                )
        
        if user.role in ['admin', 'provider']:
            # Admins and providers can see all caregiver profiles
            return CaregiverProfile.objects.all()
            
        if user.role == 'compliance' and hasattr(user, 'compliance_profile') and user.compliance_profile.can_view_phi:
            # Compliance officers with PHI access can see all caregiver profiles
            return CaregiverProfile.objects.all()
            
        # Other roles don't see caregiver profiles
        return CaregiverProfile.objects.none()
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ResearcherProfileViewSet(viewsets.ModelViewSet):
    """ViewSet for clinical researcher profiles."""
    queryset = ResearcherProfile.objects.all()
    serializer_class = ResearcherProfileSerializer
    permission_classes = [IsAuthenticated, IsRoleOwnerOrReadOnly]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'researcher' and self.action in ['update', 'partial_update', 'destroy']:
            # Researchers can only edit their own profile
            return ResearcherProfile.objects.filter(user=user)
        
        if user.role in ['admin', 'provider', 'compliance']:
            # Admins, providers and compliance officers can see all researcher profiles
            return ResearcherProfile.objects.all()
            
        # Patients can see verified researchers
        return ResearcherProfile.objects.filter(is_verified=True)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def verify_researcher(self, request, pk=None):
        """Admin action to verify a researcher."""
        if request.user.role != 'admin':
            return Response(
                {'detail': 'Only administrators can verify researchers'},
                status=status.HTTP_403_FORBIDDEN
            )
            
        researcher_profile = self.get_object()
        researcher_profile.is_verified = True
        researcher_profile.save()
        
        return Response({'success': True})


class ComplianceProfileViewSet(viewsets.ModelViewSet):
    """ViewSet for compliance officer profiles."""
    queryset = ComplianceProfile.objects.all()
    serializer_class = ComplianceProfileSerializer
    permission_classes = [IsAuthenticated, IsRoleOwnerOrReadOnly]
    
    def get_queryset(self):
        user = self.request.user
        
        # Only allow compliance officers to see their own profile for edit
        if user.role == 'compliance' and self.action in ['update', 'partial_update', 'destroy']:
            return ComplianceProfile.objects.filter(user=user)
        
        # Admins can see all compliance officer profiles
        if user.role == 'admin':
            return ComplianceProfile.objects.all()
            
        # Compliance officers can see all other compliance officer profiles
        if user.role == 'compliance':
            return ComplianceProfile.objects.all()
            
        # Other roles don't see compliance profiles
        return ComplianceProfile.objects.none()
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        
    @action(detail=False, methods=['get'])
    def access_summary(self, request):
        """Get summary of PHI access activity for compliance monitoring."""
        user = request.user
        
        # Only compliance officers with audit access can use this
        if user.role != 'compliance' or not hasattr(user, 'compliance_profile') or not user.compliance_profile.can_view_audit_logs:
            return Response(
                {'detail': 'You do not have permission to access this information'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # In a real implementation, this would query the audit logs
        # For demonstration, we'll return a placeholder
        try:
            from audit.models import PHIAccessLog
            from django.db.models import Count
            from django.utils import timezone
            from datetime import timedelta
            
            # Get access logs from the last 30 days
            thirty_days_ago = timezone.now() - timedelta(days=30)
            
            # Summary by role
            role_summary = PHIAccessLog.objects.filter(
                access_time__gte=thirty_days_ago
            ).values('user__role').annotate(
                access_count=Count('id')
            ).order_by('-access_count')
            
            # Summary by reason
            reason_summary = PHIAccessLog.objects.filter(
                access_time__gte=thirty_days_ago
            ).values('reason').annotate(
                access_count=Count('id')
            ).order_by('-access_count')
            
            return Response({
                'time_period': '30 days',
                'total_access_events': PHIAccessLog.objects.filter(access_time__gte=thirty_days_ago).count(),
                'access_by_role': role_summary,
                'access_by_reason': reason_summary
            })
        except ImportError:
            # If audit module not available
            return Response({
                'detail': 'Audit module not available'
            }, status=status.HTTP_501_NOT_IMPLEMENTED)


class ConsentLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing consent logs."""
    queryset = ConsentLog.objects.all()
    serializer_class = ConsentLogSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'admin':
            # Admins can see all consent logs
            return ConsentLog.objects.all()
        elif user.role == 'compliance' and hasattr(user, 'compliance_profile') and user.compliance_profile.can_view_consent_logs:
            # Compliance officers with consent log access can see all logs
            return ConsentLog.objects.all()
        elif user.role in ['patient', 'caregiver', 'provider', 'pharmco', 'researcher']:
            # Users can see their own consent logs
            return ConsentLog.objects.filter(user=user)
        
        return ConsentLog.objects.none()
    
    @action(detail=False, methods=['get'])
    def consent_metrics(self, request):
        """Get metrics on consent rates for compliance reporting."""
        user = request.user
        
        # Only admins and compliance can access this
        if user.role not in ['admin', 'compliance']:
            return Response(
                {'detail': 'You do not have permission to access this information'},
                status=status.HTTP_403_FORBIDDEN
            )
            
        if user.role == 'compliance' and (not hasattr(user, 'compliance_profile') or not user.compliance_profile.can_view_consent_logs):
            return Response(
                {'detail': 'Your compliance role does not have permission to view consent metrics'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Calculate consent metrics
        from django.db.models import Count, Case, When, IntegerField, Q
        
        # Get user consent stats
        user_metrics = User.objects.aggregate(
            total_users=Count('id'),
            medication_consent=Count(Case(
                When(medication_adherence_monitoring_consent=True, then=1),
                output_field=IntegerField()
            )),
            vitals_consent=Count(Case(
                When(vitals_monitoring_consent=True, then=1),
                output_field=IntegerField()
            )),
            research_consent=Count(Case(
                When(research_consent=True, then=1),
                output_field=IntegerField()
            )),
            data_sharing_consent=Count(Case(
                When(data_sharing_consent=True, then=1),
                output_field=IntegerField()
            ))
        )
        
        # Get patient-specific consent stats
        patient_metrics = PatientProfile.objects.aggregate(
            total_patients=Count('id'),
            medication_opt_in=Count(Case(
                When(medication_adherence_opt_in=True, then=1),
                output_field=IntegerField()
            )),
            vitals_opt_in=Count(Case(
                When(vitals_monitoring_opt_in=True, then=1),
                output_field=IntegerField()
            ))
        )
        
        # Get caregiver authorization stats
        from django.db.models import Avg
        caregiver_stats = PatientProfile.objects.annotate(
            caregiver_count=Count('authorized_caregivers')
        ).aggregate(
            patients_with_caregivers=Count(Case(
                When(~Q(caregiver_count=0), then=1),
                output_field=IntegerField()
            )),
            avg_caregivers_per_patient=Avg('caregiver_count')
        )
        
        return Response({
            'user_metrics': user_metrics,
            'patient_metrics': patient_metrics,
            'caregiver_stats': caregiver_stats,
            'timestamp': timezone.now()
        })
