# Environment Variables Documentation

This document provides a comprehensive list of all environment variables used in the Klararety Healthcare Platform.

## Core Application Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_API_URL` | Base URL for API requests | Yes | - |
| `NEXT_PUBLIC_APP_URL` | Base URL for the application | Yes | - |
| `NEXT_PUBLIC_WEBSOCKET_URL` | WebSocket server URL for real-time features | Yes | - |
| `MAINTENANCE_MODE` | Enable maintenance mode | No | `false` |
| `DEPLOYMENT_ENV` | Current deployment environment (development, staging, production) | Yes | `development` |

## Authentication

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `JWT_SECRET` | Secret key for JWT token generation | Yes | - |
| `JWT_REFRESH_SECRET` | Secret key for refresh token generation | Yes | - |
| `JWT_EXPIRATION` | JWT token expiration time | No | `1h` |
| `JWT_REFRESH_EXPIRATION` | Refresh token expiration time | No | `7d` |
| `SESSION_SECRET` | Secret for session management | Yes | - |

## Email Configuration

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `EMAIL_HOST` | SMTP server host | Yes | - |
| `EMAIL_PORT` | SMTP server port | Yes | - |
| `EMAIL_USER` | SMTP server username | Yes | - |
| `EMAIL_PASSWORD` | SMTP server password | Yes | - |
| `EMAIL_FROM` | Default sender email address | Yes | - |

## Database Configuration

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | Database connection string | Yes | - |
| `DATABASE_SSL` | Enable SSL for database connection | No | `true` |

## External Services

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `ZOOM_SDK_KEY` | Zoom API SDK key for telemedicine | Yes | - |
| `ZOOM_SDK_SECRET` | Zoom API SDK secret | Yes | - |
| `WITHINGS_CLIENT_ID` | Withings API client ID | Yes | - |
| `WITHINGS_CLIENT_SECRET` | Withings API client secret | Yes | - |
| `FITBIT_CLIENT_ID` | Fitbit API client ID | No | - |
| `FITBIT_CLIENT_SECRET` | Fitbit API client secret | No | - |
| `GARMIN_CONSUMER_KEY` | Garmin API consumer key | No | - |
| `GARMIN_CONSUMER_SECRET` | Garmin API consumer secret | No | - |
| `APPLE_HEALTH_TEAM_ID` | Apple Health team ID | No | - |
| `APPLE_HEALTH_KEY_ID` | Apple Health key ID | No | - |

## Security and Compliance

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `ENCRYPTION_KEY` | Key for encrypting sensitive data | Yes | - |
| `ENCRYPTION_IV` | Initialization vector for encryption | Yes | - |
| `HIPAA_COMPLIANCE_MODE` | Enable strict HIPAA compliance checks | No | `true` |
| `AUDIT_LOG_LEVEL` | Detail level for audit logging | No | `detailed` |
| `RATE_LIMIT_MAX` | Maximum requests per IP in rate limit window | No | `100` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in milliseconds | No | `60000` |

## Feature Flags

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `FEATURE_TELEMEDICINE` | Enable telemedicine features | No | `true` |
| `FEATURE_WEARABLES` | Enable wearable device integration | No | `true` |
| `FEATURE_AI_RECOMMENDATIONS` | Enable AI-powered recommendations | No | `false` |
| `FEATURE_COMMUNITY` | Enable community features | No | `true` |

## Analytics and Monitoring

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `ANALYTICS_KEY` | API key for analytics service | No | - |
| `ERROR_REPORTING_DSN` | Error reporting service DSN | No | - |
| `PERFORMANCE_MONITORING` | Enable performance monitoring | No | `false` |

## Development and Testing

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DEBUG_MODE` | Enable debug logging | No | `false` |
| `TEST_DATABASE_URL` | Test database connection string | No | - |
| `MOCK_SERVICES` | Use mock services instead of real APIs | No | `false` |

## Usage

To use these environment variables in your local development environment:

1. Create a `.env.local` file in the root directory of the project
2. Add the required environment variables in the format `VARIABLE_NAME=value`
3. For production deployment, set these variables in your hosting environment

Example `.env.local` file:

\`\`\`
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:3001
JWT_SECRET=your-jwt-secret
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
\`\`\`

## Security Notes

- Never commit `.env` files to version control
- Use different secrets for development, staging, and production environments
- Regularly rotate sensitive credentials like API keys and secrets
\`\`\`

Let's create a URL validation utility:
