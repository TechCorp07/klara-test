// components/auth/ErrorBoundary.js
import React from 'react';
import { toast } from 'react-toastify';
import { FaExclamationTriangle } from 'react-icons/fa';
import { audit } from "@/lib/api";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    };
  }
  
  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error('ErrorBoundary caught an error', error, errorInfo);
    
    // Show error toast notification
    toast.error("An unexpected error occurred. Please try again later.");
    
    // Store error details in state for rendering
    this.setState({ errorInfo });
    
    // Log to HIPAA audit trail for high severity errors
    this.logToAudit(error, errorInfo);
  }
  
  // Log serious errors to audit trail for HIPAA compliance
  logToAudit(error, errorInfo) {
    try {
      // Determine error severity
      const severity = this.getErrorSeverity(error);
      
      // Only log high and critical severity errors
      if (severity === 'high' || severity === 'critical') {
        // Ensure PII/PHI is not included in the error details
        const sanitizedError = this.sanitizeErrorDetails(error, errorInfo);
        
        // Log to audit trail
        audit.logSecurityIncident({
          type: 'error',
          severity: severity,
          description: sanitizedError.message || 'UI Error',
          details: sanitizedError.details
        }).catch(err => {
          // Silent catch - we don't want errors from the error logger
          console.error('Failed to log error to audit trail:', err);
        });
      }
    } catch (e) {
      // Fail silently - never throw from error boundary logging
      console.error('Error in audit logging:', e);
    }
  }
  
  // Determine error severity based on error type and message
  getErrorSeverity(error) {
    // Check for known critical error patterns
    if (error.message && (
      error.message.includes('authentication') ||
      error.message.includes('unauthorized') ||
      error.message.includes('permission') ||
      error.message.includes('403') ||
      error.message.includes('401')
    )) {
      return 'high';
    }
    
    // Check for data-related errors
    if (error.message && (
      error.message.includes('data') ||
      error.message.includes('fetch') ||
      error.message.includes('api')
    )) {
      return 'medium';
    }
    
    // Default severity
    return 'low';
  }
  
  // Sanitize error details to ensure no PHI/PII is included
  sanitizeErrorDetails(error, errorInfo) {
    try {
      // Create safe error object
      const safeError = {
        message: error.message || 'Unknown error',
        name: error.name,
        stack: null,
        details: null
      };
      
      // Only include component stack, not full JS stack
      if (errorInfo && errorInfo.componentStack) {
        safeError.details = errorInfo.componentStack
          .split('\n')
          .slice(0, 5) // Only include top 5 components in stack
          .join('\n');
      }
      
      return safeError;
    } catch {
      // Fall back to most basic error info if sanitization fails
      return { message: 'Error in UI', details: null };
    }
  }
  
  // Allow users to reset the error boundary
  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };
  
  render() {
    if (this.state.hasError) {
      // Fallback UI when an error occurs
      return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <div className="text-center">
                <FaExclamationTriangle className="h-12 w-12 text-red-500 mx-auto" />
                <h2 className="mt-2 text-lg font-medium text-gray-900">
                  Something went wrong
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  We're sorry, but an error has occurred. Please try again later.
                </p>
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <div className="mt-4 p-4 bg-red-50 rounded-md text-left">
                    <p className="text-sm font-medium text-red-800">
                      {this.state.error.toString()}
                    </p>
                    {this.state.errorInfo && (
                      <details className="mt-2">
                        <summary className="text-sm text-red-600 cursor-pointer">
                          Component Stack
                        </summary>
                        <pre className="mt-2 text-xs text-red-600 overflow-auto">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </details>
                    )}
                  </div>
                )}
                <div className="mt-6">
                  <button
                    onClick={this.handleReset}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // Render children when no error
    return this.props.children;
  }
}

export default ErrorBoundary;
