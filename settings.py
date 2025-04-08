import base64
import os
from datetime import timedelta
from pathlib import Path
import environ

# Initialize environment variables
env = environ.Env()
environ.Env.read_env()

# Build paths inside the project
BASE_DIR = Path(__file__).resolve().parent.parent

# Core Django settings
SECRET_KEY = env('SECRET_KEY')
DEBUG = env.bool('DEBUG', default=False)
ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=['klararety-api.tor.simnet.cloud', '127.0.0.1'])

# Applications
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework.authtoken',
    'corsheaders',
    'django_filters',
    'drf_yasg',
    'django_otp',
    'django_otp.plugins.otp_totp',
    'django_extensions',

    # Project apps
    'users',
    'medication',
    'healthcare',
    'telemedicine',
    'communication',
    'wearables',
    'audit',
    'security',
    'community',
    'fhir',
    'reports',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'security.middleware.SecurityMiddleware',
    'security.middleware.ContentSecurityPolicyMiddleware',
    'security.middleware.XSSProtectionMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django_otp.middleware.OTPMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'audit.middleware.AuditMiddleware',
]

ROOT_URLCONF = 'klararety.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'klararety.wsgi.application'

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': env('DB_NAME'),
        'USER': env('DB_USER'),
        'PASSWORD': env('DB_PASSWORD'),
        'HOST': env('DB_HOST'),
        'PORT': env('DB_PORT'),
    }
}

# Custom user model
AUTH_USER_MODEL = 'users.User'

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
    ),
}

# JWT Settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': True,
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
}

# Static & Media
STATIC_URL = 'static/'
STATIC_ROOT = env('STATIC_ROOT', default=os.path.join(BASE_DIR, 'staticfiles'))
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
MEDIA_URL = '/media/'
MEDIA_ROOT = env('MEDIA_ROOT', default=os.path.join(BASE_DIR, 'media'))

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CORS
CORS_ALLOW_ALL_ORIGINS = DEBUG
CORS_ALLOWED_ORIGINS = [
    "https://klararety.com",
    "http://localhost",  # Optional, for local dev
    "https://api.klararety.com",  # Optional if you make internal requests
]

CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https:\/\/.*\.klararety\.com$",
    r"^https:\/\/klararety\.com$",
]

CSRF_TRUSTED_ORIGINS = [
    "https://api.klararety.com",
    "http://localhost",
    "https://klararety.com",  # optional, if frontend is hosted here
]

# Swagger
SWAGGER_SETTINGS = {
    'DEFAULT_INFO': 'klararety.urls.api_info',
    'SECURITY_DEFINITIONS': {
        'Bearer': {
            'type': 'apiKey',
            'name': 'Authorization',
            'in': 'header'
        }
    },
    'USE_SESSION_AUTH': False,
    'PERSIST_AUTH': True,
    'REFETCH_SCHEMA_WITH_AUTH': True,
    'REFETCH_SCHEMA_ON_LOGOUT': True,
    'DEFAULT_MODEL_RENDERING': 'model',
    'TAGS_SORTER': 'alpha',
    'OPERATIONS_SORTER': 'alpha',
    'DEFAULT_GENERATOR_CLASS': 'drf_yasg.generators.OpenAPISchemaGenerator',
}

# HIPAA Audit Logging
HIPAA_LOG_PATH = env('HIPAA_AUDIT_LOG_PATH', default=os.path.join(BASE_DIR, 'logs/hipaa_audit.log'))
os.makedirs(os.path.dirname(HIPAA_LOG_PATH), exist_ok=True)

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'hipaa': {
            'format': '{asctime} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'hipaa_file': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': HIPAA_LOG_PATH,
            'formatter': 'hipaa',
            'maxBytes': 10485760,
            'backupCount': 10,
        },
    },
    'loggers': {
        'hipaa_audit': {
            'handlers': ['hipaa_file'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

# Session & Security
SESSION_COOKIE_SECURE = env.bool('SESSION_COOKIE_SECURE', default=True)
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_AGE = env.int('SESSION_COOKIE_AGE', default=3600)

#SECURE_HSTS_SECONDS = 31536000
#SECURE_HSTS_INCLUDE_SUBDOMAINS = True
#SECURE_HSTS_PRELOAD = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
#SECURE_SSL_REDIRECT = env.bool('SECURE_SSL_REDIRECT', default=not DEBUG)

# External APIs
WITHINGS_CLIENT_ID = env('WITHINGS_CLIENT_ID')
WITHINGS_CLIENT_SECRET = env('WITHINGS_CLIENT_SECRET')
WITHINGS_CALLBACK_URL = env('WITHINGS_REDIRECT_URI')
ZOOM_API_KEY = env('ZOOM_API_KEY')
ZOOM_API_SECRET = env('ZOOM_API_SECRET')

# Email
EMAIL_BACKEND = env('EMAIL_BACKEND')
EMAIL_HOST = env('EMAIL_HOST')
EMAIL_PORT = env.int('EMAIL_PORT')
EMAIL_USE_TLS = env.bool('EMAIL_USE_TLS')
EMAIL_HOST_USER = env('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = env('EMAIL_HOST_PASSWORD')

# AI Integration Settings
CLAUDE_API_KEY = env('CLAUDE_API_KEY', default='')
CLAUDE_MODEL = env('CLAUDE_MODEL', default='claude-3-opus-20240229')
CLAUDE_MAX_TOKENS = env.int('CLAUDE_MAX_TOKENS', default=4000)

# Enable AI features if Claude API key is available
AI_FEATURES_ENABLED = bool(CLAUDE_API_KEY)
ENCRYPTION_KEY = base64.b64decode(env('ENCRYPTION_KEY_BASE64'))
