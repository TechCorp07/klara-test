// src/lib/monitoring/auth-monitor.ts
// This utility helps you track authentication health and catch issues early

import error from "next/error";

export class AuthenticationMonitor {
    private static instance: AuthenticationMonitor;
    private healthMetrics = {
      loginSuccesses: 0,
      loginFailures: 0,
      permissionsFailures: 0,
      tokenValidationFailures: 0,
      lastHealthCheck: new Date()
    };
  
    static getInstance(): AuthenticationMonitor {
      if (!AuthenticationMonitor.instance) {
        AuthenticationMonitor.instance = new AuthenticationMonitor();
      }
      return AuthenticationMonitor.instance;
    }
  
    // Track login attempts for pattern recognition
    trackLoginAttempt(success: boolean, error?: string) {
      if (success) {
        this.healthMetrics.loginSuccesses++;
        console.log('✅ Login success tracked');
      } else {
        this.healthMetrics.loginFailures++;
        console.warn('❌ Login failure tracked:', error);
        
        // Alert if failure rate is too high
        const totalAttempts = this.healthMetrics.loginSuccesses + this.healthMetrics.loginFailures;
        const failureRate = this.healthMetrics.loginFailures / totalAttempts;
        
        if (totalAttempts > 10 && failureRate > 0.2) {
          console.error('🚨 High login failure rate detected:', {
            successRate: `${((1 - failureRate) * 100).toFixed(1)}%`,
            failureRate: `${(failureRate * 100).toFixed(1)}%`,
            recommendation: 'Check authentication service health'
          });
        }
      }
    }
  
    // Track permissions API health
    trackPermissionsHealth(success: boolean, endpoint: string, error?: any) {
      if (!success) {
        this.healthMetrics.permissionsFailures++;
        console.warn('⚠️ Permissions API failure:', {
          endpoint,
          error: error?.message || 'Unknown error',
          failureCount: this.healthMetrics.permissionsFailures,
          timestamp: new Date().toISOString()
        });
        
        // If permissions are consistently failing, alert the developers
        if (this.healthMetrics.permissionsFailures > 5) {
          console.error('🚨 Permissions service appears to be unhealthy:', {
            consecutiveFailures: this.healthMetrics.permissionsFailures,
            recommendation: 'Check backend service status and endpoint configuration'
          });
        }
      } else {
        // Reset failure count on success
        this.healthMetrics.permissionsFailures = 0;
      }
    }
  
    // Track token validation health
    trackTokenValidation(success: boolean, error?: string) {
      if (!success) {
        this.healthMetrics.tokenValidationFailures++;
        console.warn('🔓 Token validation failure:', {
          error,
          failureCount: this.healthMetrics.tokenValidationFailures,
          timestamp: new Date().toISOString()
        });
      }
    }
  
    // Periodic health report
    generateHealthReport() {
      const report = {
        ...this.healthMetrics,
        overallHealth: this.calculateOverallHealth(),
        recommendations: this.getRecommendations()
      };
      
      console.group('🏥 Authentication Health Report');
      console.log('Metrics:', report);
      console.groupEnd();
      
      return report;
    }
  
    private calculateOverallHealth(): 'healthy' | 'degraded' | 'unhealthy' {
      const { loginFailures, permissionsFailures, tokenValidationFailures } = this.healthMetrics;
      const totalFailures = loginFailures + permissionsFailures + tokenValidationFailures;
      
      if (totalFailures === 0) return 'healthy';
      if (totalFailures < 5) return 'degraded';
      return 'unhealthy';
    }
  
    private getRecommendations(): string[] {
      const recommendations: string[] = [];
      
      if (this.healthMetrics.loginFailures > 3) {
        recommendations.push('Review login endpoint configuration and error handling');
      }
      
      if (this.healthMetrics.permissionsFailures > 3) {
        recommendations.push('Check permissions API endpoint and ensure it matches frontend expectations');
      }
      
      if (this.healthMetrics.tokenValidationFailures > 3) {
        recommendations.push('Review token validation logic and middleware configuration');
      }
      
      return recommendations;
    }
  }
  
  // Usage in your auth provider and other auth-related components:
  const monitor = AuthenticationMonitor.getInstance();
  
  // In login function:
  // monitor.trackLoginAttempt(true); // on success
  // monitor.trackLoginAttempt(false, error.message); // on failure
  
  // In permissions hook:
  monitor.trackPermissionsHealth(false, '/users/auth/me/permissions/', error);
  
  // In middleware:
  // monitor.trackTokenValidation(authResult.isValid, error?.message);