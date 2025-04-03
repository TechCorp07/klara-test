from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, PatientProfileViewSet, ProviderProfileViewSet,
    PharmcoProfileViewSet, CaregiverProfileViewSet, ResearcherProfileViewSet,
    ComplianceProfileViewSet, PatientConditionViewSet, ConsentLogViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'patient-profiles', PatientProfileViewSet)
router.register(r'provider-profiles', ProviderProfileViewSet)
router.register(r'pharmco-profiles', PharmcoProfileViewSet)
router.register(r'caregiver-profiles', CaregiverProfileViewSet)
router.register(r'researcher-profiles', ResearcherProfileViewSet)
router.register(r'compliance-profiles', ComplianceProfileViewSet)
router.register(r'patient-conditions', PatientConditionViewSet)
router.register(r'consent-logs', ConsentLogViewSet)

urlpatterns = [
    path('', include(router.urls)),
    
    # Authentication endpoints
    path('login/', UserViewSet.as_view({'post': 'login'}), name='user-login'),
    path('logout/', UserViewSet.as_view({'post': 'logout'}), name='user-logout'),
    path('verify-2fa/', UserViewSet.as_view({'post': 'verify_2fa'}), name='verify-2fa'),
    path('setup-2fa/', UserViewSet.as_view({'post': 'setup_2fa'}), name='setup-2fa'),
    path('confirm-2fa/', UserViewSet.as_view({'post': 'confirm_2fa'}), name='confirm-2fa'),
    path('disable-2fa/', UserViewSet.as_view({'post': 'disable_2fa'}), name='disable-2fa'),
    path('update-consent/', UserViewSet.as_view({'post': 'update_consent'}), name='update-consent'),
    path('me/', UserViewSet.as_view({'get': 'me'}), name='user-me'),

    # Admin approval endpoints
    path('pending-approvals/', UserViewSet.as_view({'get': 'pending_approvals'}), name='pending-approvals'),
    path('users/<int:pk>/approve/', UserViewSet.as_view({'post': 'approve_user'}), name='approve-user'),
]