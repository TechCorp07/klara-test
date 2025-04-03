from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
    openapi.Info(
        title="Klararety Health API",
        default_version='v1',
        description="API for Klararety Health Platform",
        terms_of_service="https://www.klararety.com/terms/",
        contact=openapi.Contact(email="contact@klararety.com"),
        license=openapi.License(name="Proprietary"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/users/', include('users.urls')),
    path('api/healthcare/', include('healthcare.urls')),
    path('api/telemedicine/', include('telemedicine.urls')),
    path('api/communication/', include('communication.urls')),
    path('api/wearables/', include('wearables.urls')),
    path('api/audit/', include('audit.urls')),
    
    # API documentation
    path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('api/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

